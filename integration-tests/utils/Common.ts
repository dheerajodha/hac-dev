import { NavItem } from '../support/constants/PageTitle';
import { consentButton, navigation, waits } from '../support/pageObjects/global-po';

export class Common {
  static openAppStudioBaseURL() {
    cy.visit(Cypress.env('HAC_BASE_URL'));
  }

  static navigateTo(link: NavItem) {
    cy.get(navigation.sideNavigation).find(`[data-ouia-component-id="${link}"]`).click();
    Common.waitForLoad();
  }

  static openURL(URL: string) {
    cy.url().then(($url) => {
      if ($url !== URL) {
        cy.visit(URL);
      }
    });
  }

  static generateAppName(prefix = 'test-app') {
    const name = `${prefix}-${new Date().getTime()}`;
    return name.substring(0, name.length - 4);
  }

  static openApplicationURL(applicationName: string) {
    Common.openURL(
      `${Cypress.env('HAC_BASE_URL')}/applications/${applicationName.replace('.', '-')}`,
    );
    Common.verifyPageTitle(applicationName);
    Common.waitForLoad();
  }

  static waitForLoad(timeout = 120000) {
    for (const item of Object.values(waits)) {
      cy.get(item, { timeout }).should('not.exist');
    }
  }

  static verifyPageTitle(title: string) {
    cy.contains('h1', title, { timeout: 180000 }).should('be.visible');
  }

  static clickOnConsentButton() {
    cy.get('body')
      .find(consentButton)
      .its('length')
      .then((res) => {
        if (res > 0) {
          cy.get(consentButton).click();
        }
      });
  }

  static cleanNamespace() {
    if (Cypress.env('CLEAN_NAMESPACE') === 'true') {
      cy.exec('export KUBECONFIG=~/.kube/appstudio-config && ./delete-script.sh', {
        timeout: 600000,
      })
        .its('stdout')
        .should('contain', 'Done running the script');
    }
  }

  static getOrigin(){
    return new URL(Cypress.env('HAC_BASE_URL')).origin;
  }

  static renameGitRepo(publicGitRepo: string): string {
    const token = Cypress.env('GH_TOKEN');
    const owner = publicGitRepo.split("/")[3];
    const repo = publicGitRepo.split("/")[4];
    const newRepoName = this.generateAppName(repo);

    cy.exec(`curl -o - -I ${publicGitRepo} | grep "location:" | cut -d':' -f2,3 | cut -d'/' -f5`).then((currentGitRepoName) => {
      cy.exec(`curl -X PATCH -H "Accept: application/vnd.github+json" -H "Authorization: Bearer ${token}" -H "X-GitHub-Api-Version: 2022-11-28" https://api.github.com/repos/${owner}/${currentGitRepoName.stdout} -d '{"name": "${newRepoName}"}'`);
    })

    return newRepoName;
  }
}
