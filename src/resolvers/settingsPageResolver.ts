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

import Resolver, { Request } from "@forge/resolver";

import { getSettings, saveSettings } from "../../src/storage";
import { getRemoteSettings, postRemoteSettings } from "../client";

const settingsPageResolver = new Resolver();

settingsPageResolver.define("getSettings", async () => {
  const settings = (await getSettings()) || {};

  const remoteSettings = await getRemoteSettings();

  settings["demoAvailable"] = remoteSettings.demoAvailable;
  settings["demoStart"] = remoteSettings.demoStart;
  settings["demoEnd"] = remoteSettings.demoEnd;

  if (!settings["demoStart"]) {
    settings["demo"] = false;
  }

  return settings;
});

settingsPageResolver.define("saveSettings", async (request: Request) => {
  const { payload } = request;

  let settings = {
    url: payload["url"] || "",
    "security.key": payload["security.key"] || "",
    "security.header": payload["security.header"] || "",
    demo: payload["demo"] || false,
  } as Record<string, string | number | boolean>;

  let remoteSettings;
  if (!payload["demo"]) {
    remoteSettings = await getRemoteSettings();
  } else {
    remoteSettings = await postRemoteSettings();

    if (remoteSettings.demoAvailable) {
      const currentSettings = (await getSettings()) || {};

      settings = {
        ...currentSettings,
        demo: true,
      };
    }
  }

  settings = (await saveSettings(settings)) || {};

  settings["demoAvailable"] = remoteSettings.demoAvailable;
  settings["demoStart"] = remoteSettings.demoStart;
  settings["demoEnd"] = remoteSettings.demoEnd;

  return settings;
});

export default settingsPageResolver.getDefinitions();
