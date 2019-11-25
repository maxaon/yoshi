import Insight from 'insight';
import config from 'yoshi-config';
import semver from 'semver';
import { isTypescriptProject as checkIsTypescriptProject } from 'yoshi-helpers/queries';

const insight = new Insight({
  trackingCode: 'UA-120893726-1',
  // @ts-ignore
  clientId: config.name,
  packageName: 'yoshi',
});

const { version: yoshiVersion } = require('../package.json');

const version = semver.parse(yoshiVersion)?.major;

const isTypescriptProject = checkIsTypescriptProject();

export async function collectData() {
  insight.trackEvent({
    category: 'version',
    action: `${version}`,
    label: config.name,
  });

  insight.trackEvent({
    category: 'language',
    action: isTypescriptProject ? 'ts' : 'js',
    label: config.name,
  });

  // Since we call `process.exit()` directly we have to wait
  return new Promise(resolve => setImmediate(resolve));
}
