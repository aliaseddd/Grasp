# Repo map: org.omg.sysml.interactive

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.interactive`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.interactive) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 23 files there; aider read the 23 that `pilot.aiderignore` leaves in, and the map shows 23 of them, 9 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.interactive/.classpath

org.omg.sysml.interactive/.gitignore

org.omg.sysml.interactive/.launch/SysML Interactive Library Index Generator.launch

org.omg.sysml.interactive/.launch/SysML Interactive Profiler.launch

org.omg.sysml.interactive/.launch/SysML Interactive.launch

org.omg.sysml.interactive/.project

org.omg.sysml.interactive/.settings/org.eclipse.core.resources.prefs

org.omg.sysml.interactive/.settings/org.eclipse.jdt.core.prefs

org.omg.sysml.interactive/.settings/org.eclipse.m2e.core.prefs

org.omg.sysml.interactive/META-INF/MANIFEST.MF

org.omg.sysml.interactive/VehicleModel_2_Simplified.sysml

org.omg.sysml.interactive/VehicleModel_2_Simplified.sysml.inst.txt

org.omg.sysml.interactive/build.properties:
│source.. = src/
│bin.includes = META-INF/,\
⋮

org.omg.sysml.interactive/pom.xml

org.omg.sysml.interactive/src/org/omg/sysml/interactive/StrictShadowingResourceDescriptionData.java:
⋮
│public class StrictShadowingResourceDescriptionData extends ResourceDescriptionsData {
│       
│       protected final Map<URI, IResourceDescription> resourceDescriptionMap;
│       protected final Map<QualifiedName, Object> lookupMap;
│       
│       public StrictShadowingResourceDescriptionData() {
│               this(new LinkedHashMap<>(), new LinkedHashMap<>());
│       }
│
│       protected StrictShadowingResourceDescriptionData(Map<URI, IResourceDescription> resourceDescriptio
⋮
│       @Override
│       protected void registerDescription(IResourceDescription description, Map<QualifiedName, Object> ta
⋮
│    public void removeDescription(URI uri) {
│               IResourceDescription oldDescription = resourceDescriptionMap.remove(uri);
│               if (oldDescription != null) {
│                       for(IEObjectDescription object: oldDescription.getExportedObjects()) {
│                               QualifiedName objectName = object.getName(); // Removed "toLowerCase()"
│                               Object existing = lookupMap.get(objectName);
│                               if (existing == oldDescription) {
│                                       lookupMap.remove(objectName);
│                               }
│                       }
⋮
│       @Override
│       public Iterable<IEObjectDescription> getExportedObjects(final EClass type, final QualifiedName qua
⋮

org.omg.sysml.interactive/src/org/omg/sysml/interactive/SysMLInteractive.java:
⋮
│public class SysMLInteractive extends SysMLUtil {
│       
│       public static final String HELP_KEY = "help";
│       public static final String PROJECT_ID_KEY = "id";
│       public static final String PROJECT_NAME_KEY = "name";
│       public static final String BRANCH_ID_KEY = "branch-id";
│       public static final String BRANCH_NAME_KEY = "branch";
│       
│       public static final String KERNEL_LIBRARIES_DIRECTORY = "Kernel Libraries";
│       public static final String SYSTEMS_LIBRARY_DIRECTORY = "Systems Library";
⋮
│       public void loadLibrary(String path) {
│               if (path != null) {
│                       if (!path.endsWith("/")) {
│                               path += "/";
│                       }
│                       SysMLLibraryUtil.setModelLibraryDirectory(path);
│                       this.readAll(path + KERNEL_LIBRARIES_DIRECTORY, false, KERML_EXTENSION);
│                       this.readAll(path + SYSTEMS_LIBRARY_DIRECTORY, false, SYSML_EXTENSION);
│                       this.readAll(path + DOMAIN_LIBRARIES_DIRECTORY, false, SYSML_EXTENSION);
│               }
⋮
│       public void setApiBasePath(String apiBasePath) {
│               this.apiBasePath = apiBasePath;
⋮
│       public String getApiBasePath() {
│               return apiBasePath;
⋮
│       public int next(String extension) {
│               this.setResource(counter + extension);
│               this.addInputResource(this.resource);
│               return this.counter++;
⋮
│       public void setResource(String path) {
│               this.resource = this.createResource(path);
⋮
│       public Resource getResource() {
│               return this.resource;
⋮
│       public ILibraryIndexProvider getLibraryIndexCache() {
│               return libraryIndexCache;
⋮
│       public void removeResource() {
│               if (this.resource != null) {
│                       try {
│                               this.resource.delete(null);
│                               this.resource = null;
│                       } catch (IOException e) {
│                               e.printStackTrace();
│                       }
│               }
⋮
│       public Element getRootElement() {
│               Resource resource = this.getResource();
│               if (resource instanceof XtextResource xtextResource) {
│                       final IParseResult result = xtextResource.getParseResult();
│                       return result == null? null: (Element)result.getRootASTElement();
│               } else {
│                       EList<EObject> contents = resource.getContents();
│                       return contents.isEmpty()? null: (Element)contents.get(0);
│               }
⋮
│       public void parse(String input) throws IOException {
│               Resource resource = this.getResource();
│               if (resource instanceof XtextResource xtextResource) {
│                       xtextResource.reparse(input);
│               } else {
│                       //TODO: add warning when resource is not meant to be parsed
│               }
⋮
│       public List<Issue> validate() {
│               Resource resource = this.getResource();
│               return resource == null? Collections.emptyList():
│                       validator.validate(resource, CheckMode.ALL, CancelIndicator.NullImpl);
⋮
│       private Resource getDummyResource() {
│               if (this.dummyResource == null) {
│                       this.dummyResource = this.createResource("dummy" + SYSML_EXTENSION);
│                       this.dummyResource.getContents().add(SysMLFactory.eINSTANCE.createNamespace());
│               }
│               return this.dummyResource;
⋮
│       public Element resolve(String name) {
│               IScope scope = scopeProvider.getScope(
│                               this.getDummyResource(), 
│                               SysMLPackage.eINSTANCE.getNamespace_Member(), 
│                               Predicates.alwaysTrue());
│               IEObjectDescription description = scope.getSingleElement(
│                               this.qualifiedNameConverter.toQualifiedName(name));
│               if (description == null) {
│                       return null;
│               } else {
⋮
│       public SysMLInteractiveResult process(String input) {
│               return process(input, true);
⋮
│       public SysMLInteractiveResult process(String input, boolean isAddResource) {
│               this.next(SYSML_EXTENSION);
│               try {
│                       this.parse(input);
│                       List<Issue> issues = this.validate();
│                       Element rootElement = this.getRootElement();
│                       SysMLInteractiveResult result = new SysMLInteractiveResult(rootElement, issues);
│                       if (result.hasErrors()) {
│                               this.removeResource();
│                       } else if (isAddResource) {
⋮
│       public String help(String command, List<String> help) {
│               this.counter++;
│               if (Strings.isNullOrEmpty(command)) {
│                       return help.isEmpty()? SysMLInteractiveHelp.getGeneralHelp(): SysMLInteractiveHelp.getHelpHelp()
│               }
│               if (!command.startsWith("%")) {
│                       command = "%" + command;
│               }
│               String helpString = SysMLInteractiveHelp.getHelpString(command);
│               return helpString == null? SysMLInteractiveHelp.getGeneralHelp(): helpString;
⋮
│       public String help(String command) {
│               return "-h".equals(command)? 
│                               help(null, Collections.singletonList("true")):
│                               help(command, Collections.emptyList());
⋮
│       public String repo(String apiBasePath, List<String> help) {
│               this.counter++;
│               if (!help.isEmpty()) {
│                       return SysMLInteractiveHelp.getRepoPathHelp();
│               }
│               
│               if (!Strings.isNullOrEmpty(apiBasePath)) {
│                       setApiBasePath(apiBasePath);
│               }
│               
⋮
│       public String repo(String command) {
│               return "-h".equals(command)? 
│                               repo(null, Collections.singletonList("true")):
│                               repo(command, Collections.emptyList());
⋮
│       public String eval(String input, String targetName, List<String> help) {
│               if (Strings.isNullOrEmpty(input)) {
│                       this.counter++;
│                       return help.isEmpty()? "": SysMLInteractiveHelp.getEvalHelp();
│               }
│               if (input == null || input.isEmpty()) {
│                       this.counter++;
│                       return "";
│               }
│               Element target = null;
⋮
│       public String eval(String input, String targetName) {
│               return "-h".equals(input)? 
│                               eval(null, null, Collections.singletonList("true")):
│                               eval(input, targetName, Collections.emptyList());
⋮
│       public String listLibrary() {
│               this.counter++;
│               try {
│                       List<Membership> globalMemberships = 
│                                       this.getLibraryResources().stream().
│                                       flatMap(r->r.getContents().stream()).
│                                       filter(Namespace.class::isInstance).
│                                       flatMap(n->((Namespace)n).visibleMemberships(new BasicEList<>(), false, false).stream()).
│                                       collect(Collectors.toList());
│                       return SysMLInteractiveUtil.formatMembershipList(globalMemberships);
⋮
│       public String listQuery(String query) {
│               if (!query.endsWith(";")) {
│                       query += ";";
│               }
│               SysMLInteractiveResult result = this.process("private import " + query, false);
│               if (result.hasErrors()) {
│                       return result.toString();
│               } else {
│                       List<Membership> memberships = ((Namespace)result.getRootElement()).getImportedMembership();
│                       this.removeResource();
⋮
│       public String list(String query, List<String> help) {
│               return Strings.isNullOrEmpty(query)? 
│                                       !help.isEmpty()? SysMLInteractiveHelp.getListHelp():
│                                       listLibrary(): 
│                               listQuery(query);
⋮
│       protected String list(String query) {
│               return "-h".equals(query)? 
│                               list(null, Collections.singletonList("true")):
│                               list(query, Collections.emptyList());
⋮
│       public Object show(String name, List<String> styles, List<String> help) {
│               this.counter++;
│               if (Strings.isNullOrEmpty(name)) {
│                       return help.isEmpty()? "": SysMLInteractiveHelp.getShowHelp();
│               }
│               try {
│                       Element element = this.resolve(name);
│                       if (element == null) {
│                               return "ERROR:Couldn't resolve reference to Element '" + name + "'\n";
│                       }
⋮
│       public Object export(String name, List<String> help) {
│               this.counter++;
│               if (Strings.isNullOrEmpty(name)) {
│                       return help.isEmpty()? "": SysMLInteractiveHelp.getExportHelp();
│               }
│               try {
│                       Element element = this.resolve(name);
│                       if (element == null) {
│                               return "ERROR:Couldn't resolve reference to Element '" + name + "'\n";
│                       }
⋮
│       public String show(String name) {
│               if (name.startsWith("--style=")) {
│                       int i = name.indexOf(" ");
│                       if (i > 0) {
│                               String style = name.substring("--style=".length(), i).toUpperCase();
│                               name = name.substring(i).trim();
│                               return show(name, Collections.singletonList(style), Collections.emptyList()).toString() + "\n";
│                       }
│               }
│               return (String) ("-h".equals(name)? 
⋮
│       public String publish(String elementName, String projectName, String branchName, boolean includeDe
│               this.counter++;
│               if (Strings.isNullOrEmpty(elementName)) {
│                       return help.isEmpty()? "": SysMLInteractiveHelp.getPublishHelp();
│               }
│               try {
│                       Element element = this.resolve(elementName);
│                       if (element == null) {
│                               return "ERROR:Couldn't resolve reference to Element '" + elementName + "'\n";
│                       } else if (!this.isInputResource(element.eResource())) {
⋮
│       protected String publish(String name) {
│               return "-h".equals(name)? 
│                               publish(null, null, null, false, Collections.singletonList("true")):
│                               publish(name, null, null, false, Collections.emptyList());
⋮
│       public String load(Map<String, String> parameters) {
│               this.counter++;
│               
│               if (parameters.containsKey(HELP_KEY)) {
│                       return SysMLInteractiveHelp.getLoadHelp();
│               }
│               
│               if (parameters.containsKey(PROJECT_ID_KEY) && parameters.containsKey(PROJECT_NAME_KEY)) {
│                       return "ERROR:Project name and id cannot be provided at the same time\n";
│               }
│               
⋮
│       private String load(RemoteBranch branch) {
│               if (branch == null) {
│                       return "ERROR:Branch doesn't exist\n";
│               }
│               
│               System.out.println("Selected branch " + branch.getName() + " (" + branch.getRemoteId().toString()
│               
│               Revision headRevision = branch.getHeadRevision();
│               if (!headRevision.isRemote()) {
│                       return "ERROR:Branch has no head commit\n";
⋮
│       protected String load(String name) {
│               return "-h".equals(name)?
│                               load(Map.of(HELP_KEY, "true")):
│                               load(Map.of(PROJECT_NAME_KEY, name));
⋮
│       public String projects(List<String> help) {
│               this.counter++;
│               if (help != null && !help.isEmpty()) {
│                       return SysMLInteractiveHelp.getProjectsHelp();
│               }
│               ProjectRepository projectRepository = new ProjectRepository(apiBasePath);
│
│               Comparator<String> projectNameComparator = Comparator.nullsFirst(Comparator.naturalOrder());
│               
│               String apiBasePathString = "API base path: " + apiBasePath;
⋮
│       protected String projects(String arg) {
│               return "-h".equals(arg)?
│                               projects(Collections.singletonList("true")):
│                               projects(Collections.emptyList());
⋮
│       protected ApiElementProcessingFacade getApiElementProcessingFacade(String modelName, String branch
│               System.out.println("API base path: " + this.apiBasePath);
│               ApiElementProcessingFacade processingFacade = new ApiElementProcessingFacade(modelName, branchNam
│               processingFacade.setIsIncludeDerived(includeDerived);
│               processingFacade.setTraversal(new Traversal(processingFacade));
│               return processingFacade;
⋮
│       protected JsonElementProcessingFacade getJsonElementProcessingFacade() {
│               JsonElementProcessingFacade processingFacade = new JsonElementProcessingFacade();       
│               processingFacade.setIsIncludeDerived(true);
│               processingFacade.setTraversal(new Traversal(processingFacade));
│               return processingFacade;
⋮
│       public VizResult view(String name, List<String> renders, List<String> styles, List<String> help) {
│               this.counter++;
│        if (!help.isEmpty()
│                || (name == null && renders.isEmpty() && styles.isEmpty())) {
│                return VizResult.textResult(SysMLInteractiveHelp.getViewHelp());
│        }
│        if (name == null) {
│               return VizResult.emptyResult();
│        }
│               Element element = this.resolve(name);
⋮
│       protected VizResult view(String name) {
│               return "-h".equals(name)? 
│                               this.view(null, new ArrayList<String>(), Collections.emptyList(), Collections.singletonList("tr
│                               this.view(name, new ArrayList<String>(), Collections.singletonList("PUMLCODE"), Collections.emp
⋮
│       public VizResult viz(List<String> names, List<String> views, List<String> styles, List<String> hel
│               this.counter++;
│        if (!help.isEmpty()
│            || (names.isEmpty() && views.isEmpty() && styles.isEmpty())) {
│            return VizResult.textResult(SysMLInteractiveHelp.getVizHelp());
│        }
│        List<EObject> elements = new ArrayList<EObject>(names.size());
│        for (String name: names) {
│            Element element = this.resolve(name);
│            if (element != null) {
⋮
│       protected VizResult viz(List<EObject> elements, List<String> views, List<String> styles) {
│        if (elements.isEmpty()) {
│               return VizResult.emptyResult();
│        } else {
│               try {
│                       SysML2PlantUMLSvc svc = getSysML2PlantUMLSvc();
│                       if (!views.isEmpty()) {
│                               String view = views.get(0);
│                               svc.setView(view);
│                       }
⋮
│       protected VizResult viz(String name) {
│               return "-h".equals(name)? 
│                               this.viz(Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), Collections
│                               this.viz(Collections.singletonList(name), Collections.emptyList(), Collections.singletonList("P
⋮
│    private static List<String> filterStyle(List<String> styles, String name) {
│        return styles.stream()
│            .filter(x -> !x.toUpperCase().equals(name))
│            .collect(Collectors.toList());
⋮
│    private static boolean matchStyle(List<String> styles, String name) {
│        return styles.stream()
│            .anyMatch(x -> x.toUpperCase().equals(name));
⋮
│    private class LinkProvider implements SysML2PlantUMLLinkProvider {
│        @Override
│        public String getLinkString(EObject eObj) {
│            if (!(eObj instanceof Element)) return null;
│            Element e = (Element) eObj;
│            String id = e.getElementId();
│            if (id == null) return null;
│            return "psysml:" + id;
│        }
│
│        @Override
│        public String getText(EObject eObj) {
⋮
│    protected SysML2PlantUMLSvc getSysML2PlantUMLSvc() {
│        if (sysml2PlantUMLSvc == null) {
│            sysml2PlantUMLSvc = new SysML2PlantUMLSvc(new LinkProvider());
│        }
│        return sysml2PlantUMLSvc;
⋮
│       public void setGraphVizPath(String path) {
│               getSysML2PlantUMLSvc().setGraphVizPath(path);
⋮
│       public void run(String input) {
│               if (input != null && !input.isEmpty()) {
│                       System.out.print(this.process(input));
│               }
⋮
│       public void run() {
│        try (Scanner in = new Scanner(System.in)) {
│               do {
│                       try {
│                                       System.out.print(this.counter + "> ");
│                                       String input = in.nextLine().trim();
│                                       if (input.startsWith("%")) {
│                                               if ("%".equals(input)) {
│                                                       input = "";
│                                                       String line = in.nextLine();
⋮
│       public static SysMLInteractive createInstance() {
│               if (injector == null) {
│                       // Note: An EPackage must be registered to be sure the correctly configured
│                       // CompositeEValidator is used.
│                       EPackage.Registry.INSTANCE.put(SysMLPackage.eNS_URI, SysMLPackage.eINSTANCE);
│                       KerMLStandaloneSetup.doSetup();
│                       KerMLxStandaloneSetup.doSetup();
│                       SysMLxStandaloneSetup.doSetup();
│                       injector = new SysMLStandaloneSetup().createInjectorAndDoEMFRegistration();
│               }
⋮
│       public static SysMLInteractive getInstance() {
│               if (instance == null) {
│                       instance = createInstance();
│               }
│               return instance;
⋮
│       public static void main(String[] args) {
│               System.out.println("SysML v2 Pilot Implementation");
│               SysMLInteractive instance = getInstance();
│               if (args.length > 0) {
│                       instance.loadLibrary(args[0]);
│                       if (args.length > 1) {
│                               instance.setApiBasePath(args[1]);
│                       }
│               }
│               instance.run(); 
⋮

org.omg.sysml.interactive/src/org/omg/sysml/interactive/SysMLInteractiveHelp.java:
⋮
│public class SysMLInteractiveHelp {
│
│       private static final String GENERAL_HELP_STRING_PREFIX =
│                         "The following SysML v2 magic commands are available.\n"
│                       + "For help on a specific command, use \"%help <COMMAND>\" or \"%<cmd> -h\".\n\n"
│                       ;
│
│       private static final String HELP_HELP_SHORT_STRING = "%help\t\tGet a list of available commands or
│       private static final String HELP_HELP_STRING =
│                         "Usage: %help [<COMMAND>]\n\n"
⋮
│       public static String getGeneralHelp() {
│               if (generalHelpCached == null) {
│                       StringBuilder sb = new StringBuilder();
│                       sb.append(GENERAL_HELP_STRING_PREFIX);
│                       for (var entry: commandShortHelpMap.entrySet()) {
│                               sb.append(entry.getValue());
│                               sb.append(System.lineSeparator());
│                       }
│                       generalHelpCached = sb.toString();
│               }
⋮
│       public static String getHelpHelp() {
│               return HELP_HELP_STRING;
⋮
│       public static String getEvalHelp() {
│               return EVAL_HELP_STRING;
⋮
│       public static String getListHelp() {
│       return LIST_HELP_STRING;
⋮
│    public static String getShowHelp() {
│       return SHOW_HELP_STRING;
⋮
│    public static String getPublishHelp() {
│       return PUBLISH_HELP_STRING;
⋮
│    public static String getVizHelp() {
│       return VIZ_HELP_STRING;
⋮
│    public static String getViewHelp() {
│       return VIEW_HELP_STRING;
⋮
│    public static String getExportHelp() {
│       return EXPORT_HELP_STRING;
⋮
│    public static String getProjectsHelp() {
│       return PROJECTS_HELP_STRING;
⋮
│    public static String getLoadHelp() {
│       return LOAD_HELP_STRING;
⋮
│    public static String getRepoPathHelp() {
│       return REPO_HELP_STRING;
⋮
│    public static void registerHelpString(String command, String shortDescription, String detailedH
│       Preconditions.checkState(!commandHelpMap.containsKey(command), "Help is already registered for
│       commandShortHelpMap.put(command, shortDescription);
│       commandHelpMap.put(command, detailedHelp);
│       generalHelpCached = null;
⋮
│    public static String getHelpString(String command) {
│       return commandHelpMap.get(command);
⋮

org.omg.sysml.interactive/src/org/omg/sysml/interactive/SysMLInteractiveLibraryIndexGenerator.java:
⋮
│public class SysMLInteractiveLibraryIndexGenerator {
│
│       public static void main(String[] args) throws IOException {
│               
│               if (args.length < 1) {
│                       System.out.println("Missing argument. Please supply path to library folder.");
│               }
│               
│               System.out.println("Library index generation started...");
│               
│               //disable EMF reference clearing to prevent InterruptedException on early JVM shutdown
│               System.setProperty("org.eclipse.emf.common.util.ReferenceClearingQueue", "false");
│               
⋮

org.omg.sysml.interactive/src/org/omg/sysml/interactive/SysMLInteractiveResult.java:
⋮
│public class SysMLInteractiveResult {
│       
│       private Element rootElement = null;
│       private List<Issue> issues = null;
│       private Exception exception = null;
│       
│       public SysMLInteractiveResult(Element rootElement, List<Issue> issues) {
│               this.rootElement = rootElement;
│               this.issues = issues;
│       }
│       
⋮
│       public Element getRootElement() {
│               return this.rootElement;
⋮
│       public List<Issue> getIssues() {
│               return this.issues == null? Collections.emptyList(): this.issues;
⋮
│       public List<Issue> getSyntaxErrors() {
│               return this.getIssues().stream().filter(Issue::isSyntaxError).collect(Collectors.toList());
⋮
│       public List<Issue> getSemanticErrors() {
│               return this.getIssues().stream().
│                               filter(issue->!issue.isSyntaxError() && issue.getSeverity() == Severity.ERROR).
│                               collect(Collectors.toList());
⋮
│       public List<Issue> getWarnings() {
│               return this.getIssues().stream().
│                               filter(issue->issue.getSeverity().equals(Severity.WARNING)).
│                               collect(Collectors.toList());
⋮
│       public boolean hasErrors() {
│               return this.getIssues().stream().anyMatch(issue->issue.getSeverity() == Severity.ERROR);
⋮
│       public boolean hasWarnings() {
│               return this.getIssues().stream().anyMatch(issue->issue.getSeverity() == Severity.WARNING);
⋮
│       public Exception getException() {
│               return this.exception;
⋮
│       public String formatRootElement() {
│               Element rootElement = this.getRootElement();
│               return rootElement == null? "":
│                       !(rootElement instanceof Namespace) || rootElement.getOwner() != null? 
│                               SysMLInteractiveUtil.formatElement(rootElement):
│                   ((Namespace)rootElement).getOwnedMember().stream().
│                               map(SysMLInteractiveUtil::formatElement).
│                               collect(Collectors.joining());
⋮
│       public String formatIssues() {
│               return SysMLInteractiveUtil.formatList(this.issues);
⋮
│       public String formatException() {
│               return SysMLInteractiveUtil.formatException(this.exception);
⋮
│       @Override
│       public String toString() {
⋮

org.omg.sysml.interactive/src/org/omg/sysml/interactive/SysMLInteractiveUtil.java:
⋮
│public class SysMLInteractiveUtil {
│
│       public static final String INDENT = "  ";
│       
│       private static String formatRelationship(EClass kind, String shortName, String memberName) {
│               return "[" + kind.getName() + 
│                                    (shortName == null? "": " <" + shortName + ">") + 
│                                    (memberName == null? "": " " + memberName) +
│                          "] ";
│       }
│       
│       private static String formatRelationship(Relationship relationship) {
│               return relationship == null? "":
│                          relationship instanceof Membership && !(relationship instanceof OwningMembership)?
│                                          formatRelationship(relationship.eClass(), 
│                                                          ((Membership)relationship).getMemberShortName(), 
│                                                          ((Membership)relationship).getMemberName()):
│                          formatRelationship(relationship.eClass(), null, null);
⋮
│       private static void formatElement(StringBuilder buffer, String indentation, Element element, Strin
│               buffer.append(indentation + relationshipTag + element.eClass().getName());              
│               if (EvaluationUtil.isMetaclassFeature(element)) {
│                       formatElement(buffer, " ", ((MetadataFeature)element).getAnnotatedElement().get(0), "");
│               } else {                
│                       String shortName = element.getDeclaredShortName();
│                       String name = nameOf(element);
│                       buffer.append(
│                                       (shortName == null? "": " <" + shortName + ">") +
│                                       (name == null? "": " " + name) + 
⋮
│       public static String nameOf(Element element) {
│               if (element == null) {
│                       return "";
│               } else if (element instanceof Feature && !((Feature)element).getOwnedFeatureChaining().isEmpty())
│                       String name = "";
│                       for (Feature chainingFeature: ((Feature)element).getChainingFeature()) {
│                               String nextName = chainingFeature.getName();
│                               if (nextName == null) {
│                                       nextName = "";
│                               }
⋮
│       private static void formatExplicitElement(StringBuilder buffer, String indentation, Element elemen
│               formatElement(buffer, indentation, element, formatRelationship(relationship));
⋮
│       private static void formatImplicitElement(StringBuilder buffer, String indentation, Element elemen
│               formatElement(buffer, indentation, element, formatRelationship(kind, null, "(implicit)"));
⋮
│       private static void formatTree(StringBuilder buffer, String indentation, Element element, Relation
│               formatExplicitElement(buffer, indentation, element, relationship);
│               if (element instanceof Expression && !(element instanceof CalculationUsage)) {
│                       for (Element output: ((Expression)element).getOutput()) {
│                               if (output.getOwner() == element) {
│                                       formatExplicitElement(buffer, indentation + SysMLInteractiveUtil.INDENT, output, output.getOwn
│                               }
│                       }
│               } else {
│                       if (element instanceof Type) {
⋮
│       public static String formatElement(Element element) {
│               StringBuilder buffer = new StringBuilder();
│               formatExplicitElement(buffer, "", element, null);
│               return buffer.toString();
⋮
│       public static String formatTree(Element element) {
│               StringBuilder buffer = new StringBuilder();
│               formatTree(buffer, "", element, null);
│               return buffer.toString();
⋮
│       public static <T extends Object> String formatList(List<T> list) {
│               StringBuilder buffer = new StringBuilder();
│               list.stream().map(x->x.toString() + "\n").forEachOrdered(buffer::append);
│               return buffer.toString();
⋮
│       public static String formatException(Exception exception) {
│               StringWriter writer = new StringWriter();
│               exception.printStackTrace(new PrintWriter(writer));
│               return writer.toString();
⋮
│       public static String formatMembershipList(List<Membership> membership) {
│               return membership.stream().
│                       map(Membership::getMemberElement).
│                       sorted(SysMLInteractiveUtil::compare).
│                       map(SysMLInteractiveUtil::formatElement).
│                       collect(Collectors.joining());
⋮
│       public static int compare(Element element1, Element element2) {
│               String humanId1 = element1.getDeclaredShortName();
│               String humanId2 = element2.getDeclaredShortName();
│               String name1 = element1.getName();
│               String name2 = element2.getName();
│               return name1 != null && name2 != null? name1.compareToIgnoreCase(name2):
│                          name1 == null && name2 != null? -1:
│                          name1 != null && name2 == null? 1:
│                          humanId1 != null && humanId2 != null? humanId1.compareToIgnoreCase(humanId2):
│                          humanId1 == null && humanId2 != null? -1:
⋮

org.omg.sysml.interactive/src/org/omg/sysml/interactive/VizResult.java:
⋮
│public class VizResult {
│    public static enum Kind {
│       EXCEPTION,
│        EMPTY,
│        PLANTUML,
│        TEXT,
│        SVG
│    }
│
│    public final Kind kind;
⋮
│    public static class VizException extends Exception {
│               private static final long serialVersionUID = 1L;
│               
│       public VizException(String message) {
│                       super(message);
│               }
⋮
│    public static class UnresolvedException extends VizException {
│               private static final long serialVersionUID = 1L;
│
│               public UnresolvedException(String name) {
│            super("ERROR:Couldn't resolve reference to Element '" + name + "'\n");
│        }
⋮
│    public boolean hasException() {
│        return exception != null;
⋮
│    public String formatException() {
│        return this.exception == null? "":
│                  this.exception instanceof VizException? this.exception.getMessage():
│                  this.exception instanceof IllegalArgumentException? "ERROR:" + this.exception.getMessag
│                  SysMLInteractiveUtil.formatException(exception);
⋮
│    public String getPlantUML() {
│        switch (kind) {
│        case EMPTY:
│            return "";
│        case PLANTUML:
│            return result;
│        default:
│            return null;
│        }
⋮
│    public String getText() {
│        switch (kind) {
│        case TEXT:
│            return result;
│        default:
│            return null;
│        }
⋮
│    public String getSVG() {
│        switch (kind) {
│        case EMPTY:
│            return "";
│        case SVG:
│            return result;
│        default:
│            return null;
│        }
⋮
│    public static VizResult svgResult(String svg) {
│        if (svg == null) return emptyResult();
│        return new VizResult(Kind.SVG, svg);
⋮
│    public static VizResult plantumlResult(String plantuml) {
│        if (plantuml == null) return emptyResult();
│        return new VizResult(Kind.PLANTUML, plantuml);
⋮
│    public static VizResult textResult(String text) {
│        if (text == null) return emptyResult();
│        return new VizResult(Kind.TEXT, text);
⋮
│    public static VizResult unresolvedResult(String name) {
│        return new VizResult(new UnresolvedException(name));
⋮
│    public static VizResult vizExceptionResult(String message) {
│       return new VizResult(new VizException(message));
⋮
│    public static VizResult emptyResult() {
│        return new VizResult(Kind.EMPTY, "");
⋮
│    public static VizResult exceptionResult(Exception e) {
│        return new VizResult(e);
⋮
│    public String toString() {
│       return this.kind == Kind.EXCEPTION? this.formatException():
│                  this.kind + "\n" + this.result;
⋮

org.omg.sysml.interactive/src/org/omg/sysml/interactive/profiler/SysMLInteractiveParsingProfiler.jav
⋮
│public class SysMLInteractiveParsingProfiler {
│
│       public static void main(String[] args) throws Exception {
│               Stopwatch initWatch = Stopwatch.createStarted();
│               SysMLInteractive instance = SysMLInteractive.getInstance();
│               if (args.length <= 1) {
│                       System.out.println("Usage: ");
│                       System.out.println("SysMLInteractiveParsingProfiler <LIBRARY FOLDER> <FILENAME>");
│               }
│               instance.loadLibrary(args[0]);
│               
│               initWatch.stop();
⋮

org.omg.sysml.interactive/sysmli.xml
```
