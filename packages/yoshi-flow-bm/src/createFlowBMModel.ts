import path from 'path';
import globby from 'globby';
import { watch } from 'chokidar';
import {
  readModuleConfig,
  readExportedComponentConfig,
  readMethodConfig,
  readPageConfig,
  FlowBMConfig,
} from './config';
import {
  EXPORTED_COMPONENTS_PATTERN,
  METHODS_PATTERN,
  MODULE_INIT_PATTERN,
  PAGES_PATTERN,
  TRANSLATIONS_DIR,
} from './constants';

export interface ExportedComponentModel {
  componentId: string;
  componentPath: string;
}
export interface PageModel extends ExportedComponentModel {
  componentName: string;
  route: string;
}
export interface MethodModel {
  methodId: string;
  methodPath: string;
}

export interface FlowBMModel {
  moduleId: string;
  pages: Array<PageModel>;
  exportedComponents: Array<ExportedComponentModel>;
  methods: Array<MethodModel>;
  moduleInitPath?: string;
  localePath?: string;
  config: FlowBMConfig;
}

export default function createFlowBMModel(cwd = process.cwd()): FlowBMModel {
  const globFiles = (pattern: string) =>
    globby.sync(pattern, { cwd, absolute: true, onlyFiles: true });

  const globDirs = (pattern: string) =>
    globby.sync(pattern, {
      cwd,
      absolute: true,
      onlyDirectories: true,
      expandDirectories: false,
    });

  const config = readModuleConfig(cwd);

  const getPageModel = (componentPath: string): PageModel => {
    const { name } = path.parse(componentPath);
    const { componentId, componentName } = readPageConfig(
      config,
      componentPath,
    );
    const route = path.join(
      config.routeNamespace,
      ...path
        .relative(path.join(cwd, PAGES_PATTERN), componentPath)
        .split(path.delimiter)
        .slice(0, -1),
      name !== 'index' ? name : '',
    );

    return {
      componentId,
      componentName,
      componentPath,
      route,
    };
  };

  const getExportedComponentModel = (
    componentPath: string,
  ): ExportedComponentModel => {
    const { componentId } = readExportedComponentConfig(config, componentPath);

    return {
      componentId,
      componentPath,
    };
  };

  const getMethodModel = (methodPath: string): MethodModel => {
    const { methodId } = readMethodConfig(config, methodPath);

    return {
      methodId,
      methodPath,
    };
  };

  const pages = globFiles(PAGES_PATTERN).map(getPageModel);

  const exportedComponents = globFiles(EXPORTED_COMPONENTS_PATTERN).map(
    getExportedComponentModel,
  );

  const methods = globFiles(METHODS_PATTERN).map(getMethodModel);

  const [moduleInitPath] = globFiles(MODULE_INIT_PATTERN);
  const [localePath] = globDirs(TRANSLATIONS_DIR);

  return {
    moduleId: config.moduleId,
    config,
    pages,
    exportedComponents,
    methods,
    localePath,
    moduleInitPath,
  };
}

export function watchFlowBMModel(
  handler: (model: FlowBMModel) => void,
  cwd = process.cwd(),
) {
  const watcher = watch(
    [
      PAGES_PATTERN,
      EXPORTED_COMPONENTS_PATTERN,
      METHODS_PATTERN,
      MODULE_INIT_PATTERN,
      TRANSLATIONS_DIR,
    ],
    {
      cwd,
    },
  );

  watcher.on('all', () => handler(createFlowBMModel(cwd)));
}
