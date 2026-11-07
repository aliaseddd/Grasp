# Repo map: backend/application/syson-application-configuration

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/application/syson-application-configuration`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/application/syson-application-configuration) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 249 files there; aider read the 244 that `syson.aiderignore` leaves in, and the map shows 61 of them, 61 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/conf
⋮
│@Configuration
│public class SysMLv2EMFConfiguration {
│    @Bean
│    ComposedAdapterFactory.Descriptor sysmlAdapterFactory() {
⋮
│    @Bean
│    EPackage sysmlEPackage() {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/conf
⋮
│@Service
│public class SysMLv2RewriteProxiesResourcesFilter implements IRewriteProxiesResourceFilter {
│
│    @Override
│    public boolean shouldRewriteProxies(Resource resource) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/conf
⋮
│@Configuration
│public class SysONDetailsViewJavaServiceProvider implements IJavaServiceProvider {
│
│    @Override
│    public List<Class<?>> getServiceClasses(View view) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/conf
⋮
│@Configuration
│public class SysONLoadDefaultLibrariesOnApplicationStartConfiguration {
│
│    public boolean mustLoadDefaultLibrariesOnStart() {
│        return true;
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/expr
⋮
│@QueryDataFetcher(type = "EditingContext", field = "expressionTextualRepresentation")
│public class EditingContextExpressionTextualRepresentationDataFetcher implements IDataFetcherWithFi
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/expr
⋮
│@MutationDataFetcher(type = "Mutation", field = "deleteExpression")
│public class MutationDeleteExpressionDataFetcher implements IDataFetcherWithFieldCoordinates<Comple
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/expr
⋮
│@Service
│public class ExpressionTextualRepresentationEventHandler implements IEditingContextEventHandler {
│
⋮
│    private Optional<Element> getElement(IEditingContext editingContext, String elementId) {
│        return this.objectSearchService.getObject(editingContext, elementId)
│                .filter(Element.class::isInstance)
│                .map(Element.class::cast);
⋮
│    private FeatureValueExpressionPropertiesPayload getFeatureValueProperties(Optional<Element> opt
│        FeatureValueExpressionPropertiesPayload result = null;
│        if (optionalElement.isPresent()) {
│            Element element = optionalElement.get();
│            Optional<FeatureValue> optionalFeatureValue = Optional.empty();
│            if (element instanceof Expression expression) {
│                optionalFeatureValue = this.getOwningFeatureValue(expression);
│            } else if (element instanceof FeatureValue featureValue) {
│                optionalFeatureValue = Optional.of(featureValue);
│            } else if (this.supportsFeatureValueProperties(element)) {
⋮
│    private Optional<FeatureValue> getOwnedFeatureValue(Element element, Optional<Expression> optio
│        Optional<FeatureValue> result = optionalExpression.flatMap(this::getOwningFeatureValue);
│        if (result.isEmpty() && element instanceof Feature feature) {
│            result = feature.getOwnedRelationship().stream()
│                    .filter(FeatureValue.class::isInstance)
│                    .map(FeatureValue.class::cast)
│                    .findFirst();
│        }
│        return result;
⋮
│    private Optional<FeatureValue> getOwningFeatureValue(Expression expression) {
│        return Optional.ofNullable(expression.getOwningRelationship())
│                .filter(FeatureValue.class::isInstance)
│                .map(FeatureValue.class::cast);
⋮
│    private boolean supportsFeatureValueProperties(Element element) {
│        boolean result = false;
│        if (element instanceof TransitionUsage || element instanceof Succession) {
│            result = false;
│        } else if (element instanceof Function || element instanceof Expression) {
│            result = false;
│        } else {
│            result = element instanceof Feature;
│        }
│        return result;
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
│    private boolean isInheritedNodeDescription(IEditingContext editingContext, IDiagramElementDescr
│        if (diagramElementDescription instanceof NodeDescription nodeDescription) {
│            return this.viewDiagramDescriptionSearchService.findViewNodeDescriptionById(editingCont
│                    .map(org.eclipse.sirius.components.view.diagram.NodeDescription::getName)
│                    .map(descriptionName -> descriptionName.contains(INHERITED_BORDER_NODE_DESCRIPT
│                            || descriptionName.contains(INHERITED_COMPARTMENT_ITEM_DESCRIPTION_NAME
│                    .orElse(false);
│        }
│        return false;
⋮
│    private boolean canHaveNewExpression(IEMFEditingContext editingContext, Element element) {
│        return !this.readOnlyObjectPredicate.test(element) && this.metamodelQueryElementService.can
│                && !this.metamodelQueryElementService.hasSingleExpressionDefinition(element);
⋮
│    private boolean canEditExpression(Element element) {
│        return this.metamodelQueryElementService.isTopLevelExpression(element) || (this.metamodelQu
│                && !this.metamodelQueryElementService.hasSingleExpressionDefinition(element.getOwne
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/inde
⋮
│@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@nestedI
│public interface INestedIndexEntry {
│
⋮
│    @JsonProperty(IIndexEntry.ID_FIELD)
│    String id();
│
│    @JsonProperty(IIndexEntry.TYPE_FIELD)
│    String type();
│
│    @JsonProperty(IIndexEntry.LABEL_FIELD)
│    String label();
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/inde
⋮
│public class IndexEntrySwitch extends SysmlSwitch<Optional<IIndexEntry>> {
│
│    private final IIdentityService identityService;
│
│    private final ILabelService labelService;
│
│    private final IEditingContext editingContext;
│
│    private final NestedIndexEntrySwitch nestedIndexEntrySwitch;
│
⋮
│    @Override
│    public Optional<IIndexEntry> doSwitch(EObject eObject) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/inde
⋮
│public class NestedIndexEntrySwitch extends SysmlSwitch<Optional<INestedIndexEntry>> {
│
│    private final IIdentityService identityService;
│
│    private final ILabelService labelService;
│
│    public NestedIndexEntrySwitch(IIdentityService identityService, ILabelService labelService) {
│        this.identityService = Objects.requireNonNull(identityService);
│        this.labelService = Objects.requireNonNull(labelService);
│    }
│
│    @Override
│    public Optional<INestedIndexEntry> doSwitch(EObject eObject) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/migr
⋮
│public class DiagramOnViewUsageMigrationAdapter implements Adapter {
│
│    private Notifier notifier;
│
│    private final RepresentationMetadata representationMetadata;
│
│    private final RepresentationContent representationContent;
│
│    public DiagramOnViewUsageMigrationAdapter(RepresentationMetadata representationMetadata, Repres
│        this.representationMetadata = Objects.requireNonNull(representationMetadata);
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    public Notifier getTarget() {
⋮
│    @Override
│    public void setTarget(Notifier newTarget) {
⋮
│    @Override
│    public boolean isAdapterForType(Object type) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/migr
⋮
│@Service
│public class DiagramOnViewUsageMigrationParticipant implements IMigrationParticipant {
│
⋮
│    private List<UUID> getDiagramsFromObjectId(String elementId) {
│        var sql = """
│                SELECT representationMetadata.representation_metadata_id
│                FROM representation_metadata representationMetadata
│                WHERE representationMetadata.target_object_id = :targetObjectId
│                """;
│        var diagramsUUIDs = this.jdbcClient.sql(sql)
│                .param("targetObjectId", elementId)
│                .query(UUID.class)
│                .list();
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
│        return false;
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
│public class OneDiagramDescriptionMigrationAdapter implements Adapter {
│
│    private Notifier notifier;
│
│    private final RepresentationMetadata representationMetadata;
│
│    private final RepresentationContent representationContent;
│
│    public OneDiagramDescriptionMigrationAdapter(RepresentationMetadata representationMetadata, Rep
│        this.representationMetadata = Objects.requireNonNull(representationMetadata);
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    public Notifier getTarget() {
⋮
│    @Override
│    public void setTarget(Notifier newTarget) {
⋮
│    @Override
│    public boolean isAdapterForType(Object type) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/migr
⋮
│@Service
│public class OneDiagramDescriptionMigrationParticipant implements IMigrationParticipant {
│
⋮
│    private List<UUID> getDiagramsFromObjectId(String elementId) {
│        var sql = """
│                SELECT representationMetadata.representation_metadata_id
│                FROM representation_metadata representationMetadata
│                WHERE representationMetadata.target_object_id = :targetObjectId
│                """;
│        var diagramsUUIDs = this.jdbcClient.sql(sql)
│                .param("targetObjectId", elementId)
│                .query(UUID.class)
│                .list();
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/migr
⋮
│@Service
│public class StandardLibrariesIdsResourceToMapParser {
│
⋮
│    public Map<String, String> getOldIdToElementIdMap() {
│        return this.oldIdToElementIdMap;
⋮
│    private Map<String, String> resourceToMap(Resource resource) {
│        Instant start = Instant.now();
│        Map<String, String> map = new HashMap<>();
│        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStre
│            String line;
│            while ((line = reader.readLine()) != null) {
│                String[] parts = line.split("=");
│                if (parts.length == 2) {
│                    map.put(parts[0].trim(), parts[1].trim());
│                }
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/migr
⋮
│@Service
│public class StartDoneAndControlNodeMigrationParticipant implements IRepresentationMigrationPartici
│
⋮
│    @Override
│    public void replaceJsonNode(IEditingContext editingContext, ObjectNode root, String currentAttr
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/migr
⋮
│@Service
│public class SysONEditingContextMigrationParticipantPredicate implements IEditingContextMigrationPa
│
│    @Override
│    public boolean test(String editingContextId) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Immutable
│public final class SysMLImportedPackageNodeStyle implements INodeStyle {
│
⋮
│    public String getBackground() {
│        return this.background;
⋮
│    public String getBorderColor() {
│        return this.borderColor;
⋮
│    public int getBorderSize() {
│        return this.borderSize;
⋮
│    public LineStyle getBorderStyle() {
│        return this.borderStyle;
⋮
│    @Override
│    public ILayoutStrategy getChildrenLayoutStrategy() {
⋮
│    @Override
│    public String toString() {
⋮
│    @SuppressWarnings("checkstyle:HiddenField")
│    public static final class Builder {
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Service
│public class SysMLImportedPackageNodeStyleDeserializer implements ICustomNodeStyleDeserializer {
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Immutable
│public final class SysMLNoteNodeStyle implements INodeStyle {
│
⋮
│    public String getBackground() {
│        return this.background;
⋮
│    public String getBorderColor() {
│        return this.borderColor;
⋮
│    public int getBorderSize() {
│        return this.borderSize;
⋮
│    public LineStyle getBorderStyle() {
│        return this.borderStyle;
⋮
│    @Override
│    public ILayoutStrategy getChildrenLayoutStrategy() {
⋮
│    @Override
│    public String toString() {
⋮
│    @SuppressWarnings("checkstyle:HiddenField")
│    public static final class Builder {
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Service
│public class SysMLNoteNodeStyleDeserializer implements ICustomNodeStyleDeserializer {
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Immutable
│public final class SysMLPackageNodeStyle implements INodeStyle {
│
⋮
│    public String getBackground() {
│        return this.background;
⋮
│    public String getBorderColor() {
│        return this.borderColor;
⋮
│    public int getBorderSize() {
│        return this.borderSize;
⋮
│    public LineStyle getBorderStyle() {
│        return this.borderStyle;
⋮
│    @Override
│    public ILayoutStrategy getChildrenLayoutStrategy() {
⋮
│    @Override
│    public String toString() {
⋮
│    @SuppressWarnings("checkstyle:HiddenField")
│    public static final class Builder {
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Service
│public class SysMLPackageNodeStyleDeserializer implements ICustomNodeStyleDeserializer {
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Immutable
│public final class SysMLViewFrameNodeStyle implements INodeStyle {
│
⋮
│    public String getBackground() {
│        return this.background;
⋮
│    public String getBorderColor() {
│        return this.borderColor;
⋮
│    public int getBorderSize() {
│        return this.borderSize;
⋮
│    public LineStyle getBorderStyle() {
│        return this.borderStyle;
⋮
│    public int getBorderRadius() {
│        return this.borderRadius;
⋮
│    @Override
│    public ILayoutStrategy getChildrenLayoutStrategy() {
⋮
│    @Override
│    public String toString() {
⋮
│    @SuppressWarnings("checkstyle:HiddenField")
│    public static final class Builder {
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@Service
│public class SysMLViewFrameNodeStyleDeserializer implements ICustomNodeStyleDeserializer {
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@MutationDataFetcher(type = "Mutation", field = "editSysMLImportedPackageNodeAppearance")
│public class MutationEditSysMLImportedPackageNodeAppearanceDataFetcher implements IDataFetcherWithF
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@MutationDataFetcher(type = "Mutation", field = "editSysMLNoteNodeAppearance")
│public class MutationEditSysMLNoteNodeAppearanceDataFetcher implements IDataFetcherWithFieldCoordin
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@MutationDataFetcher(type = "Mutation", field = "editSysMLPackageNodeAppearance")
│public class MutationEditSysMLPackageNodeAppearanceDataFetcher implements IDataFetcherWithFieldCoor
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/node
⋮
│@MutationDataFetcher(type = "Mutation", field = "editSysMLViewFrameNodeAppearance")
│public class MutationEditSysMLViewFrameNodeAppearanceDataFetcher implements IDataFetcherWithFieldCo
│
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

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/omni
⋮
│@Service
│public class PredicateCanEditingContextPublishSysMLProject implements IPredicateCanEditingContextPu
│
⋮
│    @Override
│    public boolean test(final String editingContextId) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/omni
⋮
│public interface IPredicateCanEditingContextPublishSysMLProject extends Predicate<String> {
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/publ
⋮
│@Service
│public class SysONLibraryDependencyCollector implements ISysONLibraryDependencyCollector {
│
│    @Override
│    public DependencyGraph<Resource> collectDependencies(ResourceSet resourceSet) {
⋮
│    private boolean isLibrary(Resource resource) {
│        return resource.eAdapters().stream()
│                .anyMatch(LibraryMetadataAdapter.class::isInstance);
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/publ
⋮
│public interface ISysMLLibraryPublisher {
│    IPayload publish(ICause cause, IEditingContext libraryAuthoringEditingContext, String libraryNa
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/publ
⋮
│public interface ISysONLibraryDependencyCollector {
│
│    DependencyGraph<Resource> collectDependencies(ResourceSet resourceSet);
│
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/serv
⋮
│public class GetChildCreationSwitch extends SysmlEClassSwitch<List<EClass>> {
│
│    @Override
│    public List<EClass> defaultCase(EObject object) {
│        return List.of();
│    }
│
│    @Override
│    public List<EClass> caseActionUsage(ActionUsage object) {
│        List<EClass> childrenCandidates = new ArrayList<>();
⋮
│    @Override
│    public List<EClass> caseUsage(Usage object) {
⋮
│    private List<EClass> getPackageChildren() {
│        List<EClass> childrenCandidates = new ArrayList<>();
│        SysmlPackage.eINSTANCE.getEClassifiers().stream()
│                .filter(EClass.class::isInstance)
│                .map(EClass.class::cast)
│                .filter(eClass -> {
│                    boolean authorizedClasses = SysmlPackage.eINSTANCE.getDefinition().isSuperTypeO
│                            || SysmlPackage.eINSTANCE.getUsage().isSuperTypeOf(eClass)
│                            || SysmlPackage.eINSTANCE.getImport().isSuperTypeOf(eClass)
│                            || SysmlPackage.eINSTANCE.getPackage().isSuperTypeOf(eClass);
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/serv
⋮
│@Service
│public class ImagePathService implements IImagePathService {
│
⋮
│    @Override
│    public List<String> getPaths() {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/serv
⋮
│@Service
│public class StandardLibrariesLoader implements IStandardLibrariesLoader {
│
⋮
│    @Override
│    public void loadStandardLibraries(ResourceSet targetResourceSet) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/serv
⋮
│@Service
│public class SysMLv2LabelService implements ILabelServiceDelegate {
│
⋮
│    @Override
│    public StyledString getStyledLabel(Object object) {
⋮
│    @Override
│    public List<String> getImagePaths(Object object) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/serv
⋮
│@Service
│public class SysONIdentityService implements IIdentityServiceDelegate {
│
⋮
│    @Override
│    public String getId(Object object) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/serv
⋮
│public class SysONJsonResourceProcessor implements JsonResource.IJsonResourceProcessor {
│
│    private final JsonResource.IJsonResourceProcessor delegate;
│
│    /**
│     * Creates a new processor.
│     *
│     * @param delegate
│     *            the processor to invoke before SysON-specific behavior
│     */
⋮
│    @Override
│    public Object getValue(JsonResource resource, EObject eObject, EStructuralFeature feature, Obje
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/serv
⋮
│@Service
│public class SysONReadOnlyObjectPredicateDelegate implements IReadOnlyObjectPredicateDelegate {
│
⋮
│    @Override
│    public boolean test(Object candidate) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/serv
⋮
│@Service
│public class SysONResourceService implements ISysONResourceService {
│
⋮
│    @Override
│    public boolean isImported(final IEditingContext editingContext, final Resource resource) {
⋮
│    @Override
│    public boolean isFromReferencedLibrary(final IEditingContext editingContext, final Resource res
⋮
│    private boolean isLibrary(LibraryMetadataAdapter libraryMetadataAdapter, Library library) {
│        return Objects.equals(libraryMetadataAdapter.getNamespace(), library.getNamespace())
│                && Objects.equals(libraryMetadataAdapter.getName(), library.getName())
│                && Objects.equals(libraryMetadataAdapter.getVersion(), library.getVersion());
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/serv
⋮
│public interface IStandardLibrariesLoader {
│
│    void loadStandardLibraries(ResourceSet targetResourceSet);
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/serv
⋮
│@Service
│public class IsCompositeIsReferenceDetailViewHelpTextProvider implements IDetailsViewHelpTextProvid
⋮
│    @Override
│    public String getHelpText(Element element, EStructuralFeature eStructuralFeature) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/sysm
⋮
│@Service
│public class SysMLv2EditingContextActionProvider implements IEditingContextActionProvider {
│
⋮
│    @Override
│    public List<EditingContextAction> getEditingContextAction(IEditingContext editingContext) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/sysm
⋮
│@Service
│public class SysMLv2ProjectTemplatesProvider implements IProjectTemplateProvider {
│
⋮
│    @Override
│    public List<ProjectTemplate> getProjectTemplates() {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/sysm
⋮
│@Service
│public class SysMLv2StereotypeProvider implements IStereotypeProvider {
│
⋮
│    @Override
│    public List<Stereotype> getStereotypes(IEditingContext editingContext) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/sysm
⋮
│@Service
│public class SysMLv2TemplatesRepresentationInitializer {
│
⋮
│    private Optional<ViewUsage> getViewUsage(Element element) {
│        return element.getOwnedElement().stream()
│                .filter(ViewUsage.class::isInstance)
│                .map(ViewUsage.class::cast)
│                .filter(vu -> Objects.equals(vu.getDeclaredName(), "view1"))
│                .findFirst();
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/sysm
⋮
│@Service
│public class SysONDefaultResourceProvider implements IDefaultSysMLv2ResourceProvider {
│
⋮
│    @Override
│    public Resource getEmptyResource(UUID resourcePath, String name) {
⋮
│    @Override
│    public Resource getDefaultSysMLv2Resource(UUID resourcePath, String name) {
⋮
│    @Override
│    public Resource getDefaultSysMLv2LibraryResource(UUID resourcePath, String name) {
⋮

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/sysm
⋮
│public interface IDefaultSysMLv2ResourceProvider {
│    Resource getEmptyResource(UUID resourcePath, String name);
│
│    Resource getDefaultSysMLv2Resource(UUID resourcePath, String name);
│
│    Resource getDefaultSysMLv2LibraryResource(UUID resourcePath, String name);
│
│    void loadBatmobileResource(Resource resource);
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

backend/application/syson-application-configuration/src/main/java/org/eclipse/syson/application/view
⋮
│@Service
│public class SysONViewsExplorerLabelServiceDelegate implements IViewsExplorerLabelServiceDelegate {
│
⋮
│    @Override
│    public StyledString getLabel(Object self) {
⋮

backend/application/syson-application-configuration/src/test/java/org/eclipse/syson/application/conf
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_APPLICATION_CONFIGURATION_ROOT_PACKAGE = "org.eclipse.syson.ap
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_APPLICATION_CONFIGURATION_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/application/syson-application-configuration/src/test/java/org/eclipse/syson/application/conf
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_APPLICATION_CONFIGURATION_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮

backend/application/syson-application-configuration/src/test/java/org/eclipse/syson/application/conf
⋮
│public class SysONLibraryLoadingDefinitionTest {
│
│    private static final String VALID_FAMILY_NAME = "TestLibrary";
│    private static final String VALID_SCHEME = "test";
│    private static final String VALID_RELATIVE_PATH = "name/library";
│    private static final List<String> VALID_EXTENSIONS = List.of("json", "xml");
│    private static final Function<URI, Resource> VALID_LOADING_BEHAVIOR = mock(Function.class);
│
│    @Test
│    void testValidDefinition() {
⋮
│    @Test
│    void testAbsolutePath() {
⋮
│    @Test
│    void testWindowsSeparators() {
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

backend/application/syson-application-configuration/src/test/java/org/eclipse/syson/application/serv
⋮
│public class SysONResourceServiceTests {
│
│    private final IEditingContext editingContext = new MockEditingContext();
│
│    private final ILibrarySearchService librarySearchService = new MockLibrarySearchService();
│
│    private final ISysONResourceService sysONResourceService = new SysONResourceService(this.librar
│
│    private Resource emptyResource;
│
⋮
│    private static final class MockEditingContext implements IEditingContext {
│
│        @Override
│        public String getId() {
│            return UUID.nameUUIDFromBytes("mockEditingContext".getBytes()).toString();
│        }
│
⋮
```
