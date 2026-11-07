# Repo map: backend/application/syson-starter

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/application/syson-starter`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/application/syson-starter) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 8 files there; aider read the 8 that `syson.aiderignore` leaves in, and the map shows 8 of them, 2 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/application/syson-starter/.checkstyle

backend/application/syson-starter/.classpath

backend/application/syson-starter/.project

backend/application/syson-starter/.settings/org.eclipse.jdt.core.prefs

backend/application/syson-starter/pom.xml

backend/application/syson-starter/src/main/java/org/eclipse/syson/starter/SysONStarterConfiguration.
⋮
│@AutoConfiguration
│@ComponentScan(basePackages = "org.eclipse.syson")
│public class SysONStarterConfiguration {
⋮

backend/application/syson-starter/src/main/resources/META-INF/spring/org.springframework.boot.autoco

backend/application/syson-starter/src/test/java/org/eclipse/syson/starter/SysONStarterConfigurationT
⋮
│public class SysONStarterConfigurationTests {
│
│    /**
│     * Verifies that Spring Boot discovers the SysON starter configuration.
│     */
│    @Test
│    public void shouldRegisterAutoConfiguration() {
│        var importCandidates = ImportCandidates.load(AutoConfiguration.class, SysONStarterConfigura
│
│        assertThat(importCandidates.getCandidates()).contains(SysONStarterConfiguration.class.getNa
⋮
│    @Test
│    public void shouldScanSysONComponents() {
⋮
```
