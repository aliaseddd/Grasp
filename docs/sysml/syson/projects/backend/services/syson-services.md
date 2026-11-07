# Repo map: backend/services/syson-services

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/services/syson-services`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/services/syson-services) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 64 files there; aider read the 64 that `syson.aiderignore` leaves in, and the map shows 38 of them, 38 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/services/syson-services/src/main/java/org/eclipse/syson/services/AttributeToDirectEditSwitch
⋮
│public class AttributeToDirectEditSwitch extends SysmlSwitch<Element> {
│
│    private final String newValue;
│
│    public AttributeToDirectEditSwitch(String newValue) {
│        this.newValue = newValue;
│    }
│
│    @Override
│    public Element caseComment(Comment object) {
⋮
│    @Override
│    public Element caseTextualRepresentation(TextualRepresentation object) {
⋮
│    @Override
│    public Element caseElement(Element object) {
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/ColorProvider.java:
⋮
│public class ColorProvider implements IColorProvider {
│
│    private final Logger logger = LoggerFactory.getLogger(ColorProvider.class);
│
│    private final View view;
│
│    private final Optional<View> studioColorPalettesView;
│
│    public ColorProvider(View view) {
│        this.view = Objects.requireNonNull(view);
⋮
│    private UserColor getColorFromPalette(View containerView, String colorName) {
│        return containerView.getColorPalettes()
│                .stream()
│                .map(ColorPalette::getColors)
│                .flatMap(Collection::stream)
│                .filter(userColor -> userColor.getName().equals(colorName))
│                .findFirst()
│                .orElse(null);
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/DefaultSysMLMoveElementServ
⋮
│@Service
│public class DefaultSysMLMoveElementService implements IDefaultSysMLMoveElementService {
│
⋮
│    @Override
│    public MoveStatus moveSemanticElement(Element element, Element newParent) {
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/DeleteService.java:
⋮
│public class DeleteService {
│
│    /**
│     * Delete the given {@link Element} and its container if it's a {@link Membership}. Also delete
│     * {@link Relationship} (e.g. delete {@link Dependency} related to the given {@link Element}.
│     *
│     * @param element
│     *            the {@link Element} to delete.
│     * @return the deleted element.
│     */
⋮
│    private void collectRelatedElements(EObject eObject, Set<EObject> relatedElements) {
│        var referenceAdapter = ECrossReferenceAdapter.getCrossReferenceAdapter(eObject);
│        if (referenceAdapter != null) {
│            Collection<Setting> inverseReferences = referenceAdapter.getInverseReferences(eObject);
│            for (Setting setting : inverseReferences) {
│                EObject relatedElement = setting.getEObject();
│                Set<EObject> collectedElements = new RelatedElementsSwitch(setting.getEStructuralFe
│                for (EObject collectedElement : collectedElements) {
│                    boolean notAlreadyContained = relatedElements.add(collectedElement);
│                    if (notAlreadyContained) {
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/LabelService.java:
⋮
│public class LabelService {
│
│    public static final String MULTIPLICITY_OFF = "MULTIPLICITY_OFF";
│
│    public static final String NAME_OFF = "NAME_OFF";
│
│    public static final String REDEFINITION_OFF = "REDEFINITION_OFF";
│
│    public static final String SUBSETTING_OFF = "SUBSETTING_OFF";
│
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/NodeDescriptionService.java
⋮
│public class NodeDescriptionService {
│
│    private final IObjectSearchService objectSearchService;
│
│    public NodeDescriptionService(IObjectSearchService objectSearchService) {
│        this.objectSearchService = Objects.requireNonNull(objectSearchService);
│    }
│
│    /**
│     * Returns the child descriptions of {@code nodeDescriptions} that can render {@code element}.
⋮
│    public boolean canNodeDescriptionRenderElement(NodeDescription nodeDescription, Element element
│        boolean canNodeDescriptionRenderElement = false;
│        VariableManager semanticElementsProviderVariableManager = new VariableManager();
│        semanticElementsProviderVariableManager.put(RepresentationVariables.SELF.name(), ownerObjec
│        semanticElementsProviderVariableManager.put(CoreVariables.EDITING_CONTEXT.name(), editingCo
│        semanticElementsProviderVariableManager.put(DiagramContext.DIAGRAM_CONTEXT, diagramContext)
│        var ancestors = new ArrayList<>();
│        this.objectSearchService.getObject(editingContext, diagramContext.diagram().getTargetObject
│                .filter(ViewUsage.class::isInstance)
│                .map(ViewUsage.class::cast)
⋮
│    public boolean canNodeDescriptionRenderElement(NodeDescription description, Element element, Ob
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/RelatedElementsSwitch.java:
⋮
│public class RelatedElementsSwitch extends SysmlSwitch<Set<EObject>> {
│
│    private final EStructuralFeature eStructuralFeature;
│
│    public RelatedElementsSwitch(EStructuralFeature eStructuralFeature) {
│        this.eStructuralFeature = Objects.requireNonNull(eStructuralFeature);
│    }
│
│    @Override
│    public Set<EObject> caseElement(Element object) {
⋮
│    private boolean hasAlreadyBeenDeleted(List<Element> ends) {
│        return !ends.isEmpty() && !(ends.get(0) instanceof Membership) && ends.get(0).getOwner() ==
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/SimpleNameDeresolver.java:
⋮
│public class SimpleNameDeresolver implements INameDeresolver {
│
│    @Override
│    public String getDeresolvedName(Element element, Element context) {
│        final String result;
│        if (element == null) {
│            result = null;
│        } else {
│            String shortName = element.getShortName();
│            if (shortName != null && !shortName.isBlank() && this.preferUsingShortName(element, con
⋮
│    private boolean preferUsingShortName(Element element, Element context) {
│        // Check if the reference if used as a unit
│        FeatureReferenceExpression featureRef = this.getOwningFeatureReferenceExpression(context);
│        if (featureRef != null) {
│            return EMFUtils.getAncestors(OperatorExpression.class, featureRef,
│                    ancestor -> ancestor instanceof OperatorExpression operatorExpression && Object
│        }
│
│        return false;
⋮
│    private FeatureReferenceExpression getOwningFeatureReferenceExpression(Element context) {
│        final FeatureReferenceExpression result;
│        if (context instanceof FeatureReferenceExpression featureRef) {
│            result = featureRef;
│        } else if (context instanceof Membership membership && membership.getMembershipOwningNamesp
│            result = featureRef;
│        } else {
│            result = null;
│        }
│        return result;
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/ToolService.java:
⋮
│public class ToolService {
│
│    protected final IIdentityService identityService;
│
│    protected final IObjectSearchService objectSearchService;
│
│    protected final IFeedbackMessageService feedbackMessageService;
│
│    protected final ISysMLMoveElementService moveService;
│
⋮
│    public Object getParentNode(Element element, Node selectedNode, Edge selectedEdge, DiagramConte
│        Object parentNode = null;
│        if (selectedEdge != null) {
│            Node sourceNode = this.getSourceNode(selectedEdge, diagramContext.diagram());
│            if (sourceNode != null) {
│                parentNode = this.getParentNode(element, sourceNode, diagramContext);
│            } else {
│                parentNode = this.getParentNode(element, selectedEdge, diagramContext);
│            }
│        } else {
⋮
│    public Object getParentNode(Element element, IDiagramElement diagramElement, DiagramContext dia
│        Object parentNode = null;
│        var diagram = diagramContext.diagram();
│        var nodes = diagram.getNodes();
│        var edges = diagram.getEdges();
│        if (nodes.contains(diagramElement)) {
│            parentNode = diagram;
│        } else if (edges.contains(diagramElement)) {
│            parentNode = diagram;
│        } else {
⋮
│    protected Node getParentNode(IDiagramElement diagramElement, Node nodeContainer) {
│        List<Node> nodes = nodeContainer.getChildNodes();
│        nodes.addAll(nodeContainer.getBorderNodes());
│        if (nodes.contains(diagramElement)) {
│            return nodeContainer;
│        }
│        return nodes.stream()
│                .map(subNode -> this.getParentNode(diagramElement, subNode))
│                .filter(Objects::nonNull)
│                .findFirst()
⋮
│    protected List<Node> getChildNodes(DiagramContext diagramContext, Object selectedNode) {
│        var childNodes = new ArrayList<Node>();
│        if (selectedNode instanceof Node node) {
│            childNodes.addAll(node.getChildNodes());
│            if (node.getStyle().getChildrenLayoutStrategy() instanceof ListLayoutStrategy) {
│                // childNodes are compartments, so also add childNodes of childNodes
│                node.getChildNodes().stream().forEach(cn -> childNodes.addAll(cn.getChildNodes()));
│            }
│        } else {
│            var diagram = diagramContext.diagram();
⋮
│    protected boolean isPresent(Element element, List<Node> nodes) {
│        return nodes.stream().anyMatch(node -> node.getTargetObjectId().equals(this.identityService
⋮
│    protected Node getSourceNode(Edge edge, Diagram diagram) {
│        Node sourceNode = null;
│        String sourceId = edge.getSourceId();
│        for (Node node : diagram.getNodes()) {
│            if (Objects.equals(sourceId, node.getId())) {
│                sourceNode = node;
│                break;
│            }
│            sourceNode = this.getSourceNode(sourceId, node);
│            if (sourceNode != null) {
⋮
│    protected Node getSourceNode(String sourceId, Node node) {
│        Node sourceNode = null;
│        for (Node childNode : node.getChildNodes()) {
│            if (Objects.equals(sourceId, childNode.getId())) {
│                sourceNode = childNode;
│                break;
│            }
│            sourceNode = this.getSourceNode(sourceId, childNode);
│            if (sourceNode != null) {
│                break;
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/UtilService.java:
⋮
│public class UtilService {
│
│    private final ElementInitializerSwitch elementInitializerSwitch = new ElementInitializerSwitch(
│
│    private final ElementUtil elementUtil = new ElementUtil();
│
│    /**
│     * Check if the given {@link Element} comes from a standard library (i.e. a {@link LibraryPacka
│     * attribute set to true) or not.
│     *
⋮
│    public List<EObject> getAllReachableType(EObject eObject, EClass eClass) {
│        List<EObject> allReachable = new ArrayList<>();
│        Adapter adapter = EcoreUtil.getAdapter(eObject.eAdapters(), SysONEContentAdapter.class);
│        if (adapter instanceof SysONEContentAdapter cacheAdapter) {
│            List<EObject> cacheResult = cacheAdapter.getCache().get(eClass);
│            if (cacheResult != null) {
│                allReachable.addAll(cacheResult);
│            }
│        }
│        return allReachable;
⋮
│    private <T extends Element> T findByNameAndTypeInStandardLibraries(Element context, Class<T> kl
│        return context.eResource().getResourceSet().getResources().stream()
│                .flatMap(resource -> this.getLibraries(resource, true).stream())
│                .flatMap(stdlibPackage -> Optional.ofNullable(this.findByName(stdlibPackage, qualif
│                .filter(klass::isInstance)
│                .map(klass::cast)
│                .findFirst()
│                .orElse(null);
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/api/DiagramDirectEditErrorL
⋮
│public class DiagramDirectEditErrorListener extends BaseErrorListener {
│
│    private final Logger logger = LoggerFactory.getLogger(DiagramDirectEditErrorListener.class);
│
│    @Override
│    public void syntaxError(Recognizer<?, ?> recognizer, Object offendingSymbol, int line, int char
│        this.logger.info(msg);
│    }
│
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/api/IDefaultSysMLMoveElemen
⋮
│public interface IDefaultSysMLMoveElementService {
│
│    /**
│     * Moves an element into a new parent.
│     *
│     * @param element
│     *            the element to move
│     * @param newParent
│     *            the new parent
│     * @return a success {@link MoveStatus} if the element has been moved, a failing {@link MoveSta
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/api/IDirectEditNamespacePro
⋮
│public interface IDirectEditNamespaceProvider {
│
│    /**
│     * Gets the membership from a NamedProxy if it exists.
│     *
│     * @param proxy
│     *            the proxy to resolve
│     * @return a Membership
│     */
│    Optional<Membership> getMembership(NamedProxy proxy);
│
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/api/ISysMLMoveElementChecke
⋮
│public interface ISysMLMoveElementCheckerService {
│
│    /**
│     * Checks if an element can be moved into a new parent.
│     *
│     * @param element
│     *            the element to move
│     * @param newParent
│     *            the new parent
│     * @return a success {@link MoveStatus} if the element can be moved, a failing {@link MoveStatu
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/api/ISysMLMoveElementServic
⋮
│public interface ISysMLMoveElementService {
│
│    /**
│     * Moves an element into a new parent.
│     *
│     * @param element
│     *            the element to move
│     * @param newParent
│     *            the new parent
│     * @return a success {@link MoveStatus} if the element has been moved, a failing {@link MoveSta
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/api/ISysMLMoveElementServic
⋮
│public interface ISysMLMoveElementServiceDelegate {
│
│    /**
│     * Indicates whether this delegate can move the given element to the given parent.
│     *
│     * @param element
│     *            the element to move
│     * @param newParent
│     *            the new parent
│     * @return <code>true</code> if this delegate can handle the move, <code>false</code> otherwise
│     */
│    boolean canHandle(Element element, Element newParent);
│
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/api/ISysONResourceService.j
⋮
│public interface ISysONResourceService {
│
│    boolean isSysML(Resource resource);
│
│    boolean isImported(IEditingContext editingContext, Resource resource);
│
│    boolean isFromReferencedLibrary(IEditingContext editingContext, Resource resource);
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/api/MoveStatus.java:
⋮
│public record MoveStatus(boolean isSuccess, String message) {
│
│    public static MoveStatus buildSuccess() {
│        return new MoveStatus(true, "");
│    }
│
│    public static MoveStatus buildFailure(String failureMessage) {
│        return new MoveStatus(false, failureMessage);
│    }
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/services/api/ViewDefinitionKind.java
⋮
│public enum ViewDefinitionKind {
│    GENERAL_VIEW, INTERCONNECTION_VIEW, ACTION_FLOW_VIEW, STATE_TRANSITION_VIEW;
│
│    public static ViewDefinitionKind getKind(String viewDefinitionName) {
│        ViewDefinitionKind kind = null;
│        if (StandardDiagramsConstants.GV_QN.equals(viewDefinitionName)) {
│            kind = GENERAL_VIEW;
│        } else if (StandardDiagramsConstants.IV_QN.equals(viewDefinitionName)) {
│            kind = INTERCONNECTION_VIEW;
│        } else if (StandardDiagramsConstants.AFV_QN.equals(viewDefinitionName)) {
⋮
│    public static boolean isGeneralView(ViewDefinitionKind kind) {
│        return kind == GENERAL_VIEW;
⋮
│    public static boolean isInterconnectionView(ViewDefinitionKind kind) {
│        return kind == INTERCONNECTION_VIEW;
⋮
│    public static boolean isActionFlowView(ViewDefinitionKind kind) {
│        return kind == ACTION_FLOW_VIEW;
⋮
│    public static boolean isStateTransitionView(ViewDefinitionKind kind) {
│        return kind == STATE_TRANSITION_VIEW;
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/AQLConstants.java:
⋮
│public class AQLConstants {
│
│    public static final String AQL = "aql:";
│
│    public static final String AQL_SELF = "aql:self";
│
│    public static final String SELF = "self";
│
│    public static final String AQL_TRUE = "aql:true";
│
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/AQLUtils.java:
⋮
│public class AQLUtils {
│
│    /**
│     * Return an AQL string from the given string.
│     *
│     * @param string
│     *            the string to transform to an AQL string
│     * @return the AQL string built upon the given string.
│     */
│    public static String aqlString(String string) {
│        return '\'' + string + '\'';
⋮
│    public static String aqlSequence(List<String> members) {
│        return members.stream().collect(Collectors.joining(",", "Sequence{", "}"));
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/DescriptionNameGenerator.java:
⋮
│public class DescriptionNameGenerator implements IDescriptionNameGenerator {
│
│    protected static final String SPACE = " ";
│
│    private static final Pattern WORD_FINDER = Pattern.compile("(([A-Z]?[a-z]+)|([A-Z]))");
│
│    private final String diagramPrefix;
│
│    public DescriptionNameGenerator(String diagramPrefix) {
│        this.diagramPrefix = diagramPrefix;
⋮
│    @Override
│    public String getCreationToolName(String pattern, EClassifier eClassifier) {
⋮
│    @Override
│    public String getCreationToolName(EClassifier eClassifier) {
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/GetIntermediateContainerCreatio
⋮
│public class GetIntermediateContainerCreationSwitch extends SysmlEClassSwitch<Optional<EClass>> {
│
│    private final Element container;
│
│    public GetIntermediateContainerCreationSwitch(Element container) {
│        this.container = Objects.requireNonNull(container);
│    }
│
│    @Override
│    public Optional<EClass> defaultCase(EObject object) {
⋮
│    @Override
│    public Optional<EClass> caseFeature(Feature object) {
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/IDescriptionNameGenerator.java:
⋮
│public interface IDescriptionNameGenerator {
│
│    /**
│     * Returns a name built from the given prefix, descType and suffix.
│     *
│     * @param prefix
│     *            the given prefix.
│     * @param descType
│     *            the string that should be prepended to the given suffix.
│     * @param suffix
⋮
│    default String getName(String prefix, String descType, String suffix) {
│        var name = new StringBuilder();
│        name.append(prefix).append(" ").append(descType).append(" ").append(suffix);
│        return name.toString();
⋮
│    String getCreationToolName(String prefix, EClassifier eClassifier);
│
⋮
│    String getCreationToolName(EClassifier eClassifier);
│
⋮
│    default String getCreationToolName(EReference eReference) {
│        return this.getCreationToolName(eReference.getEType());
⋮
│    String getDiagramPrefix();
│
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/NoDerivedCrossReferencer.java:
⋮
│public class NoDerivedCrossReferencer extends UsageCrossReferencer {
│
│    private static final long serialVersionUID = 1L;
│
│    protected NoDerivedCrossReferencer(EObject eObject) {
│        super(eObject);
│    }
│
│    protected NoDerivedCrossReferencer(Collection<?> emfObjects) {
│        super(emfObjects);
⋮
│    public static Map<EObject, Collection<EStructuralFeature.Setting>> findAll(Collection<?> eObjec
│        return new NoDerivedCrossReferencer(emfObjectsToSearch).findAllUsage(eObjectsOfInterest);
⋮
│    @Override
│    protected boolean crossReference(EObject eObject, EReference eReference, EObject crossReference
⋮
│    public <T> ECrossReferenceEList<T> createECrossReferenceEList(EObject eObject) {
│        EList<EStructuralFeature> eAllStructuralFeatures = eObject.eClass().getEAllStructuralFeatur
│        EStructuralFeature[] eStructuralFeatures = ((EClassImpl.FeatureSubsetSupplier) eAllStructur
│        var nonDerivedStructuralFeatures = Arrays.stream(eStructuralFeatures).filter(eSF -> !eSF.is
│        if (nonDerivedStructuralFeatures == null) {
│            return ECrossReferenceEList.<T> emptyCrossReferenceEList();
│        } else {
│            return new ECrossReferenceEList<>(eObject, nonDerivedStructuralFeatures) {
│            };
│        }
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/ServiceMethod.java:
⋮
│public final class ServiceMethod {
│
│    private final Method declaration;
│
│    private final String name;
│
│    private final int arity;
│
│    private ServiceMethod(Method declaration, int arity) {
│        this.declaration = declaration;
⋮
│    private static SerializedLambda serializedLambda(Serializable lambdaRef) throws NoSuchMethodExc
│        Method writeReplace = lambdaRef.getClass().getDeclaredMethod("writeReplace");
│        writeReplace.setAccessible(true);
│        return (SerializedLambda) writeReplace.invoke(lambdaRef);
⋮
│    private static Method thisClassMethod(Class<?> implementationClass, String methodName, Class<?>
│        try {
│            return implementationClass.getDeclaredMethod(methodName, parameterTypes);
│        } catch (NoSuchMethodException exception) {
│            return implementationClass.getMethod(methodName, parameterTypes);
│        }
⋮
│    private void checkArity(String... params) {
│        int paramLength;
│        if (params == null) {
│            paramLength = 0;
│        } else {
│            paramLength = params.length;
│        }
│        if (this.arity != paramLength) {
│            throw new IllegalArgumentException(MessageFormat.format("Service {0} has an arity of {1
│        }
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/StandardDiagramsConstants.java:
⋮
│public class StandardDiagramsConstants {
│
│    public static final String GV = "General View";
│
│    public static final String IV = "Interconnection View";
│
│    public static final String AFV = "ActionFlow View";
│
│    public static final String STV = "StateTransition View";
│
⋮
│    public static String getValueFromShortName(String shortName) {
│        return SHORT_NAME_TO_VALUE.get(shortName.toLowerCase());
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/SysMLMetamodelHelper.java:
⋮
│public final class SysMLMetamodelHelper {
│
│    private SysMLMetamodelHelper() {
│    }
│
│    /**
│     * Build the qualified name of the given {@link EClassifier} (e.g.: ePackageName::eClassName).
│     *
│     * @param eClass
│     *            an {@link EClassifier}
⋮
│    public static EClass toEClass(String type) {
│        if (type != null && type.startsWith("sysml::")) {
│            return toEClass(type.replace("sysml::", ""));
│        }
│        final EClass eClass;
│        EClassifier classifier = SysmlPackage.eINSTANCE.getEClassifier(type);
│        if (classifier instanceof EClass) {
│            eClass = (EClass) classifier;
│        } else {
│            eClass = null;
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/SysONEContentAdapter.java:
⋮
│public class SysONEContentAdapter extends EContentAdapter {
│
│    private final Map<EClass, List<EObject>> cache = new HashMap<>();
│
│    public Map<EClass, List<EObject>> getCache() {
│        return this.cache;
│    }
│
│    @Override
│    protected void addAdapter(Notifier notifier) {
⋮
│    @Override
│    protected void removeAdapter(Notifier notifier) {
⋮
│    private boolean shouldCacheMembership(Notifier notifier) {
│        return (!(notifier instanceof RequirementVerificationMembership) && notifier instanceof Req
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/SysONRepresentationDescriptionI
⋮
│public final class SysONRepresentationDescriptionIdentifiers {
│
│    // All standard diagrams have the same description
│    public static final String GENERAL_VIEW_DIAGRAM_DESCRIPTION_ID = "siriusComponents://representa
│
│    /**
│     * All standard diagram descriptions have been merged into one.
│     *
│     * @deprecated use GENERAL_VIEW_DIAGRAM_DESCRIPTION_ID instead.
│     */
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/SysmlEClassSwitch.java:
⋮
│public class SysmlEClassSwitch<T> extends SysmlSwitch<T> {
│
│    public T doSwitch(EClass eClass) {
│        // Create a dummy instance of eClass to let switch cases access the switched EClass.
│        return this.doSwitch(eClass, SysmlFactory.eINSTANCE.create(eClass));
│    }
⋮

backend/services/syson-services/src/main/java/org/eclipse/syson/util/ViewConstants.java:
⋮
│public class ViewConstants {
│
│    public static final String DEFAULT_NODE_WIDTH = "155";
│
│    public static final String DEFAULT_FREE_FORM_COMPARTMENT_NODE_HEIGHT = "150";
│
│    public static final String DEFAULT_COMPARTMENT_NODE_HEIGHT = "60";
│
│    public static final String DEFAULT_COMPARTMENT_NODE_ITEM_HEIGHT = "15";
│
⋮

backend/services/syson-services/src/test/java/org/eclipse/syson/services/AbstractServiceTest.java:
⋮
│public abstract class AbstractServiceTest {
│
│    private final Logger logger = LoggerFactory.getLogger(AbstractServiceTest.class);
│
│    public Resource loadResourcesFrom(ResourceSet resourceSet, String modelPath) {
│        ClassPathResource classPathResource = new ClassPathResource(modelPath);
│        String path = classPathResource.getPath();
│        URI uri = URI.createURI(IEMFEditingContext.RESOURCE_SCHEME + ":///" + UUID.nameUUIDFromByte
│        Resource emfResource = null;
│        Optional<Resource> existingEMFResource = resourceSet.getResources().stream().filter(r -> ur
⋮
│    private Resource loadFromXMI(URI uri, InputStream inputStream) throws IOException {
│        Resource inputResource = new XMIResourceImpl(uri);
│        Map<String, Object> xmiLoadOptions = new EMFResourceUtils().getXMILoadOptions(new XMLParser
│        inputResource.load(inputStream, xmiLoadOptions);
│        return inputResource;
⋮
│    private Resource loadFromJSON(URI uri, InputStream inputStream) throws IOException {
│        Resource inputResource = new JSONResourceFactory().createResource(uri);
│        inputResource.load(inputStream, Map.of());
│        return inputResource;
⋮

backend/services/syson-services/src/test/java/org/eclipse/syson/services/ArchitectureConstants.java:
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_SERVICES_ROOT_PACKAGE = "org.eclipse.syson.services..";
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_SERVICES_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/services/syson-services/src/test/java/org/eclipse/syson/services/CodingRulesTests.java:
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_SERVICES_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮

backend/services/syson-services/src/test/java/org/eclipse/syson/services/SysMLMoveElementServiceTest
⋮
│public class SysMLMoveElementServiceTest extends AbstractServiceTest {
│
│    private ResourceSet rSet;
│
│    private Resource resource;
│
│    private SysMLMoveElementService moveService;
│
│    private List<EObject> readOnlyElements;
│
⋮
│    private void addInPackage(Element element, Package pack) {
│        OwningMembership owningMembership = SysmlFactory.eINSTANCE.createOwningMembership();
│        pack.getOwnedRelationship().add(owningMembership);
│        owningMembership.getOwnedRelatedElement().add(element);
⋮
│    private static final class CapturingMoveElementServiceDelegate implements ISysMLMoveElementServ
│
│        private final boolean canHandle;
│
│        private final MoveStatus moveStatus;
│
│        private int canHandleCallCount;
│
│        private int moveCallCount;
│
⋮
│        @Override
│        public boolean canHandle(Element element, Element newParent) {
⋮

backend/services/syson-services/src/test/java/org/eclipse/syson/services/data/ItemAndAttributesModel
⋮
│public class ItemAndAttributesModelTest {
│
│    private final ModelBuilder builder = new ModelBuilder();
│
│    private ResourceSetImpl resourceSet;
│
│    private JsonResource resource;
│
│    private ActionUsage a0;
│
⋮
│    private ItemUsage createInItemUsageIn(Element parent, String name) {
│        ItemUsage result = this.builder.createInWithName(ItemUsage.class, this.a0, name);
│        result.setDirection(FeatureDirectionKind.IN);
│        return result;
⋮
│    private ItemUsage createInItemUsageInWithType(Element parent, String name, Type type) {
│        ItemUsage result = this.builder.createInWithName(ItemUsage.class, this.a0, name);
│        this.builder.setType(result, type);
│        result.setDirection(FeatureDirectionKind.IN);
│        return result;
⋮

backend/services/syson-services/src/test/java/org/eclipse/syson/services/data/SmallFlashlightExample
⋮
│public class SmallFlashlightExample {
│
│    public static final String FLASHLIGHT_PART_USAGE_NAME = "flashlight";
│
│    private final UtilService utilService = new UtilService();
│
│    private PartUsage flashlightPartUsage;
│
│    private PartDefinition flashLightDefinition;
│
⋮
│    public void addToRoot(Element element) {
│        OwningMembership owningMembership = SysmlFactory.eINSTANCE.createOwningMembership();
│        this.p1.getOwnedRelationship().add(owningMembership);
│        owningMembership.getOwnedRelatedElement().add(element);
⋮
```
