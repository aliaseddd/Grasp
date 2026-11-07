# Repo map: backend/services/syson-sysml-rest-api-services

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/services/syson-sysml-rest-api-services`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/services/syson-sysml-rest-api-services) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 19 files there; aider read the 19 that `syson.aiderignore` leaves in, and the map shows 19 of them, 6 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/services/syson-sysml-rest-api-services/.checkstyle

backend/services/syson-sysml-rest-api-services/.classpath

backend/services/syson-sysml-rest-api-services/.project

backend/services/syson-sysml-rest-api-services/.settings/org.eclipse.core.resources.prefs

backend/services/syson-sysml-rest-api-services/.settings/org.eclipse.core.runtime.prefs

backend/services/syson-sysml-rest-api-services/.settings/org.eclipse.jdt.apt.core.prefs

backend/services/syson-sysml-rest-api-services/.settings/org.eclipse.jdt.core.prefs

backend/services/syson-sysml-rest-api-services/.settings/org.eclipse.jdt.ui.prefs

backend/services/syson-sysml-rest-api-services/.settings/org.eclipse.m2e.core.prefs

backend/services/syson-sysml-rest-api-services/.settings/org.springframework.ide.eclipse.boot.prefs

backend/services/syson-sysml-rest-api-services/.settings/org.springframework.ide.eclipse.prefs

backend/services/syson-sysml-rest-api-services/pom.xml

backend/services/syson-sysml-rest-api-services/src/main/java/org/eclipse/syson/sysml/rest/api/SysMLv
⋮
│public class SysMLv2JsonSerializer extends ValueSerializer<EObject> {
│
│    private static final String ID = "@id";
│
│    private final EObjectIDManager eObjectIDManager = new EObjectIDManager();
│
│    @Override
│    public void serialize(EObject value, JsonGenerator gen, SerializationContext provider) throws J
│        gen.writeStartObject();
│        Optional<String> id = Optional.empty();
⋮
│    private void serializeAttribute(EObject value, JsonGenerator gen, EAttribute eAttribute) throws
│        Object objectValue = value.eGet(eAttribute);
│        if (objectValue != null) {
│            // The writeObjectField does not handle enum values properly, as it generates the value
│            // letters instead of lowercase.
│            if (objectValue instanceof Enumerator enumerator) {
│                objectValue = enumerator.getLiteral();
│            }
│            gen.writePOJOProperty(eAttribute.getName(), objectValue);
│        } else {
⋮
│    private void serializeReference(EObject value, JsonGenerator gen, EReference eReference) throws
│        Object objectValue = value.eGet(eReference);
│        if (EcorePackage.eINSTANCE.getEModelElement_EAnnotations().equals(eReference)) {
│            // nothing to do, the eAnnotations reference is not coming from SysMLv2
│        } else if (objectValue != null) {
│            if (eReference.isMany()) {
│                this.writeArray(gen, eReference.getName(), objectValue);
│            } else if (objectValue instanceof Element elt && !VirtualLinkAdapter.hasVirtualLink(elt
│                // !VirtualLinkAdapter.hasVirtualLink(elt) allows to not serialize implicit element
│                var refElementId = elt.getElementId();
⋮
│    private void writeArray(JsonGenerator gen, String arrayName, Object objectValue) throws Jackson
│        gen.writeArrayPropertyStart(arrayName);
│        if (objectValue instanceof List<?> listValue && !listValue.isEmpty()) {
│            for (Object listElementValue : listValue) {
│                // !ElementUtil.isFromStandardLibrary(elt) to avoid serializing all inherited eleme
│                // libraries.
│                // We don't know yet what to do about that case and allowing serialization of such 
│                // huge amount of data.
│                // The drawback of this approach is when an object references a standard library el
│                // inherited, it won't be serialized.
⋮

backend/services/syson-sysml-rest-api-services/src/main/java/org/eclipse/syson/sysml/rest/api/SysMLv
⋮
│@Hidden
│@ControllerAdvice("org.eclipse.sirius.web.application.object.controllers")
│public class SysMLv2SerializerConfig implements ResponseBodyAdvice<Object> {
│
⋮
│    @Override
│    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> co
⋮
│    @Override
│    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedConten
⋮
│    public ObjectMapper getCustomObjectMapper() {
│        return this.customObjectMapper;
⋮

backend/services/syson-sysml-rest-api-services/src/main/java/org/eclipse/syson/sysml/rest/api/SysONO
⋮
│@Service
│public class SysONObjectRestService implements IObjectRestServiceDelegate {
│
⋮
│    @Override
│    public boolean canHandle(IEditingContext editingContext) {
⋮
│    @Override
│    public List<Object> getElements(IEditingContext editingContext) {
⋮
│    @Override
│    public Optional<Object> getElementById(IEditingContext editingContext, String elementId) {
⋮
│    @Override
│    public List<Object> getRelationshipsByRelatedElement(IEditingContext editingContext, String ele
⋮
│    @Override
│    public List<Object> getRootElements(IEditingContext editingContext) {
⋮
│    private Set<Object> getIngoingRelationships(Element elt) {
│        Set<Object> ingoingRelationships = new HashSet<>();
│        var referenceAdapter = ECrossReferenceAdapter.getCrossReferenceAdapter(elt);
│        if (referenceAdapter != null) {
│            Collection<Setting> inverseReferences = referenceAdapter.getInverseReferences(elt);
│            for (Setting setting : inverseReferences) {
│                EObject relatedElement = setting.getEObject();
│                if (relatedElement instanceof Relationship) {
│                    ingoingRelationships.add(relatedElement);
│                }
⋮

backend/services/syson-sysml-rest-api-services/src/main/java/org/eclipse/syson/sysml/rest/api/SysONP
⋮
│@Service
│public class SysONProjectDataVersioningRestService implements IProjectDataVersioningRestServiceDele
│
⋮
│    @Override
│    public boolean canHandle(IEditingContext editingContext) {
⋮
│    @Override
│    public List<RestCommit> getCommits(IEditingContext editingContext) {
⋮
│    @Override
│    public RestCommit createCommit(IEditingContext editingContext, Optional<UUID> branchId, List<Re
⋮
│    @Override
│    public RestCommit getCommitById(IEditingContext editingContext, UUID commitId) {
⋮
│    @Override
│    public List<RestDataVersion> getCommitChange(IEditingContext editingContext, UUID commitId, Lis
⋮
│    @Override
│    public RestDataVersion getCommitChangeById(IEditingContext editingContext, UUID commitId, UUID 
⋮
│    @Override
│    public List<RestBranch> getBranches(IEditingContext editingContext) {
⋮
│    @Override
│    public RestBranch createBranch(IEditingContext editingContext, String branchName, UUID commitId
⋮
│    @Override
│    public RestBranch getBranchById(IEditingContext editingContext, UUID branchId) {
⋮
│    @Override
│    public RestBranch deleteBranch(IEditingContext editingContext, UUID branchId) {
⋮
│    protected Optional<String> getProjectId(String editingContextId) {
│        return new UUIDParser().parse(editingContextId)
│                .flatMap(semanticDataId -> this.projectSemanticDataSearchService.findBySemanticData
│                .map(ProjectSemanticData::getProject)
│                .map(AggregateReference::getId);
⋮

backend/services/syson-sysml-rest-api-services/src/main/resources/.gitkeep

backend/services/syson-sysml-rest-api-services/src/test/java/org/eclipse/syson/sysml/rest/api/Archit
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_SYSML_REST_API_ROOT_PACKAGE = "org.eclipse.syson.sysml.rest.ap
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_SYSML_REST_API_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/services/syson-sysml-rest-api-services/src/test/java/org/eclipse/syson/sysml/rest/api/Coding
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_SYSML_REST_API_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮
```
