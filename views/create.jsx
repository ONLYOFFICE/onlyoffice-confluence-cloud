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

import React, { useState } from "react";

import Button from "@atlaskit/button/new";
import { Field } from "@atlaskit/form";
import Textfield from "@atlaskit/textfield";
import SectionMessage from "@atlaskit/section-message";
import { Box } from "@atlaskit/primitives";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition
} from "@atlaskit/modal-dialog";

import OnlyofficeCreateTypes from "./component/OnlyofficeCreateTypes";

import axios, { AxiosError } from "axios";

export default function Create({
  pageId,
  creatableTypes,
  locales,
  localBaseUrl
}) {
  const [title, setTitle] = useState("New Document");
  const [type, setType] = useState(null);
  const [creating, setCreating] = useState(false);
  const [creatingError, setCreatingError] = useState(null);

  const onSubmit = (event) => {
    event.preventDefault();
    setCreating(true);
    setCreatingError(null);

    const locale = new Promise(function(resolve) {
      AP.user.getLocale(function(response) {
          resolve(response);
      });
    });

    const token = new Promise(function(resolve) {
      AP.context.getToken(function(response) {
          resolve(response);
      });
    });

      Promise.all([locale, token]).then(async (values) => {
        const client = axios.create({ baseURL: localBaseUrl });
        const response = await client({
          method: "POST",
          url: `/create/${pageId}`,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `JWT ${values[1]}`
          },
          data: {
            title: title,
            type: type,
            locale: values[0]
          },
          timeout: 15000,
        });

        // eslint-disable-next-line no-undef
        const openEditor = document.getElementById("openEditor");
        openEditor.href = response.data.editorUrl;
        openEditor.click();

        AP.navigator.reload();
      }).catch((e) => {
        const creatingError = {
          title: locales["creating.error.message"]
        }

        if (e instanceof AxiosError && e.status === 400) {
          const alreadyExistMessage = "Cannot add a new attachment with same file name as an existing attachment: ";
          const message = e.response.data.message;
          const position = message.search(alreadyExistMessage);

          if (position !== -1) {
            const fileName = message.slice(position + alreadyExistMessage.length);

            creatingError.message = locales["creating.error.already-exist.message"];
            creatingError.fileName = fileName;
          }
        }

        setCreatingError(creatingError);
      }).finally(()=> {
        setCreating(false);
      });
  };

  const onClose = () => {
    AP.dialog.close();
  }

  return (
    <ModalTransition>
      <Modal width="medium" isBlanketHidden={true} autoFocus={true}>
        <form onSubmit={onSubmit}>
            <ModalHeader>
                <ModalTitle>{locales["creation.header"]}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              {creatingError && (
                <SectionMessage
                  title={creatingError.title}
                  appearance="error"
                >
                  {creatingError.message && creatingError.fileName && (
                    <p>{creatingError.message}: <b>{creatingError.fileName}</b></p>
                  )}
                </SectionMessage>
              )}
              <Field
                label={locales["creation.label.title"]}
                name="title"
                defaultValue={locales["creation.title.placeholder"]}
                isRequired={true}
                isDisabled={creating}
              >
                {({ fieldProps }) =>
                  <Textfield
                    autoComplete="off"
                    {...fieldProps}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                }
              </Field>
              <Box style={{marginBlockStart: "8px"}}>
                <OnlyofficeCreateTypes
                  creatableTypes={creatableTypes}
                  locales={locales}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  isDisabled={creating}
                />
              </Box>
            </ModalBody>
            <ModalFooter>
                <Button appearance="subtle" onClick={onClose} isDisabled={creating}>
                  {locales["label.cancel"]}
                </Button>
                <Button
                  appearance="primary"
                  type="submit"
                  isDisabled={type == null || title.length === 0}
                  isLoading={creating}
                >
                  {locales["label.create"]}
                </Button>
            </ModalFooter>
        </form>
        <a id="openEditor" target="_blank" style={{dislpay: "hidden"}}></a>
      </Modal>
    </ModalTransition>
  );
}
