/**
 *
 * (c) Copyright Ascensio System SIA 2026
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { AsyncEvent } from "@forge/events";
import { stream } from "@forge/llm";
import { publishGlobal, signRealtimeToken } from "@forge/realtime";

import { processChoices } from "../aiUtils";
import { REALTIME_AI_CHANNEL_NAME } from "../constants";
import { AIRequest } from "../types/types";

export async function aiRequestHandler(event: AsyncEvent): Promise<void> {
  console.log("AI Request Handler received event:", event);
  const { aiChannelId, aiRequest } = event.body as {
    aiChannelId: string;
    aiRequest: AIRequest;
  };

  let index = 0;
  let token: string | undefined;
  try {
    ({ token } = await signRealtimeToken(REALTIME_AI_CHANNEL_NAME, {
      channelId: aiChannelId,
    }));

    const streamResponse = await stream(JSON.parse(aiRequest.options.body));

    for await (const chunk of streamResponse) {
      chunk.choices = processChoices(chunk.choices);
      console.log("Received chunk:", chunk);

      const payload = {
        index,
        id: aiRequest.id,
        aiResponse: {
          type: "chunk",
          id: aiRequest.id,
          chunk: JSON.stringify(chunk),
        },
      };

      publishGlobal(REALTIME_AI_CHANNEL_NAME, payload, { token });
      index++;
    }

    const payload = {
      index,
      id: aiRequest.id,
      aiResponse: {
        type: "end",
        id: aiRequest.id,
      },
    };

    publishGlobal(REALTIME_AI_CHANNEL_NAME, payload, { token });
  } catch (error) {
    console.error("Error processing AI request:", error);

    if (token) {
      try {
        publishGlobal(
          REALTIME_AI_CHANNEL_NAME,
          {
            index,
            id: aiRequest.id,
            aiResponse: {
              type: "error",
              id: aiRequest.id,
              error: String(error)
            },
          },
          { token },
        );
      } catch (publishError) {
        console.error("Error publishing error event:", publishError);
      }
    }
  }
}
