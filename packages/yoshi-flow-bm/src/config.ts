import path from 'path';
import {
  getProjectArtifactId,
  readJsonSilent,
} from 'yoshi-helpers/build/utils';
import { MODULE_CONFIG_PATH } from './constants';

export interface FlowBMConfig {
  moduleId: string;
  routeNamespace: string;
  topology: Record<string, { artifactId: string }>;
}

export function readModuleConfig(cwd: string): FlowBMConfig {
  const {
    moduleId = getProjectArtifactId(cwd)!,
    routeNamespace = '',
    topology = {
      staticsUrl: {
        artifactId: getProjectArtifactId(cwd)!,
      },
    },
  }: Partial<FlowBMConfig> = readJsonSilent(path.join(cwd, MODULE_CONFIG_PATH));

  return {
    moduleId,
    routeNamespace,
    topology,
  };
}

export interface PageConfig {
  componentId: string;
  componentName: string;
}

export function readPageConfig(
  { moduleId }: FlowBMConfig,
  pagePath: string,
): PageConfig {
  const { dir, name } = path.parse(pagePath);
  const {
    componentId = `${moduleId}.pages.${path.parse(pagePath).name}`,
    componentName,
  }: Partial<PageConfig> = readJsonSilent(path.join(dir, `${name}.json`));

  return { componentId, componentName: componentName ?? componentId };
}

export interface ExportedComponentConfig {
  componentId: string;
}

export function readExportedComponentConfig(
  { moduleId }: FlowBMConfig,
  componentPath: string,
): ExportedComponentConfig {
  const { dir, name } = path.parse(componentPath);
  const {
    componentId = `${moduleId}.components.${path.parse(componentPath).name}`,
  }: Partial<ExportedComponentConfig> = readJsonSilent(
    path.join(dir, `${name}.json`),
  );

  return { componentId };
}

export interface MethodConfig {
  methodId: string;
}

export function readMethodConfig(
  { moduleId }: FlowBMConfig,
  methodPath: string,
): MethodConfig {
  const { dir, name } = path.parse(methodPath);
  const {
    methodId = `${moduleId}.methods.${path.parse(methodPath).name}`,
  }: Partial<MethodConfig> = readJsonSilent(path.join(dir, `${name}.json`));

  return { methodId };
}
