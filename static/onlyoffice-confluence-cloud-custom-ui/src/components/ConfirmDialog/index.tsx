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

import Button from "@atlaskit/button/new";
import Modal, {
  Appearance,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";

export type ConfirmDialogProps = {
  title: string;
  description: string;
  appearance?: Appearance;
  isLoading?: boolean;
  buttons: {
    submit: {
      title: string;
      onClick: () => void;
    };
    cancel: {
      title: string;
      onClick: () => void;
    };
  };
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  description,
  appearance,
  isLoading = false,
  buttons,
}) => {
  console.log(isLoading);

  return (
    <ModalTransition>
      <Modal>
        <ModalHeader hasCloseButton>
          <ModalTitle appearance={appearance}>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody>{description}</ModalBody>
        <ModalFooter>
          <Button
            appearance={appearance || "primary"}
            isLoading={isLoading}
            onClick={buttons.submit.onClick}
          >
            {buttons.submit.title}
          </Button>
          <Button
            appearance="subtle"
            isDisabled={isLoading}
            onClick={buttons.cancel.onClick}
          >
            {buttons.cancel.title}
          </Button>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
};
