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

import React from "react";

import DatabaseIcon from "@atlaskit/icon/core/database";
import FolderClosedIcon from "@atlaskit/icon/core/folder-closed";
import PageIcon from "@atlaskit/icon/core/page";
import QuotationMarkIcon from "@atlaskit/icon/core/quotation-mark";
import SmartLinkEmbedIcon from "@atlaskit/icon/core/smart-link-embed";
import WhiteboardIcon from "@atlaskit/icon/core/whiteboard";

import { ReactComponent as CellIcon } from "../../../assets/images/cell.svg";
import { ReactComponent as DiagramIcon } from "../../../assets/images/diagram.svg";
import { ReactComponent as PdfIcon } from "../../../assets/images/pdf.svg";
import { ReactComponent as SlideIcon } from "../../../assets/images/slide.svg";
import { ReactComponent as UnknownIcon } from "../../../assets/images/unknown.svg";
import { ReactComponent as WordIcon } from "../../../assets/images/word.svg";

export const getIconByContentType = (type: string, documentType?: string) => {
  switch (type) {
    case "page":
      return <PageIcon label="Page" />;
    case "blogpost":
      return <QuotationMarkIcon label="Blog Post" />;
    case "whiteboard":
      return <WhiteboardIcon label="Whiteboard" />;
    case "database":
      return <DatabaseIcon label="Database" />;
    case "embed":
      return <SmartLinkEmbedIcon label="Embed" />;
    case "folder":
      return <FolderClosedIcon label="Folder" />;
    case "attachment":
      return getIconForDocumentType(documentType);
    default:
      return <PageIcon label="Page" />;
  }
};

export const getIconForDocumentType = (documentType?: string) => {
  switch (documentType) {
    case "word":
      return <WordIcon />;
    case "cell":
      return <CellIcon />;
    case "slide":
      return <SlideIcon />;
    case "pdf":
      return <PdfIcon />;
    case "diagram":
      return <DiagramIcon />;
    default:
      return <UnknownIcon />;
  }
};
