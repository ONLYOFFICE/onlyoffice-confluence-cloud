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
import { AppContext, Content, Format, SearchResponse } from "../../types/types";
import { useFormats } from "../../util/formats";
import { getEditorPageUrl } from "../../util/routerUtils";

import { ContentTreeBreadcrumbs } from "./components/ContentTreeBreadcrumbs";
import { ContentTreePagination } from "./components/ContentTreePagination";
import { ContentTreeToolbar } from "./components/ContentTreeToolbar";
import { buildCreateRow } from "./utils/createRowUtils";
import { getIconByContentType } from "./utils/iconUtils";
import { buildContentTreeRows } from "./utils/rowUtils";

export type ContentTreeProps = {
  space: {
    id: string;
    key: string;
  };
  parentId: string | null;
  contentType: string | null;
  locale: string;
  showBreadcrumbs?: boolean;
  showFilter?: boolean;
};

export const ContentTree: React.FC<ContentTreeProps> = ({
  space,
  parentId,
  contentType,
  locale,
  showBreadcrumbs = true,
  showFilter = true,
}) => {
  const [appContext, setAppContext] = useState<AppContext | null>(null);
  const [formats, setFormats] = useState<Format[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reloadFlag, setReloadFlag] = useState<boolean>(false);

  const [currentParentId, setCurrentParentId] = useState<string | null>(
    parentId,
  );
  const [currentContentType, setCurrentContentType] = useState<string | null>(
    contentType || "content",
  );

  const [currentEntity, setCurrentEntity] = useState<Content | null>(null);
  const [countElementsOnPage, setCountElementsOnPage] = useState<number>(25);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<{ key: string; order: "ASC" | "DESC" }>({
    key: "lastmodified",
    order: "DESC",
  });
  const [showOnlyFiles, setShowOnlyFiles] = useState<boolean>(false);
  const [navigationLinks, setNavigationLinks] = useState<{
    prev: string | null;
    next: string | null;
  }>({ prev: null, next: null });

  const [rows, setRows] = useState<Array<RowType>>([]);

  const { getDocumentType } = useFormats(formats);

  const head = {
    cells: [
      {
        key: "title",
        content: "Title",
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

  useEffect(() => {
    invoke<AppContext>("getAppContenxt").then((data) => {
      setAppContext(data);
    });
    invoke<Format[]>("getFormats").then((data) => {
      setFormats(data);
    });
  }, []);

  useEffect(() => {
    if (currentParentId) {
      findContentById(currentParentId).then((response) => {
        setCurrentEntity(response.results[0] || null);
      });

      handleContentRequest(
        findContent(
          space.key,
          currentParentId,
          search,
          showOnlyFiles,
          countElementsOnPage,
          sort,
        ),
      );
    } else {
      setCurrentEntity(null);
      if (currentContentType === "blogpost") {
        handleContentRequest(
          getBlogsInSpace(
            space.id,
            search,
            countElementsOnPage,
            adoptSortForTargetRequest(sort),
          ),
          "blogpost",
        );
      } else {
        handleContentRequest(
          getPagesInSpace(
            space.id,
            "root",
            search,
            countElementsOnPage,
            adoptSortForTargetRequest(sort),
          ),
          "page",
        );
      }
    }
  }, [
    currentParentId,
    currentContentType,
    countElementsOnPage,
    search,
    showOnlyFiles,
    sort,
    reloadFlag,
  ]);

  const handleContentRequest = (
    contentRequest: Promise<SearchResponse<Content>>,
    contentType?: string,
  ) => {
    setIsLoading(true);

    contentRequest
      .then((response) => {
        const rows = buildContentTreeRows(
          currentParentId,
          contentType,
          response.results,
          getDocumentType,
          setCurrentParentId,
        );

        setNavigationLinks(response._links);
        setRows(rows);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const adoptSortForTargetRequest = (sort: {
    key: string;
    order: "ASC" | "DESC";
  }) => {
    const validValues = new Map([
      ["title", "title"],
      ["lastmodified", "modified-date"],
    ]);

    const value = validValues.get(sort.key);

    if (value) {
      return `${sort.order === "ASC" ? "" : "-"}${value}`;
    }

    return "";
  };

  const onChangeContentType = (selectedContentType: { value: string }) => {
    setCurrentParentId(null);
    setCurrentContentType(selectedContentType.value);
  };

  const onSort = (data: { key: string; sortOrder: "ASC" | "DESC" }) => {
    setSort({
      key: data.key,
      order: data.sortOrder,
    });
  };

  const onSwitchPage = (link: string | null) => {
    if (link) handleContentRequest(findContentByLink(link));
  };

  const onClickCreate = (documentType: string) => {
    const rowsWithotCreateRow = rows.filter((row) => row.key !== "create");

    if (currentParentId) {
      setRows([
        buildCreateRow(
          currentParentId,
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
    setSearch("");
    setSort({ key: "lastmodified", order: "DESC" });
    setReloadFlag(!reloadFlag);
    openEditorPage(attachmentId);
  };

  const openEditorPage = (attachmentId: string) => {
    if (appContext && currentParentId) {
      router.navigate(
        getEditorPageUrl(
          appContext.appId,
          appContext.environmentId,
          currentParentId,
          attachmentId,
        ),
      );
    }
  };

  const onCancelCreate = () => {
    const rowsWithotCreateRow = rows.filter((row) => row.key !== "create");

    setRows([...rowsWithotCreateRow]);
  };

  return (
    <>
      <Stack space="space.200">
        <ContentTreeToolbar
          isLoading={isLoading}
          contentType={currentContentType}
          showFilter={showFilter}
          customFilters={
            currentEntity?.type === "blogpost" || currentEntity?.type === "page"
              ? [
                  {
                    id: "show-only-files",
                    label: "Show only files",
                    value: showOnlyFiles,
                    onChange: setShowOnlyFiles,
                  },
                ]
              : undefined
          }
          search={search}
          onChangeContentType={onChangeContentType}
          onChangeSearch={setSearch}
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
            contentType={currentContentType}
            items={[
              ...(currentEntity ? currentEntity.ancestors : []),
              ...(currentEntity ? [currentEntity] : []),
            ]}
            getIconForItem={(item) =>
              getIconByContentType(
                item.type,
                item.type === "attachment"
                  ? getDocumentType(item.title) || ""
                  : undefined,
              )
            }
            onClickItem={setCurrentParentId}
          />
        )}
        <DynamicTable
          isFixedSize
          isLoading={isLoading}
          head={head}
          rows={rows}
          sortKey={sort.key}
          sortOrder={sort.order}
          onSort={onSort}
        />
        {(navigationLinks.prev || navigationLinks.next) && (
          <ContentTreePagination
            isLoading={isLoading}
            countElementsOnPage={countElementsOnPage}
            prevLink={navigationLinks.prev}
            nextLink={navigationLinks.next}
            onChangePage={onSwitchPage}
            onChangeCountElementsOnPage={setCountElementsOnPage}
          />
        )}
      </Stack>
    </>
  );
};
