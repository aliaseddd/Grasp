# Repo map: frontend/syson-components

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`frontend/syson-components`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/frontend/syson-components) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 99 files there; aider read the 99 that `syson.aiderignore` leaves in, and the map shows 52 of them, 52 with definitions. [The README](../../README.md) says how to read it and what it leaves out.

```text
frontend/syson-components/src/extensions/InsertTextualSysMLv2ExplorerToolOverriddenContribution.tsx:
⋮
│export const InsertTextualSysMLv2ExplorerToolOverriddenContribution = forwardRef(
│  (
│    { onInvoked, searchedValue, tool }: PaletteToolOverriddenContributionComponentProps,
│    ref: React.ForwardedRef<HTMLLIElement>
│  ) => {
│    const { editingContextId, item, treeId, readOnly, expandItem, onClose } =
│      useContext<TreePaletteContextValue>(TreePaletteContext);
│
│    const [modal, setModal] = useState<boolean>(false);
│
⋮
│    return (
│      <Fragment key="insert-textual-sysmlv2-context-menu-contribution">
│        <MenuItem
│          key="insert-textual-sysmlv2-menu"
│          onClick={() => {
│            onInvoked();
│            setModal(true);
│          }}
│          data-testid="insert-textual-sysmlv2-menu"
│          disabled={readOnly}
│          ref={ref}>
⋮

frontend/syson-components/src/extensions/InsertTextualSysMLv2Modal.types.ts:
⋮
│export interface InsertTextualSysMLv2ModalProps {
│  editingContextId: string;
│  item: any;
│  onClose: () => void;
⋮
│export interface InsertTextualSysMLv2ModalState {
│  textualContent: string;
│  insertInProgress: boolean;
⋮

frontend/syson-components/src/extensions/NewObjectAsTextDocumentReport.types.ts:
⋮
│export interface NewObjectAsTextReportProps {
│  messages: GQLMessage[];
│  success: Boolean;
⋮
│export interface NewObjectAsTextReportState {
│  downloaded: boolean;
⋮

frontend/syson-components/src/extensions/ShowHideDiagramsIcons.types.ts:
⋮
│export interface GQLSetShowDiagramsIconsPayload {
│  __typename: string;
│  show: boolean;
⋮
│export interface GQLShowDiagramsIconsMutationInput {
│  id: string;
│  editingContextId: string;
│  representationId: string;
│  show: boolean;
⋮

frontend/syson-components/src/extensions/ShowHideDiagramsInheritedMembers.types.ts:
⋮
│export interface GQLSetShowDiagramsInheritedMembersPayload {
│  __typename: string;
│  show: boolean;
⋮
│export interface GQLShowDiagramsInheritedMembersMutationInput {
│  id: string;
│  editingContextId: string;
│  representationId: string;
│  show: boolean;
⋮

frontend/syson-components/src/extensions/ShowHideDiagramsInheritedMembersFromStandardLibraries.types
⋮
│export interface GQLSetShowDiagramsInheritedMembersFromStandardLibrariesPayload {
│  __typename: string;
│  show: boolean;
⋮
│export interface GQLShowDiagramsInheritedMembersFromStandardLibrariesMutationInput {
│  id: string;
│  editingContextId: string;
│  representationId: string;
│  show: boolean;
⋮

frontend/syson-components/src/extensions/SysONExtensionRegistryMergeStrategy.ts:
⋮
│export class SysONExtensionRegistryMergeStrategy
│  extends DefaultExtensionRegistryMergeStrategy
│  implements ExtensionRegistryMergeStrategy
│{
│  public override mergeDataExtensions(
│    identifier: string,
│    existingValues: DataExtension<any>,
│    newValues: DataExtension<any>
│  ): DataExtension<any> {
│    if (identifier === apolloClientOptionsConfigurersExtensionPoint.identifier) {
⋮
│  private mergeApolloClientContributions(
│    existingApolloClientContributions: DataExtension<any>,
│    newApolloClientContributions: DataExtension<any>
⋮
│  private mergeOmniboxCommandOverrideContributions(
│    existingOmniboxCommandOverrideContributions: DataExtension<any>,
│    newOmniboxCommandOverrideContributions: DataExtension<any>
⋮
│  private mergeTreeItemContributions(
│    existingContributions: DataExtension<any>,
│    newContributions: DataExtension<any>
⋮
│  private mergeWidgetContributions(
│    existingContributions: DataExtension<any>,
│    newContributions: DataExtension<any>
⋮
│  private mergePaletteOverrideContributions(
│    existingContributions: DataExtension<any>,
│    newContributions: DataExtension<any>
⋮
│  private mergePaletteContributions(
│    existingContributions: DataExtension<any>,
│    newContributions: DataExtension<any>
⋮

frontend/syson-components/src/extensions/expressions/EditExpressionDiagramToolOverriddenContribution
⋮
│      <ListItemButton
│        onClick={() => {
│          setModalVisible(true);
│          onInvoked();
│        }}
│        data-testid="overridden_tool_edit_expression"
│        disabled={readOnly}
⋮

frontend/syson-components/src/extensions/expressions/EditExpressionExplorerToolOverriddenContributio
⋮
│export const EditExpressionExplorerToolOverriddenContribution = forwardRef(
│  (
│    { onInvoked, searchedValue, tool }: PaletteToolOverriddenContributionComponentProps,
│    ref: React.ForwardedRef<HTMLLIElement>
│  ) => {
│    const { editingContextId, item, treeId, readOnly, onClose } =
│      useContext<TreePaletteContextValue>(TreePaletteContext);
│    const [modalOpened, setModalOpened] = useState<boolean>(false);
│
│    if (!treeId.startsWith('explorer://') || item === null || readOnly) {
⋮
│    return (
│      <Fragment key="edit-sysml-expression-context-menu-contribution">
│        <MenuItem
│          key="edit-sysml-expression-menu"
│          onClick={() => {
│            onInvoked();
│            setModalOpened(true);
│          }}
│          data-testid="edit-sysml-expression-menu"
│          disabled={readOnly}
│          ref={ref}>
⋮

frontend/syson-components/src/extensions/expressions/EditSysMLExpressionModal.types.ts:
⋮
│export interface EditSysMLExpressionModalProps {
│  editingContextId: string;
│  elementId: string;
│  mode: Mode;
│  onClose: () => void;
⋮

frontend/syson-components/src/extensions/expressions/ExpressionFeatureValueProperties.tsx:
⋮
│export interface ExpressionFeatureValuePropertiesProps {
│  disabled: boolean;
│  properties: FeatureValueExpressionProperties;
│  onChange: (properties: FeatureValueExpressionProperties) => void;
⋮

frontend/syson-components/src/extensions/expressions/ExpressionProperties.types.ts:
⋮
│export interface FeatureValueExpressionProperties {
│  isDefault: boolean;
│  isInitial: boolean;
⋮
│export interface GQLExpressionProperties {
│  featureValue: FeatureValueExpressionProperties;
⋮

frontend/syson-components/src/extensions/expressions/ExpressionPropertySection.tsx:
⋮
│type ExpressionPropertySectionState = {
│  state: 'idle' | 'modal';
⋮

frontend/syson-components/src/extensions/expressions/NewExpressionDiagramToolOverriddenContribution.
⋮
│      <ListItemButton
│        onClick={() => {
│          setModalVisible(true);
│          onInvoked();
│        }}
│        data-testid="overridden_tool_new_expression"
│        disabled={readOnly}
⋮

frontend/syson-components/src/extensions/expressions/NewExpressionExplorerToolOverriddenContribution
⋮
│export const NewExpressionExplorerToolOverriddenContribution = forwardRef(
│  (
│    { onInvoked, searchedValue, tool }: PaletteToolOverriddenContributionComponentProps,
│    ref: React.ForwardedRef<HTMLLIElement>
│  ) => {
│    const { editingContextId, item, treeId, readOnly, onClose } =
│      useContext<TreePaletteContextValue>(TreePaletteContext);
│
│    const [modalOpened, setModalOpened] = useState<boolean>(false);
│
⋮
│    return (
│      <Fragment key="new-sysml-expression-context-menu-contribution">
│        <MenuItem
│          key="new-sysml-expression-menu"
│          onClick={() => {
│            onInvoked();
│            setModalOpened(true);
│          }}
│          data-testid="new-sysml-expression-menu"
│          disabled={readOnly}
│          ref={ref}>
⋮

frontend/syson-components/src/extensions/expressions/useCreateExpression.types.ts:
⋮
│export interface UseCreateExpressionValue {
│  createExpression: (
│    editingContextId: string,
│    parentElementId: string,
│    expressionText: string,
│    properties?: GQLExpressionProperties | null
│  ) => void;
│  messages: GQLMessage[] | null;
│  newExpressionId: string | null;
│  loading: boolean;
⋮
│export interface GQLCreateExpressionInput {
│  id: string;
│  editingContextId: string;
│  parentElementId: string;
│  expressionText: string;
│  properties?: GQLExpressionProperties | null;
⋮
│export interface GQLCreateExpressionPayload {
│  __typename: string;
│  messages: GQLMessage[];
⋮

frontend/syson-components/src/extensions/expressions/useDeleteExpression.types.ts:
⋮
│export interface UseDeleteExpressionValue {
│  deleteExpression: (editingContextId: string, elementId: string) => void;
⋮
│export interface GQLDeleteExpressionPayload {
│  __typename: string;
⋮
│export interface GQLDeleteExpressionInput {
│  id: string;
│  editingContextId: string;
│  parentElementId: string;
⋮

frontend/syson-components/src/extensions/expressions/useEditExpression.types.ts:
⋮
│export interface UseEditExpressionValue {
│  editExpression: (
│    editingContextId: string,
│    elementId: string,
│    newValue: string,
│    properties?: GQLExpressionProperties | null
│  ) => void;
│  loading: boolean;
│  newExpressionId: string | null;
│  messages: GQLMessage[] | null;
⋮
│export interface GQLEditExpressionInput {
│  id: string;
│  editingContextId: string;
│  elementId: string;
│  newExpressionText: string;
│  properties?: GQLExpressionProperties | null;
⋮
│export interface GQLEditExpressionPayload {
│  __typename: string;
│  messages: GQLMessage[];
⋮

frontend/syson-components/src/extensions/expressions/useExpressionTextualRepresentation.types.ts:
⋮
│export interface UseExpressionTextualRepresentationValue {
│  editorState: GQLExpressionEditorState | null;
│  loading: boolean;
⋮
│export interface GQLGetExpressionTextualRepresentationViewer {
│  editingContext: GQLGetExpressionTextualRepresentationEditingContext;
⋮
│export interface GQLGetExpressionTextualRepresentationEditingContext {
│  expressionTextualRepresentation: GQLExpressionEditorState | null;
⋮

frontend/syson-components/src/extensions/omnibox/PublishProjectSysMLContentsAsLibraryCommand.types.t
⋮
│export interface PublishProjectSysMLContentsAsLibraryCommandState {
│  open: boolean;
⋮

frontend/syson-components/src/extensions/rotateNodeTool/RotateNodeToolOverriddenContribution.tsx:
⋮
│      <ListItemButton
│        onClick={() => {
│          onInvoked();
│          rotate(representationElementIds);
│        }}
│        data-testid="overridden_tool_node-rotate"
│        disabled={readOnly}
⋮

frontend/syson-components/src/extensions/rotateNodeTool/useRotateNode.types.ts:
⋮
│export interface UseRotateNodeValue {
│  rotate: (representationElementIds: string[]) => void;
⋮

frontend/syson-components/src/extensions/useInsertTextualSysMLv2.types.ts:
⋮
│export interface UseInsertTextualSysMLv2Value {
│  insertTextualSysMLv2: (editingContextId: string, objectId: string, textualContent: string) => voi
│  loading: boolean;
│  textualSysMLv2Inserted: boolean;
│  messages: GQLMessage[];
⋮
│export interface GQLInsertTextualSysMLv2Payload {
│  __typename: string;
│  messages: GQLMessage[];
⋮

frontend/syson-components/src/extensions/useShowDiagramsIcons.types.ts:
⋮
│export interface GQLViewer {
│  showDiagramsIconsValue: boolean;
⋮

frontend/syson-components/src/extensions/useShowDiagramsInheritedMembers.types.ts:
⋮
│export interface GQLViewer {
│  showDiagramsInheritedMembersValue: boolean;
⋮

frontend/syson-components/src/extensions/useShowDiagramsInheritedMembersFromStandardLibraries.types.
⋮
│export interface GQLViewer {
│  showDiagramsInheritedMembersFromStandardLibrariesValue: boolean;
⋮

frontend/syson-components/src/nodes/SysMLNodesDocumentTransform.ts:
⋮
│export const sysMLNodesStyleDocumentTransform = new DocumentTransform((document) => {
│  if (shouldTransform(document)) {
│    const transformedDocument = visit(document, {
│      Field(field) {
│        if (!isNodeStyleFragment(field)) {
│          return undefined;
│        }
│
│        const selections = field.selectionSet?.selections ?? [];
│
│        const sysMLPackageNodeStyleInlineFragment: InlineFragmentNode = {
│          kind: Kind.INLINE_FRAGMENT,
│          selectionSet: {
⋮

frontend/syson-components/src/nodes/imported_package/SysMLImportedPackageNode.tsx:
⋮
│      <>
│        <Typography color={'black'} data-svg="text">
│          {visibilityPart()}
⋮
│      <>
│        <Resizer data={data} selected={!!selected} />
│        <div
│          style={{
│            ...sysMLImportedPackageNodeStyle(theme, data.style, !!selected, data.isHovered, data.fa
│          }}
│          onDragOver={onDragOver}
│          onDrop={handleOnDrop}
│          data-testid={`SysMLImportedPackage - ${data?.insideLabel?.text}`}>
⋮
│            ) : null}
│          </div>
│          <div
│            style={{
│              ...importedPackageContainerStyle(theme, data.style, !!selected, data.isHovered, data.
⋮

frontend/syson-components/src/nodes/imported_package/SysMLImportedPackageNode.types.ts:
⋮
│export interface SysMLImportedPackageNodeData extends NodeData {}
│
│export interface GQLSysMLImportedPackageNodeStyle extends GQLNodeStyle {
│  background: string;
│  borderColor: string;
│  borderStyle: string;
│  borderSize: number;
⋮

frontend/syson-components/src/nodes/imported_package/SysMLImportedPackageNodeLayoutHandler.ts:
⋮
│export class SysMLImportedPackageNodeLayoutHandler implements INodeLayoutHandler<SysMLImportedPacka
│  public canHandle(node: Node<NodeData, DiagramNodeType>): boolean {
│    return node.type === 'sysMLImportedPackageNode';
│  }
│
│  public handle(
│    _layoutEngine: ILayoutEngine,
│    previousDiagram: Diagram | null,
│    node: Node<SysMLImportedPackageNodeData, 'sysMLImportedPackageNode'>,
│    visibleNodes: Node<NodeData, DiagramNodeType>[],
│    _directChildren: Node<NodeData, DiagramNodeType>[],
│    _newlyAddedNodes: Node<NodeData, DiagramNodeType>[],
│    forceDimensions?: ForcedDimensions
⋮
│  private handleLeafNode(
│    previousDiagram: Diagram | null,
│    node: Node<SysMLImportedPackageNodeData, 'sysMLImportedPackageNode'>,
│    visibleNodes: Node<NodeData, DiagramNodeType>[],
│    _borderWidth: number,
│    _forceDimensions?: ForcedDimensions
⋮

frontend/syson-components/src/nodes/imported_package/SysMLImportedPackageNodePaletteAppearanceSectio
⋮
│export interface SysMLImportedPackageNodePaletteAppearanceSectionState {
│  background: string;
│  borderColor: string;
│  borderSize: number;
│  borderStyle: string;
⋮

frontend/syson-components/src/nodes/imported_package/SysMLImportedPackageNodePart.types.ts:
⋮
│export interface GQLSysMLImportedPackageNodeStyle extends GQLNodeStyle {
│  background: string;
│  borderColor: string;
│  borderSize: number;
│  borderStyle: string;
⋮
│export interface SysMLImportedPackageNodePartProps {
│  nodeIds: string[];
│  style: GQLSysMLImportedPackageNodeStyle;
│  customizedStyleProperties: string[];
⋮

frontend/syson-components/src/nodes/imported_package/useUpdateSysMLImportedPackageNodeAppearance.typ
⋮
│export interface UseUpdateSysMLImportedPackageNodeAppearanceValue {
│  updateSysMLImportedPackageNodeAppearance: (
│    editingContextId: string,
│    representationId: string,
│    nodeIds: string[],
│    appearance: Partial<GQLSysMLImportedPackageNodeAppearanceInput>
│  ) => void;
⋮
│export interface GQLEditSysMLImportedPackageNodeAppearanceData {
│  editSysMLImportedPackageNodeAppearance: GQLEditSysMLImportedPackageNodeAppearancePayload;
⋮
│export type GQLEditSysMLImportedPackageNodeAppearancePayload = GQLErrorPayload | GQLSuccessPayload;
│
⋮
│export interface GQLEditSysMLImportedPackageNodeAppearanceInput {
│  id: string;
│  editingContextId: string;
│  representationId: string;
│  nodeIds: string[];
│  appearance: Partial<GQLSysMLImportedPackageNodeAppearanceInput>;
⋮

frontend/syson-components/src/nodes/note/SysMLNoteNode.tsx:
⋮
│      <>
│        <Resizer data={data} selected={!!selected} />
│        <div
│          style={{
│            ...getSysMLNoteNodeContainerStyle(theme, !!selected, data.isHovered, data.faded),
│            ...connectionFeedbackStyle,
│            ...dropFeedbackStyle,
│            ...connectionLineActiveNodeStyle,
│          }}
│          onDragOver={onDragOver}
⋮

frontend/syson-components/src/nodes/note/SysMLNoteNode.types.ts:
⋮
│export interface SysMLNoteNodeData extends NodeData {}
│
│export interface GQLSysMLNoteNodeStyle extends GQLNodeStyle {
│  background: string;
│  borderColor: string;
│  borderStyle: string;
│  borderSize: number;
⋮

frontend/syson-components/src/nodes/note/SysMLNoteNodeLayoutHandler.ts:
⋮
│export class SysMLNoteNodeLayoutHandler implements INodeLayoutHandler<SysMLNoteNodeData> {
│  public canHandle(node: Node<NodeData, DiagramNodeType>): boolean {
│    return node.type === 'sysMLNoteNode';
│  }
│
│  public handle(
│    _layoutEngine: ILayoutEngine,
│    previousDiagram: Diagram | null,
│    node: Node<SysMLNoteNodeData, 'sysMLNoteNode'>,
│    _: Node<NodeData, DiagramNodeType>[],
│    _directChildren: Node<NodeData, DiagramNodeType>[],
│    _newlyAddedNodes: Node<NodeData, DiagramNodeType>[],
│    forceDimensions?: ForcedDimensions
⋮

frontend/syson-components/src/nodes/note/SysMLNoteNodePaletteAppearanceSection.types.ts:
⋮
│export interface SysMLNoteNodePaletteAppearanceSectionState {
│  background: string;
│  borderColor: string;
│  borderSize: number;
│  borderStyle: string;
⋮

frontend/syson-components/src/nodes/note/SysMLNoteNodePart.types.ts:
⋮
│export interface GQLSysMLNoteNodeStyle extends GQLNodeStyle {
│  background: string;
│  borderColor: string;
│  borderSize: number;
│  borderStyle: string;
⋮
│export interface SysMLNoteNodePartProps {
│  nodeIds: string[];
│  style: GQLSysMLNoteNodeStyle;
│  customizedStyleProperties: string[];
⋮

frontend/syson-components/src/nodes/note/useUpdateSysMLNoteNodeAppearance.types.ts:
⋮
│export interface UseUpdateSysMLNoteNodeAppearanceValue {
│  updateSysMLNoteNodeAppearance: (
│    editingContextId: string,
│    representationId: string,
│    nodeIds: string[],
│    appearance: Partial<GQLSysMLNoteNodeAppearanceInput>
│  ) => void;
⋮
│export interface GQLEditSysMLNoteNodeAppearanceData {
│  editSysMLNoteNodeAppearance: GQLEditSysMLNoteNodeAppearancePayload;
⋮
│export type GQLEditSysMLNoteNodeAppearancePayload = GQLErrorPayload | GQLSuccessPayload;
│
⋮
│export interface GQLEditSysMLNoteNodeAppearanceInput {
│  id: string;
│  editingContextId: string;
│  representationId: string;
│  nodeIds: string[];
│  appearance: Partial<GQLSysMLNoteNodeAppearanceInput>;
⋮

frontend/syson-components/src/nodes/package/SysMLPackageNode.tsx:
⋮
│      <>
│        <Resizer data={data} selected={!!selected} />
│        <div
│          style={{
│            ...sysMLPackageNodeStyle(theme, data.style, !!selected, data.isHovered, data.faded),
│          }}
│          onDragOver={onDragOver}
│          onDrop={handleOnDrop}
│          data-testid={`SysMLPackage - ${data?.insideLabel?.text}`}>
⋮
│          <div
│            style={{
│              ...packageContainerStyle(theme, data.style, !!selected, data.isHovered, data.faded),
⋮

frontend/syson-components/src/nodes/package/SysMLPackageNode.types.ts:
⋮
│export interface SysMLPackageNodeData extends NodeData {}
│
│export interface GQLSysMLPackageNodeStyle extends GQLNodeStyle {
│  background: string;
│  borderColor: string;
│  borderStyle: string;
│  borderSize: number;
⋮

frontend/syson-components/src/nodes/package/SysMLPackageNodeLayoutHandler.ts:
⋮
│export class SysMLPackageNodeLayoutHandler implements INodeLayoutHandler<SysMLPackageNodeData> {
│  public canHandle(node: Node<NodeData, DiagramNodeType>): boolean {
│    return node.type === 'sysMLPackageNode';
│  }
│
│  public handle(
│    layoutEngine: ILayoutEngine,
│    previousDiagram: Diagram | null,
│    node: Node<SysMLPackageNodeData, 'sysMLPackageNode'>,
│    visibleNodes: Node<NodeData, DiagramNodeType>[],
│    directChildren: Node<NodeData, DiagramNodeType>[],
│    newlyAddedNodes: Node<NodeData, DiagramNodeType>[],
│    forceDimensions?: ForcedDimensions
⋮
│  private handleParentNode(
│    layoutEngine: ILayoutEngine,
│    previousDiagram: Diagram | null,
│    node: Node<SysMLPackageNodeData, 'sysMLPackageNode'>,
│    visibleNodes: Node<NodeData, DiagramNodeType>[],
│    directChildren: Node<NodeData, DiagramNodeType>[],
│    newlyAddedNodes: Node<NodeData, DiagramNodeType>[],
│    borderWidth: number,
│    forceDimensions?: ForcedDimensions
⋮
│  private handleLeafNode(
│    previousDiagram: Diagram | null,
│    node: Node<SysMLPackageNodeData, 'sysMLPackageNode'>,
│    visibleNodes: Node<NodeData, DiagramNodeType>[],
│    _borderWidth: number,
│    _forceDimensions?: ForcedDimensions
⋮

frontend/syson-components/src/nodes/package/SysMLPackageNodePaletteAppearanceSection.types.ts:
⋮
│export interface SysMLPackageNodePaletteAppearanceSectionState {
│  background: string;
│  borderColor: string;
│  borderSize: number;
│  borderStyle: string;
⋮

frontend/syson-components/src/nodes/package/SysMLPackageNodePart.types.ts:
⋮
│export interface GQLSysMLPackageNodeStyle extends GQLNodeStyle {
│  background: string;
│  borderColor: string;
│  borderSize: number;
│  borderStyle: string;
⋮
│export interface SysMLPackageNodePartProps {
│  nodeIds: string[];
│  style: GQLSysMLPackageNodeStyle;
│  customizedStyleProperties: string[];
⋮

frontend/syson-components/src/nodes/package/useUpdateSysMLPackageNodeAppearance.types.ts:
⋮
│export interface UseUpdateSysMLPackageNodeAppearanceValue {
│  updateSysMLPackageNodeAppearance: (
│    editingContextId: string,
│    representationId: string,
│    nodeIds: string[],
│    appearance: Partial<GQLSysMLPackageNodeAppearanceInput>
│  ) => void;
⋮
│export interface GQLEditSysMLPackageNodeAppearanceData {
│  editSysMLPackageNodeAppearance: GQLEditSysMLPackageNodeAppearancePayload;
⋮
│export type GQLEditSysMLPackageNodeAppearancePayload = GQLErrorPayload | GQLSuccessPayload;
│
⋮
│export interface GQLEditSysMLPackageNodeAppearanceInput {
│  id: string;
│  editingContextId: string;
│  representationId: string;
│  nodeIds: string[];
│  appearance: Partial<GQLSysMLPackageNodeAppearanceInput>;
⋮

frontend/syson-components/src/nodes/view_frame/SysMLViewFrameNode.tsx:
⋮
│      <>
│        <Resizer data={data} selected={!!selected} />
│        <div
│          style={{
│            ...sysMLViewFrameNodeStyle(theme, data.style, selected, data.isHovered, data.faded),
│          }}
│          onDragOver={onDragOver}
│          onDrop={handleOnDrop}
│          data-testid={`SysMLViewFrame - ${data?.insideLabel?.text}`}
│          data-svg="rect">
⋮
│            {data.insideLabel ? <Label diagramElementId={id} label={label} faded={data.faded} /> : 
│          </div>
│          <div
│            style={{
│              ...viewFrameContainerStyle(theme, data.style, data.faded),
│              ...connectionFeedbackStyle,
│              ...dropFeedbackStyle,
│              ...connectionLineActiveNodeStyle,
⋮

frontend/syson-components/src/nodes/view_frame/SysMLViewFrameNode.types.ts:
⋮
│export interface SysMLViewFrameNodeData extends NodeData {}
│
│export interface GQLSysMLViewFrameNodeStyle extends GQLNodeStyle {
│  background: string;
│  borderColor: string;
│  borderRadius: number;
│  borderStyle: string;
│  borderSize: number;
⋮

frontend/syson-components/src/nodes/view_frame/SysMLViewFrameNodeLayoutHandler.ts:
⋮
│export class SysMLViewFrameNodeLayoutHandler implements INodeLayoutHandler<SysMLViewFrameNodeData> 
│  public canHandle(node: Node<NodeData, DiagramNodeType>): boolean {
│    return node.type === 'sysMLViewFrameNode';
│  }
│
│  public handle(
│    layoutEngine: ILayoutEngine,
│    previousDiagram: Diagram | null,
│    node: Node<SysMLViewFrameNodeData, 'sysMLViewFrameNode'>,
│    visibleNodes: Node<NodeData, DiagramNodeType>[],
│    directChildren: Node<NodeData, DiagramNodeType>[],
│    newlyAddedNodes: Node<NodeData, DiagramNodeType>[],
│    forceDimensions?: ForcedDimensions
⋮
│  private handleParentNode(
│    layoutEngine: ILayoutEngine,
│    previousDiagram: Diagram | null,
│    node: Node<SysMLViewFrameNodeData, 'sysMLViewFrameNode'>,
│    visibleNodes: Node<NodeData, DiagramNodeType>[],
│    directChildren: Node<NodeData, DiagramNodeType>[],
│    newlyAddedNodes: Node<NodeData, DiagramNodeType>[],
│    borderWidth: number,
│    forceDimensions?: ForcedDimensions
⋮
│  private handleLeafNode(
│    previousDiagram: Diagram | null,
│    node: Node<SysMLViewFrameNodeData, 'sysMLViewFrameNode'>,
│    visibleNodes: Node<NodeData, DiagramNodeType>[],
│    _borderWidth: number,
│    _forceDimensions?: ForcedDimensions
⋮

frontend/syson-components/src/nodes/view_frame/SysMLViewFrameNodePaletteAppearanceSection.types.ts:
⋮
│export interface SysMLViewFrameNodePaletteAppearanceSectionState {
│  background: string;
│  borderColor: string;
│  borderRadius: number;
│  borderSize: number;
│  borderStyle: string;
⋮

frontend/syson-components/src/nodes/view_frame/SysMLViewFrameNodePart.types.ts:
⋮
│export interface GQLSysMLViewFrameNodeStyle extends GQLNodeStyle {
│  background: string;
│  borderColor: string;
│  borderRadius: number;
│  borderSize: number;
│  borderStyle: string;
⋮
│export interface SysMLViewFrameNodePartProps {
│  nodeIds: string[];
│  style: GQLSysMLViewFrameNodeStyle;
│  customizedStyleProperties: string[];
⋮

frontend/syson-components/src/nodes/view_frame/useUpdateSysMLViewFrameNodeAppearance.types.ts:
⋮
│export interface UseUpdateSysMLViewFrameNodeAppearanceValue {
│  updateSysMLViewFrameNodeAppearance: (
│    editingContextId: string,
│    representationId: string,
│    nodeIds: string[],
│    appearance: Partial<GQLSysMLViewFrameNodeAppearanceInput>
│  ) => void;
⋮
│export interface GQLEditSysMLViewFrameNodeAppearanceData {
│  editSysMLViewFrameNodeAppearance: GQLEditSysMLViewFrameNodeAppearancePayload;
⋮
│export type GQLEditSysMLViewFrameNodeAppearancePayload = GQLErrorPayload | GQLSuccessPayload;
│
⋮
│export interface GQLEditSysMLViewFrameNodeAppearanceInput {
│  id: string;
│  editingContextId: string;
│  representationId: string;
│  nodeIds: string[];
│  appearance: Partial<GQLSysMLViewFrameNodeAppearanceInput>;
⋮

frontend/syson-components/vite.config.js:
⋮
│const isExternal = (id) =>
⋮
│export default defineConfig(() => {
│  const configuration = {
│    plugins: [react()],
│    build: {
│      minify: false,
│      lib: {
│        name: 'syson-components',
│        entry: path.resolve(__dirname, 'src/index.ts'),
│        formats: ['es', 'cjs'],
│        fileName: (format) => `syson-components.${format}.js`,
│      },
│      rollupOptions: {
│        external: isExternal,
⋮
```
