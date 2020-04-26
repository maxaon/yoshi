// eslint-disable-next-line import/no-extraneous-dependencies
import webpack from 'webpack';
import { createBaseWebpackConfig } from 'yoshi-common/build/webpack.config';
import { isSingleEntry } from 'yoshi-helpers/build/queries';
import { stripOrganization } from 'yoshi-helpers/build/utils';
import { Config, BundleConfig } from './config/types';

export function createClientWebpackConfig(
  config: Config,
  {
    isDev,
    isHot,
    isAnalyze,
    forceEmitSourceMaps,
    forceEmitStats,
  }: {
    isDev?: boolean;
    isHot?: boolean;
    suricate?: boolean;
    isAnalyze?: boolean;
    forceEmitSourceMaps?: boolean;
    forceEmitStats?: boolean;
  } = {},
): webpack.Configuration {
  const bundleConfig = config.bundleConfig as BundleConfig;
  const { entry, url, library, externals } = bundleConfig;

  const name = stripOrganization(config.pkgJson.name!);

  const clientConfig = createBaseWebpackConfig({
    name,
    useTypeScript: true,
    typeCheckTypeScript: false,
    devServerUrl: url,
    configName: 'client',
    target: 'web',
    isDev,
    isHot,
    isAnalyze,
    forceEmitSourceMaps,
    forceEmitStats,
    // it's actually being passed as a Library to webpack
    // @ts-ignore and not as a string
    exportAsLibraryName: library,
    cssModules: true,
    separateCss: true,
    useProgressBar: false,
  });

  clientConfig.entry = isSingleEntry(entry)
    ? { [stripOrganization(name)]: entry as string }
    : entry;

  clientConfig.externals = externals;
  clientConfig.output!.filename = isDev ? '[name].umd.js' : '[name].umd.min.js';
  clientConfig.output!.umdNamedDefine = true;

  return clientConfig;
}
