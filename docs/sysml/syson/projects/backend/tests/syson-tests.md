# Repo map: backend/tests/syson-tests

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/tests/syson-tests`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/tests/syson-tests) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 19 files there; aider read the 19 that `syson.aiderignore` leaves in, and the map shows 19 of them, 4 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/tests/syson-tests/.checkstyle

backend/tests/syson-tests/.classpath

backend/tests/syson-tests/.project

backend/tests/syson-tests/.settings/org.eclipse.core.resources.prefs

backend/tests/syson-tests/.settings/org.eclipse.core.runtime.prefs

backend/tests/syson-tests/.settings/org.eclipse.jdt.apt.core.prefs

backend/tests/syson-tests/.settings/org.eclipse.jdt.core.prefs

backend/tests/syson-tests/.settings/org.eclipse.jdt.ui.prefs

backend/tests/syson-tests/.settings/org.eclipse.m2e.core.prefs

backend/tests/syson-tests/.settings/org.springframework.ide.eclipse.boot.prefs

backend/tests/syson-tests/.settings/org.springframework.ide.eclipse.prefs

backend/tests/syson-tests/pom.xml

backend/tests/syson-tests/src/main/java/org/eclipse/syson/tests/api/GivenSysONServer.java

backend/tests/syson-tests/src/main/java/org/eclipse/syson/tests/api/SysONServerInit.java

backend/tests/syson-tests/src/main/java/org/eclipse/syson/tests/architecture/AbstractCodingRulesTest
⋮
│public abstract class AbstractCodingRulesTests {
│
│    private static final String GRAPHQL_GUAVA = "graphql.com.google..";
│
│    private static final String GUAVA_ANNOTATIONS = "com.google.common.annotations..";
│
│    private static final String GUAVA_BASE = "com.google.common.base..";
│
│    private static final String GUAVA_COLLECT = "com.google.common.collect..";
│
⋮
│    protected abstract String getProjectRootPackage();
│
│    protected abstract JavaClasses getClasses();
│
│    @Test
│    public void noClassesShouldUseGraphQLGuava() {
⋮
│    @Test
│    public void noClassesShouldUseGuava() {
⋮
│    @Test
│    public void noClassesShouldUseEclipseCoreRuntime() {
⋮
│    @Test
│    public void noClassesShouldUseJacksonAnnotations() {
⋮
│    @Test
│    public void noClassesShouldUseJetbrainsImport() {
⋮
│    public void noClassesShouldUseEMF() {
│        ArchRule rule = ArchRuleDefinition.noClasses()
│                .that()
│                .resideInAPackage(this.getProjectRootPackage())
│                .should()
│                .dependOnClassesThat()
│                .resideInAPackage(EMF)
│                .orShould()
│                .dependOnClassesThat()
│                .resideInAPackage(EMFJSON)
⋮
│    @Test
│    public void noClassesShouldUseEcoreUtilDelete() {
⋮
│    public void noClassesShouldUseApacheCommons() {
│        ArchRule rule = ArchRuleDefinition.noClasses()
│                .that()
│                .resideInAPackage(this.getProjectRootPackage())
│                .should()
│                .dependOnClassesThat()
│                .resideInAPackage(APACHE_COMMONS)
│                .allowEmptyShould(true);
│
│        rule.check(this.getClasses());
⋮
│    @Test
│    public void noClassesShouldUseSpringStringUtils() {
⋮
│    @Test
│    public void noClassesShouldUseStandardStreams() {
⋮
│    @Test
│    public void noClassesShouldThrowGenericExceptions() {
⋮
│    @Test
│    public void noClassesShouldUseJavaLogging() {
⋮
│    @Test
│    public void classesShouldUsePublicVisibility() {
⋮
│    @Test
│    public void classesShouldHavePublicOrPrivateConstructors() {
⋮
│    private ArchCondition<JavaClass> haveProtectedOrPackageConstructor() {
│        return new ArchCondition<>("have a package private constructor") {
│            @Override
│            public void check(JavaClass javaClass, ConditionEvents events) {
│                boolean hasProtectedOrPackageConstructor = javaClass.getAllConstructors().stream()
│                        .filter(javaConstructor -> {
│                            return javaConstructor.reflect().getDeclaringClass().equals(javaClass.r
│                        })
│                        .anyMatch(javaConstructor -> {
│                            boolean isProtected  = javaConstructor.getModifiers().contains(JavaModi
│                            boolean isPackage = !javaConstructor.getModifiers().contains(JavaModifi
⋮
│    @Test
│    public void interfacesShouldRespectNamingConventions() {
⋮
│    @Test
│    public void abstractClassesShouldRespectNamingConventions() {
⋮
│    @Test
│    public void abstractClassesShouldNotContainBusinessCode() {
⋮
│    private ArchCondition<JavaClass> notContainBusinessCode() {
│        return new ArchCondition<>("not contain business code") {
│            @Override
│            public void check(JavaClass javaClass, ConditionEvents events) {
│                boolean isConditionSatisfied = true;
│
│                Set<JavaMethod> methods = javaClass.getMethods();
│                Iterator<JavaMethod> iterator = methods.iterator();
│                while (isConditionSatisfied && iterator.hasNext()) {
│                    JavaMethod javaMethod = iterator.next();
│                    String name = javaMethod.getName();
⋮
│    @Test
│    public void noMethodsShouldBeStatic() {
⋮
│    private DescribedPredicate<JavaClass> isNotTestCase() {
│        return new DescribedPredicate<>("is not a test case") {
│            @Override
│            public boolean test(JavaClass javaClass) {
│                return !javaClass.getName().endsWith(TESTCASE_SUFFIX);
│            }
│        };
⋮
│    private DescribedPredicate<JavaMethod> isNotLambda() {
│        return new DescribedPredicate<>("is not a lambda") {
│            @Override
│            public boolean test(JavaMethod javaMethod) {
│                return !javaMethod.getName().startsWith("lambda$") && !javaMethod.getName().startsW
│            }
│        };
⋮
│    private DescribedPredicate<JavaMethod> isNotSwitchTable() {
│        return new DescribedPredicate<>("is not a switch table (whatever that is...)") {
│            @Override
│            public boolean test(JavaMethod javaMethod) {
│                return !javaMethod.getFullName().contains("$SWITCH_TABLE$");
│            }
│        };
⋮
│    private DescribedPredicate<JavaMethod> isNotRecordStaticBuilder() {
│        return new DescribedPredicate<>("is not an alternate builder in a record") {
│            @Override
│            public boolean test(JavaMethod javaMethod) {
│                return !(javaMethod.getOwner().isRecord() && javaMethod.getRawReturnType().equals(j
│            }
│        };
⋮

backend/tests/syson-tests/src/main/java/org/eclipse/syson/tests/architecture/SysONServiceDependencyP
⋮
│public final class SysONServiceDependencyPredicate extends DescribedPredicate<JavaClass> {
│
│    private final String acceptableDependentServicePattern;
│
│    public SysONServiceDependencyPredicate(List<String> authorizedScopes, String operationType) {
│        super("only depend on service classes of scope '%s' with operation of type '%s'", String.jo
│        this.acceptableDependentServicePattern = authorizedScopes.stream()
│                .collect(Collectors.joining("|", "(", ")")) + operationType + ".*Service";
│    }
│
│    @Override
│    public boolean test(JavaClass javaClass) {
⋮

backend/tests/syson-tests/src/main/resources/.gitkeep

backend/tests/syson-tests/src/test/java/org/eclipse/syson/tests/GeneralPurposeTests.java:
⋮
│public class GeneralPurposeTests {
│
│    private static final String UNIX_PATH_SEPARATOR = "/";
│
│    private static final String WINDOWS_PATH_SEPARATOR = "\\";
│
│    private static final String GIT_FOLDER_NAME = ".git";
│
│    private static final String BACKEND_FOLDER_PATH = "backend";
│
⋮
│    private File getRootFolder() {
│        String path = System.getProperty("user.dir");
│        File classpathRoot = new File(path);
│
│        File repositoryRootFolder = classpathRoot;
│        while (!new File(repositoryRootFolder, GIT_FOLDER_NAME).exists()) {
│            repositoryRootFolder = repositoryRootFolder.getParentFile();
│        }
│
│        return repositoryRootFolder;
⋮
│    private List<Path> findFilePaths(Path sourceFolderPath, String extension, boolean includesGener
│        List<Path> filesPaths = new ArrayList<>();
│
│        try (Stream<Path> paths = Files.walk(sourceFolderPath)) {
│            List<Path> filePaths = paths.filter(Files::isRegularFile)
│                    .filter(filePath -> filePath.toFile().getName().endsWith(extension))
│                    .filter(filePath -> !filePath.toString().replace(WINDOWS_PATH_SEPARATOR, UNIX_P
│                    .filter(filePath -> !filePath.toString().replace(WINDOWS_PATH_SEPARATOR, UNIX_P
│                    .filter(filePath -> !filePath.toString().replace(WINDOWS_PATH_SEPARATOR, UNIX_P
│                    .filter(filePath -> !filePath.toString().replace(WINDOWS_PATH_SEPARATOR, UNIX_P
⋮
│    @Test
│    public void checkJavaCode() {
⋮
│    private void testCopyrightHeader(Path filePath, List<String> lines) {
│        if (!this.isWhiteListed(filePath)) {
│            for (int i = 0; i < COPYRIGHT_HEADER.size(); i++) {
│                assertThat("Invalid copyright header in " + filePath, lines.get(i), matchesPattern(
│            }
│            assertTrue(lines.size() >= COPYRIGHT_HEADER.size());
│        }
⋮
│    private boolean isWhiteListed(Path filePath) {
│        return filePath.toString().replace(WINDOWS_PATH_SEPARATOR, UNIX_PATH_SEPARATOR).contains("s
│                || filePath.toString().replace(WINDOWS_PATH_SEPARATOR, UNIX_PATH_SEPARATOR).contain
⋮
│    private void testNoSuppressWarnings(int index, String line, Path javaFilePath, List<String> lin
│        if (line.contains(SUPPRESS_WARNINGS)) {
│            boolean isValidUsage = false;
│            if (line.contains(CHECKSTYLE_HIDDEN_FIELD)) {
│                isValidUsage = true;
│                isValidUsage = isValidUsage && lines.size() > index;
│                isValidUsage = isValidUsage && (lines.get(index + 1).contains(BUILDER) || CHECKSTYL
│            } else if (line.contains(CHECKSTYLE_ILLEGAL_CATCH)) {
│                isValidUsage = true;
│            } else if (line.contains(CHECKSTYLE_MULTIPLE_STRING_LITERALS)) {
⋮
│    private void testNoCheckstyleOff(int index, String line, Path javaFilePath) {
│        var whitelist = Stream.of(
│                Path.of("ServiceMethod.java"),
│                Path.of("GVTopNodeCreationTests.java")
│        );
│        if (whitelist.filter(javaFilePath::endsWith).findFirst().isEmpty()) {
│            if (line.contains(CHECKSTYLE_OFF)) {
│                fail(this.createErrorMessage("CHECKSTYLE:OFF", javaFilePath, index));
│            }
│        }
⋮
│    private void testNoThrowNewException(int index, String line, Path javaFilePath, List<String> li
│        var whitelist = Stream.of(
│                Path.of("ServiceMethod.java")
│        );
│        if (whitelist.filter(javaFilePath::endsWith).findFirst().isEmpty()) {
│            if (line.contains(THROW_NEW)) {
│                var isRecord = lines.stream().anyMatch(l -> l.contains("public record"));
│                if (!isRecord) {
│                    fail(this.createErrorMessage("throw new XXXException", javaFilePath, index));
│                }
⋮
│    private void testNoNonNls(int index, String line, Path javaFilePath) {
│        if (line.contains(NON_NLS)) {
│            fail(this.createErrorMessage("$NON-NLS-", javaFilePath, index));
│        }
⋮
│    @Test
│    public void checkJavaScriptCode() {
⋮
│    private void testNoESLintDisable(int index, String line, Path javascriptFilePath) {
│        if (line.contains(ESLINT_DISABLE)) {
│            fail(this.createErrorMessage(ESLINT_DISABLE, javascriptFilePath, index));
│        }
⋮
│    private void testNoDebugger(int index, String line, Path javascriptFilePath) {
│        if (line.contains(DEBUGGER)) {
│            fail(this.createErrorMessage(DEBUGGER, javascriptFilePath, index));
│        }
⋮
│    private void testNoConsoleLog(int index, String line, Path javascriptFilePath) {
│        if (line.contains(CONSOLE_LOG)) {
│            fail(this.createErrorMessage(CONSOLE_LOG, javascriptFilePath, index));
│        }
⋮
│    private void testNoAlert(int index, String line, Path javascriptFilePath) {
│        if (line.contains(ALERT)) {
│            fail(this.createErrorMessage(ALERT, javascriptFilePath, index));
│        }
⋮
│    private void testNoConfirm(int index, String line, Path javascriptFilePath) {
│        if (line.contains(CONFIRM)) {
│            fail(this.createErrorMessage(CONFIRM, javascriptFilePath, index));
│        }
⋮
│    private void testNoPrompt(int index, String line, Path javascriptFilePath) {
│        if (line.contains(PROMPT)) {
│            fail(this.createErrorMessage(PROMPT, javascriptFilePath, index));
│        }
⋮
│    private void testNoInvalidMaterialUIImport(int index, String line, Path javascriptFilePath) {
│        if (line.contains(INVALID_MATERIALUI_IMPORT)) {
│            fail(this.createErrorMessage(INVALID_MATERIALUI_IMPORT, javascriptFilePath, index));
│        }
⋮
│    private void testNoItOnly(int index, String line, Path javascriptFilePath) {
│        if (line.contains(IT_ONLY)) {
│            fail(this.createErrorMessage(IT_ONLY, javascriptFilePath, index));
│        }
⋮
│    @Test
│    public void checkCSSCode() {
⋮
│    private void testHeight100Percent(int index, String line, Path cssFilePath) {
│        var whitelist = Stream.of(
│                Path.of("Modal.module.css"),
│                Path.of("ToolSection.module.css")
│        );
│        if (whitelist.filter(cssFilePath::endsWith).findFirst().isEmpty()) {
│            if (line.contains(HEIGHT_100)) {
│                fail(this.createErrorMessage(HEIGHT_100, cssFilePath, index));
│            }
│        }
⋮
│    private void testWidth100Percent(int index, String line, Path cssFilePath) {
│        var whitelist = Stream.of(
│                Path.of("Modal.module.css"),
│                Path.of("ToolSection.module.css")
│        );
│        if (whitelist.filter(cssFilePath::endsWith).findFirst().isEmpty()) {
│            if (line.contains(WIDTH_100)) {
│                fail(this.createErrorMessage(WIDTH_100, cssFilePath, index));
│            }
│        }
⋮
│    private String createErrorMessage(String pattern, Path path, int lineNumber) {
│        return "Invalid use of " + pattern + " in " + path.toString() + " line " + lineNumber;
⋮

backend/tests/syson-tests/src/test/java/org/eclipse/syson/tests/GitCommitMessageTests.java:
⋮
│public class GitCommitMessageTests {
│
│    private static final String START = "[";
│
│    private static final String END = "]";
│
│    private static final String[] GIT_COMMAND = { "git", "log", "-1" };
│
│    private static final List<String> KEYWORDS = List.of("cleanup", "doc", "fix", "releng", "test",
│
⋮
│    private List<String> runCommand() {
│        List<String> lines = new ArrayList<>();
│        try {
│            Process process = Runtime.getRuntime().exec(GIT_COMMAND);
│
│            try (
│                BufferedReader lineReader = new BufferedReader(new InputStreamReader(process.getInp
│                BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getEr
│            ) {
│                lines = lineReader.lines().collect(Collectors.toList());
⋮
│    @Test
│    public void testTitle() {
⋮
│    @Test
│    public void testSignedOffBy() {
⋮
│    private boolean runningOnCI() {
│        return System.getenv("CI") != null;
⋮
```
