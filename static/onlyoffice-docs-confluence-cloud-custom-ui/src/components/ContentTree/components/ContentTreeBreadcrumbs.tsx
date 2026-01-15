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

import React, { ReactChild } from "react";

import Breadcrumbs, { BreadcrumbsItem } from "@atlaskit/breadcrumbs";
import HomeIcon from "@atlaskit/icon/core/home";

const contentTypeOptions = [
  { label: "Content", value: "content" },
  { label: "Blogs", value: "blogpost" },
];

type ContentTreeBreadcrumbsProps = {
  contentType: string | null;
  items: Array<{
    id: string;
    title: string;
    type: string;
  }>;
  getIconForItem: (item: {
    id: string;
    title: string;
    type: string;
  }) => ReactChild | undefined;
  onClickItem: (id: string | null) => void;
};

export const ContentTreeBreadcrumbs: React.FC<ContentTreeBreadcrumbsProps> = ({
  contentType,
  items,
  getIconForItem,
  onClickItem,
}) => {
  return (
    <Breadcrumbs>
      <BreadcrumbsItem
        text={
          contentTypeOptions.find((option) => option.value === contentType)
            ?.label || "Content"
        }
        iconBefore={<HomeIcon label="Home" />}
        onClick={() => onClickItem(null)}
      />
      {items.map((item) => (
        <BreadcrumbsItem
          key={item.id}
          text={item.title}
          iconBefore={getIconForItem(item)}
          onClick={() => onClickItem(item.id)}
        />
      ))}
    </Breadcrumbs>
  );
};
