/*
* (c) Copyright Ascensio System SIA 2023
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

import axios from "axios";

export function getAppProperty(httpClient, propertyKey) {
    return new Promise((resolve, reject) => {
        httpClient.get({
            url: `/rest/atlassian-connect/1/addons/onlyoffice-confluence-cloud/properties/${encodeURIComponent(
                propertyKey
            )}`,
            json: true
        }, function(err, response, body) {
            if (response.statusCode == 200 || response.statusCode == 404) {
                if (body.value === undefined || body.value == "") {
                    resolve(null);
                }

                resolve(body.value);
            } else {
                reject({
                    method: "getAppProperty",
                    code: response.statusCode,
                    type: response.statusMessage,
                    message: `Error getting app property: ${propertyKey}`,
                    description: body.message ? body.message : body
                });
            }
        });
    });
}

export function setAppProperty(httpClient, propertyKey, value) {
    return new Promise((resolve, reject) => {
        httpClient.put({
            url: `/rest/atlassian-connect/1/addons/onlyoffice-confluence-cloud/properties/${encodeURIComponent(
                propertyKey
            )}`,
            json: value
        }, function(err, response, body) {
            if (response.statusCode == 200) {
                resolve(true);
            } else {
                reject({
                    method: "setAppProperty",
                    code: response.statusCode,
                    type: response.statusMessage,
                    message: `Error setting app property: ${propertyKey}`,
                    description: body.message ? body.message : body
                });
            }
        });
    });
}

export function getAttachmentInfo(httpClient, userAccountId, attachmentId) {
    return new Promise((resolve, reject) => {
        if (userAccountId) {
            httpClient = httpClient.asUserByAccountId(userAccountId);
        }

        httpClient.get({
            url: `/api/v2/attachments/${encodeURIComponent(
                attachmentId
            )}`,
            json: true
        }, function(err, response, body) {
            if (response.statusCode == 200) {
                resolve(body);
            } else {
                reject({
                    method: "getAttachmentInfo",
                    code: response.statusCode,
                    type: response.statusMessage,
                    message: "Error getting attachment information.",
                    description: body.message ? body.message : body
                });
            }
        });
    });
}

export function getAttachmentsOnPage(httpClient, userAccountId, pageId, fileName) {
    return new Promise((resolve, reject) => {
        if (userAccountId) {
            httpClient = httpClient.asUserByAccountId(userAccountId);
        }

        httpClient.get({
            url: `/api/v2/pages/${encodeURIComponent(
                pageId
            )}/attachments?filename=${encodeURIComponent(fileName)}`,
            json: true
        }, function(err, response, body) {
            if (response.statusCode == 200) {
                resolve(body.results);
            } else {
                reject({
                    method: "getAttachmentsOnPage",
                    code: response.statusCode,
                    type: response.statusMessage,
                    message: "Error getting attachments on page.",
                    description: body.message ? body.message : body
                });
            }
        });
    });
}

export function getUserInfo(httpClient, userAccountId) {
    return new Promise((resolve, reject) => {
        let url = userAccountId ? `/rest/api/user?accountId=${encodeURIComponent(userAccountId)}` : `/rest/api/user/anonymous`

        httpClient.get({
            url: url,
            json: true
        }, function(err, response, body) {
            if (response.statusCode == 200) {
                resolve(body);
            } else {
                reject({
                    method: "getUserInfo",
                    code: response.statusCode,
                    type: response.statusMessage,
                    message: "Error getting user information.",
                    description: body.message ? body.message : body
                });
            }
        })
    });
}

export function updateContent(httpClient, userAccountId, pageId, attachmentId, fileData) {
    return new Promise((resolve, reject) => {
        httpClient.asUserByAccountId(userAccountId).post({
            headers: {
                "X-Atlassian-Token": "no-check",
                "Accept": "application/json"
            },
            multipartFormData: {
                file: [fileData],
            },
            url: `/rest/api/content/${encodeURIComponent(
                pageId
            )}/child/attachment/${encodeURIComponent(
                attachmentId
            )}/data`
        }, function(err, response, body) {
            if (response.statusCode == 200) {
                resolve(body);
            } else {
                reject({
                    method: "updateContent",
                    code: response.statusCode,
                    type: response.statusMessage,
                    message: body.message ? body.message : body,
                });
            }
        });
    });
}

export function getUriDownloadAttachment(httpClient, userAccountId, pageId, attachmentId) {
    return new Promise((resolve, reject) => {
        if (userAccountId) {
            httpClient = httpClient.asUserByAccountId(userAccountId);
        }

        httpClient.get({
            url: `/rest/api/content/${encodeURIComponent(
                pageId
            )}/child/attachment/${encodeURIComponent(
                attachmentId
            )}/download`
        }, function(err, response, body) {
            if (response.statusCode == 200) {
                resolve(response.request.uri.href);
            } else {
                reject({
                    method: "getUriDownloadAttachment",
                    code: response.statusCode,
                    type: response.statusMessage,
                    message: body.message ? body.message : body,
                });
            }
        });
    });
}

export function checkContentPermission(httpClient, userAccountId, attachmentId, operation) {
    return new Promise((resolve, reject) => {
        if (!/^[A-Z0-9-]+$/i.test(attachmentId)) {
            reject(new Error("Invalid content ID"));
            return;
        }
        httpClient.post({
            url: `/rest/api/content/${encodeURIComponent(
                attachmentId
            )}/permission/check`,
            headers: {
                "X-Atlassian-Token": "no-check"
            },
            json: {
                subject: {
                    type: "user",
                    identifier: userAccountId
                },
                operation
            }
        }, function(err, response, body) {
            if (err) {
                reject(err);
                return;
            }

            if (Object.prototype.hasOwnProperty.call(body, "hasPermission")) {
                resolve(body.hasPermission);
                return;
            }

            resolve(false);
            }
        );
    });
}

export async function getFileDataFromUrl(url) {
    const file = await axios({
        method: "get",
        responseType: "arraybuffer",
        headers: {
          'Content-Type': 'application/json'
        },
        url: url,
    });

    return file.data;
}

export default {
    getAppProperty,
    setAppProperty,
    getAttachmentInfo,
    getAttachmentsOnPage,
    getUserInfo,
    updateContent,
    getUriDownloadAttachment,
    checkContentPermission,
    getFileDataFromUrl
};
