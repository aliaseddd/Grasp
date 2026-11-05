# Repo map: org.omg.sysml.jupyter.kernel

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.jupyter.kernel`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.jupyter.kernel) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 32 files there; aider read the 32 that `pilot.aiderignore` leaves in, and the map shows 32 of them, 16 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.jupyter.kernel/.classpath

org.omg.sysml.jupyter.kernel/.gitignore

org.omg.sysml.jupyter.kernel/.project

org.omg.sysml.jupyter.kernel/.settings/org.eclipse.buildship.core.prefs

org.omg.sysml.jupyter.kernel/.settings/org.eclipse.core.resources.prefs

org.omg.sysml.jupyter.kernel/.settings/org.eclipse.jdt.core.prefs

org.omg.sysml.jupyter.kernel/.settings/org.eclipse.m2e.core.prefs

org.omg.sysml.jupyter.kernel/README.DEV.md

org.omg.sysml.jupyter.kernel/README.adoc

org.omg.sysml.jupyter.kernel/assembly.xml

org.omg.sysml.jupyter.kernel/installKernel.bat

org.omg.sysml.jupyter.kernel/installKernel.sh

org.omg.sysml.jupyter.kernel/pom.xml

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/IMagicCommandRegistrator.jav
⋮
│public interface IMagicCommandRegistrator {
│
│       /**
│        * Implementors of this method are free to register their extra commands to the
│        * Jupyter kernel. This method is called when the Jupyter environment is
│        * initialized and it assumed the registration code will run quickly and without
│        * exceptions. If the registrator cannot run successfully, it should not
│        * register anything instead of throwing an exception.
│        * </p>
│        * Implementors are recommended to use the register methods of the {@link Magics}
⋮
│       void registerMagicCommand(Magics magics);
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/ISysML.java:
⋮
│public class ISysML {
│    public static final String LIBRARY_PATH_KEY = "ISYSML_LIBRARY_PATH";
│    public static final String API_BASE_PATH_KEY = "ISYSML_API_BASE_PATH";
│    public static final String GRAPHVIZ_PATH_KEY = "ISYSML_GRAPHVIZ_PATH";
│
│    private static volatile SysMLKernel kernel;
│
│    public static void initialize() {
│        kernel = new SysMLKernel();
│    }
│
│    public static void main(String[] args) throws Exception {
│        if (args.length < 1) {
│            throw new IllegalArgumentException("Missing connection file argument");
│        }
│
│        initialize();
│
│        Path connectionFile = Paths.get(args[0]);
│
│        if (!Files.isRegularFile(connectionFile))
⋮
│    public static SysMLKernel getKernelInstance() {
│        return kernel;
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/SysMLKernel.java:
⋮
│public class SysMLKernel extends BaseKernel {
│
│    private final LanguageInfo languageInfo = new LanguageInfo.Builder("SysML").version("1.0.0").mi
│
│    private final SysMLInteractive interactive;
│    private final Magics magics;
│    private final MyMagicParser magicParser;
│
│    public Magics getMagics() {
│        return magics;
⋮
│    @Override
│    public DisplayData eval(String expr) throws Exception {
⋮
│    @Override
│    public LanguageInfo getLanguageInfo() {
⋮
│    public SysMLInteractive getInteractive() {
│        return interactive;
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/Eval.java:
⋮
│public class Eval {
│    private static final MagicsArgs EVAL_ARGS = MagicsArgs.builder().onlyKnownKeywords().onlyKnownF
│               .optional("expr")
│               .keyword("target")
│            .flag("help", 'h', "true")
│               .build();
│
│    @LineMagic
│    public static String eval(List<String> args) {
│        Map<String, List<String>> vals = EVAL_ARGS.parse(args);
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/Export.java:
⋮
│public class Export {
│    private static final MagicsArgs EXPORT_ARGS = MagicsArgs.builder().onlyKnownKeywords().onlyKnow
│               .optional("element")
│            .flag("help", 'h', "true")
│               .build();
│    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
│
│    @LineMagic
│    public static DisplayData export(List<String> args) {
│        Map<String, List<String>> vals = EXPORT_ARGS.parse(args);
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/Help.java:
⋮
│public class Help {
│    private static final MagicsArgs SHOW_ARGS = MagicsArgs.builder().onlyKnownKeywords().onlyKnownF
│               .optional("command")
│            .flag("help", 'h', "true")
│               .build();
│
│    @LineMagic
│    public static String help(List<String> args) {
│        Map<String, List<String>> vals = SHOW_ARGS.parse(args);
│        List<String> names = vals.get("command");
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/Listing.java:
⋮
│public class Listing {
│    private static final MagicsArgs SHOW_ARGS = MagicsArgs.builder().onlyKnownKeywords().onlyKnownF
│               .optional("query")
│            .flag("help", 'h', "true")
│               .build();
│
│    @LineMagic
│    public static String list(List<String> args) {
│        Map<String, List<String>> vals = SHOW_ARGS.parse(args);
│        List<String> queries = vals.get("query");
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/Load.java:
⋮
│public class Load {
│    private static final MagicsArgs SHOW_ARGS = MagicsArgs.builder().onlyKnownKeywords().onlyKnownF
│               .keyword("id")
│               .keyword("name")
│               .optional("name")
│               .keyword("branch")
│               .keyword("branchid")
│            .flag("help", 'h', "true")
│               .build();
│
│       @LineMagic
│       public static String load(List<String> args) {
⋮
│       private static String getFirstValueOrNull(Map<String, List<String>> map, String key) {
│               if (map.containsKey(key)) {
│                       List<String> values = map.get(key);
│                       return values.isEmpty()? null: values.get(0);
│               }
│               return null;
⋮
│       private static boolean optionPassed(Map<String, List<String>> map, String key) {
│               return map.containsKey(key) && map.get(key) != null && !map.get(key).isEmpty();
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/MyMagicParser.java:
⋮
│public class MyMagicParser extends MagicParser {
│    private final Pattern lineMagicPattern;
│    private final Pattern cellMagicPattern;
│
│    public MyMagicParser() {
│        this("^%", "%%");
│    }
│
│    public MyMagicParser(String lineMagicStart, String cellMagicStart) {
│        super(lineMagicStart, cellMagicStart);
⋮
│    public List<LineMagicParseContext> parseLineMagics(String cell) {
│        List<LineMagicParseContext> magics = new ArrayList<>();
│        StringBuffer transformedCell = new StringBuffer();
│
│        Matcher m = this.lineMagicPattern.matcher(cell);
│        while (m.find()) {
│            String raw = m.group();
│            String rawArgs = m.group("args");
│            List<String> split = split(rawArgs);
│
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/Projects.java:
⋮
│public class Projects {
│
│       private static final MagicsArgs SHOW_ARGS = MagicsArgs.builder().onlyKnownKeywords().onlyKnownFlag
│
│       @LineMagic
│       public static String projects(List<String> args) {
│        Map<String, List<String>> vals = SHOW_ARGS.parse(args);
│        List<String> help = vals.get("help");
│               return ISysML.getKernelInstance().getInteractive().projects(help);
│       }
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/Publish.java:
⋮
│public class Publish {
│    private static final MagicsArgs SHOW_ARGS = MagicsArgs.builder().onlyKnownKeywords().onlyKnownF
│               .optional("element")
│               .keyword("project")
│               .keyword("branch")
│               .flag("derived", 'd', "false")
│            .flag("help", 'h', "true")
│               .build();
│
│    @LineMagic
│    public static String publish(List<String> args) {
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/Repo.java:
⋮
│public class Repo {
│       
│    private static final MagicsArgs REPO_ARGS = MagicsArgs.builder().onlyKnownKeywords().onlyKnownF
│               .optional("basePath")
│            .flag("help", 'h', "true")
│               .build();
│       
│       @LineMagic("repo")
│       public static String repo(List<String> args) {
│               Map<String, List<String>> vals = REPO_ARGS.parse(args);
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/Show.java:
⋮
│public class Show {
│    private static final MagicsArgs SHOW_ARGS = MagicsArgs.builder().onlyKnownKeywords().onlyKnownF
│               .optional("element")
│               .keyword("style")
│            .flag("help", 'h', "true")
│               .build();
│
│    @LineMagic
│    public static DisplayData show(List<String> args) {
│        Map<String, List<String>> vals = SHOW_ARGS.parse(args);
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/View.java:
⋮
│public class View {
│    private static final MagicsArgs VIEW_ARGS
│      = (MagicsArgs.builder().onlyKnownKeywords().onlyKnownFlags()
│         .optional("usage")
│         .keyword("render")
│         .keyword("style")
│         .flag("help", 'h', "true")
│         .build());
│
│    @LineMagic
│    public static DisplayData view(List<String> args) {
⋮

org.omg.sysml.jupyter.kernel/src/main/java/org/omg/sysml/jupyter/kernel/magic/Viz.java:
⋮
│public class Viz {
│    private static final MagicsArgs VIZ_ARGS
│      = (MagicsArgs.builder().onlyKnownKeywords().onlyKnownFlags()
│         .varargs("element")
│         .keyword("view")
│         .keyword("style")
│         .flag("help", 'h', "true")
│         .build());
│
│    @LineMagic
│    public static DisplayData viz(List<String> args) {
⋮

org.omg.sysml.jupyter.kernel/src/main/resources/install.py:
⋮
│def type_assertion(name, type_fn):
│    env = NAME_MAP[name]
⋮
│    def checker(value):
⋮
│class EnvVar(argparse.Action):
│    def __init__(self, option_strings, dest, aliases=None, name_map=None, list_sep=None, **kwargs):
│        super(EnvVar, self).__init__(option_strings, dest, **kwargs)
│
│        if aliases is None: aliases = {}
│        if name_map is None: name_map = {}
│
│        self.aliases = aliases
│        self.name_map = name_map
│        self.list_sep = list_sep
│
⋮
│    def __call__(self, parser, namespace, value, option_string=None):
⋮

org.omg.sysml.jupyter.kernel/src/main/resources/sysml/kernel.json

org.omg.sysml.jupyter.kernel/test/kernels/sysml/sysml.library/.project

org.omg.sysml.jupyter.kernel/test/kernels/sysml/sysml.library/.settings/org.eclipse.core.resources.p
```
