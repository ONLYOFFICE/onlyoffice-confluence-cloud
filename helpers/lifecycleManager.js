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

import escape from "lodash/escape";
import util from "util";

function postInstallation (addon) {
    return function (req, res) {
        var info = req.body;
        info.dateInstallation = new Date();
        setClientInfo(addon, info, res);
    }
}

function postUninstallation(addon) {
    return async function (req, res) {
        const body = req.body;
        const settingsFromStorage = await addon.settings.get("clientInfo", body.clientKey);

        const info = Object.assign(body, {
            dateInstallation: settingsFromStorage.dateInstallation,
            dateUninstallation: new Date()
        });

        setClientInfo(addon, info, res);
    }
}

function setClientInfo(addon, info, res) {
    addon.settings.set("clientInfo", info, info.clientKey).then(
        data => {
            if (addon.app.get("env") !== "production") {
                addon.logger.info(
                    `Saved tenant details for ${
                        info.clientKey
                    } to database\n${util.inspect(data)}`
                );
            }
            addon.emit("host_settings_saved", info.clientKey, data);
            const { unexpectedInstallHook } = res.locals || {};
            if (unexpectedInstallHook) {
                res.setHeader("x-unexpected-symmetric-hook", "true");
            }
            res.status(204).send();
        },
        err => {
            addon.emit("host_settings_not_saved", info.clientKey, {
                err
            });
            res.status(500).send(
                escape(
                    `Could not lookup stored client data for ${info.clientKey}: ${err}`
                )
            );
        }
    );
}

export default {
    postInstallation,
    postUninstallation
};
