export class PipelinerunsTabPage {
    static clickOnPipelinerunFromListView(pipelinerun: string) {
        cy.contains('a', pipelinerun).click();
    }

    static doesPipelinerunExistsInListView(pipelinerun: string) {
        cy.contains(`[data-test=${pipelinerun}]`);
    }
}
