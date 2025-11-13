import React, { useEffect, useState } from "react";

import { DocumentEditor } from "@onlyoffice/document-editor-react";
import Spinner from "@atlaskit/spinner";
import axios, { AxiosError } from "axios";
import { Box, Inline } from "@atlaskit/primitives";
import Image from '@atlaskit/image';

const containerStyles = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

export default function Editor({
  docApiUrl,
  editorConfig,
  editorUrl,
  pageId,
  localBaseUrl,
  locales
}) {
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(async() => {
    const locale = new Promise(function(resolve) {
      AP.user.getLocale(function(response) {
            resolve(response);
      });
    });

    const timeZone = new Promise(function(resolve) {
      AP.user.getTimeZone(function(response) {
          resolve(response);
      });
    });

    Promise.all([locale, timeZone]).then(values => {
      editorConfig.document.info.uploaded = new Date(editorConfig.document.info.uploaded)
        .toLocaleString(
          values[0].replace("_", "-"),
          {timeZone: values[1]}
        );
      editorConfig.editorConfig.lang = values[0].replace("_", "-");

      editorConfig.events = {
        "onRequestReferenceData": onRequestReferenceData,
        "onRequestOpen": onRequestOpen,
        "onRequestUsers": onRequestUsers
      }

      setLoading(false);
    });
  }, []);

  const onRequestReferenceData = function(event) {
    const docEditor = window.DocEditor.instances["onlyoffice-editor"];

    AP.context.getToken(async function(token) {
      const client = axios.create({ baseURL: localBaseUrl });
      client({
        method: "POST",
        url: `reference-data?pageId=${pageId}`,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${token}`
        },
        data: event.data,
        timeout: 10000,
      }).then((response) => {
        docEditor.setReferenceData(response.data);
      }).catch((e)=>{
        if (e instanceof AxiosError && e.status === 403) {
          docEditor.setReferenceData({error: locales["You are not permitted to perform this operation."]});
        } else if (e instanceof AxiosError && e.status === 404) {
          docEditor.setReferenceData({error: locales["Attachment File Not Found"]});
        } else {
          docEditor.setReferenceData({error: locales["Unknown error"]});
        }
      });
    });
  };

  const onRequestUsers = function(event) {
    const docEditor = window.DocEditor.instances["onlyoffice-editor"];

    switch (event.data.c) {
      case "info":
        AP.context.getToken(async function(token) {
          const client = axios.create({ baseURL: localBaseUrl });
          client({
            method: "POST",
            url: "users-info",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `JWT ${token}`
            },
            data: {ids: event.data.id},
            timeout: 10000,
          }).then((response) => {
            docEditor.setUsers({
              "c": event.data.c,
              "users": response.data.users,
            });
          }).catch((e)=>{
            console.error(e);
          });
        });
        break;
    }
  }

  const onRequestOpen = function(event) {
    const windowName = event.data.windowName;
    const attachmentId = event.data.referenceData.fileKey;

    window.open(editorUrl + attachmentId.substring(3), windowName);
  };

  const onLoadComponentError = function() {
    setApiError(true);
  }

  return(
    <div style={containerStyles}>
      {loading && (
        <Spinner size="xlarge" label="Loading" />
      )}
      {!loading && !apiError && (
        <DocumentEditor 
          id="onlyoffice-editor"
          documentServerUrl={docApiUrl}
          config={editorConfig}
          onLoadComponentError={onLoadComponentError}
        />
      )}
      {!loading && apiError && (
        <Box style={{width: "600px"}}>
          <Inline space="space.200" style={{width: "100%"}}>
            <Box style={{width: "100px"}}>
              <Image src="/image/error.svg"/>
            </Box>
            <Box>
              <h1 style={{fontSize: "32px"}}>Unavailable Document Server</h1>
              <p style={{fontWeight: "bold", fontSize: "18px", margin: "10px 0 0 0"}}>
                {locales["ONLYOFFICE cannot be reached. Please contact admin."]}
              </p>
            </Box>
          </Inline>
        </Box>
      )}
    </div>
  );
};
