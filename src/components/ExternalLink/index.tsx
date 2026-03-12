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

import React from "react";

import { Icon, Inline, Link, Text } from "@forge/react";

export type ExternalLinkProps = {
  url: string;
  label: string;
};

const ExternalLink = ({ url, label }: ExternalLinkProps) => {
  return (
    <Link href={url} openNewTab={true}>
      <Inline alignBlock="center" alignInline="center">
        <Text>{label}</Text>
        <Icon glyph="arrow-up-right" label={label} size="small" />
      </Inline>
    </Link>
  );
};

export default ExternalLink;
