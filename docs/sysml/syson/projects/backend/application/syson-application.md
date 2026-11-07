# Repo map: backend/application/syson-application

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/application/syson-application`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/application/syson-application) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 332 files there; aider read the 332 that `syson.aiderignore` leaves in, and the map shows 55 of them, 55 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/application/syson-application/src/test/java/org/eclipse/syson/AbstractIntegrationTests.java:
⋮
│@SpringJUnitConfig(classes = { SiriusWebStarterConfiguration.class, JDBCConfiguration.class, Integr
│public abstract class AbstractIntegrationTests {
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/JavaServiceIsCalledChecker.jav
⋮
│public class JavaServiceIsCalledChecker {
│
│    private final Set<String> aqlServiceNames;
│
│    public JavaServiceIsCalledChecker(View view) {
│        IQueryEnvironment environment = Query.newEnvironmentWithDefaultServices(new SimpleCrossRefe
│        Set<String> aqlDefaultServiceNames = environment.getLookupEngine().getRegisteredServices().
│                .map(IService::getName)
│                .collect(Collectors.toSet());
│
⋮
│    private Collection<String> collectAQLExpressions(EObject eObject) {
│        Set<String> expressions = new HashSet<>();
│        this.collectAQLExpressions(eObject, expressions);
│        return expressions;
⋮
│    private void collectAQLExpressions(EObject eObject, Set<String> expressions) {
│        // All interpreted expressions on the eOject itself
│        eObject.eClass().getEAllStructuralFeatures().stream()
│                .filter(EAttribute.class::isInstance)
│                .map(EAttribute.class::cast)
│                .filter(attr -> attr.getEType() == ViewPackage.Literals.INTERPRETED_EXPRESSION)
│                .forEach(expressionAttribute -> expressions.add((String) eObject.eGet(expressionAtt
│        // Recurse on all its descendants
│        eObject.eAllContents().forEachRemaining(o -> this.collectAQLExpressions(o, expressions));
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/SysONNoDefaultLibrariesTestCon
⋮
│@Configuration
│@Primary
│@Conditional(OnNoDefaultLibrariesTests.class)
│public class SysONNoDefaultLibrariesTestConfiguration extends SysONDefaultLibrariesConfiguration {
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/SysONTestsProperties.java:
⋮
│public class SysONTestsProperties {
│
│    public static final String SYSON_TEST_ENABLED = "syson.test.enabled";
│
│    public static final String NO_DEFAULT_LIBRARIES = "no-default-libraries";
│
│    public static final String NO_DEFAULT_LIBRARIES_PROPERTY = SYSON_TEST_ENABLED + "=" + NO_DEFAUL
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controller/editing
⋮
│public interface ISemanticChecker {
│
│    void check(IEditingContext editingContext);
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controller/editing
⋮
│public class SemanticCheckerService {
│
│    private final SemanticRunnableFactory semanticRunnableFactory;
│
│    private final IObjectSearchService objectSearchService;
│
│    private final String editingContextId;
│
│    private final String rootElementId;
│
⋮
│    @Deprecated
│    public <T extends Element> void checkElement(Step<?> verifier, Class<T> type, Supplier<String> 
⋮
│    public <T extends Element> Runnable checkElement(Class<T> type, Supplier<String> idSupplier, Co
│        ISemanticChecker checker = editingContext -> {
│            Optional<Object> optElement = this.objectSearchService.getObject(editingContext, idSupp
│            assertThat(optElement).isPresent();
│            Object element = optElement.get();
│            assertThat(element).isInstanceOf(type);
│            T castedElement = type.cast(element);
│            semanticChecker.accept(castedElement);
│        };
│        return this.checkEditingContext(checker);
⋮
│    @Deprecated
│    public void checkEditingContext(ISemanticChecker semanticChecker, Step<?> verifier) {
⋮
│    public Runnable checkEditingContext(ISemanticChecker semanticChecker) {
│        return this.semanticRunnableFactory.createQueryRunnable(this.editingContextId,
│                (editingContext, executeEditingContextFunctionInput) -> {
│                    semanticChecker.check(editingContext);
│                    return new ExecuteEditingContextFunctionSuccessPayload(executeEditingContextFun
│                });
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│public class CheckDiagramElementCount implements IDiagramChecker {
│
│    private final DiagramComparator diagramComparator;
│
│    private int newNodeCount;
│
│    private int newEdgeCount;
│
│    private int newBorderNodeCount;
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│public class ConnectorCheckerBuilder<T extends Connector> {
│
│    private String expectedSourceSemanticId;
│
│    private String expectedTargetSemanticId;
│
│    private String expectedSemanticContainer;
│
│    private List<String> expectedSourceFeatureChain;
│
⋮
│    public Runnable build(AtomicReference<String> edgeIdProvider) {
│        return this.semanticCheckerService.checkElement(this.expectedType, edgeIdProvider::get,
│                connector -> {
│                    assertThat(this.identityService.getId(connector.getSourceFeature().getFeatureTa
│                            .isEqualTo(this.expectedSourceSemanticId);
│                    assertThat(this.identityService.getId(connector.getTargetFeature().get(0).getFe
│                            .isEqualTo(this.expectedTargetSemanticId);
│                    assertThat(this.identityService.getId(connector.getOwner())).isEqualTo(this.exp
│
│                    if (this.expectedSourceFeatureChain != null) {
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
│@Transactional
│@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
│public class GVGroupPaletteTests extends AbstractIntegrationTests {
│
⋮
│    private Node nodeWithId(Diagram diagram, String nodeId) {
│        return new DiagramNavigator(diagram).nodeWithId(nodeId).getNode();
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│public record ElementTestArgument(EClass eClass, String creationToolName, int expectedBorderNodes, 
│
│    public ElementTestArgument {
│        Objects.requireNonNull(eClass);
│        Objects.requireNonNull(creationToolName);
│    }
│
│    ElementTestArgument(EClass eClass, String creationToolName) {
│        // by default creating an element on the diagram only creates 1 new node (the element graph
│        this(eClass, creationToolName, 0, 1, 0);
⋮
│    @Override
│    public String toString() {
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│public record NestedElementTestArgument(String creationToolName,
│        String compartmentName,
│        String expectedName,
│        String referencedNodeId,
│        int expectedBorderNodes,
│        int expectedNodes,
│        int expectedEdges) {
│
⋮
│    @Override
│    public String toString() {
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
│    @Override
│    public String toString() {
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│@Service
│public class EditSysMLImportedPackageNodeAppearanceMutationRunner implements IMutationRunner<IInput
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│@Service
│public class EditSysMLNoteNodeAppearanceMutationRunner implements IMutationRunner<IInput> {
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│@Service
│public class EditSysMLPackageNodeAppearanceMutationRunner implements IMutationRunner<IInput> {
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│@Service
│public class EditSysMLViewFrameNodeAppearanceMutationRunner implements IMutationRunner<IInput> {
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│@Service
│public class ShowDiagramsInheritedMembersMutationRunner implements IMutationRunner<IInput> {
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│@Service
│public class DropNodesWithMessageMutationRunner implements IMutationRunner<DropNodesInput> {
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│@Service
│public class DropOnDiagramWithMessagesMutationRunner implements IMutationRunner<DropOnDiagramInput>
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/diagra
⋮
│@Service
│public class ToolTester {
│
⋮
│    public void invokeTool(String editingContextId, AtomicReference<Diagram> diagram, String toolId
│        this.invokeTool(editingContextId, diagram, null, toolId);
⋮
│    public void invokeTool(String editingContextId, AtomicReference<Diagram> diagram, String select
│        this.invokeTool(editingContextId, diagram, selectedNodeTargetObjectId, toolId, List.of());
⋮
│    public void invokeTool(String editingContextId, AtomicReference<Diagram> diagram, String select
│        String diagramId = diagram.get().getId();
│        String diagramElementId = null;
│        if (selectedNodeTargetObjectId != null) {
│            DiagramNavigator diagramNavigator = new DiagramNavigator(diagram.get());
│            diagramElementId = diagramNavigator.nodeWithTargetObjectId(selectedNodeTargetObjectId).
│        } else {
│            diagramElementId = diagramId;
│        }
│        this.invokeTool(editingContextId, diagramId, diagramElementId, toolId, variables);
⋮
│    public void invokeTool(String editingContextId, String diagramId, String diagramElementId, Stri
│        this.invokeTool(editingContextId, diagramId, List.of(diagramElementId), toolId, variables);
⋮
│    public void invokeTool(String editingContextId, String diagramId, List<String> diagramElementId
│        var input = new InvokeSingleClickOnDiagramElementToolInput(
│                UUID.randomUUID(),
│                editingContextId,
│                diagramId,
│                diagramElementIds,
│                toolId,
│                0,
│                0,
│                variables);
⋮
│    public void createNodeOnEdge(String editingContextId, AtomicReference<Diagram> diagram, String 
│        this.createNodeOnEdge(editingContextId, diagram, selectedEdgeTargetObjectLabel, toolId, Lis
⋮
│    public void createNodeOnEdge(String editingContextId, AtomicReference<Diagram> diagram, String 
│        String diagramElementId = diagram.get().getId();
│        if (selectedEdgeTargetObjectLabel != null) {
│            DiagramNavigator diagramNavigator = new DiagramNavigator(diagram.get());
│            diagramElementId = diagramNavigator.edgeWithTargetObjectLabel(selectedEdgeTargetObjectL
│        }
│        var createElementInput = new InvokeSingleClickOnDiagramElementToolInput(
│                UUID.randomUUID(),
│                editingContextId,
│                diagram.get().getId(),
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/expres
⋮
│@Service
│public class CreateExpressionMutationRunner implements IMutationRunner<CreateExpressionInput> {
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/expres
⋮
│@Service
│public class DeleteExpressionMutationRunner implements IMutationRunner<DeleteExpressionInput> {
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/expres
⋮
│@Service
│public class EditExpressionMutationRunner implements IMutationRunner<EditExpressionInput> {
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/expres
⋮
│@Service
│public class ExpressionTextualRepresentationQueryRunner implements IQueryRunner {
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/controllers/utils/
⋮
│public class TestNameGenerator {
│
│    public static Arguments namedArguments(Arguments arg) {
│        return Arguments.of(Arrays.stream(arg.get()).map(TestNameGenerator::namedPayload).toArray()
│    }
│
│    public static <T> Named<T> namedPayload(T payload) {
│        String name = Objects.toString(payload);
│        if (payload instanceof EClassifier eClassifier) {
│            name = eClassifier.getName();
│        }
│        if (payload instanceof EStructuralFeature eStructuralFeature) {
│            name = eStructuralFeature.getName();
│        }
│        final String computedName = name;
│        return new Named<>() {
│            @Override
│            public String getName() {
│                return computedName;
│            }
│
│            @Override
│            public T getPayload() {
│                return payload;
│            }
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

backend/application/syson-application/src/test/java/org/eclipse/syson/application/data/ProjectWithLi
⋮
│public class ProjectWithLibraryDependencyContainingCommentAndLibraryPackageTestProjectData {
│
│    public static final String SCRIPT_PATH = "/scripts/database-content/SysMLv2-ProjectWithLibraryD
│
│    public static final String PROJECT_NAME = "SysMLv2";
│
│    public static final String PROJECT_ID = "be5101e5-27ac-41bc-b050-cb9c87ed4bc7";
│
│    public static final String EDITING_CONTEXT = "00fdbaac-73bc-4188-8758-0070e47b993c";
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/data/ProjectWithLi
⋮
│public class ProjectWithLibraryDependencyContainingLibraryPackageTestProjectData {
│
│    public static final String SCRIPT_PATH = "/scripts/database-content/SysMLv2-ProjectWithLibraryD
│
│    public static final String PROJECT_NAME = "SysMLv2";
│
│    public static final String PROJECT_ID = "607aeefc-defc-414c-ad1c-c355b801fa59";
│
│    public static final String EDITING_CONTEXT = "9c17ca3b-c1fe-43e2-92a4-c14c052a6d1a";
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/data/ProjectWithLi
⋮
│public class ProjectWithLibraryDependencyContainingPackageAndLibraryPackageTestProjectData {
│
│    public static final String SCRIPT_PATH = "/scripts/database-content/SysMLv2-ProjectWithLibraryD
│
│    public static final String PROJECT_NAME = "SysMLv2";
│
│    public static final String PROJECT_ID = "43004111-b61d-40bb-9f1a-2f147476674d";
│
│    public static final String EDITING_CONTEXT = "9fcdc1e3-c28a-472e-97ac-27c9bcf87890";
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/data/ProjectWithLi
⋮
│public class ProjectWithLibraryDependencyTestProjectData {
│
│    public static final String PROJECT_NAME = "ProjectUsingMyLibraryV1";
│
│    public static final String PROJECT_ID = "3a06824a-a634-42ea-918f-817adc4b17a3";
│
│    public static final String LIBRARY_PROJECT_ID = "c493d950-f81a-4e56-a454-f9e5ce1c839f";
│
│    public static final String EDITING_CONTEXT = "09ba2e1b-7f2b-4c5f-a536-9624ba470f74";
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/data/ProjectWithUn
⋮
│public class ProjectWithUnusedBatmobileLibraryDependencyTestProjectData {
│
│    public static final String SCRIPT_PATH = "/scripts/database-content/SysMLv2-ProjectWithUnusedBa
│
│    public static final String PROJECT_NAME = "SysMLv2-ProjectWithUnusedBatmobileLibraryDependency"
│
│    public static final String PROJECT_ID = "7c4245ac-4fac-4592-80eb-f6c67e3fd98a";
│
│    public static final String EDITING_CONTEXT = "050c3eea-4633-4ad9-a7ba-378b6ff9a3ff";
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/data/ProjectWithUs
⋮
│public class ProjectWithUsedBatmobileLibraryDependencyTestProjectData {
│
│    public static final String SCRIPT_PATH = "/scripts/database-content/SysMLv2-ProjectWithUsedBatm
│
│    public static final String PROJECT_NAME = "SysMLv2-ProjectWithUsedBatmobileLibraryDependency";
│
│    public static final String PROJECT_ID = "d1df5921-0ad7-4864-94b0-609609f92a24";
│
│    public static final String EDITING_CONTEXT = "64ec9d3e-f4bf-4e26-88f1-d035d93d133e";
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/data/ProjectWithou
⋮
│public class ProjectWithoutLibraryDependencyTestProjectData {
│
│    public static final String PROJECT_ID = "85ed22a4-81ad-46ac-a584-bf7259cd8568";
│
│    public static final String EDITING_CONTEXT = "bb9678c1-8f2e-440f-be06-628d1930ffc2";
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/data/SysonStudioTe
⋮
│public class SysonStudioTestProjectData {
│
│    public static final String SCRIPT_PATH = "/scripts/database-content/SysON-Studio.sql";
│
│    public static final String EDITING_CONTEXT_ID = "6323955c-ceff-48e3-88ad-bd3ace221729";
│
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/imports/MutationIn
⋮
│@Transactional
│@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
│public class MutationInsertTextualSysMLv2DataFetcherTests extends AbstractIntegrationTests {
│
⋮
│    private <T extends Element> void checkElement(Class<T> elementType, String elementToCheck, Pred
│        BiFunction<IEditingContext, IInput, IPayload> function = (editingContext, executeEditingCon
│            return new ExecuteEditingContextFunctionSuccessPayload(executeEditingContextFunctionInp
│                    this.objectSearchService.getObject(editingContext, elementToCheck).get());
│        };
│        var mono = this.executeEditingContextFunctionRunner.execute(new ExecuteEditingContextFuncti
│
│        Predicate<IPayload> predicate = payload -> Optional.of(payload)
│                .filter(ExecuteEditingContextFunctionSuccessPayload.class::isInstance)
│                .map(ExecuteEditingContextFunctionSuccessPayload.class::cast)
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/application/imports/MutationIn
⋮
│@Service
│public class MutationInsertTextualSysMLv2DataRunner implements IMutationRunner<InsertTextualSysMLv2
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/data/ClasspathXmiModelLoader.j
⋮
│public class ClasspathXmiModelLoader {
│
│    private final ResourceSet resourceSet;
│
│    public ClasspathXmiModelLoader(ResourceSet resourceSet) {
│        this.resourceSet = resourceSet;
│    }
│
│    /**
│     * Load a resource from a file path relative to the classpath.
⋮
│    public Resource load(String path) throws IOException {
│        ClassPathResource cr = new ClassPathResource(path);
│        try (InputStream input = cr.getInputStream()) {
│            XMIResource resource = new XMIResourceImpl(URI.createURI("fake://" + path));
│            this.resourceSet.getResources().add(resource);
│            resource.load(input, Collections.emptyMap());
│            return resource;
│        }
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/data/generator/XMLHeaderWriter
⋮
│public class XMLHeaderWriter {
│
│    /**
│     * Write a header comment in a given XML file.
│     *
│     * @param headerContent
│     *         the content to add as header
│     * @param targetFile
│     *         the destination file
│     * @throws IOException
⋮
│    private String insertMultilineComment(String xml, String comment) {
│        String safe = this.toSafeXmlComment(comment);
│
│        String c = "\n<!--\n" + safe + "\n-->\n";
│
│        int declEnd = xml.indexOf("?>");
│        if (declEnd >= 0) {
│            declEnd += 2;
│            return xml.substring(0, declEnd) + c + xml.substring(declEnd);
│        }
⋮
│    private String toSafeXmlComment(String comment) {
│        if (comment == null) {
│            return "";
│        }
│
│        String s = comment;
│        // Forbidden in XML comment
│        s = s.replace("--", "—");
│        if (s.endsWith("-")) {
│            s += " ";
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/CachedStandardLibrari
⋮
│@Service
│@ConditionalOnBooleanProperty("org.eclipse.syson.test.cacheStandardLibraries")
│@Primary
│public class CachedStandardLibrariesLoader implements IStandardLibrariesLoader {
│
⋮
│    public void cache(String editingContextId, List<Resource> standardLibraryResources) {
│        // Remove all the adapters from existing resources, this ensures that the list of adapters 
│        standardLibraryResources.forEach(resource -> resource.eAdapters().clear());
│        this.standardLibrariesCache.put(editingContextId, standardLibraryResources);
⋮
│    public void invalidateCache() {
│        this.standardLibrariesCache.invalidateAll();
⋮
│    @Override
│    public void loadStandardLibraries(ResourceSet targetResourceSet) {
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/EditingContextCaching
⋮
│@Service
│@ConditionalOnBooleanProperty("org.eclipse.syson.test.cacheStandardLibraries")
│public class EditingContextCachingService implements IEditingContextCachingService {
│
⋮
│    @Override
│    public void cache() {
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/IEditingContextCachin
⋮
│public interface IEditingContextCachingService {
│
│    void cache();
│
│    void invalidate();
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/NoOpEditingContextCac
⋮
│@Service
│@ConditionalOnBooleanProperty(value = "org.eclipse.syson.test.cacheStandardLibraries", havingValue 
│public class NoOpEditingContextCachingService implements IEditingContextCachingService {
│
│    @Override
│    public void cache() {
⋮
│    @Override
│    public void invalidate() {
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/SemanticRunnableFacto
⋮
│@Service
│public class SemanticRunnableFactory {
│
⋮
│    public Runnable createQueryRunnable(String editingContextId, BiFunction<IEditingContext, IInput
│        return () -> {
│            var input = new ExecuteEditingContextFunctionInput(UUID.randomUUID(), editingContextId,
│
│            Mono<IPayload> result = this.executeEditingContextFunctionRunner.execute(input);
│            var payload = result.block();
│            assertThat(payload).isInstanceOf(ExecuteEditingContextFunctionSuccessPayload.class);
│        };
⋮
│    public Runnable createRunnable(String editingContextId, BiFunction<IEditingContext, IInput, IPa
│        return () -> {
│            var inputId = UUID.randomUUID();
│            var input = new ExecuteEditingContextFunctionInput(UUID.randomUUID(), editingContextId,
│
│            Mono<IPayload> result = this.executeEditingContextFunctionRunner.execute(input);
│            var payload = result.block();
│            assertThat(payload).isInstanceOf(ExecuteEditingContextFunctionSuccessPayload.class);
│        };
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/diagrams/DiagramCompa
⋮
│@Service
│public class DiagramComparator {
│
│    public List<Node> newNodes(Diagram previousDiagram, Diagram newDiagram) {
│        NodeFinder previousDiagramNodeFinder = new NodeFinder(previousDiagram);
│        NodeFinder newDiagramNodeFinder = new NodeFinder(newDiagram);
│        List<String> previousNodeIds = previousDiagramNodeFinder.getAllNodesMatching(n -> true).str
│                .map(Node::getId)
│                .toList();
│        return newDiagramNodeFinder.getAllNodesMatching(n -> !previousNodeIds.contains(n.getId()));
⋮
│    public List<Edge> newEdges(Diagram previousDiagram, Diagram newDiagram) {
│        List<String> previousEdgeIds = previousDiagram.getEdges().stream()
│                .map(Edge::getId)
│                .toList();
│        return newDiagram.getEdges().stream()
│                .filter(edge -> !previousEdgeIds.contains(edge.getId()))
│                .toList();
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/diagrams/DiagramDescr
⋮
│public class DiagramDescriptionIdProvider {
│
│    private final DiagramDescription diagramDescription;
│
│    private final IDiagramIdProvider diagramIdProvider;
│
│    public DiagramDescriptionIdProvider(DiagramDescription diagramDescription, IDiagramIdProvider d
│        this.diagramDescription = Objects.requireNonNull(diagramDescription);
│        this.diagramIdProvider = Objects.requireNonNull(diagramIdProvider);
│    }
│
⋮
│    public String getNodeToolId(String nodeDescriptionName, String toolName) {
│        Optional<String> nodeToolId =  EMFUtils.allContainedObjectOfType(this.diagramDescription, N
│                .filter(nodeDescription -> nodeDescription.getName().equals(nodeDescriptionName))
│                .findFirst()
│                .map(NodeDescription::getPalette)
│                .flatMap(palette -> EMFUtils.allContainedObjectOfType(palette, NodeTool.class)
│                        .filter(nodeTool -> nodeTool.getName().equals(toolName))
│                        .map(nodeTool -> UUID.nameUUIDFromBytes(EcoreUtil.getURI(nodeTool).toString
│                        .findFirst());
│        assertThat(nodeToolId).as(this.shouldExist(nodeDescriptionName + " node tool " + toolName))
⋮
│    public String getNodeDescriptionId(String name) {
│        Optional<String> nodeDescriptionId = EMFUtils.allContainedObjectOfType(this.diagramDescript
│                .filter(nodeDescription -> nodeDescription.getName().equals(name))
│                .map(this.diagramIdProvider::getId)
│                .findFirst();
│        assertThat(nodeDescriptionId).as(this.shouldExist("Node " + name)).isPresent();
│        return nodeDescriptionId.get();
⋮
│    private String shouldExist(String what) {
│        return what + " should exist";
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/diagrams/GivenDiagram
⋮
│@Service
│public class GivenDiagramDescription implements IGivenDiagramDescription {
│
⋮
│    @Override
│    public DiagramDescription getDiagramDescription(String editingContextId, String diagramDescript
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/diagrams/GivenDiagram
⋮
│@Service
│public class GivenDiagramReference implements IGivenDiagramReference {
│
│    @Override
│    public AtomicReference<Diagram> getDiagram(Step<DiagramRefreshedEventPayload> stepVerifier) {
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/diagrams/NodeCreation
⋮
│public class NodeCreationTestsService {
│
│    private final ToolTester toolTester;
│
│    private final IDescriptionNameGenerator descriptionNameGenerator;
│
│    private final String editingContextId;
│
│    public NodeCreationTestsService(ToolTester nodeCreationTester, IDescriptionNameGenerator descri
│        this.editingContextId = Objects.requireNonNull(editingContextId);
⋮
│    public Runnable createNodeOnEdge(DiagramDescriptionIdProvider diagramDescriptionIdProvider,
⋮
│    public Runnable createNodeOnEdge(DiagramDescriptionIdProvider diagramDescriptionIdProvider,
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/diagrams/api/IGivenDi
⋮
│public interface IGivenDiagramDescription {
│
│    DiagramDescription getDiagramDescription(String editingContextId, String diagramDescriptionId);
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/diagrams/api/IGivenDi
⋮
│@Deprecated(forRemoval = true)
│public interface IGivenDiagramReference {
│
⋮
│    AtomicReference<Diagram> getDiagram(Step<DiagramRefreshedEventPayload> stepVerifier);
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/diagrams/api/IGivenDi
⋮
│public interface IGivenDiagramSubscription {
│
│    Flux<DiagramRefreshedEventPayload> subscribe(DiagramEventInput diagramEventInput);
│
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/explorer/ExplorerDefa
⋮
│@Service
│public class ExplorerDefaultFiltersSearchService implements IExplorerDefaultFiltersSearchService {
│
⋮
│    @Override
│    public List<String> findTreeDefaultFilterIds(String editingContextId, String treeDescriptionId)
⋮

backend/application/syson-application/src/test/java/org/eclipse/syson/services/explorer/api/IExplore
⋮
│public interface IExplorerDefaultFiltersSearchService {
│
│    List<String> findTreeDefaultFilterIds(String editingContextId, String treeDescriptionId);
⋮

backend/application/syson-application/src/test/resources/spring.properties:
⋮
│spring.test.context.cache.maxSize=8
```
