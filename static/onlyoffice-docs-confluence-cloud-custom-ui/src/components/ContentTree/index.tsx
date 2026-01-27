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

import React, { useEffect, useState } from "react";

import DynamicTable from "@atlaskit/dynamic-table";
import { RowType } from "@atlaskit/dynamic-table/dist/types/types";
import { Stack } from "@atlaskit/primitives";
import { invoke, router } from "@forge/bridge";

import {
  findContent,
  findContentById,
  findContentByLink,
  getBlogsInSpace,
  getPagesInSpace,
} from "../../client";
import {
  AppContext,
  Content,
  ContentType,
  Format,
  SearchResponse,
  SortOrder,
} from "../../types/types";
import { getEditorPageUrl } from "../../util/routerUtils";

import { ContentTreeBreadcrumbs } from "./components/ContentTreeBreadcrumbs";
import { ContentTreePagination } from "./components/ContentTreePagination";
import { ContentTreeToolbar } from "./components/ContentTreeToolbar";
import { buildCreateRow } from "./utils/createRowUtils";
import { buildContentTreeRows, head } from "./utils/rowUtils";
import { adoptSortForTargetRequest } from "./utils/sortUtils";

const DEFAULT_SORT = { key: "lastmodified", order: SortOrder.DESC };

export type ContentTreeProps = {
  space: {
    id: string;
    key: string;
  };
  parentId?: string;
  contentType: ContentType;
  search?: string;
  showOnlyFiles?: boolean;
  sort?: { key: string; order: SortOrder };
  countElementsOnPage: number;
  locale: string;
  timeZone: string;
  showBreadcrumbs?: boolean;
  showFilter?: boolean;
  onChangeParentId: (id: string | undefined) => void;
  onChangeContentType: (contentType: ContentType) => void;
  onChangeSearch: (search: string) => void;
  onChangeShowOnlyFiles: (showOnlyFiles: boolean) => void;
  onChangeSort: (sort: { key: string; order: SortOrder }) => void;
  onChangeCountElementsOnPage: (count: number) => void;
};

