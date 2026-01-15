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

import { IconButton } from "@atlaskit/button/new";
import Form, { Field } from "@atlaskit/form";
import CheckMarkIcon from "@atlaskit/icon/core/check-mark";
import CrossIcon from "@atlaskit/icon/core/cross";
import { Box, Inline, xcss } from "@atlaskit/primitives";
import Textfield from "@atlaskit/textfield";
import VisuallyHidden from "@atlaskit/visually-hidden";

import { getIconForDocumentType } from "./iconUtils";

const styles = {
  iconContainer: xcss({
    display: "flex",
    alignItems: "center",
  }),
  formFieldWraper: xcss({
    marginBlockStart: "space.negative.100",
  }),
};

export const buildCreateRow = (
  documentType: string,
  isLoading: boolean,
  onCancelCreate: () => void,
) => {
  return {
    key: "create",
    cells: [
      {
        key: "title",
        content: (
          <Box>
            <Form<{ documentType: string; title: string }>
              noValidate
              onSubmit={(data) => {
                console.log(data);
              }}
            >
              {({ formProps }) => (
                <form {...formProps} name="create">
                  <Inline space="space.075" alignBlock="center">
                    <Box xcss={styles.iconContainer}>
                      {getIconForDocumentType(documentType)}
                    </Box>
                    <Box xcss={styles.formFieldWraper}>
                      <VisuallyHidden>
                        <Field
                          name="documentType"
                          defaultValue={documentType}
                        />
                      </VisuallyHidden>
                      <Field
                        name="title"
                        defaultValue=""
                        isRequired
                        validate={(value) => {
                          if (!value) {
                            return "A key is required";
                          }
                        }}
                      >
                        {({ fieldProps }) => {
                          return (
                            <Textfield
                              className="small-input"
                              {...fieldProps}
                            />
                          );
                        }}
                      </Field>
                    </Box>
                    <IconButton
                      type="submit"
                      label="Accept"
                      icon={CheckMarkIcon}
                      isDisabled={isLoading}
                    />
                    <IconButton
                      label="Cross"
                      icon={CrossIcon}
                      isDisabled={isLoading}
                      onClick={onCancelCreate}
                    />
                  </Inline>
                </form>
              )}
            </Form>
          </Box>
        ),
      },
      {
        key: "fileSize",
        content: documentType,
      },
      {
        key: "lastmodified",
        content: "",
      },
      {
        key: "actions",
        content: "",
      },
    ],
  };
};
