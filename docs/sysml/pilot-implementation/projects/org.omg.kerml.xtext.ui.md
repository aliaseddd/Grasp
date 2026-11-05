# Repo map: org.omg.kerml.xtext.ui

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.kerml.xtext.ui`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.kerml.xtext.ui) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 28 files there; aider read the 25 that `pilot.aiderignore` leaves in, and the map shows 25 of them, 3 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.kerml.xtext.ui/.classpath

org.omg.kerml.xtext.ui/.gitignore

org.omg.kerml.xtext.ui/.project

org.omg.kerml.xtext.ui/.settings/org.eclipse.core.resources.prefs

org.omg.kerml.xtext.ui/.settings/org.eclipse.jdt.core.prefs

org.omg.kerml.xtext.ui/META-INF/MANIFEST.MF

org.omg.kerml.xtext.ui/build.properties:
│source.. = src/,\
⋮
│bin.includes = .,\
│               META-INF/,\
│               plugin.xml
│bin.excludes = **/*.xtend

org.omg.kerml.xtext.ui/plugin.xml

org.omg.kerml.xtext.ui/plugin.xml_gen

org.omg.kerml.xtext.ui/pom.xml

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/KerMLActivator.xtend

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/KerMLAntlrTokenToAttributeIdMapper.xtend

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/KerMLHighlightingConfiguration.xtend

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/KerMLUiModule.xtend

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/KerMLUserKeywordHighlightingCalculator.xtend

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/labeling/KerMLDescriptionLabelProvider.xtend

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/labeling/KerMLLabelProvider.xtend

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/library/DynamicLibraryIndexProvider.java:
⋮
│public class DynamicLibraryIndexProvider implements ILibraryIndexProvider {
│       
│       private static Logger log = Logger.getLogger(DynamicLibraryIndexProvider.class);
│       
│       //Using a singleton to prevent multiple library indexes in a multi-injector environment
│       //Accessing this singleton should be still done through dependency injection and not directly
│       private static DynamicLibraryIndexProvider INSTANCE;
│       
│       private final Map<IProject, LibraryIndex> cache = new WeakHashMap<>();
│       private boolean disabled = false;
│       
⋮
│       @Override
│       public LibraryIndex getIndexFor(Resource resource) {
│               
⋮
│       @Override
│       public void setIndexDisabled(boolean doNotUse) {
⋮
│       @Override
│       public boolean isIndexDisabled() {
⋮
│       public static synchronized DynamicLibraryIndexProvider getInstance(ProjectByResourceProvider provi
│               if (INSTANCE == null) {
│                       INSTANCE = new DynamicLibraryIndexProvider(provider);
│               }
│               return INSTANCE;
⋮
│       @Override
│       public void dropIndexOf(Resource resource) {
⋮

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/outline/ImplicitNode.java:
⋮
│public class ImplicitNode extends AbstractOutlineNode {
│
│       public ImplicitNode(IOutlineNode parent, Image image, EClass eClass) {
│               super(parent, image, eClass.getName() + " (implicit)", false);
│       }
│       
│       public ImplicitNode(IOutlineNode parent, Image image, String text) {
│               super(parent, image, text + " (implicit)", false);
│       }
│       
⋮

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/outline/KerMLOutlineTreeProvider.xtend

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/quickfix/KerMLQuickfixProvider.xtend

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/xmi/EcoreEditorOpener.xtend

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/xmi/KerMLxExecutableExtensionFactory.xtend

org.omg.kerml.xtext.ui/src/org/omg/kerml/xtext/ui/xmi/KerMLxUIModule.xtend

org.omg.kerml.xtext.ui/xtend-gen/.gitignore
```
