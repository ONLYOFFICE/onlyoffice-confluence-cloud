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

import Button, { IconButton } from "@atlaskit/button/new";
import DropdownMenu, {
  DropdownItem,
  DropdownItemCheckbox,
  DropdownItemCheckboxGroup,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import AddIcon from "@atlaskit/icon/core/add";
import FilterIcon from "@atlaskit/icon/core/filter";
import SearchIcon from "@atlaskit/icon/core/search";
import { Box, Inline, xcss } from "@atlaskit/primitives";
import Textfield from "@atlaskit/textfield";

import { ReactComponent as CellIcon } from "../../../assets/images/cell.svg";
import { ReactComponent as PdfIcon } from "../../../assets/images/pdf.svg";
import { ReactComponent as SlideIcon } from "../../../assets/images/slide.svg";
import { ReactComponent as WordIcon } from "../../../assets/images/word.svg";

const styles = {
  searchIcon: xcss({
    paddingLeft: "space.075",
  }),
};

type ContentTreeToolbarProps = {
  isLoading: boolean;
  contentType: string | null;
  showFilter: boolean;
  customFilters?: [
    {
      id: string;
      label: string;
      value: boolean;
      onChange: (value: boolean) => void;
    },
  ];
  search: string;
  onChangeContentType: (selectedContentType: { value: string }) => void;
  onChangeSearch: (value: string) => void;
  onClickCreate?: (documentType: string) => void;
};

const contentTypeOptions = [
  { label: "Content", value: "content" },
  { label: "Blogs", value: "blogpost" },
];
const createTypeOptions = [
  { label: "Document", icon: <WordIcon />, value: "word" },
  { label: "Spreadsheet", icon: <CellIcon />, value: "cell" },
  { label: "Presentaion", icon: <SlideIcon />, value: "slide" },
  { label: "PDF form", icon: <PdfIcon />, value: "pdf" },
];

export const ContentTreeToolbar: React.FC<ContentTreeToolbarProps> = ({
  isLoading,
  contentType,
  showFilter,
  customFilters,
  search,
  onChangeContentType,
  onChangeSearch,
  onClickCreate,
}) => {
  return (
    <Inline space="space.100">
      {showFilter && (
        <DropdownMenu<HTMLButtonElement>
          trigger={({ triggerRef, ...props }) => (
            <Box xcss={xcss({ marginLeft: "space.075" })} ref={triggerRef}>
              <Box xcss={xcss({ marginLeft: "space.negative.075" })}>
                <IconButton
                  {...props}
                  label="Filter"
                  icon={FilterIcon}
                  isDisabled={isLoading}
                />
              </Box>
            </Box>
          )}
          shouldRenderToParent
        >
          <DropdownItemGroup>
            {contentTypeOptions.map((option) => (
              <DropdownItem
                key={option.value}
                isSelected={contentType === option.value}
                onClick={() => onChangeContentType(option)}
              >
                {option.label}
              </DropdownItem>
            ))}
          </DropdownItemGroup>
          {customFilters && customFilters.length > 0 && (
            <DropdownItemCheckboxGroup id="custom-filters">
              {customFilters.map((filter) => (
                <DropdownItemCheckbox
                  key={filter.id}
                  id={filter.id}
                  isSelected={filter.value}
                  onClick={() => filter.onChange(!filter.value)}
                >
                  {filter.label}
                </DropdownItemCheckbox>
              ))}
            </DropdownItemCheckboxGroup>
          )}
        </DropdownMenu>
      )}
      <Textfield
        placeholder="Search"
        value={search}
        isDisabled={isLoading}
        onChange={(event) =>
          onChangeSearch((event.target as HTMLInputElement).value)
        }
        className="small-input"
        elemBeforeInput={
          <Box xcss={styles.searchIcon}>
            <SearchIcon label="Search" />
          </Box>
        }
      />
      <DropdownMenu<HTMLButtonElement>
        trigger={({ triggerRef, ...props }) => (
          <Box xcss={xcss({ marginRight: "space.075" })} ref={triggerRef}>
            <Box xcss={xcss({ marginRight: "space.negative.075" })}>
              <Button
                {...props}
                isDisabled={!onClickCreate}
                iconBefore={AddIcon}
                appearance="primary"
              >
                Create
              </Button>
            </Box>
          </Box>
        )}
        shouldRenderToParent
      >
        <DropdownItemGroup>
          {createTypeOptions.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => onClickCreate?.(option.value)}
            >
              <Inline space="space.100" alignBlock="center">
                {option.icon}
                <Box>{option.label}</Box>
              </Inline>
            </DropdownItem>
          ))}
        </DropdownItemGroup>
      </DropdownMenu>
    </Inline>
  );
};
