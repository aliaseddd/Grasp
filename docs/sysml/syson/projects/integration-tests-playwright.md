# Repo map: integration-tests-playwright

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`integration-tests-playwright`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/integration-tests-playwright) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 22 files there; aider read the 22 that `syson.aiderignore` leaves in, and the map shows 22 of them, 9 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
integration-tests-playwright/.eslintrc.cjs

integration-tests-playwright/.prettierrc

integration-tests-playwright/package-lock.json

integration-tests-playwright/package.json

integration-tests-playwright/playwright.config.ts

integration-tests-playwright/playwright/e2e/diagram-selection.spec.ts

integration-tests-playwright/playwright/e2e/diagram.spec.ts

integration-tests-playwright/playwright/e2e/diagram_node_creation.spec.ts

integration-tests-playwright/playwright/e2e/explorer.spec.ts

integration-tests-playwright/playwright/e2e/rotate-node.spec.ts

integration-tests-playwright/playwright/helpers/PlaywrightDetails.ts:
⋮
│export class PlaywrightDetails {
│  readonly page: Page;
│  readonly detailsLocator: Locator;
│
│  constructor(page: Page) {
│    this.page = page;
│    this.detailsLocator = page.getByTestId('view-Details').first();
│  }
│
│  async addReference(refWidget: string, option: string) {
│    await this.detailsLocator.getByTestId(refWidget).locator('button[title="Open"]').click();
│    await this.page.getByTestId(`option-${option}`).click();
⋮
│  async setText(widget: string, text: string) {
│    const inputField = this.detailsLocator.getByTestId(`input-${widget}`);
│    await inputField.fill(text);
│    await inputField.press('Enter');
⋮
│  async selectTab(label: string) {
│    await this.page.getByTestId(`page-tab-${label}`).click();
⋮
│  async isTabSelected(label: string): Promise<boolean> {
│    return (await this.page.getByTestId(`page-tab-${label}`).getAttribute('aria-selected')) === 'tr
⋮
│  async isReferenceValueSet(refWidget: string, refValue: string): Promise<boolean> {
│    await this.page.waitForFunction(
│      ({ refWidget }) => {
│        return !!document.querySelector(`[data-testid="${refWidget}"]`);
│      },
│      { refWidget },
│      { timeout: 2000 }
│    );
│    const element = this.detailsLocator.getByTestId(refWidget).getByTestId(`reference-value-${refVa
│    return (await element.count()) > 0 && (await element.isVisible());
⋮

integration-tests-playwright/playwright/helpers/PlaywrightDiagram.ts:
⋮
│export class PlaywrightDiagram {
│  readonly page: Page;
│
│  constructor(page: Page) {
│    this.page = page;
│  }
│
│  async expectNumberOfTopNodes(expectedNumberOfTopNodes: number) {
│    expect(await this.page.locator('.react-flow__nodes > div').count()).toBe(expectedNumberOfTopNod
│  }
│
│  async revealElement(name: string) {
│    await this.page.getByTestId('filter-elements').click();
│    const popup = this.page.getByTestId('group-Filter elements');
│    await expect(popup).toBeAttached();
│    await popup.locator(`[data-testid$="${name}"]`).click();
│    //The drop down lack a proper data-testid so we use its sibling
│    await expect(popup.locator(`[data-testid="Apply to 1 selected element:"]`)).toBeAttached();
│    await popup
│      .locator(`[data-testid="Apply to 1 selected element:"]`)
│      .locator('..')
⋮

integration-tests-playwright/playwright/helpers/PlaywrightEdge.ts:
⋮
│export class PlaywrightEdge {
│  readonly page: Page;
│  readonly edgeLocator: Locator;
│
│  constructor(page: Page, index = 0) {
│    this.page = page;
│    this.edgeLocator = page.locator('[data-testid^="rf__edge-"]').nth(index);
│  }
│
│  async click() {
│    await this.edgeLocator.click();
⋮
│  async controlClick() {
│    await this.edgeLocator.click({ modifiers: ['ControlOrMeta'] });
⋮
│  async isSelected() {
│    await expect(this.edgeLocator).toHaveClass(/selected/);
⋮
│  async getEdgePath() {
│    return await this.edgeLocator.locator('path').first().getAttribute('d');
⋮
│  async getEdgeStyle() {
│    return await this.edgeLocator.locator('.react-flow__edge-path').first();
⋮
│  async openPalette() {
│    await this.edgeLocator.click({ button: 'right' });
⋮
│  async closePalette() {
│    await this.page.getByTestId('Close-palette').click();
⋮
│  async getEdgeColor() {
│    const path = this.edgeLocator.locator('path').first();
│    return await path.evaluate((el) => {
│      return window.getComputedStyle(el).getPropertyValue('stroke');
│    });
⋮

integration-tests-playwright/playwright/helpers/PlaywrightExplorer.ts:
⋮
│export class PlaywrightExplorer {
│  readonly page: Page;
│  readonly explorerLocator: Locator;
│
│  constructor(page: Page) {
│    this.page = page;
│    this.explorerLocator = page.locator('[data-testid^="explorer://"]').first();
│  }
│
│  async createRootObject(treeItemLabel: string, domain: string, entity: string) {
│    await this.explorerLocator.getByTestId(`${treeItemLabel}-more`).click();
│    await this.page.getByTestId('new-object').click({ force: true });
│    await this.page.getByTestId('domain').click();
│    await this.page.locator(`[data-value="domain://${domain}"]`).click();
│    await this.page.getByTestId('type').click();
│    await this.page.locator(`[data-value="${entity}"]`).click();
│    await this.page.getByTestId('create-object').click();
⋮
│  async createNewObject(treeItemLabel: string, childCreationDescriptionLabel: string) {
│    await this.explorerLocator.getByTestId(`${treeItemLabel}-more`).click();
│    await this.page.getByTestId('new-object').click({ force: true });
│    await this.page.getByTestId('childCreationDescription').click();
│    await this.page.locator(`[data-value="${childCreationDescriptionLabel}"]`).click();
│    await this.page.getByTestId('create-object').click();
⋮
│  async createRepresentation(
│    treeItemLabel: string,
│    representationDescriptionName: string,
│    representationLabel: string
⋮
│  async select(treeItemLabel: string) {
│    await this.explorerLocator.locator(`[data-treeitemlabel="${treeItemLabel}"]`).click();
⋮
│  async getTreeItemLabel(treeItemLabel: string) {
│    return await this.explorerLocator.locator(`[data-treeitemlabel="${treeItemLabel}"]`);
⋮
│  async expand(treeItemLabel: string) {
│    await this.explorerLocator.locator(`[data-treeitemlabel="${treeItemLabel}"]`).dblclick();
⋮
│  async expandAll(treeItemLabel: string) {
│    await this.explorerLocator.getByTestId(`${treeItemLabel}-more`).click();
│    await this.page.getByTestId('expand-all').isVisible();
│    await this.page.getByTestId('expand-all').click();
⋮
│  async uploadDocument(fileName: string) {
│    await this.page.getByTestId('upload-document-icon').click();
│    await this.page.locator('input[name="file"]').setInputFiles(`./playwright/resources/${fileName}
│    await this.page.getByTestId('upload-document-split-button').click();
│    await this.page.getByTestId('upload-document-close').click();
⋮
│  async dragTo(treeItemLabel: string, target: Locator) {
│    await this.explorerLocator.locator(`[data-treeitemlabel="${treeItemLabel}"]`).dragTo(target);
⋮
│  async revealGlobalSelection() {
│    await this.page.getByTestId('explorer-reveal-selection-button').click();
⋮
│  async showIn(treeItemLabel: string, selectionTargetLabel: string) {
│    await this.explorerLocator.locator(`[data-treeitemlabel="${treeItemLabel}"]`).click();
│    await this.explorerLocator.getByTestId(`${treeItemLabel}-more`).click();
│    await this.page.getByTestId(`push-selection-to-${selectionTargetLabel}`).click();
⋮
│  async insertTextualSysMLv2(treeItemLabel: string, textualContent: string) {
│    await this.explorerLocator.locator(`[data-treeitemlabel="${treeItemLabel}"]`).click();
│    await this.explorerLocator.getByTestId(`${treeItemLabel}-more`).click();
│
│    const menu = 'insert-textual-sysmlv2-menu';
│    const textarea = 'insert-textual-sysmlv2-modal-textarea';
│    const submitButton = 'insert-textual-sysmlv2-submit';
│    const closeButton = 'new-object-from-text-close';
│
│    await this.page.getByTestId(menu).click({ force: true });
⋮

integration-tests-playwright/playwright/helpers/PlaywrightLabel.ts:
⋮
│export class PlaywrightLabel {
│  readonly page: Page;
│  readonly labelLocator: Locator;
│  readonly labelContentLocator: Locator;
│
│  constructor(page: Page, label: string) {
│    this.page = page;
│    this.labelLocator = page.locator(`[data-testid="Label - ${label}"]:not(#hidden-node-container *
│    this.labelContentLocator = page
│      .locator(`[data-testid="Label content - ${label}"]:not(#hidden-node-container *)`)
│      .first();
⋮
│  async getFontSize() {
│    const elementHandle = await this.labelLocator.elementHandle();
│    await this.page.waitForFunction(
│      (element) => {
│        const computedStyle = window.getComputedStyle(element);
│        return computedStyle && computedStyle.fontSize !== undefined;
│      },
│      elementHandle,
│      { timeout: 2000 }
│    );
⋮

integration-tests-playwright/playwright/helpers/PlaywrightNode.ts:
⋮
│export class PlaywrightNode {
│  readonly page: Page;
│  readonly nodeLocator: Locator;
│  readonly nodeStyleLocator: Locator;
│
│  constructor(page: Page, name: string, type: string = 'FreeForm', index = 0) {
│    this.page = page;
│    this.nodeLocator = this.page.locator(`[data-testid^="${type}"][data-testid$="${name}"]`).nth(in
│    this.nodeStyleLocator = this.page.locator(`[data-testid^="${type}"][data-testid$="${name}"]`).f
│  }
│
│  async click() {
│    await this.nodeLocator.click({ position: { x: 10, y: 10 } });
⋮
│  async controlClick() {
│    await this.nodeLocator.click({ position: { x: 10, y: 10 }, modifiers: ['ControlOrMeta'] });
⋮
│  async resetNodeLabelPosition() {
│    await this.openPalette();
│    await this.page.locator(`[data-testid="Reset outside labels positions - Tool"]`).first().click(
⋮
│  async getDOMXYPosition() {
│    const box = (await this.nodeLocator.boundingBox())!;
│    return {
│      x: box.x,
│      y: box.y,
│    };
⋮
│  async getDOMBoundingBox() {
│    return (await this.nodeLocator.boundingBox())!;
⋮
│  async getReactFlowXYPosition(label: string | null = null, withClick = true) {
│    if (withClick) {
│      await this.nodeLocator.click({ position: { x: 10, y: 10 } });
│    }
│    let nodePanel = this.page.locator(`div[data-testid="nodePanelInfos"]`);
│    if (label) {
│      nodePanel = nodePanel.filter({ hasText: `Label : ${label}` });
│    }
│
│    const xSpan = nodePanel.locator('span:has-text("x :")');
⋮
│  async getReactFlowSize(label: string | null = null, withClick = true) {
│    if (withClick) {
│      await this.nodeLocator.click({ position: { x: 10, y: 10 } });
│    }
│    let nodePanel = this.page.locator(`div[data-testid="nodePanelInfos"]`);
│    if (label) {
│      nodePanel = nodePanel.filter({ hasText: `Label : ${label}` });
│    }
│
│    const heightSpan = nodePanel.locator('span:has-text("Height :")');
⋮
│  async move(offset: { x: number; y: number }, steps: number = 10) {
│    const xyPosition = await this.getDOMXYPosition();
│    await this.nodeLocator.hover({ position: { x: 10, y: 10 } });
│    await this.page.mouse.down();
│    await this.page.mouse.move(xyPosition.x + offset.x, xyPosition.y + offset.y, { steps });
│    await this.page.mouse.up();
⋮
│  async resize(offset: { height: number; width: number }, anchor: string = 'bottom.right', steps: n
│    const resizeAnchor = this.nodeLocator.locator(`.react-flow__resize-control.${anchor}`).first();
│
│    const box = (await resizeAnchor.boundingBox())!;
│    await resizeAnchor.hover({ force: true });
│    await this.page.mouse.down();
│    await this.page.mouse.move(box.x + offset.width, box.y + offset.height, { steps });
│    await this.page.mouse.up();
⋮
│  async openPalette() {
│    await this.nodeLocator.click({ button: 'right', position: { x: 10, y: 10 } });
⋮
│  async closePalette() {
│    await this.page.getByTestId('Close-palette').click();
⋮
│  async waitForAnimationToFinish() {
│    // Playwright performs checks before making actions, so Playwright waits for the animation to f
│    // see https://playwright.dev/docs/actionability
│    await this.nodeLocator.click({ trial: true });
⋮
│  async revealElement(name: string) {
│    await this.nodeLocator.hover({ position: { x: 10, y: 10 } });
│    await expect(this.nodeLocator.getByTestId('manage-visibility')).toBeVisible();
│    await this.nodeLocator.getByTestId('manage-visibility').click();
│    await this.page.getByTestId(`manage_visibility_list_item_button_${name}`).click({ force: true }
⋮

integration-tests-playwright/playwright/helpers/PlaywrightNodeLabel.ts:
⋮
│export class PlaywrightNodeLabel {
│  readonly page: Page;
│  readonly labelLocator: Locator;
│
│  constructor(page: Page, name: string) {
│    this.page = page;
│    this.labelLocator = page.locator(`[data-testid="Label - ${name}"]`).first();
│  }
│
│  async click() {
│    await this.labelLocator.click({ position: { x: 10, y: 10 } });
⋮
│  async move(offset: { x: number; y: number }, position: { x: number; y: number }) {
│    await this.labelLocator.hover({ position });
│    await this.page.mouse.down();
│    await this.page.mouse.move(offset.x, +offset.y, { steps: 2 });
│    await this.page.mouse.up();
⋮

integration-tests-playwright/playwright/helpers/PlaywrightProject.ts:
⋮
│export class PlaywrightProject {
│  readonly request: APIRequestContext;
│
│  constructor(request: APIRequestContext) {
│    this.request = request;
│  }
│
│  async createSysMLV2Project(name: string): Promise<{ projectId: string }> {
│    const variables = {
│      input: {
│        id: crypto.randomUUID(),
│        name,
│        templateId: 'sysmlv2-template',
│        libraryIds: [],
│      },
│    };
│    const response = await this.request.post('http://localhost:8080/api/graphql', {
⋮
│  async deleteProject(projectId: string) {
│    const variables = {
│      input: {
│        id: crypto.randomUUID(),
│        projectId,
│      },
│    };
│    const response = await this.request.post('http://localhost:8080/api/graphql', {
│      data: {
│        query: deleteProjectQuery,
⋮
│  async uploadProject(page: Page, fileName: string) {
│    await page.goto(`/upload/project`);
│    await page.locator('input[name="file"]').setInputFiles(`./playwright/resources/${fileName}`);
│    await page.getByTestId('upload-project').click();
⋮

integration-tests-playwright/playwright/helpers/PlaywrightWorkbench.ts:
⋮
│export class PlaywrightWorkbench {
│  readonly page: Page;
│
│  constructor(page: Page) {
│    this.page = page;
│  }
│
│  async performAction(actionLabel: string) {
│    await this.page
│      .locator('[data-testid="onboard-area"]')
│      .locator('[data-testid="actions"]')
│      .getByText(new RegExp('^' + actionLabel + '$', 'i'))
│      .click();
⋮

integration-tests-playwright/playwright/resources/SysMLv2WithGeneralView.sysml

integration-tests-playwright/playwright/resources/SysMLv2WithInterconnectionView.sysml

integration-tests-playwright/tsconfig.json
```
