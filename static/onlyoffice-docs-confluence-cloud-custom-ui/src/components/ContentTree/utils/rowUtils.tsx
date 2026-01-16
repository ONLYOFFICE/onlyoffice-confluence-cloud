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

import { IconButton } from "@atlaskit/button/new";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import { RowType } from "@atlaskit/dynamic-table/dist/types/types";
import ShowMoreIcon from "@atlaskit/icon/core/show-more-horizontal";
import { Box, Inline, xcss } from "@atlaskit/primitives";
import { router } from "@forge/bridge";
import bytes from "bytes";

import { Content } from "../../../types/types";

import { getIconByContentType } from "./iconUtils";

const styles = {
  actionsContainer: xcss({
    textAlign: "center",
  }),
  iconContainer: xcss({
    display: "flex",
    alignItems: "center",
  }),
};

export const buildContentTreeRows = (
  parentId: string | undefined,
  entities: Content[],
  getDocumentType: (title: string) => string | null,
  onChangeParentId: (id: string) => void,
): RowType[] => {
  const onClickOnTitle = (entity: Content) => {
    if (entity.type !== "attachment") {
      onChangeParentId(entity.id);
    }
  };

  return entities.map((entity) => ({
    key: entity.id,
    cells: [
      {
        key: "title",
        content: (
          <Box onClick={() => onClickOnTitle(entity)}>
            <Inline space="space.075" alignBlock="center">
              <Box xcss={styles.iconContainer}>
                {getIconByContentType(
                  entity.type || "blogpost",
                  getDocumentType(entity.title) || "",
                )}
              </Box>
              <Box>{entity.title}</Box>
            </Inline>
          </Box>
        ),
      },
      {
        key: "fileSize",
        content: entity?.extensions?.fileSize
          ? String(bytes(entity?.extensions?.fileSize))
          : "",
      },
      {
        key: "lastmodified",
        content: entity.version.createdAt || entity.version.when,
      },
      {
        key: "actions",
        content: (
          <Box xcss={styles.actionsContainer}>
            <DropdownMenu<HTMLButtonElement>
              trigger={({ triggerRef, ...props }) => (
                <IconButton
                  {...props}
                  icon={ShowMoreIcon}
                  label="more"
                  ref={triggerRef}
                />
              )}
              placement="bottom-end"
              shouldRenderToParent
            >
              <DropdownItemGroup>
                <DropdownItem
                  onClick={() =>
                    router.open(
                      `/forge-apps/a/f8a806c4-dbce-447e-9fc5-5edd102f13aa/e/52727433-e0ce-4dca-996e-7c0d911165cf/r/editor?pageId=${parentId}&attachmentId=${entity.id}`,
                    )
                  }
                >
                  Edit
                </DropdownItem>
                <DropdownItem>Download</DropdownItem>
              </DropdownItemGroup>
              <DropdownItemGroup hasSeparator>
                <DropdownItem>Delete</DropdownItem>
              </DropdownItemGroup>
            </DropdownMenu>
          </Box>
        ),
      },
    ],
  }));
};
