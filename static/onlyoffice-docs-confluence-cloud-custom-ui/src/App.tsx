/**
 *
 * (c) Copyright Ascensio System SIA 2025
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

import React, { useEffect, useState } from "react";

import { view } from "@forge/bridge";
import { FullContext } from "@forge/bridge";
import { History } from "history";

import EditorPage from "./pages/Editor";
import MainPage from "./pages/Main";

function App() {
  const [context, setContext] = useState<FullContext>();
  const [history, setHistory] = useState<History>();

  useEffect(() => {
    (async () => {
      const context = await view.getContext();

      setContext(context);

      if (context.extension.type === "confluence:spacePage") {
        const history = await view.createHistory();
        setHistory(history);
      }
    })();
  }, []);

  return (
    <>
      {context && context.moduleKey === "editor-page" && (
        <EditorPage context={context} />
      )}
      {context &&
        (context.moduleKey === "main-page" ||
          context.moduleKey === "main-page-action") && (
          <MainPage context={context} history={history} />
        )}
    </>
  );
}

export default App;
