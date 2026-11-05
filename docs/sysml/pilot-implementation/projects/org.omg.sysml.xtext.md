# Repo map: org.omg.sysml.xtext

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.xtext`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.xtext) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 107 files there; aider read the 65 that `pilot.aiderignore` leaves in, and the map shows 65 of them, 25 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.xtext/.antlr-generator-3.2.0-patch.jar

org.omg.sysml.xtext/.classpath

org.omg.sysml.xtext/.gitignore

org.omg.sysml.xtext/.launch/Generate SysML (sysml) Language Infrastructure.launch

org.omg.sysml.xtext/.launch/Save SysML Test.launch

org.omg.sysml.xtext/.launch/Save SysML with Library.launch

org.omg.sysml.xtext/.launch/Save SysML.launch

org.omg.sysml.xtext/.launch/Save SysML2JSON with Derived.launch

org.omg.sysml.xtext/.launch/Save SysML2JSON with Implicit.launch

org.omg.sysml.xtext/.launch/Save SysML2JSON without Libraries.launch

org.omg.sysml.xtext/.launch/Save SysML2JSON.launch

org.omg.sysml.xtext/.launch/Save SysML2XMI with Implicit.launch

org.omg.sysml.xtext/.launch/Save SysML2XMI with Libs in Project.launch

org.omg.sysml.xtext/.launch/Save SysML2XMI without Domains.launch

org.omg.sysml.xtext/.launch/Save SysML2XMI without Libraries.launch

org.omg.sysml.xtext/.launch/Save SysML2XMI.launch

org.omg.sysml.xtext/.launch/Save sysml.library2XMI with implicit.launch

org.omg.sysml.xtext/.launch/Save sysml.library2XMI.launch

org.omg.sysml.xtext/.launch/Traverse SysML.launch

org.omg.sysml.xtext/.project

org.omg.sysml.xtext/.settings/org.eclipse.core.resources.prefs

org.omg.sysml.xtext/.settings/org.eclipse.jdt.core.prefs

org.omg.sysml.xtext/.settings/org.eclipse.m2e.core.prefs

org.omg.sysml.xtext/META-INF/MANIFEST.MF

org.omg.sysml.xtext/build.properties:
│source.. = src/,\
⋮
│bin.includes = .,\
│               META-INF/,\
│               lib/
│bin.excludes = **/*.mwe2,\
│               **/*.xtend
│additional.bundles = org.eclipse.xtext.xbase,\
│                     org.eclipse.xtext.common.types,\
│                     org.eclipse.xtext.xtext.generator,\
│                     org.eclipse.emf.codegen.ecore,\
│                     org.eclipse.emf.mwe.utils,\
│                     org.eclipse.emf.mwe2.launch,\
│                     org.eclipse.emf.mwe2.lib,\
│                     org.objectweb.asm,\
│                     org.apache.commons.logging,\
│                     org.apache.log4j,\
⋮

org.omg.sysml.xtext/pom.xml

org.omg.sysml.xtext/src/org/omg/sysml/xtext/GenerateSysML.mwe2

org.omg.sysml.xtext/src/org/omg/sysml/xtext/InternalParserSplitterFragment.java:
⋮
│public class InternalParserSplitterFragment extends AbstractXtextGeneratorFragment {
│       
│       private final static Logger LOGGER = Logger.getLogger(InternalParserSplitterFragment.class);
│       
│       private static final String REG_EX_DFA = "    static final String dfa_";
│       private static final Pattern PATTERN_DFA = Pattern.compile(REG_EX_DFA);
│       private static final String REG_EX_SYNPRED = "public final boolean synpred(\\d*)_(\\w*)\\(\\)";
│       private static final Pattern PATTERN_SYNPRED = Pattern.compile(REG_EX_SYNPRED);
│       
│       private static final String HEADER =
⋮
│       public void setCount(int count) {
│               this.count = count;
⋮
│       public int getCount() {
│               return count;
⋮
│       public String getOriginalClassName() {
│               return originalClassName;
⋮
│       public void setOriginalClassName(String originalClassName) {
│               this.originalClassName = originalClassName;
⋮
│       public String getBaseName() {
│               return baseName;
⋮
│       public void setBaseName(String projectName) {
│               this.baseName = projectName;
⋮
│       public String getSrcGenDirectory() {
│               return srcGenDirectory;
⋮
│       public String getAntlrPackageNam() {
│               return antlrPackageName;
⋮
│       public void setAntlrPackageName(String antlrPackageName) {
│               this.antlrPackageName = antlrPackageName;
⋮
│       public void setSrcGenDirectory(String srcGenDirectory) {
│               this.srcGenDirectory = srcGenDirectory;
⋮
│       public String getInputDirectory() {
│               return inputDirectory;
⋮
│       public void setInputDirectory(String inputDirectory) {
│               this.inputDirectory = inputDirectory;
⋮
│       public String getOutputDirectory() {
│               return outputDirectory;
⋮
│       public void setOutputDirectory(String outputDirectory) {
│               this.outputDirectory = outputDirectory;
⋮
│       public String getPackageName() {
│               return baseName.isBlank()? antlrPackageName: baseName + "." + antlrPackageName;
⋮
│       public void readInput() {
│               if (inputDirectory == null) {
│                       inputDirectory = srcGenDirectory + "/" + getPackageName().replace(".", "/");
│               }
│               String inputPath = inputDirectory + "/" + originalClassName + ".java";
│               LOGGER.info("Reading " + inputPath);
│               try {
│                       content = Files.readString(Paths.get(inputPath), StandardCharsets.UTF_8);
│               } catch (Exception e) {
│                       LOGGER.error(e);
⋮
│       protected String createOutput(String template, String className, String superclassName, int start,
│               return template.replace("$0", getPackageName()).replace("$1", className).replace("$2", superclass
│                               content.substring(start, end);
⋮
│       protected void writeOutput(String fileName, String output) throws IOException {
│               String outputPath = outputDirectory + "/" + fileName + ".java";
│               LOGGER.info("Writing " + outputPath);
│               Path outputFile = Paths.get(outputPath);
│               try {
│                       Files.writeString(outputFile, output, StandardCharsets.UTF_8);
│               } catch (Exception e) {
│                       LOGGER.error(e);
│                       throw e;
│               }               
⋮
│       protected void writeFirst() throws IOException {
│               int start = content.indexOf(MARKER_1);
│               int end = content.indexOf(MARKER_2);
│               String output = createOutput(HEADER_1, originalClassName + "1", "AbstractInternalAntlrParser", st
│               
│               Matcher matcher = PATTERN_SYNPRED.matcher(content);
│               while (matcher.find()) {
│                       output += SYNPRED.replace("$1", matcher.group(1)).replace("$2", matcher.group(2));
│               }
│               
⋮
│       protected void write(int i, int start, int end, boolean last) throws IOException {
│               String className = originalClassName + i;
│               String superclassName = originalClassName + (i -1);
│               String output = createOutput(HEADER_1, className, superclassName, start, end);
│               if (!last) {
│                       output += "}";
│               }
│               writeOutput(className, output);         
⋮
│       protected int writeMiddle() throws IOException {
│               int i = 2;
│               int n = 0;
│               int start = content.indexOf(MARKER_3);          
│               Matcher matcher = PATTERN_DFA.matcher(content);
│               while (matcher.find()) {
│                       int end = matcher.start();
│                       n = n + 1;
│                       if (n == count) {
│                               write(i, start, end, false);
⋮
│       protected void writeFinal(int i) throws IOException {
│               int start = content.indexOf(MARKER_2);
│               int end = content.indexOf(MARKER_3);
│               String output = createOutput(HEADER_2, originalClassName, originalClassName + i, start, end) + "}
│               writeOutput(originalClassName, output);
⋮
│       public void writeOutput() {
│               if (outputDirectory == null) {
│                       outputDirectory = inputDirectory;
│               }
│               try {
│                       writeFirst();
│                       int i = writeMiddle();          
│                       writeFinal(i);
│               } catch (Exception e) {
│               }
⋮
│       public void generate() {
│               if (count > 0) {
│                       readInput();
│                       if (content != null) {
│                               writeOutput();
│                       }
│               }
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/SysML.xtext

org.omg.sysml.xtext/src/org/omg/sysml/xtext/SysMLRuntimeModule.xtend

org.omg.sysml.xtext/src/org/omg/sysml/xtext/SysMLStandaloneSetup.xtend

org.omg.sysml.xtext/src/org/omg/sysml/xtext/generator/SysMLGenerator.xtend

org.omg.sysml.xtext/src/org/omg/sysml/xtext/library/SysMLLibraryProvider.xtend

org.omg.sysml.xtext/src/org/omg/sysml/xtext/naming/SysMLQualifiedNameConverter.xtend

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/ActionUsageParserPostProcessor.java:
⋮
│public class ActionUsageParserPostProcessor extends OccurrenceUsageParserPostProcessor {
│
│       public ActionUsageParserPostProcessor(ActionUsage element) {
│               super(element);
│       }
│       
│       public ActionUsage getTarget() {
│               return (ActionUsage)super.getTarget();
│       }
│
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/AttributeUsageParserPostProcessor.java:
⋮
│public class AttributeUsageParserPostProcessor extends UsageParserPostProcessor {
│
│       public AttributeUsageParserPostProcessor(Usage element) {
│               super(element);
│       }
│
│       @Override
│       public AttributeUsage getTarget() {
│               return (AttributeUsage)super.getTarget();
│       }
│
│       @Override
│       protected boolean isAddMultiplicity() {
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/CalculationUsageParserPostProcessor.java:
⋮
│public class CalculationUsageParserPostProcessor extends ActionUsageParserPostProcessor {
│
│       public CalculationUsageParserPostProcessor(CalculationUsage element) {
│               super(element);
│       }
│       
│       public CalculationUsage getTarget() {
│               return (CalculationUsage)super.getTarget();
│       }
│
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/CaseUsageParserPostProcessor.java:
⋮
│public class CaseUsageParserPostProcessor extends CalculationUsageParserPostProcessor {
│
│       public CaseUsageParserPostProcessor(CaseUsage element) {
│               super(element);
│       }
│       
│       public CaseUsage getTarget() {
│               return (CaseUsage)super.getTarget();
│       }
│
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/ConnectionUsageParserPostProcessor.java:
⋮
│public class ConnectionUsageParserPostProcessor extends PartUsageParserPostProcessor {
│
│       public ConnectionUsageParserPostProcessor(ConnectionUsage element) {
│               super(element);
│       }
│
│       @Override
│       public ConnectionUsage getTarget() {
│               return (ConnectionUsage)super.getTarget();
│       }
│
│       @Override
│       protected boolean isAddMultiplicity() {
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/DefinitionParserPostProcessor.java:
⋮
│public class DefinitionParserPostProcessor extends ClassifierParserPostProcessor {
│
│       public DefinitionParserPostProcessor(Definition element) {
│               super(element);
│       }
│
│       @Override
│       public Definition getTarget() {
│               return (Definition)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/ItemUsageParserPostProcessor.java:
⋮
│public class ItemUsageParserPostProcessor extends OccurrenceUsageParserPostProcessor {
│
│       public ItemUsageParserPostProcessor(ItemUsage element) {
│               super(element);
│       }
│
│       @Override
│       public ItemUsage getTarget() {
│               return (ItemUsage)super.getTarget();
│       }
│
│       @Override
│       protected boolean isAddMultiplicity() {
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/OccurrenceUsageParserPostProcessor.java:
⋮
│public class OccurrenceUsageParserPostProcessor extends UsageParserPostProcessor {
│
│       public OccurrenceUsageParserPostProcessor(OccurrenceUsage element) {
│               super(element);
│       }
│
│       @Override
│       public OccurrenceUsage getTarget() {
│               return (OccurrenceUsage)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/PartUsageParserPostProcessor.java:
⋮
│public class PartUsageParserPostProcessor extends ItemUsageParserPostProcessor {
│
│       public PartUsageParserPostProcessor(PartUsage element) {
│               super(element);
│       }
│
│       @Override
│       public PartUsage getTarget() {
│               return (PartUsage)super.getTarget();
│       }
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/PortConjugationParserPostProcessor.java:
⋮
│public class PortConjugationParserPostProcessor extends ConjugationParserPostProcessor {
│
│       public PortConjugationParserPostProcessor(PortConjugation element) {
│               super(element);
│       }
│
│       @Override
│       public PortConjugation getTarget() {
│               return (PortConjugation)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/PortUsageParserPostProcessor.java:
⋮
│public class PortUsageParserPostProcessor extends OccurrenceUsageParserPostProcessor {
│
│       public PortUsageParserPostProcessor(PortUsage element) {
│               super(element);
│       }
│
│       @Override
│       public PortUsage getTarget() {
│               return (PortUsage)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮
│       @Override
│       protected boolean isAddMultiplicity() {
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/SysMLParserPostProcessorFactory.java:
⋮
│public class SysMLParserPostProcessorFactory {
│       
│       public static ElementParserPostProcessor getPostProcessor(Element element) {
│               return element == null ? null : SWITCH.doSwitch(element);
│       }
│       
│       private SysMLParserPostProcessorFactory() {
│       }
│       
│       private static final SysMLSwitch<ElementParserPostProcessor> SWITCH = new SysMLFactoryPostProcesso
│       
│       public static class SysMLFactoryPostProcessorSwitch extends KerMLFactoryPostProcessorSwitch {
│
│               @Override
│               public ElementParserPostProcessor caseActionUsage(ActionUsage element) {
│                       return new ActionUsageParserPostProcessor(element);
│               }
│               
│               @Override
│               public ElementParserPostProcessor caseCalculationUsage(CalculationUsage element) {
│                       return new CalculationUsageParserPostProcessor(element);
⋮
│               @Override
│               public ElementParserPostProcessor caseCaseUsage(CaseUsage element) {
⋮
│               @Override
│               public ElementParserPostProcessor caseConnectionUsage(ConnectionUsage element) {
⋮
│               @Override
│               public ElementParserPostProcessor caseDefinition(Definition element) {
⋮
│               @Override
│               public ElementParserPostProcessor caseItemUsage(ItemUsage element) {
⋮
│               @Override
│               public ElementParserPostProcessor caseOccurrenceUsage(OccurrenceUsage element) {
⋮
│               @Override
│               public ElementParserPostProcessor casePartUsage(PartUsage element) {
⋮
│               @Override
│               public ElementParserPostProcessor casePortConjugation(PortConjugation element) {
⋮
│               @Override
│               public ElementParserPostProcessor casePortUsage(PortUsage element) {
⋮
│               @Override
│               public ElementParserPostProcessor caseUsage(Usage element) {
⋮
│               @Override
│               public ElementParserPostProcessor caseAttributeUsage(AttributeUsage element) {
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/postprocessing/UsageParserPostProcessor.java:
⋮
│public class UsageParserPostProcessor extends FeatureParserPostProcessor {
│
│    private static final List<EClass> NON_COMPOSITE_USAGE_TYPES = List.of(
│            SysMLPackage.Literals.ATTRIBUTE_USAGE,
│            SysMLPackage.Literals.BINDING_CONNECTOR_AS_USAGE,
│            SysMLPackage.Literals.EVENT_OCCURRENCE_USAGE,
│            SysMLPackage.Literals.EXHIBIT_STATE_USAGE,
│            SysMLPackage.Literals.INCLUDE_USE_CASE_USAGE,
│            SysMLPackage.Literals.PERFORM_ACTION_USAGE,
│            SysMLPackage.Literals.REFERENCE_USAGE,
⋮
│       @Override
│       public Usage getTarget() {
⋮
│       @Override
│       public void postProcess () {
⋮
│    private void setIsCompositeIfUnset(Usage target) {
│        boolean isCompositeSet = !NodeModelUtils.findNodesForFeature(
│                target, SysMLPackage.Literals.FEATURE__IS_COMPOSITE).isEmpty();
│        boolean isReferenceSet = !NodeModelUtils.findNodesForFeature(
│                target, SysMLPackage.Literals.USAGE__IS_REFERENCE).isEmpty();
│        if (!isCompositeSet && !isReferenceSet) {
│            target.setIsComposite(isCompositeByDefault(target.eClass()));
│        }
⋮
│    private static boolean isCompositeByDefault(EClass eClass) {
│        return NON_COMPOSITE_USAGE_TYPES.stream().noneMatch(type -> type.isSuperTypeOf(eClass));
⋮
│       @Override
│       protected void setIsVariableIfConstant() {
⋮
│       protected boolean isAddDefaultMultiplicity() {
│               Usage target = getTarget();
│               return target.isEnd() || 
│                          target.getOwningType() != null &&
│                          target.getOwnedRelationship().stream().
│                                       filter(rel->!rel.isImplied()).
│                                       noneMatch(Redefinition.class::isInstance);
⋮
│       protected boolean isAddMultiplicity() {
│               return getTarget().isEnd();
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/scoping/SysMLGlobalScopeProvider.xtend

org.omg.sysml.xtext/src/org/omg/sysml/xtext/scoping/SysMLLinker.java:
⋮
│public class SysMLLinker extends KerMLLinker{
│       
│       @Override
│       protected ElementParserPostProcessor doGetPostProcessor(Element element) {
│               return SysMLParserPostProcessorFactory.getPostProcessor(element);
│       }
│
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/scoping/SysMLScopeProvider.xtend

org.omg.sysml.xtext/src/org/omg/sysml/xtext/serializer/SysMLSemanticSequencer.xtend

org.omg.sysml.xtext/src/org/omg/sysml/xtext/serializer/SysMLSyntacticSequencer.xtend

org.omg.sysml.xtext/src/org/omg/sysml/xtext/util/InternalParserSplitter.java:
⋮
│public class InternalParserSplitter extends InternalParserSplitterFragment {
│       
│       public static void main(String[] args) {
│               InternalParserSplitter splitter = new InternalParserSplitter();
│               splitter.setOriginalClassName(args[0]);
│               splitter.setBaseName(args[1]);
│               splitter.setCount(Integer.valueOf(args[2]));
│               splitter.generate();
│       }
│
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/util/StdLibVersionUtil.java:
⋮
│public class StdLibVersionUtil {
│
│       private static final String DEV_SEPARATOR = "-dev.";
│
│       /** Strips any existing -dev.* suffix, then appends -dev.<buildTag>. */
│       static String withBuildTag(String version, String buildTag) {
│               int idx = version.indexOf(DEV_SEPARATOR);
│               String base = idx >= 0 ? version.substring(0, idx) : version;
│               return base + DEV_SEPARATOR + buildTag;
│       }
│
⋮
│       static String stripBuildTag(String version) {
│               int idx = version.indexOf(DEV_SEPARATOR);
│               return idx >= 0 ? version.substring(0, idx) : version;
⋮
│       static String withBuildTagConstraint(String constraint, String buildTag) {
│               int start = 0;
│               while (start < constraint.length() && !Character.isDigit(constraint.charAt(start))) {
│                       start++;
│               }
│               return constraint.substring(0, start) + withBuildTag(constraint.substring(start), buildTag);
⋮
│       static String stripBuildTagConstraint(String constraint) {
│               int start = 0;
│               while (start < constraint.length() && !Character.isDigit(constraint.charAt(start))) {
│                       start++;
│               }
│               return constraint.substring(0, start) + stripBuildTag(constraint.substring(start));
⋮
│       static String withBuildTagResource(String resource, String buildTag) {
│               String[] parts = resource.split("/");
│               if (parts.length >= 7) {
│                       parts[5] = buildTag;
│               }
│               return String.join("/", parts);
⋮
│       static String withBuildTagMetamodelUrl(String url, String buildTag) {
│               String[] parts = url.split("/");
│               if (parts.length >= 6) {
│                       parts[5] = buildTag;
│               }
│               return String.join("/", parts);
⋮
│       static void updateProject(Path projectPath, String buildTag, String metamodelTag) throws SysandExc
│               InterchangeProject project = Sysand.infoPath(projectPath);
│               InterchangeProjectInfo info = project.info;
│
│               if (info.getVersion() != null) {
│                       info.setVersion(buildTag != null
│                                       ? withBuildTag(info.getVersion(), buildTag)
│                                       : stripBuildTag(info.getVersion()));
│               }
│
⋮
│       public static void updateWorkspace(String workspacePath, String buildTag, String metamodelTag) thr
│               String[] projectPaths = Sysand.workspaceProjectPaths(Paths.get(workspacePath));
│               for (String projectPath : projectPaths) {
│                       System.out.println("  Updating: " + projectPath);
│                       updateProject(Paths.get(projectPath), buildTag, metamodelTag);
│               }
⋮
│       private static boolean isMavenPlaceholder(String value) {
│               return value != null && value.startsWith("${");
⋮
│       private static String parseTag(String value) {
│               return (value != null && !value.isEmpty() && !isMavenPlaceholder(value)) ? value : null;
⋮
│       private static void printUsage() {
│               System.err.println("Usage: StdLibVersionUtil --workspace WORKSPACE_PATH");
│               System.err.println("           [--build-tag BUILD_TAG] [--metamodel-tag METAMODEL_TAG]");
│               System.err.println();
│               System.err.println("  --workspace       Path to the workspace directory containing .workspace.jso
│               System.err.println("  --build-tag       Stamp -dev.<tag> onto version and versionConstraint in ea
│               System.err.println("                    project's .project.json");
│               System.err.println("  --metamodel-tag   Replace the date segment of resource URLs in each project
│               System.err.println("                    .project.json and the metamodel URL in each project's .me
│               System.err.println("  --help            Show this message");
⋮
│       public static void main(String[] args) throws SysandException {
│               String workspacePath = null;
│               String buildTag = null;
│               String metamodelTag = null;
│               String rawBuildTag = null;
│               String rawMetamodelTag = null;
│
│               for (int i = 0; i < args.length; i++) {
│                       switch (args[i]) {
│                               case "--help":
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/util/SysML2JSON.java:
⋮
│public class SysML2JSON extends KerML2JSON {
│
│       public SysML2JSON() {
│               super();
│               SysMLStandaloneSetup.doSetup();
│               this.addExtension(".sysml");
│       }
│       
│       /**
│        * The main program reads the KerML and SysML resources as given by its arguments and then process
⋮
│       public static void main(String[] args) {
│               try {
│                       new SysML2JSON().run(args);
│               } catch (Exception e) {
│                       System.out.println("Error: " + e);
│               }
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/util/SysML2XMI.java:
⋮
│public class SysML2XMI extends KerML2XMI {
│       
│       public static final String SYSML_EXTENSION = "sysml";
│       public static final String SYSML_XMI_EXTENSION = "sysmlx";
│       
│       public SysML2XMI() {
│               super();
│               SysMLStandaloneSetup.doSetup();
│               this.addExtension("." + SYSML_EXTENSION);
│       }
│
⋮
│       @Override
│       protected String getExtension(URI inputUri) {
⋮
│       public static void main(String[] args) {
│               new SysML2XMI().run(args);
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/util/SysMLIndexUtil.java:
⋮
│public class SysMLIndexUtil extends KerMLIndexUtil {
│
│       public SysMLIndexUtil() {
│               super();
│               SysMLStandaloneSetup.doSetup();
│               addExtension(".sysml");
│       }
│
│       /**
│        * Index all projects in a sysand workspace. For each project, parses SysML/KerML
⋮
│       public void indexWorkspace(String workspacePath) throws com.sensmetry.sysand.exceptions.SysandExce
│               String[] projectPaths = com.sensmetry.sysand.Sysand.workspaceProjectPaths(
│                               java.nio.file.Paths.get(workspacePath));
│               for (String projectPath : projectPaths) {
│                       System.out.println("Indexing project: " + projectPath);
│                       SysMLIndexUtil util = new SysMLIndexUtil();
│                       java.util.LinkedHashMap<String, String> index = util.indexAsMap(projectPath);
│                       com.sensmetry.sysand.Sysand.setProjectIndex(
│                                       java.nio.file.Paths.get(projectPath), index);
│                       System.out.println("  Updated " + index.size() + " index entries");
⋮
│       public static void main(String[] args) {
│               try {
│                       if (new java.io.File(args[0], ".workspace.json").exists()) {
│                               new SysMLIndexUtil().indexWorkspace(args[0]);
│                       } else {
│                               new SysMLIndexUtil().writeIndex(args[0], args[1]);
│                       }
│               } catch (Exception e) {
│                       e.printStackTrace();
│                       System.exit(1);
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/util/SysMLRepositoryLoadUtil.java:
⋮
│public class SysMLRepositoryLoadUtil extends SysMLUtil {
│       
│       public static void main(String[] args) throws ParseException, UnsupportedOperationException, ApiEx
│               SysMLRepositoryLoadUtil sysMLRepositoryLoadUtil = createUsingArgs(args);
│               
│               KerMLStandaloneSetup.doSetup();
│               SysMLStandaloneSetup.doSetup();
│               SysMLxStandaloneSetup.doSetup();
│               
│               sysMLRepositoryLoadUtil.load();
⋮
│       public static SysMLRepositoryLoadUtil createUsingArgs(String... args) throws ParseException {
│               var localLibrary = new Option("l", "library", true, "Path to local library");
│               localLibrary.setRequired(true);
│               
│               var repositoryOption = new Option("b", "base", true, "Repository url. E.g: " + ApiElementProcessi
│               repositoryOption.setRequired(false);
│               
│               OptionGroup projectOption = new OptionGroup();
│               projectOption.setRequired(true);
│               var projectNameOption = new Option("n", "name", true, "Project's name in the repository.");
⋮
│       public void load() throws UnsupportedOperationException, ApiException {
│               
│               ProjectRepository projectRepository = new ProjectRepository(repositoryURL);
│               RemoteProject repositoryProject =  isReferencedById? projectRepository.getProjectById(project):
│                       projectRepository.getProjectByName(project);
│               
│               if (repositoryProject == null) {
│                       System.err.println("Project does not exist.");
│                       return;
│               }
│               
⋮
│       public SysMLRepositoryLoadUtil setIsReferencedById(boolean referencedById) {
│               this.isReferencedById = referencedById;
│               return this;
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/util/SysMLRepositorySaveTest.java:
⋮
│public class SysMLRepositorySaveTest extends SysMLRepositorySaveUtil {
│       
│       protected static final String[] TEST_FILES = {
│               "01-Parts Tree/1c-Parts Tree Redefinition.sysml",
│               "02-Parts Interconnection/2a-Parts Interconnection.sysml",
│               "03-Function-based Behavior/3a-Function-based Behavior-1.sysml",
│               "03-Function-based Behavior/3a-Function-based Behavior-2.sysml",
│               "03-Function-based Behavior/3a-Function-based Behavior-3.sysml",
│               "03-Function-based Behavior/3d-Function-based Behavior-item.sysml",
│               "04-Functional Allocation/4a-Functional Allocation.sysml",
⋮
│       @Override
│       protected String[] processArgs(String[] args) {
│               
⋮
│       public static void main(String[] args) {
│               List<String> failedTests = new ArrayList<>();
│               String[] args1 = Arrays.copyOf(args, args.length);
│               for (String testFile: TEST_FILES) {
│                       try {
│                               SysMLRepositorySaveTest test = new SysMLRepositorySaveTest(testFile);
│                               test.run(args1);
│                               if (!test.isCommitted()) {
│                                       failedTests.add(testFile);
│                               }
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/util/SysMLRepositorySaveUtil.java:
⋮
│public class SysMLRepositorySaveUtil extends KerMLRepositorySaveUtil {
│
│       public SysMLRepositorySaveUtil() {
│               super();
│               SysMLStandaloneSetup.doSetup();
│               this.addExtension(".sysml");
│       }
│       
│       /**
│        * The main program reads the KerML and SysML resources as given by its arguments and then process
⋮
│       public static void main(String[] args) {
│               try {
│                       new SysMLRepositorySaveUtil().run(args);
│               } catch (Exception e) {
│                       System.out.println("Error: " + e);
│               }
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/util/SysMLTraversalUtil.java:
⋮
│public class SysMLTraversalUtil extends KerMLTraversalUtil {
│
│       public SysMLTraversalUtil() {
│               super();
│               SysMLStandaloneSetup.doSetup();
│               this.addExtension(".sysml");
│       }
│       
│       /**
│        * The main program reads the KerML and SysML resources as given by its arguments and then process
⋮
│       public static void main(String[] args) {
│               new SysMLTraversalUtil().run(args);
⋮

org.omg.sysml.xtext/src/org/omg/sysml/xtext/validation/SysMLValidator.xtend

org.omg.sysml.xtext/src/org/omg/sysml/xtext/xmi/SysMLxRuntimeModule.xtend

org.omg.sysml.xtext/src/org/omg/sysml/xtext/xmi/SysMLxStandaloneSetup.xtend

org.omg.sysml.xtext/xtend-gen/.gitignore
```
