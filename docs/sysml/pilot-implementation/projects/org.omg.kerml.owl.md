# Repo map: org.omg.kerml.owl

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.kerml.owl`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.kerml.owl) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 242 files there; aider read the 28 that `pilot.aiderignore` leaves in, and the map shows 28 of them, 2 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.kerml.owl/.antlr-generator-3.2.0-patch.jar

org.omg.kerml.owl/.classpath

org.omg.kerml.owl/.gitignore

org.omg.kerml.owl/.project

org.omg.kerml.owl/.settings/org.eclipse.core.resources.prefs

org.omg.kerml.owl/.settings/org.eclipse.jdt.core.prefs

org.omg.kerml.owl/.settings/org.eclipse.m2m.qvt.oml.mmodel.urimap

org.omg.kerml.owl/META-INF/MANIFEST.MF

org.omg.kerml.owl/build.properties:
│source.. = src/,\
⋮
│bin.includes = model/generated/,\
│               .,\
│               META-INF/,\
│               plugin.xml
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

org.omg.kerml.owl/launch/Transform KerML2OWL.launch

org.omg.kerml.owl/model/generated/Owl.ecore

org.omg.kerml.owl/model/generated/Owl.genmodel

org.omg.kerml.owl/owl/AddressBookModel.owl

org.omg.kerml.owl/owl/Classes.owl

org.omg.kerml.owl/owl/Packets.owl

org.omg.kerml.owl/owl/Parts Tree Demo.owl

org.omg.kerml.owl/owl/Parts Tree Demo1.owl

org.omg.kerml.owl/plugin.xml

org.omg.kerml.owl/src/org/omg/kerml/owl/GenerateOwl.mwe2

org.omg.kerml.owl/src/org/omg/kerml/owl/Owl.xtext

org.omg.kerml.owl/src/org/omg/kerml/owl/OwlRuntimeModule.xtend

org.omg.kerml.owl/src/org/omg/kerml/owl/OwlStandaloneSetup.xtend

org.omg.kerml.owl/src/org/omg/kerml/owl/generator/OwlGenerator.xtend

org.omg.kerml.owl/src/org/omg/kerml/owl/qvt/KerML2OWL.java:
⋮
│public class KerML2OWL extends QVTRunner {
│
│       @SuppressWarnings("unused")
│       protected void initialize() {
│               super.initialize();
│               
│           SysMLPackage sysml = SysMLPackage.eINSTANCE;
│           
│           KerMLStandaloneSetup.doSetup();
│           
⋮
│       @Override
│       protected String constructOutputPath(final String... resourcePaths) {
⋮
│       public static void main(String[] args) {
│               new KerML2OWL().run(args, 3, "KerML2OWL [-l logPath] qvtPath inputPaths outputPath");
⋮

org.omg.kerml.owl/src/org/omg/kerml/owl/scoping/OwlScopeProvider.xtend

org.omg.kerml.owl/src/org/omg/kerml/owl/validation/OwlValidator.xtend

org.omg.kerml.owl/transforms/SysML2OWL.qvto

org.omg.kerml.owl/xtend-gen/.gitignore
```
