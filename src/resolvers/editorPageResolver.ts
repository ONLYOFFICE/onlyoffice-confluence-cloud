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

import Resolver, { Request } from "@forge/resolver";

import { postRemoteAppAuthorization } from "../client";

const editorPageResolver = new Resolver();

editorPageResolver.define("authorizeRemoteApp", async (request: Request) => {
  const { parentId, attachmentId } = request.payload;

  return await postRemoteAppAuthorization(parentId, attachmentId);
});

export default editorPageResolver.getDefinitions();
