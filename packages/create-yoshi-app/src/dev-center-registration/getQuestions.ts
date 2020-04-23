import openBrowser from 'react-dev-utils/openBrowser';
import validateUUID from 'uuid-validate';
import { ExtendedPromptObject } from './extended-prompts';

const WILL_REGISTER = 2;
const WAS_REGISTERED = 1;
const WONT_REGISTER = 0;
const OPEN_BROWSER_DELAY = 3000;
const DEV_CENTER_URL = 'https://dev.wix.com/dc3/my-apps';

const getComponentsUrl = (appDefinitionId: any) => {
  return `${DEV_CENTER_URL}/${appDefinitionId}/components`;
};

export default (): Array<ExtendedPromptObject<string>> => {
  return [
    {
      type: 'select',
      name: 'appRegistrationState',
      shouldTerminate(answers) {
        return !!answers.appRegistrationState.value;
      },
      message: 'Do you want to register your app in dev center?',
      choices: [
        { title: 'Yes', value: WILL_REGISTER },
        {
          title: 'No, I have already registered my app in Dev Center',
          value: WAS_REGISTERED,
        },
        { title: "No, I'll register it later", value: WONT_REGISTER },
      ],
    },
    {
      type: 'text',
      name: 'appDefinitionId',
      async before(answers) {
        const actionName =
          answers.appRegistrationState === WILL_REGISTER
            ? 'create a new app and copy'
            : 'copy';
        console.log(
          `In a moment Wix Dev Center page will be opened.\nPlease ${actionName} \`App ID\` which is located under the App Name`,
        );
        const delayCallback = () => {
          if (!openBrowser(DEV_CENTER_URL)) {
            console.log(
              `There is some troubles with opening the browser.\nPlease go to ${DEV_CENTER_URL}, ${actionName} \`App ID\` which is located under the App Name`,
            );
          }
        };

        // We want people to read the message before we navigate him to the browser window
        setTimeout(delayCallback, OPEN_BROWSER_DELAY);
      },
      validate(value) {
        // No tricks here!
        return validateUUID(value);
      },
      message: 'App ID:',
    },
    {
      type: 'text',
      name: 'componentId',
      async before(answers) {
        console.log(
          `Please create a new \`Widget our of iFrame\` and copy \`Component ID\` which is located under the Component Name`,
        );
        const delayCallback = () => {
          const componentsUrl = getComponentsUrl(answers.appDefinitionId);
          if (!openBrowser(componentsUrl)) {
            console.log(
              `There is some troubles with opening the browser.\nPlease go to ${componentsUrl}, create \`Widget our of iFrame\` and copy \`Component ID\` which is located under the App Name`,
            );
          }
        };

        // We want people to read the message before we navigate him to the browser window
        setTimeout(delayCallback, OPEN_BROWSER_DELAY);
      },
      validate(value) {
        // No tricks here!
        return validateUUID(value);
      },
      message: 'App ID:',
    },
  ];
};
