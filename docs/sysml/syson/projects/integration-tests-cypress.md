# Repo map: integration-tests-cypress

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`integration-tests-cypress`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/integration-tests-cypress) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 43 files there; aider read the 43 that `syson.aiderignore` leaves in, and the map shows 43 of them, 17 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
integration-tests-cypress/.eslintrc.cjs

integration-tests-cypress/.prettierrc

integration-tests-cypress/.vscode/settings.json

integration-tests-cypress/cypress-dev.config.ts

integration-tests-cypress/cypress.config.ts

integration-tests-cypress/cypress/cypress.d.ts:
⋮
│declare global {
│  namespace Cypress {
│    interface Chainable {
│      getByTestId: (testId: string) => Chainable<JQuery<HTMLElement>>;
│
│      findByTestId: (testId: string) => Chainable<JQuery<HTMLElement>>;
│
│      getCurrentEditingContextId: (
│        projectId: string
│      ) => Chainable<Response<QueryResponse<GetCurrentEditingContextIdData>>>;
│
│      createProject: (
⋮

integration-tests-cypress/cypress/e2e/project/details/details.cy.ts

integration-tests-cypress/cypress/e2e/project/diagrams/diagramCreationTests.cy.ts

integration-tests-cypress/cypress/e2e/project/diagrams/general-view/diagramPanelTests.cy.ts

integration-tests-cypress/cypress/e2e/project/diagrams/general-view/directEditTests.cy.ts

integration-tests-cypress/cypress/e2e/project/diagrams/general-view/dropFromExplorer.cy.ts

integration-tests-cypress/cypress/e2e/project/diagrams/general-view/nodeCreationTests.cy.ts

integration-tests-cypress/cypress/e2e/project/explorer/insertTextualSysMLv2Tests.cy.ts

integration-tests-cypress/cypress/e2e/project/explorer/semanticElementCreationTests.cy.ts

integration-tests-cypress/cypress/pages/Project.ts:
⋮
│export class Project {
│  public visit(projectId: string): Cypress.Chainable<Cypress.AUTWindow> {
│    return cy.visit(`/projects/${projectId}/edit`, {
│      onBeforeLoad(win) {
│        cy.spy(win.console, 'debug').as('consoleDebug');
│      },
│    });
│  }
│
│  public disableDeletionConfirmationDialog(projectId: string): void {
│    cy.window().then((win) => {
│      const disabledIds = this.getDisabledProjectIds(win);
│      if(!disabledIds.includes(projectId)) {
│        win.localStorage.setItem('sirius-confirmation-dialog-disabled', JSON.stringify([projectId, 
│      }
│    });
⋮
│  public enableDeletionConfirmationDialog(projectId: string): void {
│    cy.window().then((win) => {
│      const disabledIds = this.getDisabledProjectIds(win);
│      if(disabledIds.includes(projectId)) {
│        win.localStorage.setItem('sirius-confirmation-dialog-disabled', JSON.stringify(disabledIds.
│      }
│    });
⋮
│  public isDeletionConfirmationDialogDisabled(projectId: string): Cypress.Chainable<boolean> {
│    return cy.window().then((win) => {
│     return this.getDisabledProjectIds(win).includes(projectId);
│    });
⋮
│  private getDisabledProjectIds(win: Cypress.AUTWindow): string[] {
│    const value = win.localStorage.getItem('sirius-confirmation-dialog-disabled');
│    if (value) {
│      return JSON.parse(value);
│    }
│    return [];
⋮

integration-tests-cypress/cypress/pages/Projects.ts:
⋮
│export class Projects {
│  public visit(): Cypress.Chainable<Cypress.AUTWindow> {
│    return cy.visit('/projects');
│  }
│
│  public getCreateProjectLink(): Cypress.Chainable<JQuery<HTMLElement>> {
│    return cy.getByTestId('create');
│  }
│
│  public getUploadProjectLink(): Cypress.Chainable<JQuery<HTMLElement>> {
│    return cy.getByTestId('upload');
⋮
│  public getProjectLink(name: string): Cypress.Chainable<JQuery<HTMLAnchorElement>> {
│    return cy.getByTestId('projects').contains('a', name);
⋮
│  public deleteProject(name: string): void {
│    cy.getByTestId('projects').contains('tr', name).find('[data-testid="more"]').click();
│    cy.getByTestId('delete').click();
│    cy.getByTestId('delete-project').click();
⋮
│  public goBackToTheHomepage(): void {
│    cy.get('[aria-label="Back to the homepage"]').click();
⋮

integration-tests-cypress/cypress/support/e2e.ts

integration-tests-cypress/cypress/support/explorerCommands.js

integration-tests-cypress/cypress/support/reactFlowCommands.js

integration-tests-cypress/cypress/support/server/createDocumentCommand.ts

integration-tests-cypress/cypress/support/server/createDocumentCommand.types.ts:
⋮
│export interface CreateDocumentVariables {
│  input: CreateDocumentInput;
⋮
│export interface CreateDocumentInput {
│  id: string;
│  editingContextId: string;
│  stereotypeId: string;
│  name: string;
⋮
│export interface CreateDocumentData {
│  createDocument: CreateDocumentPayload;
⋮
│export interface CreateDocumentPayload {
│  __typename: string;
⋮
│export interface CreateDocumentSuccessPayload extends CreateDocumentPayload {
│  document: Document;
⋮
│export interface Document {
│  id: string;
⋮

integration-tests-cypress/cypress/support/server/createProjectCommand.ts

integration-tests-cypress/cypress/support/server/createProjectCommand.types.ts:
⋮
│export interface CreateProjectVariables {
│  input: CreateProjectInput;
⋮
│export interface CreateProjectInput {
│  id: string;
│  name: string;
│  templateId: string;
│  libraryIds: string[];
⋮
│export interface CreateProjectData {
│  createProject: CreateProjectPayload;
⋮
│export interface CreateProjectPayload {
│  __typename: string;
⋮
│export interface CreateProjectSuccessPayload extends CreateProjectPayload {
│  project: Project;
⋮
│export interface Project {
│  id: string;
⋮

integration-tests-cypress/cypress/support/server/deleteProjectCommand.ts

integration-tests-cypress/cypress/support/server/deleteProjectCommand.types.ts:
⋮
│export interface DeleteProjectVariables {
│  input: DeleteProjectInput;
⋮
│export interface DeleteProjectInput {
│  id: string;
│  projectId: string;
⋮
│export interface DeleteProjectData {
│  deleteProject: DeleteProjectPayload;
⋮
│export interface DeleteProjectPayload {
│  __typename: string;
⋮

integration-tests-cypress/cypress/support/server/getCurrentEditingContextId.ts

integration-tests-cypress/cypress/support/server/getCurrentEditingContextId.types.ts:
⋮
│export interface GetCurrentEditingContextIdVariables {
│  projectId: string;
│}
│export interface GetCurrentEditingContextIdData {
│  viewer: Viewer;
│}
│export interface Viewer {
│  project: Project;
│}
│export interface Project {
│  currentEditingContext: EditingContext;
│}
│export interface EditingContext {
│  id: string;
⋮

integration-tests-cypress/cypress/support/server/getLibraryId.ts

integration-tests-cypress/cypress/support/server/getLibraryId.types.ts:
⋮
│export interface GetLibraryIdVariables {
│  namespace: string;
│  name: string;
│  version: string;
⋮
│export interface GetLibraryIdData {
│  viewer: Viewer;
⋮
│export interface Viewer {
│  library: Library;
⋮
│export interface Library {
│  id: string;
⋮

integration-tests-cypress/cypress/support/server/graphql.types.ts:
⋮
│export interface QueryResponse<T> {
│  data: QueryData<T>;
⋮
│export type QueryData<T> = {
│  [Key in keyof T]: T[Key];
⋮
│export interface MutationResponse<T> {
│  data: MutationData<T>;
⋮
│export type MutationData<T> = {
│  [Key in keyof T]: T[Key];
⋮

integration-tests-cypress/cypress/support/serverCommands.js

integration-tests-cypress/cypress/support/testIdCommands.ts

integration-tests-cypress/cypress/usecases/Batmobile.ts:
⋮
│export class Batmobile {
│  public createBatmobileProject(): Cypress.Chainable<CreatedProjectData> {
│    return cy.createProject('Batmobile', 'batmobile-template', []).then((res) => {
│      if (!res?.body?.data?.createProject) {
│        throw new Error(
│          'The project Batmobile has not been created: createProject did not return an HTTP respons
│        );
│      }
│      const payload = res.body.data.createProject;
│      if (isCreateProjectSuccessPayload(payload)) {
│        const projectId = payload.project.id;
⋮
│  public getProjectLabel(): string {
│    return 'Batmobile.sysml';
⋮
│  public getRootNamespaceLabel(): string {
│    return 'Namespace';
⋮
│  public getRootElementLabel(): string {
│    return 'Batmobile';
⋮

integration-tests-cypress/cypress/usecases/Batmobile.types.ts:
⋮
│export interface CreatedProjectData {
│  projectId: string;
⋮

integration-tests-cypress/cypress/usecases/SysMLv2.ts:
⋮
│export class SysMLv2 {
│  public createSysMLv2Project(): Cypress.Chainable<CreatedProjectData> {
│    return cy.createProject('SysMLv2', 'sysmlv2-template', []).then((res) => {
│      if (!res?.body?.data?.createProject) {
│        throw new Error(
│          'The project SysMLv2 has not been created: createProject did not return an HTTP response 
│        );
│      }
│      const payload = res.body.data.createProject;
│      if (isCreateProjectSuccessPayload(payload)) {
│        const projectId = payload.project.id;
⋮
│  public getProjectLabel(): string {
│    return 'SysMLv2.sysml';
⋮
│  public getRootNamespaceLabel(): string {
│    return 'Namespace';
⋮
│  public getRootElementLabel(): string {
│    return 'Package1';
⋮
│  public getLibrariesLabel(): string {
│    return 'Libraries';
⋮
│  public getKerMLLabel(): string {
│    return 'KerML [read-only]';
⋮
│  public getSysMLLabel(): string {
│    return 'SysML [read-only]';
⋮

integration-tests-cypress/cypress/usecases/SysMLv2.types.ts:
⋮
│export interface CreatedProjectData {
│  projectId: string;
⋮

integration-tests-cypress/cypress/workbench/Details.ts:
⋮
│export class Details {
│  public getDetailsView(): Cypress.Chainable<JQuery<HTMLElement>> {
│    return cy.getByTestId('view-Details');
│  }
│
│  public getPage(label: string): Cypress.Chainable<JQuery<HTMLInputElement>> {
│    return cy.get(`[data-testid="page-tab-${label}"] div > div`);
│  }
│
│  public getGroup(label: string): Cypress.Chainable<JQuery<HTMLInputElement>> {
│    return this.getDetailsView().find(`[data-testid="group-${label}"]`);
⋮
│  public getTextField(label: string): Cypress.Chainable<JQuery<HTMLInputElement | HTMLTextAreaEleme
│    return this.getDetailsView().find(`[data-testid="input-${label}"]`);
⋮
│  public getCheckBoxInput(label: string): Cypress.Chainable<JQuery<HTMLInputElement>> {
│    return this.getDetailsView().find(`[data-testid="${label}"]`).get('input[type="checkbox"]');
⋮
│  public getRadioOption(label: string, option: string): Cypress.Chainable<JQuery<HTMLInputElement>>
│    return this.getDetailsView().contains('div', label).siblings().find(`[data-testid="${option}"]`
⋮
│  public getReferenceWidget(label: string): Cypress.Chainable<JQuery<HTMLElement>> {
│    return this.getDetailsView().findByTestId(label);
⋮
│  public getReferenceWidgetSelectedValue(
│    referenceWidget: string,
│    value: string
⋮
│  public openReferenceWidgetOptions(label: string): void {
│    this.getReferenceWidget(label).find('button[title="Open"]').click();
⋮
│  public deleteReferenceWidgetOption(referenceWidgetLabel: string, optionLabel: string): void {
│    this.getReferenceWidget(referenceWidgetLabel).findByTestId(`reference-value-${optionLabel}`).fi
⋮
│  public selectReferenceWidgetOption(option: string): void {
│    cy.getByTestId(`option-${option}`).should('exist').click();
⋮
│  public selectValue(selectWidgetLabel: string, valueLabel: string): void {
│    this.getDetailsView().findByTestId(selectWidgetLabel).click();
│    cy.get('ul[role="listbox"]').contains(valueLabel).click();
⋮

integration-tests-cypress/cypress/workbench/Diagram.ts:
⋮
│export class Diagram {
│  public getDiagram(diagramLabel: string): Cypress.Chainable<JQuery<HTMLElement>> {
│    return cy.get(`[data-representation-kind="diagram"][data-representation-label="${diagramLabel}"
│  }
│
│  public fitToScreen() {
│    cy.getByTestId('fit-to-screen').click();
│
│    /* eslint-disable-next-line cypress/no-unnecessary-waiting */
│    cy.wait(4000);
⋮
│  public arrangeAll() {
│    cy.getByTestId('arrange-all-main-button').click();
⋮
│  public getDiagramBackground(diagramLabel: string): Cypress.Chainable<JQuery<HTMLElement>> {
│    return this.getDiagram(diagramLabel).findByTestId('rf__wrapper');
⋮
│  public getNodes(diagramLabel: string, nodeLabel: string): Cypress.Chainable<JQuery<HTMLElement>> 
│    return this.getDiagram(diagramLabel).contains('.react-flow__node', nodeLabel);
⋮
│  public getEdgePaths(diagramLabel: string): Cypress.Chainable<JQuery<HTMLElement>> {
│    return this.getDiagram(diagramLabel).find('.react-flow__edge-path');
⋮
│  public getSelectedNodes(diagramLabel: string, nodeLabel: string): Cypress.Chainable<JQuery<HTMLEl
│    return this.getDiagram(diagramLabel).get('div.react-flow__node.selected').contains('.react-flow
⋮
│  public getPalette(): Cypress.Chainable<JQuery<HTMLElement>> {
│    return cy.getByTestId('Palette');
⋮
│  public getPaletteToolSection(index: number): Cypress.Chainable<JQuery<HTMLDivElement>> {
│    return this.getPalette().should('exist').children('div').eq(index).children('div');
⋮
│  public getGroupPalette(): Cypress.Chainable<JQuery<HTMLElement>> {
│    return cy.getByTestId('GroupPalette');
⋮
│  public getDiagramScale(diagramLabel: string): Cypress.Chainable<number> {
│    return this.getDiagram(diagramLabel)
│      .find('.react-flow__viewport')
│      .invoke('attr', 'style')
│      .then((styleValue) => {
│        let scale = 1;
│        if (styleValue) {
│          const match = /scale\(([^)]+)\)/.exec(styleValue);
│          if (match && match[1]) {
│            scale = parseFloat(match[1]);
⋮
│  public getNodeCssValue(diagramLabel: string, nodeLabel: string, cssValue: string): Cypress.Chaina
│    return this.getNodes(diagramLabel, nodeLabel)
│      .invoke('css', cssValue)
│      .then((widthValue) => {
│        return parseInt(String(widthValue));
│      });
⋮
│  public dragAndDropNode(sourceNodeTestId: string, targetNodeTestId: string): void {
│    cy.window().then((win) => {
│      cy.getByTestId('rf__wrapper')
│        .findByTestId(targetNodeTestId)
│        .then((node) => {
│          const target = node[0];
│          if (target) {
│            const { x, y } = target.getBoundingClientRect();
│            cy.getByTestId('rf__wrapper').findByTestId(sourceNodeTestId).trigger('mousedown', {
│              button: 0,
⋮
│  public isNodeInside(childNodeTestId: string, parentNodeTestId: string): void {
│    cy.window().then(() => {
│      cy.getByTestId(parentNodeTestId).then(($parentNode) => {
│        cy.getByTestId(childNodeTestId).then(($childNode) => {
│          const parentPosition = $parentNode[0]?.getBoundingClientRect();
│          const childPosition = $childNode[0]?.getBoundingClientRect();
│          if (parentPosition && childPosition) {
│            expect(childPosition.top >= parentPosition.top).to.be.true;
│            expect(childPosition.bottom <= parentPosition.bottom).to.be.true;
│            expect(childPosition.left >= parentPosition.left).to.be.true;
⋮
│  public shareDiagram(): void {
│    cy.getByTestId('share').click();
⋮
│  public dropOnDiagram(diagramLabel: string, dataTransfer: DataTransfer, position?: Cypress.Positio
│    const dropPosition = position ? position : 'bottomRight';
│    this.getDiagram(diagramLabel).getByTestId('rf__wrapper').trigger('drop', dropPosition, { dataTr
⋮
│  public roundSvgPathData(pathData: string): string {
│    const pathValues = pathData.split(/([a-zA-Z])/);
│    const roundedPathValues: string[] = [];
│
│    for (let i = 0; i < pathValues.length; i++) {
│      const pathValue = pathValues[i];
│      if (pathValue) {
│        if (pathValue.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g)) {
│          roundedPathValues.push(parseFloat(pathValue).toFixed(2));
│        } else {
⋮
│  public getLabel(labelId: string): Cypress.Chainable<JQuery<HTMLElement>> {
│    return cy.getByTestId(`Label - ${labelId}`);
⋮

integration-tests-cypress/cypress/workbench/Explorer.ts:
⋮
│export class Explorer {
│  public getExplorerView(): Cypress.Chainable<JQuery<HTMLElement>> {
│    return cy.getByTestId('explorer://');
│  }
│
│  public getTreeItemByLabel(treeItemLabel: string): Cypress.Chainable<JQuery<HTMLElement>> {
│    return this.getExplorerView().find(`[data-treeitemlabel="${treeItemLabel}"]`);
│  }
│
│  public getTreeItemByLabelAndKind(
│    treeItemLabel: string,
│    treeItemKind: string
⋮
│  public getTreeItems(): Cypress.Chainable<JQuery<HTMLElement>> {
│    return this.getExplorerView().find('[data-treeitemid]');
⋮
│  public getSelectedTreeItems(): Cypress.Chainable<JQuery<HTMLElement>> {
│    return this.getExplorerView().find('[data-treeitemid][data-testid="selected"]');
⋮
│  public select(treeItemLabel: string, multiSelection: boolean = false, rangeSelection: boolean = f
│    this.getTreeItemByLabel(treeItemLabel).should('exist');
│    if (!multiSelection) {
│      this.getTreeItemByLabel(treeItemLabel).first().click();
│    } else {
│      this.getTreeItemByLabel(treeItemLabel).click({ ctrlKey: multiSelection, shiftKey: rangeSelect
│    }
│    this.getTreeItemByLabel(treeItemLabel).should('have.attr', 'data-testid', 'selected');
⋮
│  public expand(treeItemLabel: string): void {
│    this.getTreeItemByLabel(treeItemLabel).should('have.attr', 'data-expanded', 'false');
│    this.getTreeItemByLabel(treeItemLabel).dblclick();
⋮
│  public collapse(treeItemLabel: string): void {
│    this.getTreeItemByLabel(treeItemLabel).should('have.attr', 'data-expanded', 'true');
│    this.getTreeItemByLabel(treeItemLabel).dblclick();
⋮
│  public rename(treeItemLabel: string, newName: string): void {
│    this.getTreeItemByLabel(treeItemLabel).find('button').click();
│    cy.getByTestId('Palette').findByTestId('rename-tree-item').click();
│    cy.getByTestId('name-edit');
│    cy.getByTestId('name-edit').get('input').should('have.value', treeItemLabel);
│    cy.getByTestId('name-edit').type(`${newName}{enter}`);
│    cy.getByTestId('name-edit').should('not.exist');
│    this.getTreeItemByLabel(newName).should('exist');
⋮
│  public delete(treeItemLabel: string): void {
│    this.getTreeItemByLabel(treeItemLabel).find('button').click();
│    cy.getByTestId('Palette').findByTestId('delete').click();
⋮
│  public expandAll(treeItemLabel: string): void {
│    this.getTreeItemByLabel(treeItemLabel).find('button').click();
│    cy.getByTestId('Palette').findByTestId('expand-all').click();
⋮
│  public dragTreeItem(treeItemLabel: string, dataTransfer: DataTransfer): void {
│    this.getTreeItemByLabel(treeItemLabel).trigger('dragstart', { dataTransfer });
⋮
│  public insertTextualSysMLv2(documentTreeItemLabel: string, textualContent: string) {
│    this.getTreeItemByLabel(documentTreeItemLabel).should('exist').find('button').should('exist').c
│    cy.getByTestId('Palette').should('exist');
│    cy.get('@consoleDebug').should('be.calledWith', 'query getAllContextMenuEntries: response recei
│
│    cy.getByTestId('insert-textual-sysmlv2-menu').should('exist').click();
│    cy.getByTestId('insert-textual-sysmlv2-modal-textarea').should('exist');
│    cy.getByTestId('insert-textual-sysmlv2-submit').should('exist').should('be.disabled');
│    cy.getByTestId('insert-textual-sysmlv2-modal-textarea').type(textualContent);
│    cy.getByTestId('insert-textual-sysmlv2-submit').should('not.be.disabled');
⋮
│  public getFilter(filterLabel: string): Cypress.Chainable<JQuery<HTMLElement>> {
│    cy.getByTestId('tree-filter-menu-icon').click();
│    cy.getByTestId('tree-filter-menu').should('be.visible');
│    return cy.getByTestId(`tree-filter-menu-checkbox-${filterLabel}`);
⋮
│  public createRootObject(documentTreeItemLabel: string, childCreationDescriptionLabel: string) {
│    this.getTreeItemByLabel(documentTreeItemLabel).find('button').click();
│    cy.getByTestId('Palette').should('exist');
│    cy.get('@consoleDebug').should('be.calledWith', 'query getAllContextMenuEntries: response recei
│
│    cy.getByTestId('new-object').click();
│    cy.getByTestId('create-object').should('not.be.disabled');
│
│    // Use get because Sirius Web doesn't provide a usable data-testid
│    cy.get('input[name="suggested"]').should('exist').should('be.checked');
⋮
│  public createObject(objectTreeItemLabel: string, childCreationDescriptionLabel: string) {
│    this.getTreeItemByLabel(objectTreeItemLabel).first().find('button').should('exist').click();
│    cy.getByTestId('Palette').should('exist');
│    cy.get('@consoleDebug').should('be.calledWith', 'query getAllContextMenuEntries: response recei
│
│    cy.getByTestId('new-object').should('exist').click();
│    cy.getByTestId('childCreationDescription')
│      .should('exist')
│      .children('[role="combobox"]')
│      .invoke('text')
⋮
│  public createRepresentation(
│    treeItemLabel: string,
│    representationDescriptionName: string,
│    representationLabel: string
⋮
│  public createNewModel(modelName: string, modelType: string): void {
│    cy.getByTestId('new-model').should('exist');
│    cy.getByTestId('tree-filter-menu-icon').should('exist'); // trick to avoid error if this menu i
│    cy.getByTestId('new-model').click();
│    cy.getByTestId('create-new-model').findByTestId('name-input').type(modelName);
│    cy.getByTestId('create-new-model').findByTestId('stereotype').click();
│    cy.get('li').filter(`:contains("${modelType}")`).click();
│    cy.getByTestId('create-new-model').findByTestId('create-document').click();
⋮

integration-tests-cypress/cypress/workbench/Workbench.ts:
⋮
│export class Workbench {
│  public openRepresentation(representationLabel: string): void {
│    cy.getByTestId(`onboard-open-${representationLabel}`).click();
│  }
│
│  public closeRepresentation(representationLabel: string): void {
│    cy.getByTestId(`close-representation-tab-${representationLabel}`).click();
│  }
│
│  public performAction(actionLabel: string): void {
│    cy.get('[data-testid="onboard-area"]')
│      .find('[data-testid="actions"]')
│      .contains(new RegExp('^' + actionLabel + '$', 'g'))
│      .click();
⋮
│  public showTab(label: string): void {
│    cy.getByTestId(`representation-tab-${label}`).click();
⋮
│  public closeTab(label: string): void {
│    cy.getByTestId(`close-representation-tab-${label}`).click();
⋮
│  public getSnackbar(): Cypress.Chainable<JQuery<HTMLElement>> {
│    return cy.get('#notistack-snackbar');
⋮

integration-tests-cypress/package-lock.json

integration-tests-cypress/package.json

integration-tests-cypress/tsconfig.json
```
