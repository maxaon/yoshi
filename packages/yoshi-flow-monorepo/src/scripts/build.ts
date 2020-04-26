import path from 'path';
import arg from 'arg';
import fs from 'fs-extra';
import chalk from 'chalk';
import {
  printBuildResult,
  printBundleSizeSuggestion,
} from 'yoshi-common/build/print-build-results';
import WebpackManager from 'yoshi-common/build/webpack-manager';
import {
  STATICS_DIR,
  TARGET_DIR,
  SERVER_CHUNKS_BUILD_DIR,
  SERVER_BUNDLE,
} from 'yoshi-config/build/paths';
import { inTeamCity as checkInTeamCity } from 'yoshi-helpers/build/queries';
import { copyTemplates } from 'yoshi-common/build/copy-assets';
import { stripOrganization } from 'yoshi-helpers/build/utils';
import { cliCommand } from '../bin/yoshi-monorepo';
import {
  createClientWebpackConfig,
  createServerWebpackConfig,
  createWebWorkerWebpackConfig,
  createWebWorkerServerWebpackConfig,
} from '../webpack.config';
import buildPkgs from '../build';

const inTeamCity = checkInTeamCity();

const build: cliCommand = async function(argv, rootConfig, { apps, libs }) {
  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--analyze': Boolean,
      '--stats': Boolean,
      '--source-map': Boolean,

      // Aliases
      '-h': '--help',
    },
    { argv },
  );

  const {
    '--help': help,
    '--analyze': isAnalyze,
    '--stats': forceEmitStats,
    '--source-map': forceEmitSourceMaps,
  } = args;

  if (help) {
    console.log(
      `
      Description
        Compiles the application for production deployment

      Usage
        $ yoshi-monorepo build

      Options
        --help, -h      Displays this message
        --analyze       Run webpack-bundle-analyzer
        --stats         Emit webpack's stats file on "target/webpack-stats.json"
        --source-map    Emit bundle source maps
    `,
    );

    process.exit(0);
  }

  console.log(JSON.stringify(args._));

  const appNames = args._;

  if (appNames.length) {
    appNames.forEach(appName => {
      const pkg = apps.find(pkg => stripOrganization(pkg.name) === appName);

      if (!pkg) {
        console.log(
          chalk.red(
            `Could not find an app with the name of ${appName} to build`,
          ),
        );
        console.log();
        console.log(chalk.red('Aborting'));

        return process.exit(1);
      }
    });

    apps = apps.filter(app => appNames.includes(stripOrganization(app.name)));
  }

  await buildPkgs([...libs, ...apps]);

  await Promise.all(
    apps.reduce((acc: Array<Promise<void>>, app) => {
      return [
        ...acc,
        fs.emptyDir(path.join(app.location, STATICS_DIR)),
        fs.emptyDir(path.join(app.location, TARGET_DIR)),
        fs.emptyDir(path.join(app.location, SERVER_CHUNKS_BUILD_DIR)),
        fs.unlink(path.join(app.location, SERVER_BUNDLE)).catch(() => {}),
      ];
    }, []),
  );

  await Promise.all(apps.map(app => copyTemplates(app.location)));

  if (inTeamCity) {
    const petriSpecs = await import('yoshi-common/build/sync-petri-specs');
    const wixMavenStatics = await import('yoshi-common/build/maven-statics');

    await Promise.all(
      apps.reduce((acc: Array<Promise<void>>, app) => {
        return [
          ...acc,
          petriSpecs.default({
            config: app.config.petriSpecsConfig,
            cwd: app.location,
          }),
          wixMavenStatics.default({
            clientProjectName: app.config.clientProjectName,
            staticsDir: app.config.clientFilesPath,
            cwd: app.location,
          }),
        ];
      }, []),
    );
  }

  const webpackManager = new WebpackManager();

  apps.forEach(pkg => {
    const clientDebugConfig = createClientWebpackConfig(rootConfig, pkg, {
      isDev: true,
      forceEmitSourceMaps,
    });

    const clientOptimizedConfig = createClientWebpackConfig(rootConfig, pkg, {
      isAnalyze,
      forceEmitSourceMaps,
      forceEmitStats,
    });

    const serverConfig = createServerWebpackConfig(rootConfig, libs, pkg, {
      isDev: true,
    });

    let webWorkerConfig;
    let webWorkerOptimizeConfig;

    if (pkg.config.webWorkerEntry) {
      webWorkerConfig = createWebWorkerWebpackConfig(rootConfig, pkg, {
        isDev: true,
      });

      webWorkerOptimizeConfig = createWebWorkerWebpackConfig(rootConfig, pkg, {
        forceEmitStats,
      });
    }

    let webWorkerServerConfig;

    if (pkg.config.webWorkerServerEntry) {
      webWorkerServerConfig = createWebWorkerServerWebpackConfig(pkg, {
        isDev: true,
      });
    }

    webpackManager.addConfigs(pkg.name, [
      clientDebugConfig,
      clientOptimizedConfig,
      serverConfig,
      webWorkerConfig,
      webWorkerOptimizeConfig,
      webWorkerServerConfig,
    ]);
  });

  const { getAppData } = await webpackManager.run();

  apps.forEach(pkg => {
    console.log(chalk.bold.underline(pkg.name));
    console.log();

    const [, clientOptimizedStats, serverStats] = getAppData(pkg.name).stats;

    printBuildResult({
      webpackStats: [clientOptimizedStats, serverStats],
      cwd: pkg.location,
    });

    console.log();
  });

  printBundleSizeSuggestion();
};

export default build;
