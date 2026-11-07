# Repo map: backend/application/syson-sysml-validation

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/application/syson-sysml-validation`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/application/syson-sysml-validation) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 26 files there; aider read the 26 that `syson.aiderignore` leaves in, and the map shows 26 of them, 12 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/application/syson-sysml-validation/.checkstyle

backend/application/syson-sysml-validation/.classpath

backend/application/syson-sysml-validation/.project

backend/application/syson-sysml-validation/.settings/org.eclipse.core.resources.prefs

backend/application/syson-sysml-validation/.settings/org.eclipse.core.runtime.prefs

backend/application/syson-sysml-validation/.settings/org.eclipse.jdt.apt.core.prefs

backend/application/syson-sysml-validation/.settings/org.eclipse.jdt.core.prefs

backend/application/syson-sysml-validation/.settings/org.eclipse.jdt.ui.prefs

backend/application/syson-sysml-validation/.settings/org.eclipse.m2e.core.prefs

backend/application/syson-sysml-validation/.settings/org.springframework.ide.eclipse.boot.prefs

backend/application/syson-sysml-validation/.settings/org.springframework.ide.eclipse.prefs

backend/application/syson-sysml-validation/pom.xml

backend/application/syson-sysml-validation/src/main/java/org/eclipse/syson/sysml/validation/SysMLVal
⋮
│@Configuration
│public class SysMLValidatorRegistrationConfiguration {
│
⋮
│    @PostConstruct
│    public void registerDomainValidator() {
⋮

backend/application/syson-sysml-validation/src/main/java/org/eclipse/syson/sysml/validation/SysONDia
⋮
│public class SysONDiagnosticComparator implements Comparator<Diagnostic> {
│
│    @Override
│    public int compare(final Diagnostic left, final Diagnostic right) {
│        final int result;
│
│        final Object leftSource = left.getSource();
│        final Object rightSource = right.getSource();
│
│        // In SysMLValidator, the source is a non-null String that is the name of the rule.
⋮
│    private int compareDiagnosticsByTheirData(final Diagnostic left, final Diagnostic right) {
│        final int result;
│        final List<?> leftData = left.getData();
│        final List<?> rightData = right.getData();
│        if (leftData.isEmpty()) {
│            if (rightData.isEmpty()) {
│                // Both diagnostics are missing the expected data.
│                // Fallback to sorting message lexicographically.
│                result = left.getMessage().compareTo(right.getMessage());
│            } else {
⋮
│    protected int compareEObjectsOfSameResource(final EObject leftEObject, final EObject rightEObje
│        final int result;
│
│        if (!(leftEObject instanceof Element)) {
│            if (!(rightEObject instanceof Element)) {
│                // Fallback to the EObject ID.
│                result = EcoreUtil.getID(leftEObject).compareTo(EcoreUtil.getID(rightEObject));
│            } else {
│                // The 'left' is not from SysML while the 'right' is.
│                // We want non-SysML elements to appear last in the natural order.
⋮

backend/application/syson-sysml-validation/src/main/java/org/eclipse/syson/sysml/validation/SysONSys
⋮
│@Service
│public class SysONSysMLValidationService implements IValidationService {
│
⋮
│    @Override
│    public List<Object> validate(Object object, Object feature) {
⋮
│    @Override
│    public List<Object> validate(IEditingContext editingContext) {
⋮
│    protected List<Object> validate(IEMFEditingContext emfEditingContext) {
│        final Instant start = Instant.now();
│
│        final List<Object> validationResults = this.doValidation(emfEditingContext);
│
│        final Instant finish = Instant.now();
│        final long duration = Duration.between(start, finish).toMillis();
│        if (duration > 200) {
│            this.logger.debug("Validating EditingContext '%s' took %dms".formatted(emfEditingContex
│        }
│
⋮
│    protected List<Object> doValidation(IEMFEditingContext emfEditingContext) {
│        final List<EObject> objectsToValidate = this.getElementsToRunValidationOn(emfEditingContext
│        final Diagnostician diagnostician = this.createDiagnostician();
│        final Map<Object, Object> diagnosticianOptions = this.getDiagnosticianOptions();
│
│        final List<Diagnostic> diagnostics = objectsToValidate.stream()
│                .map(eObject -> diagnostician.validate(eObject, diagnosticianOptions))
│                .toList();
│
│        final List<Object> validationResults = this.getValidationResultsFrom(diagnostics);
⋮
│    protected List<EObject> getElementsToRunValidationOn(final IEMFEditingContext emfEditingContext
│        final List<Resource> resourcesToValidate = emfEditingContext.getDomain().getResourceSet().g
│                .filter(resource ->
│                // Do not validate the standard libraries.
│                !ElementUtil.isStandardLibraryResource(resource)
│                        // Do not validate the referenced libraries: it is the responsibility of th
│                        && !this.sysONResourceService.isFromReferencedLibrary(emfEditingContext, re
│                .toList();
│        return resourcesToValidate.stream()
│                .map(Resource::getContents)
⋮
│    protected Diagnostician createDiagnostician() {
│        return new Diagnostician(this.eValidatorRegistry);
⋮
│    protected Map<Object, Object> getDiagnosticianOptions() {
│        return Map.ofEntries(
│                Map.entry(Diagnostician.VALIDATE_RECURSIVELY, true));
⋮
│    protected List<Object> getValidationResultsFrom(final List<Diagnostic> diagnostics) {
│        return diagnostics.stream()
│                .map(Diagnostic::getChildren)
│                .flatMap(Collection::stream)
│                // We sort the validation results based on the containing document and the qualifie
│                // validated element.
│                .sorted(new SysONDiagnosticComparator())
│                .map(Object.class::cast)
│                .toList();
⋮

backend/application/syson-sysml-validation/src/main/java/org/eclipse/syson/sysml/validation/SysONSys
⋮
│public class SysONSysMLValidator implements EValidator {
│
│    private final IValidationRulesProvider validationRulesProvider;
│
│    private final AQLInterpreter aqlInterpreter;
│
│    private final UtilService utilService;
│
│    public SysONSysMLValidator(final IValidationRulesProvider validationRulesProvider) {
│        this.validationRulesProvider = Objects.requireNonNull(validationRulesProvider);
⋮
│    @Override
│    public boolean validate(EObject eObject, DiagnosticChain diagnostics, Map<Object, Object> conte
⋮
│    @Override
│    public boolean validate(EDataType eDataType, Object value, DiagnosticChain diagnostics, Map<Obj
⋮
│    @Override
│    public boolean validate(EClass eClass, EObject eObject, DiagnosticChain diagnostics, Map<Object
⋮
│    private boolean checkAllConstraints(Element element, EClass eClass, DiagnosticChain diagnostics
│        boolean isValid = true;
│
│        for (final IValidationRule validationRule : this.validationRulesProvider.getValidationRules
│            boolean validConstraint = this.executeConstraint(element, validationRule.expression());
│            if (!validConstraint) {
│                this.addDiagnostic(diagnostics, element, validationRule);
│                isValid = false;
│            }
│        }
│
⋮
│    private boolean executeConstraint(Element element, String aqlExpression) {
│        final Map<String, Object> variables = Map.ofEntries(Map.entry(RepresentationVariables.SELF.
│        return this.aqlInterpreter.evaluateExpression(variables, aqlExpression).asBoolean().orElse(
⋮
│    private void addDiagnostic(DiagnosticChain diagnostics, Element element, IValidationRule valida
│        // For now the Validation view in SysON is rather limited so our diagnostic message needs t
│        // information as possible.
│
│        // Since validation usually runs on the whole editing context, we need to make clear which 
│        // concerned.
│        final String elementDocumentLabel = element.eResource().eAdapters().stream()
│                .filter(ResourceMetadataAdapter.class::isInstance)
│                .map(ResourceMetadataAdapter.class::cast)
│                .findFirst()
⋮

backend/application/syson-sysml-validation/src/main/java/org/eclipse/syson/sysml/validation/rules/Sy
⋮
│public enum SysMLValidationRule implements IValidationRule {
│    checkAcceptActionUsageReceiverBindingConnector(
│            SysmlPackage.eINSTANCE.getAcceptActionUsage(),
│            "checkAcceptActionUsageReceiverBindingConnector",
│            "aql:self.payloadArgument <> null and self.payloadArgument.oclIsKindOf(sysml::TriggerIn
│            "If the payloadArgument of an AcceptActionUsage is a TriggerInvocationExpression, then 
│    checkAcceptActionUsageSpecialization(
│            SysmlPackage.eINSTANCE.getAcceptActionUsage(),
│            "checkAcceptActionUsageSpecialization",
│            "aql:not self.isTriggerAction() implies self.specializesFromLibrary('Actions::acceptAct
⋮
│            "A WhileLoopActionUsage must have at least two owned input parameters.");
│
⋮
│    @Override
│    public EClass eClass() {
⋮
│    @Override
│    public String ruleName() {
⋮
│    @Override
│    public String expression() {
⋮
│    @Override
│    public String message() {
⋮
│    @Override
│    public int severity() {
⋮

backend/application/syson-sysml-validation/src/main/java/org/eclipse/syson/sysml/validation/rules/Sy
⋮
│public class SysMLValidationRuleQueryServices {
│
│    /**
│     * Service allowing to replace the interval '..' operator of OCL, which does not exist in AQL.
│     *
│     * @param self
│     *            an {@link Element} on which the service will be called.
│     * @param lowerBound
│     *            the lower bound of the interval.
│     * @param upperBound
⋮
│    public List<Integer> interval(Element self, Integer lowerBound, Integer upperBound) {
│        List<Integer> interval = new ArrayList<>();
│        if (upperBound >= lowerBound) {
│            for (int i = lowerBound; i <= upperBound; i++) {
│                interval.add(i);
│            }
│        }
│        return interval;
⋮

backend/application/syson-sysml-validation/src/main/java/org/eclipse/syson/sysml/validation/rules/Sy
⋮
│@Service
│public class SysONValidationRulesProvider implements IValidationRulesProvider {
│
⋮
│    @Override
│    public List<? extends IValidationRule> getValidationRules(final EClass eClass) {
⋮
│    @Override
│    public List<Class<?>> getAQLServiceClasses() {
⋮
│    @Override
│    public List<Object> getAQLServiceInstances() {
⋮
│    @Override
│    public List<EPackage> getEPackages() {
⋮

backend/application/syson-sysml-validation/src/main/java/org/eclipse/syson/sysml/validation/rules/Va

backend/application/syson-sysml-validation/src/main/java/org/eclipse/syson/sysml/validation/rules/ap
⋮
│public interface IValidationRule {
│
│    /**
│     * Provides the type on which this rule applies. Depending on the {@link IValidationRulesProvid
│     * use, this rule will most likely also apply on sub-types of the provided type.
│     *
│     * @return a (non-{@code null}) {@link EClass}, most likely from {@link SysmlPackage}, or sub-t
│     *         types.
│     */
│    EClass eClass();
│
⋮
│    String ruleName();
│
⋮
│    String expression();
│
⋮
│    String message();
│
⋮
│    int severity();
⋮

backend/application/syson-sysml-validation/src/main/java/org/eclipse/syson/sysml/validation/rules/ap
⋮
│public interface IValidationRulesProvider {
│
│    /**
│     * Provides the validation rules to apply on a type of model element.
│     * <p>
│     * Note: For a given type, the list of rules may change arbitrarily between different calls (e.
│     * applications to provide a UI to select the validation rules to apply).
│     * </p>
│     * <p>
│     * Note: the default consumer of this method is {@link SysONSysMLValidator} that expects rules 
⋮
│    List<? extends IValidationRule> getValidationRules(EClass eClass);
│
⋮
│    List<Class<?>> getAQLServiceClasses();
│
⋮
│    List<Object> getAQLServiceInstances();
│
⋮
│    List<EPackage> getEPackages();
│
⋮

backend/application/syson-sysml-validation/src/main/resources/.gitkeep

backend/application/syson-sysml-validation/src/test/java/org/eclipse/syson/sysml/validation/Architec
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_SYSML_VALIDATION_ROOT_PACKAGE = "org.eclipse.syson.sysml.valid
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_SYSML_VALIDATION_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/application/syson-sysml-validation/src/test/java/org/eclipse/syson/sysml/validation/CodingRu
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_SYSML_VALIDATION_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮
│    @Test
│    @Override
│    public void noMethodsShouldBeStatic() {
⋮

backend/application/syson-sysml-validation/src/test/java/org/eclipse/syson/sysml/validation/rules/Sy
⋮
│public class SysMLValidationRuleUnitTests {
│
│    private static List<SysMLValidationRule> allRules = Stream.of(SysMLValidationRule.values()).toL
│
│    @Test
│    @DisplayName("Check number of implemented rules")
│    public void testNumberOfImplementedRules() {
│        assertThat(allRules).hasSize(383);
│    }
│
│    @Test
│    @DisplayName("For each rule, the Java literal is the rule name from the specification")
│    public void testRuleLiteralIsSameAsRuleName() {
⋮
│    @Test
│    @DisplayName("For each rule, the expression starts with 'aql:'")
│    public void testRuleExpressionStartsWithAql() {
⋮
│    @Test
│    @DisplayName("For each rule, the AQL expression can be parsed")
│    public void testRuleExpressionsCanBeParsed() {
⋮
│    @ParameterizedTest
│    @MethodSource("classSpecializationCases")
│    @DisplayName("Classes cannot specialize DataTypes and only Associations can specialize Associat
│    public void testClassSpecialization(EClass classType, EClass generalType, boolean expected) {
⋮
│    private static Stream<Arguments> classSpecializationCases() {
│        var sysmlPackage = SysmlPackage.eINSTANCE;
│        return Stream.of(
│                Arguments.of(sysmlPackage.getClass_(), null, true),
│                Arguments.of(sysmlPackage.getClass_(), sysmlPackage.getClass_(), true),
│                Arguments.of(sysmlPackage.getClass_(), sysmlPackage.getDataType(), false),
│                Arguments.of(sysmlPackage.getClass_(), sysmlPackage.getAssociation(), false),
│                Arguments.of(sysmlPackage.getAssociationStructure(), sysmlPackage.getAssociation(),
│                Arguments.of(sysmlPackage.getAssociationStructure(), sysmlPackage.getDataType(), fa
⋮
│    @Test
│    @DisplayName("For each rule, the EClass is from the SysML EPackage")
│    public void testRuleEClassIsFromSysML() {
⋮
│    @Test
│    @DisplayName("Check usual naming pattern of rules")
│    public void testRuleNameMatchesExpectedPatterns() {
⋮
```
