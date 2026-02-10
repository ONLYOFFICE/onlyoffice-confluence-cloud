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

import React, { ReactNode, useEffect, useMemo, useState } from "react";

import Button from "@atlaskit/button/new";
import EmptyState from "@atlaskit/empty-state";
import RetryIcon from "@atlaskit/icon/core/retry";
import { Box, xcss } from "@atlaskit/primitives";
import { i18n } from "@forge/bridge";

import ErrorIcon from "../../../src/assets/images/error.svg";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../../components/ConfirmDialog";
import { confirmDialogService } from "../../services/confirmDialogService";

const styles = {
  emptyStateContainer: xcss({
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    margin: "0",
    padding: "0",
    justifyContent: "center",
    alignItems: "center",
  }),
};

export interface AppError {
  title: string;
  description: string;
  secondaryAction?: ReactNode;
  imageUrl?: string;
}

export interface IAppContext {
  t: i18n.TranslationFunction;
  appError: AppError | undefined;
  setAppError: (value: AppError | undefined) => void;
}

export const AppContext = React.createContext<IAppContext>({} as IAppContext);

type AppContextProps = {
  children?: JSX.Element | JSX.Element[];
};

export const AppContextProvider: React.FC<AppContextProps> = ({ children }) => {
  const [t, setT] = useState<i18n.TranslationFunction>();
  const [appError, setAppError] = useState<AppError | undefined>();
  const [confirmDialogProps, setConfirmDialogProps] =
    useState<ConfirmDialogProps>();

  const appContextProviderValue = useMemo(() => {
    return {
      t,
      appError,
      setAppError,
    } as IAppContext;
  }, [t, appError, setAppError]);

  useEffect(() => {
    const loadTranslator = async () => {
      const t = await i18n.createTranslationFunction();
      setT(() => t);
    };

    loadTranslator();
  }, [setT]);

  useEffect(() => {
    confirmDialogService.register(setConfirmDialogProps, confirmDialogProps);

    return () => {
      confirmDialogService.unregister();
    };
  }, []);

  return (
    <>
      {appError && t && (
        <Box xcss={styles.emptyStateContainer}>
          <EmptyState
            imageUrl={appError.imageUrl || ErrorIcon}
            header={appError.title}
            description={appError.description}
            headingLevel={2}
            primaryAction={
              <Button
                appearance="primary"
                iconBefore={RetryIcon}
                onClick={() => {
                  setAppError(undefined);
                }}
              >
                {t("buttons.reload-app.title")}
              </Button>
            }
            secondaryAction={appError.secondaryAction}
          />
        </Box>
      )}
      {!appError && t && (
        <AppContext.Provider value={appContextProviderValue}>
          {children}
          {confirmDialogProps && (
            <ConfirmDialog
              title={confirmDialogProps.title}
              description={confirmDialogProps.description}
              appearance={confirmDialogProps.appearance}
              isLoading={confirmDialogProps.isLoading}
              buttons={confirmDialogProps.buttons}
            />
          )}
        </AppContext.Provider>
      )}
    </>
  );
};
