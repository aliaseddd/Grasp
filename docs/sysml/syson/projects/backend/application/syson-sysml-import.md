# Repo map: backend/application/syson-sysml-import

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/application/syson-sysml-import`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/application/syson-sysml-import) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 94 files there; aider read the 93 that `syson.aiderignore` leaves in, and the map shows 26 of them, 26 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/ASTTransformer.java:
⋮
│public class ASTTransformer {
│
│    private final Logger logger = LoggerFactory.getLogger(ASTTransformer.class);
│
│    private final MessageReporter messageReporter;
│
│    private final AstTreeParser astTreeParser;
│
│    private final NonContainmentReferenceHandler nonContainmentReferenceHandler;
│
⋮
│    public Resource convertResource(final InputStream input, final ResourceSet resourceSet) {
│        Resource result = null;
│        if (input != null) {
│            final JsonNode astJson = this.readAst(input);
│            if (astJson != null) {
│                this.logger.info("Create the Root eObject containment structure");
│                final List<EObject> rootSysmlObjects = this.astTreeParser.parseAst(astJson);
│                result = new JSONResourceFactory().createResourceFromPath(null);
│                this.logger.info("File Parsed");
│                resourceSet.getResources().add(result);
⋮
│    public List<Element> convertToElements(InputStream input, Element parentElement) {
│        return this.convertToElements(input, parentElement, null, (messages) -> Boolean.FALSE);
⋮
│    public List<Element> convertToElements(InputStream input, Element parentElement, Function<List<
│        List<Element> result = List.of();
│        if (input != null) {
│            final JsonNode astJson = this.readAst(input);
│            if (astJson != null) {
│                this.logger.info("Create the Root eObject containment structure");
│                List<EObject> parsedAst = this.astTreeParser.parseAst(astJson);
│                var contents = this.getNamespaceContent(parsedAst);
│                if (contentSelector != null) {
│                    result = contentSelector.apply(contents);
⋮
│    public List<Message> getTransformationMessages() {
│        return this.messageReporter.getReportedMessages();
⋮
│    public List<String> logTransformationMessages() {
│        List<String> messages = new ArrayList<>();
│        List<Message> transformationMessages = this.getTransformationMessages();
│        if (!transformationMessages.isEmpty()) {
│            String logMessage = transformationMessages.stream().map(this::toLogMessage).collect(joi
│            messages.add(logMessage);
│        }
│        return messages;
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
│    @Override
│    public int hashCode() {
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/SysmlToAst.java:
⋮
│@Component
│public class SysmlToAst {
│
⋮
│    private String readValidationReport(Path reportFile) throws IOException {
│        try (InputStream stream = Files.newInputStream(reportFile)) {
│            String report = new String(stream.readNBytes(MAX_VALIDATION_REPORT_BYTES), StandardChar
│            if (stream.read() != -1) {
│                report = report + System.lineSeparator() + "[Report shortened]";
│            }
│            return report;
│        }
⋮
│    private void reportSyntaxError(String report, int exitCode, List<Status> reports) {
│        String firstDiagnostic = this.firstDiagnostic(report);
│        if (firstDiagnostic == null) {
│            if (exitCode != 0) {
│                reports.add(new Status(Severity.WARNING, VALIDATION_UNAVAILABLE_WARNING));
│            }
│        } else if (SYNTAX_DIAGNOSTIC.matcher(firstDiagnostic).lookingAt()) {
│            // The report quotes the source, so it is appended as is instead of being formatted.
│            reports.add(new Status(Severity.WARNING, PARTIAL_IMPORT_WARNING + System.lineSeparator(
│        }
⋮
│    private CompletableFuture<String> readStdOut(Process sysIdeProcess, List<Status> messages) {
│        return CompletableFuture.supplyAsync(
│                () -> {
│                    try {
│                        return this.readAstStream(sysIdeProcess.getInputStream());
│                    } catch (IOException e) {
│                        this.logger.error("Error while reading AST : " + e.getMessage(), e);
│                        messages.add(new Status(Severity.ERROR, "Error while building AST on stdOut
│                        return "";
│                    }
⋮
│    private String readStream(InputStream stream) throws IOException {
│        try (BufferedReader reader =
│                     new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
│            return reader.lines()
│                    .collect(Collectors.joining(System.lineSeparator()));
│        }
⋮
│    private Path createTempFile(final InputStream input, final String fileName, final String fileEx
│        final Path inputPath = Files.createTempFile(fileName, "." + fileExtension);
│        final OutputStream outStream = new FileOutputStream(inputPath.toString());
│        final byte[] buffer = new byte[8 * 1024];
│        int bytesRead;
│        while ((bytesRead = input.read(buffer)) != -1) {
│            outStream.write(buffer, 0, bytesRead);
│        }
│        input.close();
│        outStream.close();
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/datafetchers/MutationCr
⋮
│@MutationDataFetcher(type = "Mutation", field = "createExpression")
│public class MutationCreateExpressionDataFetcher implements IDataFetcherWithFieldCoordinates<Comple
⋮
│    @Override
│    public CompletableFuture<IPayload> get(DataFetchingEnvironment environment) throws Exception {
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/datafetchers/MutationEd
⋮
│@MutationDataFetcher(type = "Mutation", field = "editExpression")
│public class MutationEditExpressionDataFetcher implements IDataFetcherWithFieldCoordinates<Completa
⋮
│    @Override
│    public CompletableFuture<IPayload> get(DataFetchingEnvironment environment) throws Exception {
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/datafetchers/MutationIn
⋮
│@QueryDataFetcher(type = "Mutation", field = "insertTextualSysMLv2")
│public class MutationInsertTextualSysMLv2DataFetcher implements IDataFetcherWithFieldCoordinates<Co
│
⋮
│    @Override
│    public CompletableFuture<IPayload> get(DataFetchingEnvironment environment) throws Exception {
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/parser/ContainmentRefer
⋮
│public class ContainmentReferenceHandler {
│
│    private final EClassifierTranslator typeBuilder = new EClassifierTranslator();
│
│    private final LogNameProvider logNameProvider = new LogNameProvider();
│
│    private final EReferenceComputer referenceTranslator = new EReferenceComputer();
│
│    private final ReferenceNodeTester referenceNodeTester = new ReferenceNodeTester();
│
⋮
│    private void setValue(final EObject eObject, EReference ref, EObject value) {
│        if (ref.isMany()) {
│            ((List<Object>) eObject.eGet(ref)).add(value);
│        } else {
│            eObject.eSet(ref, value);
│        }
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/parser/EAttributeHandle
⋮
│public class EAttributeHandler {
│
│    private final MessageReporter messageReporter;
│
│    public EAttributeHandler(MessageReporter messageReporter) {
│        this.messageReporter = messageReporter;
│    }
│
│    public boolean isAttribute(final EObject eObject, String attrName, final JsonNode value) {
│        return value.isString() || value.isNumber() || value.isBoolean();
⋮
│    private void setValue(final EObject eObject, EAttribute attr, Object value) {
│        if (attr.isMany()) {
│            ((List<Object>) eObject.eGet(attr)).add(value);
│        } else {
│            eObject.eSet(attr, value);
│        }
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/parser/NonContainmentRe
⋮
│public class NonContainmentReferenceHandler {
│
│    private static final String QUALIFIED_CONST = "qualifiedName";
│
│    private final EReferenceComputer referenceComputer = new EReferenceComputer();
│
│    private final EClassifierTranslator typeBuilder = new EClassifierTranslator();
│
│    private final LogNameProvider logNameProvider = new LogNameProvider();
│
⋮
│    public void createProxy(final Element owner, String referenceName, final JsonNode astValue) {
│        boolean handled = this.sysideIncompatibilitiesHandler.handleNonContainmentReference(owner, 
│        if (!handled) {
│            JsonNode referenceTypeNode = astValue.get("$type");
│            JsonNode textNode = astValue.get("text");
│            String referenceType = referenceTypeNode.asString();
│            final EObject refrenceTypeInstance = this.typeBuilder.createObject(astValue);
│
│            if (refrenceTypeInstance instanceof InternalEObject internalTarget) {
│                String qualifiedNameTarget = textNode.asString();
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/parser/ProxyResolver.ja
⋮
│public class ProxyResolver {
│
│    private static final Logger LOGGER = LoggerFactory.getLogger(ProxyResolver.class);
│
│    private static final String INTERNATIONAL_SYSTEM_PACKAGE_PREFIX = "SI::";
│
│    private final LogNameProvider logNameProvider = new LogNameProvider();
│
│    private final MessageReporter messageReporter;
│
⋮
│    private EObject findProxyTarget(final EObject owner, final InternalEObject proxyObject, ERefere
│        final URI uri = proxyObject.eProxyURI();
│        final String qualifiedName = uri.fragment();
│
│        List<Namespace> deresolvingNamespaces = new ArrayList<>();
│        if (owner instanceof Element ownerElement) {
│            deresolvingNamespaces.addAll(new DeresolvingNamespaceProvider().getDeresolvingNamespace
│        }
│
│        EObject target = null;
⋮
│    private EObject resolveProxyQualifiedNameAgainstSI(Namespace deresolvingNamespace, EObject prox
│        var resolvedNamespace = deresolvingNamespace.resolve(INTERNATIONAL_SYSTEM_PACKAGE_PREFIX + 
│        if (resolvedNamespace != null) {
│            var namespaceImport = SysmlFactory.eINSTANCE.createNamespaceImport();
│            namespaceImport.setImportedNamespace(resolvedNamespace.libraryNamespace());
│            var sysmlPackages = EMFUtils.getAncestors(Package.class, proxyOwner, null);
│            if (!sysmlPackages.isEmpty()) {
│                sysmlPackages.getFirst().getOwnedRelationship().add(namespaceImport);
│            } else {
│                var namespaces = EMFUtils.getAncestors(Namespace.class, proxyOwner, null);
⋮
│    private boolean isConjugatedPortReference(final EObject owner, final Element target) {
│        return owner instanceof ConjugatedPortTyping && target instanceof PortDefinition;
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/parser/ReferenceNodeTes
⋮
│public class ReferenceNodeTester implements Predicate<JsonNode> {
│
│    @Override
│    public boolean test(JsonNode node) {
│        return this.hasNullableTextualField(node, "reference") && this.hasNonNullTextualField(node,
│    }
│
│    private boolean hasNullableTextualField(JsonNode node, String field) {
│        JsonNode nodeField = node.get(field);
│        return nodeField != null && this.isTextualOrNull(nodeField);
⋮
│    private boolean hasNonNullTextualField(JsonNode node, String field) {
│        JsonNode nodeField = node.get(field);
│        return nodeField != null && nodeField.isString();
⋮
│    private boolean isTextualOrNull(JsonNode node) {
│        return node != null && (node.isString() || node.isNull());
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/parser/SysIDENonContain
⋮
│public class SysIDENonContainmentIncompatibilitiesHandler {
│
│    private final NonContainmentReferenceHandler nonContainmentHandler;
│
│    public SysIDENonContainmentIncompatibilitiesHandler(NonContainmentReferenceHandler nonContainme
│        this.nonContainmentHandler = Objects.requireNonNull(nonContainmentHandler);
│    }
│
│    /**
│     * Tries to handle a special case of non containment reference that would normally result in a 
⋮
│    private boolean isMetadataAccessExpressionCase(final Element owner, String referenceName, final
│        return owner instanceof MetadataAccessExpression && "reference".equals(referenceName);
⋮
│    private void handleMetadataAccessExpression(final Element owner, String referenceName, final Js
│        Membership membership = SysmlFactory.eINSTANCE.createMembership();
│        owner.getOwnedRelationship().add(membership);
│        this.nonContainmentHandler.createProxy(membership, "memberElement", astValue);
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/parser/translation/EAtt
⋮
│public class EAttributeTranslator {
│
│    private static final String QUOTE_CONST = "\'";
│
│    private static final String DOUBLE_QUOTE_CONST = "\"";
│
│    private EAttribute matchingAttribute;
│
│    private Object value;
│
⋮
│    private Object handleTextualRepresentationLanguage(EClass ownerType, String astFeatureName, Jso
│        Object forcedValue;
│        this.matchingAttribute = this.getAttribute(ownerType, astFeatureName).orElse(null);
│        forcedValue = this.asCleanedText(astValue).replaceFirst("\"", "").replaceFirst("\\\"", "").
│        return forcedValue;
⋮
│    private Object handleIsUniqueAttribute(EClass ownerType, JsonNode astValue) {
│        Object forcedValue;
│        this.matchingAttribute = this.getAttribute(ownerType, "isUnique").orElse(null);
│        forcedValue = !astValue.asBoolean();
│        return forcedValue;
⋮
│    private Object handleIsReferenceAttribute(EClass ownerType, JsonNode astValue) {
│        Object forcedValue;
│        // The isReference attribute is set to false, which indicates that the element is composite
│        // isReference is un-settable and derived from isComposite, we have to set isComposite to t
│        // will automatically set isReference to false.
│        this.matchingAttribute = this.getAttribute(ownerType, "isComposite").orElse(null);
│        forcedValue = !astValue.asBoolean();
│        return forcedValue;
⋮
│    private Object handleCommentBody(EClass ownerType, String astFeatureName, JsonNode astValue) {
│        Object forcedValue;
│        this.matchingAttribute = this.getAttribute(ownerType, astFeatureName).orElse(null);
│        // This does not properly handle multiline comment
│        forcedValue = this.asCleanedText(astValue).replaceFirst("^/\\*", "").replaceFirst("\\*/", "
│        return forcedValue;
⋮
│    private Object handleLiteralStringValue(EClass ownerType, String astFeatureName, JsonNode astVa
│        String literalValue = astValue.asString().replace(DOUBLE_QUOTE_CONST, "");
│        // Unescape backslash
│        return literalValue.replace("\\\\", "\\");
⋮
│    public Object getValue() {
│        return this.value;
⋮
│    public EAttribute getAttribute() {
│        return this.matchingAttribute;
⋮
│    private Object getValue(EAttribute attr, JsonNode astValue) {
│        final Object result;
│
│        if (astValue.isString() || astValue.isNumber()) {
│            String cleanedValue = this.asCleanedText(astValue);
│            EDataType eAttributeType = attr.getEAttributeType();
│            if (this.isSpecialEnum(eAttributeType)) {
│                result = this.convertSpecialEnumLiteral(eAttributeType, cleanedValue);
│            } else {
│                result = eAttributeType.getEPackage().getEFactoryInstance().createFromString(eAttri
⋮
│    private boolean isSpecialEnum(EDataType dataType) {
│        return dataType == SysmlPackage.eINSTANCE.getTransitionFeatureKind()
│                || dataType == SysmlPackage.eINSTANCE.getRequirementConstraintKind();
⋮
│    private Object convertSpecialEnumLiteral(EDataType dataType, String aValue) {
│        final Object customValue;
│        if (dataType == SysmlPackage.eINSTANCE.getTransitionFeatureKind()) {
│            customValue = this.convertTransitionFeatureKind(aValue);
│        } else if (dataType == SysmlPackage.eINSTANCE.getRequirementConstraintKind()) {
│            customValue = this.convertRequirementConstraintKind(aValue);
│        } else {
│            customValue = null;
│        }
│        return customValue;
⋮
│    private TransitionFeatureKind convertTransitionFeatureKind(String aValue) {
│        if (aValue != null) {
│            return switch (aValue) {
│                case "if" -> TransitionFeatureKind.GUARD;
│                case "accept" -> TransitionFeatureKind.TRIGGER;
│                case "do" -> TransitionFeatureKind.EFFECT;
│                default -> {
│                    // Fallback on default case
│                    // The other SysIDE inputs are not identified yet
│                    yield (TransitionFeatureKind) SysmlPackage.eINSTANCE.getEFactoryInstance().crea
⋮
│    private RequirementConstraintKind convertRequirementConstraintKind(String aValue) {
│        if (aValue != null) {
│            return switch (aValue) {
│                case "require" -> RequirementConstraintKind.REQUIREMENT;
│                case "assume" -> RequirementConstraintKind.ASSUMPTION;
│                default -> {
│                    // Fallback on default case
│                    // The other SysIDE inputs are not identified yet
│                    yield (RequirementConstraintKind) SysmlPackage.eINSTANCE.getEFactoryInstance().
│                }
⋮
│    private boolean isSpecialBooleanFeature(String astFeatureName) {
│        return switch (astFeatureName) {
│            case "isAbstract" -> true;
│            case "isDerived" -> true;
│            case "isEnd" -> true;
│            case "isReadOnly" -> true;
│            default -> false;
│        };
⋮
│    private boolean handleBooleansAsString(JsonNode astJson, String mappedName) {
│        return this.handleBooleanAsString("isAbstract", mappedName, "abstract", astJson)
│                || this.handleBooleanAsString("isDerived", mappedName, "derived", astJson)
│                || this.handleBooleanAsString("isEnd", mappedName, "end", astJson)
│                || this.handleBooleanAsString("isReadOnly", mappedName, "readonly", astJson);
⋮
│    private boolean handleBooleanAsString(String attributeName, String mappedName, String stringVal
│        return attributeName.equals(mappedName) && stringValueIfTrue.equals(astValue.asString());
⋮
│    private Optional<EAttribute> getAttribute(EClass ownerType, String name) {
│        EStructuralFeature feature = ownerType.getEStructuralFeature(name);
│        if (feature instanceof EAttribute attr) {
│            return Optional.of(attr);
│        }
│        return Optional.empty();
⋮
│    private String asCleanedText(final JsonNode node) {
│        String result = null;
│
│        if (node.isString()) {
│            result = node.asString().replace(QUOTE_CONST, "");
│        }
│        if (node.isNumber()) {
│            result = node.asString();
│        }
│
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/parser/translation/ECla
⋮
│public class EClassifierTranslator {
│
│    private static final String TYPE_CONST = "$type";
│
│    public EObject createObject(JsonNode astJson) {
│        EClassifier classifier = this.toEClassifier(astJson);
│        if (classifier instanceof EClass eClass) {
│            return eClass.getEPackage().getEFactoryInstance().create(eClass);
│        } else {
│            return null;
│        }
⋮
│    private EClassifier toEClassifier(JsonNode astJson) {
│        String type = astJson.findValue(TYPE_CONST).stringValue();
│
│        if ("MembershipReference".equals(type)) {
│            type = "Membership";
│        } else if ("SysMLFunction".equals(type)) {
│            type = "Function";
│        } else if ("TypeReference".equals(type)) {
│            type = "Type";
│        } else if ("FeatureReference".equals(type)) {
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/parser/translation/ERef
⋮
│public class EReferenceComputer {
│
│    private static final Logger LOGGER = LoggerFactory.getLogger(EReferenceComputer.class);
│
│    private static final List<EReference> REL_CONTAINEMTS_REF = List.of(SysmlPackage.eINSTANCE.getR
│
│    public Optional<EReference> getNonContainmentReference(EClass ownerEClass, EClass targetEClass,
│
│        List<EReference> references = this.getAllMacthingOrdererAllEReference(ownerEClass, targetEC
│        final Optional<EReference> ref;
│        if (references.isEmpty()) {
│            ref = Optional.empty();
│        } else {
│            String translatedRefName = this.toMetamodelRefName(ownerEClass, astRefName);
│            ref = this.getNonContainmentReference(references, translatedRefName);
│        }
│
⋮
│    private String toMetamodelRefName(EClass ownerType, String refName) {
│        String result = refName;
│
│        if (SysmlPackage.eINSTANCE.getRelationship().isSuperTypeOf(ownerType) && "targetRef".equals
│            result = SysmlPackage.eINSTANCE.getRelationship_Target().getName();
│        }
│
│        return result;
⋮
│    private Optional<EReference> getNonContainmentReference(List<EReference> references, String nam
│        return references.stream().filter(ref -> !ref.isContainment() && this.match(ref, name)).fin
⋮
│    private void collectAllRedefinitions(EReference ref, Collection<EReference> accumulator) {
│        EAnnotation eAnnotation = ref.getEAnnotation("redefines");
│        if (eAnnotation != null) {
│            List<EReference> referencedFeature = eAnnotation.getReferences().stream()
│                    .filter(EReference.class::isInstance)
│                    .map(EReference.class::cast)
│                    .toList();
│
│            for (EReference redRef : referencedFeature) {
│                if (!accumulator.contains(redRef)) {
⋮
│    private List<EReference> getAllMacthingOrdererAllEReference(EClass eClass, EClass targetType) {
│        Stream<EReference> superReferences = eClass.getEAllSuperTypes().stream()
│                .sorted(Comparator.comparing(sup -> this.distance(eClass, sup)))
│                .flatMap(sup -> sup.getEReferences().stream());
│
│        return Stream.concat(eClass.getEReferences().stream(), superReferences)
│                .filter(ref -> ref.getEReferenceType().isSuperTypeOf(targetType) && ref.isChangeabl
│                .toList();
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/services/SysideExpressi
⋮
│@Service
│public class SysideExpressionEditor implements ISysMLExpressionEditor {
│
⋮
│    @Override
│    public ExpressionCreationResult createExpression(IEMFEditingContext emfEditingContext, Element 
⋮
│    @Override
│    public ExpressionCreationResult editExpression(IEMFEditingContext emfEditingContext, Element pa
⋮
│    private ExpressionCreationResult createOrEditExpression(IEMFEditingContext emfEditingContext, E
⋮
│    private void applyProperties(Expression expression, ExpressionPropertiesInput properties) {
│        if (properties != null && properties.featureValue() != null) {
│            this.getOwningFeatureValue(expression).ifPresent(featureValue -> this.applyFeatureValue
│        }
⋮
│    private Optional<FeatureValue> getOwningFeatureValue(Expression expression) {
│        return Optional.ofNullable(expression.getOwningRelationship())
│                .filter(FeatureValue.class::isInstance)
│                .map(FeatureValue.class::cast);
⋮
│    private void applyFeatureValueProperties(FeatureValue featureValue, FeatureValueExpressionPrope
│        if (properties.isDefault() != null) {
│            featureValue.setIsDefault(properties.isDefault());
│        }
│        if (properties.isInitial() != null) {
│            featureValue.setIsInitial(properties.isInitial());
│        }
⋮
│    private boolean containsErrors(List<Message> messages) {
│        return messages.stream().anyMatch(message -> message.level().equals(MessageLevel.WARNING) |
⋮
│    private Optional<Expression> getNewExpression(List<Element> newObjects) {
│        if (!newObjects.isEmpty() && newObjects.get(0) instanceof Relationship relationship && !rel
│                && relationship.getOwnedRelatedElement().get(0) instanceof Expression newExpression
│            return Optional.of(newExpression);
│        } else {
│            return Optional.empty();
│        }
⋮
│    private String wrapPlainExpression(Element parentElement, String plainExpression) {
│        UUID uniqueName = UUID.randomUUID();
│        String template = "";
│        if (parentElement instanceof TransitionUsage) {
│            // Will produce a more complex structure inside which we'll find the actual
│            // TransitionFeatureMembership[kind=GUARD] ->
│            // Expression. See extractGuardExpression().
│            template = """
│                    state <'%s'> {
│                      entry action init;
⋮
│    private Element extractGuard(StateUsage wrappingState) {
│        Element result;
│        result = wrappingState.getOwnedRelationship().get(2)
│                .getOwnedRelatedElement().get(0)
│                .getOwnedRelationship().stream()
│                .filter(TransitionFeatureMembership.class::isInstance)
│                .map(TransitionFeatureMembership.class::cast)
│                .filter(tfm -> tfm.getKind() == TransitionFeatureKind.GUARD)
│                .findFirst()
│                .orElse(null);
⋮
│    private List<Message> toMessages(List<Status> reports) {
│        return reports.stream().map((Status status) -> {
│            return switch (status.severity()) {
│                case INFO -> new Message(status.message(), MessageLevel.INFO);
│                case WARNING -> new Message(status.message(), MessageLevel.WARNING);
│                case ERROR -> new Message(status.message(), MessageLevel.ERROR);
│                default -> null;
│            };
│        }).filter(Objects::nonNull).toList();
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/services/SysideSysMLTex
⋮
│@Service
│public class SysideSysMLTextImporter implements ISysMLTextImporter {
⋮
│    @Override
│    public List<Element> importSysMLText(IEMFEditingContext emfEditingContext, Element parentElemen
⋮
│    private List<Message> toMessages(List<Status> reports) {
│        return reports.stream().map((Status status) -> {
│            return switch (status.severity()) {
│                case INFO -> new Message(status.message(), MessageLevel.INFO);
│                case WARNING -> new Message(status.message(), MessageLevel.WARNING);
│                case ERROR -> new Message(status.message(), MessageLevel.ERROR);
│                default -> null;
│            };
│        }).filter(Objects::nonNull).toList();
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/services/api/ISysMLExpr
⋮
│public interface ISysMLExpressionEditor {
│    /**
│     * Create a {@link Expression expression} inside the specified parent element from a textual re
│     *
│     * @param emfEditingContext
│     *            the editing context.
│     * @param parentElement
│     *            the parent element in which the new expression will be added. The concrete {@link
│     *            relationship} into which the expression is added will depend on the parent's type
│     * @param expressionText
⋮
│    ExpressionCreationResult createExpression(IEMFEditingContext emfEditingContext, Element parentE
│
⋮
│    ExpressionCreationResult editExpression(IEMFEditingContext emfEditingContext, Element parentEle
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/services/api/ISysMLText
⋮
│public interface ISysMLTextImporter {
│    /**
│     * Import a SysMLv2 text fragment inside an existing element.
│     *
│     * @param emfEditingContext
│     *            the editing context.
│     * @param parentElement
│     *            the parent element in which the elements in the imported text will be added.
│     * @param textualContent
│     *            the SysMLv2 text fragment to import. It may contain multiple elements.
⋮
│    List<Element> importSysMLText(IEMFEditingContext emfEditingContext, Element parentElement, Stri
⋮

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/upload/SysMLExternalRes
⋮
│@Service
│public class SysMLExternalResourceLoaderService implements IExternalResourceLoaderService {
│
⋮
│    @Override
│    public Optional<ExternalResourceLoadingResult> getResource(InputStream inputStream, URI resourc
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

backend/application/syson-sysml-import/src/main/java/org/eclipse/syson/sysml/utils/MessageReporter.j
⋮
│public class MessageReporter {
│
│    private final List<Message> reportedMessages = new ArrayList<>();
│
│    public void error(String msg) {
│        Message message = new Message(msg, MessageLevel.ERROR);
│        this.reportedMessages.add(message);
│    }
│
│    public void info(String msg) {
⋮
│    public List<Message> getReportedMessages() {
│        return this.reportedMessages;
⋮

backend/application/syson-sysml-import/src/main/resources/messages_en.properties:
│1=[ERR] Reference of {0} not found for {1}
│2=[WARN] Reference of {1} not found for search text = {0}
│3=[ERR] Missing search text to resolve Reference of {0}
│4=[ERR] Reference Membership not found for node {0}

backend/application/syson-sysml-import/src/main/resources/messages_fr.properties:
│1=[ERR] La référence de {0} n''a pas été trouvé pour {1}
│2=[WARN] La reference de {1} n''a pas été trouvé en utilisant le texte = {0}
│3=[ERR] Texte de recherche manquant pour résoudre la référence de {0}
│4=[ERR] La Reference Membership n''a pas été trouvé pour {0}

backend/application/syson-sysml-import/src/test/java/org/eclipse/syson/sysml/ArchitectureConstants.j
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_SYSML_IMPORT_ROOT_PACKAGE = "org.eclipse.syson.sysml.import.."
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_SYSML_IMPORT_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/application/syson-sysml-import/src/test/java/org/eclipse/syson/sysml/CodingRulesTests.java:
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_SYSML_IMPORT_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮
```
