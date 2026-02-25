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

import { Queue } from "@forge/events";
import { chat, list } from "@forge/llm";
import { signRealtimeToken } from "@forge/realtime";
import Resolver, { Request } from "@forge/resolver";

import { processChoices } from "../aiUtils";
import { postRemoteAppAuthorization } from "../client";
import { AI_REQUEST_QUEUE_NAME, REALTIME_AI_CHANNEL_NAME } from "../constants";

const editorPageResolver = new Resolver();
const aiRequestQueue = new Queue({ key: AI_REQUEST_QUEUE_NAME });

editorPageResolver.define("authorizeRemoteApp", async (request: Request) => {
  const { parentId, attachmentId } = request.payload;

  return await postRemoteAppAuthorization(parentId, attachmentId);
});

editorPageResolver.define("aiModels", async () => {
  const respose = await list();

  const result = respose.models
    .filter((item) => item.status === "active")
    .map((item) => ({ id: item.model }));

  return { result };
});

editorPageResolver.define("execAIRequest", async (request: Request) => {
  const payload = request.payload;
  console.log("execAIRequest payload:", payload);

  const { aiChannelId, aiRequest } = payload;
  const { streaming } = aiRequest;

  if (aiRequest.url.replace("[external]", "") === "/models") {
    const modelListResponse = await list();

    const result = modelListResponse.models
      .filter((item) => item.status === "active")
      .map((item) => ({ id: item.model }));

    return {
      aiResponse: {
        type: "response",
        id: aiRequest.id,
        body: JSON.stringify(result),
      },
    };
  }

  if (streaming) {
    const { jobId } = await aiRequestQueue.push({
      body: {
        aiChannelId,
        aiRequest,
      },
    });

    return {
      jobId,
      aiResponse: {
        type: "response",
        id: aiRequest.id,
      },
    };
  }

  const llmResponse = await chat(JSON.parse(aiRequest.options.body));

  llmResponse.choices = processChoices(llmResponse.choices);

  return {
    aiResponse: {
      type: "response",
      id: aiRequest.id,
      body: JSON.stringify(llmResponse),
    },
  };
});

editorPageResolver.define("cancelAIRequest", async (request: Request) => {
  const { jobId } = request.payload as { jobId: string };

  const job = aiRequestQueue.getJob(jobId);
  if (job) {
    await job.cancel();
  }
});

editorPageResolver.define("createAIChannel", async () => {
  const id = crypto.randomUUID();

  const { token } = await signRealtimeToken(REALTIME_AI_CHANNEL_NAME, {
    channelId: id,
  });

  return {
    claims: {
      channelName: REALTIME_AI_CHANNEL_NAME,
      channelId: id,
    },
    token,
  };
});

export default editorPageResolver.getDefinitions();
