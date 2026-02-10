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

import { IconButton } from "@atlaskit/button/new";
import Form, { Field } from "@atlaskit/form";
import CheckMarkIcon from "@atlaskit/icon/core/check-mark";
import CrossIcon from "@atlaskit/icon/core/cross";
import { Box, Inline, xcss } from "@atlaskit/primitives";
import Textfield from "@atlaskit/textfield";
import { i18n, invoke, showFlag } from "@forge/bridge";

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

type FormData = {
  title: string;
};

type CreateAttachmentResponse = {
  id: string;
  filename: string;
};

export const buildCreateRow = (
  parentId: string,
  documentType: string,
  locale: string,
  isLoading: boolean,
  onSuccess: (attachmentId: string) => void,
  onCancel: () => void,
  setLoading: (value: boolean) => void,
  t: i18n.TranslationFunction,
) => {
  const onSubmit = (data: FormData) => {
    const { title } = data;
    setLoading(true);

    return invoke<CreateAttachmentResponse>("createAttachment", {
      parentId,
      title,
      type: documentType,
      locale,
    })
      .then((response: CreateAttachmentResponse) => {
        showFlag({
          id: "create-attachment-success",
          title: t("notifications.attachment-created").replace(
            "{filename}",
            response.filename,
          ),
          type: "success",
          appearance: "success",
          isAutoDismiss: true,
        });

        onSuccess(response.id);
      })
      .catch((error) => {
        console.error("Error creating attachment:", error);

        showFlag({
          id: "create-attachment-error",
          title: t("notifications.attachment-create-failed"),
          type: "error",
          appearance: "error",
          isAutoDismiss: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    key: "create",
    cells: [
      {
        key: "title",
        content: (
          <Box paddingInlineStart="space.100">
            <Form<FormData> noValidate onSubmit={onSubmit}>
              {({ formProps }) => (
                <form {...formProps} name="create">
                  <Inline space="space.075" alignBlock="center">
                    <Box xcss={styles.iconContainer}>
                      {getIconForDocumentType(documentType)}
                    </Box>
                    <Box xcss={styles.formFieldWraper}>
                      <Field
                        name="title"
                        defaultValue=""
                        isRequired
                        validate={(value) => {
                          if (!value) {
                            return t("validation.title-required");
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
                      label={t("buttons.create.title")}
                      icon={CheckMarkIcon}
                      isDisabled={isLoading}
                    />
                    <IconButton
                      label={t("buttons.create.cancel")}
                      icon={CrossIcon}
                      isDisabled={isLoading}
                      onClick={onCancel}
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
        content: "",
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
