import { pipelinerunsTabPO } from "../../pageObjects/pages-po";

// Pipelineruns List view page
export class PipelinerunsTabPage {
    public pipelineRunList: string[] = ["defaultName"];

    static clickOnPipelinerunFromListView(pipelinerun: string) {
        cy.contains('a', pipelinerun).click();
    }

    static doesPipelinerunExistsInListView(pipelinerun: string) {
        cy.contains(pipelinerun);
    }
}

// Pipelineruns Details view page
export class DetailsTab {
    static goToDetailsTab() {
        cy.get(pipelinerunsTabPO.clickDetailsTab).click();
    }

    static checkStatusSucceeded() {
        cy.get(pipelinerunsTabPO.statusPO).invoke('text').then(text => {
            if (text.includes('Running')) {
                cy.get(pipelinerunsTabPO.statusPO, { timeout: 720000 }).should('not.have.text', 'Running');
            }

            if (text.includes('Failed')) {
                LogsTab.goToLogsTab();
                cy.screenshot('capture-logs-on-pipelinerun-failure');
            }
        })
    }
}

export class TaskRunsTab {
    static taskNameList: string[] = ['init', 'git-clone', 'sast-snyk-check', 'configure-build', 'buildah',
                                    'clamav-scan', 'sbom-json-check', 'clair-scan', 'sanity-inspect-image',
                                    'deprecated-image-check', 'sanity-label-check', 'sanity-label-check', 'summary'];

    static goToTaskRunsTab() {
        cy.get(pipelinerunsTabPO.clickTaskRunsTab).click();
        return new TaskRunsTab();
    }

    static assertTaskNames() {
        for (let i = 0; i < this.taskNameList.length; i++) {
            cy.get(`[data-test="${i}-0"] > td`).eq(1).then((taskName) => {
                expect(taskName.text().trim()).to.equal(this.taskNameList[i]); 
            });
        }
    }
}

export class LogsTab {
    static goToLogsTab() {
        cy.get(pipelinerunsTabPO.clickLogsTab).click();
    }

    static downloadAllTaskLogs() {
        cy.contains('button', pipelinerunsTabPO.downloadAllTaskLogsButton).click();
    }
}
