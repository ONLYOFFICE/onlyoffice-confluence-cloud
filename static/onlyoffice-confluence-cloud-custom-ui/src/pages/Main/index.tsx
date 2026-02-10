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

import React, { useContext, useState } from "react";

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

import { ContentTree } from "../../components/ContentTree";
import {
  COUNT_ELEMENTS_ON_PAGE_OPTIONS,
  CountElementsOnPage,
} from "../../components/ContentTree/components/ContentTreePagination";
import { Section } from "../../components/ContentTree/components/ContentTreeToolbar";
import { AppContext } from "../../context/AppContext";
import { SortOrder } from "../../types/types";

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
  searchParams: URLSearchParams;
  onChangSearchParams: (searchParams: URLSearchParams) => void;
};

const MainPage: React.FC<MainPageProps> = ({
  context,
  searchParams,
  onChangSearchParams,
}) => {
  const type = context.extension.type;

  const space = context.extension.space;
  const parentId =
    searchParams.get("parentId") || context.extension.content?.id;
  let section = searchParams.get("filter")?.split(",").includes("blogs")
    ? "blogs"
    : "content";
  const search = searchParams.get("search") || "";
  let showOnlyFiles = searchParams.get("filter")?.split(",").includes("files");
  const sort = {
    key: searchParams.get("sortKey") || "lastmodified",
    order:
      searchParams.get("sortOrder") === "ASC" ? SortOrder.ASC : SortOrder.DESC,
  };
  const [countElementsOnPage, setCountElementsOnPage] =
    useState<CountElementsOnPage>(COUNT_ELEMENTS_ON_PAGE_OPTIONS[0]);

  const locale = context.locale;
  const timeZone = context.timezone;

  const { t } = useContext(AppContext);

  if ("confluence:contentAction" === type) {
    showOnlyFiles = true;
    if ("blogpost" === context.extension.content?.type) {
      section = "blogs";
    }
  }

  const getContainer = (type: string, children: React.ReactNode) => {
    switch (type) {
      case "confluence:spacePage":
        return (
          <Stack space="space.300">
            <Stack space="space.050">
              <Heading size="medium">{t("page.main.title")}</Heading>
              <Text>{t("page.main.description")}</Text>
            </Stack>
            <Box xcss={styles.pageBodyContainer}>{children}</Box>
          </Stack>
        );
      case "confluence:contentAction":
        return (
          <FullScreenModalDialog onClose={() => view.close()}>
            <ModalHeader hasCloseButton>
              <ModalTitle>{t("page.main.modal-title")}</ModalTitle>
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
      section={section}
      search={search}
      showOnlyFiles={showOnlyFiles}
      sort={sort}
      countElementsOnPage={countElementsOnPage}
      locale={locale}
      timeZone={timeZone}
      showBreadcrumbs={type === "confluence:spacePage"}
      showFilter={type === "confluence:spacePage"}
      onChangeParentId={(value: string | undefined) => {
        if (value) {
          searchParams.set("parentId", value);
        } else {
          searchParams.delete("parentId");
        }
        searchParams.delete("search");
        const currentFilter = searchParams.get("filter")?.split(",") || [];
        const newFilter = currentFilter.filter((f) => f !== "files").join(",");
        if (newFilter) {
          searchParams.set("filter", newFilter);
        } else {
          searchParams.delete("filter");
        }
        onChangSearchParams(searchParams);
      }}
      onChangeSection={(value: Section) => {
        if (value === "blogs") {
          onChangSearchParams(new URLSearchParams("filter=blogs"));
        } else {
          onChangSearchParams(new URLSearchParams());
        }
      }}
      onChangeSearch={(value: string) => {
        if (value) {
          searchParams.set("search", value);
        } else {
          searchParams.delete("search");
        }
        onChangSearchParams(searchParams);
      }}
      onChangeShowOnlyFiles={(value: boolean) => {
        const currentFilter = searchParams.get("filter")?.split(",") || [];
        if (value) {
          searchParams.set("filter", [...currentFilter, "files"].join(","));
        } else {
          const newValue = currentFilter.filter((f) => f !== "files").join(",");
          if (newValue) {
            searchParams.set("filter", newValue);
          } else {
            searchParams.delete("filter");
          }
        }
        onChangSearchParams(searchParams);
      }}
      onChangeSort={(value: { key: string; order: SortOrder }) => {
        searchParams.set("sortKey", value.key);
        searchParams.set("sortOrder", value.order);
        onChangSearchParams(searchParams);
      }}
      onChangeCountElementsOnPage={setCountElementsOnPage}
    />,
  );
};

export default MainPage;
