export const overviewTabPO = {
  clickTab: '[data-test="details__tabItem overview"]',
  goToComponents: '[data-test="go-to-components-tab"]',
  addComponent: '[data-test="add-component"]',
};

export const componentsTabPO = {
  clickTab: '[data-test="details__tabItem components"]',
  addComponent: '[data-test="add-component-button"]',
  componentListItem: '[data-test="{0}-component-list-item"]',
};

export const pipelinerunsTabPO = {
  clickTab: '[data-test="details__tabItem pipelineruns"]',

  clickDetailsTab: '[data-test="details__tabItem detail"]',
  statusPO: '[data-test="pipelinerun-details status"]',

  clickTaskRunsTab: '[data-test="details__tabItem taskruns"]',
  taskRunStatus: '[data-test="taskrun-status"]',

  clickLogsTab: '[data-test="details__tabItem logs"]',
  downloadAllTaskLogsButton: 'Download all task logs',
}

export const integrationTestsTabPO = {
  clickTab: '[data-test="details__tabItem integrationtests"]',
  filterInputField: '[data-test="name-input-filter"]',
};

export const actionsDropdown = {
  dropdown: '[data-test="details__actions"]',
  itemAddComponent: '[data-test="add-component"]',
  itemAddEnvironment: '[data-test="add-environment"]',
  itemAddIntegrationTest: '[data-test="add-integration-tests"]',
  itemDeleteApplication: '[data-test="delete-application"]',
  itemLearningResources: '[data-test="learning-resources"]',
};

export const createBuildStepPO = {
  mergePRButton: '[data-testid="merge-button"]',
  next: 'button[type=submit]',
};

export const addIntegrationTestStepPO = {
  displayNameInput: '[data-test="display-name-input"]',
  containerImageInput: '[data-test="container-image-input"]',
  pipelineNameInput: '[data-test="pipeline-name-input"]',
  optionalreleaseCheckbox: '[data-test="optional-release-checkbox"]',
  next: 'button[type=submit]',
  add: '[data-test="submit-button"]',
};