export const ContentTree: React.FC<ContentTreeProps> = ({
  space,
  parentId,
  contentType,
  search = "",
  showOnlyFiles = false,
  sort = DEFAULT_SORT,
  countElementsOnPage,
  locale,
  timeZone,
  showBreadcrumbs = true,
  showFilter = true,
  onChangeParentId,
  onChangeContentType,
  onChangeSearch,
  onChangeShowOnlyFiles,
  onChangeSort,
  onChangeCountElementsOnPage,
}) => {
  const [appContext, setAppContext] = useState<AppContext | null>(null);
  const [formats, setFormats] = useState<Format[] | null>(null);

  const [currentEntity, setCurrentEntity] = useState<Content | null>(null);
  const [navigationLinks, setNavigationLinks] = useState<{
    prev: string | null;
    next: string | null;
  }>({ prev: null, next: null });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reloadFlag, setReloadFlag] = useState<boolean>(false);

  const [rows, setRows] = useState<Array<RowType>>([]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      requestAppContext(appContext),
      requestFormats(formats),
      requestCurrentEntity(parentId, currentEntity),
      requestContent(
        space,
        parentId,
        contentType,
        search,
        showOnlyFiles,
        countElementsOnPage,
        sort,
      ),
    ])
      .then(
        ([
          appContextResponse,
          formatsResponse,
          currentEntityResponse,
          contentResponse,
        ]) => {
          setAppContext(appContextResponse);
          setFormats(formatsResponse);
          setCurrentEntity(currentEntityResponse?.results[0] || null);
          setRows(
            buildContentTreeRows(
              appContextResponse,
              parentId,
              contentResponse.results,
              formatsResponse,
              locale,
              timeZone,
              onChangeParentId,
              onDeleteAttachment,
            ),
          );
          setNavigationLinks(contentResponse._links);
        },
      )
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    parentId,
    contentType,
    countElementsOnPage,
    search,
    showOnlyFiles,
    sort,
    reloadFlag,
  ]);

  const requestAppContext = (
    currentAppContext: AppContext | null,
  ): Promise<AppContext> => {
    if (!currentAppContext) {
      return invoke<AppContext>("getAppContenxt");
    } else {
      return new Promise((resolve) => {
        resolve(currentAppContext);
      });
    }
  };

  const requestFormats = (
    currentFormats: Format[] | null,
  ): Promise<Format[]> => {
    if (!currentFormats) {
      return invoke<Format[]>("getFormats");
    } else {
      return new Promise((resolve) => {
        resolve(currentFormats);
      });
    }
  };

  const requestCurrentEntity = (
    parentId: string | undefined,
    currentEntity: Content | null,
  ): Promise<SearchResponse<Content> | null> => {
    if (parentId) {
      if (parentId === currentEntity?.id) {
        return new Promise((resolve) => {
          resolve({ results: [currentEntity] } as SearchResponse<Content>);
        });
      } else {
        return findContentById(parentId);
      }
    } else {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  };

  const requestContent = (
    space: {
      id: string;
      key: string;
    },
    parentId: string | undefined,
    contentType: ContentType,
    search: string,
    showOnlyFiles: boolean,
    countElementsOnPage: number,
    sort: { key: string; order: SortOrder },
  ) => {
    if (parentId) {
      return findContent(
        space.key,
        parentId,
        search,
        showOnlyFiles,
        countElementsOnPage,
        sort,
      );
    } else {
      if (contentType === "blogpost") {
        return getBlogsInSpace(
          space.id,
          search,
          countElementsOnPage,
          adoptSortForTargetRequest(sort),
        );
      } else {
        return getPagesInSpace(
          space.id,
          "root",
          search,
          countElementsOnPage,
          adoptSortForTargetRequest(sort),
        );
      }
    }
  };

  const onSwitchPage = (link: string | null) => {
    if (link && appContext && formats) {
      setIsLoading(true);
      findContentByLink(link).then((contentResponse) => {
        setRows(
          buildContentTreeRows(
            appContext,
            parentId,
            contentResponse.results,
            formats,
            locale,
            timeZone,
            onChangeParentId,
            onDeleteAttachment,
          ),
        );
        setNavigationLinks(contentResponse._links);
      });
    }
  };

  const onClickCreate = (documentType: string) => {
    const rowsWithotCreateRow = rows.filter((row) => row.key !== "create");

    if (parentId) {
      setRows([
        buildCreateRow(
          parentId,
          documentType,
          locale,
          isLoading,
          onCreateAttachment,
          onCancelCreate,
          setIsLoading,
        ),
        ...rowsWithotCreateRow,
      ]);
    }
  };

  const onCreateAttachment = (attachmentId: string) => {
    onChangeSearch("");
    onChangeSort({ key: "lastmodified", order: SortOrder.DESC });
    setReloadFlag(!reloadFlag);

    if (appContext && parentId) {
      router.navigate(
        getEditorPageUrl(
          appContext.appId,
          appContext.environmentId,
          parentId,
          attachmentId,
        ),
      );
    }
  };

  const onCancelCreate = () => {
    const rowsWithotCreateRow = rows.filter((row) => row.key !== "create");

    setRows([...rowsWithotCreateRow]);
  };

  const onDeleteAttachment = () => {
    setReloadFlag(!reloadFlag);
  };

  return (
    <>
      <Stack space="space.200">
        <ContentTreeToolbar
          contentType={contentType}
          showFilter={showFilter}
          customFilters={
            currentEntity?.type === "blogpost" || currentEntity?.type === "page"
              ? [
                  {
                    id: "show-only-files",
                    label: "Show only files",
                    value: showOnlyFiles,
                    onChange: onChangeShowOnlyFiles,
                  },
                ]
              : undefined
          }
          search={search}
          isLoading={isLoading}
          onChangeContentType={onChangeContentType}
          onChangeSearch={onChangeSearch}
          onClickCreate={
            (currentEntity?.type !== "page" &&
              currentEntity?.type !== "blogpost") ||
            isLoading
              ? undefined
              : onClickCreate
          }
        />
        {showBreadcrumbs && (
          <ContentTreeBreadcrumbs
            items={[
              {
                id: "root",
                title: contentType,
                type: contentType,
              },
              ...(currentEntity ? currentEntity.ancestors : []),
              ...(currentEntity ? [currentEntity] : []),
            ]}
            onClickItem={onChangeParentId}
          />
        )}
        <DynamicTable
          isFixedSize
          isLoading={isLoading}
          head={head}
          rows={rows}
          sortKey={sort.key}
          sortOrder={sort.order}
          onSort={(value) =>
            onChangeSort({ key: value.key, order: value.sortOrder })
          }
        />
        {(navigationLinks.prev || navigationLinks.next) && (
          <ContentTreePagination
            isLoading={isLoading}
            countElementsOnPage={countElementsOnPage}
            prevLink={navigationLinks.prev}
            nextLink={navigationLinks.next}
            onChangePage={onSwitchPage}
            onChangeCountElementsOnPage={onChangeCountElementsOnPage}
          />
        )}
      </Stack>
    </>
  );
};
