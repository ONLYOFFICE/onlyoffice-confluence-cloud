const axios = require("axios");

function getAppProperty(httpClient, propertyKey) {
    return new Promise((resolve, reject) => {
        httpClient.get({
            url: `/rest/atlassian-connect/1/addons/onlyoffice-confluence-cloud/properties/${encodeURIComponent(
                propertyKey
            )}`,
            json: true
        }, function(err, response, body) {
            if (response.statusCode == 200) {
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

function setAppProperty(httpClient, propertyKey, value) {
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

function getAttachmentInfo(httpClient, userAccountId, pageId, attachmentId, attachmentName) {
    return new Promise((resolve, reject) => {
        httpClient.asUserByAccountId(userAccountId).get({
            url: `/rest/api/content/${encodeURIComponent(
                pageId
            )}/child/attachment?expand=history.lastUpdated,container,operations&filename=${encodeURIComponent(
                attachmentName
            )}&limit=999999999`,
            json: true
        }, function(err, response, body) {
            if (response.statusCode == 200) {
                for(var i in body.results) {
                    if (body.results[i].id == "att" + attachmentId) {
                        resolve(body.results[i]);
                    }
                }
            } else {
                reject({
                    method: "getAttachmentInfo",
                    code: response.statusCode,
                    type: response.statusMessage,
                    message: "Error getting attachment information.",
                    description: body.message ? body.message : body
                });
            }

            reject({
                method: "getAttachmentInfo",
                code: 404,
                type: "Not found",
                message: "Error getting attachment information.",
                description: `Not found attachment with id: ${attachmentId}, name: ${attachmentId}.`
            });
        });
    });
}

function getUserInfo(httpClient, userAccountId) {
    return new Promise((resolve, reject) => {
        httpClient.get({
            url: `/rest/api/user?accountId=${encodeURIComponent(userAccountId)}`,
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

function updateContent(httpClient, userAccountId, pageId, attachmentId, fileData) {
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

function getUriDownloadAttachment(httpClient, userAccountId, pageId, attachmentId) {
    return new Promise((resolve, reject) => {
        httpClient.asUserByAccountId(userAccountId).get({
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

async function getFileDataFromUrl(url) {
    const file = await axios({
        method: "get",
        responseType: "arraybuffer",
        headers: {
          'Content-Type': 'application/json'
        },
        url: url,
    });

    return file.data; //ToDo : check exception
}

module.exports = {
    getAppProperty,
    setAppProperty,
    getAttachmentInfo,
    getUserInfo,
    updateContent,
    getUriDownloadAttachment,
    getFileDataFromUrl
};