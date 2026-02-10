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

import React, { useContext, useEffect, useState } from "react";

import DynamicTable from "@atlaskit/dynamic-table";
import { RowType } from "@atlaskit/dynamic-table/dist/types/types";
import { Stack } from "@atlaskit/primitives";
import { invoke, router } from "@forge/bridge";

import NotFoundIcon from "../../assets/images/not-found.svg";
import {
  findContent,
  findContentById,
  findContentByLink,
  getContentInSpace,
} from "../../client";
import { AppContext } from "../../context/AppContext";
import {
  AppContext as AC,
  Content,
  Format,
  SearchResponse,
  SortOrder,
} from "../../types/types";
import { getEditorPageUrl } from "../../util/routerUtils";

import { ContentTreeBreadcrumbs } from "./components/ContentTreeBreadcrumbs";
import { ContentTreeEmptyState } from "./components/ContentTreeEmptyState";
import {
  ContentTreePagination,
  COUNT_ELEMENTS_ON_PAGE_OPTIONS,
  CountElementsOnPage,
} from "./components/ContentTreePagination";
import { ContentTreeToolbar, Section } from "./components/ContentTreeToolbar";
import { buildCreateRow } from "./utils/createRowUtils";
import { buildContentTreeRows, getHead } from "./utils/rowUtils";
import { adoptSortForTargetRequest } from "./utils/sortUtils";

const DEFAULT_SORT = { key: "lastmodified", order: SortOrder.DESC };

export type ContentTreeProps = {
  space: {
    id: string;
    key: string;
  };
  parentId?: string;
  section: Section;
  search?: string;
  showOnlyFiles?: boolean;
  sort?: { key: string; order: SortOrder };
  countElementsOnPage: CountElementsOnPage;
  locale: string;
  timeZone: string;
  showBreadcrumbs?: boolean;
  showFilter?: boolean;
  onChangeParentId: (id: string | undefined) => void;
  onChangeSection: (section: Section) => void;
  onChangeSearch: (search: string) => void;
  onChangeShowOnlyFiles: (showOnlyFiles: boolean) => void;
  onChangeSort: (sort: { key: string; order: SortOrder }) => void;
  onChangeCountElementsOnPage: (count: CountElementsOnPage) => void;
};

