/*
* (c) Copyright Ascensio System SIA 2024
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
*/

import React from "react";

import { Inline, Stack, Box, xcss, Text } from "@atlaskit/primitives";
import { token } from "@atlaskit/tokens";
import Image from "@atlaskit/image";

export default function OnlyofficeCreateTypes({
  creatableTypes,
  locales,
  value,
  onChange,
  isDisabled = false
}) {
  const boxStyles = xcss({
    width: "100%",
    textAlign: "center",
    borderRadius: "3px",
    backgroundColor: token("color.background.neutral"),
    ":hover": isDisabled ? {} : {
      backgroundColor: token("color.background.neutral.hovered"),
    },
    opacity: isDisabled ? "50%" : ""
  });

  const labelStyle = {
    display: "block",
    cursor: isDisabled ? "not-allowed" : "pointer",
    padding: "8px 0"
  };

  const imageStyle = {
    display: "block",
    margin: "auto"
  }

  return (
    <Stack>
      <Inline space="space.100">
        {creatableTypes.map((type) => (
          <Box key={type} xcss={boxStyles}
            style={
              type === value ? { backgroundColor: token("color.background.neutral.hovered") } : {}
            }
          >
            <input
              id={type}
              name="type"
              type="radio"
              style={{display: "none"}}
              value={type}
              onChange={onChange}
              disabled={isDisabled} 
            />
            <label htmlFor={type} style={labelStyle}>
              <Image src={`/image/new-${type}.svg`} style={imageStyle} />
              <Text>{locales[`creation.label.${type}`]}</Text>
            </label>
          </Box>
        ))}
      </Inline>
    </Stack>
  );
};
