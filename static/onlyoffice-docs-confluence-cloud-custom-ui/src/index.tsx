import React from "react";

import AppProvider from "@atlaskit/app-provider";
import { view } from "@forge/bridge";
import ReactDOM from "react-dom/client";

import App from "./App";
import { AppContextProvider } from "./context/AppContext";

import "@atlaskit/css-reset";

view.theme.enable();

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <AppProvider>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </AppProvider>,
);

