import { applicationDetailPagePO } from '../support/pageObjects/createApplication-po';
import { actions } from '../support/pageObjects/global-po';
import { AddComponentPage } from '../support/pages/AddComponentPage';
import { ApplicationDetailPage } from '../support/pages/ApplicationDetailPage';
import { IntegrationTestsTabPage } from '../support/pages/tabs/IntegrationTestsTabPage';
import { PipelinerunsTabPage } from '../support/pages/tabs/PipelinerunsTabPage';
import { addIntegrationTestStep, Applications } from '../utils/Applications';
import { Common } from '../utils/Common';

describe('Create Components using the UI', () => {
  const applicationName = Common.generateAppName();
  const applicationDetailPage = new ApplicationDetailPage();
  const pipelinerunsTab = new PipelinerunsTabPage();
  const integrationTestsTabPage = new IntegrationTestsTabPage();
  const addComponent = new AddComponentPage();
  const containerImage = 'https://quay.io/kpavic/test-bundle:pipeline';
  const pipelineName = 'demo-pipeline';
  const publicRepos = [
    'https://github.com/dheerajodha/devfile-sample-code-with-quarkus',
  ];
  const componentNames: string[] = ['java-quarkus'];
  const deploymentBody = new Map<string, string>();
  const quarkusDeplomentBody = 'Congratulations, you have created a new Quarkus cloud application';
  const integrationTestNames = ['my-test-1', 'my-optional-test'];
  const integrationTestMetadata = [
    integrationTestNames[1],
    'quay.io/kpavic/test-bundle:pipeline',
    pipelineName,
    'test.appstudio.openshift.io/optional=true',
    applicationName,
  ];

  after(function () {
    Applications.deleteApplication(applicationName);
  });

  describe('Create an Application with a component', () => {
    it('Set Application Name', () => {
      Applications.createApplication(applicationName);
    });

    it('Add a component to Application', () => {
      componentNames[0] = Common.generateAppName(componentNames[0]);
      deploymentBody.set(componentNames[0], quarkusDeplomentBody);

      Applications.createComponent(publicRepos[0], componentNames[0]);
      Applications.createdComponentExists(componentNames[0], applicationName);
    });
  });

  describe('Try to add a new component using the "Overview" tab', () => {
    it("Use 'Components' tabs to start adding a new component", () => {
      Applications.goToOverviewTab().addComponent();
    });

    it('Verify we are on "Add Component" wizard, and then hit Cancel', () => {
      cy.url().should('include', `/import?application=${applicationName}`);
      addComponent.clickCancel();
      cy.url().should('include', `${applicationName}?activeTab=overview`);
    });
  });

  describe('Try to add a new component using the "Components" tab', () => {
    it("Use HACBS 'Components' tabs to start adding a new component", () => {
      Applications.goToComponentsTab().clickAddComponent();
    });

    it('Verify we are on "Add Component" wizard, and then hit Cancel', () => {
      cy.url().should('include', `/import?application=${applicationName}`);
      addComponent.clickCancel();
      cy.url().should('include', `${applicationName}?activeTab=components`);
    });
  });

  describe('Try to add a new component using the "Actions" dropdown', () => {
    it("Click 'Actions' dropdown to add a component", () => {
      Applications.clickActionsDropdown('Add component');
    });

    it('Verify we are on "Add Component" wizard, and then hit Cancel', () => {
      cy.url().should('include', `/import?application=${applicationName}`);
      addComponent.clickCancel();
      cy.url().should('include', `${applicationName}?activeTab=components`)
    });
  });

  describe('Explore Pipeline runs Tab', () => {
    it("Verify the PipelineRuns List view", () => {
      Applications.goToPipelinerunsTab();

      cy.get('tbody').find("tr").then((row) => {
        for (let i = 0; i < row.length; i++) {
          cy.get('tbody tr').eq(i).then(($row) => {
            cy.wrap($row).find('td').eq(0).find('a').then((pipelinerunName) => {
                Applications.createdPipelinerunsSucceeded(pipelinerunName.text().trim());
                pipelinerunsTab.pipelineRunList.push(pipelinerunName.text().trim());
            });
          });
        }
      });
    });
  });

  describe('Check Component Deployment', () => {
    it("Verify the status code and response body of the deployment URL of each component", () => {
      Applications.goToComponentsTab();
      
      for (let componentName of componentNames) {
        applicationDetailPage.expandDetails(componentName);

        cy.get(applicationDetailPagePO.route.replace('{0}', componentName), { timeout: 35000 }).invoke('text').then(route => {
          cy.wait(20000);
          cy.request({
            url: route,
            retryOnStatusCodeFailure: true
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.include(deploymentBody.get(componentName));
          })
        });
      }
    })
  });

  describe.skip('Explore Integration Tests Tab', () => {
    it("Click 'Actions' dropdown to add a integration test", () => {
      Applications.clickActionsDropdown('Add integration test');
      addIntegrationTestStep(integrationTestNames[0]);
    });

    it("Click on 'Integration tests' tab and check the List View", () => {
      Applications.goToIntegrationTestsTab();
      integrationTestsTabPage.checkRowValues(
        integrationTestNames[0],
        containerImage,
        'Mandatory',
        pipelineName,
      );
    });

    it("Add a new Integration Test using 'Actions' dropdown, and mark it as Optional for release", () => {
      Applications.clickActionsDropdown('Add integration test');
      addIntegrationTestStep(integrationTestNames[1], true);

      integrationTestsTabPage.checkRowValues(
        integrationTestNames[1],
        containerImage,
        'Optional',
        pipelineName,
      );
    });

    it("Filter Integration tests by 'Name'", () => {
      // No Integration test should be visible
      integrationTestsTabPage.filterByName('nothing');
      cy.contains('No results found');

      integrationTestsTabPage.filterByName('my-test');
      // Only the first Integration test with prefix "my-test" should be visible
      for (let i = 0; i < integrationTestNames.length - 1; i++) {
        integrationTestsTabPage.checkRowValues(
          integrationTestNames[i],
          containerImage,
          'Mandatory',
          pipelineName,
        );
      }

      // Only the 1 Integration test should be visible, which is Optional for release
      integrationTestsTabPage.filterByName('optional');
      integrationTestsTabPage.checkRowValues(
        integrationTestNames[1],
        containerImage,
        'Optional',
        pipelineName,
      );
    });

    it('Edit Integration Test Details page (with the Optional tag) from Actions and delete it', () => {
      cy.contains(integrationTestNames[1]).click();
      integrationTestsTabPage.checkMetadata(integrationTestMetadata);
      integrationTestsTabPage.verifyLabelAndValue('Optional for release','Optional')

      Applications.clickActionsDropdown('Edit');

      integrationTestsTabPage.editIntegrationTest(null,'demo-pipeline-update','uncheck')

      integrationTestsTabPage.verifyLabelAndValue('Pipeline to run','demo-pipeline-update')
      integrationTestsTabPage.verifyLabelAndValue('Optional for release','Mandatory')

      Applications.clickActionsDropdown('Delete');
      cy.get(actions.deleteModalButton).click();
      cy.get(integrationTestNames[1]).should('not.exist');
    });

    it('Edit Integration Test Details page (with the Mandatory tag) from Kebab Menu', () => {
      integrationTestsTabPage.openKebabMenu(integrationTestNames[0]);
      cy.get(actions.editItem).click();
      integrationTestsTabPage.editIntegrationTest(null,'demo-pipeline-update2','check')
      integrationTestsTabPage.checkRowValues(
        integrationTestNames[0],
        containerImage,
        'Optional',
        'demo-pipeline-update2',
      );

    });

    it('Delete all the remaining Integration Tests from the list view', () => {
      for (let i = 0; i < integrationTestNames.length - 1; i++) {
        integrationTestsTabPage.deleteIntegrationTest(integrationTestNames[i]);
        cy.get(integrationTestNames[i]).should('not.exist');
      }
    });
  });
});
