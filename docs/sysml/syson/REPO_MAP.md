# Repo map: SysON

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [the whole repository](https://github.com/eclipse-syson/syson) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--map-tokens 8192`. Git tracks 3,569 files there; aider read the 2,886 that `syson.aiderignore` leaves in, and the map shows 107 of them, 107 with definitions. [The README](README.md) says how to read it and what it leaves out.

```text
backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/conf
⋮
│@Configuration
│public class SysONLoadDefaultLibrariesOnApplicationStartConfiguration {
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/expr
⋮
│@Service
│public class ExpressionsPaletteToolsProvider implements IPaletteToolsProvider {
│
⋮
│    private Optional<String> getTargetObjectId(Object diagramElement) {
│        Optional<String> result = Optional.empty();
│        if (diagramElement instanceof Node node) {
│            result = Optional.of(node.getTargetObjectId());
│        } else if (diagramElement instanceof Edge edge) {
│            result = Optional.of(edge.getTargetObjectId());
│        }
│        return result;
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/inde
⋮
│@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@nestedI
│public interface INestedIndexEntry {
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/migr
⋮
│public class MigrationParticipantService {
│
│    public boolean isSysMLResource(JsonObject jsonObject) {
│        JsonElement nsElements = jsonObject.get("ns");
│        if (nsElements instanceof JsonObject nsElementObjects) {
│            for (String currentKey : nsElementObjects.keySet()) {
│                JsonPrimitive nsURI = nsElementObjects.getAsJsonPrimitive(currentKey);
│                return SysmlPackage.eNS_URI.equals(nsURI.getAsString());
│            }
│        }
⋮
│    public List<JsonObject> collectElementsOfType(JsonObject jsonObject, EClass eClass) {
│        List<JsonObject> elementsOfType = new ArrayList<>();
│        this.collectElementsOfType(jsonObject, eClass, elementsOfType);
│        return elementsOfType;
⋮
│    private void collectElementsOfType(JsonObject jsonObject, EClass eClass, List<JsonObject> accum
│        for (String currentKey : jsonObject.keySet()) {
│            Object value = jsonObject.get(currentKey);
│
│            if (value instanceof JsonObject child) {
│                if (this.isInstanceOf(jsonObject, eClass)) {
│                    accumulator.add(child);
│                }
│                this.collectElementsOfType(child, eClass, accumulator);
│            } else if (value instanceof JsonArray jsonArray) {
⋮
│    private boolean isInstanceOf(JsonObject child, EClass expectedEClass) {
│        JsonElement eClassQn = child.get("eClass");
│        if (eClassQn instanceof JsonPrimitive jsonPrimitive) {
│            String eClassQualifedName = jsonPrimitive.getAsString();
│            if (eClassQualifedName != null && eClassQualifedName.startsWith("sysml:")) {
│                EClassifier objectEClassier = SysmlPackage.eINSTANCE.getEClassifier(eClassQualifedN
│                if (objectEClassier instanceof EClass objectEClass && expectedEClass.isSuperTypeOf(
│                    return true;
│                }
│            }
⋮
│    private void collectElementsOfTypeInArray(JsonArray jsonArray, EClass eClass, List<JsonObject> 
│        for (Object obj : jsonArray) {
│            if (obj instanceof JsonArray) {
│                this.collectElementsOfTypeInArray((JsonArray) obj, eClass, accumulator);
│            } else if (obj instanceof JsonObject) {
│                this.collectElementsOfType((JsonObject) obj, eClass, accumulator);
│            }
│        }
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/migr
⋮
│@Service
│public class SysONEditingContextMigrationParticipantPredicate implements IEditingContextMigrationPa
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Immutable
│public final class SysMLImportedPackageNodeStyle implements INodeStyle {
│
⋮
│    public LineStyle getBorderStyle() {
│        return this.borderStyle;
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Immutable
│public final class SysMLNoteNodeStyle implements INodeStyle {
│
⋮
│    public LineStyle getBorderStyle() {
│        return this.borderStyle;
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Immutable
│public final class SysMLPackageNodeStyle implements INodeStyle {
│
⋮
│    public LineStyle getBorderStyle() {
│        return this.borderStyle;
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Immutable
│public final class SysMLViewFrameNodeStyle implements INodeStyle {
│
⋮
│    public LineStyle getBorderStyle() {
│        return this.borderStyle;
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Service
│public class ForkJoinNodePaletteToolProvider implements IPaletteToolsProvider {
│
⋮
│    private Optional<String> getTargetObjectId(Object diagramElement) {
│        Optional<String> result = Optional.empty();
│        if (diagramElement instanceof Node node) {
│            result = Optional.of(node.getTargetObjectId());
│        }
│        return result;
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/view
⋮
│@Service
│public class SysONViewsExplorerContentServiceDelegate implements IViewsExplorerContentServiceDelega
│
⋮
│    @Override
│    public List<RepresentationKind> getContents(IEditingContext editingContext, List<Representation
⋮

backend/application/syson-application-configuration/src/test/java/org/eclipse/syson/application/serv
⋮
│public class SysONReadOnlyObjectPredicateDelegateTests {
│
│    private final IReadOnlyObjectPredicateDelegate readOnlyObjectPredicateDelegate = new SysONReadO
│
│    @SafeVarargs
│    private static Resource createResource(final URI uri, final Consumer<Resource>... postTreatment
│        final Resource resource = new ResourceImpl(uri);
│        Stream.of(postTreatments).forEach(postTreatment -> postTreatment.accept(resource));
│        return resource;
│    }
│
⋮

backend/application/syson-application-configuration/src/test/java/org/eclipse/syson/application/serv
⋮
│public class SysONResourceLoaderTest {
│
│    private static final String TARGET_ELEMENT_ID = "11111111-1111-4111-8111-111111111111";
│
│    private static final String IMPORT_ELEMENT_ID = "22222222-2222-4222-8222-222222222222";
│
│    @Test
│    @DisplayName("GIVEN a parent-relative cross-document reference, WHEN loading a flat document UR
│    void parentRelativeCrossDocumentReferenceIsResolvedOnLoad() {
│        ResourceSet resourceSet = new ResourceSetImpl();
⋮
│    private JsonResource createResource(ResourceSet resourceSet, UUID documentId) {
│        JsonResource resource = new JSONResourceFactory().createResource(new JSONResourceFactory().
│        resourceSet.getResources().add(resource);
│        return resource;
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/AbstractIntegrationTests.java:
⋮
│@SpringJUnitConfig(classes = { SiriusWebStarterConfiguration.class, JDBCConfiguration.class, Integr
│public abstract class AbstractIntegrationTests {
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│public interface IDiagramChecker {
│
│    void check(Diagram initialDiagram, Diagram newDiagram);
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│public class SpecializationTestArgument {
│
│    private final String creationToolName;
│
│    private final int expectedBorderNodes;
│
│    private final int expectedNodes;
│
│    private final int expectedEdges;
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/data/ExpressionSam
⋮
│public class ExpressionSamplesProjectData {
│    public static final String EDITING_CONTEXT_ID = "aac82b89-8d53-4b16-91b4-deccc180ba62";
│
│    public static final String SCRIPT_PATH = "/scripts/database-content/ExpressionSamples.sql";
│
│    /**
│     * Ids of the semantic elements.
│     */
│    public static final class SemanticIds {
│        public static final String EXPRESSIONS_DOCUMENT_ID = "ef3e6929-0415-4295-b42f-64bed8bd4f55"
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/IEditingContextCachin
⋮
│public interface IEditingContextCachingService {
│
│    void cache();
│
│    void invalidate();
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/diagrams/api/IGivenDi
⋮
│public interface IGivenDiagramSubscription {
│
│    Flux<DiagramRefreshedEventPayload> subscribe(DiagramEventInput diagramEventInput);
│
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/Event.java:
⋮
│public class Event {
│    private final String messageId;
│
│    private final EObject eObject;
│
│    private final Object[] params;
│
│    public Event(final String messageId, final EObject eObject, final Object... params) {
│        this.messageId = messageId;
│        this.eObject = eObject;
⋮
│    @Override
│    public boolean equals(final Object o) {
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/services/SysideExpressi
⋮
│@Service
│public class SysideExpressionEditor implements ISysMLExpressionEditor {
│
⋮
│    private void replace(Expression oldExpression, Expression newExpression) {
│        // Detach the old expression and its owning relationship from the model
│        if (newExpression.getOwningRelationship() != null) {
│            EcoreUtil.remove(newExpression.getOwningRelationship());
│        }
│        // Put the new expression in place of the old one in the same owning relationship
│        if (oldExpression.getOwningRelationship() != null) {
│            EList<Element> relatedElements = oldExpression.getOwningRelationship().getOwnedRelatedE
│            int index = relatedElements.indexOf(oldExpression);
│            relatedElements.add(index, newExpression);
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/utils/LogNameProvider.j
⋮
│public class LogNameProvider {
│
│    public String getName(EObject eObject) {
│        return "[" + eObject.eClass().getName() + "] " + this.getQualifiedName(eObject);
│    }
│
│    private String getQualifiedName(EObject eObject) {
│        if (eObject instanceof Element element) {
│            String qualifiedName = element.getQualifiedName();
│            if (qualifiedName == null && element.eContainer() != null) {
│                qualifiedName = this.getQualifiedName(element.eContainer()) + "::<" + eObject.eClas
│            }
│            return qualifiedName;
│        }
│        return "";
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/src/main/java/org/eclipse/syson/sysmlcu
⋮
│public class SysMLCustomnodesItemProviderAdapterFactory extends SysMLCustomnodesAdapterFactory impl
│    /**
│     * This keeps track of the root adapter factory that delegates to this adapter factory. <!-- be
│     * end-user-doc -->
│     *
│     * @generated
│     */
│    protected ComposedAdapterFactory parentAdapterFactory;
│
│    /**
⋮
│    @Override
│    public ComposeableAdapterFactory getRootAdapterFactory() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public interface SysMLCustomnodesFactory extends EFactory {
│    /**
│     * The singleton instance of the factory. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    SysMLCustomnodesFactory eINSTANCE = org.eclipse.syson.sysmlcustomnodes.impl.SysMLCustomnodesFac
│
│    /**
│     * Returns a new object of class '<em>Sys ML Package Node Style Description</em>'. <!-- begin-u
⋮
│    SysMLPackageNodeStyleDescription createSysMLPackageNodeStyleDescription();
│
⋮
│    SysMLNoteNodeStyleDescription createSysMLNoteNodeStyleDescription();
│
⋮
│    SysMLImportedPackageNodeStyleDescription createSysMLImportedPackageNodeStyleDescription();
│
⋮
│    SysMLViewFrameNodeStyleDescription createSysMLViewFrameNodeStyleDescription();
│
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public interface SysMLCustomnodesPackage extends EPackage {
│    /**
│     * The package name. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    String eNAME = "sysmlcustomnodes";
│
│    /**
│     * The package namespace URI. <!-- begin-user-doc --> <!-- end-user-doc -->
⋮
│    EReference getSysMLPackageNodeStyleDescription_Background();
│
⋮
│    EReference getSysMLNoteNodeStyleDescription_Background();
│
⋮
│    EReference getSysMLImportedPackageNodeStyleDescription_Background();
│
⋮
│    EReference getSysMLViewFrameNodeStyleDescription_Background();
│
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public class SysMLCustomnodesFactoryImpl extends EFactoryImpl implements SysMLCustomnodesFactory {
│    /**
│     * Creates the default factory implementation. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    public static SysMLCustomnodesFactory init() {
│        try {
│            SysMLCustomnodesFactory theSysMLCustomnodesFactory = (SysMLCustomnodesFactory) EPackage
│            if (theSysMLCustomnodesFactory != null) {
│                return theSysMLCustomnodesFactory;
│            }
│        } catch (Exception exception) {
│            EcorePlugin.INSTANCE.log(exception);
│        }
│        return new SysMLCustomnodesFactoryImpl();
⋮
│    @Override
│    public SysMLPackageNodeStyleDescription createSysMLPackageNodeStyleDescription() {
⋮
│    @Override
│    public SysMLNoteNodeStyleDescription createSysMLNoteNodeStyleDescription() {
⋮
│    @Override
│    public SysMLImportedPackageNodeStyleDescription createSysMLImportedPackageNodeStyleDescription(
⋮
│    @Override
│    public SysMLViewFrameNodeStyleDescription createSysMLViewFrameNodeStyleDescription() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public class SysMLCustomnodesPackageImpl extends EPackageImpl implements SysMLCustomnodesPackage {
│    /**
│     * <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    private EClass sysMLPackageNodeStyleDescriptionEClass = null;
│
│    /**
│     * <!-- begin-user-doc --> <!-- end-user-doc -->
⋮
│    public static SysMLCustomnodesPackage init() {
│        if (isInited)
│            return (SysMLCustomnodesPackage) EPackage.Registry.INSTANCE.getEPackage(SysMLCustomnode
│
│        // Obtain or create and register package
│        Object registeredSysMLCustomnodesPackage = EPackage.Registry.INSTANCE.get(eNS_URI);
│        SysMLCustomnodesPackageImpl theSysMLCustomnodesPackage = registeredSysMLCustomnodesPackage 
│                ? (SysMLCustomnodesPackageImpl) registeredSysMLCustomnodesPackage
│                : new SysMLCustomnodesPackageImpl();
│
⋮
│    @Override
│    public EReference getSysMLPackageNodeStyleDescription_Background() {
⋮
│    @Override
│    public EReference getSysMLNoteNodeStyleDescription_Background() {
⋮
│    @Override
│    public EReference getSysMLImportedPackageNodeStyleDescription_Background() {
⋮
│    @Override
│    public EReference getSysMLViewFrameNodeStyleDescription_Background() {
⋮
│    public void createPackageContents() {
│        if (this.isCreated)
│            return;
│        this.isCreated = true;
│
│        // Create classes and their features
│        this.sysMLPackageNodeStyleDescriptionEClass = this.createEClass(SYS_ML_PACKAGE_NODE_STYLE_D
│        this.createEReference(this.sysMLPackageNodeStyleDescriptionEClass, SYS_ML_PACKAGE_NODE_STYL
│
│        this.sysMLNoteNodeStyleDescriptionEClass = this.createEClass(SYS_ML_NOTE_NODE_STYLE_DESCRIP
⋮
│    public void initializePackageContents() {
│        if (this.isInitialized)
│            return;
│        this.isInitialized = true;
│
│        // Initialize package
│        this.setName(eNAME);
│        this.setNsPrefix(eNS_PREFIX);
│        this.setNsURI(eNS_URI);
│
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public class SysMLImportedPackageNodeStyleDescriptionImpl extends MinimalEObjectImpl.Container impl
│    /**
│     * The cached value of the '{@link #getBorderColor() <em>Border Color</em>}' reference. <!-- be
│     * end-user-doc -->
│     *
│     * @see #getBorderColor()
│     * @generated
│     * @ordered
│     */
│    protected UserColor borderColor;
│
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/ElementI
⋮
│public class ElementItemProvider
│        extends EModelElementItemProvider {
⋮
│    @Override
│    protected ItemPropertyDescriptor createItemPropertyDescriptor(AdapterFactory adapterFactory, Re
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ActionDefinition.java:
⋮
│public interface ActionDefinition extends OccurrenceDefinition, Behavior {
│    /**
│     * Returns the value of the '<em><b>Action</b></em>' reference list. The list contents are of t
│     * {@link org.eclipse.syson.sysml.ActionUsage}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Action</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getActionDefinition_Action()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ActionUsage.java:
⋮
│public interface ActionUsage extends OccurrenceUsage, Step {
│    /**
│     * Returns the value of the '<em><b>Action Definition</b></em>' reference list. The list conten
│     * {@link org.eclipse.syson.sysml.Behavior}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Action Definition</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getActionUsage_ActionDefinition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="redefi
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/AnnotatingElement.java
⋮
│public interface AnnotatingElement extends Element {
│    /**
│     * Returns the value of the '<em><b>Annotated Element</b></em>' reference list. The list conten
│     * {@link org.eclipse.syson.sysml.Element}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Annotated Element</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getAnnotatingElement_AnnotatedElement()
│     * @model required="true" transient="true" changeable="false" volatile="true" derived="true"
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Behavior.java:
⋮
│public interface Behavior extends org.eclipse.syson.sysml.Class {
│    /**
│     * Returns the value of the '<em><b>Parameter</b></em>' reference list. The list contents are o
│     * {@link org.eclipse.syson.sysml.Feature}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Parameter</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getBehavior_Parameter()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="redefi
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/BooleanExpression.java
⋮
│public interface BooleanExpression extends Expression {
│    /**
│     * Returns the value of the '<em><b>Predicate</b></em>' reference. <!-- begin-user-doc --> <!--
│     *
│     * @return the value of the '<em>Predicate</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getBooleanExpression_Predicate()
│     * @model transient="true" changeable="false" volatile="true" derived="true" ordered="false" an
│     * @generated
│     */
│    Predicate getPredicate();
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Classifier.java:
⋮
│public interface Classifier extends Type {
│    /**
│     * Returns the value of the '<em><b>Owned Subclassification</b></em>' reference list. The list 
│     * {@link org.eclipse.syson.sysml.Subclassification}. It is bidirectional and its opposite is
│     * '{@link org.eclipse.syson.sysml.Subclassification#getOwningClassifier <em>Owning Classifier<
│     * begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Owned Subclassification</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getClassifier_OwnedSubclassification()
│     * @see org.eclipse.syson.sysml.Subclassification#getOwningClassifier
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Connector.java:
⋮
│public interface Connector extends Feature, Relationship {
│    /**
│     * Returns the value of the '<em><b>Association</b></em>' reference list. The list contents are
│     * {@link org.eclipse.syson.sysml.Association}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Association</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getConnector_Association()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="redefi
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ConstraintUsage.java:
⋮
│public interface ConstraintUsage extends OccurrenceUsage, BooleanExpression {
│    /**
│     * Returns the value of the '<em><b>Constraint Definition</b></em>' reference. <!-- begin-user-
│     * end-user-doc -->
│     *
│     * @return the value of the '<em>Constraint Definition</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getConstraintUsage_ConstraintDefinition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" ordered="false" an
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Definition.java:
⋮
│public interface Definition extends Classifier {
│    /**
│     * Returns the value of the '<em><b>Directed Usage</b></em>' reference list. The list contents 
│     * {@link org.eclipse.syson.sysml.Usage}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Directed Usage</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getDefinition_DirectedUsage()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Element.java:
⋮
│public interface Element extends EModelElement {
│    /**
│     * Returns the value of the '<em><b>Alias Ids</b></em>' attribute list. The list contents are o
│     * {@link java.lang.String}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Alias Ids</em>' attribute list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getElement_AliasIds()
│     * @model
│     * @generated
│     */
⋮
│    EList<Relationship> getOwnedRelationship();
│
⋮
│    String getQualifiedName();
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Expression.java:
⋮
│public interface Expression extends Step {
│    /**
│     * Returns the value of the '<em><b>Function</b></em>' reference. <!-- begin-user-doc --> <!-- 
│     *
│     * @return the value of the '<em>Function</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getExpression_Function()
│     * @model transient="true" changeable="false" volatile="true" derived="true" ordered="false" an
│     * @generated
│     */
│    Function getFunction();
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Feature.java:
⋮
│public interface Feature extends Type {
│    /**
│     * Returns the value of the '<em><b>Chaining Feature</b></em>' reference list. The list content
│     * {@link org.eclipse.syson.sysml.Feature}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Chaining Feature</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getFeature_ChainingFeature()
│     * @model transient="true" changeable="false" volatile="true" derived="true"
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/FeatureMembership.java
⋮
│public interface FeatureMembership extends OwningMembership {
│    /**
│     * Returns the value of the '<em><b>Owned Member Feature</b></em>' reference. It is bidirection
│     * is '{@link org.eclipse.syson.sysml.Feature#getOwningFeatureMembership <em>Owning Feature Mem
│     * begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Owned Member Feature</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getFeatureMembership_OwnedMemberFeature()
│     * @see org.eclipse.syson.sysml.Feature#getOwningFeatureMembership
│     * @model opposite="owningFeatureMembership" required="true" transient="true" changeable="false
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Function.java:
⋮
│public interface Function extends Behavior {
│    /**
│     * Returns the value of the '<em><b>Expression</b></em>' reference list. The list contents are 
│     * {@link org.eclipse.syson.sysml.Expression}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Expression</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getFunction_Expression()
│     * @model transient="true" changeable="false" volatile="true" derived="true" ordered="false" an
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Import.java:
⋮
│public interface Import extends Relationship {
│    /**
│     * Returns the value of the '<em><b>Imported Element</b></em>' reference. <!-- begin-user-doc -
│     * -->
│     *
│     * @return the value of the '<em>Imported Element</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getImport_ImportedElement()
│     * @model required="true" transient="true" changeable="false" volatile="true" derived="true" or
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/InstantiationExpressio
⋮
│public interface InstantiationExpression extends Expression {
│    /**
│     * Returns the value of the '<em><b>Argument</b></em>' reference list. The list contents are of
│     * {@link org.eclipse.syson.sysml.Expression}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Argument</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getInstantiationExpression_Argument()
│     * @model transient="true" changeable="false" volatile="true" derived="true"
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/InvocationExpression.j
⋮
│public interface InvocationExpression extends InstantiationExpression {
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ItemUsage.java:
⋮
│public interface ItemUsage extends OccurrenceUsage {
│    /**
│     * Returns the value of the '<em><b>Item Definition</b></em>' reference list. The list contents
│     * {@link org.eclipse.syson.sysml.Structure}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Item Definition</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getItemUsage_ItemDefinition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/LiteralExpression.java
⋮
│public interface LiteralExpression extends Expression {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Membership.java:
⋮
│public interface Membership extends Relationship {
│    /**
│     * Returns the value of the '<em><b>Member Element</b></em>' reference. <!-- begin-user-doc -->
│     * -->
│     *
│     * @return the value of the '<em>Member Element</em>' reference.
│     * @see #setMemberElement(Element)
│     * @see org.eclipse.syson.sysml.SysmlPackage#getMembership_MemberElement()
│     * @model required="true" ordered="false"
│     * @generated
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Namespace.java:
⋮
│public interface Namespace extends Element {
│    /**
│     * Returns the value of the '<em><b>Imported Membership</b></em>' reference list. The list cont
│     * {@link org.eclipse.syson.sysml.Membership}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Imported Membership</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getNamespace_ImportedMembership()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/OccurrenceDefinition.j
⋮
│public interface OccurrenceDefinition extends Definition, org.eclipse.syson.sysml.Class {
│    /**
│     * Returns the value of the '<em><b>Is Individual</b></em>' attribute. The default value is <co
│     * <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Is Individual</em>' attribute.
│     * @see #setIsIndividual(boolean)
│     * @see org.eclipse.syson.sysml.SysmlPackage#getOccurrenceDefinition_IsIndividual()
│     * @model default="false" required="true" ordered="false"
│     * @generated
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/OccurrenceUsage.java:
⋮
│public interface OccurrenceUsage extends Usage {
│    /**
│     * Returns the value of the '<em><b>Individual Definition</b></em>' reference. <!-- begin-user-
│     * end-user-doc -->
│     *
│     * @return the value of the '<em>Individual Definition</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getOccurrenceUsage_IndividualDefinition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" ordered="false" an
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/OwningMembership.java:
⋮
│public interface OwningMembership extends Membership {
│    /**
│     * Returns the value of the '<em><b>Owned Member Element</b></em>' reference. It is bidirection
│     * is '{@link org.eclipse.syson.sysml.Element#getOwningMembership <em>Owning Membership</em>}'.
│     * --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Owned Member Element</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getOwningMembership_OwnedMemberElement()
│     * @see org.eclipse.syson.sysml.Element#getOwningMembership
│     * @model opposite="owningMembership" required="true" transient="true" changeable="false" volat
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Relationship.java:
⋮
│public interface Relationship extends Element {
│    /**
│     * Returns the value of the '<em><b>Is Implied</b></em>' attribute. The default value is <code>
│     * begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Is Implied</em>' attribute.
│     * @see #setIsImplied(boolean)
│     * @see org.eclipse.syson.sysml.SysmlPackage#getRelationship_IsImplied()
│     * @model default="false" required="true" ordered="false"
│     * @generated
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Specialization.java:
⋮
│public interface Specialization extends Relationship {
│    /**
│     * Returns the value of the '<em><b>General</b></em>' reference. <!-- begin-user-doc --> <!-- e
│     *
│     * @return the value of the '<em>General</em>' reference.
│     * @see #setGeneral(Type)
│     * @see org.eclipse.syson.sysml.SysmlPackage#getSpecialization_General()
│     * @model required="true" ordered="false" annotation="redefines"
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Step.java:
⋮
│public interface Step extends Feature {
│    /**
│     * Returns the value of the '<em><b>Behavior</b></em>' reference list. The list contents are of
│     * {@link org.eclipse.syson.sysml.Behavior}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Behavior</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getStep_Behavior()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Structure.java:
⋮
│public interface Structure extends org.eclipse.syson.sysml.Class {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Subsetting.java:
⋮
│public interface Subsetting extends Specialization {
│    /**
│     * Returns the value of the '<em><b>Owning Feature</b></em>' reference. It is bidirectional and
│     * '{@link org.eclipse.syson.sysml.Feature#getOwnedSubsetting <em>Owned Subsetting</em>}'. <!--
│     * <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Owning Feature</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getSubsetting_OwningFeature()
│     * @see org.eclipse.syson.sysml.Feature#getOwnedSubsetting
│     * @model opposite="ownedSubsetting" transient="true" changeable="false" volatile="true" derive
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Type.java:
⋮
│public interface Type extends Namespace {
│    /**
│     * Returns the value of the '<em><b>Differencing Type</b></em>' reference list. The list conten
│     * {@link org.eclipse.syson.sysml.Type}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Differencing Type</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getType_DifferencingType()
│     * @model transient="true" changeable="false" volatile="true" derived="true"
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Usage.java:
⋮
│public interface Usage extends Feature {
│    /**
│     * Returns the value of the '<em><b>Definition</b></em>' reference list. The list contents are 
│     * {@link org.eclipse.syson.sysml.Classifier}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Definition</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getUsage_Definition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="redefi
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/helper/ImplicitSpecial
⋮
│@Deprecated
│public class ImplicitSpecializationAccumulator {
│
⋮
│    public void add(Specialization s) {
│        if (!this.hasSubSetting && s instanceof Subsetting && !(s instanceof Redefinition) && !(s i
│            this.hasSubSetting = true;
│        }
│        if (!this.hasRedefinition && s instanceof Redefinition) {
│            this.hasRedefinition = true;
│        }
│        if (!this.hasSubclassification && s instanceof Subclassification) {
│            this.hasSubclassification = true;
│        }
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/helper/NameHelper.java
⋮
│@Deprecated
│public final class NameHelper {
│
⋮
│    public static String toPrintableName(String initialName) {
│        return toPrintableName(initialName, false);
⋮
│    public static String toPrintableName(String initialName, boolean escapeSingleQuotes) {
│        String name;
│        if (initialName == null || initialName.isEmpty()) {
│            name = "";
│        } else if (VALID_CHARS.matcher(initialName).find() || !isLetterOrUnderscore(initialName.cha
│            if (escapeSingleQuotes) {
│                name = '\'' + initialName.replaceAll("'", "\\\\'") + '\'';
│            } else {
│                name = '\'' + initialName + '\'';
│            }
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/impl/ElementImpl.java:
⋮
│public abstract class ElementImpl extends EModelElementImpl implements Element {
│    /**
│     * The cached value of the '{@link #getAliasIds() <em>Alias Ids</em>}' attribute list. <!-- beg
│     * end-user-doc -->
│     *
│     * @see #getAliasIds()
│     * @generated
│     * @ordered
│     */
│    protected EList<String> aliasIds;
│
⋮
│    @Override
│    public EList<Relationship> getOwnedRelationship() {
⋮
│    @Override
│    public String getQualifiedName() {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/impl/SysmlFactoryImpl.
⋮
│public class SysmlFactoryImpl extends EFactoryImpl implements SysmlFactory {
│    /**
│     * Creates the default factory implementation. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    public static SysmlFactory init() {
│        try {
│            SysmlFactory theSysmlFactory = (SysmlFactory) EPackage.Registry.INSTANCE.getEFactory(Sy
│            if (theSysmlFactory != null) {
│                return theSysmlFactory;
│            }
│        } catch (Exception exception) {
│            EcorePlugin.INSTANCE.log(exception);
│        }
│        return new SysmlFactoryImpl();
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/impl/SysmlPackageImpl.
⋮
│public class SysmlPackageImpl extends EPackageImpl implements SysmlPackage {
│    /**
│     * <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    private EClass acceptActionUsageEClass = null;
│
│    /**
│     * <!-- begin-user-doc --> <!-- end-user-doc -->
⋮
│    public static SysmlPackage init() {
│        if (isInited) {
│            return (SysmlPackage) EPackage.Registry.INSTANCE.getEPackage(SysmlPackage.eNS_URI);
│        }
│
│        // Obtain or create and register package
│        Object registeredSysmlPackage = EPackage.Registry.INSTANCE.get(eNS_URI);
│        SysmlPackageImpl theSysmlPackage = registeredSysmlPackage instanceof SysmlPackageImpl ? (Sy
│
│        isInited = true;
│
⋮
│    public void createPackageContents() {
│        if (this.isCreated) {
│            return;
│        }
│        this.isCreated = true;
│
│        // Create classes and their features
│        this.acceptActionUsageEClass = this.createEClass(ACCEPT_ACTION_USAGE);
│        this.createEReference(this.acceptActionUsageEClass, ACCEPT_ACTION_USAGE__PAYLOAD_ARGUMENT);
│        this.createEReference(this.acceptActionUsageEClass, ACCEPT_ACTION_USAGE__PAYLOAD_PARAMETER)
⋮
│    public void initializePackageContents() {
│        if (this.isInitialized) {
│            return;
│        }
│        this.isInitialized = true;
│
│        // Initialize package
│        this.setName(eNAME);
│        this.setNsPrefix(eNS_PREFIX);
│        this.setNsURI(eNS_URI);
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/util/ILibraryNamespace
⋮
│public interface ILibraryNamespaceProvider {
│
│    /**
│     * Gets an element from its full qualified name and cast it with the given type if compliant.
│     *
│     * @param <T>
│     *            the expected type
│     * @param qualifiedName
│     *            the full qualified name
│     * @param type
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/util/SysmlResourceFact
⋮
│public class SysmlResourceFactoryImpl extends ResourceFactoryImpl {
│    /**
│     * Creates an instance of the resource factory. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    public SysmlResourceFactoryImpl() {
│        super();
│    }
│
⋮
│    @Override
│    public Resource createResource(URI uri) {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/util/SysmlResourceImpl
⋮
│public class SysmlResourceImpl extends XMIResourceImpl {
│    /**
│     * Creates an instance of the resource. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @param uri
│     *            the URI of the new resource.
│     * @generated
│     */
│    public SysmlResourceImpl(URI uri) {
│        super(uri);
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/ShowDiagram
⋮
│@Service
│public class ShowDiagramsInheritedMembersService {
│
⋮
│    public boolean getShowInheritedMembers() {
│        return this.showInheritedMembers;
⋮
│    public void setShowInheritedMembers(boolean showInheritedMembers) {
│        this.showInheritedMembers = showInheritedMembers;
⋮
│    public boolean getShowInheritedMembersFromStandardLibraries() {
│        return this.showInheritedMembersFromStandardLibraries;
⋮
│    public void setShowInheritedMembersFromStandardLibraries(boolean showInheritedMembersFromStanda
│        this.showInheritedMembersFromStandardLibraries = showInheritedMembersFromStandardLibraries;
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
│    @Override
│    public String getNodeName(String type) {
⋮
│    @Override
│    public String getNodeName(EClass eClass) {
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
│    default String getNodeName(String prefix, String suffix) {
│        return this.getName(prefix, "Node", suffix);
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
│    String getNodeName(String type);
│
⋮
│    String getNodeName(EClass eClass);
│
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
│    public static String buildQualifiedName(EClassifier eClassifier) {
│        return eClassifier.getEPackage().getName() + "::" + eClassifier.getName();
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

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/help
⋮
│public class ImplicitSpecializationAccumulator {
│
│    private boolean hasSubSetting;
│
│    private boolean hasRedefinition;
│
│    private boolean hasSubclassification;
│
│    private boolean hasFeatureTyping;
│
⋮
│    public void add(Specialization s) {
│        if (!this.hasSubSetting && s instanceof Subsetting && !(s instanceof Redefinition) && !(s i
│            this.hasSubSetting = true;
│        }
│        if (!this.hasRedefinition && s instanceof Redefinition) {
│            this.hasRedefinition = true;
│        }
│        if (!this.hasSubclassification && s instanceof Subclassification) {
│            this.hasSubclassification = true;
│        }
⋮

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/help
⋮
│public final class NameHelper {
│
│    private static final java.util.regex.Pattern VALID_CHARS = Pattern.compile("[^a-zA-Z0-9_]");
│
│    /**
│     * Parse a qualified name to extract list of sections.
│     *
│     * @param qualifiedName
│     *            qualified name to split
│     * @return
⋮
│    public String toPrintableName(String initialName) {
│        return this.toPrintableName(initialName, false);
⋮
│    public String toPrintableName(String initialName, boolean escapeSingleQuotes) {
│        String name;
│        if (initialName == null || initialName.isEmpty()) {
│            name = "";
│        } else if (VALID_CHARS.matcher(initialName).find() || !this.isLetterOrUnderscore(initialNam
│            if (escapeSingleQuotes) {
│                name = '\'' + initialName.replaceAll("'", "\\\\'") + '\'';
│            } else {
│                name = '\'' + initialName + '\'';
│            }
⋮

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class FileNameDeresolver implements INameDeresolver {
│
│    private static final Logger LOGGER = LoggerFactory.getLogger(FileNameDeresolver.class);
│
│    /**
│     * Keep a cache of the visible memberships of a given Namespace identified by its elementId.
│     */
│    private final Map<String, EList<Membership>> visibleMembershipsCache = new HashMap<>();
│
│    /**
⋮
│    private String getQualifiedName(Element e) {
│        if (e == null) {
│            return "";
│        }
│        String qn = this.qualifiedNameCache.get(e.getElementId());
│        if (qn == null) {
│            qn = e.getQualifiedName();
│            if (qn == null) {
│                qn = "";
│            }
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/services/api/ISys
⋮
│public interface ISysONExplorerService {
│
│    String getTreeItemId(Object self);
│
│    String getTreeItemTooltip(Object self);
│
│    String getKind(Object self);
│
│    String getLabel(Object self);
│
⋮

backend/services/syson-tree-services/src/test/java/org/eclipse/syson/tree/explorer/services/LibraryS
⋮
│public class LibrarySearchServiceNoOp implements ILibrarySearchService {
│
│    @Override
│    public Page<Library> findAll(Pageable pageable) {
│        return new PageImpl<>(List.of());
│    }
│
│    @Override
│    public boolean existsByNamespaceAndNameAndVersion(String namespace, String name, String version
│        return false;
⋮
│    @Override
│    public Page<Library> findAllByNamespaceAndName(String namespace, String name, Pageable pageable
⋮
│    @Override
│    public List<Library> findAllById(Iterable<UUID> ids) {
⋮

backend/tests/syson-tests/src/main/java/org/eclipse/syson/tests/architecture/AbstractCodingRulesTest
⋮
│public abstract class AbstractCodingRulesTests {
│
│    private static final String GRAPHQL_GUAVA = "graphql.com.google..";
│
│    private static final String GUAVA_ANNOTATIONS = "com.google.common.annotations..";
│
│    private static final String GUAVA_BASE = "com.google.common.base..";
│
│    private static final String GUAVA_COLLECT = "com.google.common.collect..";
│
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

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/menu/conte
⋮
│@Service
│public class CreateRepresentationInputProcessor implements IInputPreProcessor, IInputPostProcessor 
│
⋮
│    private Optional<Element> getObject(IEditingContext editingContext, CreateRepresentationInput i
│        return this.objectSearchService.getObject(editingContext, input.objectId())
│                .filter(Element.class::isInstance)
│                .map(Element.class::cast);
⋮

doc/doc-ui/gulp.d/lib/gulp-prettier-eslint.js:
⋮
│const map = (transform) => new Transform({ objectMode: true, transform })
│
│module.exports = () => {
│  const report = { changed: 0, unchanged: 0 }
│  return map(format).on('finish', () => {
│    if (report.changed > 0) {
│      const changed = 'formatted '
│        .concat(report.changed)
│        .concat(' file')
│        .concat(report.changed === 1 ? '' : 's')
│      const unchanged = 'left '
│        .concat(report.unchanged)
⋮
│  function format (file, enc, next) {
│    if (file.isNull()) return next()
│    if (file.isStream()) return next(new PluginError('gulp-prettier-eslint', 'Streaming not support
│
│    const input = file.contents.toString()
│    const output = prettierEslint({ text: input, filePath: file.path })
│
│    if (input === output) {
│      report.unchanged += 1
│    } else {
⋮

doc/doc-ui/gulp.d/tasks/build-preview-pages.js:
⋮
│const map = (transform = () => {}, flush = undefined) => new Transform({ objectMode: true, transfor
⋮

doc/doc-ui/gulp.d/tasks/build.js:
⋮
│const map = (transform) => new Transform({ objectMode: true, transform })
⋮
│module.exports = (src, dest, preview) => () => {
│  const opts = { base: src, cwd: src }
│  const sourcemaps = preview || process.env.SOURCEMAPS === 'true'
│  const postcssPlugins = [
│    postcssImport,
│    (css, { messages, opts: { file } }) =>
│      Promise.all(
│        messages
│          .reduce((accum, { file: depPath, type }) => (type === 'dependency' ? accum.concat(depPath
│          .map((importedPath) => fs.stat(importedPath).then(({ mtime }) => mtime))
│      ).then((mtimes) => {
│        const newestMtime = mtimes.reduce((max, curr) => (!max || curr > max ? curr : max), file.st
│        if (newestMtime > file.stat.mtime) file.stat.mtimeMs = +(file.stat.mtime = newestMtime)
│      }),
│    postcssUrl([
│      {
│        filter: (asset) => new RegExp('^[~][^/]*(?:font|typeface)[^/]*/.*/files/.+[.](?:ttf|woff2?)
│        url: (asset) => {
│          const relpath = asset.pathname.slice(1)
│          const abspath = require.resolve(relpath)
│          const basename = ospath.basename(abspath)
│          const destpath = ospath.join(dest, 'font', basename)
│          if (!fs.pathExistsSync(destpath)) fs.copySync(abspath, destpath)
│          return path.join('..', 'font', basename)
⋮
│function postcssPseudoElementFixer (css, result) {
│  css.walkRules(/(?:^|[^:]):(?:before|after)/, (rule) => {
│    rule.selector = rule.selectors.map((it) => it.replace(/(^|[^:]):(before|after)$/, '$1::$2')).jo
│  })
⋮

doc/doc-ui/gulp.d/tasks/remove.js:
⋮
│const map = (transform) => new Transform({ objectMode: true, transform })
⋮

doc/doc-ui/gulp.d/tasks/serve.js:
⋮
│function getLocalIp () {
│  for (const records of Object.values(os.networkInterfaces())) {
│    for (const record of records) {
│      if (!record.internal && record.family === 'IPv4') return record.address
│    }
│  }
│  return 'localhost'
⋮

doc/doc-ui/src/helpers/relativize.js:
⋮
│function isDir (str) {
│  return str.charAt(str.length - 1) === '/'
⋮

frontend/syson-components/src/extensions/NewObjectAsTextDocumentReport.types.ts:
⋮
│export interface NewObjectAsTextReportState {
│  downloaded: boolean;
⋮

frontend/syson-components/src/extensions/ShowHideDiagramsIcons.types.ts:
⋮
│export interface GQLShowDiagramsIconsMutationInput {
│  id: string;
│  editingContextId: string;
│  representationId: string;
│  show: boolean;
⋮

frontend/syson-components/src/extensions/ShowHideDiagramsInheritedMembers.types.ts:
⋮
│export interface GQLShowDiagramsInheritedMembersMutationInput {
│  id: string;
│  editingContextId: string;
│  representationId: string;
│  show: boolean;
⋮

frontend/syson-components/src/extensions/expressions/ExpressionProperties.types.ts:
⋮
│export interface FeatureValueExpressionProperties {
│  isDefault: boolean;
│  isInitial: boolean;
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
│export interface GQLInsertTextualSysMLv2Payload {
│  __typename: string;
│  messages: GQLMessage[];
⋮

frontend/syson-components/src/nodes/imported_package/SysMLImportedPackageNode.types.ts:
⋮
│export interface SysMLImportedPackageNodeData extends NodeData {}
│
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
⋮
│  private handleLeafNode(
│    previousDiagram: Diagram | null,
│    node: Node<SysMLImportedPackageNodeData, 'sysMLImportedPackageNode'>,
│    visibleNodes: Node<NodeData, DiagramNodeType>[],
│    _borderWidth: number,
│    _forceDimensions?: ForcedDimensions
⋮

frontend/syson-components/src/nodes/note/SysMLNoteNode.types.ts:
⋮
│export interface SysMLNoteNodeData extends NodeData {}
│
⋮

frontend/syson-components/src/nodes/package/SysMLPackageNode.types.ts:
⋮
│export interface SysMLPackageNodeData extends NodeData {}
│
⋮

frontend/syson-components/src/nodes/view_frame/SysMLViewFrameNode.types.ts:
⋮
│export interface SysMLViewFrameNodeData extends NodeData {}
│
⋮

integration-tests-cypress/cypress/support/server/createProjectCommand.types.ts:
⋮
│export interface CreateProjectPayload {
│  __typename: string;
⋮

integration-tests-cypress/cypress/support/server/deleteProjectCommand.types.ts:
⋮
│export interface DeleteProjectPayload {
│  __typename: string;
⋮

integration-tests-cypress/cypress/support/server/getCurrentEditingContextId.types.ts:
⋮
│export interface EditingContext {
│  id: string;
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
│  public getNodes(diagramLabel: string, nodeLabel: string): Cypress.Chainable<JQuery<HTMLElement>> 
│    return this.getDiagram(diagramLabel).contains('.react-flow__node', nodeLabel);
⋮
│  public getSelectedNodes(diagramLabel: string, nodeLabel: string): Cypress.Chainable<JQuery<HTMLEl
│    return this.getDiagram(diagramLabel).get('div.react-flow__node.selected').contains('.react-flow
⋮
│  public getPaletteToolSection(index: number): Cypress.Chainable<JQuery<HTMLDivElement>> {
│    return this.getPalette().should('exist').children('div').eq(index).children('div');
⋮
│  public getNodeCssValue(diagramLabel: string, nodeLabel: string, cssValue: string): Cypress.Chaina
│    return this.getNodes(diagramLabel, nodeLabel)
│      .invoke('css', cssValue)
│      .then((widthValue) => {
│        return parseInt(String(widthValue));
│      });
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
```
