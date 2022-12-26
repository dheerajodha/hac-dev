import { Common } from '../../utils/Common';
import { CPUUnit, MemoryUnit } from '../constants/Units';
import { applicationDetailPagePO, ComponentsPagePO } from '../pageObjects/createApplication-po';
import { alertTitle } from '../pageObjects/global-po';
import { AbstractWizardPage } from './AbstractWizardPage';

export class ComponentPage extends AbstractWizardPage {
  editComponentName(newName: string) {
    cy.get(ComponentsPagePO.editComponentNameIcon).eq(0).click();
    cy.get(ComponentsPagePO.editNameInput).clear().type(newName);
    cy.get(ComponentsPagePO.checkIcon).click();
  }

  saveChanges() {
    cy.get(ComponentsPagePO.saveButton).click();
    Common.waitForLoad();
  }

  addEnvVar(name: string, value: string) {
    cy.get('body').then((body) => {
      if (body.find(ComponentsPagePO.nameInput).length === 0) {
        this.clickAddEnvVar();
      }
      this.setEnvVar(name, value);
    });
  }

  setEnvVar(name: string, value: string) {
    cy.get(ComponentsPagePO.nameInput).type(name);
    cy.get(ComponentsPagePO.valueInput).type(value);
  }

  clickAddEnvVar() {
    cy.get(ComponentsPagePO.addEnvVar).click();
  }

  setReplicas(value: number) {
    cy.get(ComponentsPagePO.replicaInput).clear().type(value.toString());
  }

  setCpuByButton(value: number, unit: CPUUnit) {
    cy.contains(`.pf-c-dropdown__toggle-text`, 'cores').parent().click();
    cy.contains('li', new RegExp(`^${unit}$`)).click();

    cy.get(ComponentsPagePO.cpuInput).then(($cpu) => {
      const diff = value - Number($cpu.val());
      if (diff === 0) {
        return;
      }
      const button = diff > 0 ? ComponentsPagePO.cpuPlusButton : ComponentsPagePO.cpuMinusButton;

      for (let i = 0; i < Math.abs(diff); i++) {
        cy.get(button).click();
      }
    });

    this.checkCpu(value);
  }

  checkCpu(expectedVal: number) {
    cy.get(ComponentsPagePO.cpuInput).then(($cpu) => {
      const realCpu = Number($cpu.val());
      expect(expectedVal).equal(realCpu);
    });
  }

  setRam(value: number, unit: MemoryUnit) {
    cy.get(ComponentsPagePO.memoryInput).clear().type(value.toString());
    cy.contains('div[class="pf-c-form__group"]', 'Memory').find(ComponentsPagePO.dropdown).click();
    cy.contains('li', unit).click();
  }

  showAdvancedOptions() {
    cy.contains('button', ComponentsPagePO.showAdvancedSetting).click();
    cy.testA11y(`Component deployment options`);
  }

  createApplication() {
    cy.get(ComponentsPagePO.create).trigger('click');
    cy.get(ComponentsPagePO.create).should('be.disabled');
    Common.waitForLoad();
  }

  checkAlert(message: string) {
    cy.contains(alertTitle, message).should('exist');
  }

  expandDetails(componentName: string) {
    cy.get(`[aria-label="${componentName}"]`).click();
  }

  sendPullRequest() {
    cy.get(ComponentsPagePO.sendPRCheckbox).click();
  }

  triggerBuilds(componentName: string, publicGitRepo: string) {
    const token = "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"
    const owner = publicGitRepo.split("/")[3];
    const currentGitRepoName = publicGitRepo.split("/")[4];
    cy.log(token, " ", owner, " ", currentGitRepoName, " ");

    cy.wait(20000);

    cy.exec(`curl -s \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${token}"\
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/search/issues?q=${componentName} |
      grep '^ *"number":' | head -1 | sed -e 's/,//g' | cut -d':' -f 2`).then((pullNumber) => {

        cy.log(currentGitRepoName, " :: ", pullNumber.stdout);
            cy.exec(`curl \
              -X POST -H "Authorization: Bearer ${token}" \
              -H "Accept: application/vnd.github+json" \
              -H "X-GitHub-Api-Version: 2022-11-28" \
              https://api.github.com/repos/${owner}/${currentGitRepoName}/issues/${pullNumber.stdout}/comments -d '{"body":"/retest"}'`);
    });
  }
}
