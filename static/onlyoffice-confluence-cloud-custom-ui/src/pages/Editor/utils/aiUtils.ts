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

import { invoke } from "@forge/bridge";

import { AIChannelResponse, AIModelsResponse } from "../../../types/types";

const PROVIDER_NAME = "Atlassian";
const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";

export interface AIChannel {
  name: string;
  id: string;
  token: string;
}

export const getAIProvider = () => {
  return {
    providerName: PROVIDER_NAME,
    settings: {
      settingsLock: undefined,
      actionsOverride: true,
      models: [
        {
          capabilities: 255,
          provider: "Atlassian",
          name: `${PROVIDER_NAME} [${DEFAULT_MODEL}]`,
          id: DEFAULT_MODEL,
        },
      ],
      actions: {
        Chat: {
          model: DEFAULT_MODEL,
        },
        Summarization: {
          model: DEFAULT_MODEL,
        },
        Translation: {
          model: DEFAULT_MODEL,
        },
        TextAnalyze: {
          model: DEFAULT_MODEL,
        },
      },
    },
  };
};

export interface AIProvider {
  channel: AIChannel;
  config: ReturnType<typeof getAIProvider>;
}

export const loadAIProvider = async (): Promise<AIProvider> => {
  const [aiModelsResponse, aiChannelResponse] = await Promise.all([
    invoke<AIModelsResponse>("aiModels"),
    invoke<AIChannelResponse>("createAIChannel"),
  ]);

  if (!aiModelsResponse.result.length) {
    throw new Error("No models available");
  }

  const { claims, token } = aiChannelResponse;

  return {
    channel: {
      name: claims.channelName,
      id: claims.channelId,
      token,
    },
    config: getAIProvider(),
  };
};
