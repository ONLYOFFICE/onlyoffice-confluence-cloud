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

import Heading from "@atlaskit/heading";
import {
  FullScreenModalDialog,
  ModalBody,
  ModalHeader,
  ModalTitle,
} from "@atlaskit/modal-dialog/full-screen";
import { Box, Stack, Text, xcss } from "@atlaskit/primitives";
import { view } from "@forge/bridge";
import { FullContext } from "@forge/bridge";

import { ContentTree } from "../../components/ContentTree";

const styles = {
  pageBodyContainer: xcss({
    paddingBottom: "space.500",
  }),
  modalBodyContainer: xcss({
    paddingBottom: "space.300",
  }),
};

export type MainPageProps = {
  context: FullContext;
};

const MainPage: React.FC<MainPageProps> = ({ context }) => {
  const type = context.extension.type;
  const space = context.extension.space;
  const parentId = context.extension.content?.id || null;
  const contentType = context.extension.content?.type || null;
  const locale = context.locale;

  const onClose = () => {
    view.close();
  };

  const getContainer = (type: string, children: React.ReactNode) => {
    switch (type) {
      case "confluence:spacePage":
        return (
          <Stack space="space.300">
            <Stack space="space.050">
              <Heading size="medium">Welcome to ONLYOFFICE!</Heading>
              <Text>
                Create and open attachments from your space. All files from
                Content and Blogs will appear here. To create a new file, click
                to any page and press Create button.
              </Text>
            </Stack>
            <Box xcss={styles.pageBodyContainer}>{children}</Box>
          </Stack>
        );
      case "confluence:contentAction":
        return (
          <FullScreenModalDialog onClose={onClose}>
            <ModalHeader hasCloseButton>
              <ModalTitle>ONLYOFFICE Docs</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Box xcss={styles.modalBodyContainer}>{children}</Box>
            </ModalBody>
          </FullScreenModalDialog>
        );
    }
  };

  return getContainer(
    type,
    <ContentTree
      space={space}
      parentId={parentId}
      contentType={contentType}
      locale={locale}
      showBreadcrumbs={type === "confluence:spacePage"}
      showFilter={type === "confluence:spacePage"}
    />,
  );
};

export default MainPage;
