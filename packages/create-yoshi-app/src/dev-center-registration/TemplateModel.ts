export interface DevCenterComponentModel {
  name: string;
  id: string;
}

export default class TemplateModel {
  readonly appDefinitionId: string;
  readonly components: Array<DevCenterComponentModel>;

  constructor({
    appDefinitionId,
    components,
  }: {
    appDefinitionId: string;
    components: Array<DevCenterComponentModel>;
  }) {
    this.appDefinitionId = appDefinitionId;
    this.components = components;
  }

  getAppDefinitionId() {
    return this.appDefinitionId;
  }

  getComponents() {
    return this.components;
  }
}
