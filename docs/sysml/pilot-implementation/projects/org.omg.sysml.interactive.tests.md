# Repo map: org.omg.sysml.interactive.tests

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.interactive.tests`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.interactive.tests) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 31 files there; aider read the 31 that `pilot.aiderignore` leaves in, and the map shows 18 of them, 18 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.interactive.tests/build.properties:
│source.. = src/,\
│           resources/
│output.. = target/classes
│bin.includes = META-INF/,\
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/DerivedPropertyAndOperationTest.
⋮
│public class DerivedPropertyAndOperationTest extends SysMLInteractiveTest {
│
│       @Test
│       public void testOwnedUsage() throws Exception {
│               List<Element> members = process("part def P { attribute x; item y; part def Q; }");
│               assertFalse("No members", members.isEmpty());
│               Element member = members.get(0);
│               assertTrue("No definition", member instanceof Definition);
│               List<Usage> usages = ((Definition)member).getOwnedUsage();
│               assertEquals(2, usages.size());
⋮
│       private boolean testFeatureOwningTypes(Type type) {
│               return type.getFeatureMembership().stream().map(FeatureMembership::getOwningType).allMatch(t->typ
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/ExpressionEvaluationTest.java:
⋮
│public class ExpressionEvaluationTest extends SysMLInteractiveTest {
│
│       protected void assertElement(String message, String expected, String actual) {
│               message = message == null? "": message + " ";
│               assertTrue(message + "expected: " + expected + " actual: " + actual, actual.startsWith(expected))
│       }
│       
│       protected void assertElement(String expected, String actual) {
│               assertElement(null, expected, actual);
│       }
│       
│       protected void assertList(String[] expecteds, String actual) {
│               String[] actuals = actual.isEmpty()? new String[] {}: actual.split("\n");
│               assertEquals("length", expecteds.length, actuals.length);
│               for (int i = 0; i < expecteds.length; i++) {
│                       assertElement("[" + i + "]", expecteds[i], actuals[i]);
│               }
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/ExpressionResultConsultationTest
⋮
│public class ExpressionResultConsultationTest extends SysMLInteractiveTest {
│
│       private static <T> T findSingle(Resource resource, Class<T> kind) {
│               T found = null;
│               for (var contents = resource.getAllContents(); contents.hasNext();) {
│                       var object = contents.next();
│                       if (kind.isInstance(object)) {
│                               if (found != null) {
│                                       throw new AssertionError("Expected exactly one " + kind.getSimpleName() + ", found a second");
│                               }
│                               found = kind.cast(object);
│                       }
⋮
│       private void invalidateEditedModel(Resource resource) {
│               for (var contents = resource.getAllContents(); contents.hasNext();) {
│                       if (contents.next() instanceof Element element) {
│                               ElementUtil.clean(element);
│                       }
│               }
⋮
│       private void assertPreparedResultUnchanged(Expression expression, Feature result, List<Relationshi
│               boolean transformed = ElementUtil.isTransformed(expression);
│               assertSame(result, expression.getResult());
│               assertEquals(FeatureDirectionKind.OUT, result.getDirection());
│               assertEquals(relationships, expression.getOwnedRelationship());
│               assertEquals(1, relationships.stream().filter(ReturnParameterMembership.class::isInstance).count(
│               // Consultation must not transform the expression as a side effect.
│               assertEquals(transformed, ElementUtil.isTransformed(expression));
⋮
│       private void assertStableThroughTransformation(Resource resource, Expression expression, Feature r
│               assertEquals(FeatureDirectionKind.OUT, result.getDirection());
│               assertSame(result, expression.getResult());
│               // Clearing derived caches must not replace the result observed by the caller.
│               ElementUtil.clearCachesOf(expression);
│               assertSame(result, expression.getResult());
│               // Explicit transformation owns exactly one result; repeating it must not add another.
│               ElementUtil.transformAll(resource, true);
│               ElementUtil.transformAll(resource, true);
│               assertSame(result, expression.getResult());
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/FeatureChainConsultationTest.jav
⋮
│public class FeatureChainConsultationTest extends SysMLInteractiveTest {
│
│       private static <T> T findSingle(Resource resource, Class<T> kind) {
│               T found = null;
│               for (var contents = resource.getAllContents(); contents.hasNext();) {
│                       var object = contents.next();
│                       if (kind.isInstance(object)) {
│                               if (found != null) {
│                                       throw new AssertionError("Expected exactly one " + kind.getSimpleName() + ", found a second");
│                               }
│                               found = kind.cast(object);
│                       }
⋮
│       private Feature sourceParameter(FeatureChainExpression chain) {
│               return chain.getOwnedFeature().stream().filter(feature -> feature.getDirection() == FeatureDirect
│                               .findFirst().orElseThrow();
⋮
│       private void invalidateEditedModel(Resource resource) {
│               for (var contents = resource.getAllContents(); contents.hasNext();) {
│                       if (contents.next() instanceof Element element) {
│                               ElementUtil.clean(element);
│                       }
│               }
⋮
│       private void clearDerivedCaches(Resource resource) {
│               for (var contents = resource.getAllContents(); contents.hasNext();) {
│                       if (contents.next() instanceof Element element) {
│                               ElementUtil.clearCachesOf(element);
│                       }
│               }
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/GlobalNameRedefinitionTest.java:
⋮
│public class GlobalNameRedefinitionTest extends SysMLInteractiveTest {
│
│       @Test
│       public void testRedefinitionShadowing() throws Exception {
│               SysMLInteractive instance = createSysMLInteractiveInstance();
│               
│               SysMLInteractiveResult result1 = instance.process("y = 1;");
│               System.out.println(result1);
│               String id1 = result1.getRootElement().getOwnedElement().get(0).getElementId();
│               
⋮
│       @Test
│       public void testRedefinitionShadowingMultidigitFiles() throws Exception {
⋮
│       @Test
│       public void testNoShadowingCaseSensitive() throws Exception {
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/ModelLevelEvaluationTest.java:
⋮
│public class ModelLevelEvaluationTest extends SysMLInteractiveTest {
│       
│       protected Expression checkFilterExpression(SysMLInteractive instance, String text) {
│               List<Element> members = process(instance, "package test { filter (" + text + ") == null; }");
│               assertFalse("'" + text +"': No members", members.isEmpty());
│               Element member = members.get(0);
│               assertTrue("'" + text + "': No package", member instanceof org.omg.sysml.lang.sysml.Package);
│               List<Expression> filterConditions = ((org.omg.sysml.lang.sysml.Package)member).getFilterCondition
│               assertFalse("'" + text + "': No filter conditions", filterConditions.isEmpty());
│               Expression filterCondition = filterConditions.get(0);
│               assertTrue("'" + text + "': Not operator expression", filterCondition instanceof OperatorExpressi
│               List<Expression> operands = ((OperatorExpression)filterCondition).getArgument();
⋮
│       protected Expression checkExpression(SysMLInteractive instance, String text) {
│               List<Element> members = process(instance, "calc test { " + text + " }");
│               assertFalse("'" + text +"': No Members", members.isEmpty());
│               Element member = members.get(0);
│               assertTrue("'" + text + "': Not an expression", member instanceof Expression);
│               Expression resultExpression = 
│                               (Expression)TypeUtil.getOwnedFeatureByMembershipIn((Expression)member, ResultExpressionMembersh
│               assertNotNull("'" + text + "': No result expression", resultExpression);
│               return resultExpression;
⋮
│       protected Expression checkExpressionIsModelLevelEvaluable(SysMLInteractive instance, String text) 
│               Expression expression = checkFilterExpression(instance, text);
│               assertTrue("'" + text + "' is not model-level evaluable", expression.isModelLevelEvaluable());
│               return expression;
⋮
│       protected Expression checkExpressionNotModelLevelEvaluable(SysMLInteractive instance, String text)
│               Expression expression = checkExpression(instance, text);
│               assertFalse("'" + text + "' is model-level evaluable", expression.isModelLevelEvaluable());
│               return expression;
⋮
│       protected List<Element> evaluateExpression(SysMLInteractive instance, Element target, String text)
│               Expression expression = checkExpressionIsModelLevelEvaluable(instance, text);
│               return expression.evaluate(target);
⋮
│       protected Element evaluateSingleValue(SysMLInteractive instance, Element target, String text) {
│               List<Element> results = evaluateExpression(instance, target, text);
│               assertNotNull(results);
│               assertTrue(results.size() <= 1);
│               return results.isEmpty()? null: results.get(0);
⋮
│       protected boolean evaluateBooleanValue(SysMLInteractive instance, Element target, String text) {
│               Element result = evaluateSingleValue(instance, target, text);
│               assertTrue(result instanceof LiteralBoolean);
│               return ((LiteralBoolean)result).isValue();
⋮
│       protected String evaluateStringValue(SysMLInteractive instance, Element target, String text) {
│               Element result = evaluateSingleValue(instance, target, text);
│               assertTrue(result instanceof LiteralString);
│               return ((LiteralString)result).getValue();
⋮
│       protected int evaluateIntegerValue(SysMLInteractive instance, Element target, String text) {
│               Element result = evaluateSingleValue(instance, target, text);
│               assertTrue(result instanceof LiteralInteger);
│               return ((LiteralInteger)result).getValue();
⋮
│       protected double evaluateRealValue(SysMLInteractive instance, Element target, String text) {
│               Element result = evaluateSingleValue(instance, target, text);
│               assertTrue(result instanceof LiteralRational);
│               return ((LiteralRational)result).getValue();
⋮
│       protected Object[] evaluateListValue(SysMLInteractive instance, Element target, String text) {
│               List<Element> results = evaluateExpression(instance, target, text);
│               return results.stream().map(EvaluationUtil::valueOf).toArray();
⋮
│       protected MetadataFeature checkAnnotatingFeature(SysMLInteractive instance, String annotationName,
│               Element target = instance.resolve(elementName);
│               assertTrue(target instanceof Namespace);
│               assertTrue(!((Namespace)target).getOwnedMembership().isEmpty());
│               
│               Element metadataFeature = ((Namespace)target).getOwnedMembership().get(0).getMemberElement();
│               assertTrue(metadataFeature instanceof MetadataFeature);         
│               assertTrue(annotationName.equals(((MetadataFeature)metadataFeature).getMetaclass().getDeclaredNam
│               
│               return (MetadataFeature)metadataFeature;
⋮
│       protected Feature checkMetaclassFeature(SysMLInteractive instance, String elementName) {
│               Element target = instance.resolve(elementName);
│               assertNotNull(target);
│               
│               Feature metaclassFeature = ElementUtil.getMetaclassFeatureFor(target);
│               assertNotNull(metaclassFeature);
│               
│               return metaclassFeature;
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/NestedResolutionTest.java:
⋮
│public class NestedResolutionTest {
│
│       protected static SysMLInteractive interactive;
│
│       /** Loads and resolves the standard library once for the textual test scenarios. */
│       @BeforeClass
│       public static void loadLibraries() {
│               interactive = SysMLInteractive.createInstance();
│               interactive.setVerbose(false);
│               interactive.loadLibrary(Path.of(System.getProperty("libraryPath")).toAbsolutePath().toString());
⋮
│       @After
│       public void removeResource() {
⋮
│       @Test
│       public void metadataValueThroughDependentImport() throws Exception {
⋮
│       @Test
│       public void redefinitionThroughSemanticMetadata() throws Exception {
⋮
│       private Resource parse(String name, String text) throws Exception {
│               interactive.setResource(name);
│               interactive.parse(text);
│               return interactive.getResource();
⋮
│       private void assertNoIssues() {
│               List<Issue> issues = interactive.validate();
│               assertTrue(issues.toString(), issues.isEmpty());
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/ParserPostProcessorTest.java:
⋮
│public class ParserPostProcessorTest extends SysMLInteractiveTest {
│
│       @Test
│       public void factorySelectsTheMostSpecificParserPostProcessorWithoutAttachingIt() {
│               PortUsage port = SysMLFactory.eINSTANCE.createPortUsage();
│               int adapterCount = port.eAdapters().size();
│               ElementParserPostProcessor portPostProcessor = SysMLParserPostProcessorFactory.getPostProcessor(p
│               assertTrue(portPostProcessor instanceof PortUsageParserPostProcessor);
│               assertNotSame(portPostProcessor, SysMLParserPostProcessorFactory.getPostProcessor(port));
│               assertEquals(adapterCount, port.eAdapters().size());
│
⋮
│       @Test
│       public void parserPostProcessorHierarchyPreservesSpecialCaseBehavior() {
⋮
│       protected static void postProcess(Element... elements) {
│               for (Element element : elements) {
│                       int adapterCount = element.eAdapters().size();
│                       SysMLParserPostProcessorFactory.getPostProcessor(element).postProcess();
│                       assertEquals(adapterCount, element.eAdapters().size());
│               }
⋮
│       protected static PartUsage createPartUsage() {
│               return SysMLFactory.eINSTANCE.createPartUsage();
⋮
│       protected static PartUsage createPartUsageOwnedByFeatureMembership() {
│               PartUsage owner = createPartUsage();
│               PartUsage usage = createPartUsage();
│               usage.setIsComposite(true);
│               TypeUtil.addOwnedFeatureTo(owner, usage);
│               return usage;
⋮
│       @Test
│       public void postProcessPreservesCompositeUsageOwnedByFeatureMembership() {
⋮
│       @Test
│       public void postProcessMakesDirectedUsageNonComposite() {
⋮
│       @Test
│       public void postProcessMakesEndUsageNonComposite() {
⋮
│       @Test
│       public void postProcessMakesUsageOutsideFeatureMembershipNonComposite() {
⋮
│    @Test
│    public void standardFactoryUsesTheEcoreCompositeDefault() {
⋮
│    @Test
│    public void parserAdapterRestoresImplicitConstructorDefaults() {
⋮
│    @Test
│    public void postProcessMakesContextuallyReferentialUsagesNonComposite() {
⋮
│    @Test
│    public void portUsageIsCompositeOnlyInAPortContext() {
⋮
│    private static List<EClass> nonCompositeUsageTypes() {
│        return List.of(
│                SysMLPackage.Literals.ATTRIBUTE_USAGE,
│                SysMLPackage.Literals.BINDING_CONNECTOR_AS_USAGE,
│                SysMLPackage.Literals.EVENT_OCCURRENCE_USAGE,
│                SysMLPackage.Literals.EXHIBIT_STATE_USAGE,
│                SysMLPackage.Literals.INCLUDE_USE_CASE_USAGE,
│                SysMLPackage.Literals.PERFORM_ACTION_USAGE,
│                SysMLPackage.Literals.REFERENCE_USAGE,
│                SysMLPackage.Literals.SUCCESSION_AS_USAGE);
⋮
│    private static Usage createUsageOwnedByFeatureMembership(EClass eClass) {
│        Usage usage = (Usage)SysMLFactory.eINSTANCE.create(eClass);
│        FeatureMembership membership = SysMLFactory.eINSTANCE.createFeatureMembership();
│        membership.setOwnedMemberFeature(usage);
│        PartDefinition owner = SysMLFactory.eINSTANCE.createPartDefinition();
│        owner.getOwnedRelationship().add(membership);
│        return usage;
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/SysMLInteractiveTest.java:
⋮
│public abstract class SysMLInteractiveTest {
│
│       private final static String SYSML_LIBRARY_PATH_KEY = "libraryPath";
│       
│       /** Loads and resolves the standard library once for the textual test scenarios. */
│       @BeforeClass
│       public static void loadLibraries() {
│               createSysMLInteractiveInstance();
│       }
│       
│       /** Removes each test model while retaining the shared resolved libraries. */
│       @After
│       public void removeResource() {
⋮
│       public static String getLibraryPath() {
│               return System.getProperty(SYSML_LIBRARY_PATH_KEY);
⋮
│       public static SysMLInteractive createSysMLInteractiveInstance() {
│               SysMLInteractive instance = SysMLInteractive.createInstance();
│               instance.setVerbose(false);
│               instance.loadLibrary(Path.of(getLibraryPath()).toAbsolutePath().toString());
│               return instance;
⋮
│       public static SysMLInteractive getSysMLInteractiveInstance() {
│               SysMLInteractive instance = SysMLInteractive.getInstance();
│               instance.setVerbose(false);
│               instance.loadLibrary(getLibraryPath());
│               return instance;
⋮
│       public List<Element> process(SysMLInteractive instance, String input) {
│               if (instance == null) {
│                       instance = getSysMLInteractiveInstance();
│               }
│               SysMLInteractiveResult result = instance.process(input);
│               assertTrue("'" + input + "':\n" + result.formatIssues(), result.getIssues().isEmpty());
│               Element root = result.getRootElement();
│               assertTrue(root instanceof Namespace);
│               return ((Namespace)root).getOwnedMember();
⋮
│       public List<Element> process(String input) {
│               return process(null, input);
⋮
│       protected Resource parse(String name, String text) throws Exception {
│               SysMLInteractive interactive = SysMLInteractive.getInstance();
│               interactive.setResource(name);
│               interactive.parse(text);
│               Element rootElement = interactive.getRootElement();
│               SysMLInteractiveResult result = new SysMLInteractiveResult(rootElement, Collections.emptyList());
│               assertTrue("'" + text + "':\n" + result.formatIssues(), result.getIssues().isEmpty());
│               return interactive.getResource();
⋮
│       protected static <T extends Type> T findByName(Resource resource, String name, Class<T> kind) {
│               for (var contents = resource.getAllContents(); contents.hasNext();) {
│                       EObject object = contents.next();
│                       if (kind.isInstance(object) && name.equals(kind.cast(object).getDeclaredName())) {
│                               return kind.cast(object);
│                       }
│               }
│               throw new AssertionError("Missing " + name);
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/UsageParsingTest.java:
⋮
│public class UsageParsingTest {
│
│       private static Injector injector;
│
│       @BeforeClass
│       public static void setUp() {
│               KerMLXtextTests.setup();
│               injector = new SysMLStandaloneSetup().createInjectorAndDoEMFRegistration();
│               SysMLPackage.eINSTANCE.eClass();
│       }
│
│       @Test
│       public void parserUsesSyntaxNodesToApplyCompositeDefaults() throws IOException {
⋮
│       @Test
│       public void compositeValuesSurviveXmiRoundTrips() throws IOException {
⋮
│       private static XtextResource parse(String text) throws IOException {
│               XtextResourceSet resourceSet = injector.getInstance(XtextResourceSet.class);
│               XtextResource resource = (XtextResource)resourceSet.createResource(URI.createURI("memory:/usage.s
│               resource.load(new ByteArrayInputStream(text.getBytes(StandardCharsets.UTF_8)), Map.of());
│               EcoreUtil.resolveAll(resource);
│               assertTrue(resource.getErrors().toString(), resource.getErrors().isEmpty());
│               return resource;
⋮
│       private static Usage findUsage(Resource resource, String name) {
│               TreeIterator<EObject> iterator = resource.getAllContents();
│               while (iterator.hasNext()) {
│                       EObject object = iterator.next();
│                       if (object instanceof Usage usage && name.equals(usage.getDeclaredName())) {
│                               return usage;
│                       }
│               }
│               fail("Usage not found: " + name);
│               return null;
⋮
│       private static void assertXmiRoundTrip(boolean isComposite) throws IOException {
│               Usage usage = SysMLFactory.eINSTANCE.createUsage();
│               usage.setIsComposite(isComposite);
│               Usage loaded = xmiRoundTrip(usage);
│               if (isComposite) {
│                       assertTrue(loaded.isComposite());
│                       assertFalse(loaded.isReference());
│               } else {
│                       assertFalse(loaded.isComposite());
│                       assertTrue(loaded.isReference());
⋮
│       private static Usage xmiRoundTrip(Usage usage) throws IOException {
│               URI uri = URI.createURI("memory:/usage.xmi");
│               Resource savedResource = new XMIResourceImpl(uri);
│               savedResource.getContents().add(usage);
│               ByteArrayOutputStream output = new ByteArrayOutputStream();
│               savedResource.save(output, Map.of());
│
│               Resource loadedResource = new XMIResourceImpl(uri);
│               loadedResource.load(new ByteArrayInputStream(output.toByteArray()), Map.of());
│               return (Usage)loadedResource.getContents().get(0);
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/UsagePostProcessTest.java:
⋮
│public class UsagePostProcessTest extends SysMLInteractiveTest{
│       
│       public static final String TEST =
│                         " package Test {\n"
│                       + "          part p {\n"
│                       + "              attribute a;\n"
│                       + "                  part x;\n"
│                       + "                  in part y;\n"
│                       + "                      variation occurrence z {\n"
│                       + "                  variant variation part u {\n"
⋮
│       @Test
│       public void testSettingCompositeToFalse() throws InvocationTargetException {
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/interactive/tests/VirtualContainerTest.java:
⋮
│public class VirtualContainerTest {
│
│       private static ResourceSet resourceSet;
│       private final List<Resource> models = new ArrayList<>();
│
│       /** Loads and resolves libraries once. */
│       @BeforeClass
│       public static void loadLibraries() {
│               SysMLInteractive interactive = SysMLInteractive.createInstance();
│               interactive.setVerbose(false);
⋮
│       @After
│       public void removeModels() {
⋮
│       @Test
│       public void featureChainExpressionResultChainIsLinkedToTheResult() throws Exception {
⋮
│       @Test
│       public void boundValueChainIsLinkedToTheValuedFeature() throws Exception {
⋮
│       @Test
│       public void decisionAndMergeChainsAreLinkedToTheSuccession() throws Exception {
⋮
│       @Test
│       public void transitionPayloadChainIsLinkedToThePayloadParameter() throws Exception {
⋮
│       @Test
│       public void valueBindingConnectorKeepsItsVirtualContainerOnceContained() throws Exception {
⋮
│       @Test
│       public void detachedChainResolvesLibraryTypesFromItsModel() throws Exception {
⋮
│       @Test
│       public void detachedBindingConnectorResolvesLibraryTypesFromItsModel() throws Exception {
⋮
│       @Test
│       public void resourceRootStaysInItsResourceAfterTransformation() throws Exception {
⋮
│       @Test
│       public void snapshotsFeaturingTypeIsLinkedToTheVariableFeature() throws Exception {
⋮
│       @Test
│       public void initialValueFeaturingChainIsLinkedToTheBindingConnector() throws Exception {
⋮
│       @Test
│       public void unresolvedProxyHasNoVirtualContainer() throws Exception {
⋮
│       @Test
│       public void rootIsNotLinkedToOneOfItsMembers() {
⋮
│       @Test
│       public void parsedElementHasNoVirtualContainer() throws Exception {
⋮
│       private Resource parse(String name, String text) throws Exception {
│               Resource resource = resourceSet.createResource(URI.createURI("memory:/" + name));
│               models.add(resource);
│               resource.load(new ByteArrayInputStream(text.getBytes(StandardCharsets.UTF_8)), Map.of());
│               assertTrue(resource.getErrors().toString(), resource.getErrors().isEmpty());
│               return resource;
⋮
│       private static <T extends Element> T findByName(Resource resource, String name, Class<T> kind) {
│               for (var contents = resource.getAllContents(); contents.hasNext();) {
│                       EObject object = contents.next();
│                       if (kind.isInstance(object) && name.equals(((Element)object).getDeclaredName())) {
│                               return kind.cast(object);
│                       }
│               }
│               throw new AssertionError("Missing " + kind.getSimpleName() + " " + name);
⋮
│       private static Feature findDetachedChain(List<Type> generals) {
│               for (Type general : generals) {
│                       if (general instanceof Feature feature && !feature.getOwnedFeatureChaining().isEmpty()
│                                       && feature.eContainer() == null) {
│                               return feature;
│                       }
│               }
│               throw new AssertionError("Missing detached feature chain among " + generals);
⋮
│       private static SuccessionAsUsage findSuccession(Resource resource, String nodeName, boolean fromNo
│               for (var contents = resource.getAllContents(); contents.hasNext();) {
│                       if (contents.next() instanceof SuccessionAsUsage succession) {
│                               Feature end;
│                               if (fromNode) {
│                                       end = UsageUtil.getSourceOf(succession);
│                               } else {
│                                       end = UsageUtil.getTargetOf(succession);
│                               }
│                               if (end != null && nodeName.equals(end.getDeclaredName())) {
⋮
│       private static BindingConnector findBindingConnectorLinkedTo(Feature feature) {
│               for (var contents = feature.eAllContents(); contents.hasNext();) {
│                       if (contents.next() instanceof BindingConnector connector
│                                       && VirtualContainer.getVirtualContainer(connector) == feature) {
│                               return connector;
│                       }
│               }
│               throw new AssertionError("Missing binding connector linked to " + feature.getDeclaredName());
⋮
│       private static BindingConnector findImplicitBindingConnectorOf(Feature feature) {
│               List<BindingConnector> connectors = new ArrayList<>();
│               TypeUtil.forEachImplicitBindingConnectorOf(feature, (connector, membershipKind) -> connectors.add
│               if (connectors.isEmpty()) {
│                       throw new AssertionError("Missing implicit binding connector of " + feature.getDeclaredName());
│               }
│               return connectors.get(0);
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/semantics/tests/SysMLBinaryRelationTest.java:
⋮
│public class SysMLBinaryRelationTest extends SysMLSemanticTest {
│       
│       @Test
│       public void checkConnectionDefinitionBinarySpecialization() {
│               var resource = getResource();
│               var connectionDefinition = SysMLFactory.eINSTANCE.createConnectionDefinition();
│               
│               resource.getContents().add(connectionDefinition);
│               
│               addEndTo(connectionDefinition);
⋮
│       @Test
│       public void checkInterfaceUsageBinarySpecialization() {
⋮
│       @Test
│       public void checkSuccessionFlowUsageSpecialization() {
⋮
│       public static void addEndTo(Type type) {
│               var end = SysMLFactory.eINSTANCE.createFeature();
│               end.setIsEnd(true);
│               var endMembership = SysMLFactory.eINSTANCE.createFeatureMembership();
│               endMembership.setOwnedMemberFeature(end);
│               type.getOwnedRelationship().add(endMembership);
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/semantics/tests/SysMLImpliedRelationsTest.java:
⋮
│public class SysMLImpliedRelationsTest extends SysMLSemanticTest {
│               
│       @Test
│       public void checkActionUsageStateActionRedefinition_entry() {
│               var stateUsage = SysMLFactory.eINSTANCE.createStateUsage();
│               
│               var stateSubActionMembership = SysMLFactory.eINSTANCE.createStateSubactionMembership();
│               stateSubActionMembership.setKind(StateSubactionKind.ENTRY);
│               stateUsage.getOwnedRelationship().add(stateSubActionMembership);
│               
⋮
│       @Test
│       public void checkActionUsageStateActionRedefinition_do() {
⋮
│       @Test
│       public void checkActionUsageStateActionRedefinition_exit() {
⋮
│       @Test
│       public void checkAssignmentActionUsageAccessedFeatureRedefinition() {
⋮
│       @Test
│       public void checkAssignmentActionUsageReferentRedefinition() {
⋮
│       @Test
│       public void checkAssignmentActionUsageStartingAtRedefinition() {
⋮
│       @Test
│       @Ignore("TBD")
│       public void checkRequirementUsageObjectiveSpecialization() {
⋮
│       @Test
│       public void checkRenderingUsageRedefinition() {
⋮
│       @Test
│       @Ignore("TBD")
│       public void checkOccurrenceUsageTypeFeaturing() {
⋮
│       @Test
│       @Ignore("TBD")
│       public void checkAcceptActionUsageReceiverBindingConnector() {
⋮
│       @Test
│       @Ignore("TBD")
│       public void checkTransitionUsageSourceBindingConnector() {
⋮
│       @Test
│       @Ignore("TBD")
│       public void checkTransitionUsageSuccessionBindingConnector() {
⋮
│       @Test
│       @Ignore("TBD")
│       public void checkSatisfyRequirementUsageBindingConnector() {
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/semantics/tests/SysMLSemanticTest.java:
⋮
│public abstract class SysMLSemanticTest {
│       /**
│        * System property for the library path. Required for Maven build.
│        */
│       private final static String SYSML_LIBRARY_PATH_KEY = "libraryPath";
│
│       /**
│        * Library path relative to this eclipse project. Direct JUnit runs.
│        */
│       private static final String PROJECT_RELATIVE_LIBRARY_PATH = "../sysml.library";
│
│       public static String getLibraryPath() {
│               var sysprop = System.getProperty(SYSML_LIBRARY_PATH_KEY);
│               return sysprop == null ? getAbsoluteLibraryPath() : sysprop;
⋮
│       private static String getAbsoluteLibraryPath() {
│               // convert relative path to absolute path
│               return new File(PROJECT_RELATIVE_LIBRARY_PATH).getAbsolutePath();
⋮
│       @BeforeClass
│       public static void setupLibrary() {
⋮
│       @Before
│       public void createResource() {
⋮
│       @After
│       public void removeResource() throws IOException {
⋮
│       protected final Resource getResource() {
│               return resource;
⋮
│       public static boolean specializes(Type element, String general) {
│               assert element != null;
│               assert general != null;
│
│               return element.getOwnedSpecialization().stream().map(Specialization::getGeneral).map(Type::getQua
│                               .anyMatch(general::equals);
⋮
│       public static boolean specializes(Type element, Type general) {
│               assert element != null;
│               assert general != null;
│
│               return element.getOwnedSpecialization().stream().map(Specialization::getGeneral)
│                               .anyMatch(general::equals);
⋮
│       public static boolean redefines(Feature element, String redefined) {
│               assert element != null;
│               assert redefined != null;
│
│               return element.getOwnedRedefinition().stream().map(Redefinition::getRedefinedFeature).map(Feature
│                               .anyMatch(redefined::equals);
⋮
│       public static boolean redefines(Feature element, Feature redefined) {
│               assert element != null;
│               assert redefined != null;
│
│               return element.getOwnedRedefinition().stream().map(Redefinition::getRedefinedFeature)
│                               .anyMatch(redefined::equals);
⋮
│       public static String getSpecifics(Type element) {
│
│               assert element != null;
│
│               return element.getOwnedSpecialization().stream().map(Specialization::getGeneral).map(Type::getQua
│                               .collect(Collectors.joining(", "));
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/semantics/tests/SysMLSpecializationSpecialTest.jav
⋮
│public class SysMLSpecializationSpecialTest extends SysMLSemanticTest {
│       
│       protected void checkTransitionUsageStateSpecialization(String owningTypeName) {
│               //create and add root package
│               org.omg.sysml.lang.sysml.Package root = SysMLFactory.eINSTANCE.createPackage();
│               getResource().getContents().add(root);
│               
│               //check if library element exists
│               Element libraryElement = SysMLLibraryUtil.getLibraryElement(root, "States::StateAction::stateTran
│               assertTrue(libraryElement instanceof Type);
│
│               //create owning type
⋮

org.omg.sysml.interactive.tests/src/org/omg/sysml/semantics/tests/SysMLSpecializationTest.java:
⋮
│@RunWith(Parameterized.class)
│public class SysMLSpecializationTest extends SysMLSemanticTest {
⋮
│       @Parameters(name = "Semantic constraint: {1}, Owner: {4}, EClass: {2}, Expected library type: {3}"
│       public static Collection<Object[]> getParameters() throws IOException{
⋮
│       @Test
│       public void checkSpecialization() {
⋮
```
