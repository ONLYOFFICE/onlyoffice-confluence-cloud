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

import React, { useCallback, useEffect, useState } from "react";

import { invoke, showFlag } from "@forge/bridge";
import ForgeReconciler, {
  Box,
  Button,
  Checkbox,
  EmptyState,
  ErrorMessage,
  Form,
  FormFooter,
  FormSection,
  Heading,
  HelperMessage,
  I18nProvider,
  Image,
  Inline,
  Label,
  LinkButton,
  LoadingButton,
  RequiredAsterisk,
  Spinner,
  Stack,
  Text,
  Textfield,
  useForm,
  useProductContext,
  useTranslation,
  xcss,
} from "@forge/react";

import ErrorIcon from "../assets/images/error.svg";
import ExternalLink from "../components/ExternalLink";

const styles = {
  mainContainer: xcss({
    padding: "space.250",
    borderRadius: "radius.small",
    borderColor: "color.border",
    borderWidth: "border.width",
    borderStyle: "solid",
    minHeight: "200px",
  }),
};

const SettingsPage = () => {
  const [error, setError] = useState();
  const [settings, setSettings] =
    useState<Record<string, string | number | boolean>>();
  const [localSettings, setLocalSettings] =
    useState<Record<string, string | number | boolean>>();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { t } = useTranslation();
  const context = useProductContext();

  const { handleSubmit } = useForm<Record<string, string | number | boolean>>();

  const loadSettings = useCallback(() => {
    if (context) {
      setLoading(true);
      setError(undefined);

      invoke<Record<string, string | number | boolean>>("getSettings")
        .then((settings: Record<string, string | number | boolean>) => {
          setSettings(settings);
          setLocalSettings(settings);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);

          setError(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [context]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const validate = (settings: Record<string, string | number | boolean>) => {
    const errors: Record<string, string> = {};

    if (settings["demo"]) {
      return errors;
    }

    if (!settings["url"]) {
      errors["url"] = "";
    }

    if (!settings["security.key"]) {
      errors["security.key"] = "";
    }

    return errors;
  };

  const onSubmit = () => {
    const errors = validate(localSettings || {});

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const newSettings = { ...localSettings };

    setSubmitting(true);

    invoke<Record<string, string | number | boolean>>(
      "saveSettings",
      newSettings,
    )
      .then((settings: Record<string, string | number | boolean>) => {
        setSettings(settings);
        setLocalSettings(settings);

        showFlag({
          id: "settings-saved",
          title: t("page.settings.messages.settings-saved"),
          type: "success",
          appearance: "success",
          isAutoDismiss: true,
        });
      })
      .catch((error) => {
        console.error(error);

        showFlag({
          id: "save-settings-failed",
          title: t("page.settings.messages.save-settings-failed"),
          type: "error",
          appearance: "error",
          isAutoDismiss: true,
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const onChange = (key: string, value: string | number | boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const formatDemoTimer = (instant: number) => {
    const date = new Date(instant);

    return date.toLocaleDateString(context?.locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Box xcss={styles.mainContainer}>
      {loading && (
        <Inline space="space.050" alignInline="center" alignBlock="center">
          <Box xcss={{ height: "200px" }} />
          <Spinner size="large" />
          <Box xcss={{ height: "200px" }} />
        </Inline>
      )}
      {!loading && error && (
        <>
          <Image size="xsmall" src={ErrorIcon} />
          <EmptyState
            header={t("error-state.common.title")}
            description={t("error-state.common.description")}
            primaryAction={
              <Button
                appearance="primary"
                iconBefore="retry"
                onClick={loadSettings}
              >
                {t("buttons.reload-app.title")}
              </Button>
            }
          />
        </>
      )}
      {!loading && settings && localSettings && (
        <Stack space="space.250">
          <Stack space="space.150">
            <Heading size="small">{t("page.settings.welcome.header")}</Heading>
            <Text>{t("page.settings.welcome.description")}</Text>
            <Inline space="space.300">
              <ExternalLink
                url="https://github.com/ONLYOFFICE/onlyoffice-confluence-cloud"
                label={t("page.settings.welcome.links.learn-more")}
              />
              <ExternalLink
                url="https://community.onlyoffice.com/c/suggestions/integrations/56"
                label={t("page.settings.welcome.links.suggest-feature")}
              />
            </Inline>
          </Stack>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Heading size="small">
              {t("page.settings.connections-settings.header")}
            </Heading>

            <FormSection>
              <Inline>
                <Stack grow="fill" space="space.100">
                  <Box>
                    <Label labelFor="url">
                      {t("page.settings.connections-settings.fields.url.title")}
                      <RequiredAsterisk />
                    </Label>
                    <Textfield
                      id="url"
                      name="url"
                      placeholder="https://"
                      isInvalid={Object.keys(validationErrors).includes("url")}
                      isDisabled={
                        submitting ||
                        (Boolean(localSettings["demo"]) &&
                          !!settings["demoAvailable"])
                      }
                      value={localSettings["url"] as string}
                      onChange={(e) => onChange("url", e.target.value)}
                    />
                    {validationErrors["url"] && (
                      <ErrorMessage>{validationErrors["url"]}</ErrorMessage>
                    )}
                    {!validationErrors["url"] && (
                      <HelperMessage>
                        {t(
                          "page.settings.connections-settings.fields.url.description",
                        )}
                      </HelperMessage>
                    )}
                  </Box>
                  <Box>
                    <Label labelFor="security.key">
                      {t(
                        "page.settings.connections-settings.fields.security-key.title",
                      )}
                      <RequiredAsterisk />
                    </Label>
                    <Textfield
                      id="security.key"
                      name="security.key"
                      isInvalid={Object.keys(validationErrors).includes(
                        "security.key",
                      )}
                      isDisabled={
                        submitting ||
                        (Boolean(localSettings["demo"]) &&
                          !!settings["demoAvailable"])
                      }
                      value={localSettings["security.key"] as string}
                      onChange={(e) => onChange("security.key", e.target.value)}
                    />
                    {validationErrors["security.key"] && (
                      <ErrorMessage>
                        {validationErrors["security.key"]}
                      </ErrorMessage>
                    )}
                    {!validationErrors["security.key"] && (
                      <HelperMessage>
                        {t(
                          "page.settings.connections-settings.fields.security-key.description",
                        )}
                      </HelperMessage>
                    )}
                  </Box>
                  <Box>
                    <Label labelFor="security.header">
                      {t(
                        "page.settings.connections-settings.fields.security-header.title",
                      )}
                    </Label>
                    <Textfield
                      id="security.header"
                      name="security.header"
                      isDisabled={
                        submitting ||
                        (Boolean(localSettings["demo"]) &&
                          !!settings["demoAvailable"])
                      }
                      value={localSettings["security.header"] as string}
                      onChange={(e) =>
                        onChange("security.header", e.target.value)
                      }
                    />
                    <HelperMessage>
                      {t(
                        "page.settings.connections-settings.fields.security-header.description",
                      )}
                    </HelperMessage>
                  </Box>
                  <Box>
                    <Checkbox
                      label={t(
                        "page.settings.connections-settings.fields.demo.title",
                      )}
                      isDisabled={submitting || !settings["demoAvailable"]}
                      isChecked={
                        Boolean(localSettings["demo"]) ||
                        !settings["demoAvailable"]
                      }
                      onChange={(e) =>
                        onChange("demo", e.target.checked as boolean)
                      }
                    />
                    {settings["demoAvailable"] && !settings["demo"] && (
                      <HelperMessage>
                        {t(
                          "page.settings.connections-settings.fields.demo.description-availabale",
                        )}
                      </HelperMessage>
                    )}
                    {settings["demoAvailable"] && settings["demo"] && (
                      <HelperMessage>
                        {t(
                          "page.settings.connections-settings.fields.demo.description-active",
                        ).replace(
                          "{time}",
                          formatDemoTimer(settings["demoEnd"] as number),
                        )}
                      </HelperMessage>
                    )}
                    {!settings["demoAvailable"] && (
                      <HelperMessage>
                        {t(
                          "page.settings.connections-settings.fields.demo.description-not-availabale",
                        )}
                      </HelperMessage>
                    )}
                  </Box>
                </Stack>
                <Stack grow="fill" space="space.100">
                  <Box></Box>
                </Stack>
              </Inline>
            </FormSection>

            <FormFooter align="start">
              <LoadingButton
                appearance="primary"
                type="submit"
                isLoading={submitting}
              >
                {t("buttons.save.title")}
              </LoadingButton>
            </FormFooter>
          </Form>

          <Inline alignBlock="center" space="space.150">
            <Stack space="space.050">
              <Heading size="small">{t("docs-cloud-banner.header")}</Heading>
              <Text color="color.text.subtle">
                {t("docs-cloud-banner.description")}
              </Text>
            </Stack>
            <LinkButton
              href="https://www.onlyoffice.com/docs-registration.aspx?referer=confluence-cloud"
              target="_blank"
            >
              {t("buttons.get-now.title")}
            </LinkButton>
          </Inline>
        </Stack>
      )}
    </Box>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <I18nProvider>
      <SettingsPage />
    </I18nProvider>
  </React.StrictMode>,
);
