# Repo map: SysML v2 Pilot Implementation

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [the whole repository](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--map-tokens 8192`. Git tracks 4,691 files there; aider read the 3,064 that `pilot.aiderignore` leaves in, and the map shows 122 of them, 122 with definitions. [The README](README.md) says how to read it and what it leaves out.

```text
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

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/FeatureTypingParserPostProcessor.java:
⋮
│public class FeatureTypingParserPostProcessor extends SpecializationParserPostProcessor {
│
│       public FeatureTypingParserPostProcessor(FeatureTyping element) {
│               super(element);
│       }
│
│       @Override
│       public FeatureTyping getTarget() {
│               return (FeatureTyping)super.getTarget();
│       }
│
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/ElementItemProvider.java:
⋮
│public class ElementItemProvider 
⋮
│               IItemPropertySource {
⋮
│       @Override
│       public ResourceLocator getResourceLocator() {
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/SysMLEditPlugin.java:
⋮
│public final class SysMLEditPlugin extends EMFPlugin {
│       /**
│        * Keep track of the singleton.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public static final SysMLEditPlugin INSTANCE = new SysMLEditPlugin();
│
│       /**
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/SysMLItemProviderAdapterFactory.java:
⋮
│public class SysMLItemProviderAdapterFactory extends SysMLAdapterFactory implements ComposeableAdap
│       /**
│        * This keeps track of the root adapter factory that delegates to this adapter factory.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       protected ComposedAdapterFactory parentAdapterFactory;
│
│       /**
⋮
│       @Override
│       public ComposeableAdapterFactory getRootAdapterFactory() {
⋮

org.omg.sysml.editor/src/org/omg/sysml/lang/sysml/presentation/SysMLEditor.java:
⋮
│public class SysMLEditor
│       extends MultiPageEditorPart
│       implements IEditingDomainProvider, ISelectionProvider, IMenuListener, IViewerProvider, IGotoMarker
⋮
│       @Override
│       public void init(IEditorSite site, IEditorInput editorInput) {
⋮
│       private static String getString(String key) {
│               return SysMLEditorPlugin.INSTANCE.getString(key);
⋮
│       private static String getString(String key, Object s1) {
│               return SysMLEditorPlugin.INSTANCE.getString(key, new Object [] { s1 });
⋮

org.omg.sysml.editor/src/org/omg/sysml/lang/sysml/presentation/SysMLEditorPlugin.java:
⋮
│public final class SysMLEditorPlugin extends EMFPlugin {
│       /**
│        * Keep track of the singleton.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public static final SysMLEditorPlugin INSTANCE = new SysMLEditorPlugin();
│       
│       /**
⋮

org.omg.sysml.editor/src/org/omg/sysml/lang/sysml/presentation/SysMLModelWizard.java:
⋮
│public class SysMLModelWizard extends Wizard implements INewWizard {
│       /**
│        * The supported extensions for created files.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public static final List<String> FILE_EXTENSIONS =
│               Collections.unmodifiableList(Arrays.asList(SysMLEditorPlugin.INSTANCE.getString("_UI_SysMLEditorF
│
⋮
│       @Override
│       public void init(IWorkbench workbench, IStructuredSelection selection) {
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/SequenceFunction.
⋮
│public abstract class SequenceFunction implements LibraryFunction {
│
│       @Override
│       public String getPackageName() {
│               return "SequenceFunctions";
│       }
│
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/trig/TrigFunction.java:
⋮
│public abstract class TrigFunction implements LibraryFunction {
│
│       @Override
│       public String getPackageName() {
│               return "TrigFunctions";
│       }
│       
│       protected abstract EList<Element> realFunction(double x);
│
│       @Override
⋮

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

org.omg.sysml.logic/src/main/java/org/omg/sysml/adapter/TypeAdapter.java:
⋮
│public class TypeAdapter extends NamespaceAdapter {
│
│       public TypeAdapter(Type element) {
│               super(element);
│       }
│       
│       public Type getTarget() {
│               return (Type)super.getTarget();
│       }
│       
⋮
│       public Type getLibraryType(String... defaultNames) {
│               return SysMLLibraryUtil.getLibraryType(getTarget(), defaultNames);
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/CalculationUsage_evaluate_Invoca
⋮
│public class CalculationUsage_evaluate_InvocationDelegate extends BasicInvocationDelegate {
│
│       public CalculationUsage_evaluate_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               return new BasicEList<>();
│       }
│
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/CalculationUsage_modelLevelEvalu
⋮
│public class CalculationUsage_modelLevelEvaluable_InvocationDelegate extends BasicInvocationDelegat
│
│       public CalculationUsage_modelLevelEvaluable_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               return false;
│       }
│
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/ConstraintUsage_evaluate_Invocat
⋮
│public class ConstraintUsage_evaluate_InvocationDelegate extends BasicInvocationDelegate {
│
│       public ConstraintUsage_evaluate_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               return new BasicEList<>();
│       }
│
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/ConstraintUsage_modelLevelEvalua
⋮
│public class ConstraintUsage_modelLevelEvaluable_InvocationDelegate extends BasicInvocationDelegate
│
│       public ConstraintUsage_modelLevelEvaluable_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               return false;
│       }
│
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/Expression_evaluate_InvocationDe
⋮
│public class Expression_evaluate_InvocationDelegate extends BasicInvocationDelegate {
│
│       public Expression_evaluate_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               Expression self = (Expression)target;
│               Element evaluateTarget = (Element)arguments.get(0);
│               
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/Expression_modelLevelEvaluable_I
⋮
│public class Expression_modelLevelEvaluable_InvocationDelegate extends BasicInvocationDelegate {
│
│       public Expression_modelLevelEvaluable_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               Expression self = (Expression) target;
│               @SuppressWarnings("unchecked")
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/LifeClass_effectiveName_Invocati
⋮
│public class LifeClass_effectiveName_InvocationDelegate extends BasicInvocationDelegate {
│
│       public LifeClass_effectiveName_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               return "Life";
│       }
│
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/OperationInvocationDelegateFacto
⋮
│public class OperationInvocationDelegateFactory implements InvocationDelegate.Factory {
│       
│       public static final String SYSML_ANNOTATION = "http://www.omg.org/spec/SysML";
│
│       @Override
│       public InvocationDelegate createInvocationDelegate(EOperation eOperation) {
│               if (eOperation.getEAnnotation(SYSML_ANNOTATION) == null) {
│                       // This is not our operation, use default invocation delegate
│                       return new BasicInvocationDelegate(eOperation);
│               }
│               
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/OperationInvocationDelegateSelec
⋮
│public class OperationInvocationDelegateSelector extends BasicInvocationDelegate {
│       
│       private static final String PACKAGE_NAME = OperationInvocationDelegateSelector.class.getPackage().
│       
│       private final Map<EClass, BasicInvocationDelegate> delegateMap = new HashMap<>();
│
│       public OperationInvocationDelegateSelector(EOperation operation) {
│               super(operation);
│       }
│               
⋮
│       protected BasicInvocationDelegate getInvocationDelegate(EClass eClass) {
│               Constructor<?> constructor = getDelegateConstructor(eClass);
│
│               if (constructor == null) {
│                       // This eClass does not have a specific delegate implementation
│                       return null;
│               }
│               
│               try {
│                       return (BasicInvocationDelegate) constructor.newInstance(eOperation);
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/ParameterMembership_parameterDir
⋮
│public class ParameterMembership_parameterDirection_InvocationDelegate extends BasicInvocationDeleg
│
│       public ParameterMembership_parameterDirection_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               return FeatureDirectionKind.IN;
│       }
│
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/ReturnParameterMembership_parame
⋮
│public class ReturnParameterMembership_parameterDirection_InvocationDelegate extends BasicInvocatio
│
│       public ReturnParameterMembership_parameterDirection_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               return FeatureDirectionKind.OUT;
│       }
│
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/setting/BasicDerivedListSettingDelegate.jav
⋮
│public abstract class BasicDerivedListSettingDelegate extends BasicDerivedPropertySettingDelegate {
│
│       public BasicDerivedListSettingDelegate(EStructuralFeature eStructuralFeature) {
│               super(eStructuralFeature);
│       }
│
│       @Override 
│       protected boolean isSet(InternalEObject owner) {
│               return !basicGet(owner).isEmpty();
│       }
│
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/setting/BasicDerivedObjectSettingDelegate.j
⋮
│public abstract class BasicDerivedObjectSettingDelegate extends BasicDerivedPropertySettingDelegate
│
│       public BasicDerivedObjectSettingDelegate(EStructuralFeature eStructuralFeature) {
│               super(eStructuralFeature);
│       }
│
│       @Override
│       protected Object get(InternalEObject owner, boolean resolve, boolean coreType) {
│               EObject object = basicGet(owner);
│               return object != null && object.eIsProxy() && resolve? 
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/setting/BasicDerivedPropertySettingDelegate
⋮
│public abstract class BasicDerivedPropertySettingDelegate extends BasicSettingDelegate.Stateless {
│
│       public BasicDerivedPropertySettingDelegate(EStructuralFeature eStructuralFeature) {
│               super(eStructuralFeature);
│       }
│
│       @Override
│       protected Object get(InternalEObject owner, boolean resolve, boolean coreType) {
│               return basicGet(owner);
│       }
│       
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/setting/DerivedPropertySettingDelegateFacto
⋮
│public class DerivedPropertySettingDelegateFactory 
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/setting/Step_parameter_SettingDelegate.java
⋮
│public class Step_parameter_SettingDelegate extends Type_directedFeature_SettingDelegate {
│
│       public Step_parameter_SettingDelegate(EStructuralFeature eStructuralFeature) {
│               super(eStructuralFeature);
│       }
│
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/setting/Type_directedFeature_SettingDelegat
⋮
│public class Type_directedFeature_SettingDelegate extends BasicDerivedListSettingDelegate {
│
│       public Type_directedFeature_SettingDelegate(EStructuralFeature eStructuralFeature) {
│               super(eStructuralFeature);
│       }
│
│       @Override
│       protected EList<?> basicGet(InternalEObject owner) {
│               ElementUtil.clearCachesOf((Type)owner);
│               return TypeUtil.getDirectedFeatureOf((Type)owner);
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/setting/Type_endFeature_SettingDelegate.jav
⋮
│public class Type_endFeature_SettingDelegate extends BasicDerivedListSettingDelegate  {
│
│       public Type_endFeature_SettingDelegate(EStructuralFeature eStructuralFeature) {
│               super(eStructuralFeature);
│       }
│
│       @Override
│       protected EList<? extends Feature> basicGet(InternalEObject owner) {
│               ElementUtil.clearCachesOf((Type)owner);
│               return TypeUtil.getEndFeatureOf((Type)owner, Feature.class, eStructuralFeature.getFeatureID());
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/expressions/ExpressionEvaluator.java:
⋮
│public interface ExpressionEvaluator {
│
│       public EList<Element> evaluate(Expression expression, Element target);
│       
│       public EList<Element> evaluateNull(NullExpression expression, Element target);
│       public EList<Element> evaluateLiteral(LiteralExpression expression, Element target);
│       public EList<Element> evaluateFeatureReference(FeatureReferenceExpression expression, Element targ
│       public EList<Element> evaluateMetadataAccess(MetadataAccessExpression expression, Element target);
│       public EList<Element> evaluateInvocation(InvocationExpression expression, Element target);
│       public EList<Element> evaluateConstructor(ConstructorExpression expression, Element target);
│       
⋮
│       public default EList<Element> evaluateArgument(InvocationExpression invocation, int i, Element tar
│               EList<Expression> arguments = invocation.getArgument();
│               return i >= arguments.size()? new BasicEList<>(): evaluate(arguments.get(i), target);
⋮
│       public default Element argumentValue(InvocationExpression invocation, int i, Element target) {
│               EList<Element> argumentValues = evaluateArgument(invocation, i, target);
│               return argumentValues == null || argumentValues.size() != 1? null: argumentValues.get(0);
⋮
│       public default EList<Element> expressionValue(InvocationExpression invocation, int i, Element targ
│               Element value = argumentValue(invocation, i, target);
│               return value instanceof Expression? evaluate((Expression)value, target): null;
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/expressions/ModelLevelLibraryFunctionFactory.java:
⋮
│public class ModelLevelLibraryFunctionFactory {
│       
│       public static final ModelLevelLibraryFunctionFactory INSTANCE = new ModelLevelLibraryFunctionFacto
│
│       private Map<String, LibraryFunction> functionMap = null;
│       private Map<String, LibraryFeature> featureMap = null;
│
│       protected void initialize() {
│               functionMap = new HashMap<>();
│               featureMap = new HashMap<>();
│               
⋮
│       protected void put(LibraryFunction functionImpl) {
│               for (String name: functionImpl.getQualifiedNames()) {
│                       functionMap.put(name, functionImpl);
│               }
⋮
│       protected void put(LibraryFeature featureImpl) {
│               featureMap.put(featureImpl.getQualifiedName(), featureImpl);
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/expressions/functions/LibraryFunction.java:
⋮
│public interface LibraryFunction {
│       
│       abstract public String getPackageName();
│
│       public default String getFunctionName() {
│               return null;
│       }
│       
│       public default String[] getFunctionNames() {
│               String op = getFunctionName();
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/expressions/functions/control/ConditionalLogicalFunc
⋮
│public abstract class ConditionalLogicalFunction extends ControlFunction {
│       
│       protected abstract boolean firstValueTest(Boolean firstValue);
│       protected abstract boolean firstValueResult();
│
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               Boolean firstValue = evaluator.booleanValue(invocation, 0, target);
│               if (firstValueTest(firstValue)) {
│                       return EvaluationUtil.booleanResult(firstValueResult());
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/expressions/functions/data/ArithmeticFunction.java:
⋮
│public abstract class ArithmeticFunction extends DataFunction {
│       
│       protected EList<Element> unaryIntegerOp(int x) {
│               return null;
│       }
│       
│       protected EList<Element> unaryRealOp(double x) {
│               return null;
│       }
│
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/util/ElementUtil.java:
⋮
│public class ElementUtil {
│       
│       private ElementUtil() {
│       }
│       
│       // General
│       
│       /**
│        * Converts a string literal or unrestricted name with escaped characters 
│        * into a string in which the escape sequences are replaced with the corresponding 
⋮
│       public static void clearCachesOf(Element element) {
│               getElementAdapter(element).clearCaches();
⋮
│       public static void transformAll(ResourceSet resourceSet, boolean addImplicitElements) {
│               for (Resource resource: resourceSet.getResources()) {
│                       transformAll(resource, addImplicitElements);
│               }
⋮
│       public static void transformAll(Resource resource, boolean addImplicitElements) {
│               for (EObject object: resource.getContents()) {
│                       if (object instanceof Element) {
│                               transformAll((Element)object, addImplicitElements);
│                       }
│               }
⋮
│       public static void transformAll(Element root, boolean addImplicitElements) {
│               transform(root);
│               for (Relationship relationship: root.getOwnedRelationship()) {
│                       // transformAll(relationship, addImplicitElements);
│                       for (Element element: relationship.getOwnedRelatedElement()) {
│                               transformAll(element, addImplicitElements);
│                       }
│               }
│               if (addImplicitElements && root instanceof Type) {
│                       root.setIsImpliedIncluded(true);
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/util/EvaluationUtil.java:
⋮
│public class EvaluationUtil {
│
│       public static Feature getAnnotatedElementFeature(MetadataFeature metadata) {
│               EList<Element> annotatedElements = metadata.getAnnotatedElement();
│               return (Feature)SysMLLibraryUtil.getLibraryType(
│                               annotatedElements.isEmpty()? metadata: annotatedElements.get(0), 
│                               ImplicitGeneralizationMap.getDefaultSupertypeFor(metadata.getClass(), "annotatedElement"));
│       }
│       
│       public static Type getPrimitiveType(Element context, EClass eClass) {
⋮
│       public static EList<Element> singletonList(Element element) {
│               if (element == null) {
│                       return null;
│               } else {
│                       EList<Element> result = new BasicEList<>();
│                       result.add(element);
│                       return result;
│               }
⋮
│       public static EList<Element> booleanResult(boolean value) {
│               return singletonList(literalBoolean(value));
⋮
│       public static EList<Element> realResult(double value) {
│               return singletonList(literalRational(value));
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/util/ExpressionUtil.java:
⋮
│public class ExpressionUtil {
│       
│       private ExpressionUtil() {
│       }
│       
│       public static final String COLLECTION_DATA_TYPE = "Collections::Collection";
│       public static final String ORDERED_COLLECTION_DATA_TYPE = "Collections::OrderedCollection";
│       public static final String ARRAY_DATA_TYPE = "Collections::Array";
│
│       public static final String SELF_REFERENCE_FEATURE = "Base::Anything::self";
⋮
│       public static boolean checkConditionOn(Element element, Expression condition) {
│               if (condition == null) {
│                       return true;
│               } else {
│                       EList<Element> result = condition.evaluate(element);
│                       return result != null && result.size() == 1 && result.get(0) instanceof LiteralBoolean && 
│                                       ((LiteralBoolean)result.get(0)).isValue();
│               }
⋮
│       public static Expression getResultExpressionOf(Type type) {
│               return (Expression)TypeUtil.getFeatureByMembershipIn(type, ResultExpressionMembership.class);
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/util/FeatureUtil.java:
⋮
│public class FeatureUtil {
│       
│       private FeatureUtil() {
│       }
│
│       protected static FeatureAdapter getFeatureAdapter(Feature target) {
│               return (FeatureAdapter)ElementUtil.getElementAdapter(target);
│       }
│       
│       // Utility
│       
⋮
│       public static <T> T getFirstTypeOf(Feature feature, Class<T> kind) {
│               return FeatureUtil.getAllTypesOf(feature).stream().
│                               filter(kind::isInstance).
│                               map(kind::cast).
│                               findFirst().
│                               orElse(null);
⋮
│       public static <T> EList<T> getAllTypesOf(Feature feature, Class<T> kind, int featureId) {               
│               EList<T> types = new NonNotifyingEObjectEList<T>(kind, (InternalEObject)feature, featureId);
│           getAllTypesOf(feature).stream().
│               filter(kind::isInstance).
│               map(kind::cast).
│               forEachOrdered(types::add);
│               return types;
⋮
│       public static EList<Type> getAllTypesOf(Feature feature) {
│               return getFeatureAdapter(feature).getAllTypes();
⋮
│       public static <T extends Feature> T getEffectiveReferencedFeatureOf(T feature, Class<T> kind) {
│               ReferenceSubsetting subsetting = feature.getOwnedReferenceSubsetting();
│               if (subsetting != null) {
│                       Feature referencedFeature = getBasicFeatureOf(subsetting.getReferencedFeature());
│                       if (kind.isInstance(referencedFeature)) {
│                               return kind.cast(referencedFeature);
│                       }
│               }
│               return feature;
⋮
│       public static List<Feature> getRedefinedFeaturesWithComputedOf(Feature feature) {
│               return getFeatureAdapter(feature).getRedefinedFeaturesWithComputed();
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/util/OperandEList.java:
⋮
│public class OperandEList implements InternalEList<Expression> {
│       private InvocationExpression containingExpression;
│       
│       public OperandEList(InvocationExpression containingExpression) {
│               this.containingExpression = containingExpression;
│       }
│       
│       @Override
│       public void addUnique(Expression object) {
│               TypeUtil.addOwnedParameterTo(containingExpression, object).
⋮
│       @Override
│       public void clear() {
│
⋮
│       @Override
│       public NotificationChain basicRemove(Object object, NotificationChain notifications) {
⋮
│       @Override
│       public NotificationChain basicAdd(Expression object, NotificationChain notifications) {
⋮
│       @Override
│       public int size() {
⋮
│       @Override
│       public boolean isEmpty() {
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/util/SysMLLibraryUtil.java:
⋮
│public class SysMLLibraryUtil {
│
│       /**
│        * Functional strategy used to obtain a library provider for a given EMF
│        * resource.
│        */
│       @FunctionalInterface
│       public interface ProviderLookup {
│
│               /**
⋮
│       public static Type getLibraryType(Element context, String... defaultNames) {
│               for (String defaultName : defaultNames) {
│                       Element element = getLibraryElement(context, defaultName);
│                       if (element instanceof Type type) {
│                               return type;
│                       }
│               }
│               return null;
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/util/TypeUtil.java:
⋮
│public class TypeUtil {
│       
│       private TypeUtil() {
│       }
│
│       protected static TypeAdapter getTypeAdapter(Type target) {
│               return (TypeAdapter)ElementUtil.getElementAdapter(target);
│       }
│       
│       // Inheritance
│       
⋮
│       public static Feature getResultParameterOf(Type type) {
│               return getResultParameterOf(type, new HashSet<>());
⋮
│       private static Feature getResultParameterOf(Type type, Set<Type> visited) {
│               visited.add(type);
│               getTypeAdapter(type).addAdditionalMembers();
│               Feature resultParameter = getOwnedResultParameterOf(type);
│               if (resultParameter == null) {
│                       for (Type general: getGeneralTypesOf(type)) {
│                               if (general != null && !visited.contains(general)) {
│                                       resultParameter = getResultParameterOf(general, visited);
│                                       if (resultParameter != null) {
│                                               break;
⋮
│       @SuppressWarnings("unchecked")
│       public static <T extends Feature> T getOwnedParameterOf(Type type, int index, Class<T> kind) {
⋮
│       public static <M extends Membership, E extends Element> void addFeaturesByMembership(Type type, 
⋮
│       public static ParameterMembership addOwnedParameterTo(Type type, Expression value) {
│               ParameterMembership membership = addBoundFeatureTo(type, value, SysMLFactory.eINSTANCE.createPara
│               membership.getOwnedMemberParameter().setDirection(FeatureDirectionKind.IN);
│               return membership;
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/util/UsageUtil.java:
⋮
│public class UsageUtil {
│       
│       private UsageUtil() {
│       }
│
│       protected static UsageAdapter getUsageAdapter(Usage usage) {
│               return (UsageAdapter)ElementUtil.getElementAdapter(usage);
│       }
│       
│       // Time Varying
│       
⋮
│       public static <T extends RequirementConstraintMembership> Stream<ConstraintUsage> getRequirementCo
│               return owner.getOwnedFeatureMembership().stream().
│                               filter(mem->membershipClass.isInstance(mem) && ((RequirementConstraintMembership)mem).getKind()
│                               map(mem->((RequirementConstraintMembership)mem).getOwnedConstraint()).
│                               filter(constraint->constraint != null);
⋮
│       public static Stream<ConstraintUsage> getRequirementConstraints(Type owner, RequirementConstraintK
│               return getRequirementConstraints(owner, RequirementConstraintMembership.class, kind);
⋮
│       public static ActionUsage getStateSubaction(Type owner, StateSubactionKind kind) {
│               return getStateSubactionMembershipsOf(owner, kind).stream().
│                               map(StateSubactionMembership::getAction).
│                               filter(action->action != null).
│                               findAny().orElse(null);
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/ActionDefinition.java:
⋮
│public interface ActionDefinition extends OccurrenceDefinition, Behavior {
│       /**
│        * Returns the value of the '<em><b>Action</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.ActionUsage}.
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Behavior#getStep() <em>Step</em>}'</li>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Definition#getUsage() <em>Usage</em>}'</li>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/ActionUsage.java:
⋮
│public interface ActionUsage extends OccurrenceUsage, Step {
│       /**
│        * Returns the value of the '<em><b>Action Definition</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Behavior}.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Step#getBehavior() <em>Behavior</em>}'</li>
│        *   <li>'{@link org.omg.sysml.lang.sysml.OccurrenceUsage#getOccurrenceDefinition() <em>Occurrence
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/AnnotatingElement.java:
⋮
│public interface AnnotatingElement extends Element {
│       /**
│        * Returns the value of the '<em><b>Annotated Element</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Element}.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * <!-- begin-model-doc -->
│        * <p>The <code>Elements</code> that are annotated by this <code>AnnotatingElement</code>. If <cod
│        * 
│        * <!-- end-model-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Behavior.java:
⋮
│public interface Behavior extends org.omg.sysml.lang.sysml.Class {
│       /**
│        * Returns the value of the '<em><b>Step</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Step}.
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Type#getFeature() <em>Feature</em>}'</li>
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/BooleanExpression.java:
⋮
│public interface BooleanExpression extends Expression {
│       /**
│        * Returns the value of the '<em><b>Predicate</b></em>' reference.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Expression#getFunction() <em>Function</em>}'</li>
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/CalculationDefinition.java:
⋮
│public interface CalculationDefinition extends ActionDefinition, Function {
│       /**
│        * Returns the value of the '<em><b>Calculation</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.CalculationUsage}.
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.ActionDefinition#getAction() <em>Action</em>}'</li>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Function#getExpression() <em>Expression</em>}'</li>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/CalculationUsage.java:
⋮
│public interface CalculationUsage extends ActionUsage, Expression {
│       /**
│        * Returns the value of the '<em><b>Calculation Definition</b></em>' reference.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Expression#getFunction() <em>Function</em>}'</li>
│        *   <li>'{@link org.omg.sysml.lang.sysml.ActionUsage#getActionDefinition() <em>Action Definition<
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/CaseDefinition.java:
⋮
│public interface CaseDefinition extends CalculationDefinition {
│       /**
│        * Returns the value of the '<em><b>Objective Requirement</b></em>' reference.
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Definition#getUsage() <em>Usage</em>}'</li>
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/CaseUsage.java:
⋮
│public interface CaseUsage extends CalculationUsage {
│       /**
│        * Returns the value of the '<em><b>Objective Requirement</b></em>' reference.
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Usage#getUsage() <em>Usage</em>}'</li>
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Class.java:
⋮
│public interface Class extends Classifier {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Classifier.java:
⋮
│public interface Classifier extends Type {
│       /**
│        * Returns the value of the '<em><b>Owned Subclassification</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Subclassification}.
│        * It is bidirectional and its opposite is '{@link org.omg.sysml.lang.sysml.Subclassification#getO
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Type#getOwnedSpecialization() <em>Owned Specialization</
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Conjugation.java:
⋮
│public interface Conjugation extends Relationship {
│       /**
│        * Returns the value of the '<em><b>Original Type</b></em>' reference.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Relationship#getTarget() <em>Target</em>}'</li>
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Connector.java:
⋮
│public interface Connector extends Feature, Relationship {
│       /**
│        * Returns the value of the '<em><b>Related Feature</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Feature}.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Relationship#getRelatedElement() <em>Related Element</em
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/ConstraintDefinition.java:
⋮
│public interface ConstraintDefinition extends OccurrenceDefinition, Predicate {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/ConstraintUsage.java:
⋮
│public interface ConstraintUsage extends OccurrenceUsage, BooleanExpression {
│       /**
│        * Returns the value of the '<em><b>Constraint Definition</b></em>' reference.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.BooleanExpression#getPredicate() <em>Predicate</em>}'</l
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/ControlNode.java:
⋮
│public interface ControlNode extends ActionUsage {
│       /**
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * <!-- begin-model-doc -->
│        * <p>Check that the given <code>Multiplicity</code> has <code>lowerBound</code> and <code>upperBo
│        * mult <> null and
│        * if mult.oclIsKindOf(MultiplicityRange) then
│        *     mult.oclAsType(MultiplicityRange).hasBounds(lower, upper)
│        * else
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Definition.java:
⋮
│public interface Definition extends Classifier {
│       /**
│        * Returns the value of the '<em><b>Is Variation</b></em>' attribute.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * <!-- begin-model-doc -->
│        * <p>Whether this <code>Definition</code> is for a variation point or not. If true, then all the 
│        * <!-- end-model-doc -->
│        * @return the value of the '<em>Is Variation</em>' attribute.
│        * @see #setIsVariation(boolean)
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Element.java:
⋮
│public interface Element extends EObject {
│       /**
│        * Returns the value of the '<em><b>Owning Membership</b></em>' reference.
│        * It is bidirectional and its opposite is '{@link org.omg.sysml.lang.sysml.OwningMembership#getOw
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Element#getOwningRelationship() <em>Owning Relationship<
│        * </ul>
⋮
│       String getDeclaredName();
│
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Expression.java:
⋮
│public interface Expression extends Step {
│       /**
│        * Returns the value of the '<em><b>Function</b></em>' reference.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Step#getBehavior() <em>Behavior</em>}'</li>
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Feature.java:
⋮
│public interface Feature extends Type {
│       /**
│        * Returns the value of the '<em><b>Owning Feature Membership</b></em>' reference.
│        * It is bidirectional and its opposite is '{@link org.omg.sysml.lang.sysml.FeatureMembership#getO
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Element#getOwningMembership() <em>Owning Membership</em>
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/FeatureChaining.java:
⋮
│public interface FeatureChaining extends Relationship {
│       /**
│        * Returns the value of the '<em><b>Chaining Feature</b></em>' reference.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Relationship#getTarget() <em>Target</em>}'</li>
│        * </ul>
│        * <!-- begin-user-doc -->
⋮
│       Feature getChainingFeature();
│
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/FeatureMembership.java:
⋮
│public interface FeatureMembership extends OwningMembership {
│       /**
│        * Returns the value of the '<em><b>Owned Member Feature</b></em>' reference.
│        * It is bidirectional and its opposite is '{@link org.omg.sysml.lang.sysml.Feature#getOwningFeatu
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.OwningMembership#getOwnedMemberElement() <em>Owned Membe
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Function.java:
⋮
│public interface Function extends Behavior {
│       /**
│        * Returns the value of the '<em><b>Expression</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Expression}.
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Behavior#getStep() <em>Step</em>}'</li>
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Import.java:
⋮
│public interface Import extends Relationship {
│       /**
│        * Returns the value of the '<em><b>Visibility</b></em>' attribute.
│        * The default value is <code>"private"</code>.
│        * The literals are from the enumeration {@link org.omg.sysml.lang.sysml.VisibilityKind}.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * <!-- begin-model-doc -->
│        * <p>The visibility level of the imported <code>members</code> from this Import relative to the <
│        * 
⋮
│       void setVisibility(VisibilityKind value);
│
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/InstantiationExpression.java:
⋮
│public interface InstantiationExpression extends Expression {
│       /**
│        * Returns the value of the '<em><b>Argument</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Expression}.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * <!-- begin-model-doc -->
│        * <p>The <code>Expressions</code> whose <code>results</code> are bound to <code>features</code> o
│        * 
│        * <p><strong>Note.</strong> The derivation of <code>argument</code> is given in the concrete subc
⋮
│       EList<Expression> getArgument();
│
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/InvocationExpression.java:
⋮
│public interface InvocationExpression extends InstantiationExpression {
│       /**
│        * Returns the value of the '<em><b>Operand</b></em>' containment reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Expression}.
│        * <!-- begin-user-doc -->
│        * <p>
│        * If the meaning of the '<em>Operand</em>' containment reference list isn't clear,
│        * there really should be more of a description here...
│        * </p>
│        * <!-- end-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/ItemDefinition.java:
⋮
│public interface ItemDefinition extends OccurrenceDefinition, Structure {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/ItemUsage.java:
⋮
│public interface ItemUsage extends OccurrenceUsage {
│       /**
│        * Returns the value of the '<em><b>Item Definition</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Structure}.
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.OccurrenceUsage#getOccurrenceDefinition() <em>Occurrence
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/LiteralExpression.java:
⋮
│public interface LiteralExpression extends Expression {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/LoopActionUsage.java:
⋮
│public interface LoopActionUsage extends ActionUsage {
│       /**
│        * Returns the value of the '<em><b>Body Action</b></em>' reference.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * <!-- begin-model-doc -->
│        * <p>The <code>ActionUsage</code> to be performed repeatedly by the <code>LoopActionUsage</code>.
│        * 
│        * <!-- end-model-doc -->
│        * @return the value of the '<em>Body Action</em>' reference.
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Membership.java:
⋮
│public interface Membership extends Relationship {
│       /**
│        * Returns the value of the '<em><b>Member Element Id</b></em>' attribute.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * <!-- begin-model-doc -->
│        * <p>The <code>elementId</code> of the <code>memberElement</code>.</p>
│        * <!-- end-model-doc -->
│        * @return the value of the '<em>Member Element Id</em>' attribute.
│        * @see #setMemberElementId(String)
⋮
│       Element getMemberElement();
│
⋮
│       void setVisibility(VisibilityKind value);
│
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Multiplicity.java:
⋮
│public interface Multiplicity extends Feature {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Namespace.java:
⋮
│public interface Namespace extends Element {
│       /**
│        * Returns the value of the '<em><b>Owned Membership</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Membership}.
│        * It is bidirectional and its opposite is '{@link org.omg.sysml.lang.sysml.Membership#getMembersh
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Namespace#getMembership() <em>Membership</em>}'</li>
⋮
│       EList<Membership> getOwnedMembership();
│
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/OccurrenceDefinition.java:
⋮
│public interface OccurrenceDefinition extends Definition, org.omg.sysml.lang.sysml.Class {
│       /**
│        * Returns the value of the '<em><b>Is Individual</b></em>' attribute.
│        * The default value is <code>"false"</code>.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * <!-- begin-model-doc -->
│        * <p>Whether this <code>OccurrenceDefinition</code> is constrained to represent at most one thing
│        * <!-- end-model-doc -->
│        * @return the value of the '<em>Is Individual</em>' attribute.
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/OccurrenceUsage.java:
⋮
│public interface OccurrenceUsage extends Usage {
│       /**
│        * Returns the value of the '<em><b>Occurrence Definition</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Class}.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Usage#getDefinition() <em>Definition</em>}'</li>
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/OperatorExpression.java:
⋮
│public interface OperatorExpression extends InvocationExpression {
│       /**
│        * Returns the value of the '<em><b>Operator</b></em>' attribute.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * <!-- begin-model-doc -->
│        * <p>An <code>operator</code> symbol that names a corresponding <code>Function</code> from one of
│        * <!-- end-model-doc -->
│        * @return the value of the '<em>Operator</em>' attribute.
│        * @see #setOperator(String)
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/OwningMembership.java:
⋮
│public interface OwningMembership extends Membership {
│       /**
│        * Returns the value of the '<em><b>Owned Member Element Id</b></em>' attribute.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Membership#getMemberElementId() <em>Member Element Id</e
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/ParameterMembership.java:
⋮
│public interface ParameterMembership extends FeatureMembership {
│       /**
│        * Returns the value of the '<em><b>Owned Member Parameter</b></em>' reference.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.FeatureMembership#getOwnedMemberFeature() <em>Owned Memb
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/PartDefinition.java:
⋮
│public interface PartDefinition extends ItemDefinition {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/PartUsage.java:
⋮
│public interface PartUsage extends ItemUsage {
│       /**
│        * Returns the value of the '<em><b>Part Definition</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.PartDefinition}.
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.ItemUsage#getItemDefinition() <em>Item Definition</em>}'
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/PortDefinition.java:
⋮
│public interface PortDefinition extends OccurrenceDefinition, Structure {
│       /**
│        * Returns the value of the '<em><b>Conjugated Port Definition</b></em>' reference.
│        * It is bidirectional and its opposite is '{@link org.omg.sysml.lang.sysml.ConjugatedPortDefiniti
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Namespace#getOwnedMember() <em>Owned Member</em>}'</li>
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Predicate.java:
⋮
│public interface Predicate extends Function {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Relationship.java:
⋮
│public interface Relationship extends Element {
│       /**
│        * Returns the value of the '<em><b>Related Element</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Element}.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * <!-- begin-model-doc -->
│        * <p>The Elements that are related by this Relationship, derived as the union of the <code>source
│        * <!-- end-model-doc -->
│        * @return the value of the '<em>Related Element</em>' reference list.
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/RequirementConstraintMembership.java:
⋮
│public interface RequirementConstraintMembership extends FeatureMembership {
│       /**
│        * Returns the value of the '<em><b>Kind</b></em>' attribute.
│        * The literals are from the enumeration {@link org.omg.sysml.lang.sysml.RequirementConstraintKind
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * <!-- begin-model-doc -->
│        * <p>Whether the <code>RequirementConstraintMembership</code> is for an assumed or required <code
│        * <!-- end-model-doc -->
│        * @return the value of the '<em>Kind</em>' attribute.
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/RequirementUsage.java:
⋮
│public interface RequirementUsage extends ConstraintUsage {
│       /**
│        * Returns the value of the '<em><b>Requirement Definition</b></em>' reference.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.ConstraintUsage#getConstraintDefinition() <em>Constraint
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Specialization.java:
⋮
│public interface Specialization extends Relationship {
│       /**
│        * Returns the value of the '<em><b>General</b></em>' reference.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Relationship#getTarget() <em>Target</em>}'</li>
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Step.java:
⋮
│public interface Step extends Feature {
│       /**
│        * Returns the value of the '<em><b>Behavior</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Behavior}.
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Feature#getType() <em>Type</em>}'</li>
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Structure.java:
⋮
│public interface Structure extends org.omg.sysml.lang.sysml.Class {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Subsetting.java:
⋮
│public interface Subsetting extends Specialization {
│       /**
│        * Returns the value of the '<em><b>Subsetted Feature</b></em>' reference.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Specialization#getGeneral() <em>General</em>}'</li>
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/SysMLFactory.java:
⋮
│public interface SysMLFactory extends EFactory {
│       /**
│        * The singleton instance of the factory.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       SysMLFactory eINSTANCE = org.omg.sysml.lang.sysml.impl.SysMLFactoryImpl.init();
│
│       /**
⋮
│       SysMLPackage getSysMLPackage();
│
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Type.java:
⋮
│public interface Type extends Namespace {
│       /**
│        * Returns the value of the '<em><b>Owned Specialization</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Specialization}.
│        * It is bidirectional and its opposite is '{@link org.omg.sysml.lang.sysml.Specialization#getOwni
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Element#getOwnedRelationship() <em>Owned Relationship</e
⋮
│       EList<Feature> getOwnedFeature();
│
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Usage.java:
⋮
│public interface Usage extends Feature {
│       /**
│        * Returns the value of the '<em><b>May Time Vary</b></em>' attribute.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Feature#isVariable() <em>Is Variable</em>}'</li>
│        * </ul>
│        * <!-- begin-user-doc -->
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/ConjugatedPortDefinitionImpl.java:
⋮
│public class ConjugatedPortDefinitionImpl extends PortDefinitionImpl implements ConjugatedPortDefin
│       /**
│        * The cached setting delegate for the '{@link #getOriginalPortDefinition() <em>Original Port Defi
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @see #getOriginalPortDefinition()
│        * @generated
│        * @ordered
│        */
│       protected EStructuralFeature.Internal.SettingDelegate ORIGINAL_PORT_DEFINITION__ESETTING_DELEGATE 
│
⋮
│       public Namespace getOwningNamespace() {
│               return getOriginalPortDefinition();
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/ElementImpl.java:
⋮
│public abstract class ElementImpl extends MinimalEObjectImpl.Container implements Element {
│       /**
│        * The cached value of the '{@link #getOwnedRelationship() <em>Owned Relationship</em>}' containme
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @see #getOwnedRelationship()
│        * @generated
│        * @ordered
│        */
│       protected EList<Relationship> ownedRelationship;
│
⋮
│       @Override
│       public Namespace getOwningNamespace() {
⋮
│       @Override
│       public String getDeclaredName() {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/FeatureImpl.java:
⋮
│public class FeatureImpl extends TypeImpl implements Feature {
│       /**
│        * The cached setting delegate for the '{@link #getChainingFeature() <em>Chaining Feature</em>}' r
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @see #getChainingFeature()
│        * @generated
│        * @ordered
│        */
│       protected EStructuralFeature.Internal.SettingDelegate CHAINING_FEATURE__ESETTING_DELEGATE = ((EStr
│
⋮
│       @Override
│       public boolean isComposite() {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/ImportImpl.java:
⋮
│public abstract class ImportImpl extends RelationshipImpl implements Import {
│       /**
│        * The cached setting delegate for the '{@link #getImportOwningNamespace() <em>Import Owning Names
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @see #getImportOwningNamespace()
│        * @generated
│        * @ordered
│        */
│       protected EStructuralFeature.Internal.SettingDelegate IMPORT_OWNING_NAMESPACE__ESETTING_DELEGATE =
│
⋮
│       @Override
│       public void setVisibility(VisibilityKind newVisibility) {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/InstantiationExpressionImpl.java:
⋮
│public abstract class InstantiationExpressionImpl extends ExpressionImpl implements InstantiationEx
│       /**
│        * The cached setting delegate for the '{@link #getArgument() <em>Argument</em>}' reference list.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @see #getArgument()
│        * @generated
│        * @ordered
│        */
│       protected EStructuralFeature.Internal.SettingDelegate ARGUMENT__ESETTING_DELEGATE = ((EStructuralF
│
⋮
│       @SuppressWarnings("unchecked")
│       @Override
│       public EList<Expression> getArgument() {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/MembershipImpl.java:
⋮
│public class MembershipImpl extends RelationshipImpl implements Membership {
│       /**
│        * The cached value of the '{@link #getMemberElement() <em>Member Element</em>}' reference.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @see #getMemberElement()
│        * @generated
│        * @ordered
│        */
│       protected Element memberElement;
│
⋮
│       @Override
│       public Element getMemberElement() {
⋮
│       @Override
│       public void setVisibility(VisibilityKind newVisibility) {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/NamespaceImpl.java:
⋮
│public class NamespaceImpl extends ElementImpl implements Namespace {
│       /**
│        * The cached setting delegate for the '{@link #getImportedMembership() <em>Imported Membership</e
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @see #getImportedMembership()
│        * @generated
│        * @ordered
│        */
│       protected EStructuralFeature.Internal.SettingDelegate IMPORTED_MEMBERSHIP__ESETTING_DELEGATE = ((E
│
⋮
│       @SuppressWarnings("unchecked")
│       @Override
│       public EList<Membership> getOwnedMembership() {
⋮
│       @SuppressWarnings("unchecked")
│       @Override
│       public EList<Element> getOwnedMember() {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/OwningMembershipImpl.java:
⋮
│public class OwningMembershipImpl extends MembershipImpl implements OwningMembership {
│       /**
│        * The cached setting delegate for the '{@link #getOwnedMemberElement() <em>Owned Member Element</
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @see #getOwnedMemberElement()
│        * @generated
│        * @ordered
│        */
│       protected EStructuralFeature.Internal.SettingDelegate OWNED_MEMBER_ELEMENT__ESETTING_DELEGATE = ((
│
⋮
│       public Element getMemberElement() {
│               return getOwnedMemberElement();
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/StateSubactionMembershipImpl.java:
⋮
│public class StateSubactionMembershipImpl extends FeatureMembershipImpl implements StateSubactionMe
│       /**
│        * The cached setting delegate for the '{@link #getAction() <em>Action</em>}' reference.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @see #getAction()
│        * @generated
│        * @ordered
│        */
│       protected EStructuralFeature.Internal.SettingDelegate ACTION__ESETTING_DELEGATE = ((EStructuralFea
│
⋮
│       @Override
│       public String toString() {
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/SysMLFactoryImpl.java:
⋮
│public class SysMLFactoryImpl extends EFactoryImpl implements SysMLFactory {
│       /**
│        * Creates the default factory implementation.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public static SysMLFactory init() {
│               try {
│                       SysMLFactory theSysMLFactory = (SysMLFactory)EPackage.Registry.INSTANCE.getEFactory(SysMLPackage
│                       if (theSysMLFactory != null) {
│                               return theSysMLFactory;
│                       }
│               }
│               catch (Exception exception) {
│                       EcorePlugin.INSTANCE.log(exception);
│               }
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/SysMLPackageImpl.java:
⋮
│public class SysMLPackageImpl extends EPackageImpl implements SysMLPackage {
│       /**
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       private EClass selectExpressionEClass = null;
│
│       /**
│        * <!-- begin-user-doc -->
⋮
│       public static SysMLPackage init() {
│               if (isInited) return (SysMLPackage)EPackage.Registry.INSTANCE.getEPackage(SysMLPackage.eNS_URI);
│
│               // Obtain or create and register package
│               Object registeredSysMLPackage = EPackage.Registry.INSTANCE.get(eNS_URI);
│               SysMLPackageImpl theSysMLPackage = registeredSysMLPackage instanceof SysMLPackageImpl ? (SysMLPac
│
│               isInited = true;
│
│               // Create package meta-data objects
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/TypeImpl.java:
⋮
│public class TypeImpl extends NamespaceImpl implements Type {
│       /**
│        * The cached setting delegate for the '{@link #getDifferencingType() <em>Differencing Type</em>}'
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @see #getDifferencingType()
│        * @generated
│        * @ordered
│        */
│       protected EStructuralFeature.Internal.SettingDelegate DIFFERENCING_TYPE__ESETTING_DELEGATE = ((ESt
│
⋮
│       @SuppressWarnings("unchecked")
│       @Override
│       public EList<Feature> getOwnedFeature() {
⋮
│       public boolean specializesFromLibrary(String libraryTypeName) {
│               try {
│                       return (Boolean)SPECIALIZES_FROM_LIBRARY_STRING__EINVOCATION_DELEGATE.dynamicInvoke(this, new Ba
│               }
│               catch (InvocationTargetException ite) {
│                       throw new WrappedException(ite);
│               }
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/util/UnionEObjectEList.java:
⋮
│public class UnionEObjectEList<E> extends EcoreEList.UnmodifiableEList<E> {
│
│       private static final long serialVersionUID = 1L;
│
│       public UnionEObjectEList(InternalEObject owner,
│                       EStructuralFeature eStructuralFeature, int size, Object[] data) {
│               super(owner, eStructuralFeature, size, data);
│       }
│
│       protected EObject resolveProxy(EObject eObject) {
⋮
│       @Override
│       public NotificationChain basicRemove(Object object,
⋮
│       @Override
│       public NotificationChain basicAdd(E object, NotificationChain notifications) {
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/InheritKey.java:
⋮
│class InheritKey {
│    public final Type[] keys;
│    /* If isDirect, the last key directly owns the target feature.
│       Otherwise, the last key is denoted as ^ow. */
│    private final boolean isDirect;
│
│    private static boolean containsWithRedefined(List<Feature> fs, Feature ft) {
│        for (Feature f : fs) {
│            if (f.equals(ft)) return true;
│            if (matchRedefined(f, ft)) return true;
⋮
│    @Override
│    public boolean equals(Object o) {
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/SysML2PlantUMLText.java:
⋮
│public class SysML2PlantUMLText {
│    public enum MODE {
│        Default,
│        Tree,
│        State,
│        Interconnection,
│        Action,
│        Sequence,
│        Case,
│        MIXED;
⋮
│    private void init() {
│        idCounter = 1;
│        this.idMap = new IDMap();
│        this.namespaces = new ArrayList<>();
│        this.inheritingIdices = new ArrayList<>();
│        this.showMetaclass = styleValue("showMetaclass") != null;
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VBehavior.java:
⋮
│public abstract class VBehavior extends VDefault {
│    protected boolean isDoneAction(Feature f) {
│        return f != null && f.specializesFromLibrary("Actions::Action::done");
│    }
│
│    protected boolean isStartAction(Feature f) {
│        return f != null && f.specializesFromLibrary("Actions::Action::start");
│    }
│
│    protected boolean isEntryAction(ActionUsage au) {
⋮
│    private static class LineFoldStringBuilder {
│       private StringBuilder sb = new StringBuilder();
│        private static int LINEFOLD_LEN = 20;
│        private int curLen;
│        public void fold() {
│            if (curLen <= LINEFOLD_LEN) return;
│            sb.append("\\n");
│            curLen = 0;
│        }
│
│        public void append(String s) {
│            curLen += s.length();
│            sb.append(s);
⋮
│        public void append(char ch) {
│            curLen++;
│            sb.append(ch);
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VComposite.java:
⋮
│public class VComposite extends VMixed {
│    private static final SysML2PlantUMLStyle style
│    = new SysML2PlantUMLStyle
│    ("VComposite",
│      null,
│     "skinparam ranksep 10\n"
│     + "skinparam rectangle {\n backgroundColor<<block>> LightGreen\n}\n",
│     new StyleSwitch(null, new StyleStereotypeSwitch() {
│         @Override
│         public String casePartUsage(PartUsage object) {
⋮
│    private String getFeatureText(Feature f) {
│        VComposite v = new VComposite(this);
│        v.addFeatureText(f);
│        return v.getString();
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VPath.java:
⋮
│public class VPath extends VTraverser {
│    public static Expression getRefTarget(Expression e) {
│        if ((e instanceof FeatureChainExpression)
│            || (e instanceof FeatureReferenceExpression)) return e;
│        return null;
│    }
│
│    private boolean initialized;
│
│    // PC (PathContext) management. 
⋮
│    public void init() {
│        initialized = true;
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VSequence.java:
⋮
│public class VSequence extends VDefault {
│    private static final SysML2PlantUMLStyle style
│    = new SysML2PlantUMLStyle
│    ("VSequence",
│      null,
│     "skinparam roundcorner 20\n"
│     + "skinparam BoxPadding 20\n"
│     + "skinparam SequenceBoxBackgroundColor #white\n"
│     + "skinparam style strictuml\n"
│     + "skinparam maxMessageSize 100\n",
⋮
│    @Override
│    protected String getString() {
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VTraverser.java:
⋮
│public abstract class VTraverser extends Visitor {
│    private Set<Namespace> visited;
│
│    private Membership currentMembership;
│    protected Membership getCurrentMembership() {
│        return currentMembership;
│    }
│
│    protected boolean checkVisited(Namespace n) {
│       if (visited.contains(n)) return true;
⋮
│    private void init() {
│        if (inited) return;
│        this.showInherited = styleBooleanValue("showInherited");
│        this.showLib = styleBooleanValue("showLib");
│        this.inited = true;
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/Visitor.java:
⋮
│public abstract class Visitor extends SysMLSwitch<String> {
│    private SysML2PlantUMLText s2p = null;
│
│    public void setSysML2PlantUMLText(SysML2PlantUMLText s2p) {
│        this.s2p = s2p;
│    }
│
│    public enum MultiplicityStyle {
│        NONE,
│        DEFAULT,
│
⋮
│    protected String getString() {
│        if (prev == null) {
│            flushPRelations(true);
│            flushContexts();
│            sb.append(pRelationsSB);
│            pRelationsSB.setLength(0);
│        }
│        return sb.toString();
⋮

org.omg.sysml.uml.ecore.importer/src/org/omg/sysml/uml/ecore/importer/ui/CustomUMLImporterDetailPage
⋮
│public class CustomUMLImporterDetailPage extends UMLImporterDetailPage {
│
│       public CustomUMLImporterDetailPage(ModelImporter modelImporter, String pageName) {
│               super(modelImporter, pageName);
│       }
│
│       @Override
│       protected void addOptionControl(Composite parent, String text, String option, String[] choices,
│                       String initialChoice) {
│               // default choices customization
⋮

org.omg.sysml/src/org/omg/sysml/io/SysMLUtil.java:
⋮
│public abstract class SysMLUtil {
│
│       private final ResourceSet resourceSet;
│       private final List<Resource> inputResources = new LinkedList<>();
│       private final List<String> extensions = new ArrayList<String>();
│       private final ResourceDescriptionsData index;
│       
│       private boolean isVerbose = true;
│       
│       protected SysMLUtil() {
⋮
│    public ResourceSet getResourceSet() {
│        return resourceSet;
⋮
│       public void transformAll(boolean isAddImplicitElements) {
│               for (Resource resource: this.resourceSet.getResources()) {
│                       ElementUtil.transformAll(resource,
│                                       isAddImplicitElements && this.isInputResource(resource));
│               }
⋮

org.omg.sysml/src/org/omg/sysml/lang/sysml/util/ISysMLScope.java:
⋮
│public interface ISysMLScope extends IScope {
│       Element getElement(String name);
⋮

org.omg.sysml/src/org/omg/sysml/util/repository/EMFModelRefresher.java:
⋮
│public class EMFModelRefresher {
│       
│       private final EObjectUUIDTracker tracker;
│       private final APIModel model;
│       
│       private static Set<String> disabledStructuralFeatures = Set.of("importedMembership");
│       
│       
│       private final List<Issue> issues = new LinkedList<>();
│       
⋮
│       public static class Issue {
│               private final String message;
│
│               public Issue(String message) {
│                       this.message = message;
│               }
│               
│               public String getMessage() {
│                       return message;
│               }
⋮

org.omg.sysml/src/org/omg/sysml/util/repository/ProjectRepository.java:
⋮
│public class ProjectRepository {
│       
│       public static final String ID_FIELD = Identified.SERIALIZED_NAME_AT_ID;
│       
│       private final String repositoryURL;
│       
│       private final ApiClient apiClient = new ApiClient();
│       private final ProjectApi projectApi = new ProjectApi(apiClient);
│       private final BranchApi branchApi = new BranchApi(apiClient);
│       private final CommitApi commitApi = new CommitApi(apiClient);
⋮
│       public static class RemoteException extends RuntimeException {
│               private static final long serialVersionUID = 4949283470185055639L;
│               private final ApiException apiException;
│               
│               public RemoteException(String message, ApiException ex) {
│                       super(message, ex);
│                       apiException = ex;
│               }
│               
│               public int getCode() {
⋮
│               @Override
│               public String getMessage() {
⋮

tool-support/quantities_lib_generator/reference_source.py:
⋮
│@dataclass
│class ReferenceSource:
⋮
```
