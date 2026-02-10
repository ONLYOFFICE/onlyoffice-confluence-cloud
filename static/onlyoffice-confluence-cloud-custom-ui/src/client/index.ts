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

import { requestConfluence } from "@forge/bridge";

import { ClientError, Content, SearchResponse } from "../../src/types/types";

export const getContentInSpace = async (
  id: string,
  type: "page" | "blogpost",
  depth: "all" | "root",
  title: string | null,
  limit: number,
  sort: string | null,
): Promise<SearchResponse<Content>> => {
  return await _executeRequest<SearchResponse<Content>>(
    async () => {
      const searchParams = [`depth=${depth}`, `limit=${limit}`];

      if (title) {
        searchParams.push(`title=${title}`);
      }

      if (sort) {
        searchParams.push(`sort=${sort}`);
      }

      return await requestConfluence(
        `/wiki/api/v2/spaces/${id}/${type}s?${searchParams.join("&")}`,
      );
    },
    async (response: Response) => {
      const data = await response.json();
      return {
        ...data,
        results: data.results.map((item: Content) => ({
          ...item,
          type,
        })),
      };
    },
  );
};

export const findContentById = async (
  id: string,
  section: "content" | "blogs",
): Promise<SearchResponse<Content>> => {
  return await _executeRequest<SearchResponse<Content>>(
    async () => {
      let cql = `content=${id}`;

      if (section === "content") {
        cql = cql.concat(
          " and type IN (page, attachment, whiteboard, database, embed, folder)",
        );
      } else {
        cql = cql.concat(" and type IN (blogpost, attachment)");
      }

      return await requestConfluence(
        `/wiki/rest/api/content/search?cql=${cql}&expand=operations,version,ancestors`,
      );
    },
    async (response: Response) => {
      return await response.json();
    },
  );
};

export const findContent = async (
  spaceKey: string,
  parentId: string,
  title: string,
  showOnlyFiles: boolean,
  limit: number,
  sort: { key: string; order: "ASC" | "DESC" },
): Promise<SearchResponse<Content>> => {
  return await _executeRequest<SearchResponse<Content>>(
    async () => {
      let cql = [
        `space="${spaceKey}"`,
        `(parent=${parentId} or container=${parentId})`,
        `title~"${title}*"`,
      ].join(" and ");

      if (showOnlyFiles) {
        cql = cql.concat(" and type=attachment");
      } else {
        cql = cql.concat(
          " and type IN (page, blogpost, attachment, whiteboard, database, embed, folder)",
        );
      }

      cql = cql.concat(` order by type DESC, ${sort.key} ${sort.order}`);

      return await requestConfluence(
        `/wiki/rest/api/content/search?cql=${cql}&expand=operations,version,ancestors&limit=${limit}`,
      );
    },
    async (response: Response) => {
      return await response.json();
    },
  );
};

export const findContentByLink = async (
  link: string,
): Promise<SearchResponse<Content>> => {
  return await _executeRequest<SearchResponse<Content>>(
    async () => {
      return await requestConfluence(`/wiki${link}`);
    },
    async (response: Response) => {
      const data = await response.json();

      return data;
    },
  );
};

export const deleteAttachment = async (id: string): Promise<void> => {
  return await _executeRequest<void>(
    async () => {
      return await requestConfluence(`/wiki/api/v2/attachments/${id}`, {
        method: "DELETE",
      });
    },
    async (response: Response) => {
      await response;
    },
  );
};

async function _executeRequest<T>(
  onRequest: () => Promise<Response>,
  onResponse: (response: Response) => T | Promise<T>,
) {
  const response = await onRequest();

  if (response.ok || response.status === 303) {
    return await onResponse(response);
  }

  throw new ClientError(
    `Request failed with status ${response.status}: ${response.statusText}`,
    response.status,
  );
}
