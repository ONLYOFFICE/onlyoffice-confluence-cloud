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

export interface User {
  accountId: string;
  displayName: string;
}

export interface RemoteSettings {
  demoAvailable: boolean;
  demoStart: number;
  demoEnd: number;
}

export interface Attachment {
  filename: string;
  id: string;
  size: number;
  author: User;
  created: string;
}

export interface RemoteAppAuthorization {
  token: string;
  remoteAppUrl: string;
}

export interface Format {
  name: string;
  type: string;
  actions: string[];
  convert: string[];
  mime: string[];
}

export class ClientError extends Error {
  status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ClientError";
    this.status = status;
  }
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}
