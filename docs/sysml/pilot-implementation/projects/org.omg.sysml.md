# Repo map: org.omg.sysml

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 76 files there; aider read the 76 that `pilot.aiderignore` leaves in, and the map shows 20 of them, 20 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml/build.properties:
⋮
│bin.includes = .,\
│               model/,\
│               META-INF/,\
│               plugin.xml,\
│               plugin.properties,\
│               lib/
│jars.compile.order = .
│source.. = xtend-gen,\
│           src,
│output.. = target/classes

org.omg.sysml/plugin.properties:
⋮
│pluginName = SysML
│providerName = 

org.omg.sysml/src/org/omg/sysml/io/SysMLUtil.java:
⋮
│public abstract class SysMLUtil {
│
│       private final ResourceSet resourceSet;
│       private final List<Resource> inputResources = new LinkedList<>();
│       private final List<String> extensions = new ArrayList<String>();
│       private final ResourceDescriptionsData index;
│       
│       private boolean isVerbose = true;
│       
│       protected SysMLUtil() {
⋮
│       protected void addExtension(String extension) {
│               this.extensions.add(extension);
⋮
│       protected void println(String line) {
│               if (isVerbose) {
│                       System.out.println(line);
│               }
⋮
│    public ResourceSet getResourceSet() {
│        return resourceSet;
⋮
│       public void addResourceToIndex(Resource resource) {
│               URI uri = resource.getURI();
│               IResourceServiceProvider resourceServiceProvider = IResourceServiceProvider.Registry.INSTANCE.get
│               Manager manager = resourceServiceProvider.getResourceDescriptionManager();
│               this.index.addDescription(uri, manager.getResourceDescription(resource));
⋮
│       public boolean isVerbose() {
│               return this.isVerbose;
⋮
│       public boolean isInputResource(Resource resource) {
│               return inputResources.contains(resource);
⋮
│       public void addInputResource(Resource resource) {
│               if (resource.getResourceSet() == this.resourceSet) {
│                       this.inputResources.add(resource);
│               }
⋮
│       public Resource createResource(final String path) {
│               final Resource resource = this.resourceSet.createResource(URI.createFileURI(path));
│               if (resource == null) {
│                       throw new RuntimeException("Error creating resource: " + path);
│               } else {
│                       return resource;
│               }
⋮
│       public Resource getResource(final String path) {
│           URI uri = URI.createFileURI(path);
│               final Resource resource = this.resourceSet.getResource(uri, true);
│               if (resource == null) {
│                       throw new RuntimeException("Error opening resource: " + path);
│               } else {
│                       this.addResourceToIndex(resource);
│                       return resource;
│               }
⋮
│       public Resource readResource(final String path) {
│               println("Reading " + path + "...");
│               return this.getResource(path);
⋮
│       public void readAll(final File file, boolean isInput) {
│               if (file.isDirectory()) {
│                       for (File nestedFile: file.listFiles()) {
│                               this.readAll(nestedFile,  isInput);
│                       }
│               } else {
│                       final String path = file.getPath();
│                       if (extensions.stream().anyMatch(path::endsWith)) {
│                               Resource resource = this.readResource(file.getPath());
│                               if (isInput) {
⋮
│       public void readAll(final String path, boolean isInput) {
│               this.readAll(new File(path), isInput);
⋮
│       public void readAll(final String path, boolean isInput, String extension) {
│               this.extensions.clear();
│               this.addExtension(extension);
│               this.readAll(new File(path), isInput);
⋮
│       public void transformAll(boolean isAddImplicitElements) {
│               for (Resource resource: this.resourceSet.getResources()) {
│                       ElementUtil.transformAll(resource,
│                                       isAddImplicitElements && this.isInputResource(resource));
│               }
⋮

org.omg.sysml/src/org/omg/sysml/lang/sysml/util/ISysMLScope.java:
⋮
│public interface ISysMLScope extends IScope {
│       Element getElement(String name);
⋮

org.omg.sysml/src/org/omg/sysml/qvt/QVTRunner.java:
⋮
│public class QVTRunner {
│       
│       protected final ResourceSet resourceSet = new ResourceSetImpl();
│       protected final List<EList<EObject>> inputContents = new ArrayList<EList<EObject>>();
│       protected final EList<EObject> outputContents = new BasicEList<EObject>();
│       protected final ExecutionContextImpl context = new ExecutionContextImpl();
│       
│       public QVTRunner() {
│               this.initialize();
│       }
│       
⋮
│       public void setConfigProperty(String name, Object value) {
│               this.context.setConfigProperty(name, value);
⋮
│       public Resource createResource(final String path) {
│               Resource resource = this.resourceSet.createResource(URI.createFileURI(path));
│               if (resource == null) {
│                       throw new RuntimeException("Error creating resource: " + path);
│               } else {
│                       return resource;
│               }
⋮
│       public Resource getResource(final String path) {
│           final Resource resource = this.createResource(path);
│               if (resource != null) {
│                       try {
│                               resource.load(null);
│                               return resource;
│                       } catch (IOException e) {
│                               e.printStackTrace();
│                       }
│               }
⋮
│       public void addInput(final EList<EObject> inputObjects) {
│               this.inputContents.add(inputObjects);
⋮
│       public void addInput(final Resource resource) {
│               if (resource != null) {
│                       this.addInput(resource.getContents());
│               }
⋮
│       public void addInput(final String path) {
│               this.addInput(this.getResource(path));
⋮
│       protected EList<EObject> getAllContents(final Path directoryPath) throws IOException {
│               final DirectoryStream<Path> directory = Files.newDirectoryStream(directoryPath);
│               final EList<EObject> allContents = new BasicEList<EObject>();
│               for (Path input: directory) {
│                       if (Files.isDirectory(input)) {
│                               try {
│                                       allContents.addAll(this.getAllContents(input));
│                               } catch (Exception e) {
│                                       System.out.println(e);
│                               }
⋮
│       public void addInputDirectory(final Path directoryPath) throws IOException {
│               this.addInput(this.getAllContents(directoryPath));
⋮
│       public void addInputDirectory(final String directoryPath) throws IOException {
│               this.addInputDirectory(Paths.get(directoryPath));
⋮
│       public EList<EObject> getOutput() {
│               return this.outputContents;
⋮
│       public void saveOutput(final Resource resource) throws Exception {
│               save(resource, this.getOutput());
⋮
│       public void saveOutput(final String path) throws Exception {
│               this.saveOutput(this.createResource(path));
⋮
│       protected ModelExtent[] createExtents(List<EList<EObject>> inputContents) {
│               final ModelExtent[] extents = new ModelExtent[inputContents.size() + 1];
│               for (int i = 0; i < extents.length - 1; i++) {
│                       extents[i] = new BasicModelExtent(inputContents.get(i));
│               }
│               extents[extents.length-1] = new BasicModelExtent();
│               return extents;
⋮
│       protected void readInput(final String... resourcePaths) throws Exception {
│               readInput(resourcePaths, 1, resourcePaths.length - 1);
⋮
│       protected void readInput(final String[] resourcePaths, int first, int last) throws Exception {
│               for (int i = first; i < last; i++) {
│                       System.out.println("Input: " + resourcePaths[i]);
│                       if (!Files.isDirectory(Paths.get(resourcePaths[i]))) {
│                               this.addInput(resourcePaths[i]);
│                       } else {
│                               this.addInputDirectory(resourcePaths[i]);
│                       }
│               }
⋮
│       protected void writeOutput(final String... resourcePaths) throws Exception {
│               final String outputPath = this.constructOutputPath(resourcePaths);
│               if (outputPath == null || outputPath.equals("")) {
│                       System.out.println("Output...");
│               } else {
│                       System.out.println("Output: " + outputPath);
│               }
│               this.saveOutput(outputPath);
│               System.out.println("Done.");
⋮
│       protected String constructOutputPath(final String...resourcePaths) {
│               return resourcePaths[resourcePaths.length - 1];
⋮
│       public String[] processArgs(String[] args) {
│               if (args.length > 0 && args[0].equals("-l")) {
│                       System.out.println("Log: " + args[1]);
│                       this.setLog(args[1]);
│                       args = Arrays.copyOfRange(args, 2, args.length);
│               }
│               return args;
⋮

org.omg.sysml/src/org/omg/sysml/util/repository/APIModel.java:
⋮
│public class APIModel {
│       private Map<UUID, Element> modelElements = new HashMap<>();
│       private Map<UUID, Element> modelRoots = new HashMap<>();
│       
│       public APIModel(Map<UUID, Element> modelElements, Map<UUID, Element> modelRoots) {
│               this.modelElements = modelElements;
│               this.modelRoots = modelRoots;
│       }
│       
│       /**
⋮
│       public Map<UUID, Element> getModelElements() {
│               return Collections.unmodifiableMap(modelElements);
⋮
│       public Map<UUID, Element> getModelRoots() {
│               return Collections.unmodifiableMap(modelRoots);
⋮
│        public void addModelRoot(UUID id, Element rootElement) {
│               for (var key: rootElement.keySet()) {
│                       if (key.equals("owner") || key.startsWith("owning")) {
│                               rootElement.replace(key, null);
│                       }
│               }
│               modelRoots.put(id, rootElement);
│               modelElements.put(id, rootElement);
⋮
│       public void addModelElement(UUID id, Element modelElement) {
│               modelElements.put(id, modelElement);
⋮
│       public static APIModel createEmpty() {
│               return new APIModel(new HashMap<>(), new HashMap<>());
⋮
│       public Element getElement(UUID uuid) {
│               return modelElements.get(uuid);
⋮
│       public Element getElement(String uuid) {
│               return modelElements.get(UUID.fromString(uuid));
⋮
│       public JsonElement toJsonTree(Gson gson) {
│               return gson.toJsonTree(getModelElements().values());
⋮
│       @SuppressWarnings("serial")
│       public static class LocalReference extends HashMap<String, UUID> {
│               
⋮
│               public boolean isLibraryElement() {
│                       return isLibraryElement;
⋮
│               @Override
│               public boolean equals(Object o) {
⋮
│               @Override
│               public int hashCode() {
⋮
│               private boolean idEquals(Map<?,?> other) {
│                       UUID id = this.get(ProjectRepository.ID_FIELD);
│                       Object otherid = other.get(ProjectRepository.ID_FIELD);
│                       if (otherid instanceof String idAsString) {
│                               return UUID.fromString(idAsString).equals(id);
│                       } else if (otherid instanceof UUID idAsUUID) {
│                               return idAsUUID.equals(id);
│                       }
│                       return false;
⋮

org.omg.sysml/src/org/omg/sysml/util/repository/APIModelDelta.java:
⋮
│public class APIModelDelta {
│       
│       private final Collection<Element> additions;
│       private final Map<UUID, ChangedElement> changes;
│       private final Collection<UUID> deletions;
│
│       private APIModelDelta(Set<Element> additions, Map<UUID, ChangedElement> changes, Set<UUID> deletio
│               this.additions = Collections.unmodifiableCollection(additions);
│               this.changes = Collections.unmodifiableMap(changes);
│               this.deletions = Collections.unmodifiableCollection(deletions);
⋮
│       public Collection<Element> getAdditions() {
│               return additions;
⋮
│       public Collection<UUID> getDeletions() {
│               return deletions;
⋮
│       public List<DataVersion> toTransferableDelta() {
│               List<DataVersion> delta = new LinkedList<>();
│               
│               for (Element addition: getAdditions()) {
│                       Data data = new Data();
│                       for (String field: addition.keySet()) {
│                               Object value = addition.get(field);
│                               data.put(field, value);
│                       }
│                       UUID id = UUID.fromString(addition.get(Identified.SERIALIZED_NAME_AT_ID).toString());
⋮
│       public JsonElement toJsonTree(Gson gson) {
│               return gson.toJsonTree(toTransferableDelta());
⋮
│       public static ChangedElement createElementDelta(Element currentElement, Element baselineElement) {
│               ChangedElement change = null;
│               Set<String> fieldsInThis = currentElement.keySet();
│               for (String field: fieldsInThis) {
│                       Object currentValue = currentElement.get(field);
│                       Object baselineValue = baselineElement.get(field);
│                       if (!Objects.equal(currentValue, baselineValue)) {
│                               if (change == null) change = new ChangedElement(baselineElement);
│                               change.add(field, currentValue);
│                       }
⋮
│       private static class ChangedElement {
│               private Element baselineElement;
│               private Map<String, Object> changes = new HashMap<>();
│               
│               public ChangedElement(Element baselineElement) {
│                       this.baselineElement = baselineElement;
│               }
│               
│               public void add(String field, Object thisValue) {
│                       changes.put(field, thisValue);
⋮

org.omg.sysml/src/org/omg/sysml/util/repository/EMFModelDelta.java:
⋮
│public class EMFModelDelta {
│       private static final String NAME_PROPERTY = "declaredName";
│       private static final String EXTENSION = "sysmlx";
│       
│       private final Map<EObject, Element> projectRoots;
│       
│       public EMFModelDelta(Map<EObject, Element> projectRoots) {
│               this.projectRoots = projectRoots;
│       }
│       
⋮
│       private EObject wrapInNamespaceIfNotNamespace(EObject eObject) {
│               if (eObject.eClass() == SysMLPackage.eINSTANCE.getNamespace()) {
│                       return eObject;
│               } else {
│                       Namespace root = SysMLFactory.eINSTANCE.createNamespace();
│                       NamespaceUtil.addOwnedMemberTo(root, (org.omg.sysml.lang.sysml.Element) eObject);
│                       return root;
│               }
⋮

org.omg.sysml/src/org/omg/sysml/util/repository/EMFModelRefresher.java:
⋮
│public class EMFModelRefresher {
│       
│       private final EObjectUUIDTracker tracker;
│       private final APIModel model;
│       
│       private static Set<String> disabledStructuralFeatures = Set.of("importedMembership");
│       
│       
│       private final List<Issue> issues = new LinkedList<>();
│       
⋮
│       private void setImportedMembership(EObject langElement, Element dto) {
│               if (langElement instanceof MembershipImport membershipImport) {
│                       //use imported elements derived field instead of the importedMember feature reference.
│                       //this is a workaround to address library element proxies where UUIDs of referenced Memberships 
│                       //so the importedElement UUID is used instead.
│                       Object importedMembers = dto.get("importedElement");
│                       resolveReference(importedMembers, false).ifPresent(resolvedReference -> {
│                               membershipImport.setImportedMembership(((org.omg.sysml.lang.sysml.Element) resolvedReference).g
│                       });
│               }
⋮
│       private boolean isNotStandardLibraryElement(EObject langElement) {
│               return !ElementUtil.isStandardLibraryElement((org.omg.sysml.lang.sysml.Element) langElement);
⋮
│       private static Collection<EStructuralFeature> getStructuralFeatures(EObject langElement){
│               EClass eClass = langElement.eClass();
│               
│               Set<EObject> allRedefined = eClass.getEAllStructuralFeatures().stream()
│                               .map(f -> f.getEAnnotation("redefines")).filter(Objects::nonNull)
│                               .flatMap(a -> a.getReferences().stream()).collect(Collectors.toSet());
│               
│               return eClass.getEAllStructuralFeatures().stream().filter(f -> !allRedefined.contains(f)).collect
⋮
│       private void transformStructuralFeature(EObject langElement,  Element remoteElement, EStructuralFe
│               
│               if (disabledStructuralFeatures.contains(feature.getName())) {
│                       return;
│               }
│               
│               try {
│                       if (feature.isMany()) {
│                               Object value = remoteElement.get(feature.getName());
│                               transformAndAddFeatureValues(langElement, feature, isReference, isContainment, value);
⋮
│       private Optional<EObject> resolveReference(Object referenceValue, boolean isContainment) {
│               if (referenceValue instanceof Map referenceObjectMap) {
│                       Object refUUID = referenceObjectMap.get("@id");
│                       Element referencedElement = model.getElement(UUID.fromString(refUUID.toString()));
│                       EObject referencedLangElement = isContainment? transform(referencedElement) : tracker.get(UUID.f
│                       return Optional.ofNullable(referencedLangElement);
│               }
│               return Optional.empty();                
⋮
│       public static class Issue {
│               private final String message;
│
│               public Issue(String message) {
│                       this.message = message;
│               }
│               
│               public String getMessage() {
│                       return message;
│               }
⋮

org.omg.sysml/src/org/omg/sysml/util/repository/EObjectUUIDTracker.java:
⋮
│public class EObjectUUIDTracker {
│       private Map<UUID, EObject> uuidToLibraryElement = new HashMap<>();
│       private Map<UUID, EObject> uuidToLocalElements = new HashMap<>();
│       
│       /**
│        * Collects UUIDs from the given library resources
│        * 
│        * @param libraryResources resources containing (local) standard library models
│        */
│       public void trackLibraryUUIDs(Collection<Resource> libraryResources) {
⋮
│       private void trackUUIDSFromResources(Collection<Resource> resources,  Map<UUID, EObject> uuidToEle
│               //avoid concurrent modification exception in the traversal by transforming the library
│               for (Resource resource: resources) {
│                       if (resource instanceof XtextResource) {
│                               ElementUtil.transformAll(resource, false);
│                       }
│               }
│               
│               ElementIdProcessingFacade idProcessingFacade = new ElementIdProcessingFacade(uuidToLibraryElement
│               var traversal = new Traversal(idProcessingFacade, true);
│               
⋮
│       public EObject get(UUID uuid) {
│               if (uuidToLibraryElement.containsKey(uuid)) {
│                       return uuidToLibraryElement.get(uuid);
│               } else {
│                       return uuidToLocalElements.get(uuid);
│               }
⋮
│       public void forEachTrackedLocalElement(BiConsumer<? super UUID, ? super EObject> consumer) {
│               uuidToLocalElements.forEach(consumer);
⋮
│       public void clear() {
│               uuidToLocalElements.clear();
⋮

org.omg.sysml/src/org/omg/sysml/util/repository/ProjectRepository.java:
⋮
│public class ProjectRepository {
│       
│       public static final String ID_FIELD = Identified.SERIALIZED_NAME_AT_ID;
│       
│       private final String repositoryURL;
│       
│       private final ApiClient apiClient = new ApiClient();
│       private final ProjectApi projectApi = new ProjectApi(apiClient);
│       private final BranchApi branchApi = new BranchApi(apiClient);
│       private final CommitApi commitApi = new CommitApi(apiClient);
⋮
│       class PagerInterceptor implements Interceptor {
│               
│               private String nextCursor = null;
│               
│               @Override
│               public Response intercept(Chain chain) throws IOException {
│                       Response response = chain.proceed(chain.request());
│                       
│                       String link = response.header("link");
│                       if (link == null) {
⋮
│               public void reset() {
│                       nextCursor = null;
⋮
│               public String next() {
│                       return nextCursor;
⋮
│               public boolean hasNext() {
│                       return nextCursor != null;
⋮
│       public List<RemoteProject> getProjects() {
│               try {
│                       List<Project> projects = new LinkedList<>();
│                       pager.reset();
│                       
│                       do {
│                               projects.addAll(getProjectApi().getProjects(pager.next(), null, null));
│                       } while (pager.hasNext());
│                       
│                       return projects.stream().map(p -> new RemoteProject(this, p.getAtId(), p.getName())).toList();
⋮
│       public RemoteProject getProjectById(String projectId) {
│               if (projectId == null) {
│                       throw new IllegalArgumentException("projectId cannot be null");
│               }
│               UUID projectUUID = UUID.fromString(projectId);
│               return getPRojectById(projectUUID);
⋮
│       public RemoteProject getPRojectById(UUID projectId) {
│               if (projectId == null) {
│                       throw new IllegalArgumentException("projectId cannot be null");
│               }
│               try {
│                       Project projectById = getProjectApi().getProjectById(projectId);
│                       return projectById == null? null: new RemoteProject(this, projectId, projectById.getName());
│               } catch (ApiException e) {
│                       if (e.getCode() == 404) {
│                               return null;
⋮
│       protected Map<UUID, Element> getModelRoots(UUID projectId, UUID commitId) {
│               try {
│                       pager.reset();
│                       Map<UUID, Element> projectRoots = new HashMap<>();
│                       do {
│                               List<Element> roots = getElementApi().getRootsByProjectCommit(projectId, commitId, pager.next()
│                               roots.forEach(el -> projectRoots.put(UUID.fromString(el.get(ID_FIELD).toString()), el));
│                       } while (this.pager.hasNext());
│                       return projectRoots;
│               } catch (ApiException e) {
⋮
│       protected Map<UUID, Element> getModelElements(UUID projectId, UUID commitId) {
│               try {
│                       Map<UUID, Element> projectElements = new HashMap<>();
│                       pager.reset();
│                       do {
│                               List<Element> elements = getElementApi().getElementsByProjectCommit(projectId, commitId, pager.
│                               elements.forEach(el -> projectElements.put(UUID.fromString(el.get(ID_FIELD).toString()), el));
│                       } while (pager.hasNext());
│                       return projectElements;
│               } catch (ApiException e) {
⋮
│       protected String getProjectName(UUID projectId) {
│               if (projectId == null) {
│                       throw new IllegalArgumentException("projectId cannot be null");
│               }
│               try {
│                       Project project = getProjectApi().getProjectById(projectId);
│                       return project == null? null : project.getName();
│               } catch (ApiException e) {
│                       throw new RemoteException("Error occured while trying to access project", e);
│               }
⋮
│       protected Branch getBranch(UUID projectId, UUID branchId) {
│               if (projectId == null) {
│                       throw new IllegalArgumentException("projectId cannot be null");
│               }
│               if (branchId == null) {
│                       throw new IllegalArgumentException("branchId cannot be null");
│               }
│               try {
│                       return getBranchApi().getBranchesByProjectAndId(projectId, branchId);
│               } catch (ApiException e) {
⋮
│       protected Branch createBranch(UUID projectId, UUID commitId, String name) {
│               if (projectId == null) {
│                       throw new IllegalArgumentException("projectId cannot be null");
│               }
│               
│               try {
│                       BranchHead branchHead = new BranchHead().atId(commitId);
│                       Branch branch = new Branch().head(branchHead).referencedCommit(branchHead);
│                       branch.setName(name);
│                       return getBranchApi().postBranchByProject(projectId, branch);
⋮
│       protected ProjectDefaultBranch getDefaultBranch(UUID projectId) {
│               if (projectId == null) {
│                       throw new IllegalArgumentException("projectId cannot be null");
│               }
│
│               try {
│                       Project project = getProjectApi().getProjectById(projectId);
│                       ProjectDefaultBranch defaultBranch = project.getDefaultBranch();
│                       return defaultBranch;
│               } catch (ApiException e) {
⋮
│       protected Branch getBranch(UUID projectId, String branchName) {
│               if (projectId == null) {
│                       throw new IllegalArgumentException("projectId cannot be null");
│               }
│
│               try {
│                       List<Branch> branches = new LinkedList<>();
│                       pager.reset();
│                       do {
│                               branches.addAll(getBranchApi().getBranchesByProject(projectId, pager.next(), null, null));
⋮
│       public Commit commitChanges(UUID projectId, UUID branchId, UUID previousCommitId, List<DataVersion
│               try {
│                       Commit commit = new Commit();
│                       commit.setChange(changes);
│                       commit.setPreviousCommit(new BranchHead().atId(previousCommitId));
│                       return commitApi.postCommitByProject(projectId, commit, branchId);
│               } catch (ApiException e) {
│                       throw new RemoteException("Error occured while trying to post commit", e);
│               }
⋮
│       protected ProjectApi getProjectApi() {
│               return projectApi;
⋮
│       protected ElementApi getElementApi() {
│               return elementApi;
⋮
│       protected BranchApi getBranchApi() {
│               return branchApi;
⋮
│       protected CommitApi getCommitApi() {
│               return commitApi;
⋮
│       public static class RemoteException extends RuntimeException {
│               private static final long serialVersionUID = 4949283470185055639L;
│               private final ApiException apiException;
│               
│               public RemoteException(String message, ApiException ex) {
│                       super(message, ex);
│                       apiException = ex;
│               }
│               
│               public int getCode() {
⋮
│               public String getResponseBody() {
│                       return apiException.getResponseBody();
⋮
│               @Override
│               public String getMessage() {
⋮

org.omg.sysml/src/org/omg/sysml/util/repository/RemoteProject.java:
⋮
│public class RemoteProject {
│       private final ProjectRepository projectRepository;
│       private final UUID projectUUID;
│       private String projectName;
│       
│       /**
│        * @param projectRepository parent repository
│        * @param projectId UUID of the project
│        */
│       private RemoteProject(ProjectRepository projectRepository, UUID projectId) {
⋮
│       public RemoteBranch getDefaultBranch() throws NoSuchElementException {
│               ProjectDefaultBranch defaultBranch = getProjectRepository().getDefaultBranch(getRemoteId());
│               if (defaultBranch == null || defaultBranch.getAtId() == null) return null;
│               return new RemoteBranch(defaultBranch.getAtId(), true);
⋮
│       public RemoteBranch getBranch(String branchName) {
│               Branch branch = getProjectRepository().getBranch(getRemoteId(), branchName);
│               if (branch == null || branch.getAtId() == null) return null;
│               return new RemoteBranch(branch.getAtId(), branch.getName());
⋮
│       public RemoteBranch getBranch(UUID branchId) {
│               Branch branch = getProjectRepository().getBranch(getRemoteId(), branchId);
│               if (branch == null || branch.getAtId() == null) return null;
│               return new RemoteBranch(branch.getAtId(), branch.getName());
⋮
│       public RemoteBranch createBranch(Revision revision, String name) {
│               UUID commitId = revision.getRemoteId();
│               Branch newBranch = getProjectRepository().createBranch(getRemoteId(), commitId, name);
│               return new RemoteBranch(newBranch.getAtId(), newBranch.getName());
⋮
│       public String getProjectName() {
│               if (projectName == null) {
│                       projectName = getProjectRepository().getProjectName(projectUUID);
│               }
│               return projectName;
⋮
│       public UUID getRemoteId() {
│               return projectUUID;
⋮
│       public ProjectRepository getProjectRepository() {
│               return projectRepository;
⋮
│       public class RemoteBranch {
│               private final UUID branchId;
│               private String name;
│               private final boolean isDefault;
│               
│               /**
│                * @param  @param branchId UUID of the branch on the API server
│                */
│               public RemoteBranch(UUID branchId, boolean isDefault) {
│                       this.branchId = branchId;
⋮
│               public UUID getRemoteId() {
│                       return branchId;
⋮
│               public String getName() {
│                       if (name == null) {
│                               Branch branch = getBranch();
│                               name = branch.getName();
│                       }
│                       return name;
⋮
│               private Branch getBranch() {
│                       return getProjectRepository().getBranch(getRemoteProject().getRemoteId(), getRemoteId());
⋮
│               public RemoteProject getRemoteProject() {
│                       return RemoteProject.this;
⋮

org.omg.sysml/src/org/omg/sysml/util/repository/Revision.java:
⋮
│public class Revision {
│       
│       private final RemoteProject project;
│       private UUID remoteId;
│       private Revision previousRevision;
│       
│       private APIModel remoteState;
│       private APIModel localState;
│       private RemoteBranch remoteBranch;
│       
⋮
│       public APIModelDelta getLocalChanges() {
│               return APIModelDelta.create(getLocalState(), getRemoteState());
⋮
│       public Revision pushChanges(APIModelDelta changes) {
│               if (changes.isEmpty()) {
│                       return this;
│               }
│               APIModelDelta localChanges = getLocalChanges();
│               return pushChanges(localChanges.toTransferableDelta());
⋮
│       public Revision pushChanges(List<DataVersion> transferableChanges) {
│               if (transferableChanges.isEmpty()) {
│                       return this;
│               }
│               
│               UUID remoteProjectId = getRemoteProject().getRemoteId();
│               RemoteBranch branch = getBranch();
│               UUID currentRevisionId = getRemoteId();
│               
│               final Commit newCommit;
│               
⋮
│       public boolean isRemote() {
│               return getRemoteId() != null;
⋮
│       public RemoteProject getRemoteProject() {
│               return project;
⋮
│       public RemoteBranch getBranch() {
│               return remoteBranch;
⋮
│       public UUID getRemoteId() {
│               return remoteId;
⋮
│       private void setPreviousRevision(Revision previousRevision) {
│               this.previousRevision = previousRevision;
⋮
│       public RemoteBranch createBranch(String name) {
│               return getRemoteProject().createBranch(this, name);
⋮

org.omg.sysml/src/org/omg/sysml/util/traversal/ElementVisitor.java:
⋮
│public class ElementVisitor {
│       
│       /**
│        * The Element this visitor is visiting.
│        */
│       private final Element element;
│       
│       /** 
│        * The traversal object used to record which Elements have already been visited.
│        */
⋮
│       public Element getElement() {
│               return this.element;
⋮
│       public Traversal getTraversal() {
│               return this.traversal;
⋮
│       public ElementProcessingFacade getFacade() {
│               return this.facade;
⋮
│       public Object visit() {
│               this.preProcess();
│               Object identifier = this.process();
│               this.getTraversal().putIdentifier(this.getElement(), identifier);
│               this.postProcess();
│               return identifier;
⋮
│       protected void preProcess() {
│               Element element = this.getElement();
│               this.getFacade().preProcess(element);
⋮
│       protected void postProcess() {
│               Element element = this.getElement();
│               if (!ElementUtil.isStandardLibraryElement(element) || visitLibraryElements) {
│                       Traversal traversal = this.getTraversal();
│                       if (element instanceof Relationship) {
│                               for (Element relatedElement: ((Relationship)element).getRelatedElement()) {
│                                       traversal.visit(relatedElement);
│                               }
│                       }
│                       for (Relationship relationship: ((ElementImpl)element).getOwnedRelationship()) {
⋮

org.omg.sysml/src/org/omg/sysml/util/traversal/Traversal.java:
⋮
│public class Traversal {
│       
│       /**
│        * The facade used for processing Elements and Relationships.
│        */
│       private final ElementProcessingFacade facade;
│       
│       /**
│        * The map that records the identifiers for visited Elements.
│        */
⋮
│       public ElementProcessingFacade getFacade() {
│               return this.facade;
⋮
│       public Object getIdentifier(Element element) {
│               return this.elementMap.get(element);
⋮
│       public void putIdentifier(Element element, Object identifier) {
│               this.elementMap.put(element, identifier);
⋮
│       public ElementVisitor createVisitor(Element element) {
│               return new ElementVisitor(element, this, this.facade, traverseStandardLibrary);
⋮

org.omg.sysml/src/org/omg/sysml/util/traversal/facade/ElementProcessingFacade.java:
⋮
│public interface ElementProcessingFacade {
│       
│       /**
│        * Pre-process the given Element. By default, do nothing.
│        * 
│        * @param       element                 the Element to be pre-processed
│        */
│       default void preProcess(Element element) { }
│       
│       /**
⋮
│       default void postProcess(Element element) { }
│       
⋮

org.omg.sysml/src/org/omg/sysml/util/traversal/facade/ElementProcessingFacadeFactory.java:
⋮
│public interface ElementProcessingFacadeFactory {
│
│       /**
│        * Create a facade for processing the Elements of a model.
│        * 
│        * @return      an ElementProcessingFacade
│        */
│       ElementProcessingFacade createFacade();
│       
⋮

org.omg.sysml/src/org/omg/sysml/util/traversal/facade/impl/DefaultElementProcessingFacadeImpl.java:
⋮
│public class DefaultElementProcessingFacadeImpl implements ElementProcessingFacade {
│       
│       /**
│        * The size of the indent to use.
│        */
│       private int indentSize = 2;
│       
│       /**
│        * The current indent level.
│        */
⋮
│       public String getIndent() {
│               StringBuilder s = new StringBuilder();
│               for (int i = 0; i < this.indentLevel * this.indentSize; i++) {
│                       s.append(" ");
│               }
│               return s.toString();
⋮
│       public void println(String line) {
│               System.out.println(line);
⋮
│       public static String getId(Element element) {
│               return Integer.toHexString(element.hashCode());
⋮
│       @Override
│       public void preProcess(Element element) {
⋮
│       @Override
│       public void postProcess(Element element) {
⋮

org.omg.sysml/src/org/omg/sysml/util/traversal/facade/impl/ElementIdProcessingFacade.java:
⋮
│public class ElementIdProcessingFacade implements ElementProcessingFacade {
│       
│       private final Map<UUID, EObject> uuidToEObject;
│       
│       public ElementIdProcessingFacade(Map<UUID, EObject> uuidToEObject) {
│               this.uuidToEObject = uuidToEObject;
│       }
│       
│       @Override
│       public String process(Element element) {
⋮

org.omg.sysml/src/org/omg/sysml/util/traversal/facade/impl/JsonElementProcessingFacade.java:
⋮
│public class JsonElementProcessingFacade implements ElementProcessingFacade {
│
│       private static final int ELEMENTS_PER_DOT = 100;
│       private static final int DOTS_PER_LINE = 50;
│
│       private Traversal traversal;
│       
│       protected boolean isIncludeDerived = false;
│       protected boolean isVerbose = false;
│       protected int elementCount = 0;
⋮
│       public Traversal getTraversal() {
│               return this.traversal;
⋮
│       public boolean isVerbose() {
│               return this.isVerbose;
⋮
│       public boolean isIncludeDerived() {
│               return this.isIncludeDerived;
⋮
│       protected Map<String, UUID> getIdentified(Element element) {
│               return element == null? null: identified(UUID.fromString(element.getElementId()), element.eClass(
⋮
│       protected List<Map<String, UUID>> getIdentified(List<Element> elements) {
│               return elements.stream().
│                               map(this::getIdentified).
│                               filter(id->id != null).
│                               toList();
⋮
│       @SuppressWarnings("unchecked")
│       protected org.omg.sysml.model.Element createApiModelElement(Element element) {
⋮
│       public static String descriptionOf(Element element) {
│               String s = element.eClass().getName();
│               String name = element.getDeclaredName();
│               if (name != null) {
│                       s += " (" + name + ")";
│               }               
│               if (element.eIsProxy()) {
│                       s += " PROXY";
│               }
│               return s + " " + element.getElementId();
⋮
│       @Override
│       public void postProcess(Element element) {
⋮
│       boolean isStandardLibraryElement(Element element) {
│               return element.eResource().getContents().stream().filter(LibraryPackage.class::isInstance)
│                               .map(LibraryPackage.class::cast).anyMatch(LibraryPackage::isStandard);
⋮
│       protected APIModel getLocalModel() {
│               return localModel;
⋮
│       public JsonElement toJsonTree(boolean asDelta) {
│               if (asDelta) {
│                       return APIModelDelta.create(getLocalModel(), APIModel.createEmpty()).toJsonTree(gson);
│               } else {
│                       return getLocalModel().toJsonTree(gson);
│               }
⋮
```
