# Repo map: org.omg.kerml.xpect.tests

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.kerml.xpect.tests`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.kerml.xpect.tests) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 394 files there; aider read the 394 that `pilot.aiderignore` leaves in, and the map shows 232 of them, 16 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.kerml.xpect.tests/.classpath

org.omg.kerml.xpect.tests/.gitignore

org.omg.kerml.xpect.tests/.settings/org.eclipse.core.resources.prefs

org.omg.kerml.xpect.tests/.settings/org.eclipse.jdt.ui.prefs

org.omg.kerml.xpect.tests/.settings/org.eclipse.xpect.Xpect.prefs

org.omg.kerml.xpect.tests/META-INF/MANIFEST.MF

org.omg.kerml.xpect.tests/build.properties:
│source.. = src/,\
│           library/
│output.. = target/classes/
│bin.includes = META-INF/,\
│               .,\
│               plugin.properties,\
│               plugin.xml
│additional.bundles = io.github.classgraph.classgraph
│               

org.omg.kerml.xpect.tests/library/Base.kerml

org.omg.kerml.xpect.tests/library/BaseFunctions.kerml

org.omg.kerml.xpect.tests/library/BooleanFunctions.kerml

org.omg.kerml.xpect.tests/library/Clocks.kerml

org.omg.kerml.xpect.tests/library/CollectionFunctions.kerml

org.omg.kerml.xpect.tests/library/ComplexFunctions.kerml

org.omg.kerml.xpect.tests/library/ControlFunctions.kerml

org.omg.kerml.xpect.tests/library/ControlPerformances.kerml

org.omg.kerml.xpect.tests/library/DataFunctions.kerml

org.omg.kerml.xpect.tests/library/KerML.kerml

org.omg.kerml.xpect.tests/library/Links.kerml

org.omg.kerml.xpect.tests/library/NaturalFunctions.kerml

org.omg.kerml.xpect.tests/library/Objects.kerml

org.omg.kerml.xpect.tests/library/Observation.kerml

org.omg.kerml.xpect.tests/library/Performances.kerml

org.omg.kerml.xpect.tests/library/RealFunctions.kerml

org.omg.kerml.xpect.tests/library/ScalarFunctions.kerml

org.omg.kerml.xpect.tests/library/ScalarValues.kerml

org.omg.kerml.xpect.tests/library/StatePerformances.kerml

org.omg.kerml.xpect.tests/library/TransitionPerformances.kerml

org.omg.kerml.xpect.tests/library/TrigFunctions.kerml

org.omg.kerml.xpect.tests/library/VectorFunctions.kerml

org.omg.kerml.xpect.tests/plugin.properties:
⋮
│pluginName = org.omg.kerml.xpect.tests
│providerName = Eclipse Xpect Project

org.omg.kerml.xpect.tests/pom.xml

org.omg.kerml.xpect.tests/src/DependencyMembership2_Feature_Rdef.kerml

org.omg.kerml.xpect.tests/src/DependencyMultipleMembership.kerml

org.omg.kerml.xpect.tests/src/DependencyMultipleMembership_Feature_FT.kerml

org.omg.kerml.xpect.tests/src/DependencyMultipleMembership_Feature_Rdef.kerml

org.omg.kerml.xpect.tests/src/DependencyPackageAlias1_Feature.kerml

org.omg.kerml.xpect.tests/src/DependencyPackageAlias2.kerml

org.omg.kerml.xpect.tests/src/DependencyPackageAlias2_Feature_FT.kerml

org.omg.kerml.xpect.tests/src/DependencyPackageAlias2_Feature_Rdef.kerml

org.omg.kerml.xpect.tests/src/DependencySamePackageName_A_Feature.kerml

org.omg.kerml.xpect.tests/src/DependencySamePackageName_B_Feature.kerml

org.omg.kerml.xpect.tests/src/DependencyVisibilityPackage.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/KerMLXpectGlobalScopeProvider.java:
⋮
│public class KerMLXpectGlobalScopeProvider extends KerMLGlobalScopeProvider {
│       
│  @Override
│  public Predicate<IEObjectDescription> getRootFilter() {
│    return description -> (!"Base".equals(description.getName().getFirstSegment()));
│  }
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/KerMLXpectRuntimeModule.java:
⋮
│public class KerMLXpectRuntimeModule extends KerMLRuntimeModule {
│       
│  @Override
│  public Class<? extends IGlobalScopeProvider> bindIGlobalScopeProvider() {
│    return KerMLXpectGlobalScopeProvider.class;
│  }
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/KerMLXtextTests.java:
⋮
│public class KerMLXtextTests extends XtextTests {
│
│       @BeforeClass
│       public static void setup() {
│               EStructuralFeature.Internal.SettingDelegate.Factory.Registry.INSTANCE.
│                       put(DerivedPropertySettingDelegateFactory.SYSML_ANNOTATION, new DerivedPropertySettingDelegateFa
│               EOperation.Internal.InvocationDelegate.Factory.Registry.INSTANCE.
│                       put(OperationInvocationDelegateFactory.SYSML_ANNOTATION, new OperationInvocationDelegateFactory(
│       }
│
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/AllKerMLXpectTests.java:
⋮
│@SuiteClasses({ 
│               KerMLImportGlobalTest.class, //
│               KerMLImportLocalTest.class, //
│               KerMLImportRecursiveTest.class, //
│               KerMLLinkingTest.class,//
│               KerMLParsingTest.class, //
│               KerMLScopingTest.class, //
│               KerMLXtextTest.class, //
│               KerMLValidationTest.class, //
│               KerMLVisibilityTest.class,
⋮
│public class AllKerMLXpectTests {
│
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/global/DependencyPackageAlias0_A.ker

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/global/DependencyPackageAlias0_AA.ke

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/global/DependencyPackageAlias12.kerm

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/global/DependencySamePackageName.ker

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/global/DependencyVisibilityPackage.k

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/global/KerMLImportGlobalTest.java:
⋮
│@RunWith(XpectRunner.class)
│@XpectTestFiles(fileExtensions = "xt")
│public class KerMLImportGlobalTest extends KerMLXtextTests {
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/local/Import_All.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/local/Import_Circular.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/local/Import_Filtered.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/local/Import_Filtered2.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/local/Import_Private.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/local/Import_QualifiedName1.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/local/Import_Recursive.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/local/KerMLImportLocalTest.java:
⋮
│@RunWith(XpectRunner.class)
│@XpectTestFiles(fileExtensions = "xt")
│public class KerMLImportLocalTest extends KerMLXtextTests {
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/Import_Recursive1.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/Import_Recursive1.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/Import_Recursive2.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/Import_Recursive2.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/Import_Recursive2_scope_ot

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/Import_Recursive3.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/Import_Recursive3_scope_ot

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/Import_Recursive4.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/Import_Recursive5.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/Import_Recursive6.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/Import_Recursive7.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/imports/recursive/KerMLImportRecursiveTest.j
⋮
│@RunWith(XpectRunner.class)
│@XpectTestFiles(fileExtensions = "xt")
│public class KerMLImportRecursiveTest extends KerMLXtextTests {
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/indexing/KerMLIndexerTest.java:
⋮
│@RunWith(XpectRunner.class)
│@XpectTestFiles(fileExtensions = "xt")
│@XpectImport({ XtextStandaloneSetup.class, XtextWorkspaceSetup.class })
│public class KerMLIndexerTest {
│
│       @BeforeClass
│       public static void setup() {
⋮
│       protected static class EObjectDescriptionToStringMapper implements Function<IEObjectDescription, S
│               public String apply(IEObjectDescription desc) {
│                       return desc.getEClass().getEPackage().getNsPrefix() + "::" + desc.getEClass().getName() + ": " 
│                                       + desc.getName().toString("::");
│               }
⋮
│       @Xpect(liveExecution = LiveExecutionType.FAST)
│       public void exportedObjects(@LinesExpectation ILinesExpectation expectation, @ThisResource XtextRe
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/linking/Classes2.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/linking/GlobalQualification.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/linking/KerMLLinkingTest.java:
⋮
│@RunWith(XpectRunner.class)
│@XpectTestFiles(fileExtensions = "xt")
│public class KerMLLinkingTest extends LinkingTest {
│
│       @BeforeClass
│       public static void setup() {
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/KerMLParsingTest.java:
⋮
│@RunWith(XpectRunner.class)
│public class KerMLParsingTest extends KerMLXtextTests {
│
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_Associations.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_Associations_OwnedEnds.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_BadScopeWithOnlyTwoDot.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_BadScopeWithOnlyTwoDotA

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_CircularReferences.kerm

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_Classifiers.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_Dependencies.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_Import_Visibility.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_Indexing.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_LibraryPackage_Metadata

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_LiteralExpression.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_Metadata.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_MultiplicityDeclaration

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_RedefinitionScoping.ker

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_ScopeWithFourDotAndDot.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_ScopeWithOnlyDot.kerml.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/parsing/ParsingTests_Scoping.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/scoping/Classes2.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/scoping/KerMLScopingTest.java:
⋮
│@RunWith(XpectRunner.class)
│@XpectTestFiles(fileExtensions = "xt")
│public class KerMLScopingTest extends KerMLXtextTests {
│
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/scoping/ShortName_Import_Valid4.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/scoping/ShortName_Import_Valid4a.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/scoping/ShortName_Scoping_Valid1.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/scoping/ShortName_Scoping_Valid2.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/KerMLXtextTest.java:
⋮
│@RunWith(XpectRunner.class)
│public class KerMLXtextTest extends KerMLXtextTests {
│
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_FeatureSubset.kerm

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_MultipleInheritanc

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_MultipleInheritanc

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_MultipleInheritanc

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_MultipleInheritanc

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_MultipleInheritanc

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_MultipleInheritanc

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_MultipleInheritanc

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_NamedMemberForPriv

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_NamedMemberForPriv

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_NamedMemberFromCon

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_NamedMemberFromInh

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_NamedMemberFromInh

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_NamedMemberFromInh

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_NamedMemberFromInh

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_NamedMemberFromOth

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_NamedMemberFromOth

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MemberNameTests_UseFQNInSamePackag

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImportTests_ImportFeatureW

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_ImportClass.kerml.x

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_ImportClassWithAlia

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_ImportClassWithAlia

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_ImportClass_FT.kerm

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_ImportImportImp.ker

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_ImportImportImp_FT.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_ImportImportImp_Rde

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_ImportMembershipImp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_ImportMembershipImp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_MembershipImportImp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_MembershipImportImp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/MultipleImport_MembershipImportImp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_AliasImportInMember

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_CircleInheritance.k

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_CircleProblem5.kerm

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportAndInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportAndInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportAndInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportAndInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportAndInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportAndInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportAndInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportAndInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportAndInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportAndInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportPackageAlias2

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_ImportPackageAlias2

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_SameNamesGoodCase.k

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_SameNamesGoodCaseWi

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_SameNamesGoodCaseWi

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_SameNamesImportAsFe

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_SameNamesImport_FT.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_SameNamesImport_Rde

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_SameNamesInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_SameNamesInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_SameNamesInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/ShadowingTests_SameNamesInnerClass

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/SimpleImportAsFeatureTests_ImportC

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/SimpleImportTestsFromOtherFile_Imp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/SimpleImportTestsFromOtherFile_Imp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/SimpleImportTestsFromOtherFile_Imp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/SimpleImportTests_CircleInheritanc

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/SimpleImportTests_ImportPackageAnd

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/SimpleImportTests_ImportPackageAnd

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/testsuite/SimpleImportTests_ImportPackageAnd

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/AssociationTest_EndTypes_invalid.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/ConnectorTest_ConnectorEndSubsett

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/Feature_nonunique_invalid.kerml.x

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/Feature_variable_invalid.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/KerMLValidationTest.java:
⋮
│@RunWith(XpectRunner.class)
│@XpectTestFiles(fileExtensions = "xt")
│public class KerMLValidationTest extends ValidationTest {
│       
│       @BeforeClass
│       public static void setup() {
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/LibraryPackage_invalid_notStandar

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/MetadataTests_SemanticMetadata_in

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/MetadataTests_SemanticMetadata_va

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/MultipleImportTests_ImportFeature

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/MultiplicityRange_invalid.kerml.x

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/Redefinition_Diamond2_valid.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/Redefinition_Diamond_Invalid.kerm

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/ReferenceSubsetting_Invalid.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/ResultExpressionMembership_Invali

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/ShadowingTests_ImportAndInnerClas

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/ShadowingTests_ImportAndInnerClas

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/ShadowingTests_ImportAndInnerClas

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/ShadowingTests_ImportAndInnerClas

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/ShadowingTests_SameNamesBadCase.k

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/ShadowingTests_SameNamesBadCaseWi

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/ShadowingTests_SameNamesBadCaseWi

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/SimpleImportAsFeatureTests_BadImp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/SimpleImportAsFeatureTests_BadImp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/SimpleImportAsFeatureTests_BadImp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/SimpleImportAsFeatureTests_BadImp

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/SimpleImportTestsFromOtherFile_Im

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/Specialization_invalid.kerml.xt

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/Type_Multiplicity_invalid.kerml.x

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/validation/Type_Relationships_invalid.kerml.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/KerMLVisibilityTest.java:
⋮
│@RunWith(XpectRunner.class)
│@XpectTestFiles(fileExtensions = "xt")
│public class KerMLVisibilityTest extends KerMLXtextTests {
│
⋮

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_ImportAsAlias_Inv

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_ImportAsFeatureIn

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_ImportAsFeatureIn

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_ImportAsFeatureIn

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_ImportAsFeatureIn

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_ImportClassAndUse

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_0.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_1.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_2_

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_2_

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_2_

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_2_

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_2_

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_2_

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_2_

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_2_

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_2_

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_2_

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Invalid_3_

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Valid_0.ke

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Valid_1_0.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Import_Valid_3_2.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_ProtectedImport_0

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_ProtectedImport_1

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_ProtectedImport_3

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_ProtectedImport_4

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_ProtectedImport_5

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Protected_1.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Protected_3.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Protected_3x.kerm

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Protected_3y.kerm

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Protected_4.kerml

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Protected_Feature

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_Protected_Nested.

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_PublicImportAsFea

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_PublicImportAsFea

org.omg.kerml.xpect.tests/src/org/omg/kerml/xpect/tests/visibility/VisibilityTests_PublicPackImport.
```
