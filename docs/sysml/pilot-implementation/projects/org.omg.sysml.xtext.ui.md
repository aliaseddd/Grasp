# Repo map: org.omg.sysml.xtext.ui

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.xtext.ui`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.xtext.ui) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 26 files there; aider read the 23 that `pilot.aiderignore` leaves in, and the map shows 23 of them, 4 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.xtext.ui/.classpath

org.omg.sysml.xtext.ui/.gitignore

org.omg.sysml.xtext.ui/.project

org.omg.sysml.xtext.ui/.settings/org.eclipse.core.resources.prefs

org.omg.sysml.xtext.ui/.settings/org.eclipse.jdt.core.prefs

org.omg.sysml.xtext.ui/META-INF/MANIFEST.MF

org.omg.sysml.xtext.ui/build.properties:
│source.. = src/,\
⋮
│bin.includes = .,\
│               META-INF/,\
│               plugin.xml
│bin.excludes = **/*.xtend

org.omg.sysml.xtext.ui/plugin.xml

org.omg.sysml.xtext.ui/plugin.xml_gen

org.omg.sysml.xtext.ui/pom.xml

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/SysMLActivator.xtend

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/SysMLUiModule.xtend

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/handlers/GenerateLibraryIndex.java:
⋮
│public class GenerateLibraryIndex extends AbstractHandler {
│       
│       private static final Set<String> FILE_EXTENSIONS = Set.of("kerml", "sysml");
│       
│       @Inject
│       private IResourceSetProvider resourceSetProvider;
│       
│       @Inject
│       private LiveScopeResourceSetInitializer initializer;
│       
⋮
│       @Override
│       public Object execute(ExecutionEvent event) throws ExecutionException {
│               
⋮
│       private void createIndexFor(IProject project) {
│               
│               WorkspaceJob generateIndexWsJob = new WorkspaceJob("Generate Index") {
│
│                       @Override
│                       public IStatus runInWorkspace(IProgressMonitor monitor) throws CoreException {
│                               SubMonitor subMonitor = SubMonitor.convert(monitor, 100);
│                               
│                               libraryIndexProvider.setIndexDisabled(true);
│                               
│                               ResourceSet rs = resourceSetProvider.get(project);
│                               initializer.initialize(rs);
│                               
⋮
│       private void writeIndex(IProject project, String json, IProgressMonitor monitor) throws CoreExcept
│               IFile file = project.getFile(LibraryIndex.FILE_NAME);
│               
│               try (var inputStream = new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8))){
│                       if (file.exists()) {
│                               file.setContents(inputStream, IFile.FORCE, monitor);
│                       } else {
│                               file.create(inputStream, true, monitor);
│                       }
│               } catch (IOException e) {
⋮
│       private static void loadResources(ResourceSet rs, IProject project, Collection<IFile> files) {          
│               
│               for (IFile file: files) {
│                       String projectRelativeString = file.getProjectRelativePath().toString();
│                       URI platformResourceUri = URI
│                                       .createPlatformResourceURI("/" + project.getName() + "/" + projectRelativeString, true);
│                       rs.getResource(platformResourceUri, true);
│               }
⋮
│       private static void collectFiles(IContainer container, Collection<IFile> files) throws CoreExcepti
│               IResource[] members = container.members();
│               for (int i = 0; i < members.length; i++) {
│                       if (members[i] instanceof IContainer) {
│                               collectFiles((IContainer) members[i], files);
│                       } else if (members[i] instanceof IFile) {
│                               IFile file = (IFile) members[i];
│                               if (FILE_EXTENSIONS.contains(file.getFileExtension())) {
│                                       files.add(file);
│                               }
⋮

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/handlers/PullRepositoryProject.java:
⋮
│public class PullRepositoryProject extends AbstractHandler {
│
│       private static final Set<String> FILE_EXTENSIONS = Set.of("sysml", "kerml", "sysmlx", "kermlx");
│       
│       public static final String REPOSITORY_CONFIGURATION_FILE = ".settings/org.omg.sysml.remote.propert
│       private static final String REPOSITORY_PROJECT_ID_PROPERTY = "remote.projectId";
│       private static final String REPOSITORY_BRANCH_ID_PROPERTY = "remote.branchId";
│       private static final String REPOSITORY_BASE_URL_PROPERTY = "base.url";
│       
│       @Inject
⋮
│       @Override
│       public Object execute(ExecutionEvent event) throws ExecutionException {
│               
⋮
│       private void tryPullRemoteFor(IProject project) {
│               WorkspaceJob job = new WorkspaceJob("Pulling from remote") {
│                       
│                       @Override
│                       public IStatus runInWorkspace(IProgressMonitor monitor) throws CoreException {
│                               
│                               tryPullRemoteFor(project, monitor);
│                               return Status.OK_STATUS;
│                       }
│               };
│               
⋮
│       private void tryPullRemoteFor(IProject project, IProgressMonitor monitor) {
│               try {
│                       IProject[] referencedProjects = project.getDescription().getReferencedProjects();
│                       Optional<IProject> libraryProject = Stream.of(referencedProjects).filter(rp -> rp.getName().cont
│                       
│                       if (libraryProject.isPresent()) {
│                               Properties properties = new Properties();
│                               IFile repositoryPropertiesFile = project.getFile(REPOSITORY_CONFIGURATION_FILE);
│                               
│                               properties.load(repositoryPropertiesFile.getContents());
│                               
⋮
│       private static void loadResources(ResourceSet rs, IProject project, Collection<IFile> files) {          
│               
│               for (IFile file: files) {
│                       String projectRelativeString = file.getProjectRelativePath().toString();
│                       URI platformResourceUri = URI
│                                       .createPlatformResourceURI("/" + project.getName() + "/" + projectRelativeString, true);
│                       rs.getResource(platformResourceUri, true);
│               }
⋮
│       private static void collectFiles(IContainer container, Collection<IFile> files) throws CoreExcepti
│               IResource[] members = container.members();
│               for (int i = 0; i < members.length; i++) {
│                       if (members[i] instanceof IContainer) {
│                               collectFiles((IContainer) members[i], files);
│                       } else if (members[i] instanceof IFile) {
│                               IFile file = (IFile) members[i];
│                               if (FILE_EXTENSIONS.contains(file.getFileExtension())) {
│                                       files.add(file);
│                               }
⋮

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/labeling/SysMLDescriptionLabelProvider.xtend

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/labeling/SysMLLabelProvider.xtend

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/outline/SysMLOutlineTreeProvider.xtend

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/quickfix/SysMLQuickfixProvider.xtend

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/util/RemoteRepositoryPropertyTester.java:
⋮
│public class RemoteRepositoryPropertyTester extends PropertyTester {
│
│       private static final String REPOSITORY_DESCRIPTOR_TESTER = "repository_descriptor";
│       
│       public RemoteRepositoryPropertyTester() {
│       }
│
│       @Override
│       public boolean test(Object receiver, String property, Object[] args, Object expectedValue) {
│               if (Objects.equals(REPOSITORY_DESCRIPTOR_TESTER, REPOSITORY_DESCRIPTOR_TESTER) && receiver instan
⋮

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/xmi/EcoreEditorOpener.xtend

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/xmi/SysMLxExecutableExtensionFactory.xtend

org.omg.sysml.xtext.ui/src/org/omg/sysml/xtext/ui/xmi/SysMLxUIModule.xtend

org.omg.sysml.xtext.ui/xtend-gen/.gitignore
```
