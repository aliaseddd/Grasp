# Repo map: backend/views/syson-diagram-common-view

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/views/syson-diagram-common-view`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/views/syson-diagram-common-view) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 177 files there; aider read the 158 that `syson.aiderignore` leaves in, and the map shows 45 of them, 45 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/DiagramD
⋮
│public class DiagramDefaultGroupToolsFactory {
│
│    private static final String HAS_CHILDREN_EXPRESSION = "aql:selectedNodes.getChildNodes()->notEm
│
│    private static final String HAS_HIDDEN_CHILDREN_EXPRESSION = "aql:selectedNodes.getChildNodes()
│
│    public NodeToolSection createDefaultHideRevealNodeToolSection() {
│        NodeToolSection nodeToolSection = DiagramFactory.eINSTANCE.createNodeToolSection();
│        nodeToolSection.setName("Show/Hide");
│        nodeToolSection.getNodeTools().add(this.createDefaultHideNodeTool());
│        nodeToolSection.getNodeTools().add(this.createDefaultHideAllChildrenNodeTool());
│        nodeToolSection.getNodeTools().add(this.createDefaultRevealAllChildrenNodeTool());
│        nodeToolSection.getNodeTools().add(this.createDefaultResetAllChildrenVisibilityModifiersNod
│        nodeToolSection.getNodeTools().add(this.createDefaultRevealChildrenWithValueNodeTool());
│        return nodeToolSection;
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/DiagramD
⋮
│public class DiagramDefaultToolsFactory {
│
│    private static final String HAS_CHILDREN_EXPRESSION = "aql:selectedNode.getChildNodes()->notEmp
│
│    private static final String HAS_HIDDEN_CHILDREN_EXPRESSION = "aql:selectedNode.getChildNodes()-
│
│    public NodeToolSection createDefaultHideRevealNodeToolSection() {
│        NodeToolSection nodeToolSection = DiagramFactory.eINSTANCE.createNodeToolSection();
│        nodeToolSection.setName("Show/Hide");
│        nodeToolSection.getNodeTools().add(this.createDefaultHideNodeTool());
│        nodeToolSection.getNodeTools().add(this.createDefaultHideAllChildrenNodeTool());
│        nodeToolSection.getNodeTools().add(this.createDefaultRevealAllChildrenNodeTool());
│        nodeToolSection.getNodeTools().add(this.createDefaultResetAllChildrenVisibilityModifiersNod
│        nodeToolSection.getNodeTools().add(this.createDefaultRevealChildrenWithValueNodeTool());
│        return nodeToolSection;
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/ViewDiag
⋮
│public class ViewDiagramElementFinder implements IViewObjectCache, IViewDiagramElementFinder {
│
│    private final Map<String, List<EObject>> data = new HashMap<>();
│
│    @Override
│    public void put(EObject eObject) {
│        var eObjects = this.data.getOrDefault(eObject.eClass().getName(), new ArrayList<>());
│        eObjects.add(eObject);
│        this.data.put(eObject.eClass().getName(), eObjects);
│    }
│
│    @Override
│    public Optional<NodeDescription> getNodeDescription(String name) {
⋮
│    @Override
│    public Optional<EdgeDescription> getEdgeDescription(String name) {
⋮
│    @Override
│    public List<NodeDescription> getNodeDescriptions() {
⋮
│    @Override
│    public List<EdgeDescription> getEdgeDescriptions() {
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/edges/Ab
⋮
│public abstract class AbstractDependencyEdgeDescriptionProvider extends AbstractEdgeDescriptionProv
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public AbstractDependencyEdgeDescriptionProvider(IColorProvider colorProvider, IDescriptionName
│        super(colorProvider);
│        this.descriptionNameGenerator = Objects.requireNonNull(descriptionNameGenerator);
│    }
│
│    /**
⋮
│    protected abstract String getName();
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/edges/Ab
⋮
│public abstract class AbstractEdgeDescriptionProvider implements IEdgeDescriptionProvider {
│
│    protected final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    protected final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    protected final DiagramDefaultToolsFactory diagramDefaultToolsFactory = new DiagramDefaultTools
│
│    protected IColorProvider colorProvider;
│
⋮
│    protected EdgePalette createEdgePalette(IViewDiagramElementFinder cache) {
│        List<EdgeReconnectionTool> reconnectTools = List.of(this.createSourceReconnectTool(), this.
│        var edgeBuilder = this.diagramBuilderHelper
│                .newEdgePalette()
│                .edgeReconnectionTools(reconnectTools.toArray(EdgeReconnectionTool[]::new));
│
│        if (this.isDeletable()) {
│            edgeBuilder.deleteTool(this.getEdgeDeleteTool());
│        }
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/nodes/Ab
⋮
│public abstract class AbstractControlNodeActionNodeDescriptionProvider extends AbstractNodeDescript
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public AbstractControlNodeActionNodeDescriptionProvider(IColorProvider colorProvider, IDescript
│        super(colorProvider);
│        this.descriptionNameGenerator = Objects.requireNonNull(descriptionNameGenerator);
│    }
│
│    /**
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/nodes/Ab
⋮
│public abstract class AbstractDefinitionNodeDescriptionProvider extends AbstractNodeDescriptionProv
│
│    protected final EClass eClass;
│
│    protected final UtilService utilServices;
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public AbstractDefinitionNodeDescriptionProvider(EClass eClass, IColorProvider colorProvider, I
│        super(colorProvider);
⋮
│    protected abstract List<NodeDescription> getAllNodeDescriptions(IViewDiagramElementFinder cache
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/nodes/Ab
⋮
│public abstract class AbstractNodeDescriptionProvider implements INodeDescriptionProvider {
│
│    protected final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    protected final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    protected final DiagramDefaultToolsFactory diagramDefaultToolsFactory = new DiagramDefaultTools
│
│    protected final IColorProvider colorProvider;
│
⋮
│    protected ImageNodeStyleDescription createImageNodeStyleDescription(String shapeId) {
│        return this.createImageNodeStyleDescription(shapeId, this.colorProvider.getColor("transpare
⋮
│    protected ImageNodeStyleDescription createImageNodeStyleDescription(String imagePath, UserColor
│        return this.diagramBuilderHelper.newImageNodeStyleDescription()
│                .borderColor(borderColor)
│                .borderRadius(0)
│                .positionDependentRotation(isRotable)
│                .shape(imagePath)
│                .build();
⋮
│    protected NodeTool getDuplicateElementAndNodeTool() {
│        return this.diagramBuilderHelper.newNodeTool()
│                .name("Duplicate Element")
│                .iconURLsExpression("/images/content_copy.svg")
│                .preconditionExpression(AQLConstants.AQL + "self.oclIsKindOf(sysml::Element) and (n
│                        + " or self.oclIsKindOf(sysml::Usage) or self.oclIsKindOf(sysml::Definition
│                .body(this.viewBuilderHelper.newChangeContext()
│                        .expression(
│                                ServiceMethod.of4(DiagramMutationAQLService.class, DiagramMutationA
│                                                DiagramContext.class, List.class, Map.class)
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/nodes/Ab
⋮
│public abstract class AbstractPackageNodeDescriptionProvider extends AbstractNodeDescriptionProvide
│
│    protected final IDescriptionNameGenerator descriptionNameGenerator;
│
│    protected final ToolDescriptionService toolDescriptionService;
│
│    public AbstractPackageNodeDescriptionProvider(IColorProvider colorProvider, IDescriptionNameGen
│        super(colorProvider);
│        this.descriptionNameGenerator = Objects.requireNonNull(descriptionNameGenerator);
│        this.toolDescriptionService = new ToolDescriptionService(descriptionNameGenerator);
⋮
│    protected abstract List<NodeDescription> getAllNodeDescriptions(IViewDiagramElementFinder cache
│
⋮
│    private NodeTool createNodeTool(NodeDescription nodeDescription, EClass eClass) {
│        if (SysmlPackage.eINSTANCE.getNamespaceImport().equals(eClass)) {
│            return new NamespaceImportNodeToolProvider(nodeDescription, this.descriptionNameGenerat
│        }
│
│        var updateExposedElements = this.viewBuilderHelper.newChangeContext()
│                .expression(ServiceMethod.of4(DiagramMutationAQLService::expose).aqlSelf(CoreVariab
│                        ViewDiagramDescriptionConverter.CONVERTED_NODES_VARIABLE));
│
│        var changeContextNewInstance = this.viewBuilderHelper.newChangeContext()
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/nodes/Ab
⋮
│public abstract class AbstractUsageNodeDescriptionProvider extends AbstractNodeDescriptionProvider 
│
│    protected final EClass eClass;
│
│    protected final UtilService utilServices;
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    private String precondition;
│
⋮
│    protected abstract List<NodeDescription> getAllNodeDescriptions(IViewDiagramElementFinder cache
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/nodes/Ad
⋮
│public class AddYourFirstElement {
│
│    public static final String COLOR_NAME = "AddYourFirstElement";
│    
│    public static final String BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAwYAAAFbCAYA
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/nodes/As
⋮
│public class AssumeConstraintCompartmentItemNodeDescription extends CompartmentItemNodeDescriptionP
│    public static final String COMPARTMENT_ITEM_NAME = " assume constraint";
│
│    public AssumeConstraintCompartmentItemNodeDescription(EClass eClass, EReference eReference, ICo
│        super(eClass, eReference, colorProvider, descriptionNameGenerator);
│    }
│
│    @Override
│    protected String getDomainType() {
│        return SysMLMetamodelHelper.buildQualifiedName(SysmlPackage.eINSTANCE.getElement());
⋮
│    @Override
│    protected String getName() {
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/nodes/Co
⋮
│public class CompartmentItemNodeDescriptionProvider extends AbstractNodeDescriptionProvider {
│
│    protected final EClass eClass;
│
│    protected final EReference eReference;
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public CompartmentItemNodeDescriptionProvider(EClass eClass, EReference eReference, IColorProvi
│        super(colorProvider);
⋮
│    public EReference getEReference() {
│        return this.eReference;
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│public abstract class AbstractViewNodeToolSectionSwitch extends SysmlEClassSwitch<List<NodeToolSect
│
│    protected final IDescriptionNameGenerator descriptionNameGenerator;
│
│    protected final ViewBuilders viewBuilderHelper;
│
│    protected final DiagramBuilders diagramBuilderHelper;
│
│    protected final ToolDescriptionService toolDescriptionService;
│
⋮
│    protected abstract List<NodeDescription> getAllNodeDescriptions();
│
⋮
│    protected NodeDescription getNodeDescription(EClass eClass) {
│        return this.getAllNodeDescriptions().stream()
│                .filter(nd -> this.descriptionNameGenerator.getNodeName(eClass).equals(nd.getName()
│                .findFirst()
│                .get();
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│public abstract class AbstractViewNodeToolsWithoutSectionSwitch extends SysmlEClassSwitch<List<Node
│
│    protected final IDescriptionNameGenerator descriptionNameGenerator;
│
│    protected final ViewBuilders viewBuilderHelper;
│
│    protected final DiagramBuilders diagramBuilderHelper;
│
│    public AbstractViewNodeToolsWithoutSectionSwitch(IDescriptionNameGenerator descriptionNameGener
│        this.viewBuilderHelper = new ViewBuilders();
⋮
│    protected abstract List<NodeDescription> getAllNodeDescriptions();
│
│    protected NodeDescription getNodeDescription(EClass eClass) {
│        return this.getAllNodeDescriptions().stream()
│                .filter(nd -> Objects.equals(this.descriptionNameGenerator.getNodeName(eClass), nd.
│                .findFirst()
│                .orElseGet(() -> null);
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│public class DefinitionOwnedUsageDescriptionService {
│
│    /**
│     * Returns the most specific Definition owned-usage reference accepting the given Usage type.
│     *
│     * @param usageType
│     *            the Usage type to own
│     * @return the matching owned-usage reference, if any
│     */
│    public Optional<EReference> getOwnedUsageReference(EClass usageType) {
⋮
│    private List<EReference> getOwnedUsageReferences() {
│        return SysmlPackage.eINSTANCE.getDefinition().getEAllReferences().stream()
│                .filter(reference -> reference.getName().startsWith("owned"))
│                .filter(reference -> SysmlPackage.eINSTANCE.getUsage().isSuperTypeOf(reference.getE
│                .toList();
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│@Service
│public class ShowDiagramsIconsService {
│
⋮
│    public void setShowIcons(boolean showIcons) {
│        this.showIcons = showIcons;
⋮
│    public boolean getShowIcons() {
│        return this.showIcons;
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│public class UsageNestedUsageDescriptionService {
│
│    /**
│     * Returns every nested-usage reference declared by {@code Usage}, in a stable order.
│     *
│     * @return the nested-usage references
│     */
│    public List<EReference> getNestedUsageReferences() {
│        return SysmlPackage.eINSTANCE.getUsage().getEAllReferences().stream()
│                .filter(reference -> reference.getName().startsWith("nested"))
│                .filter(reference -> reference.getEReferenceType() instanceof EClass eClass && Sysm
│                .sorted(Comparator.comparing(EReference::getName))
│                .toList();
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│public class ViewEdgeToolService {
│
│    private static final String METAMODEL_ICONS_PATH = "/icons/full/obj16/";
│
│    private static final String SVG = ".svg";
│
│    private static final String NEW_INSTANCE = "newInstance";
│
│    private final ViewBuilders viewBuilderHelper;
│
⋮
│    public Optional<NodeDescription> getNodeDescription(EClassifier classifier) {
│        if (classifier == null) {
│            return Optional.empty();
│        }
│        return this.allNodeDescriptions.stream()
│                .filter(nd -> nd.getDomainType().equals(classifier.getEPackage().getNsPrefix() + ":
│                .findFirst();
⋮
│    private If revealNewParentCompartment(String parentNode, String parentElement) {
│        var isInterconnectionView = ServiceMethod.of4(DiagramQueryAQLService.class, DiagramQueryAQL
│                Element.class, String.class, Node.class, IEditingContext.class, DiagramContext.clas
│                .aql(parentElement, AQLUtils.aqlString(StandardDiagramsConstants.IV_QN), parentNode
│                        CoreVariables.EDITING_CONTEXT.name(), DiagramContext.DIAGRAM_CONTEXT);
│
│        var revealCompartment = this.viewBuilderHelper.newChangeContext()
│                .expression(ServiceMethod.of4(DiagramMutationAQLService::revealCompartment).aql(par
│                        DiagramContext.DIAGRAM_CONTEXT, CoreVariables.EDITING_CONTEXT.name(), ViewD
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│@QueryDataFetcher(type = "Mutation", field = "showDiagramsIcons")
│public class MutationShowDiagramsIconsDataFetcher implements IDataFetcherWithFieldCoordinates<Compl
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│@QueryDataFetcher(type = "Mutation", field = "showDiagramsInheritedMembers")
│public class MutationShowDiagramsInheritedMembersDataFetcher implements IDataFetcherWithFieldCoordi
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│@QueryDataFetcher(type = "Mutation", field = "showDiagramsInheritedMembersFromStandardLibraries")
│public class MutationShowDiagramsInheritedMembersFromStandardLibrariesDataFetcher implements IDataF
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│@QueryDataFetcher(type = "Viewer", field = "showDiagramsInheritedMembersValue")
│public class ShowDiagramsInheritedMembersDataFetcher implements IDataFetcherWithFieldCoordinates<Bo
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│@QueryDataFetcher(type = "Viewer", field = "showDiagramsInheritedMembersFromStandardLibrariesValue"
│public class ShowDiagramsInheritedMembersFromStandardLibrariesDataFetcher implements IDataFetcherWi
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│public class NodeToolSectionNameSwitch extends SysmlEClassSwitch<String> {
│
│    @Override
│    public String defaultCase(EObject object) {
│        return ToolConstants.STRUCTURE;
│    }
│
│    @Override
│    public String caseAcceptActionUsage(AcceptActionUsage object) {
│        return ToolConstants.BEHAVIOR;
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│public class ToolConstants {
│
│    public static final String ANALYSIS = "Analysis";
│
│    public static final String BEHAVIOR = "Behavior";
│
│    public static final String EXTENSION = "Extension";
│
│    public static final String REQUIREMENTS = "Requirements";
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/services
⋮
│public class ToolDescriptionService {
│
│    protected static final String NEW_INSTANCE = "newInstance";
│
│    protected final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    protected final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    protected final NodeToolSectionNameSwitch nodeToolSectionNameSwitch = new NodeToolSectionNameSw
│
⋮
│    public NodeTool addExistingElementsTool(boolean recursive, boolean nested) {
│        var builder = this.diagramBuilderHelper.newNodeTool();
│
│        var addToExposedElements = this.viewBuilderHelper.newChangeContext()
│                .expression(
│                        ServiceMethod.of5(DiagramMutationAQLService.class, DiagramMutationAQLServic
│                                Node.class, java.util.Map.class).aqlSelf("" + recursive, CoreVariab
│                                        ViewDiagramDescriptionConverter.CONVERTED_NODES_VARIABLE));
│
│        var changeContextViewUsageOwner = this.viewBuilderHelper.newChangeContext()
⋮
│    private NodeTool addExistingConnectedElementsTool(boolean group) {
│        String receiver = "self";
│        String selectedNode = Node.SELECTED_NODE;
│        String elements = "Sequence{self}";
│        String nodes = "Sequence{selectedNode}";
│        if (group) {
│            receiver = "self->first()";
│            selectedNode = "n";
│            elements = "self";
│            nodes = "selectedNodes";
⋮
│    private NodeTool addExistingElementsGroupTool(boolean recursive) {
│        String title = "Add existing elements";
│        String iconURL = "/icons/AddExistingElements.svg";
│        if (recursive) {
│            title += " (recursive)";
│            iconURL = "/icons/AddExistingElementsRecursive.svg";
│        }
│
│        return this.diagramBuilderHelper.newNodeTool()
│                .name(title)
⋮
│    public NodeToolSection buildRequirementsSection(NodeTool... nodeTools) {
│        return this.diagramBuilderHelper.newNodeToolSection()
│                .name(ToolConstants.REQUIREMENTS)
│                .nodeTools(nodeTools)
│                .build();
⋮
│    public NodeToolSection buildStructureSection(NodeTool... nodeTools) {
│        return this.diagramBuilderHelper.newNodeToolSection()
│                .name(ToolConstants.STRUCTURE)
│                .nodeTools(nodeTools)
│                .build();
⋮
│    public NodeToolSection buildBehaviorSection(NodeTool... nodeTools) {
│        return this.diagramBuilderHelper.newNodeToolSection()
│                .name(ToolConstants.BEHAVIOR)
│                .nodeTools(nodeTools)
│                .build();
⋮
│    public NodeToolSection buildAnalysisSection(NodeTool... nodeTools) {
│        return this.diagramBuilderHelper.newNodeToolSection()
│                .name(ToolConstants.ANALYSIS)
│                .nodeTools(nodeTools)
│                .build();
⋮
│    public NodeToolSection buildExtensionSection(NodeTool... nodeTools) {
│        return this.diagramBuilderHelper.newNodeToolSection()
│                .name(ToolConstants.EXTENSION)
│                .nodeTools(nodeTools)
│                .build();
⋮
│    public NodeToolSection buildViewAsSection(NodeTool... nodeTools) {
│        return this.diagramBuilderHelper.newNodeToolSection()
│                .name(ToolConstants.VIEW_AS)
│                .nodeTools(nodeTools)
│                .build();
⋮
│    public NodeTool createNodeTool(NodeDescription nodeDescription, EClass eClass) {
│        return this.createNodeToolWithDirection(nodeDescription, eClass, null, null);
⋮
│    public NodeTool createNodeTool(NodeDescription nodeDescription, EClass eClass, NodeContainmentK
│        return this.createNodeToolWithDirection(nodeDescription, eClass, nodeKind, null);
⋮
│    public NodeTool createNodeTool(NodeDescription nodeDescription, EClass eClass, EClass membershi
│        return this.createNodeToolWithDirection(nodeDescription, eClass, membershipEClass, nodeKind
⋮
│    public NodeTool createNodeToolWithDirection(NodeDescription nodeDescription, EClass eClass, Nod
│        return this.createNodeToolWithDirection(nodeDescription, eClass, SysmlPackage.eINSTANCE.get
⋮
│    public NodeTool createNodeToolFromDiagramBackground(NodeDescription nodeDescription, EClass eCl
│        return this.createNodeToolFromDiagramWithDirection(nodeDescription, eClass, null);
⋮
│    public NodeTool createNodeToolFromDiagramWithDirection(NodeDescription nodeDescription, EClass 
│        var builder = this.diagramBuilderHelper.newNodeTool();
│
│        // make sure that the given element is a feature to avoid error at runtime.
│        if (!SysmlPackage.eINSTANCE.getFeature().isSuperTypeOf(eClass) && direction != null) {
│            return this.createNodeToolFromDiagramBackground(nodeDescription, eClass);
│        }
│
│        var setDirection = this.viewBuilderHelper.newSetValue().featureName("direction");
│
⋮
│    public NodeTool createNodeToolWithDirection(NodeDescription nodeDescription, EClass eClass, ECl
│        // make sure that the given element is a feature to avoid error at runtime.
│        if (!SysmlPackage.eINSTANCE.getFeature().isSuperTypeOf(eClass) && direction != null) {
│            return this.createNodeTool(nodeDescription, eClass, nodeKind);
│        }
│
│        var builder = this.diagramBuilderHelper.newNodeTool();
│
│        var setDirection = this.viewBuilderHelper.newSetValue().featureName("direction");
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Ab
⋮
│public abstract class AbstractCompartmentNodeToolProvider implements INodeToolProvider {
│
│    private static final String NEW_INSTANCE = "newInstance";
│
│    protected final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    protected final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    /**
│     * Return the AQL service call expression that is interpreted to perform the node tool.
⋮
│    protected String getPreconditionExpression() {
│        return null;
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Ab
⋮
│public abstract class AbstractFreeFormCompartmentNodeToolProvider implements INodeToolProvider {
│
│    protected final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    protected final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    protected final IDescriptionNameGenerator descriptionNameGenerator;
│
│    protected final String compartmentName;
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Ac
⋮
│public class ActorCompartmentNodeToolProvider extends AbstractCompartmentNodeToolProvider {
│
│    @Override
│    protected String getServiceCallExpression() {
│        return ServiceMethod.of1(DiagramMutationAQLService::createPartUsageAsActor).aqlSelf("select
│    }
│
│    @Override
│    protected SelectionDialogDescription getSelectionDialogDescription() {
│        String partUsageType = SysMLMetamodelHelper.buildQualifiedName(SysmlPackage.eINSTANCE.getPa
⋮
│    @Override
│    protected String getNodeToolName() {
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/As
⋮
│public class AssumeConstraintNodeToolProvider implements INodeToolProvider {
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    @Override
│    public NodeTool create(IViewDiagramElementFinder cache) {
│        var builder = this.diagramBuilderHelper.newNodeTool();
│
⋮
│    private String getToolName() {
│        return "New Assume constraint";
⋮
│    private DialogDescription getDialogDescription() {
│        String constraintUsageType = SysMLMetamodelHelper.buildQualifiedName(SysmlPackage.eINSTANCE
│
│        var selectionDialogTree = this.diagramBuilderHelper.newSelectionDialogTreeDescription()
│                .isSelectableExpression(AQLConstants.AQL_SELF + ".oclIsKindOf(" + constraintUsageTy
│                .elementsExpression(ServiceMethod.of0(TreeQueryAQLService::getConstraintReferenceSe
│                .childrenExpression(ServiceMethod.of2(TreeQueryAQLService::getConstraintReferenceSe
│                .build();
│
│        return this.diagramBuilderHelper.newSelectionDialogDescription()
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Fr
⋮
│public class FramedConcernNodeToolProvider implements INodeToolProvider {
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    @Override
│    public NodeTool create(IViewDiagramElementFinder cache) {
│        var builder = this.diagramBuilderHelper.newNodeTool();
│
⋮
│    private String getToolName() {
│        return "New Framed Concern";
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Ob
⋮
│public class ObjectiveRequirementCompartmentNodeToolProvider extends AbstractCompartmentNodeToolPro
│
│    @Override
│    protected String getServiceCallExpression() {
│        return ServiceMethod.of1(DiagramMutationAQLService::createRequirementUsageAsObjectiveRequir
│    }
│
│    @Override
│    protected SelectionDialogDescription getSelectionDialogDescription() {
│        String reqUsageType = SysMLMetamodelHelper.buildQualifiedName(SysmlPackage.eINSTANCE.getReq
⋮
│    @Override
│    protected String getPreconditionExpression() {
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Oc
⋮
│public class OccurrenceUsageSnapshotNodeToolProvider implements INodeToolProvider {
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    @Override
│    public NodeTool create(IViewDiagramElementFinder cache) {
│
│        var setIsPortion = this.viewBuilderHelper.newSetValue()
⋮
│    private DialogDescription getDescriptionDialog() {
│        return this.diagramBuilderHelper.newSelectionDialogDescription()
│                .optional(true)
│                .defaultTitleExpression("New Snapshot")
│                .descriptionExpression("Create a default snapshot or select the type of snapshot yo
│                .noSelectionActionDescriptionExpression("The default snapshot is an Occurrence")
│                .noSelectionActionLabelExpression("Create a default snapshot")
│                .noSelectionActionStatusMessageExpression("A snapshot Occurrence will be created")
│                .noSelectionTitleExpression("New Snapshot")
│                .withSelectionActionDescriptionExpression("Select in the list below which kind of s
⋮
│    private SelectionDialogTreeDescription getDialogTreeDescriptionDialog() {
│        return this.diagramBuilderHelper.newSelectionDialogTreeDescription()
│                .elementsExpression(ServiceMethod.of0(TreeQueryAQLService::getPortionKindSelectionD
│                .isSelectableExpression(AQLConstants.AQL_TRUE)
│                .build();
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Oc
⋮
│public class OccurrenceUsageTimesliceNodeToolProvider implements INodeToolProvider {
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    @Override
│    public NodeTool create(IViewDiagramElementFinder cache) {
│
│        var setIsPortion = this.viewBuilderHelper.newSetValue()
⋮
│    private DialogDescription getDescriptionDialog() {
│        return this.diagramBuilderHelper.newSelectionDialogDescription()
│                .optional(true)
│                .defaultTitleExpression("New Timeslice")
│                .descriptionExpression("Create a default timeslice or select the type of timeslice 
│                .noSelectionActionDescriptionExpression("The default timeslice is an Occurrence")
│                .noSelectionActionLabelExpression("Create a default timeslice")
│                .noSelectionActionStatusMessageExpression("A timeslice Occurrence will be created")
│                .noSelectionTitleExpression("New Timeslice")
│                .withSelectionActionDescriptionExpression("Select in the list below which kind of t
⋮
│    private SelectionDialogTreeDescription getDialogTreeDescriptionDialog() {
│        return this.diagramBuilderHelper.newSelectionDialogTreeDescription()
│                .elementsExpression(ServiceMethod.of0(TreeQueryAQLService::getPortionKindSelectionD
│                .isSelectableExpression(AQLConstants.AQL_TRUE)
│                .build();
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Pa
⋮
│public class PartUsageBindingConnectorAsUsageNodeToolProvider implements INodeToolProvider {
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public PartUsageBindingConnectorAsUsageNodeToolProvider(IDescriptionNameGenerator descriptionNa
│        this.descriptionNameGenerator = Objects.requireNonNull(descriptionNameGenerator);
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Re
⋮
│public class RequireConstraintNodeToolProvider implements INodeToolProvider {
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    @Override
│    public NodeTool create(IViewDiagramElementFinder cache) {
│        var builder = this.diagramBuilderHelper.newNodeTool();
│
⋮
│    private String getToolName() {
│        return "New Require constraint";
⋮
│    private DialogDescription getDialogDescription() {
│        String constraintUsageType = SysMLMetamodelHelper.buildQualifiedName(SysmlPackage.eINSTANCE
│
│        var selectionDialogTree = this.diagramBuilderHelper.newSelectionDialogTreeDescription()
│                .isSelectableExpression(AQLConstants.AQL_SELF + ".oclIsKindOf(" + constraintUsageTy
│                .elementsExpression(ServiceMethod.of0(TreeQueryAQLService::getConstraintReferenceSe
│                .childrenExpression(ServiceMethod.of2(TreeQueryAQLService::getConstraintReferenceSe
│                .build();
│
│        return this.diagramBuilderHelper.newSelectionDialogDescription()
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Sa
⋮
│public class SatisfyRequirementNodeToolProvider implements INodeToolProvider {
│
│    private static final String TOOL_NAME = "New Satisfy Requirement";
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    @Override
│    public NodeTool create(IViewDiagramElementFinder cache) {
⋮
│    private DialogDescription getDialogDescription() {
│        var reqUsageType = SysMLMetamodelHelper.buildQualifiedName(SysmlPackage.eINSTANCE.getRequir
│        var defType = SysMLMetamodelHelper.buildQualifiedName(SysmlPackage.eINSTANCE.getDefinition(
│        var selectableTypes = List.of(reqUsageType, defType);
│
│        var selectionDialogTreeDescription = this.diagramBuilderHelper.newSelectionDialogTreeDescri
│                .elementsExpression(ServiceMethod.of1(TreeQueryAQLService::getSelectionDialogElemen
│                .childrenExpression(
│                        ServiceMethod.of3(TreeQueryAQLService::getSelectionDialogChildren).aqlSelf(
│                .isSelectableExpression(AQLConstants.AQL + "self.oclIsKindOf(" + defType + ") or se
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Se
⋮
│public class SetAsCompositeToolProvider implements INodeToolProvider {
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    @Override
│    public NodeTool create(IViewDiagramElementFinder cache) {
│        var builder = this.diagramBuilderHelper.newNodeTool();
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Se
⋮
│public class SetAsRefToolProvider implements INodeToolProvider {
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    @Override
│    public NodeTool create(IViewDiagramElementFinder cache) {
│        var builder = this.diagramBuilderHelper.newNodeTool();
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Se
⋮
│public class SetAsViewToolProvider implements INodeToolProvider {
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    private final String viewDefinition;
│
│    private final String label;
│
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/St
⋮
│public class StateSubactionNodeToolProvider implements INodeToolProvider {
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    private final StateSubactionKind kind;
│
│    public StateSubactionNodeToolProvider(StateSubactionKind kind) {
│        this.kind = Objects.requireNonNull(kind);
⋮
│    private String getNodeToolLabel() {
│        return "New " + StringUtils.capitalize(this.kind.getName()) + " Action";
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Su
⋮
│public class SubjectCompartmentNodeToolProvider extends AbstractCompartmentNodeToolProvider {
│
│    @Override
│    protected String getServiceCallExpression() {
│        return ServiceMethod.of1(DiagramMutationAQLService::createReferenceUsageAsSubject).aqlSelf(
│    }
│
│    @Override
│    protected SelectionDialogDescription getSelectionDialogDescription() {
│        String domainType = SysMLMetamodelHelper.buildQualifiedName(SysmlPackage.eINSTANCE.getType(
⋮
│    @Override
│    protected String getPreconditionExpression() {
⋮

backend/views/syson-diagram-common-view/src/main/java/org/eclipse/syson/diagram/common/view/tools/Vi
⋮
│public class ViewNodeAsToolProvider implements INodeToolProvider {
│
│    private final DiagramBuilders diagramBuilderHelper = new DiagramBuilders();
│
│    private final ViewBuilders viewBuilderHelper = new ViewBuilders();
│
│    private final String viewDefinition;
│
│    private final String label;
│
⋮

backend/views/syson-diagram-common-view/src/test/java/org/eclipse/syson/diagram/common/view/Architec
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_DIAGRAM_COMMON_VIEW_ROOT_PACKAGE = "org.eclipse.syson.diagram.
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_DIAGRAM_COMMON_VIEW_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮
```
