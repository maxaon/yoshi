export interface DevCenterComponentModel {
  name: string;
  id: string;
  type: string;
}

export default class TemplateModel {
  readonly appDefinitionId: string;
  readonly appName: string;
  readonly components: Array<DevCenterComponentModel>;

  constructor({
    appId,
    appName,
    components,
  }: {
    appId: string;
    appName: string;
    components: Array<DevCenterComponentModel>;
  }) {
    this.appDefinitionId = appId;
    this.appName = appName;
    this.components = components;
  }

  getAppDefinitionId() {
    return this.appDefinitionId;
  }

  getComponents() {
    return this.components;
  }
}
