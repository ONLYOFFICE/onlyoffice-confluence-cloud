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

import { createQueryToken } from "../helpers/jwtManager.js";

var urlHelper = {};

urlHelper.getFileUrl = async function (addon, localBaseUrl, clientKey, userAccountId, pageId, attachmentId) {

    const token = await createQueryToken(
        addon,
        clientKey,
        userAccountId,
        {
            pageId: pageId,
            attachmentId: attachmentId,
            operation: "download"
        }
    );

    return appendSlash(localBaseUrl) + "onlyoffice-download?token=" + token;
}

urlHelper.getCallbackUrl = async function (addon, localBaseUrl, clientKey, userAccountId, pageId, attachmentId) {

    const token = await createQueryToken(
        addon,
        clientKey,
        userAccountId,
        {
            pageId: pageId,
            attachmentId: attachmentId,
            operation: "callback"
        }
    );

    return appendSlash(localBaseUrl) + "onlyoffice-callback?token=" + token;
}

urlHelper.getGoBackUrl = function (hostBaseUrl, pageId) {
    var url = appendSlash(hostBaseUrl) + "pages/viewpageattachments.action";
    url = url + "?pageId=" + pageId;
    return url;
}

urlHelper.getDocApiUrl = async function (addon, clientKey) {
    const clientProperties = await addon.settings.get("clientProperties", clientKey);

    var docApiUrl = ""

    if (clientProperties &&  clientProperties.docApiUrl) {
        docApiUrl = clientProperties.docApiUrl;
    } else {
        docApiUrl = addon.config.docServer().default.adress;
    }

    return docApiUrl != "" ? appendSlash(docApiUrl) : docApiUrl;
}

urlHelper.getEditorUrl = function (hostBaseUrl, addonKey, pageId, attachmentId = "") {
    hostBaseUrl = hostBaseUrl.endsWith("/") ? hostBaseUrl.slice(0, -1) : hostBaseUrl;
    attachmentId = attachmentId.startsWith("att") ? attachmentId.slice(3) : attachmentId;

    return `${hostBaseUrl}/plugins/servlet/ac/${addonKey}/editor?page.id=${pageId}&attachment.id=${attachmentId}`;
}

urlHelper.getUserImageUrl = function(hostBaseUrl, userInfo) {
    const baseUrl = hostBaseUrl.endsWith('/wiki') ? hostBaseUrl.slice(0, -5) : hostBaseUrl;

    return `${baseUrl}${userInfo.profilePicture.path}`
}

function appendSlash(url) {
    return url.replace(/\/$|$/, '/');
}

export default urlHelper;
