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

import { History } from "history";

export const getEditorPageUrl = (
  appId: string,
  environmentId: string,
  parentId: { id: string; contentType: string },
  attachmentId: string,
) => {
  return `/forge-apps/a/${appId}/e/${environmentId}/r/editor?parentId=${parentId.contentType}:${parentId.id}&attachmentId=${attachmentId}`;
};

export const updateHistory = (
  history: History,
  searchParams: Array<{ key: string; value?: string }>,
) => {
  const url = new URL("http://localhost" + history.location.search);

  searchParams.forEach(({ key, value }) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });

  history.push({ search: url.search });
};
