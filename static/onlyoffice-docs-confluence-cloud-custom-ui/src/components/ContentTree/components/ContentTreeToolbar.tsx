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
import { AppContext } from "../../../context/AppContext";

export const SECTIONS = ["content", "blogs"] as const;
export type Section = (typeof SECTIONS)[number];

const styles = {
  searchIcon: xcss({
    paddingLeft: "space.075",
  }),
};

type ContentTreeToolbarProps = {
  isLoading: boolean;
  section: Section;
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
  onChangeSection: (value: Section) => void;
  onChangeSearch: (value: string) => void;
  onClickCreate?: (documentType: string) => void;
};

const createTypeOptions = [
  { icon: <WordIcon />, value: "word" },
  { icon: <CellIcon />, value: "cell" },
  { icon: <SlideIcon />, value: "slide" },
  { icon: <PdfIcon />, value: "pdf" },
];

const SEARCH_DEBOUNCE_MS = 1000;

export const ContentTreeToolbar: React.FC<ContentTreeToolbarProps> = ({
  section,
  search,
  showFilter,
  customFilters,
  isLoading,
  onChangeSection,
  onChangeSearch,
  onClickCreate,
}) => {
  const [localSearch, setLocalSearch] = useState(search);

  const { t } = useContext(AppContext);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    if (localSearch === "") {
      onChangeSearch(localSearch);
      return;
    }

    const timer = setTimeout(() => {
      onChangeSearch(localSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [localSearch, onChangeSearch]);

  return (
    <Inline space="space.100">
      {showFilter && (
        <DropdownMenu<HTMLButtonElement>
          trigger={({ triggerRef, ...props }) => (
            <Box xcss={xcss({ marginLeft: "space.075" })} ref={triggerRef}>
              <Box xcss={xcss({ marginLeft: "space.negative.075" })}>
                <IconButton
                  {...props}
                  label={t("buttons.filter.title")}
                  icon={FilterIcon}
                  isDisabled={isLoading}
                />
              </Box>
            </Box>
          )}
          shouldRenderToParent
        >
          <DropdownItemGroup>
            {SECTIONS.map((value) => (
              <DropdownItem
                key={value}
                isSelected={section === value}
                onClick={() => onChangeSection(value)}
              >
                {t("component.content-tree.section." + value)}
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
        placeholder={t("labels.search")}
        value={localSearch}
        isDisabled={isLoading}
        onChange={(event) =>
          setLocalSearch((event.target as HTMLInputElement).value)
        }
        className="small-input"
        elemBeforeInput={
          <Box xcss={styles.searchIcon}>
            <SearchIcon label={t("labels.search")} />
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
                {t("buttons.create.title")}
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
                <Box>{t("document-type." + option.value)}</Box>
              </Inline>
            </DropdownItem>
          ))}
        </DropdownItemGroup>
      </DropdownMenu>
    </Inline>
  );
};
