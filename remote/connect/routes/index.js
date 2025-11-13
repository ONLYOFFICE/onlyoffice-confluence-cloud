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

import * as jwt from 'atlassian-jwt';
import documentHelper from "../helpers/documentHelper.js";
import lifecycleManager from "../helpers/lifecycleManager.js";
import urlHelper from "../helpers/urlHelper.js";
import util from "util";
import escape from "lodash/escape";

import {
    getAttachmentInfo,
    getAttachmentsOnPage,
    getUserInfo,
    updateContent,
    getUriDownloadAttachment,
    getFileDataFromUrl,
    createContent,
    getUsersByIds
} from "../helpers/requestHelper.js";

import {
    getJwtSecret,
    getJwtHeader,
    verifyQueryToken
} from "../helpers/jwtManager.js";

import i18n from "i18n";

export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    app.post('/installed', addon.verifyInstallation(), lifecycleManager.postInstallation(addon));

    app.post('/uninstalled', addon.verifyInstallation(), lifecycleManager.postUninstallation(addon));

    app.get('/healthcheck', (req, res) => {
        res.status(200).send();
    });

    app.get('/configure', [addon.authenticate(), addon.authorizeConfluence({ application: ["administer"] })], async (req, res) => {
        
        try {
            const clientKey = req.context.clientKey;

            const context = {
                title: "ONLYOFFICE",
                docApiUrl: await urlHelper.getDocApiUrl(addon, clientKey),
                jwtSecret: await getJwtSecret(addon, clientKey),
                jwtHeader: await getJwtHeader(addon, clientKey),
                linkDocsCloud: addon.config.docServer().links.docsCloud
            };

            res.render(
                'configure.hbs',
                context
            );
        } catch (error) {
            addon.logger.warn(error);
            res.status(500);
            res.render(
                'error.hbs',
                {
                    error: {
                        type: error.type || "Undefined error",
                        message: error.message || "",
                        description: error.description || ""
                    }
                }
            );
        }
    });

    app.post('/configure', [addon.authenticate(true), addon.authorizeConfluence({ application: ["administer"] })], async (req, res) => {

        if (!req.body.docApiUrl || !req.body.jwtSecret || !req.body.jwtSecret) {
            res.status(400).send();
            return;
        }

        try {
            const clientKey = req.context.clientKey;

            let clientProperties = {
                docApiUrl: req.body.docApiUrl,
                jwtSecret: req.body.jwtSecret,
                jwtHeader: req.body.jwtHeader,
                updateDate: new Date()
            }

            addon.settings.set("clientProperties", clientProperties, clientKey).then(
                data => {
                    if (addon.app.get("env") !== "production") {
                        addon.logger.info(
                            `Saved tenant details for ${
                                clientKey
                            } to database\n${util.inspect(data)}`
                        );
                    }
                    res.status(200).send();
                },
                err => {
                    addon.emit("host_settings_not_saved", clientKey, {
                        err
                    });
                    res.status(500).send(
                        escape(
                            `Could not lookup stored client data for ${clientKey}: ${err}`
                        )
                    );
                }
            );
        } catch (error) {
            addon.logger.warn(error);
            res.status(500).send("Internal error");
        }
    });

    app.get("/create", addon.authenticate(), async (req, res) => {
        const creatableTypes = ["word", "cell", "slide", "pdf"];

        const localBaseUrl = req.context.localBaseUrl;
        const pageId = req.query.pageId;

        const locales = {
            "creation.header": i18n.__("creation.header"),
            "creation.title.placeholder": i18n.__("creation.title.placeholder"),
            "creation.label.title": i18n.__("creation.label.title"),
            "creation.label.word": i18n.__("creation.label.word"),
            "creation.label.cell": i18n.__("creation.label.cell"),
            "creation.label.slide": i18n.__("creation.label.slide"),
            "creation.label.pdf": i18n.__("creation.label.pdf"),
            "creating.error.message": i18n.__("creating.error.message"),
            "creating.error.already-exist.message": i18n.__("creating.error.already-exist.message"),
            "label.create": i18n.__("label.create"),
            "label.cancel": i18n.__("label.cancel")
        };

        res.render(
            "create.jsx",
            {
                pageId: pageId,
                creatableTypes: creatableTypes,
                locales: locales,
                localBaseUrl: localBaseUrl
            }
        );
    });

    app.post("/create/:contentId", addon.authenticate(true), async (req, res) => {
        const httpClient = addon.httpClient(req);

        const userAccountId = req.context.userAccountId;
        const hostBaseUrl = req.context.hostBaseUrl;
        const addonKey = req.context.addonKey;
        const contentId = req.params.contentId;
        const title = req.body.title;
        const type = req.body.type;
        const locale = req.body.locale;

        const fileData = documentHelper.getBlankFile(
            type,
            new Intl.Locale(locale.replace("_", "-"))
        ); 

        createContent(
            httpClient,
            userAccountId,
            contentId,
            `${title}.${documentHelper.getDefaultExtensionByDocumentType(type)}`,
            fileData
        ).then((response) => {
            const attachmentId = response.results[0].id;
            res.json(
                {
                    editorUrl: urlHelper.getEditorUrl(hostBaseUrl, addonKey, contentId, attachmentId)
                }
            );
        }).catch((e) => {
            res.status(e.code || 500).json(e || "Undefined error.");
        });
    });

    app.get('/editor', addon.authenticate(), async (req, res) => {

        const userAccountId = req.context.userAccountId;
        const localBaseUrl = req.context.localBaseUrl;
        const hostBaseUrl = req.context.hostBaseUrl;
        const clientKey = req.context.clientKey;
        const addonKey = req.context.addonKey;

        const pageId = req.query.pageId;
        const attachmentId = req.query.attachmentId;
        const mode = req.query.mode;

        addon.logger.info(`Request to generate a configuration to open the editor:\n${util.inspect({
            clientKey: clientKey,
            hostBaseUrl: hostBaseUrl,
            userAccountId: userAccountId,
            pageId: pageId,
            attachmentId: attachmentId
        })}`);

        if (!pageId || !attachmentId) {
            addon.logger.warn("Not found requested paremeters (pageId, attachmentId)");
            res.status(404);
            sendError(
                "Not found",
                "Attachment not found.",
                "Not found requested paremeters (pageId, attachmentId)."
            );
            return;
        }

        try {
            const httpClient = addon.httpClient(req);

            const userInfo = await getUserInfo(httpClient, userAccountId);
            const attachmentInfo = await getAttachmentInfo(httpClient, userAccountId, attachmentId);

            const fileType = documentHelper.getFileExtension(attachmentInfo.title);
            const isViewable = documentHelper.isViewable(addon, fileType);

            if (!isViewable) {
                addon.logger.warn(`Unsupported MediaType: this file format is not supported (${fileType})`);
                res.status(415);
                sendError(
                    "Unsupported MediaType",
                    `Sorry, this file format is not supported (${attachmentInfo.title})`,
                    null,
                    hostBaseUrl + attachmentInfo.downloadLink
                );
                return;
            } 

            const editorConfig = await documentHelper.getEditorConfig(
                addon,
                httpClient,
                clientKey, 
                localBaseUrl, 
                hostBaseUrl, 
                attachmentInfo, 
                userInfo
            );

            if (mode === "fillForms" && editorConfig.document.permissions.fillForms) {
                editorConfig.document.permissions.edit = false;
            }

            const jwtSecret = await getJwtSecret(addon, clientKey);

            if (jwtSecret && jwtSecret != "") {
                editorConfig.token = jwt.encodeSymmetric(editorConfig, jwtSecret);
            } else {
                editorConfig.token = "";
            }

            const locales = {
                "You are not permitted to perform this operation.": i18n.__("You are not permitted to perform this operation."),
                "Attachment File Not Found": i18n.__("Attachment File Not Found"),
                "Unknown error": i18n.__("Unknown error"),
                "ONLYOFFICE cannot be reached. Please contact admin.": i18n.__("ONLYOFFICE cannot be reached. Please contact admin.")
            };

            res.render(
                'editor.jsx',
                {
                    editorConfig: editorConfig,
                    docApiUrl: await urlHelper.getDocApiUrl(addon, clientKey),
                    pageId: pageId,
                    editorUrl: urlHelper.getEditorUrl(hostBaseUrl, addonKey, pageId),
                    localBaseUrl: localBaseUrl,
                    locales
                }
            );
        } catch (error) {
            addon.logger.warn(error);
            res.status(error.code || 500);
            sendError(
                error.type || "Undefined error",
                error.message || "An unexpected error occurred while opening the document.",
                error.description || ""
            )
            return;
        }

        function sendError(type, message, description, link) {
            res.render(
                'error.hbs',
                {
                    error: {
                        type: type,
                        message: message,
                        description: description,
                        link: link
                    }
                }
            );
        }
    });

    app.get('/onlyoffice-download', async (req, res) => {

        const queryToken = req.query.token;

        addon.logger.info(`Request to download file:\n${util.inspect({ queryToken: queryToken })}`);

        if (!queryToken) {
            addon.logger.warn("Query token not found");
            res.status(400).send("Query token not found");
            return;
        }

        let context;
        try {
            context = await verifyQueryToken(addon, queryToken, "download");
        } catch (error) {
            addon.logger.warn(`Invalid query token: ${error.message}`);
            res.status(401).send(`Invalid query token: ${error.message}`);
            return;
        }

        addon.logger.info(`Context from queryToken:\n${util.inspect(context)}`);

        var httpClient = addon.httpClient({
            clientKey: context.clientKey
        });

        try {
            const jwtSecret = await getJwtSecret(addon, context.clientKey);
            const jwtHeader = await getJwtHeader(addon, context.clientKey);
            const authHeader = req.headers[jwtHeader.toLowerCase()];
            const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

            if (!token) {
                addon.logger.warn("Could not find authentication data on request");
                res.status(401).send("Could not find authentication data on request");
                return;
            }

            try {
                jwt.decodeSymmetric(token, jwtSecret, jwt.SymmetricAlgorithm.HS256);
            } catch (error) {
                addon.logger.warn(`Invalid JWT: ${error.message}`);
                res.status(401).send(`Invalid JWT: ${error.message}`);
                return;
            }

            const uri = await getUriDownloadAttachment(httpClient, context.userId, context.pageId, context.attachmentId);

            res.setHeader("location", uri);
            res.status(302).send();
        } catch (error) {
            addon.logger.warn(`Error download file:\n${util.inspect(error)}`);
            res.status(error.code || 500).send(error.message || "Undefined error.");
        }
    });

    app.post('/onlyoffice-callback', async (req, res) => {

        const queryToken = req.query.token;

        addon.logger.info(`Callback request:\n${util.inspect({ queryToken: queryToken })}`);

        if (!queryToken) {
            addon.logger.warn("Query token not found");
            res.status(400).send("Query token not found");
            return;
        }

        let context;
        try {
            context = await verifyQueryToken(addon, queryToken, "callback");
        } catch (error) {
            addon.logger.warn(`Invalid query token: ${error.message}`);
            res.status(401).send(`Invalid query token: ${error.message}`);
            return;
        }

        addon.logger.info(`Context from queryToken:\n${util.inspect(context)}`);

        let body = req.body;

        if (!body) {
            addon.logger.warn("Request body not found");
            res.status(400).send("Request body not found");
            return;
        }

        const httpClient = addon.httpClient({
            clientKey: context.clientKey
        });

        try {
            let token = body.token;
            let tokenFromHeader = false;

            if (!token) {
                const jwtHeader = await getJwtHeader(addon, context.clientKey);
                const authHeader = req.headers[jwtHeader.toLowerCase()];
                token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
                tokenFromHeader = true;
            }

            if (!token) {
                addon.logger.warn("Could not find authentication data on request");
                res.status(401).send("Could not find authentication data on request");
                return;
            }

            try {
                const jwtSecret = await getJwtSecret(addon, context.clientKey);
                var bodyFromToken = jwt.decodeSymmetric(token, jwtSecret, jwt.SymmetricAlgorithm.HS256);

                body = tokenFromHeader ? bodyFromToken.payload : bodyFromToken;
            } catch (error) {
                addon.logger.warn(`Invalid JWT: ${error.message}`);
                res.status(401).send(`Invalid JWT: ${error.message}`);
                return;
            }

            addon.logger.info(`Callback status: ${body.status}`);
               
            if (body.status == 2 || body.status == 3) { // MustSave, Corrupted

                const userAccountId = body.actions[0].userid;
                const pageId = context.pageId;
                const attachmentId = context.attachmentId;

                const fileData = await getFileDataFromUrl(body.url);
                await updateContent(httpClient, userAccountId, pageId, attachmentId, fileData);
            } else if (body.status == 6 || body.status == 7) { // MustForceSave, CorruptedForceSave
                addon.logger.warn("Force save is not supported");
                res.json({ error: 1, message: "Force save is not supported"});
                return;
            }
        } catch (error) {
            addon.logger.warn(`Callback request error:\n${util.inspect(error)}`);
            res.json({ error: 1, message: error.message || "Undefined error." });
            return;
        }

        res.json({ error: 0 });
    });

    app.post('/reference-data', addon.authenticate(true), async (req, res) => {

        const userAccountId = req.context.userAccountId;
        const clientKey = req.context.clientKey;
        const localBaseUrl = req.context.localBaseUrl;
        const pageId = req.query.pageId;

        let attachmentId;
        let referenceData;
        if (req.body.referenceData) {
            referenceData = req.body.referenceData;
            if (referenceData.instanceId && referenceData.instanceId === clientKey) {
                attachmentId = referenceData.fileKey;
            }
        }

        const httpClient = addon.httpClient(req);

        let attachmentInfo;
        let error;
        try {
            attachmentInfo = await getAttachmentInfo(httpClient, userAccountId, attachmentId);
        } catch (e) {
            error = e;
        }

        try {
            if (error && error.code === 404 || !attachmentInfo) {
                if (pageId && pageId !== '') {
                    const path = req.body.path;
                    const attachments = await getAttachmentsOnPage(httpClient, userAccountId, pageId, path);
                    if (attachments && attachments[0]) {
                        attachmentInfo = attachments[0];
                        referenceData.fileKey = attachmentInfo.id;
                        referenceData.instanceId = clientKey;
                    }
                }
            }

            if (!attachmentInfo) {
                addon.logger.warn(error);
                res.status(error.code || 500).send(error.message || "Undefined error.");
                return;
            }

            const result = {
                key: documentHelper.getDocumentKey(attachmentInfo.id, attachmentInfo.version.createdAt),
                fileType: documentHelper.getFileExtension(attachmentInfo.title),
                path: attachmentInfo.title,
                referenceData: referenceData,
                url: await urlHelper.getFileUrl(addon, localBaseUrl, clientKey, userAccountId, attachmentInfo.pageId || attachmentInfo.blogPostId, attachmentInfo.id),
            }

            const jwtSecret = await getJwtSecret(addon, clientKey);
            if (jwtSecret && jwtSecret != "") {
                result.token = jwt.encodeSymmetric(result, jwtSecret);
            } else {
                result.token = "";
            }

            res.json(result);
        } catch {
            addon.logger.warn(error);
            res.status(error.code || 500).send(error.message || "Undefined error.");
        }
    });

    app.post('/users-info', addon.authenticate(true), async (req, res) => {
        const userAccountId = req.context.userAccountId;
        const hostBaseUrl = req.context.hostBaseUrl;
        const ids = req.body.ids;

        const httpClient = addon.httpClient(req);

        const users = await getUsersByIds(httpClient, userAccountId, ids);

        const result = {
            users: []
        };

        users.forEach((user) => {
            result.users.push({
                id: user.accountId,
                name: user.displayName,
                image: urlHelper.getUserImageUrl(hostBaseUrl, user)
            })
        });

        res.json(result);
    });
}
