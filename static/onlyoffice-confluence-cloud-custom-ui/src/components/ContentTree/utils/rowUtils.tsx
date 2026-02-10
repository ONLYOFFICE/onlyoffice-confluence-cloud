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

import React from "react";

import { IconButton } from "@atlaskit/button/new";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import { RowType } from "@atlaskit/dynamic-table/dist/types/types";
import ShowMoreIcon from "@atlaskit/icon/core/show-more-horizontal";
import { Box, Inline, xcss } from "@atlaskit/primitives";
import { i18n, router, showFlag } from "@forge/bridge";
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
  title: xcss({
    ":hover": {
      textDecoration: "underline",
      cursor: "pointer",
    },
  }),
};

export const getHead = (t: i18n.TranslationFunction) => {
  return {
    cells: [
      {
        key: "title",
        content: (
          <Box paddingInlineStart="space.100">
            {t("component.content-tree.table.headers.title")}
          </Box>
        ),
        isSortable: true,
        width: 40,
      },
      {
        key: "fileSize",
        content: t("component.content-tree.table.headers.size"),
        isSortable: true,
      },
      {
        key: "lastmodified",
        content: t("component.content-tree.table.headers.modified"),
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
};

const getFormatedDate = (
  dateString: string,
  locale: string,
  timeZone: string,
) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timeZone,
  };

  const date = new Date(dateString);

  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const buildContentTreeRows = (
  appContext: AppContext,
  parentId: { id: string; contentType: string } | undefined,
  entities: Content[],
  formats: Format[],
  locale: string,
  timeZone: string,
  onChangeParentId: (id: string) => void,
  onDeleteAttachment: () => void,
  t: i18n.TranslationFunction,
): RowType[] => {
  const { getDocumentType, isEditable, isViewable } = useFormats(formats);

  const onClickOnTitle = (entity: Content) => {
    if (entity.type === "attachment") {
      onClickEdit(entity);
    } else {
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
      title: t("component.content-tree.dialog.delete-attachment.title"),
      description: t(
        "component.content-tree.dialog.delete-attachment.description",
      ).replace("{filename}", entity.title),
      appearance: "danger",
      buttons: {
        submit: {
          title: t("buttons.delete.title"),
          onClick: () => {
            confirmDialogService.setLoading(true);
            deleteAttachment(entity.id)
              .then(() => {
                showFlag({
                  id: "delete-attachment-success",
                  title: t("notifications.attachment-deleted").replace(
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
                  title: t("notifications.attachment-delete-failed"),
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
          title: t("buttons.cancel.title"),
          onClick: () => {
            confirmDialogService.close();
          },
        },
      },
    });
  };

  const onClickNavigate = (entity: Content) => {
    router.navigate(`/wiki${entity._links.webui}`);
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

  const navigateCondition = (entity: Content) => {
    return entity.type !== "attachment";
  };

  return entities.map((entity) => ({
    key: entity.id,
    cells: [
      {
        key: "title",
        content: (
          <Box
            xcss={styles.title}
            paddingInlineStart="space.100"
            onClick={() => onClickOnTitle(entity)}
          >
            <Inline space="space.075" alignBlock="center">
              <Box xcss={styles.iconContainer}>
                {getIconByContentType(
                  entity.type,
                  t("document-type." + entity.type),
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
        content: getFormatedDate(
          entity.version.createdAt || entity.version.when,
          locale,
          timeZone,
        ),
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
                  label={t("labels.more")}
                  ref={triggerRef}
                />
              )}
              placement="bottom-end"
              shouldRenderToParent
            >
              <DropdownItemGroup>
                {editCondition(entity) && (
                  <DropdownItem onClick={() => onClickEdit(entity)}>
                    {t("component.content-tree.actions.edit")}
                  </DropdownItem>
                )}
                {viewCondition(entity) && (
                  <DropdownItem onClick={() => onClickEdit(entity)}>
                    {t("component.content-tree.actions.view")}
                  </DropdownItem>
                )}
                {downloadCondition(entity) && (
                  <DropdownItem onClick={() => onClickDownload(entity)}>
                    {t("component.content-tree.actions.download")}
                  </DropdownItem>
                )}
                {navigateCondition(entity) && (
                  <DropdownItem onClick={() => onClickNavigate(entity)}>
                    {t("component.content-tree.actions.navigate-to")}
                  </DropdownItem>
                )}
              </DropdownItemGroup>
              {deleteCondition(entity) && (
                <DropdownItemGroup hasSeparator>
                  <DropdownItem onClick={() => onClickDelete(entity)}>
                    {t("component.content-tree.actions.delete")}
                  </DropdownItem>
                </DropdownItemGroup>
              )}
            </DropdownMenu>
          </Box>
        ),
      },
    ],
  }));
};
