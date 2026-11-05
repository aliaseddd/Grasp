# Repo map: org.omg.sysml.xpect.tests

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.xpect.tests`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.xpect.tests) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 244 files there; aider read the 244 that `pilot.aiderignore` leaves in, and the map shows 244 of them, 10 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.xpect.tests/.classpath

org.omg.sysml.xpect.tests/.gitignore

org.omg.sysml.xpect.tests/.project

org.omg.sysml.xpect.tests/.settings/org.eclipse.core.resources.prefs

org.omg.sysml.xpect.tests/.settings/org.eclipse.jdt.core.prefs

org.omg.sysml.xpect.tests/.settings/org.eclipse.jdt.ui.prefs

org.omg.sysml.xpect.tests/.settings/org.eclipse.xpect.Xpect.prefs

org.omg.sysml.xpect.tests/META-INF/MANIFEST.MF

org.omg.sysml.xpect.tests/build.properties:
│source.. = src/,\
⋮
│output.. = target/classes/
│bin.includes = .,\
│               plugin.xml,\
│               META-INF/
│additional.bundles = io.github.classgraph.classgraph
│               

org.omg.sysml.xpect.tests/library.domain/Analysis/AnalysisTooling.sysml

org.omg.sysml.xpect.tests/library.domain/Analysis/SampledFunctions.sysml

org.omg.sysml.xpect.tests/library.domain/Analysis/StateSpaceRepresentation.sysml

org.omg.sysml.xpect.tests/library.domain/Analysis/TradeStudies.sysml

org.omg.sysml.xpect.tests/library.domain/Cause and Effect/CausationConnections.sysml

org.omg.sysml.xpect.tests/library.domain/Cause and Effect/CauseAndEffect.sysml

org.omg.sysml.xpect.tests/library.domain/Geometry/ShapeItems.sysml

org.omg.sysml.xpect.tests/library.domain/Geometry/SpatialItems.sysml

org.omg.sysml.xpect.tests/library.domain/Metadata/ImageMetadata.sysml

org.omg.sysml.xpect.tests/library.domain/Metadata/ModelingMetadata.sysml

org.omg.sysml.xpect.tests/library.domain/Metadata/ParametersOfInterestMetadata.sysml

org.omg.sysml.xpect.tests/library.domain/Metadata/RiskMetadata.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQ.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQAcoustics.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQAtomicNuclear.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQBase.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQCharacteristicNumbers.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQChemistryMolecular.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQCondensedMatter.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQElectromagnetism.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQInformation.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQLight.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQMechanics.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQSpaceTime.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/ISQThermodynamics.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/MeasurementRefCalculations.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/MeasurementReferences.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/Quantities.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/QuantityCalculations.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/SI.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/SIPrefixes.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/TensorCalculations.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/Time.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/USCustomaryUnits.sysml

org.omg.sysml.xpect.tests/library.domain/Quantities and Units/VectorCalculations.sysml

org.omg.sysml.xpect.tests/library.domain/Requirement Derivation/DerivationConnections.sysml

org.omg.sysml.xpect.tests/library.domain/Requirement Derivation/RequirementDerivation.sysml

org.omg.sysml.xpect.tests/library.kernel/Base.kerml

org.omg.sysml.xpect.tests/library.kernel/BaseFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/BooleanFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/Clocks.kerml

org.omg.sysml.xpect.tests/library.kernel/CollectionFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/Collections.kerml

org.omg.sysml.xpect.tests/library.kernel/ComplexFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/ControlFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/ControlPerformances.kerml

org.omg.sysml.xpect.tests/library.kernel/DataFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/FeatureReferencingPerformances.kerml

org.omg.sysml.xpect.tests/library.kernel/IntegerFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/KerML.kerml

org.omg.sysml.xpect.tests/library.kernel/Links.kerml

org.omg.sysml.xpect.tests/library.kernel/Metaobjects.kerml

org.omg.sysml.xpect.tests/library.kernel/NaturalFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/NumericalFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/Objects.kerml

org.omg.sysml.xpect.tests/library.kernel/Observation.kerml

org.omg.sysml.xpect.tests/library.kernel/OccurrenceFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/Occurrences.kerml

org.omg.sysml.xpect.tests/library.kernel/Performances.kerml

org.omg.sysml.xpect.tests/library.kernel/RationalFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/RealFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/ScalarFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/ScalarValues.kerml

org.omg.sysml.xpect.tests/library.kernel/SequenceFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/SpatialFrames.kerml

org.omg.sysml.xpect.tests/library.kernel/StatePerformances.kerml

org.omg.sysml.xpect.tests/library.kernel/StringFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/Transfers.kerml

org.omg.sysml.xpect.tests/library.kernel/TransitionPerformances.kerml

org.omg.sysml.xpect.tests/library.kernel/TrigFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/Triggers.kerml

org.omg.sysml.xpect.tests/library.kernel/VectorFunctions.kerml

org.omg.sysml.xpect.tests/library.kernel/VectorValues.kerml

org.omg.sysml.xpect.tests/library.systems/Actions.sysml

org.omg.sysml.xpect.tests/library.systems/Allocations.sysml

org.omg.sysml.xpect.tests/library.systems/AnalysisCases.sysml

org.omg.sysml.xpect.tests/library.systems/Attributes.sysml

org.omg.sysml.xpect.tests/library.systems/Calculations.sysml

org.omg.sysml.xpect.tests/library.systems/Cases.sysml

org.omg.sysml.xpect.tests/library.systems/Connections.sysml

org.omg.sysml.xpect.tests/library.systems/Constraints.sysml

org.omg.sysml.xpect.tests/library.systems/Flows.sysml

org.omg.sysml.xpect.tests/library.systems/Interfaces.sysml

org.omg.sysml.xpect.tests/library.systems/Items.sysml

org.omg.sysml.xpect.tests/library.systems/Metadata.sysml

org.omg.sysml.xpect.tests/library.systems/Parts.sysml

org.omg.sysml.xpect.tests/library.systems/Ports.sysml

org.omg.sysml.xpect.tests/library.systems/Requirements.sysml

org.omg.sysml.xpect.tests/library.systems/StandardViewDefinitions.sysml

org.omg.sysml.xpect.tests/library.systems/States.sysml

org.omg.sysml.xpect.tests/library.systems/SysML.sysml

org.omg.sysml.xpect.tests/library.systems/UseCases.sysml

org.omg.sysml.xpect.tests/library.systems/VerificationCases.sysml

org.omg.sysml.xpect.tests/library.systems/Views.sysml

org.omg.sysml.xpect.tests/plugin.xml

org.omg.sysml.xpect.tests/pom.xml

org.omg.sysml.xpect.tests/src/Vehicle.sysml

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/SysMLXpectGlobalScopeProvider.java:
⋮
│public class SysMLXpectGlobalScopeProvider extends SysMLGlobalScopeProvider {
│       
│  @Override
│  public Predicate<IEObjectDescription> getRootFilter() {
│    return description -> (!"Base".equals(description.getName().getFirstSegment()));
│  }
│  
⋮

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/SysMLXpectRuntimeModule.java:
⋮
│public class SysMLXpectRuntimeModule extends SysMLRuntimeModule {
│  @Override
│  public Class<? extends IGlobalScopeProvider> bindIGlobalScopeProvider() {
│    return SysMLXpectGlobalScopeProvider.class;
│  }
⋮

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/AllSysMLXpectTests.java:
⋮
│@SuiteClasses({ 
│               org.omg.sysml.xpect.tests.expression.SysMLTests.class,
│               org.omg.sysml.xpect.tests.simpletests.SysMLTests.class,
│               org.omg.sysml.xpect.tests.validation.invalid.SysMLTests.class,
│               org.omg.sysml.xpect.tests.validation.valid.SysMLTests.class,
⋮
│public class AllSysMLXpectTests {
│
⋮

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/expression/15_01-Constants.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/expression/PathExpressions.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/expression/SimpleArithmeticExpression.sysml.

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/expression/SimpleUnitExpression.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/expression/SysMLTests.java:
⋮
│@RunWith(XpectRunner.class)
│public class SysMLTests extends KerMLXtextTests {
│
⋮

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/linking/GlobalQualification.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/linking/LinkingTests.java:
⋮
│@RunWith(XpectRunner.class)
│public class LinkingTests extends KerMLXtextTests {
│
⋮

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/queryx/failing/QPE-Qualifier.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/queryx/failing/QPE-Traversal.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/queryx/failing/QPE-Wildcard.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/queryx/failing/SysMLQueryFailingTest.java:
⋮
│@RunWith(XpectRunner.class)
│public class SysMLQueryFailingTest extends KerMLXtextTests {
│
⋮

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/ActionTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/AliasTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/AllocationTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/AnalysisTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/AnnotationTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/AssignmentTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/CalculationTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/CommentTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/ConjugationTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/ConnectionTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/ConstraintTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/ConstraintTest_verbose.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/ControlNodeTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/DecisionTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/DefaultValueUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/DependencyTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/ElementFilter.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/EnumerationTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/FeaturePathTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/ImportTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/IndividualTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/InterfaceTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/ItemTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/MetadataTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/MultiplicityTest.sysml

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/OccurrenceTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/ParameterTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/PartTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/RequirementTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/RootPackageTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/StateTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/StructuredControlTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/SysMLTests.java:
⋮
│@RunWith(XpectRunner.class)
│public class SysMLTests extends KerMLXtextTests {
│
⋮

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/TextualRepresentationTest.sysml.

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/TradeStudyTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/UseCaseTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/VariabilityTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/VerificationTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/simpletests/ViewTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/ActionUsage_invalid.sysml

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/AllocationUsage_Invalid.s

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/AssignmentActionUsage_inv

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/AttributeUsage_invalid.sy

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/BindingConnector_Invalid2

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/BindingConnector_Invalid3

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/BindingConnector_invalid0

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/BindingConnector_invalid1

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/BindingConnector_redefine

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/CalculationUsage_Invalid1

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/CalculationUsage_Invalid2

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/CaseSubjectObjective_Inva

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/CaseUsage_Invalid.sysml.x

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/ConnectionUsage_End_Inval

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/ConnectionUsage_Invalid.s

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/Connector_Invalid.sysml.x

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/ConstraintUsage_Invalid.s

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/DefaultMultiplicity_inval

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/EnumerationUsage_invalid.

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/FeaturePath_Invalid.sysml

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/Feature_invalid_noType.sy

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/FlowUsage_End_Invalid.sys

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/FlowUsage_Invalid.sysml.x

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/Import_Visibility_Invalid

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/IndividualUsage_Invalid.s

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/InterfaceUsage_Invalid.sy

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/ItemUsage_invalid.sysml.x

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/Membership_distingushabil

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/MetadataUsage_Invalid.sys

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/OccurrenceUsage_invalid.s

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/PartUsage_invalid.sysml.x

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/PortUsage_Invalid.sysml.x

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/PortionUsage_Invalid.sysm

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/RedefinitionDiamond1_inva

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/RedefinitionDiamond_Inval

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/Redefinition_Multiplicity

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/Redefinition_OwningType_I

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/Relationship_invalid_rela

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/Relationship_invalid_rela

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/RequirementSubject_Invali

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/RequirementUsage_Invalid.

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/SemanticMetadata_invalid.

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/StateSubactions_invalid.s

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/StateUsage_invalid.sysml.

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/SysMLTests.java:
⋮
│@RunWith(XpectRunner.class)
│public class SysMLTests extends KerMLXtextTests {
│       
⋮

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/TransitionUsage_invalid.s

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/UsageDefinition_invalid.s

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/Variability_invalid.sysml

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/Verification_invalid.sysm

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/invalid/ViewRendering_invalid.sys

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/ActionUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/AttributeUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/BindingConnector_path.sysml

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/BindingConnector_redefined.

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/BindingConnector_simple.sys

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/CalculationUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/CaseUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Connector0.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Connector1.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Connector2.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Connector3.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Connector4.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/ConstraintUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Expose_Visibility.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/IndividualUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/InterfaceUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/ItemUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/KernelLibraryTest.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Metadata_valid.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/PartUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/PortUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/RedefinitionDiamond0.sysml.

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/RedefinitionDiamond2.sysml.

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/RedefinitionHopthrough.sysm

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Redefinition_MultiplicityCo

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Redefinition_OwningType.sys

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Redefinition_OwningType_Cyc

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/RequirementUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/SemanticMetadata_valid.sysm

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/StateUsage.sysml.xt

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Subsetting_MultiplicityConf

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Subsetting_OwningType.sysml

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Subsetting_UniquenessConfor

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/SysMLTests.java:
⋮
│@RunWith(XpectRunner.class)
│public class SysMLTests extends KerMLXtextTests {
│       
⋮

org.omg.sysml.xpect.tests/src/org/omg/sysml/xpect/tests/validation/valid/Variability.sysml.xt
```
