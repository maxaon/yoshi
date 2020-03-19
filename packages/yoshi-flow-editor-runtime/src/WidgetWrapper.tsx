import React, { Suspense } from 'react';
import { withStyles } from '@wix/native-components-infra';
import { IHostProps } from '@wix/native-components-infra/dist/src/types/types';
import { IWixStatic } from '@wix/native-components-infra/dist/es/src/types/wix-sdk';
import { createInstances } from './createInstances';
import { ControllerProvider } from './react/ControllerProvider';
import { PublicDataProviderEditor } from './react/PublicDataProviderEditor';
import { PublicDataProviderViewer } from './react/PublicDataProviderViewer';
import { ErrorBoundary } from './react/ErrorBoundary';
import { IControllerContext } from './react/ControllerContext';

declare global {
  interface Window {
    Wix: IWixStatic;
    __STATICS_BASE_URL__: string;
  }
}
// TODO - improve this type or bring from controller wrapper
interface IFrameworkProps {
  __publicData__: any;
  experiments: any;
  cssBaseUrl?: string;
}

const PublicDataProvider: typeof React.Component =
  typeof window.Wix === 'undefined'
    ? PublicDataProviderViewer
    : PublicDataProviderEditor;

// This widget is going to be called inside entry-point wrapeprs.
// Each widget should contain component to wrap name, so here we return a getter instead of component.
const getWidgetWrapper = (
  UserComponent: typeof React.Component,
  {
    name,
    isEditor,
  }: {
    name: string;
    isEditor?: boolean;
  },
) => {
  const Widget = (props: IHostProps & IFrameworkProps & IControllerContext) => {
    return (
      <div>
        <ErrorBoundary handleException={error => console.log(error)}>
          <Suspense fallback={<div>Loading...</div>}>
            <PublicDataProvider data={props.__publicData__} Wix={window.Wix}>
              <ControllerProvider data={props}>
                <UserComponent
                  {...createInstances({ experiments: props.experiments })}
                  {...props}
                />
              </ControllerProvider>
            </PublicDataProvider>
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  };
  const cssPath = isEditor
    ? `${name}EditorMode.css`
    : `${name}ViewerWidget.css`;

  const stylablePath = isEditor
    ? `${name}EditorMode.stylable.bundle.css`
    : `${name}ViewerWidget.stylable.bundle.css`;

  return withStyles(Widget, {
    cssPath: [cssPath, stylablePath],
  });
};

export default getWidgetWrapper;
