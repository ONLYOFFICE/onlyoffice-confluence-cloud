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

import EmptyState from "@atlaskit/empty-state";

import EmptyListIcon from "../../../assets/images/empty-list.svg";
import EmptySearchIcon from "../../../assets/images/empty-search.svg";

type ContentTreeEmptyStateProps = {
  isSearchActive: boolean;
};

export const ContentTreeEmptyState: React.FC<ContentTreeEmptyStateProps> = ({
  isSearchActive,
}) => {
  if (isSearchActive) {
    return (
      <EmptyState
        header="Nothing found"
        description="We couldn’t find any content with that title"
        imageUrl={EmptySearchIcon}
      />
    );
  }

  return (
    <EmptyState
      header="No docs here yet"
      description="Create a new document by clicking Create button"
      imageUrl={EmptyListIcon}
    />
  );
};
