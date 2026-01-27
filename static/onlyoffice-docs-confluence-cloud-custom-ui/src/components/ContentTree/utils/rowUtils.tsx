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
import { router, showFlag } from "@forge/bridge";
import bytes from "bytes";

import { deleteAttachment } from "../../../client";
import { confirmDialogService } from "../../../services/confirmDialogService";
import { AppContext, Content, Format } from "../../../types/types";
import { useFormats } from "../../../util/formatsUtils";
import { getEditorPageUrl } from "../../../util/routerUtils";

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

export const head = {
  cells: [
    {
      key: "title",
      content: <Box paddingInlineStart="space.100">Title</Box>,
      isSortable: true,
      width: 40,
    },
    {
      key: "fileSize",
      content: "Size",
      isSortable: true,
    },
    {
      key: "lastmodified",
      content: "Modified",
      isSortable: true,
    },
    {
      key: "actions",
      content: "",
      isSortable: false,
      width: 10,
    },
  ],
};

export const buildContentTreeRows = (
  appContext: AppContext,
  parentId: string | undefined,
  entities: Content[],
  formats: Format[],
  onChangeParentId: (id: string) => void,
  onDeleteAttachment: () => void,
): RowType[] => {
  const { getDocumentType, isEditable, isViewable } = useFormats(formats);

  const onClickOnTitle = (entity: Content) => {
    if (entity.type !== "attachment") {
      onChangeParentId(entity.id);
    }
  };

  const onClickEdit = (entity: Content) => {
    if (parentId) {
      router.open(
        getEditorPageUrl(
          appContext.appId,
          appContext.environmentId,
          parentId,
          entity.id,
        ),
      );
    }
  };

  const onClickDownload = (entity: Content) => {
    router.open(`/wiki${entity._links.download}`);
  };

  const onClickDelete = (entity: Content) => {
    confirmDialogService.show({
      title: "Delete attachments",
      description: "You want delete" + entity.title + "?",
      appearance: "danger",
      buttons: {
        submit: {
          title: "Delete",
          onClick: () => {
            confirmDialogService.setLoading(true);
            deleteAttachment(entity.id)
              .then(() => {
                showFlag({
                  id: "delete-attachment-success",
                  title:
                    'Attachment "{filename}" deleted successfully.'.replace(
                      "{filename}",
                      entity.title,
                    ),
                  type: "success",
                  appearance: "success",
                  isAutoDismiss: true,
                });
                onDeleteAttachment();
              })
              .catch(() => {
                showFlag({
                  id: "delete-attachment-error",
                  title: "Failed to delete attachment. Please try again.",
                  type: "error",
                  appearance: "error",
                  isAutoDismiss: true,
                });
              })
              .finally(() => {
                confirmDialogService.close();
              });
          },
        },
        cancel: {
          title: "Cancel",
          onClick: () => {
            confirmDialogService.close();
          },
        },
      },
    });
  };

  const editCondition = (entity: Content) => {
    if (entity.type !== "attachment") {
      return false;
    }

    const editPermission = entity.operations.some((value) => {
      return value.operation === "update" && value.targetType === "attachment";
    });

    return editPermission && isEditable(entity.title);
  };

  const viewCondition = (entity: Content) => {
    if (entity.type !== "attachment") {
      return false;
    }

    const viewPermission = entity.operations.some((value) => {
      return value.operation === "read" && value.targetType === "attachment";
    });

    const editPermission = entity.operations.some((value) => {
      return value.operation === "update" && value.targetType === "attachment";
    });

    return viewPermission && !editPermission && isViewable(entity.title);
  };

  const downloadCondition = (entity: Content) => {
    if (entity.type !== "attachment") {
      return false;
    }

    const viewPermission = entity.operations.some((value) => {
      return value.operation === "read" && value.targetType === "attachment";
    });

    return viewPermission;
  };

  const deleteCondition = (entity: Content) => {
    if (entity.type !== "attachment") {
      return false;
    }

    const deletePermission = entity.operations.some((value) => {
      return value.operation === "delete" && value.targetType === "attachment";
    });

    return deletePermission;
  };

  return entities.map((entity) => ({
    key: entity.id,
    cells: [
      {
        key: "title",
        content: (
          <Box
            paddingInlineStart="space.100"
            onClick={() => onClickOnTitle(entity)}
          >
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
                {editCondition(entity) && (
                  <DropdownItem onClick={() => onClickEdit(entity)}>
                    Edit
                  </DropdownItem>
                )}
                {viewCondition(entity) && (
                  <DropdownItem onClick={() => onClickEdit(entity)}>
                    View
                  </DropdownItem>
                )}
                {downloadCondition(entity) && (
                  <DropdownItem onClick={() => onClickDownload(entity)}>
                    Download
                  </DropdownItem>
                )}
              </DropdownItemGroup>
              <DropdownItemGroup hasSeparator>
                {deleteCondition(entity) && (
                  <DropdownItem onClick={() => onClickDelete(entity)}>
                    Delete
                  </DropdownItem>
                )}
              </DropdownItemGroup>
            </DropdownMenu>
          </Box>
        ),
      },
    ],
  }));
};
