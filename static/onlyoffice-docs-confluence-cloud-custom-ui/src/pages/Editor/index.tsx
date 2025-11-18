import React from "react";

import { FullContext } from "@forge/bridge";

export type EditorPageProps = {
  context: FullContext;
};


const EditorPage: React.FC<EditorPageProps> = ({ context }) => {
  return (
    <div>
      <h1>Editor Page</h1>
      <p>Context: {JSON.stringify(context)}</p>
    </div>
  );
}

export default EditorPage;