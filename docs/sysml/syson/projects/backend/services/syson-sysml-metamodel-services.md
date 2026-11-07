# Repo map: backend/services/syson-sysml-metamodel-services

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/services/syson-sysml-metamodel-services`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/services/syson-sysml-metamodel-services) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 62 files there; aider read the 62 that `syson.aiderignore` leaves in, and the map shows 28 of them, 28 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/help
⋮
│public class EMFUtils {
│
│    private static final Logger LOGGER = LoggerFactory.getLogger(EMFUtils.class);
│
│    /**
│     * Gets the ancestor of given type starting from a specific element.
│     *
│     * @param object
│     *            an {@link EObject}
│     * @param type
⋮
│    private static <T extends EObject> T getAncestor(Class<T> type, EObject object) {
│        if (object == null) {
│            return null;
│        }
│        final T result;
│        if (type.isInstance(object)) {
│            result = (T) object;
│        } else {
│            result = getAncestor(type, object.eContainer());
│        }
⋮
│    public static Collection<Setting> getInverse(EObject source, EReference targetingFeature) {
│        return source.eAdapters().stream()
│                .filter(ECrossReferenceAdapter.class::isInstance)
│                .map(ECrossReferenceAdapter.class::cast)
│                .map(crossRef -> crossRef.getInverseReferences(source, targetingFeature, false))
│                .findFirst().orElseGet(() -> {
│                    LOGGER.warn("Unable to find an ECrossReference on " + source);
│                    return List.of();
│                });
│
⋮
│    public static Collection<Setting> getInverse(EObject source) {
│        return source.eAdapters().stream()
│                .filter(ECrossReferenceAdapter.class::isInstance)
│                .map(ECrossReferenceAdapter.class::cast)
│                .map(crossRef -> crossRef.getInverseReferences(source))
│                .findFirst()
│                .orElseGet(() -> {
│                    LOGGER.warn("Unable to find an ECrossReference on " + source);
│                    return List.of();
│                });
│
⋮
│    public static Stream<EObject> eAllContentStreamWithSelf(EObject o) {
│        if (o == null) {
│            return Stream.empty();
│        }
│        return Stream.concat(Stream.of(o), StreamSupport
│                .stream(Spliterators.spliteratorUnknownSize(o.eAllContents(), Spliterator.NONNULL),
⋮
│    public static Stream<Notifier> eAllContentStreamWithSelf(Resource r) {
│        if (r == null) {
│            return Stream.empty();
│        }
│        return Stream.concat(Stream.of(r), StreamSupport
│                .stream(Spliterators.spliteratorUnknownSize(r.getAllContents(), Spliterator.NONNULL
⋮
│    public static Stream<Notifier> eAllContentStreamWithSelf(Notifier n) {
│        Stream<Notifier> result = Stream.empty();
│        if (n instanceof Resource resource) {
│            result = eAllContentStreamWithSelf(resource);
│        } else if (n instanceof EObject eObject) {
│            result = eAllContentStreamWithSelf(eObject).map(Notifier.class::cast);
│        } else if (n instanceof ResourceSet resourceSet) {
│            result = eAllContentStreamWithSelf(resourceSet);
│        }
│        return result;
⋮
│    public static Stream<Notifier> eAllContentStreamWithSelf(ResourceSet rs) {
│        if (rs == null) {
│            return Stream.empty();
│        }
│        return Stream.concat(Stream.of(rs), StreamSupport
│                .stream(Spliterators.spliteratorUnknownSize(rs.getAllContents(), Spliterator.NONNUL
⋮
│    public static <T extends EObject> List<T> getAncestors(Class<T> type, EObject object, Predicate
│        var current = object;
│        List<T> results = new ArrayList<>();
│        while (current != null) {
│            if (type.isInstance(current) && (ancestorPredicate == null || ancestorPredicate.test(cu
│                results.add((T) current);
│            }
│            current = current.eContainer();
│        }
│        return results;
⋮
│    private static <T extends EObject> List<T> getAncestors(Class<T> type, EObject object) {
│        return getAncestors(type, object, null);
⋮
│    public static void resolveAllNonDerived(ResourceSet rs) {
│        List<Resource> resources = rs.getResources();
│        for (int i = 0; i < resources.size(); i++) {
│            resolveAllNonDerived(resources.get(i));
│        }
⋮
│    private static void resolveAllNonDerived(Resource resource) {
│        resource.getContents().forEach(eObject -> resolveAllNonDerived(eObject));
⋮
│    private static void resolveAllNonDerived(EObject eObject) {
│        resolveNonDerivedCrossReferences(eObject);
│        for (Iterator<EObject> i = eObject.eAllContents(); i.hasNext(); ) {
│            EObject childEObject = i.next();
│            resolveNonDerivedCrossReferences(childEObject);
│        }
⋮
│    private static void resolveNonDerivedCrossReferences(EObject eObject) {
│        eObject.eClass().getEAllReferences().stream().filter(e -> !e.isDerived() && !e.isContainmen
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
│    public void addAll(List<? extends Specialization> specializations) {
│        for (Specialization s : specializations) {
│            this.add(s);
│        }
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
│public class ImplicitSpecializationSwitch extends SysmlSwitch<List<Specialization>> {
│
│    private final ImplicitSpecializationAccumulator implicitSpecializations;
│
│    private final ILibraryNamespaceProvider namespaceProvider;
│
│    public ImplicitSpecializationSwitch(List<Specialization> existingSpecializations, ILibraryNames
│        this.namespaceProvider = namespaceProvider;
│        this.implicitSpecializations = ImplicitSpecializationAccumulator.fromExistingSpecialization
│    }
│
│    @Override
│    public List<Specialization> doSwitch(EObject eObject) {
⋮

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/help
⋮
│public class MembershipComputer<T extends Element> {
│
│    private final Set<Element> visited;
│
│    private final T sourceElement;
│
│    public MembershipComputer(T sourceElement, EList<? extends Namespace> excluded) {
│        this.visited = excluded.stream().collect(toSet());
│        this.sourceElement = sourceElement;
│    }
│
│    public EList<Membership> visibleMemberships(boolean isRecursive, boolean includeAll, boolean in
│        if (this.sourceElement instanceof Namespace namespace) {
│            return this.visibleMemberships(namespace, isRecursive, includeAll, includeProtectedInhe
│        } else {
│            return new BasicEList<>();
│        }
⋮
│    private EList<Membership> visibleMemberships(Namespace self, boolean isRecursive, boolean inclu
│        if (this.visited.contains(self)) {
│            return new BasicEList<>();
│        }
│
│        // Protected against infinite loop while iterating on imported/inherited elements
│        this.visited.add(self);
│
│        NameConflictingFilter nameConflictingFilter = new NameConflictingFilter();
│        List<Membership> directMemberships = self.getOwnedMembership().stream()
⋮

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/help
⋮
│public class NameConflictingFilter implements Predicate<Membership> {
│
│    private final Set<String> usedNames = new HashSet<>();
│
│    @Override
│    public boolean test(Membership member) {
│        boolean test = true;
│        if (member != null) {
│            if (member.getMemberName() != null
│                    && member.getMemberElement() != null
⋮
│    public boolean checkConflictingElement(Element memberElement) {
│        return this.checkConflictingNames(memberElement.effectiveName()) && this.checkConflictingNa
⋮
│    public boolean checkConflictingNames(String name) {
│
│        boolean hasName = name != null;
│        if (hasName) {
│            boolean hasConflictingName = hasName && this.usedNames.contains(name);
│
│            boolean noConflict = !hasConflictingName;
│            if (noConflict) {
│                // Only add to forbidden names if the element is not conflicting on both the shortn
│                // name
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
│    private boolean isLetterOrUnderscore(char c) {
│        return c == '_' || this.isLowerCaseLetter(c) || this.isUpperCaseLetter(c);
⋮
│    private boolean isUpperCaseLetter(char c) {
│        return c >= 'a' && c <= 'z';
⋮
│    private boolean isLowerCaseLetter(char c) {
│        return c >= 'A' && c <= 'Z';
⋮

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class MetamodelMutationImportService {
│
│    /**
│     * Creates the namespace import needed to make {@code elementToImport} visible from the package
│     * {@code element}, unless an existing import already provides that visibility.
│     *
│     * @param element
│     *            the element whose package requires the import
│     * @param elementToImport
│     *            the element to make visible
⋮
│    private List<Namespace> getAllNamespaces(Element element) {
│        List<Namespace> namespacesHierarchy = new ArrayList<>();
│        Namespace elementNamespace = element.getOwningNamespace();
│        if (elementNamespace != null) {
│            namespacesHierarchy.add(elementNamespace);
│            namespacesHierarchy.addAll(this.getNamespacesHierarchy(elementNamespace));
│        }
│        return namespacesHierarchy;
⋮
│    private List<Namespace> getNamespacesHierarchy(Element element) {
│        List<Namespace> namespacesHierarchy = new ArrayList<>();
│        if (element != null) {
│            EObject eContainer = element.eContainer();
│            if (eContainer instanceof Namespace ns) {
│                namespacesHierarchy.add(ns);
│            }
│            if (eContainer instanceof Element parentElement) {
│                namespacesHierarchy.addAll(this.getNamespacesHierarchy(parentElement));
│            }
⋮
│    private org.eclipse.syson.sysml.Package getPackageParent(Element element) {
│        org.eclipse.syson.sysml.Package pkg = null;
│        if (element != null) {
│            EObject eContainer = element.eContainer();
│            if (eContainer instanceof org.eclipse.syson.sysml.Package parentPkg) {
│                pkg = parentPkg;
│            } else if (eContainer instanceof Element parentElement) {
│                pkg = this.getPackageParent(parentElement);
│            }
│        }
⋮
│    private boolean isImportForElement(Import imprt, Element elementToImport) {
│        boolean isImportForElement = false;
│        if (imprt instanceof NamespaceImport namespaceImport) {
│            Namespace importedNamespace = namespaceImport.getImportedNamespace();
│            Namespace elementToImportNamespace = elementToImport.getOwningNamespace();
│            if (importedNamespace != null && importedNamespace.equals(elementToImportNamespace)) {
│                isImportForElement = true;
│            } else if (imprt.isIsRecursive()) {
│                isImportForElement = this.isParentOf(importedNamespace, elementToImportNamespace);
│            }
⋮
│    private boolean isParentOf(EObject parent, EObject child) {
│        boolean isParentOf = false;
│        if (parent != null && child != null) {
│            if (child.equals(parent)) {
│                isParentOf = true;
│            }
│            EObject eContainer = child.eContainer();
│            if (eContainer != null) {
│                isParentOf = this.isParentOf(parent, eContainer);
│            }
⋮

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class SysMLElementSerializer extends SysmlSwitch<String> {
│
│    private static final String SPACE = " ";
│
│    /** The sequence closing a block comment, which cannot appear inside a comment body. */
│    private static final String COMMENT_TERMINATOR = "*/";
│
│    /** The form the block comment terminator is exported as, so it no longer closes the comment. *
│    private static final String ESCAPED_COMMENT_TERMINATOR = "* /";
│
⋮
│    @Override
│    public String doSwitch(EObject eObject) {
⋮

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public record SysMLSerializingOptions(String lineSeparator, String indentation, INameDeresolver nam
│
│    public SysMLSerializingOptions {
│        Objects.requireNonNull(lineSeparator, "property :lineSeparator is required");
│        Objects.requireNonNull(indentation, "property :indentation is required");
│        Objects.requireNonNull(nameDeresolver, "property :nameDeresolver is required");
│    }
│
│    /**
│     * Builder for {@link SysMLSerializingOptions}.
⋮
│    public static final class Builder {
│
│        private String lineSeparator;
│
│        private String indentation;
│
│        private INameDeresolver nameDeresolver;
│
│        private boolean needEscapeCharacter;
│
⋮

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public final class SysMLv2Keywords {
│
│    // Symbols / Operators / Punctuation
│    public static final String LESS_THAN = "<";
│    public static final String GREATER_THAN = ">";
│    public static final String SEMICOLON = ";";
│
│    public static final String LEFT_BRACE = "{";
│    public static final String RIGHT_BRACE = "}";
│
⋮

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class Appender {
│
│    private final StringBuilder builder = new StringBuilder();
│
│    private final String indentation;
│
│    private final String newLine;
│
│    private final Collection<Character> symbols = List.of('[', '(', '.', '@');
│
⋮
│    public boolean isEmpty() {
│        return this.builder.isEmpty() || this.builder.toString().trim().isBlank();
⋮
│    public Appender appendSpaceIfNeeded() {
│        if (!this.builder.isEmpty() && !this.endWithSpace() && !this.endWithSymbol()) {
│            this.append(" ");
│        }
│        return this;
⋮
│    private boolean endWithSymbol() {
│        char charAt = this.builder.charAt(this.builder.length() - 1);
│        return this.symbols.contains(charAt);
⋮
│    public int length() {
│        return this.builder.length();
⋮
│    @Override
│    public String toString() {
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
│    @Override
│    public String getDeresolvedName(Element element, Element context) {
│
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

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public interface INameDeresolver {
│
│    /**
│     * Retrieve the name of the given element from a given context.
│     *
│     * @param element
│     *            the element from which a name should be computed
│     * @param context
│     *            the context element from which the deresolution occurs
│     * @return a name or <code>null</code>
│     */
│    String getDeresolvedName(Element element, Element context);
│
⋮

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public record Status(Severity severity, String message) {
│
│    public static Status warning(String message, Object... arguments) {
│        return new Status(Severity.WARNING, MessageFormat.format(message, arguments));
│    }
│
│    public static Status error(String message, Object... arguments) {
│        return new Status(Severity.ERROR, MessageFormat.format(message, arguments));
│    }
│
│    public static Status info(String message, Object... arguments) {
│        return new Status(Severity.INFO, MessageFormat.format(message, arguments));
⋮
│    public static Status debug(String message, Object... arguments) {
│        return new Status(Severity.DEBUG, MessageFormat.format(message, arguments));
⋮
│    @Override
│    public String toString() {
⋮

backend/services/syson-sysml-metamodel-services/src/main/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class SysMLRelationPredicates {
│
│    private final Predicate<Relationship> isNotUserDefineKeywordMember = r -> !this.isMemberElement
│
│    private final Predicate<Relationship> isMembership = r -> r instanceof Membership;
│
│    private final Predicate<Relationship> isImport = r -> r instanceof Import;
│
│    private final Predicate<Relationship> isMetadataUsage = m -> this.isMemberElementA(m, MetadataU
│
⋮
│    private boolean isMemberElementA(Relationship r, Class<?>... types) {
│        if (r instanceof Membership membership) {
│            return this.isA(membership.getMemberElement(), types);
│        }
│        return false;
⋮
│    private boolean isExtendedUsage(Relationship r) {
│        return r instanceof Membership membership
│                && membership.getMemberElement() != null
│                && membership.getMemberElement().eClass() == SysmlPackage.eINSTANCE.getUsage();
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_SYSML_METAMODEL_SERVICES_ROOT_PACKAGE = "org.eclipse.syson.sys
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_SYSML_METAMODEL_SERVICES_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_SYSML_METAMODEL_SERVICES_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class ItemsModelTest {
│    private final ModelBuilder builder = new ModelBuilder();
│
│    private ResourceSetImpl resourceSet;
│
│    private XMIResource resource;
│
│    private Namespace rootNamespace;
│
│    private ActionUsage externalAction;
│
⋮
│    private ItemUsage createInItemUsageIn(Element parent, String name) {
│        ItemUsage result = this.builder.createInWithName(ItemUsage.class, parent, name);
│        result.setDirection(FeatureDirectionKind.IN);
│        return result;
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class FileNameDeresolverTest {
│
│    private static final String P2_DEF2 = "p2::def2";
│
│    private static final String DEF1 = "def1";
│
│    private static final String P1X1_P1X1X1_DEF1X1X1 = "p1x1::p1x1x1::def1x1x1";
│
│    private static final String P1_1 = "p1x1";
│
⋮
│    private String getDeresolvedName(Element toDeresolve, Element context) {
│        return new FileNameDeresolver().getDeresolvedName(toDeresolve, context);
⋮
│    private static final class TestModel {
│
│        private final ModelBuilder builder = new ModelBuilder();
│
│        private Package p1;
│
│        private Package p1x1;
│
│        private Package p1x2;
│
⋮
│        private Package createPackageAndPartDef(String name, Element parent, Consumer<PartDefinitio
│            Package pack = this.builder.createInWithName(Package.class, parent, "p" + name);
│            PartDefinition def = this.builder.createInWithName(PartDefinition.class, pack, "def" + 
│            consumer.accept(def);
│
│            return pack;
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class AssertConstraintUsageWithOperatorExpressionTestModel {
│
│    private final ModelBuilder builder = new ModelBuilder();
│
│    private final AssertConstraintUsage assertConstraintUsage;
│
│    private final PartUsage runner;
│
│    private final PartUsage walker;
│
⋮
│    private void assertConstraintUsageWithOperatorExpressionTestModel() {
│        ResultExpressionMembership resultExpressionMembership = this.builder.createIn(ResultExpress
│
│        OperatorExpression expression = this.builder.create(OperatorExpression.class);
│        expression.setOperator("xor");
│        resultExpressionMembership.getOwnedRelatedElement().add(expression);
│
│        ParameterMembership parameterMembership = this.builder.createIn(ParameterMembership.class, 
│
│        Feature feature = this.builder.create(Feature.class);
⋮
│    private void createFeatureReference(Feature feature, Usage attr) {
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        FeatureReferenceExpression featureReferenceExpression = this.builder.create(FeatureReferenc
│        featureValue.getOwnedRelatedElement().add(featureReferenceExpression);
│        Membership membership = this.builder.createIn(Membership.class, featureReferenceExpression)
│        membership.setMemberElement(attr);
⋮
│    private void createNullExpression(Expression expression) {
│        ParameterMembership parameterMembership = this.builder.createIn(ParameterMembership.class, 
│        Feature feature = this.builder.create(Feature.class);
│        parameterMembership.getOwnedRelatedElement().add(feature);
│
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        NullExpression nullExpression = this.builder.create(NullExpression.class);
│        featureValue.getOwnedRelatedElement().add(nullExpression);
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class AttributeUsageWithBinaryOperatorExpressionTestModel {
│
│    private final ModelBuilder builder = new ModelBuilder();
│
│    private final AttributeUsage attributeUsage;
│
│    private final AttributeUsage bestFuelConsumption;
│
│    private final AttributeUsage idlingFuelConsumption;
│
⋮
│    private void attributeUsageWithBinaryOperatorExpression() {
│        OperatorExpression plusExpression = this.builder.create(OperatorExpression.class);
│        plusExpression.setOperator("+");
│
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, this.attributeUsage);
│        featureValue.getOwnedRelatedElement().add(plusExpression);
│
│        ParameterMembership plusParam1 = this.builder.createIn(ParameterMembership.class, plusExpre
│        Feature plusFeature1 = this.builder.create(Feature.class);
│        plusParam1.getOwnedRelatedElement().add(plusFeature1);
⋮
│    private void createFeatureReference(Feature feature, AttributeUsage attr) {
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        FeatureReferenceExpression featureReferenceExpression = this.builder.create(FeatureReferenc
│        featureValue.getOwnedRelatedElement().add(featureReferenceExpression);
│        Membership membership = this.builder.createIn(Membership.class, featureReferenceExpression)
│        membership.setMemberElement(attr);
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class AttributeUsageWithBracketOperatorExpressionTestModel {
│
│    private final ModelBuilder builder = new ModelBuilder();
│
│    private final AttributeUsage attributeUsage;
│
│    private final AttributeUsage mm;
│
│    public AttributeUsageWithBracketOperatorExpressionTestModel() {
│        this.attributeUsage = this.builder.createWithName(AttributeUsage.class, "attribute1");
⋮
│    private void attributeUsageWithBracketOperatorExpression() {
│        OperatorExpression bracketExpression = this.builder.create(OperatorExpression.class);
│        bracketExpression.setOperator("[");
│
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, this.attributeUsage);
│        featureValue.getOwnedRelatedElement().add(bracketExpression);
│
│        ParameterMembership literalParam1 = this.builder.createIn(ParameterMembership.class, bracke
│        Feature feature1 = this.builder.create(Feature.class);
│        literalParam1.getOwnedRelatedElement().add(feature1);
│
⋮
│    private void createFeatureReference(Feature feature, AttributeUsage attr) {
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        FeatureReferenceExpression featureReferenceExpression = this.builder.create(FeatureReferenc
│        featureValue.getOwnedRelatedElement().add(featureReferenceExpression);
│        Membership membership = this.builder.createIn(Membership.class, featureReferenceExpression)
│        membership.setMemberElement(attr);
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class AttributeUsageWithFeatureChainExpressionTestModel {
│
│    private final ModelBuilder builder = new ModelBuilder();
│
│    private final AttributeUsage attributeUsage;
│
│    private final AttributeUsage fuel;
│
│    private final AttributeUsage front;
│
⋮
│    private void attributeUsageWithFeatureChainExpression() {
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, this.attributeUsage);
│
│        OperatorExpression sequenceExpression = this.createSequenceExpression(featureValue, this.fu
│
│        ParameterMembership param1 = this.builder.createIn(ParameterMembership.class, sequenceExpre
│        Feature feature1 = this.builder.create(Feature.class);
│        FeatureValue featureValue1 = this.builder.createIn(FeatureValue.class, feature1);
│        param1.getOwnedRelatedElement().add(feature1);
│
⋮
│    private void createFeatureReference(Feature feature, AttributeUsage attr) {
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        FeatureReferenceExpression featureReferenceExpression = this.builder.create(FeatureReferenc
│        featureValue.getOwnedRelatedElement().add(featureReferenceExpression);
│        Membership membership = this.builder.createIn(Membership.class, featureReferenceExpression)
│        membership.setMemberElement(attr);
⋮
│    private OperatorExpression createSequenceExpression(FeatureValue container, AttributeUsage attr
│        OperatorExpression sequenceExpression = this.builder.create(OperatorExpression.class);
│        sequenceExpression.setOperator(",");
│
│        container.getOwnedRelatedElement().add(sequenceExpression);
│
│        ParameterMembership param = this.builder.createIn(ParameterMembership.class, sequenceExpres
│        Feature feature = this.builder.create(Feature.class);
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        param.getOwnedRelatedElement().add(feature);
│
⋮
│    private void createFeatureChainExpression(FeatureValue container, AttributeUsage attr1, Attribu
│        FeatureChainExpression chainExpression = this.builder.create(FeatureChainExpression.class);
│        container.getOwnedRelatedElement().add(chainExpression);
│
│        ParameterMembership param2 = this.builder.createIn(ParameterMembership.class, chainExpressi
│        Feature feature2 = this.builder.create(Feature.class);
│        param2.getOwnedRelatedElement().add(feature2);
│        this.createFeatureReference(feature2, attr1);
│
│        Membership membership = this.builder.createIn(Membership.class, chainExpression);
⋮
│    private void createFeatureChainExpressionWithFeatureChaining(FeatureValue container, AttributeU
│        FeatureChainExpression chainExpression = this.builder.create(FeatureChainExpression.class);
│        container.getOwnedRelatedElement().add(chainExpression);
│
│        ParameterMembership param2 = this.builder.createIn(ParameterMembership.class, chainExpressi
│        Feature feature2 = this.builder.create(Feature.class);
│        param2.getOwnedRelatedElement().add(feature2);
│        this.createFeatureReference(feature2, attr1);
│
│        OwningMembership membership = this.builder.createIn(OwningMembership.class, chainExpression
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class AttributeUsageWithInvocationExpressionTestModel {
│
│    private final ModelBuilder builder = new ModelBuilder();
│
│    private final AttributeUsage attributeUsage;
│
│    private final AttributeUsage fuel;
│
│    private final AttributeUsage front;
│
⋮
│    private void attributeUsageWithInvocationExpression() {
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, this.attributeUsage);
│
│        InvocationExpression invocationExpression = this.builder.create(InvocationExpression.class)
│        featureValue.getOwnedRelatedElement().add(invocationExpression);
│        this.builder.setType(invocationExpression, this.fuel);
│
│        ParameterMembership param1 = this.builder.createIn(ParameterMembership.class, invocationExp
│        Feature feature1 = this.builder.create(Feature.class);
│        this.createFeatureReference(feature1, this.front);
⋮
│    private void createFeatureReference(Feature feature, AttributeUsage attr) {
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        FeatureReferenceExpression featureReferenceExpression = this.builder.create(FeatureReferenc
│        featureValue.getOwnedRelatedElement().add(featureReferenceExpression);
│        Membership membership = this.builder.createIn(Membership.class, featureReferenceExpression)
│        membership.setMemberElement(attr);
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class AttributeUsageWithSequenceExpressionTestModel {
│
│    private final ModelBuilder builder = new ModelBuilder();
│
│    private final AttributeUsage attributeUsage;
│
│    private final AttributeUsage fuel;
│
│    private final AttributeUsage front;
│
⋮
│    private void attributeUsageWithSequenceExpression() {
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, this.attributeUsage);
│
│        OperatorExpression sequenceExpression = this.createSequenceExpression(featureValue, this.fu
│
│        ParameterMembership param1 = this.builder.createIn(ParameterMembership.class, sequenceExpre
│        Feature feature1 = this.builder.create(Feature.class);
│        FeatureValue featureValue1 = this.builder.createIn(FeatureValue.class, feature1);
│        param1.getOwnedRelatedElement().add(feature1);
│
⋮
│    private void createFeatureReference(Feature feature, AttributeUsage attr) {
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        FeatureReferenceExpression featureReferenceExpression = this.builder.create(FeatureReferenc
│        featureValue.getOwnedRelatedElement().add(featureReferenceExpression);
│        Membership membership = this.builder.createIn(Membership.class, featureReferenceExpression)
│        membership.setMemberElement(attr);
⋮
│    private OperatorExpression createSequenceExpression(FeatureValue container, AttributeUsage attr
│        OperatorExpression sequenceExpression = this.builder.create(OperatorExpression.class);
│        sequenceExpression.setOperator(",");
│
│        container.getOwnedRelatedElement().add(sequenceExpression);
│
│        ParameterMembership param = this.builder.createIn(ParameterMembership.class, sequenceExpres
│        Feature feature = this.builder.create(Feature.class);
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        param.getOwnedRelatedElement().add(feature);
│
⋮
│    private void createFeatureChainExpression(FeatureValue container, AttributeUsage attr1, Attribu
│        FeatureChainExpression chainExpression = this.builder.create(FeatureChainExpression.class);
│        container.getOwnedRelatedElement().add(chainExpression);
│
│        ParameterMembership param2 = this.builder.createIn(ParameterMembership.class, chainExpressi
│        Feature feature2 = this.builder.create(Feature.class);
│        param2.getOwnedRelatedElement().add(feature2);
│        this.createFeatureReference(feature2, attr1);
│
│        Membership membership = this.builder.createIn(Membership.class, chainExpression);
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class ConditionalBinaryOperatorExpressionTestModel {
│
│    private final ModelBuilder builder = new ModelBuilder();
│
│    private final PartUsage fuel;
│
│    private final PartUsage diesel;
│
│    private final PartUsage motor;
│
⋮
│    private void conditionalBinaryOperatorExpressionTestModel() {
│        this.binary.setOperator("and");
│
│        ParameterMembership parameterMembership = this.builder.createIn(ParameterMembership.class, 
│        Feature feature = this.builder.create(Feature.class);
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        parameterMembership.getOwnedRelatedElement().add(feature);
│
│        OperatorExpression binary2 = this.builder.create(OperatorExpression.class);
│        binary2.setOperator("==");
⋮
│    private void createFeatureReference(Expression expression, Element memberElement) {
│        ParameterMembership parameterMembership = this.builder.createIn(ParameterMembership.class, 
│        Feature feature = this.builder.create(Feature.class);
│        parameterMembership.getOwnedRelatedElement().add(feature);
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│
│        FeatureReferenceExpression featureReferenceExpression = this.builder.create(FeatureReferenc
│        featureValue.getOwnedRelatedElement().add(featureReferenceExpression);
│        Membership membership = this.builder.createIn(Membership.class, featureReferenceExpression)
│        membership.setMemberElement(memberElement);
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class ConstraintUsageWithOperatorExpressionTestModel {
│
│    private final ModelBuilder builder = new ModelBuilder();
│
│    private final ConstraintUsage constraint;
│
│    private final PartUsage runner;
│
│    private final PartUsage walker;
│
⋮
│    private void constraintUsageWithOperatorExpressionTestModel() {
│        ResultExpressionMembership resultExpressionMembership = this.builder.createIn(ResultExpress
│
│        OperatorExpression expression = this.builder.create(OperatorExpression.class);
│        expression.setOperator("xor");
│        resultExpressionMembership.getOwnedRelatedElement().add(expression);
│
│        ParameterMembership parameterMembership = this.builder.createIn(ParameterMembership.class, 
│
│        Feature feature = this.builder.create(Feature.class);
⋮
│    private void createFeatureReference(Feature feature, Usage attr) {
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        FeatureReferenceExpression featureReferenceExpression = this.builder.create(FeatureReferenc
│        featureValue.getOwnedRelatedElement().add(featureReferenceExpression);
│        Membership membership = this.builder.createIn(Membership.class, featureReferenceExpression)
│        membership.setMemberElement(attr);
⋮
│    private void createNullExpression(Expression expression) {
│        ParameterMembership parameterMembership = this.builder.createIn(ParameterMembership.class, 
│        Feature feature = this.builder.create(Feature.class);
│        parameterMembership.getOwnedRelatedElement().add(feature);
│
│        FeatureValue featureValue = this.builder.createIn(FeatureValue.class, feature);
│        NullExpression nullExpression = this.builder.create(NullExpression.class);
│        featureValue.getOwnedRelatedElement().add(nullExpression);
⋮

backend/services/syson-sysml-metamodel-services/src/test/java/org/eclipse/syson/sysml/metamodel/serv
⋮
│public class IsImplicitTest {
│
│    private final ModelBuilder builder = new ModelBuilder();
│
│    private final ObjectiveMembership objective;
│
│    public IsImplicitTest() {
│        this.objective = this.builder.create(ObjectiveMembership.class);
│        this.isImplicitTest();
│    }
│
⋮
│    private void isImplicitTest() {
│        RequirementUsage requirementUsage = this.builder.create(RequirementUsage.class);
│        requirementUsage.setIsImpliedIncluded(true);
│        this.objective.getOwnedRelatedElement().add(requirementUsage);
│
│        SubjectMembership subjectMembership = this.builder.create(SubjectMembership.class);
│        requirementUsage.getOwnedRelationship().add(subjectMembership);
│
│        ReferenceUsage refUsage1 = this.builder.create(ReferenceUsage.class);
│        refUsage1.setIsImpliedIncluded(true);
⋮
```
