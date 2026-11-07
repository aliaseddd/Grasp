# Repo map: backend/views/syson-common-view

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/views/syson-common-view`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/views/syson-common-view) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 15 files there; aider read the 15 that `syson.aiderignore` leaves in, and the map shows 15 of them, 4 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/views/syson-common-view/.checkstyle

backend/views/syson-common-view/.classpath

backend/views/syson-common-view/.project

backend/views/syson-common-view/.settings/org.eclipse.core.resources.prefs

backend/views/syson-common-view/.settings/org.eclipse.jdt.apt.core.prefs

backend/views/syson-common-view/.settings/org.eclipse.jdt.core.prefs

backend/views/syson-common-view/.settings/org.eclipse.jdt.ui.prefs

backend/views/syson-common-view/.settings/org.eclipse.m2e.core.prefs

backend/views/syson-common-view/.settings/org.springframework.ide.eclipse.prefs

backend/views/syson-common-view/pom.xml

backend/views/syson-common-view/src/main/java/org/eclipse/syson/common/view/SysONViewDescriptionProv
⋮
│@Service
│public class SysONViewDescriptionProvider implements IEditingContextProcessor {
│
⋮
│    @Override
│    public void preProcess(IEditingContext editingContext) {
⋮

backend/views/syson-common-view/src/main/java/org/eclipse/syson/common/view/api/IViewDescriptionProv
⋮
│public interface IViewDescriptionProvider {
│
│    /**
│     * Implementers should provide the ID of the view this description provider is for.
│     *
│     * @return the Id of the view
│     */
│    String getViewId();
│
│    /**
⋮
│    IRepresentationDescriptionProvider getRepresentationDescriptionProvider();
│
│    default List<View> getRepresentationDescriptions() {
│        // Create org.eclipse.sirius.components.view.View
│        ViewBuilder viewBuilder = new ViewBuilder();
│        View view = viewBuilder.build();
│        IColorProvider colorProvider = new ColorProvider(view);
│
│        this.buildColorPalette()
│                .ifPresent(colorPalette -> view.getColorPalettes().add(colorPalette));
│
│        // Create org.eclipse.sirius.components.view.RepresentationDescription
⋮
│    default Optional<ColorPalette> buildColorPalette() {
│        return Optional.empty();
⋮

backend/views/syson-common-view/src/main/resources/.gitkeep

backend/views/syson-common-view/src/test/java/org/eclipse/syson/common/view/ArchitectureConstants.ja
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_COMMON_VIEW_ROOT_PACKAGE = "org.eclipse.syson.common.view..";
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_COMMON_VIEW_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/views/syson-common-view/src/test/java/org/eclipse/syson/common/view/CodingRulesTests.java:
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_COMMON_VIEW_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮
```
