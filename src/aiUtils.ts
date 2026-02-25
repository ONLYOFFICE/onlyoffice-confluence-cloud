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

import { Choice } from "@forge/llm/out/interfaces/internal";

export const processChoices = (choices: Choice[]) => {
  return choices.map((item) => ({
    ...item,
    message: {
      ...item.message,
      content: Array.isArray(item.message.content)
        ? item.message.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("")
        : item.message.content,
    },
  }));
};
