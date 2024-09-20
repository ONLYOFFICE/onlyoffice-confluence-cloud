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

import urlHelper from "./urlHelper.js";
import requestHelper from "./requestHelper.js";

var documentHelper = {};

documentHelper.getFileExtension = function (fileName) {
    var parts = fileName.toLowerCase().split(".");

    return parts.pop();
}

documentHelper.getDocumentType = function (addon, extension) {
    const formats = addon.config.docServer().formats || [];

    for (let i = 0; i < formats.length; i++) {
        if (formats[i].name === extension) return formats[i].type;
    }

    return null;
}

documentHelper.isEditable = function (addon, extension) {
    const formats = addon.config.docServer().formats || [];

    for (let i = 0; i < formats.length; i++) {
        if (formats[i].name === extension) return formats[i].actions.includes('edit');
    }

    return false;
}

documentHelper.isFillable = function (addon, extension) {
    const formats = addon.config.docServer().formats || [];

    for (let i = 0; i < formats.length; i++) {
        if (formats[i].name === extension) return formats[i].actions.includes('fill');
    }

    return false;
}

documentHelper.isViewable = function (addon, extension) {
    const formats = addon.config.docServer().formats || [];

    for (let i = 0; i < formats.length; i++) {
        if (formats[i].name === extension) return formats[i].actions.includes('view');
    }

    return false;
}

documentHelper.getDocumentKey = function (attachmentId, updateTime) {
    
    return Buffer.from(attachmentId + "_" + Date.parse(updateTime)).toString('base64');
}

documentHelper.getEditorConfig = async function (addon, httpClient, clientKey, localBaseUrl, hostBaseUrl, attachmentInfo, userInfo) {
    const fileType = documentHelper.getFileExtension(attachmentInfo.title);

    let callbackUrl = null;

    let permissionEdit = await requestHelper.checkContentPermission(httpClient, userInfo.accountId, attachmentInfo.id, "update");
    let isEditable = documentHelper.isEditable(addon, fileType);
    let isFillable = documentHelper.isFillable(addon, fileType);

    if (permissionEdit && (isEditable || isFillable)) {
        callbackUrl = await urlHelper.getCallbackUrl(
            addon,
            localBaseUrl,
            clientKey,
            userInfo.accountId,
            attachmentInfo.pageId || attachmentInfo.blogPostId,
            attachmentInfo.id
        );
    }

    return {
        type: "desktop",
        width: "100%",
        height: "100%",
        documentType: documentHelper.getDocumentType(addon, fileType),
        document: {
            title: attachmentInfo.title,
            url: await urlHelper.getFileUrl(addon, localBaseUrl, clientKey, userInfo.accountId, attachmentInfo.pageId || attachmentInfo.blogPostId, attachmentInfo.id),
            fileType: fileType,
            key: documentHelper.getDocumentKey(attachmentInfo.id, attachmentInfo.version.createdAt),
            info: {
                uploaded: attachmentInfo.version.createdAt
            },
            permissions: {
                edit: permissionEdit && isEditable,
                fillForms: permissionEdit && isFillable
            },
            referenceData: {
                fileKey: attachmentInfo.id,
                instanceId: clientKey
            }
        },
        editorConfig: {
            callbackUrl: callbackUrl,
            mode: "edit",
            lang: "en",
            user: {
                id: userInfo.accountId,
                name: userInfo.displayName
            },
            customization: {
                goback: {
                    url: urlHelper.getGoBackUrl(hostBaseUrl, attachmentInfo.pageId || attachmentInfo.blogPostId)
                }
            }
        }
    };
}

export default documentHelper;
