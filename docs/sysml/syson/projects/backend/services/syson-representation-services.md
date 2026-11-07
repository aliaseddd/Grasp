# Repo map: backend/services/syson-representation-services

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/services/syson-representation-services`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/services/syson-representation-services) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 17 files there; aider read the 17 that `syson.aiderignore` leaves in, and the map shows 17 of them, 4 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/services/syson-representation-services/.checkstyle

backend/services/syson-representation-services/.classpath

backend/services/syson-representation-services/.project

backend/services/syson-representation-services/.settings/org.eclipse.core.resources.prefs

backend/services/syson-representation-services/.settings/org.eclipse.core.runtime.prefs

backend/services/syson-representation-services/.settings/org.eclipse.jdt.apt.core.prefs

backend/services/syson-representation-services/.settings/org.eclipse.jdt.core.prefs

backend/services/syson-representation-services/.settings/org.eclipse.jdt.ui.prefs

backend/services/syson-representation-services/.settings/org.eclipse.m2e.core.prefs

backend/services/syson-representation-services/.settings/org.springframework.ide.eclipse.prefs

backend/services/syson-representation-services/pom.xml

backend/services/syson-representation-services/src/main/java/org/eclipse/syson/representation/servic
⋮
│public class RepresentationMutationAQLService {
│
⋮

backend/services/syson-representation-services/src/main/java/org/eclipse/syson/representation/servic
⋮
│public class RepresentationQueryAQLService {
│
⋮

backend/services/syson-representation-services/src/main/resources/.gitkeep

backend/services/syson-representation-services/src/test/java/org/eclipse/syson/representation/servic
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_REPRESENTATION_SERVICES_ROOT_PACKAGE = "org.eclipse.syson.repr
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_REPRESENTATION_SERVICES_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/services/syson-representation-services/src/test/java/org/eclipse/syson/representation/servic
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_REPRESENTATION_SERVICES_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮

backend/services/syson-representation-services/src/test/resources/.gitkeep
```
