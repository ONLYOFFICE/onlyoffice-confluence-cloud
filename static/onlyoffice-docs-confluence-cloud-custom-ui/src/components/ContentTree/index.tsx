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

import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import { ButtonGroup } from "@atlaskit/button";
import Button, { IconButton } from "@atlaskit/button/new";
import DropdownMenu, {
  DropdownItem,
  DropdownItemCheckbox,
  DropdownItemCheckboxGroup,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import DynamicTable from "@atlaskit/dynamic-table";
import { RowType } from "@atlaskit/dynamic-table/dist/types/types";
import AddIcon from "@atlaskit/icon/core/add";
import ChevronLeftIcon from "@atlaskit/icon/core/chevron-left";
import ChevronRightIcon from "@atlaskit/icon/core/chevron-right";
import DatabaseIcon from "@atlaskit/icon/core/database";
import FilterIcon from "@atlaskit/icon/core/filter";
import FolderClosedIcon from "@atlaskit/icon/core/folder-closed";
import HomeIcon from "@atlaskit/icon/core/home";
import PageIcon from "@atlaskit/icon/core/page";
import QuotationMarkIcon from "@atlaskit/icon/core/quotation-mark";
import SearchIcon from "@atlaskit/icon/core/search";
import ShowMoreIcon from "@atlaskit/icon/core/show-more-horizontal";
import SmartLinkEmbedIcon from "@atlaskit/icon/core/smart-link-embed";
import WhiteboardIcon from "@atlaskit/icon/core/whiteboard";
import { Box, Inline, Stack, xcss } from "@atlaskit/primitives";
import Textfield from "@atlaskit/textfield";
import { invoke, router } from "@forge/bridge";
import bytes from "bytes";

import { ReactComponent as CellIcon } from "../../assets/images/cell.svg";
import { ReactComponent as DiagramIcon } from "../../assets/images/diagram.svg";
import { ReactComponent as PdfIcon } from "../../assets/images/pdf.svg";
import { ReactComponent as SlideIcon } from "../../assets/images/slide.svg";
import { ReactComponent as UnknownIcon } from "../../assets/images/unknown.svg";
import { ReactComponent as WordIcon } from "../../assets/images/word.svg";
import {
  findContent,
  findContentById,
  findContentByLink,
  getBlogsInSpace,
  getPagesInSpace,
} from "../../client";
import { Content, Format, SearchResponse } from "../../types/types";
import { useFormats } from "../../util/formats";

const styles = {
  searchIcon: xcss({
    paddingLeft: "space.075",
  }),
  filterContainer: xcss({
    paddingInline: "space.075",
  }),
  actionsContainer: xcss({
    textAlign: "center",
  }),
};

const contentTypeOptions = [
  { label: "Content", value: "content" },
  { label: "Blogs", value: "blogpost" },
];
const countElementsOnPageOptions = [25, 50, 100];

export type ContentTreeProps = {
  space: {
    id: string;
    key: string;
  };
  parentId: string | null;
  contentType: string | null;
  showBreadcrumbs?: boolean;
  showFilter?: boolean;
};

export const ContentTree: React.FC<ContentTreeProps> = ({
  space,
  parentId,
  contentType,
  showBreadcrumbs = true,
  showFilter = true,
}) => {
  const [formats, setFormats] = useState<Format[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

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
  ]);

  const handleContentRequest = (
    contentRequest: Promise<SearchResponse<Content>>,
    contentType?: string,
  ) => {
    setIsLoading(true);

    contentRequest
      .then((response) => {
        const rows = buildContentTreeRows(response.results, contentType);

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

  const getIconByContentType = (type: string, title?: string) => {
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
        return getIconForAttachment(title || "");
      default:
        return <PageIcon label="Page" />;
    }
  };

  const getIconForAttachment = (title: string) => {
    const documentType = getDocumentType(title);

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

  const buildContentTreeRows = (
    entities: Content[],
    contentType?: string,
  ): RowType[] => {
    const onClickOnTitle = (entity: Content) => {
      if (entity.type !== "attachment") {
        setCurrentParentId(entity.id);
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
                <Box>
                  {getIconByContentType(
                    contentType || entity.type,
                    entity.title,
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
                        `/forge-apps/a/f8a806c4-dbce-447e-9fc5-5edd102f13aa/e/52727433-e0ce-4dca-996e-7c0d911165cf/r/editor?pageId=${currentParentId}&attachmentId=${entity.id}`,
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

  return (
    <>
      <Stack space="space.200">
        <Inline space="space.100" xcss={styles.filterContainer}>
          {showFilter && (
            <DropdownMenu<HTMLButtonElement>
              trigger={({ triggerRef, ...props }) => (
                <IconButton
                  {...props}
                  label="Filter"
                  icon={FilterIcon}
                  ref={triggerRef}
                  isDisabled={isLoading}
                />
              )}
            >
              <DropdownItemGroup>
                {contentTypeOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    isSelected={currentContentType === option.value}
                    onClick={() => onChangeContentType(option)}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </DropdownItemGroup>
              <DropdownItemCheckboxGroup id="contentType">
                {(currentEntity?.type === "blogpost" ||
                  currentEntity?.type === "page") && (
                  <DropdownItemCheckbox
                    id="show-only-files"
                    onClick={() => setShowOnlyFiles(!showOnlyFiles)}
                  >
                    Show only files
                  </DropdownItemCheckbox>
                )}
              </DropdownItemCheckboxGroup>
            </DropdownMenu>
          )}
          <Textfield
            placeholder="Search"
            value={search}
            isDisabled={isLoading}
            onChange={(event) =>
              setSearch((event.target as HTMLInputElement).value)
            }
            className="search-input"
            elemBeforeInput={
              <Box xcss={styles.searchIcon}>
                <SearchIcon label="Search" />
              </Box>
            }
          />
          <Button
            isDisabled={isLoading}
            iconBefore={AddIcon}
            appearance="primary"
          >
            Create
          </Button>
        </Inline>
        {showBreadcrumbs && (
          <Breadcrumbs>
            <BreadcrumbsItem
              text={
                contentTypeOptions.find(
                  (option) => option.value === currentContentType,
                )?.label || "Content"
              }
              iconBefore={<HomeIcon label="Home" />}
              onClick={() => setCurrentParentId(null)}
            />
            {currentEntity &&
              currentEntity?.ancestors.map((ancestor) => (
                <BreadcrumbsItem
                  key={ancestor.id}
                  text={ancestor.title}
                  iconBefore={getIconByContentType(ancestor.type)}
                  onClick={() => setCurrentParentId(ancestor.id)}
                />
              ))}
            {currentEntity && (
              <BreadcrumbsItem
                text={currentEntity.title}
                iconBefore={getIconByContentType(currentEntity.type)}
                onClick={() => setCurrentParentId(currentEntity.id)}
              />
            )}
          </Breadcrumbs>
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
          <Inline spread="space-between">
            <ButtonGroup label="Default button group">
              <Button
                iconBefore={ChevronLeftIcon}
                isDisabled={!navigationLinks.prev || isLoading}
                onClick={() => onSwitchPage(navigationLinks.prev)}
              >
                Previous
              </Button>
              <Button
                iconAfter={ChevronRightIcon}
                isDisabled={!navigationLinks.next || isLoading}
                onClick={() => onSwitchPage(navigationLinks.next)}
              >
                Next
              </Button>
            </ButtonGroup>
            <DropdownMenu
              trigger={String(countElementsOnPage)}
              shouldRenderToParent
            >
              <DropdownItemGroup>
                {countElementsOnPageOptions.map((option) => (
                  <DropdownItem
                    isSelected={true}
                    key={option}
                    onClick={() => setCountElementsOnPage(option)}
                  >
                    {option}
                  </DropdownItem>
                ))}
              </DropdownItemGroup>
            </DropdownMenu>
          </Inline>
        )}
      </Stack>
    </>
  );
};
