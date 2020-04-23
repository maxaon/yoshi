import testkit from '@wix/wix-bootstrap-testkit';
import {
  createTestkit,
  testkitConfigBuilder,
  anAppConfigBuilder,
} from '@wix/business-manager/dist/testkit';

const bootstrapServer = () => {
  return testkit.app(require.resolve('yoshi-server/bootstrap'), {
    env: process.env,
  });
};

const getTestKitConfig = async (
  { withRandomPorts } = { withRandomPorts: false },
) => {
  const serverUrl = 'http://localhost:3200/';
  const serviceId = 'com.wixpress.{%projectName%}';
  const path = '../app-config-templates/module_{%PROJECT_NAME%}.json';

  const moduleConfig = anAppConfigBuilder()
    .fromJsonTemplate(require(path)) //  replace this line with the next once your config is merged
    // .fromModuleId('{%PROJECT_NAME%}')
    .withArtifactMapping({ [serviceId]: { url: serverUrl } })
    .build();

  let builder = testkitConfigBuilder()
    .registerApi({
      serviceId: '{%projectName%}',
      serverUrl: 'http://localhost:3000',
    })
    .withModulesConfig(moduleConfig)
    .autoLogin();

  if (withRandomPorts) {
    builder = builder.withRandomPorts();
  }

  return builder.build();
};

export const environment = async envConfig => {
  const bmApp = createTestkit(await getTestKitConfig(envConfig));
  const app = bootstrapServer();
  return {
    app,
    bmApp,
  };
};
