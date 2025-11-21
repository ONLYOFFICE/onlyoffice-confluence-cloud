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

import { requestConfluence } from "@forge/bridge";

import {
  ClientError,
  User,
} from "../../src/types/types";

export const getUsers = async (ids: string[]): Promise<User[]> => {
  return await _executeRequest<User[]>(
    async () => {
      return await requestConfluence(
        `/wiki/rest/api/search/user?cql=user IN (${ids.map((id) => `"${id}"`).join(",")})`,
      );
    },
    async (response: Response) => {
      const data = await response.json();

      return data.results.map((item: { user: User }) => {
        return item.user;
      });
    },
  );
};

async function _executeRequest<T>(
  onRequest: () => Promise<Response>,
  onResponse: (response: Response) => T | Promise<T>,
) {
  const response = await onRequest();

  if (response.ok || response.status === 303) {
    return await onResponse(response);
  }

  throw new ClientError(
    `Request failed with status ${response.status}: ${response.statusText}`,
    response.status,
  );
}
