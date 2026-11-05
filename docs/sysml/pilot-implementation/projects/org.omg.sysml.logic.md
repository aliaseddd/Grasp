# Repo map: org.omg.sysml.logic

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.logic`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.logic) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 617 files there; aider read the 617 that `pilot.aiderignore` leaves in, and the map shows 46 of them, 46 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.logic/src/main/java/org/omg/sysml/adapter/ConstructorExpressionAdapter.java:
⋮
│public class ConstructorExpressionAdapter extends InstantiationExpressionAdapter {
│
│       public ConstructorExpressionAdapter(ConstructorExpression element) {
│               super(element);
│       }
│       
│       @Override
│       public ConstructorExpression getTarget() {
│               return (ConstructorExpression)super.getTarget();
│       }
│               
⋮
│       @Override
│       public void addAdditionalMembers() {
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/adapter/ElementAdapter.java:
⋮
│public class ElementAdapter extends AdapterImpl {
│       
│       protected Class<?> kind;
│       protected boolean isTransformed = false;
│       
│       private MetadataFeature metaclassFeature = null;
│       
│       private String elementId;
│       
│       public ElementAdapter(Element element) {
⋮
│       public void clearCaches() {
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/adapter/ExpressionAdapter.java:
⋮
│public class ExpressionAdapter extends StepAdapter {
│
│       public static final String EXPRESSION_GUARD_FEATURE = "TransitionPerformances::TransitionPerforman
│
│       public ExpressionAdapter(Expression element) {
│               super(element);
│       }
│       
│       @Override
│       public Expression getTarget() {
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/adapter/FeatureAdapter.java:
⋮
│public class FeatureAdapter extends TypeAdapter {
│       
│       public FeatureAdapter(Feature element) {
│               super(element);
│       }
│       
│       @Override
│       public Feature getTarget() {
│               return (Feature)super.getTarget();
│       }
│       
⋮
│       @Override
│       public void clearCaches() {
⋮
│       public Feature getReferencedFeature() {
│               Feature target = getTarget();
│               ReferenceSubsetting ownedReferenceSubsetting = target.getOwnedReferenceSubsetting();
│               if (ownedReferenceSubsetting != null) {
│                       return ownedReferenceSubsetting.getReferencedFeature();
│               } else {
│                       computeImplicitGeneralTypes();
│                       return getImplicitGeneralTypesOnly(SysMLPackage.Literals.REFERENCE_SUBSETTING).stream().
│                                       map(Feature.class::cast).findFirst().orElse(null);
│               }
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/adapter/NamespaceAdapter.java:
⋮
│public class NamespaceAdapter extends ElementAdapter {
│
│       public NamespaceAdapter(Namespace element) {
│               super(element);
│       }
│       
│       public Namespace getTarget() {
│               return (Namespace)super.getTarget();
│       }
│       
⋮
│       @Override
│       public void clearCaches() {
⋮
│       public void addAdditionalMembers() {
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/adapter/RelationshipAdapter.java:
⋮
│public abstract class RelationshipAdapter extends ElementAdapter {
│
│       public RelationshipAdapter(Element element) {
│               super(element);
│       }
│       
│       public Relationship getTarget() {
│               return (Relationship)super.getTarget();
│       }
│
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/adapter/RequirementUsageAdapter.java:
⋮
│public class RequirementUsageAdapter extends ConstraintUsageAdapter {
│       
│       public RequirementUsageAdapter(RequirementUsage element) {
│               super(element);
│       }
│       
│       @Override
│       public RequirementUsage getTarget() {
│               return (RequirementUsage)super.getTarget();
│       }
│       
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/adapter/TransitionUsageAdapter.java:
⋮
│public class TransitionUsageAdapter extends ActionUsageAdapter {
│
│       private boolean isComputingTransitionLinkConnectors = false;
│
│       public TransitionUsageAdapter(TransitionUsage element) {
│               super(element);
│       }
│       
│       @Override
│       public TransitionUsage getTarget() {
⋮
│       @Override
│       public void addAdditionalMembers() {
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
│       public void clearCaches() {
│               super.clearCaches();
│               inheritedMembership = null;
│               nonPrivateMembership = null;
│               redefinedFeatures = null;
│               featureMembership = null;
⋮
│       public List<Type> getImplicitGeneralTypes() {
│               computeImplicitGeneralTypes();
│               
│               return getImplicitGeneralTypeKinds().stream().
│                               map(implicitGeneralTypes::get).
│                               flatMap(Collection::stream).
│                               collect(Collectors.toList());
⋮
│       public List<Type> getImplicitGeneralTypes(EClass eClass) {
│               return getImplicitGeneralTypeKinds().stream().
│                               filter(eClass::isSuperTypeOf).
│                               flatMap(keyClass->getImplicitGeneralTypesOnly(keyClass).stream()).
│                               collect(Collectors.toList());
⋮
│       public List<Type> getImplicitGeneralTypesOnly(EClass eClass) {
│               return implicitGeneralTypes.getOrDefault(eClass, Collections.emptyList());
⋮
│       public void addImplicitGeneralType(EClass eClass, Type general) {
│               if (isAddImplicitGeneralTypes && general != null && general != getTarget() && !isImplicitSpeciali
│                       implicitGeneralTypes.computeIfAbsent(eClass, e -> new ArrayList<>()).add(general);
│                       VirtualContainer.attach(general, getTarget());
│               }
⋮
│       public Type getLibraryType(String... defaultNames) {
│               return SysMLLibraryUtil.getLibraryType(getTarget(), defaultNames);
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/adapter/UsageAdapter.java:
⋮
│public class UsageAdapter extends FeatureAdapter {
│
│       public UsageAdapter(Usage element) {
│               super(element);
│       }
│       
│       @Override
│       public Usage getTarget() {
│               return (Usage)super.getTarget();
│       }
│       
⋮
│       @Override
│       public void clearCaches() {
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/AcceptActionUsage_isTriggerActio
⋮
│public class AcceptActionUsage_isTriggerAction_InvocationDelegate extends BasicInvocationDelegate {
│
│       public AcceptActionUsage_isTriggerAction_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               AcceptActionUsage self = (AcceptActionUsage) target;
│               
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/ActionUsage_isSubactionUsage_Inv
⋮
│public class ActionUsage_isSubactionUsage_InvocationDelegate extends BasicInvocationDelegate {
│
│       public ActionUsage_isSubactionUsage_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               ActionUsage self = (ActionUsage) target;
│               
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

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/ConjugatedPortDefinition_effecti
⋮
│public class ConjugatedPortDefinition_effectiveName_InvocationDelegate extends BasicInvocationDeleg
│
│       public ConjugatedPortDefinition_effectiveName_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               ConjugatedPortDefinition self = (ConjugatedPortDefinition) target;
│               PortDefinition originalPortDefinition = self.getOriginalPortDefinition();
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

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/Element_effectiveName_Invocation
⋮
│public class Element_effectiveName_InvocationDelegate extends BasicInvocationDelegate {
│
│       public Element_effectiveName_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               Element self = (Element) target;
│               
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/Element_effectiveShortName_Invoc
⋮
│public class Element_effectiveShortName_InvocationDelegate extends BasicInvocationDelegate {
│
│       public Element_effectiveShortName_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               Element self = (Element) target;
│               
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/FeatureChainExpression_sourceTar
⋮
│public class FeatureChainExpression_sourceTargetFeature_InvocationDelegate extends BasicInvocationD
│
│       public FeatureChainExpression_sourceTargetFeature_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               FeatureChainExpression self = (FeatureChainExpression) target;
│               
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/Feature_isOwnedCrossFeature_Invo
⋮
│public class Feature_isOwnedCrossFeature_InvocationDelegate extends BasicInvocationDelegate {
│
│       public Feature_isOwnedCrossFeature_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               Feature self = (Feature) target;
│               Type owningType = self.getOwningType();
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

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/MetadataFeature_isSemantic_Invoc
⋮
│public class MetadataFeature_isSemantic_InvocationDelegate extends BasicInvocationDelegate {
│
│       public MetadataFeature_isSemantic_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               MetadataFeature self = (MetadataFeature) target;
│               
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/MetadataUsage_isSemantic_Invocat
⋮
│public class MetadataUsage_isSemantic_InvocationDelegate extends BasicInvocationDelegate {
│
│       public MetadataUsage_isSemantic_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               MetadataUsage self = (MetadataUsage) target;
│               
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/delegate/invocation/Type_directionOf_InvocationDeleg
⋮
│public class Type_directionOf_InvocationDelegate extends BasicInvocationDelegate {
│
│       public Type_directionOf_InvocationDelegate(EOperation operation) {
│               super(operation);
│       }
│       
│       @Override
│       public Object dynamicInvoke(InternalEObject target, EList<?> arguments) throws InvocationTargetExc
│               Type self = (Type) target;
│               Feature feature = (Feature) arguments.get(0);
│               
⋮
│       protected static FeatureDirectionKind directionOf(Feature feature, Type type, Set<Type> visited) {
│               visited.add(type);
│               Conjugation conjugator = type.getOwnedConjugator();
│               if (feature.getOwningType() == type) {
│                       return feature.getDirection();
│               } else if (conjugator != null) {
│                       Type originalType = conjugator.getOriginalType();
│                       if (originalType == null || visited.contains(originalType)) {
│                               return null;
│                       } else {
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

org.omg.sysml.logic/src/main/java/org/omg/sysml/expressions/functions/LibraryFeature.java:
⋮
│public interface LibraryFeature {
│
│       public String getPackageName();
│       public String getFeatureName();
│       
│       default public String getQualifiedName() {
│               return getPackageName() + "::" + getFeatureName();
│       }
│       
│       public EList<Element> getValue();
│       
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

org.omg.sysml.logic/src/main/java/org/omg/sysml/expressions/functions/trig/PiFeature.java:
⋮
│public class PiFeature implements LibraryFeature {
│
│       @Override
│       public String getPackageName() {
│               return "TrigFunctions";
│       }
│
│       @Override
│       public String getFeatureName() {
│               return "pi";
⋮
│       @Override
│       public EList<Element> getValue() {
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/logic/ResourceSetModelLibraryProvider.java:
⋮
│public class ResourceSetModelLibraryProvider implements IModelLibraryProvider {
│
│       /**
│        * Resolves a qualified library name against the resources already loaded in the
│        * context element's resource set.
│        */
│       @Override
│       public Element getElement(Element context, String name) {
│               if (context == null || name == null || name.isBlank()) {
│                       return null;
⋮
│       private Element getElement(Resource resource, String[] segments) {
│               for (EObject object : resource.getContents()) {
│                       // Element not contained in a Namespace can not be access using their qualified
│                       // names
│                       // Section 8.3.2.1.2 Element: "If this Element does not have an owningNamespace,
│                       // then its qualifiedName is null.”
│                       if (object instanceof Namespace namespace) {
│                               Element match = resolveElement(namespace, segments, 0);
│                               if (match != null) {
│                                       return match;
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/logic/api/IModelLibraryProvider.java:
⋮
│public interface IModelLibraryProvider {
│
│       /**
│        * Resolves a library element by qualified name relative to the given
│        * resolution context.
│        *
│        * @param context the element providing the lookup context, typically used to
│        *        determine the relevant resource set, scope, or library environment
│        * @param name the qualified library name to resolve, usually using
│        *        {@code "::"} separators
⋮
│       Element getElement(Element context, String name);
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
│       public static EObject getClosestElementInResource(EObject element) {
│               EObject current = element;
│               while (current != null && current.eResource() == null) {
│                       current = getEffectiveContainer(current);
│               }
│               return current;
⋮
│       public static ElementAdapter getElementAdapter(Element target) {
│               return ElementAdapterFactory.getAdapter(target);
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
│       public static Set<Feature> getAllRedefinedFeaturesOf(Feature feature) {
│               return getFeatureAdapter(feature).getAllRedefinedFeatures();
⋮
│       public static FeatureValue getValuationFor(Feature feature) {
│               return (FeatureValue)feature.getOwnedMembership().stream().
│                               filter(FeatureValue.class::isInstance).
│                               findFirst().orElse(null);
⋮
│       public static Feature getBasicFeatureOf(Feature feature) {
│               if (feature == null) {
│                       return null;
│               } else {
│                       EList<FeatureChaining> featureChainings = feature.getOwnedFeatureChaining();
│                       return featureChainings.isEmpty()? feature: featureChainings.get(featureChainings.size()-1).getC
│               }
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/util/ImplicitGeneralizationMap.java:
⋮
│public class ImplicitGeneralizationMap {
│       
│       private static ImplicitGeneralizationMap INSTANCE = new ImplicitGeneralizationMap();
│       
│       public static String getDefaultSupertypeFor(Class<?> elementType) {
│               return INSTANCE.get(elementType);
│       }
│
│       public static String getDefaultSupertypeFor(Class<?> elementType, String kind) {
│               return INSTANCE.get(elementType, kind);
⋮
│       public String get(Class<?> elementType) {
│               return get(elementType, "base");
⋮
│       public String get(Class<?> elementType, String kind) {
│               do {
│                       String defaultSupertype = map.get(elementType.getSimpleName()+ "_" + kind);
│                       if (defaultSupertype != null) {
│                               return defaultSupertype;
│                       }
│                       elementType = elementType.getSuperclass();
│               } while (elementType != null);
│               return null;
⋮

org.omg.sysml.logic/src/main/java/org/omg/sysml/util/NamespaceUtil.java:
⋮
│public class NamespaceUtil {
│       
│       private NamespaceUtil() {
│       }
│       
│       public static NamespaceAdapter getNamespaceAdapter(Namespace namespace) {
│               return (NamespaceAdapter)ElementUtil.getElementAdapter(namespace);
│       }
│       
│       // Membership
│       
⋮
│       public static Stream<Element> getOwnedMembersOf(Namespace namespace) {
│               return namespace.getOwnedMembership().stream().
│                       filter(OwningMembership.class::isInstance).
│                       map(Membership::getMemberElement).
│                       filter(m->m != null);
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
│       public Expression get(int index) {
⋮
│       @Override
│       public boolean add(Expression e) {
⋮
│       @Override
│       public void add(int index, Expression element) {
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
│               IModelLibraryProvider get(Resource resource);
⋮
│       public static String getModelLibraryPath() {
│               return modelLibraryPath;
⋮
│       public static Element getLibraryElement(Element context, String name) {
│               Element lookupContext = context;
│               Resource resource = null;
│               if (ElementUtil.getClosestElementInResource(context) instanceof Element attached) {
│                       lookupContext = attached;
│                       resource = attached.eResource();
│               }
│               IModelLibraryProvider provider = getInstance(resource);
│               if (provider == null) {
│                       return null;
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
│       private static IModelLibraryProvider getInstance(Resource resource) {
│               try {
│                       ProviderLookup lookup = providerLookup;
│                       return lookup == null ? null : lookup.get(resource);
│               } catch (Exception e) {
│                       System.out.println("[SysMLLibraryUtil] Cannot get library provider: " + e);
│                       return null;
│               }
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
│       public static List<Type> getGeneralTypesOf(Type type) {
│               return getGeneralTypesOf(type, false);
⋮
│       public static List<Type> getGeneralTypesOf(Type type, boolean excludeImplied) {
│               return getGeneralTypesOf(type, excludeImplied, null);
⋮
│       public static List<Type> getGeneralTypesOf(Type type, boolean excludeImplied, Element skip) {
│               List<Type> generalTypes = getSupertypesOf(type, excludeImplied);
│               if (type instanceof Feature) {
│                       EList<FeatureChaining> featureChainings = ((Feature)type).getOwnedFeatureChaining();
│                       if (!featureChainings.isEmpty() && !featureChainings.contains(skip)) {
│                               FeatureChaining lastFeatureChaining = featureChainings.get(featureChainings.size()-1);
│                               Feature lastChainingFeature = lastFeatureChaining.getChainingFeature();
│                               if (lastChainingFeature != null) {
│                                       generalTypes.add(lastChainingFeature);
│                               }
⋮
│       public static EList<Feature> getFeatureOf(Type type) {
│               EList<Feature> features = new NonNotifyingEObjectEList<>(Feature.class, (InternalEObject)type, Sy
│               getFeatureMembershipOf(type).stream().
│                       map(FeatureMembership::getOwnedMemberFeature).
│                       filter(Objects::nonNull).
│                       forEachOrdered(features::add);
│               return features;
⋮
│       public static EList<Feature> getEndFeatureOf(Type type) {
│               return getEndFeatureOf(type, Feature.class, SysMLPackage.FEATURE__END_FEATURE);
⋮
│       public static <T> EList<T> getEndFeatureOf(Type type, Class<T> kind, int featureId) {
│               EList<T> endFeatures = new NonNotifyingEObjectEList<>(kind, (InternalEObject)type, featureId);
│               TypeUtil.getFeatureOf((Type)type).stream().
│                       filter(Feature::isEnd).
│                       filter(kind::isInstance).
│                       map(kind::cast).
│                       forEachOrdered(endFeatures::add);
│               return endFeatures;
⋮
│       public static List<Feature> getOwnedParametersOf(Type type) {
│               if (type instanceof Feature) {
│                       type = FeatureUtil.getBasicFeatureOf((Feature)type);
│               }
│               return type == null? Collections.emptyList():
│                           type.getOwnedFeature().stream().
│                                       filter(FeatureUtil::isParameter).
│                                       collect(Collectors.toList());
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
│       public static FeatureMembership addOwnedFeatureTo(Type type, Feature feature) {
│               FeatureMembership membership = SysMLFactory.eINSTANCE.createFeatureMembership();
│               membership.setOwnedMemberFeature(feature);
│               type.getOwnedRelationship().add(membership);
│               return membership;
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

org.omg.sysml.logic/src/test/java/org/omg/sysml/logic/TypeFeatureMembershipCacheTest.java:
⋮
│public class TypeFeatureMembershipCacheTest {
│
│       /**
│     * Verifies that a second read of {@link Type#getFeatureMembership()} sees a newly added owned 
│     * first read has already populated the derived list.
│     */
│    @Test
│    public void getFeatureMembershipReflectsOwnedMembershipsAddedAfterFirstRead() {
│        initializeStandalone();
│
⋮
│    private Feature createFeature(String name) {
│        Feature feature = SysMLFactory.eINSTANCE.createFeature();
│        feature.setDeclaredName(name);
│        return feature;
⋮
```