export const ContentTree: React.FC<ContentTreeProps> = ({
  space,
  parentId,
  section,
  search = "",
  showOnlyFiles = false,
  sort = DEFAULT_SORT,
  countElementsOnPage,
  locale,
  timeZone,
  showBreadcrumbs = true,
  showFilter = true,
  onChangeParentId,
  onChangeSection,
  onChangeSearch,
  onChangeShowOnlyFiles,
  onChangeSort,
  onChangeCountElementsOnPage,
}) => {
  const [appContext, setAppContext] = useState<AC | null>(null);
  const [formats, setFormats] = useState<Format[] | null>(null);

  const [currentEntity, setCurrentEntity] = useState<Content | null>(null);
  const [childEntities, setChildEntities] = useState<Array<Content>>();
  const [navigationLinks, setNavigationLinks] = useState<{
    prev: string | null;
    next: string | null;
  }>({ prev: null, next: null });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reloadFlag, setReloadFlag] = useState<boolean>(false);

  const [rows, setRows] = useState<Array<RowType>>([]);

  const { t, setAppError } = useContext(AppContext);

  useEffect(() => {
    Promise.all([invoke<AC>("getAppContext"), invoke<Format[]>("getFormats")])
      .then(([appContextResponse, formatsResponse]) => {
        setAppContext(appContextResponse);
        setFormats(formatsResponse);
      })
      .catch(() => {
        setAppError({
          title: t("error-state.common.title"),
          description: t("error-state.common.description"),
        });
      });
  }, []);

  useEffect(() => {
    setIsLoading(true);

    let requestContent;
    if (parentId) {
      requestContent = findContent(
        space.key,
        parentId,
        search,
        showOnlyFiles,
        countElementsOnPage,
        sort,
      );
    } else {
      const contentType = section === "blogs" ? "blogpost" : "page";

      requestContent = getContentInSpace(
        space.id,
        contentType,
        "root",
        search,
        countElementsOnPage,
        adoptSortForTargetRequest(sort),
      );
    }

    Promise.all([requestCurrentEntity(parentId, section), requestContent])
      .then(([currentEntityResponse, contentResponse]) => {
        setCurrentEntity(currentEntityResponse?.results[0] || null);
        setChildEntities(contentResponse.results);
        setNavigationLinks(contentResponse._links);
      })
      .catch(() => {
        setAppError({
          title: t("error-state.common.title"),
          description: t("error-state.common.description"),
        });
      });
  }, [
    parentId,
    section,
    countElementsOnPage,
    search,
    showOnlyFiles,
    sort,
    reloadFlag,
  ]);

  useEffect(() => {
    if (appContext && formats && childEntities) {
      setRows(
        buildContentTreeRows(
          appContext,
          currentEntity
            ? { id: currentEntity.id, contentType: currentEntity.type }
            : undefined,
          childEntities,
          formats,
          locale,
          timeZone,
          onChangeParentId,
          onDeleteAttachment,
          t,
        ),
      );
      setIsLoading(false);
    }
  }, [appContext, formats, childEntities]);

  const requestCurrentEntity = async (
    parentId: string | undefined,
    section: Section,
  ): Promise<SearchResponse<Content> | null> => {
    if (parentId) {
      const contentResponse = await findContentById(parentId, section);

      if (contentResponse.results.length <= 0) {
        setAppError({
          title: t("error-state.not-found.title"),
          description: t("error-state.not-found.description"),
          imageUrl: NotFoundIcon,
        });
      }

      return contentResponse;
    } else {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  };

  const onSwitchPage = (link: string | null) => {
    if (link) {
      setIsLoading(true);
      findContentByLink(link)
        .then((contentResponse) => {
          setChildEntities(contentResponse.results);
          setNavigationLinks(contentResponse._links);
        })
        .catch(() => {
          setAppError({
            title: t("error-state.common.title"),
            description: t("error-state.common.description"),
          });
        });
    }
  };

  const createCondititon = (entity: Content) => {
    if (entity?.type !== "page" && currentEntity?.type !== "blogpost") {
      return false;
    }

    const createPermission = entity.operations.some((value) => {
      return value.operation === "create" && value.targetType === "attachment";
    });

    return createPermission;
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
          t,
        ),
        ...rowsWithotCreateRow,
      ]);
    }
  };

  const onCreateAttachment = (attachmentId: string) => {
    onChangeSearch("");
    onChangeSort({ key: "lastmodified", order: SortOrder.DESC });
    setReloadFlag(!reloadFlag);

    if (appContext && currentEntity) {
      router.navigate(
        getEditorPageUrl(
          appContext.appId,
          appContext.environmentId,
          { id: currentEntity.id, contentType: currentEntity.type },
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
          section={section}
          showFilter={showFilter}
          customFilters={
            currentEntity?.type === "blogpost" || currentEntity?.type === "page"
              ? [
                  {
                    id: "show-only-files",
                    label: t("component.content-tree.actions.show-only-files"),
                    value: showOnlyFiles,
                    onChange: onChangeShowOnlyFiles,
                  },
                ]
              : undefined
          }
          search={search}
          isLoading={isLoading}
          onChangeSection={onChangeSection}
          onChangeSearch={onChangeSearch}
          onClickCreate={
            !currentEntity || !createCondititon(currentEntity) || isLoading
              ? undefined
              : onClickCreate
          }
        />
        {showBreadcrumbs && (
          <ContentTreeBreadcrumbs
            items={[
              {
                id: "root",
                title: t("component.content-tree.section." + section),
                type: "",
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
          head={getHead(t)}
          rows={rows}
          sortKey={sort.key}
          sortOrder={sort.order}
          emptyView={<ContentTreeEmptyState isSearchActive={!!search} />}
          onSort={(value) =>
            onChangeSort({ key: value.key, order: value.sortOrder })
          }
        />
        <ContentTreePagination
          isLoading={isLoading}
          countElementsOnPage={
            rows.length > COUNT_ELEMENTS_ON_PAGE_OPTIONS[0] ||
            navigationLinks.prev ||
            navigationLinks.next
              ? countElementsOnPage
              : undefined
          }
          prevLink={navigationLinks.prev}
          nextLink={navigationLinks.next}
          onChangePage={onSwitchPage}
          onChangeCountElementsOnPage={onChangeCountElementsOnPage}
        />
      </Stack>
    </>
  );
};
