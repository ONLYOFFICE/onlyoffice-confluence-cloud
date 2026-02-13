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

import React, { useEffect, useState, useRef, useContext } from "react";

import { Flex, xcss } from "@atlaskit/primitives";
import Spinner from "@atlaskit/spinner";
import { invokeRemote, router, view } from "@forge/bridge";
import { FullContext } from "@forge/bridge/out/types";

import NotFoundIcon from "../../assets/images/not-found.svg";
import { AppContext } from "../../context/AppContext";

const styles = {
  mainContainer: xcss({
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    margin: "0",
    padding: "0",
    justifyContent: "center",
    alignItems: "center",
  }),
  iframe: {
    width: "100%",
    height: "100%",
    border: "unset",
  },
};

export type EditorPageProps = {
  context: FullContext;
};

const EditorPage: React.FC<EditorPageProps> = ({ context }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const remoteAppUrl = useRef<string | null>(null);
  const [token, setToken] = useState<string>();

  const location = new URL(context.extension.location);
  const parentId = location.searchParams.get("parentId");
  const attachmentId = location.searchParams.get("attachmentId");
  const mode = location.searchParams.get("mode") || "EDIT";

  const { t, setAppError } = useContext(AppContext);

  const sendMessageToIframe = (
    name: string,
    data: object | undefined | null,
  ) => {
    if (
      remoteAppUrl.current &&
      iframeRef.current &&
      iframeRef.current.contentWindow
    ) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: name,
          data: data,
        },
        remoteAppUrl.current,
      );
    }
  };

  useEffect(() => {
    if (token) {
      invokeRemote({
        method: "GET",
        path: `/editor/confluence?mode=${mode}&token=${token}&format=json`,
      }).catch((error) => {
        console.error("Error fetching data:", error);

        setAppError({
          title: t("error-state.not-found.title"),
          description: t("error-state.not-found.description"),
          imageUrl: NotFoundIcon,
        });
      });
    }
  }, [token]);

  useEffect(() => {
    let sessionTimeout: ReturnType<typeof setTimeout>;

    const scheduleReauthorization = (sessionExpires: number) => {
      const targetTime = new Date(sessionExpires);
      const now = new Date();
      targetTime.setSeconds(targetTime.getSeconds() - 10);

      const delay = targetTime.getTime() - now.getTime();

      if (delay > 0) {
        sessionTimeout = setTimeout(() => {
          invokeRemote({
            method: "POST",
            path: "/api/v1/remote/authorization",
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              parentId: parentId,
              entityId: attachmentId,
            },
          })
            .then((response) => {
              if (response) {
                sendMessageToIframe("REFRESH_SESSION", {
                  sessionExpires: response.body.sessionExpires,
                });
                scheduleReauthorization(response.body.sessionExpires);
              }
            })
            .catch((error) => {
              console.error("Error reauthorizing session:", error);
            });
        }, delay);
      }
    };

    invokeRemote({
      method: "POST",
      path: "/api/v1/remote/authorization",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        parentId: parentId,
        entityId: attachmentId,
      },
    })
      .then((response) => {
        if (response) {
          setToken(response.body.token);
          remoteAppUrl.current = response.body.remoteAppUrl;
          scheduleReauthorization(response.body.sessionExpires);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);

        setAppError({
          title: t("error-state.common.title"),
          description: t("error-state.common.description"),
        });
      });

    return () => {
      clearTimeout(sessionTimeout);
    };
  }, []);

  const onRequestOpen = (data: object) => {
    const { referenceData } = data as { referenceData: { fileKey: string } };

    const editorUrl = new URL(location);
    editorUrl.searchParams.set("attachmentId", referenceData.fileKey);

    router.open(editorUrl.toString());
  };

  const onRequestUsers = (c: string, ids: string[]) => {
    const users = ids.map((id) => ({
      id: id,
      image: `${context.siteUrl}/wiki/aa-avatar/${id}`,
    }));

    sendMessageToIframe("SET_USERS", {
      c: c,
      users: users,
    });
  };

  const onRequestReferenceData = (data: object) => {
    invokeRemote({
      method: "POST",
      path: `/api/v1/remote/reference-data?parentId=${parentId}`,
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    })
      .then((response) => {
        if (response) {
          sendMessageToIframe("SET_REFERENCE_DATA", response.body);
        }
      })
      .catch(() => {
        sendMessageToIframe("SET_REFERENCE_DATA", {
          error: t("notifications.attachment-not-found"),
        });
      });
  };

  useEffect(() => {
    if (remoteAppUrl.current) {
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== remoteAppUrl.current) return;

        const { type, data } = event.data;

        if (type === "DOCS_API_UNDEFINED") {
          setAppError({
            title: t("error-state.docs-api-undefined.title"),
            description: t("error-state.docs-api-undefined.description"),
          });
        }

        if (type === "PAGE_IS_LOADED") {
          view.changeWindowTitle(`${data.config.document.title} - ONLYOFFICE`);
          setLoading(false);
        }

        if (type === "DOCUMENT_READY") {
          const { demo } = data;

          if (demo) {
            sendMessageToIframe("SHOW_MESSAGE", {
              message: t("page.editor.messages.you-using-demo-server"),
            });
          }
        }

        if (type === "REQUEST_OPEN") {
          onRequestOpen(data);
        }

        if (type === "REQUEST_CLOSE") {
          const { url } = data;

          router.open(url);
        }

        if (type === "REQUEST_USERS") {
          const { c, ids } = data;

          onRequestUsers(c, ids);
        }

        if (type === "REQUEST_REFERENCE_DATA") {
          onRequestReferenceData(data);
        }
      };

      window.addEventListener("message", handleMessage);

      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }
  }, [remoteAppUrl.current]);

  return (
    <Flex xcss={styles.mainContainer}>
      {loading && <Spinner size="xlarge" label={t("labels.loading")} />}
      {token && remoteAppUrl.current && (
        <iframe
          ref={iframeRef}
          style={{
            ...styles.iframe,
            display: loading ? "none" : "block",
          }}
          src={`${remoteAppUrl.current}/editor/confluence?mode=${mode}&token=${token}`}
        />
      )}
    </Flex>
  );
};

export default EditorPage;
