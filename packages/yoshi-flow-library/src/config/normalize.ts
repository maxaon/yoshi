import { PackageJson } from 'read-pkg';
import defaultsDeep from 'lodash/defaultsDeep';
import { stripOrganization } from 'yoshi-helpers/build/utils';
import {
  Config,
  InitialConfig,
  BundleConfig,
  InitialBundleConfig,
} from './types';

export default (initialConfig: InitialConfig, pkgJson: PackageJson): Config => {
  const { jest = {} } = pkgJson;

  const bundleDefaults: InitialBundleConfig = {
    port: 3300,
    https: false,
    entry: 'index.ts',
    externals: [],
    library: stripOrganization(pkgJson.name!),
  };

  let bundleConfig: BundleConfig | null = null;

  if (initialConfig.bundle) {
    if (initialConfig.bundle === true) {
      initialConfig.bundle = {};
    }

    bundleConfig = defaultsDeep(
      initialConfig.bundle,
      bundleDefaults,
    ) as BundleConfig;

    bundleConfig.url = `${bundleConfig.https ? 'https:' : 'http:'}//localhost:${
      bundleConfig.port
    }/`;
  }

  const config: Config = {
    pkgJson,
    jestConfig: jest,
    bundleConfig,
    storybook: initialConfig.storybook ?? false,
  };

  return config;
};
