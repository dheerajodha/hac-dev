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

    static checkPipelinerunStatus() {
        cy.wait(25000);
        cy.get(pipelinerunsTabPO.statusPO).invoke('text').then(text => {
            if (text.includes('Running')) {
                cy.get(pipelinerunsTabPO.statusPO, { timeout: 900000 }).should('not.have.text', 'Running');
            }
        });

        cy.get(pipelinerunsTabPO.statusPO).invoke('text').then(text => {
            cy.log("Latest status is: ", text);

            if (text.includes('Succeeded')) {
                TaskRunsTab.goToTaskRunsTab().assertTaskNamesAndTaskRunStatus();
            }
            else if (text.includes('Failed')) {
                LogsTab.goToLogsTab();
                cy.screenshot('capture-logs-on-pipelinerun-failure', {capture: 'fullPage'});
            }
        });
    }
}

// Pipelineruns Details view page
export class DetailsTab {
    static goToDetailsTab() {
        cy.get(pipelinerunsTabPO.clickDetailsTab).click();
    }

    static checkStatusSucceeded() {
        cy.wait(5000);
        cy.get(pipelinerunsTabPO.statusPO, {withinSubject:null}).invoke('text').then(text => {
            if (text.includes('Running')) {
                cy.get(pipelinerunsTabPO.statusPO, { timeout: 720000 }).should('not.have.text', 'Running');
            }

            if (text.includes('Failed')) {
                LogsTab.goToLogsTab();
                cy.screenshot('capture-logs-on-pipelinerun-failure', {capture: 'fullPage'});
            }
        })
    }
}

export class TaskRunsTab {
    taskNameList: string[] = ['init', 'git-clone', 'configure-build', 'sast-snyk-check', 'buildah', 'deprecated-image-check',
                                    'clamav-scan', 'sbom-json-check', 'sanity-inspect-image', 'clair-scan',
                                    'sanity-label-check', 'sanity-label-check', 'summary'];

    static goToTaskRunsTab() {
        cy.get(pipelinerunsTabPO.clickTaskRunsTab).click();
        return new TaskRunsTab();
    }

    assertTaskNamesAndTaskRunStatus() {
        for (let i = 0; i < this.taskNameList.length; i++) {
            cy.get(`[data-test="${i}-0"] > td`).eq(1).then((taskName) => {
                expect(this.taskNameList.includes(taskName.text().trim())).to.equal(true);
            });

            cy.get(`[data-test="${i}-0"] > td`).eq(3).within(() => {
                cy.get(pipelinerunsTabPO.taskRunStatus).invoke('text').then(status => {
                    if (status.includes('Failed')) {
                        cy.screenshot('taskrun-failed-even-though-pipelinerun-succeeded', {capture: 'fullPage'});
                        return;
                    }
                    else if (status.includes('Pending')) {
                        cy.screenshot('taskrun-pending-even-though-pipelinerun-succeeded', {capture: 'fullPage'});
                        return;
                    }
                })
            });
        }
    }
}

export class LogsTab {
    static goToLogsTab() {
        cy.get(pipelinerunsTabPO.clickLogsTab, {withinSubject:null}).click();
    }

    static downloadAllTaskLogs() {
        cy.contains('button', pipelinerunsTabPO.downloadAllTaskLogsButton).click();
    }
}
