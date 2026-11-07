# Repo map: backend/views/syson-standard-diagrams-view

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/views/syson-standard-diagrams-view`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/views/syson-standard-diagrams-view) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 111 files there; aider read the 111 that `syson.aiderignore` leaves in, and the map shows 52 of them, 52 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/Ac
⋮
│@Service
│public class ActionFlowViewDiagramDescriptionProvider implements IViewDescriptionProvider {
│
⋮
│    @Override
│    public String getViewId() {
⋮
│    @Override
│    public IRepresentationDescriptionProvider getRepresentationDescriptionProvider() {
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/In
⋮
│@Service
│public class InterconnectionViewDiagramDescriptionProvider implements IViewDescriptionProvider {
│
⋮
│    @Override
│    public String getViewId() {
⋮
│    @Override
│    public IRepresentationDescriptionProvider getRepresentationDescriptionProvider() {
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/SD
⋮
│public class SDVDescriptionNameGenerator extends DescriptionNameGenerator {
│
│    /**
│     * Prefix can't be changed to SDV because it will change the EdgeDescriptions Id (see
│     * ViewDiagramDescriptionConverter in Sirius Web).
│     */
│    public static final String PREFIX = "GV";
│
│    public SDVDescriptionNameGenerator() {
│        super(PREFIX);
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/SD
⋮
│public class SDVDiagramDescriptionProvider implements IRepresentationDescriptionProvider {
│
│    public static final String DESCRIPTION_NAME = "General View";
│
│    // @formatter:off
│
│    public static  final List<EClass> DEFINITIONS = List.of(
│            SysmlPackage.eINSTANCE.getActionDefinition(),
│            SysmlPackage.eINSTANCE.getAllocationDefinition(),
│            SysmlPackage.eINSTANCE.getAttributeDefinition(),
⋮
│    protected IDescriptionNameGenerator getDescriptionNameGenerator() {
│        return this.descriptionNameGenerator;
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/SD
⋮
│@Service
│public class SDVProjectStyleCustomizationRendererVariableCustomizer implements IRepresentationRende
│
⋮
│    private boolean isSDVDiagram(IRepresentationDescription representationDescription) {
│        return SysONRepresentationDescriptionIdentifiers.GENERAL_VIEW_DIAGRAM_DESCRIPTION_ID.equals
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/St
⋮
│@Service
│public class StateTransitionViewDiagramDescriptionProvider implements IViewDescriptionProvider {
│
⋮
│    @Override
│    public String getViewId() {
⋮
│    @Override
│    public IRepresentationDescriptionProvider getRepresentationDescriptionProvider() {
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/Sy
⋮
│@Service
│public class SysONRepresentationDescriptionMetadataSorter implements IRepresentationDescriptionMeta
│
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class AllocateEdgeDescriptionProvider extends AbstractAllocateEdgeDescriptionProvider {
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public AllocateEdgeDescriptionProvider(IColorProvider colorProvider) {
│        super(colorProvider);
│        this.descriptionNameGenerator = new SDVDescriptionNameGenerator();
│    }
│
│    @Override
⋮
│    private List<NodeDescription> getSourceAndTarget(IViewDiagramElementFinder cache) {
│        var sourcesAndTargets = new ArrayList<NodeDescription>();
│        SDVDiagramDescriptionProvider.USAGES.forEach(usage -> {
│            cache.getNodeDescription(this.descriptionNameGenerator.getNodeName(usage)).ifPresent(so
│        });
│        return sourcesAndTargets;
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class ConnectionUsageEdgeDescriptionProvider extends AbstractEdgeDescriptionProvider {
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public ConnectionUsageEdgeDescriptionProvider(IColorProvider colorProvider, IDescriptionNameGen
│        super(colorProvider);
│        this.descriptionNameGenerator = Objects.requireNonNull(descriptionNameGenerator);
│    }
│
│    @Override
⋮
│    private EdgeStyle createEdgeStyle() {
│        return this.diagramBuilderHelper.newEdgeStyle()
│                .borderSize(0)
│                .color(this.colorProvider.getColor(ViewConstants.DEFAULT_EDGE_COLOR))
│                .edgeWidth(1)
│                .lineStyle(LineStyle.SOLID)
│                .sourceArrowStyle(ArrowStyle.NONE)
│                .targetArrowStyle(ArrowStyle.NONE)
│                .build();
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class DefinitionOwnedUsageEdgeDescriptionProvider extends AbstractDefinitionOwnedUsageEdgeDe
│
│    public DefinitionOwnedUsageEdgeDescriptionProvider(EClass eClass, EReference eReference, IColor
│        super(eClass, eReference, colorProvider, nameGenerator);
│    }
│
│    @Override
│    protected List<EClass> getEdgeSources() {
│        return SDVDiagramDescriptionProvider.DEFINITIONS;
│    }
│
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class DependencyEdgeDescriptionProvider extends AbstractDependencyEdgeDescriptionProvider {
│
│    public DependencyEdgeDescriptionProvider(IColorProvider colorProvider, IDescriptionNameGenerato
│        super(colorProvider, descriptionNameGenerator);
│    }
│
│    @Override
│    protected String getName() {
│        return SDVDescriptionNameGenerator.PREFIX + " Edge Dependency";
│    }
│
⋮
│    private List<NodeDescription> getSourceAndTarget(IViewDiagramElementFinder cache) {
│        var nameGenerator = new SDVDescriptionNameGenerator();
│        var sourcesAndTargets = new ArrayList<NodeDescription>();
│        SDVDiagramDescriptionProvider.DEFINITIONS.forEach(definition -> {
│            cache.getNodeDescription(nameGenerator.getNodeName(definition)).ifPresent(sourcesAndTar
│        });
│        SDVDiagramDescriptionProvider.USAGES.forEach(definition -> {
│            cache.getNodeDescription(nameGenerator.getNodeName(definition)).ifPresent(sourcesAndTar
│        });
│        cache.getNodeDescription(nameGenerator.getNodeName(SysmlPackage.eINSTANCE.getPackage())).if
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class FeatureTypingEdgeDescriptionProvider extends AbstractFeatureTypingEdgeDescriptionProvi
│
│    public FeatureTypingEdgeDescriptionProvider(IColorProvider colorProvider) {
│        super(colorProvider);
│    }
│
│    @Override
│    protected String getName() {
│        return SDVDescriptionNameGenerator.PREFIX + " Edge FeatureTyping";
│    }
│
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class FrameConcernEdgeDescriptionProvider extends AbstractEdgeDescriptionProvider {
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public FrameConcernEdgeDescriptionProvider(IColorProvider colorProvider, IDescriptionNameGenera
│        super(colorProvider);
│        this.descriptionNameGenerator = Objects.requireNonNull(descriptionNameGenerator);
│    }
│
│    @Override
⋮
│    private EdgeStyle createEdgeStyle() {
│        return this.diagramBuilderHelper.newEdgeStyle()
│                .borderSize(0)
│                .color(this.colorProvider.getColor(ViewConstants.DEFAULT_EDGE_COLOR))
│                .edgeWidth(1)
│                .lineStyle(LineStyle.SOLID)
│                .sourceArrowStyle(ArrowStyle.NONE)
│                .targetArrowStyle(ArrowStyle.INPUT_ARROW)
│                .build();
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class IncludeUseCaseDescriptionProvider extends AbstractEdgeDescriptionProvider {
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public IncludeUseCaseDescriptionProvider(IColorProvider colorProvider, IDescriptionNameGenerato
│        super(colorProvider);
│        this.descriptionNameGenerator = descriptionNameGenerator;
│    }
│
│    @Override
⋮
│    private Collection<? extends DiagramElementDescription> getSourceTargetNodes(IViewDiagramElemen
│        List<NodeDescription> nodes = new ArrayList<>();
│        cache.getNodeDescription(this.descriptionNameGenerator.getNodeName(SysmlPackage.eINSTANCE.g
│        return nodes;
⋮
│    private EdgeStyle createEdgeStyle() {
│        return this.diagramBuilderHelper.newEdgeStyle()
│                .borderSize(0)
│                .color(this.colorProvider.getColor(ViewConstants.DEFAULT_EDGE_COLOR))
│                .edgeWidth(1)
│                .lineStyle(LineStyle.SOLID)
│                .sourceArrowStyle(ArrowStyle.NONE)
│                .targetArrowStyle(ArrowStyle.INPUT_FILL_CLOSED_ARROW)
│                .build();
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class NestedActorEdgeDescriptionProvider extends AbstractEdgeDescriptionProvider {
│
│    private final IDescriptionNameGenerator nameGenerator;
│
│    private final EClass eClass;
│
│    private final EReference eReference;
│
│    private final String edgeName;
│
⋮
│    private EdgeStyle createEdgeStyle() {
│        return this.diagramBuilderHelper.newEdgeStyle()
│                .borderSize(0)
│                .color(this.colorProvider.getColor(ViewConstants.DEFAULT_EDGE_COLOR))
│                .edgeWidth(1)
│                .lineStyle(LineStyle.SOLID)
│                .sourceArrowStyle(ArrowStyle.NONE)
│                .targetArrowStyle(ArrowStyle.NONE)
│                .build();
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class NestedStakeholderEdgeDescriptionProvider extends AbstractEdgeDescriptionProvider {
│
│    private final IDescriptionNameGenerator nameGenerator;
│
│    private final EClass eClass;
│
│    private final EReference eReference;
│
│    private final String edgeName;
│
⋮
│    private EdgeStyle createEdgeStyle() {
│        return this.diagramBuilderHelper.newEdgeStyle()
│                .borderSize(0)
│                .color(this.colorProvider.getColor(ViewConstants.DEFAULT_EDGE_COLOR))
│                .edgeWidth(1)
│                .lineStyle(LineStyle.SOLID)
│                .sourceArrowStyle(ArrowStyle.NONE)
│                .targetArrowStyle(ArrowStyle.NONE)
│                .build();
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class NestedSubjectEdgeDescriptionProvider extends AbstractEdgeDescriptionProvider {
│
│    private final IDescriptionNameGenerator nameGenerator;
│
│    private final EClass eClass;
│
│    private final EReference eReference;
│
│    private final String edgeName;
│
⋮
│    private EdgeStyle createEdgeStyle() {
│        return this.diagramBuilderHelper.newEdgeStyle()
│                .borderSize(0)
│                .color(this.colorProvider.getColor(ViewConstants.DEFAULT_EDGE_COLOR))
│                .edgeWidth(1)
│                .lineStyle(LineStyle.SOLID)
│                .sourceArrowStyle(ArrowStyle.NONE)
│                .targetArrowStyle(ArrowStyle.NONE)
│                .build();
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class RedefinitionEdgeDescriptionProvider extends AbstractRedefinitionEdgeDescriptionProvide
│
│    public RedefinitionEdgeDescriptionProvider(IColorProvider colorProvider) {
│        super(colorProvider);
│    }
│
│    @Override
│    protected String getName() {
│        return SDVDescriptionNameGenerator.PREFIX + " Edge Redefinition";
│    }
│
│    private List<NodeDescription> getSourceAndTragetNodes(IViewDiagramElementFinder cache) {
│        var nameGenerator = new SDVDescriptionNameGenerator();
│        var sourcesAndTargets = new ArrayList<NodeDescription>();
│
│        SDVDiagramDescriptionProvider.USAGES.forEach(usage -> {
│            cache.getNodeDescription(nameGenerator.getNodeName(usage)).ifPresent(sourcesAndTargets:
│        });
│        return sourcesAndTargets;
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class ReferenceSubsettingEdgeDescriptionProvider extends AbstractSubsettingEdgeDescriptionPr
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public ReferenceSubsettingEdgeDescriptionProvider(IColorProvider colorProvider, IDescriptionNam
│        super(SysmlPackage.eINSTANCE.getReferenceSubsetting(), colorProvider);
│        this.descriptionNameGenerator = Objects.requireNonNull(descriptionNameGenerator);
│    }
│
│    @Override
⋮
│    @Override
│    protected EdgeStyle createEdgeStyle() {
⋮
│    private List<NodeDescription> getSourceAndTargetNodes(IViewDiagramElementFinder cache) {
│        var sourcesAndTargets = new ArrayList<NodeDescription>();
│
│        SDVDiagramDescriptionProvider.USAGES.forEach(usage -> {
│            cache.getNodeDescription(this.descriptionNameGenerator.getNodeName(usage)).ifPresent(so
│        });
│        return sourcesAndTargets;
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class RequirementConstraintEdgeDescriptionProvider extends AbstractEdgeDescriptionProvider {
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public RequirementConstraintEdgeDescriptionProvider(IColorProvider colorProvider, IDescriptionN
│        super(colorProvider);
│        this.descriptionNameGenerator = Objects.requireNonNull(descriptionNameGenerator);
│    }
│
│    @Override
⋮
│    private EdgeStyle createEdgeStyle() {
│        return this.diagramBuilderHelper.newEdgeStyle()
│                .borderSize(0)
│                .color(this.colorProvider.getColor(ViewConstants.DEFAULT_EDGE_COLOR))
│                .edgeWidth(1)
│                .lineStyle(LineStyle.SOLID)
│                .sourceArrowStyle(ArrowStyle.NONE)
│                .targetArrowStyle(ArrowStyle.INPUT_ARROW)
│                .build();
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class RequirementDerivationEdgeDescriptionProvider extends AbstractEdgeDescriptionProvider {
│
│    /**
│     * The type used to name the {@link EdgeDescription}, it must not collide with the name of the 
│     * {@link ConnectionUsageEdgeDescriptionProvider} edge which uses the same domain type.
│     */
│    public static final String EDGE_TYPE = "RequirementDerivation";
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
⋮
│    private String getName() {
│        return this.descriptionNameGenerator.getEdgeName(EDGE_TYPE);
⋮
│    private EdgeStyle createEdgeStyle() {
│        // Dashed line to distinguish a derivation from a satisfy edge, which uses the same arrow b
│        return this.diagramBuilderHelper.newEdgeStyle()
│                .borderSize(0)
│                .color(this.colorProvider.getColor(ViewConstants.DEFAULT_EDGE_COLOR))
│                .edgeWidth(1)
│                .lineStyle(LineStyle.DASH)
│                .sourceArrowStyle(ArrowStyle.NONE)
│                .targetArrowStyle(ArrowStyle.INPUT_ARROW)
│                .build();
⋮
│    private List<NodeDescription> getRequirementNodes(IViewDiagramElementFinder cache) {
│        return new DescriptionFinder(this.descriptionNameGenerator).getConnectableNodeDescriptions(
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class SatisfyRequirementEdgeDescriptionProvider extends AbstractEdgeDescriptionProvider {
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public SatisfyRequirementEdgeDescriptionProvider(IColorProvider colorProvider, IDescriptionName
│        super(colorProvider);
│        this.descriptionNameGenerator = Objects.requireNonNull(descriptionNameGenerator);
│    }
│
│    @Override
⋮
│    private EdgeStyle createEdgeStyle() {
│        return this.diagramBuilderHelper.newEdgeStyle()
│                .borderSize(0)
│                .color(this.colorProvider.getColor(ViewConstants.DEFAULT_EDGE_COLOR))
│                .edgeWidth(1)
│                .lineStyle(LineStyle.SOLID)
│                .sourceArrowStyle(ArrowStyle.NONE)
│                .targetArrowStyle(ArrowStyle.INPUT_ARROW)
│                .build();
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class SubclassificationEdgeDescriptionProvider extends AbstractSubclassificationEdgeDescript
│
│    public SubclassificationEdgeDescriptionProvider(IColorProvider colorProvider) {
│        super(colorProvider);
│    }
│
│    @Override
│    protected String getName() {
│        return SDVDescriptionNameGenerator.PREFIX + " Edge Subclassification";
│    }
│
│    private List<NodeDescription> getSourceAndTargetNodes(IViewDiagramElementFinder cache) {
│        var nameGenerator = new SDVDescriptionNameGenerator();
│        var sourcesAndTargets = new ArrayList<NodeDescription>();
│
│        SDVDiagramDescriptionProvider.DEFINITIONS.forEach(definition -> {
│            cache.getNodeDescription(nameGenerator.getNodeName(definition)).ifPresent(sourcesAndTar
│        });
│        cache.getNodeDescription(nameGenerator.getNodeName(SysmlPackage.eINSTANCE.getPackage())).if
│
│        return sourcesAndTargets;
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class SubsettingEdgeDescriptionProvider extends AbstractSubsettingEdgeDescriptionProvider {
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    public SubsettingEdgeDescriptionProvider(IColorProvider colorProvider, IDescriptionNameGenerato
│        super(SysmlPackage.eINSTANCE.getSubsetting(), colorProvider);
│        this.descriptionNameGenerator = Objects.requireNonNull(descriptionNameGenerator);
│    }
│
│    @Override
⋮
│    @Override
│    protected EdgeStyle createEdgeStyle() {
⋮
│    private List<NodeDescription> getSourceAndTargetNodes(IViewDiagramElementFinder cache) {
│        var sourcesAndTargets = new ArrayList<NodeDescription>();
│
│        SDVDiagramDescriptionProvider.USAGES.forEach(usage -> {
│            cache.getNodeDescription(this.descriptionNameGenerator.getNodeName(usage)).ifPresent(so
│        });
│        return sourcesAndTargets;
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class SuccessionEdgeDescriptionProvider extends AbstractSuccessionEdgeDescriptionProvider {
│
│    public SuccessionEdgeDescriptionProvider(IColorProvider colorProvider) {
│        super(colorProvider, new SDVDescriptionNameGenerator());
│    }
│
│    private List<NodeDescription> getAllUsages(IViewDiagramElementFinder cache) {
│        var sourcesAndTargets = new ArrayList<NodeDescription>();
│
│        SDVDiagramDescriptionProvider.USAGES.forEach(usage -> {
│            cache.getNodeDescription(this.descriptionNameGenerator.getNodeName(usage)).ifPresent(so
│        });
│
│        return sourcesAndTargets;
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/ed
⋮
│public class UsageNestedUsageEdgeDescriptionProvider extends AbstractUsageNestedUsageEdgeDescriptio
│
│    public UsageNestedUsageEdgeDescriptionProvider(EClass eClass, EReference eReference, IColorProv
│        super(eClass, eReference, colorProvider, nameGenerator);
│    }
│
│    @Override
│    protected List<EClass> getEdgeSources() {
│        return SDVDiagramDescriptionProvider.USAGES;
│    }
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/no
⋮
│public class ActionUsageParametersCompartmentNodeDescriptionProvider extends AbstractCompartmentNod
│
│    public static final String COMPARTMENT_NAME = "parameters";
│
│    public ActionUsageParametersCompartmentNodeDescriptionProvider(IColorProvider colorProvider, ID
│        super(SysmlPackage.eINSTANCE.getActionUsage(), SysmlPackage.eINSTANCE.getUsage_NestedRefere
│    }
│
│    @Override
│    protected String getCompartmentName() {
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/no
⋮
│public class ActorsCompartmentItemNodeDescriptionProvider extends CompartmentItemNodeDescriptionPro
│
│    public ActorsCompartmentItemNodeDescriptionProvider(EClass eClass, EReference eReference,
│            IColorProvider colorProvider, IDescriptionNameGenerator descriptionNameGenerator) {
│        super(eClass, eReference, colorProvider, descriptionNameGenerator);
│    }
│
│    @Override
│    protected String getSemanticCandidateExpression() {
│        return ServiceMethod.of0(ModelQueryAQLService::getActors).aqlSelf();
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/no
⋮
│public class AllocationDefinitionEndsCompartmentNodeDescriptionProvider extends AbstractCompartment
│
│    public AllocationDefinitionEndsCompartmentNodeDescriptionProvider(IColorProvider colorProvider,
│        super(SysmlPackage.eINSTANCE.getAllocationDefinition(), SysmlPackage.eINSTANCE.getConnectio
│    }
│
│    @Override
│    protected List<NodeDescription> getDroppableNodes(IViewDiagramElementFinder cache) {
│        return List.of();
│    }
│
⋮
│    @Override
│    protected String isHiddenByDefaultExpression() {
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/no
⋮
│public class ConnectionDefinitionEndsCompartmentNodeDescriptionProvider extends AbstractCompartment
│
│    public ConnectionDefinitionEndsCompartmentNodeDescriptionProvider(IColorProvider colorProvider,
│        super(SysmlPackage.eINSTANCE.getConnectionDefinition(), SysmlPackage.eINSTANCE.getConnectio
│    }
│
│    @Override
│    protected List<NodeDescription> getDroppableNodes(IViewDiagramElementFinder cache) {
│        return List.of();
│    }
│
⋮
│    @Override
│    protected String isHiddenByDefaultExpression() {
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/no
⋮
│public class InterfaceDefinitionEndsCompartmentItemNodeDescriptionProvider extends CompartmentItemN
│
│    public InterfaceDefinitionEndsCompartmentItemNodeDescriptionProvider(IColorProvider colorProvid
│        super(SysmlPackage.eINSTANCE.getInterfaceDefinition(), SysmlPackage.eINSTANCE.getInterfaceD
│    }
│
│    @Override
│    protected String getSemanticCandidateExpression() {
│        return AQLConstants.AQL_SELF + ".getInterfaceEnds()->select(endElt | not endElt.isFromStand
│    }
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/no
⋮
│public class InterfaceDefinitionEndsCompartmentNodeDescriptionProvider extends AbstractCompartmentN
│
│    public InterfaceDefinitionEndsCompartmentNodeDescriptionProvider(IColorProvider colorProvider, 
│        super(SysmlPackage.eINSTANCE.getInterfaceDefinition(), SysmlPackage.eINSTANCE.getInterfaceD
│    }
│
│    @Override
│    protected List<NodeDescription> getDroppableNodes(IViewDiagramElementFinder cache) {
│        return List.of();
│    }
│
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/no
⋮
│public class PerformActionsCompartmentNodeDescriptionProvider extends AbstractCompartmentNodeDescri
│
│    public static final String PERFORM_ACTIONS_COMPARTMENT_NAME = " perform actions";
│
│    public PerformActionsCompartmentNodeDescriptionProvider(EClass eClass, EReference eReference, I
│        super(eClass, eReference, colorProvider, descriptionNameGenerator);
│    }
│
│    @Override
│    public NodeDescription create() {
⋮
│    @Override
│    protected NodePalette createCompartmentPalette(IViewDiagramElementFinder cache) {
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/no
⋮
│public class PortDefinitionOwnedItemCompartmentItemNodeDescriptionProvider extends CompartmentItemN
│
│    public PortDefinitionOwnedItemCompartmentItemNodeDescriptionProvider(IColorProvider colorProvid
│        super(SysmlPackage.eINSTANCE.getPortDefinition(), SysmlPackage.eINSTANCE.getDefinition_Owne
│    }
│
│    // We filter so elements that extends Item like Parts are not returned
│    @Override
│    protected String getSemanticCandidateExpression() {
│        return "aql:self.ownedItem->select(e | e.oclIsTypeOf(sysml::ItemUsage))";
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/no
⋮
│public class PortUsageBorderNodeDescriptionProvider extends AbstractPortUsageBorderNodeDescriptionP
│
│    public PortUsageBorderNodeDescriptionProvider(EReference eReference, IColorProvider colorProvid
│        super(eReference, colorProvider, nameGenerator);
│    }
│
│    @Override
│    protected String getSemanticCandidatesExpression() {
│        return AQLConstants.AQL_SELF + "." + this.eReference.getName();
│    }
│
⋮
│    @Override
│    protected String getName() {
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/no
⋮
│public class UsageNodeDescriptionProvider extends AbstractUsageNodeDescriptionProvider {
│
│    public UsageNodeDescriptionProvider(EClass eClass, IColorProvider colorProvider) {
│        super(eClass, colorProvider, new SDVDescriptionNameGenerator());
│    }
│
│    @Override
│    protected String getSemanticCandidatesExpression(String domainType) {
│        return ServiceMethod.of4(DiagramQueryAQLService.class, DiagramQueryAQLService::getExposedEl
│                .aqlSelf(domainType, ANCESTORS, CoreVariables.EDITING_CONTEXT.name(), DiagramContex
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/no
⋮
│public class ViewUsageNodeDescriptionProvider extends AbstractNodeDescriptionProvider {
│
│    protected final IDescriptionNameGenerator descriptionNameGenerator;
│
│    protected final ToolDescriptionService toolDescriptionService;
│
│    public ViewUsageNodeDescriptionProvider(IColorProvider colorProvider, IDescriptionNameGenerator
│        super(colorProvider);
│        this.descriptionNameGenerator = Objects.requireNonNull(descriptionNameGenerator);
│        this.toolDescriptionService = new ToolDescriptionService(descriptionNameGenerator);
⋮
│    protected NodeTool createNodeTool(NodeDescription nodeDescription, EClass eClass) {
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

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│public class ActionFlowViewCreateService {
│
│    /**
│     * Returns {@code true} if the diagram can be created on the provided {@code element}.
│     *
│     * @param element
│     *            the element to check
│     * @return {@code true} if the diagram can be created on the provided {@code element}
│     */
│    public boolean canCreateDiagram(Element element) {
│        List<EClass> acceptedRootTypes = List.of(
│                SysmlPackage.eINSTANCE.getPackage(),
│                SysmlPackage.eINSTANCE.getActionDefinition(),
│                SysmlPackage.eINSTANCE.getActionUsage());
│        return acceptedRootTypes.stream().anyMatch(rootType -> rootType.isSuperTypeOf(element.eClas
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│public class InterconnectionViewCreateService {
│
│    /**
│     * Returns {@code true} if the diagram can be created on the provided {@code element}.
│     *
│     * @param element
│     *            the element to check
│     * @return {@code true} if the diagram can be created on the provided {@code element}
│     */
│    public boolean canCreateDiagram(Element element) {
│        List<EClass> acceptedRootTypes = List.of(
│                SysmlPackage.eINSTANCE.getPackage(),
│                SysmlPackage.eINSTANCE.getUsage(),
│                SysmlPackage.eINSTANCE.getDefinition());
│        return acceptedRootTypes.stream().anyMatch(rootType -> rootType.isSuperTypeOf(element.eClas
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│@Order(Ordered.HIGHEST_PRECEDENCE)
│@Service
│public class SDVConnectorToolEventHandler implements IDiagramEventHandler {
│
⋮
│    private Optional<IStatus> executeTool(IEditingContext editingContext,
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│@Service
│public class SDVNodeStyleCustomizer implements INodeStyleCustomizer {
│
⋮
│    private Optional<SDVTheme> findTheme(VariableManager variableManager, String descriptionName) {
│        if (this.descriptionNameGenerator.isCompartmentNodeDescriptionName(descriptionName)) {
│            return this.themeProvider.findTheme(descriptionName)
│                    .flatMap(theme -> this.themeProvider.findTheme(variableManager.get(OWNER_DESCRI
│        }
│        if (!this.descriptionNameGenerator.isCompartmentItemNodeDescriptionName(descriptionName)) {
│            variableManager.put(OWNER_DESCRIPTION_NAME_VARIABLE.name(), descriptionName);
│        }
│        return this.themeProvider.findTheme(descriptionName);
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│public class SDVNodeToolsWithoutSectionSwitch extends AbstractViewNodeToolsWithoutSectionSwitch {
│
│    private final IViewDiagramElementFinder cache;
│
│    private final List<NodeDescription> allNodeDescriptions;
│
│    private final ToolDescriptionService toolDescriptionService;
│
│    public SDVNodeToolsWithoutSectionSwitch(IViewDiagramElementFinder cache, List<NodeDescription> 
│        super(new SDVDescriptionNameGenerator());
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│@Service
│public class SDVStyleCustomizationDescriptionProvider implements IStyleCustomizationDescriptionProv
│
⋮
│    @Override
│    public List<StyleCustomizationDescription> getStyleCustomizationDescriptions(String projectId) 
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│@Service
│public class SDVThemeProvider implements ISDVThemeProvider {
│
⋮
│    @Override
│    public Optional<SDVTheme> findTheme(String descriptionName) {
⋮
│    private void registerFamily(Map<String, SDVTheme> themes, SDVTheme theme, List<EClass> types) {
│        var prefix = this.descriptionNameGenerator.getDiagramPrefix();
│        for (var type : types) {
│            var ownerPrefix = type.getName() + " ";
│            themes.put(this.descriptionNameGenerator.getNodeName(type), theme);
│            themes.put(this.descriptionNameGenerator.getCompartmentName(prefix, ownerPrefix), theme
│            themes.put(this.descriptionNameGenerator.getCompartmentItemName(prefix, ownerPrefix), t
│            themes.put(this.descriptionNameGenerator.getInheritedCompartmentItemName(prefix, ownerP
│        }
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│public class StateTransitionViewCreateService {
│
│    /**
│     * Returns {@code true} if the diagram can be created on the provided {@code element}.
│     *
│     * @param element
│     *            the element to check
│     * @return {@code true} if the diagram can be created on the provided {@code element}
│     */
│    public boolean canCreateDiagram(Element element) {
│        List<EClass> acceptedRootTypes = List.of(
│                SysmlPackage.eINSTANCE.getPackage(),
│                SysmlPackage.eINSTANCE.getPartUsage(),
│                SysmlPackage.eINSTANCE.getPartDefinition(),
│                SysmlPackage.eINSTANCE.getStateUsage(),
│                SysmlPackage.eINSTANCE.getStateDefinition());
│        // Use strict equality here and not EClass#isSuperTypeOf, we want to precisely select which
│        // types can be used as root.
│        return acceptedRootTypes.contains(element.eClass());
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│@Order(Ordered.HIGHEST_PRECEDENCE)
│@Service
│public class SysONShowHideSDVElementEventHandler implements IDiagramEventHandler {
│
⋮
│    private void handleHideDiagramElement(One<IPayload> payloadSink, Many<ChangeDescription> change
⋮
│    private List<Node> getLinkedNodes(Node node, Diagram diagram) {
│        List<Node> linkedNodes = new ArrayList<>();
│        var nodeId = node.getId();
│        diagram.getEdges().forEach(edge -> {
│            if (Objects.equals(edge.getSourceId(), nodeId)) {
│                this.diagramQueryService.findNodeById(diagram, edge.getTargetId()).ifPresent(linked
│            }
│        });
│        return linkedNodes;
⋮
│    private List<String> getSemanticElements(List<Node> nodes) {
│        return nodes.stream().map(this::getSemanticElement).toList();
⋮
│    private boolean isCompartmentNode(Node node, Diagram diagram, IEditingContext editingContext) {
│        var optViewDD = this.viewDiagramDescriptionSearchService.findById(editingContext, diagram.g
│        if (optViewDD.isPresent()) {
│            var descriptionId = node.getDescriptionId();
│            var optViewNodeDescription = EMFUtils.allContainedObjectOfType(optViewDD.get(), NodeDes
│                    .filter(nodeDesc -> Objects.equals(descriptionId, this.diagramIdProvider.getId(
│                    .filter(nodeDesc -> nodeDesc.getName().startsWith(SDVDescriptionNameGenerator.P
│                    .findFirst();
│            if (optViewNodeDescription.isPresent()) {
│                return true;
⋮
│    private Node getParentNode(Node node, Diagram diagram) {
│        var nodeFinder = new NodeFinder(diagram);
│        var parent = nodeFinder.getParent(node);
│        if (parent instanceof Node parentNode) {
│            return parentNode;
│        }
│        return null;
⋮
│    private void sendResponse(One<IPayload> payloadSink, Many<ChangeDescription> changeDescriptionS
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│public interface ISDVThemeProvider {
│
│    Optional<SDVTheme> findTheme(String descriptionName);
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│@Service
│public class ManageVisibilityNodeActionProvider implements IActionsProvider {
│
⋮
│    private boolean isNodeDescriptionSimpleNode(org.eclipse.sirius.components.view.RepresentationDe
│        var optionalViewNodeDescription = EMFUtils.eAllContentStreamWithSelf(viewDiagramDescription
│                .filter(org.eclipse.sirius.components.view.diagram.NodeDescription.class::isInstanc
│                .map(org.eclipse.sirius.components.view.diagram.NodeDescription.class::cast)
│                .filter(nodeDesc -> this.idProvider.getId(nodeDesc).equals(nodeDescriptionId))
│                .findFirst();
│
│        if (optionalViewNodeDescription.isPresent()) {
│            var viewNodeName = optionalViewNodeDescription.get().getName();
│            return viewNodeName.startsWith(SDVDescriptionNameGenerator.PREFIX + " Node ");
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│@Service
│public class ManageVisibilityRevealValuedContentAction implements IManageVisibilityMenuActionProvid
│
⋮

backend/views/syson-standard-diagrams-view/src/main/java/org/eclipse/syson/standard/diagrams/view/se
⋮
│@Service
│public class ManageVisibilityRevealValuedContentHandler implements IManageVisibilityMenuActionHandl
│
⋮

backend/views/syson-standard-diagrams-view/src/test/java/org/eclipse/syson/standard/diagrams/view/Ar
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_STANDARD_DIAGRAMS_VIEW_ROOT_PACKAGE = "org.eclipse.syson.stand
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_STANDARD_DIAGRAMS_VIEW_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/views/syson-standard-diagrams-view/src/test/java/org/eclipse/syson/standard/diagrams/view/Co
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_STANDARD_DIAGRAMS_VIEW_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮
```
