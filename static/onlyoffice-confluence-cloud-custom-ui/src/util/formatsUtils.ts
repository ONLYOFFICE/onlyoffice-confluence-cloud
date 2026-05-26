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

import { Format } from "../types/types";

export const useFormats = (formats: Format[]) => {
  const getDocumentType = (fileName: string) => {
    const fileExtension = getExtension(fileName);

    const format = formats.find((f) => f.name === fileExtension);

    return format ? format.type : null;
  };

  const getExtension = (fileName: string) => {
    if (!fileName || typeof fileName !== "string") {
      return null;
    }

    const parts = fileName.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null;
  };

  const isEditable = (fileName: string): boolean => {
    const fileExtension = getExtension(fileName);

    if (fileExtension === null) {
      return false;
    }

    const format = formats.find((format) => format.name === fileExtension);

    if (!format) {
      return false;
    }

    return format.actions.includes("edit");
  };

  const isViewable = (fileName: string): boolean => {
    const fileExtension = getExtension(fileName);

    if (fileExtension === null) {
      return false;
    }

    const format = formats.find((format) => format.name === fileExtension);

    if (!format) {
      return false;
    }

    return format.actions.includes("view");
  };

  return {
    getDocumentType,
    getExtension,
    isEditable,
    isViewable,
  };
};
