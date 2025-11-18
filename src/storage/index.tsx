/**
 *
 * (c) Copyright Ascensio System SIA 2025
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

import kvs from "@forge/kvs";

const SETTINGS_KEY = "onlyoffice-docs.settings";

export const getSettings = async (): Promise<
  Record<string, string | number | boolean> | undefined
> => {
  return await _executeRequest<Record<string, string | number | boolean>>(
    async () => {
      return await kvs.getSecret<Record<string, string | number | boolean>>(
        SETTINGS_KEY,
      );
    },
    1,
  );
};

export const saveSettings = async (
  settings: Record<string, string | number | boolean>,
): Promise<Record<string, string | number | boolean> | undefined> => {
  return await _executeRequest<Record<string, string | number | boolean>>(
    async () => {
      await kvs.setSecret(SETTINGS_KEY, settings);
      return settings;
    },
    1,
  );
};

async function _executeRequest<T>(
  onRequest: () => Promise<T | undefined>,
  retry = 0,
): Promise<T | undefined> {
  try {
    return await onRequest();
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.cause instanceof Error &&
      error.cause.name === "ConnectTimeoutError" &&
      retry > 0
    ) {
      return _executeRequest(onRequest, retry - 1);
    }

    throw error;
  }
}
