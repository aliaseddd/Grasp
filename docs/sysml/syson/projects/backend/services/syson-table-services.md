# Repo map: backend/services/syson-table-services

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/services/syson-table-services`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/services/syson-table-services) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 17 files there; aider read the 17 that `syson.aiderignore` leaves in, and the map shows 17 of them, 4 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/services/syson-table-services/.checkstyle

backend/services/syson-table-services/.classpath

backend/services/syson-table-services/.project

backend/services/syson-table-services/.settings/org.eclipse.core.resources.prefs

backend/services/syson-table-services/.settings/org.eclipse.core.runtime.prefs

backend/services/syson-table-services/.settings/org.eclipse.jdt.apt.core.prefs

backend/services/syson-table-services/.settings/org.eclipse.jdt.core.prefs

backend/services/syson-table-services/.settings/org.eclipse.jdt.ui.prefs

backend/services/syson-table-services/.settings/org.eclipse.m2e.core.prefs

backend/services/syson-table-services/.settings/org.springframework.ide.eclipse.prefs

backend/services/syson-table-services/pom.xml

backend/services/syson-table-services/src/main/java/org/eclipse/syson/table/services/aql/TableMutati
⋮
│public class TableMutationAQLService {
│
⋮

backend/services/syson-table-services/src/main/java/org/eclipse/syson/table/services/aql/TableQueryA
⋮
│public class TableQueryAQLService {
│
⋮

backend/services/syson-table-services/src/main/resources/.gitkeep

backend/services/syson-table-services/src/test/java/org/eclipse/syson/table/services/ArchitectureCon
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_TABLE_SERVICES_ROOT_PACKAGE = "org.eclipse.syson.table.service
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_TABLE_SERVICES_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/services/syson-table-services/src/test/java/org/eclipse/syson/table/services/CodingRulesTest
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_TABLE_SERVICES_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮

backend/services/syson-table-services/src/test/resources/.gitkeep
```
