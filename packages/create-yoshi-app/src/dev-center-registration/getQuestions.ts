// import openBrowser from 'react-dev-utils/openBrowser';
import { ExtendedPromptObject } from './extended-prompts';
import { createApp, createComponent, getApps } from './appService';

const WILL_REGISTER = 2;
const WAS_REGISTERED = 1;
const WIDGET_OUT_OF_IFRAME = 'WIDGET_OUT_OF_IFRAME';
const PAGE_OUT_OF_IFRAME = 'PAGE_OUT_OF_IFRAME';
const SKIP_REGISTER_COMPONENT = 'SKIP_REGISTER_COMPONENT';

const formatAppOption = (app: {
  name: string;
  appId: string;
}): { title: string; value: string } => {
  return {
    title: app.name,
    value: app.appId,
  };
};

export default (): Array<ExtendedPromptObject<string>> => {
  return [
    {
      type: 'select',
      name: 'appRegistrationState',
      message: 'Is your app registered in dev center?',
      choices: [
        { title: 'Yes', value: WAS_REGISTERED },
        {
          title: 'No',
          value: WILL_REGISTER,
        },
      ],
      next(answers) {
        if (answers.appRegistrationState === WILL_REGISTER) {
          return [
            {
              type: 'text',
              name: 'appName',
              async after(answers) {
                return createApp(answers.appName);
              },
              validate(value: string) {
                return !!value;
              },
              message: 'Name of the app:',
            },
            {
              type: 'select',
              name: 'registerComponentType',
              message: 'Register a component',
              choices: [
                { title: 'Register new Widget', value: WIDGET_OUT_OF_IFRAME },
                { title: 'Register new Page', value: PAGE_OUT_OF_IFRAME },
                {
                  title: 'Finish registration',
                  value: null,
                },
              ],
              next(answers) {
                if (answers.registerComponentType) {
                  return [
                    {
                      type: 'text',
                      name: 'componentName',
                      async after(answers) {
                        return {
                          [answers.componentName]: await createComponent({
                            name: answers.componentName,
                            appId: answers.appId,
                            type: answers.registerComponentType,
                          }),
                        };
                      },
                      validate(value: string) {
                        return !!value;
                      },
                      message: 'Name of the component:',
                    },
                  ];
                }
                return [];
              },
            },
          ];
        } else if (answers.appRegistrationState === WAS_REGISTERED) {
          return [
            {
              type: 'select',
              name: 'appId',
              message: 'Pick the app you want to use',
              async before(answers, context) {
                context.apps = await getApps();
              },
              async getDynamicChoices(answers, context) {
                return context.apps.map(formatAppOption);
              },
            },
          ];
        }
        return [];
      },
    },
  ];
};
