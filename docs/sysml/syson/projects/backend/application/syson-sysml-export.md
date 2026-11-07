# Repo map: backend/application/syson-sysml-export

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/application/syson-sysml-export`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/application/syson-sysml-export) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 16 files there; aider read the 16 that `syson.aiderignore` leaves in, and the map shows 16 of them, 4 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/application/syson-sysml-export/.checkstyle

backend/application/syson-sysml-export/.classpath

backend/application/syson-sysml-export/.project

backend/application/syson-sysml-export/.settings/org.eclipse.core.resources.prefs

backend/application/syson-sysml-export/.settings/org.eclipse.core.runtime.prefs

backend/application/syson-sysml-export/.settings/org.eclipse.jdt.apt.core.prefs

backend/application/syson-sysml-export/.settings/org.eclipse.jdt.core.prefs

backend/application/syson-sysml-export/.settings/org.eclipse.jdt.ui.prefs

backend/application/syson-sysml-export/.settings/org.eclipse.m2e.core.prefs

backend/application/syson-sysml-export/.settings/org.springframework.ide.eclipse.prefs

backend/application/syson-sysml-export/pom.xml

backend/application/syson-sysml-export/src/main/java/org/eclipse/syson/sysml/export/SysMLv2DocumentE
⋮
│@Service
│public class SysMLv2DocumentExporter implements IDocumentExporter {
│
⋮
│    @Override
│    public boolean canHandle(Resource resource, String mediaType) {
⋮
│    @Override
│    public Optional<byte[]> getBytes(Resource resource, String mediaType) {
⋮
│    private void removeCacheAdapter(Resource resource, MembershipCacheAdapter membershipCacheAdapte
│        ResourceSet resourceSet = resource.getResourceSet();
│        if (resourceSet != null) {
│            resourceSet.eAdapters().remove(membershipCacheAdapter);
│        } else {
│            resource.eAdapters().remove(membershipCacheAdapter);
│        }
⋮
│    private ResourceSet installCacheAdapter(Resource resource, MembershipCacheAdapter membershipCac
│        ResourceSet resourceSet = resource.getResourceSet();
│        if (resourceSet != null) {
│            resourceSet.eAdapters().add(membershipCacheAdapter);
│        } else {
│            resource.eAdapters().add(membershipCacheAdapter);
│        }
│        return resourceSet;
⋮

backend/application/syson-sysml-export/src/main/java/org/eclipse/syson/sysml/export/SysMLv2EditingCo
⋮
│@Service
│public class SysMLv2EditingContextPersistenceFilter implements IEditingContextPersistenceFilter {
│
│    @Override
│    public boolean shouldPersist(Resource resource) {
⋮

backend/application/syson-sysml-export/src/main/resources/.gitkeep

backend/application/syson-sysml-export/src/test/java/org/eclipse/syson/sysml/export/ArchitectureCons
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_SYSML_EXPORT_ROOT_PACKAGE = "org.eclipse.syson.sysml.export.."
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_SYSML_EXPORT_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/application/syson-sysml-export/src/test/java/org/eclipse/syson/sysml/export/CodingRulesTests
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_SYSML_EXPORT_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮
```
