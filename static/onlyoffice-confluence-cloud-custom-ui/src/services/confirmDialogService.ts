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

import { ConfirmDialogProps } from "../components/ConfirmDialog";

type ConfirmDialogListener = (props: ConfirmDialogProps | undefined) => void;

class ConfirmDialogService {
  private listener: ConfirmDialogListener | null = null;
  private currentProps: ConfirmDialogProps | undefined = undefined;

  register(listener: ConfirmDialogListener, props?: ConfirmDialogProps) {
    this.listener = listener;
    this.currentProps = props;
  }

  unregister() {
    this.listener = null;
  }

  show(props: ConfirmDialogProps) {
    this.currentProps = props;
    if (this.listener) {
      this.listener(props);
    } else {
      console.warn("ConfirmDialog service not initialized");
    }
  }

  setLoading(isLoading: boolean) {
    if (this.currentProps && this.listener) {
      this.currentProps = { ...this.currentProps, isLoading };
      this.listener(this.currentProps);
    }
  }

  close() {
    this.currentProps = undefined;
    if (this.listener) {
      this.listener(undefined);
    }
  }
}

export const confirmDialogService = new ConfirmDialogService();
