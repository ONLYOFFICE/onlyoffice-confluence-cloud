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

import React, { useContext } from "react";

import { ButtonGroup } from "@atlaskit/button";
import Button from "@atlaskit/button/new";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import ChevronDownIcon from "@atlaskit/icon/core/chevron-down";
import ChevronLeftIcon from "@atlaskit/icon/core/chevron-left";
import ChevronRightIcon from "@atlaskit/icon/core/chevron-right";
import { Box, Inline } from "@atlaskit/primitives";

import { AppContext } from "../../../context/AppContext";

export const COUNT_ELEMENTS_ON_PAGE_OPTIONS = [25, 50, 100] as const;
export type CountElementsOnPage =
  (typeof COUNT_ELEMENTS_ON_PAGE_OPTIONS)[number];

type ContentTreePaginationProps = {
  isLoading: boolean;
  countElementsOnPage?: CountElementsOnPage;
  prevLink: string | null;
  nextLink: string | null;
  onChangePage: (url: string | null) => void;
  onChangeCountElementsOnPage: (count: CountElementsOnPage) => void;
};

export const ContentTreePagination: React.FC<ContentTreePaginationProps> = ({
  isLoading,
  countElementsOnPage,
  prevLink,
  nextLink,
  onChangePage,
  onChangeCountElementsOnPage,
}) => {
  const { t } = useContext(AppContext);

  return (
    <Inline spread="space-between">
      <Box>
        {(prevLink || nextLink) && (
          <ButtonGroup>
            <Button
              iconBefore={ChevronLeftIcon}
              isDisabled={!prevLink || isLoading}
              onClick={() => onChangePage(prevLink)}
            >
              {t("buttons.previous.title")}
            </Button>
            <Button
              iconAfter={ChevronRightIcon}
              isDisabled={!nextLink || isLoading}
              onClick={() => onChangePage(nextLink)}
            >
              {t("buttons.next.title")}
            </Button>
          </ButtonGroup>
        )}
      </Box>
      {countElementsOnPage && (
        <DropdownMenu<HTMLButtonElement>
          trigger={({ triggerRef, ...props }) => (
            <Button
              {...props}
              ref={triggerRef}
              iconAfter={(iconProps) => (
                <ChevronDownIcon {...iconProps} size="small" />
              )}
              isDisabled={isLoading}
            >
              {countElementsOnPage}
            </Button>
          )}
          shouldRenderToParent
        >
          <DropdownItemGroup>
            {COUNT_ELEMENTS_ON_PAGE_OPTIONS.map((option) => (
              <DropdownItem
                isSelected={option === countElementsOnPage}
                key={option}
                onClick={() => onChangeCountElementsOnPage(option)}
              >
                {option}
              </DropdownItem>
            ))}
          </DropdownItemGroup>
        </DropdownMenu>
      )}
    </Inline>
  );
};
