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

const JSON5 = require("json5");
const fs = require("fs");

const utils = {};

utils.loadFile = function loadFile(path) {
  return fs.existsSync(path) ? fs.readFileSync(path).toString() : null;
};

utils.loadJSON = function loadConfig(path) {
  let data = {};
  try {
    data = utils.loadFile(path);
  } catch (e) {
    // do nothing
  }
  return data ? JSON5.parse(data) : {};
};

module.exports = utils;