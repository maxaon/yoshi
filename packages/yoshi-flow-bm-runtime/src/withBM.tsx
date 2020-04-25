import axios from 'axios';
import React, { ComponentType, FC } from 'react';
import { wixAxiosConfig } from '@wix/wix-axios-config';
import { ExperimentsBag } from '@wix/wix-experiments';
import { BrowserClient } from '@sentry/browser';
import ExperimentsProvider from './hooks/ExperimentsProvider';
import ModuleProvider, { IBMModuleParams } from './hooks/ModuleProvider';
import SentryProvider from './hooks/SentryProvider';
import FedopsProvider from './hooks/FedopsProvider';

wixAxiosConfig(axios, {
  baseURL: '/',
});

const withBM = (
  componentId: string,
  experiments: ExperimentsBag,
  translations: Record<string, string>,
  sentryClient: BrowserClient,
) => (Component: ComponentType) => {
  const experimentsOptions = { experiments };

  const Wrapped: FC<IBMModuleParams> = props => {
    return (
      <ModuleProvider moduleParams={props}>
        <ExperimentsProvider options={experimentsOptions}>
          <SentryProvider client={sentryClient}>
            <FedopsProvider appName={componentId}>
              <Component />
            </FedopsProvider>
          </SentryProvider>
        </ExperimentsProvider>
      </ModuleProvider>
    );
  };

  return Wrapped;
};

export default withBM;
