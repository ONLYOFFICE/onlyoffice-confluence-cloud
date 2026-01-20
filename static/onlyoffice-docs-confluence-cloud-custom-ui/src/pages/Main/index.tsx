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

import React, { useState } from "react";

import Heading from "@atlaskit/heading";
import {
  FullScreenModalDialog,
  ModalBody,
  ModalHeader,
  ModalTitle,
} from "@atlaskit/modal-dialog/full-screen";
import { Box, Stack, Text, xcss } from "@atlaskit/primitives";
import { view } from "@forge/bridge";
import { FullContext } from "@forge/bridge";
import { History } from "history";

import { ContentTree } from "../../components/ContentTree";
import { COUNT_ELEMENTS_ON_PAGE_OPTIONS } from "../../constants";
import { ContentType, SortOrder } from "../../types/types";
import { updateHistory } from "../../util/routerUtils";

const styles = {
  pageBodyContainer: xcss({
    paddingBottom: "space.500",
  }),
  modalBodyContainer: xcss({
    paddingBottom: "space.300",
  }),
};

export type MainPageProps = {
  context: FullContext;
  history?: History;
};

const MainPage: React.FC<MainPageProps> = ({ context, history }) => {
  const type = context.extension.type;
  const location = new URL(
    type === "confluence:spacePage"
      ? context.extension.location
      : "http://localhost",
  );

  const space = context.extension.space;
  const [parentId, setParentId] = useState<string | undefined>(
    location.searchParams.get("pageId") || context.extension.content?.id,
  );
  const [contentType, setContentType] = useState<ContentType>("content");
  const [search, setSearch] = useState<string>(
    location.searchParams.get("search") || "",
  );
  const [showOnlyFiles, setShowOnlyFiles] = useState<boolean>(
    location.searchParams.get("filter")?.split(",").includes("files") || false,
  );
  const [sort, setSort] = useState<
    { key: string; order: SortOrder } | undefined
  >({
    key: location.searchParams.get("sortKey") || "lastmodified",
    order:
      location.searchParams.get("sortOrder") === "ASC"
        ? SortOrder.ASC
        : SortOrder.DESC,
  });
  const [countElementsOnPage, setCountElementsOnPage] = useState<number>(
    COUNT_ELEMENTS_ON_PAGE_OPTIONS[0],
  );

  const locale = context.locale;

  const getContainer = (type: string, children: React.ReactNode) => {
    switch (type) {
      case "confluence:spacePage":
        return (
          <Stack space="space.300">
            <Stack space="space.050">
              <Heading size="medium">Welcome to ONLYOFFICE!</Heading>
              <Text>
                Create and open attachments from your space. All files from
                Content and Blogs will appear here. To create a new file, click
                to any page and press Create button.
              </Text>
            </Stack>
            <Box xcss={styles.pageBodyContainer}>{children}</Box>
          </Stack>
        );
      case "confluence:contentAction":
        return (
          <FullScreenModalDialog onClose={() => view.close()}>
            <ModalHeader hasCloseButton>
              <ModalTitle>ONLYOFFICE Docs</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Box xcss={styles.modalBodyContainer}>{children}</Box>
            </ModalBody>
          </FullScreenModalDialog>
        );
    }
  };

  return getContainer(
    type,
    <ContentTree
      space={space}
      parentId={parentId}
      contentType={contentType}
      search={search}
      showOnlyFiles={showOnlyFiles}
      sort={sort}
      countElementsOnPage={countElementsOnPage}
      locale={locale}
      showBreadcrumbs={type === "confluence:spacePage"}
      showFilter={type === "confluence:spacePage"}
      onChangeParentId={(value: string | undefined) => {
        setParentId(value);
        if (history) {
          updateHistory(history, [{ key: "pageId", value }]);
        }
      }}
      onChangeContentType={(value: ContentType) => {
        setParentId(undefined);
        setSearch("");
        setShowOnlyFiles(false);
        setSort(undefined);
        setContentType(value);
        if (history) {
          history.push({
            search: value === "blogpost" ? "filter=blogpost" : undefined,
          });
        }
      }}
      onChangeSearch={(value: string) => {
        setSearch(value);
        if (history) {
          updateHistory(history, [{ key: "search", value }]);
        }
      }}
      onChangeShowOnlyFiles={(value: boolean) => {
        setShowOnlyFiles(value);

        if (history) {
          const url = new URL("http://localhost" + history.location.search);
          const currentFilter =
            url.searchParams.get("filter")?.split(",") || [];
          updateHistory(history, [
            {
              key: "filter",
              value: value
                ? [...currentFilter, "files"].join(",")
                : currentFilter.filter((f) => f !== "files").join(","),
            },
          ]);
        }
      }}
      onChangeSort={(value: { key: string; order: SortOrder }) => {
        setSort(value);

        if (history) {
          updateHistory(history, [
            { key: "sortKey", value: value.key },
            { key: "sortOrder", value: value.order },
          ]);
        }
      }}
      onChangeCountElementsOnPage={setCountElementsOnPage}
    />,
  );
};

export default MainPage;
