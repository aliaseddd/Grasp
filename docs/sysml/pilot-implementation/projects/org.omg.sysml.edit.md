# Repo map: org.omg.sysml.edit

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.edit`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.edit) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 1,209 files there; aider read the 188 that `pilot.aiderignore` leaves in, and the map shows 44 of them, 44 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.edit/build.properties:
⋮
│bin.includes = .,\
│               icons/,\
│               META-INF/,\
│               plugin.xml,\
│               plugin.properties
│jars.compile.order = .
│source.. = src/
│output.. = target/classes

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/BehaviorItemProvider.java:
⋮
│public class BehaviorItemProvider extends ClassItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public BehaviorItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/CaseUsageItemProvider.java:
⋮
│public class CaseUsageItemProvider extends CalculationUsageItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public CaseUsageItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/ClassifierItemProvider.java:
⋮
│public class ClassifierItemProvider extends TypeItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public ClassifierItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/CommentItemProvider.java:
⋮
│public class CommentItemProvider extends AnnotatingElementItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public CommentItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/ConstraintDefinitionItemProvider.java:
⋮
│public class ConstraintDefinitionItemProvider extends OccurrenceDefinitionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public ConstraintDefinitionItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/ConstructorExpressionItemProvider.java:
⋮
│public class ConstructorExpressionItemProvider extends InstantiationExpressionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public ConstructorExpressionItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/CrossSubsettingItemProvider.java:
⋮
│public class CrossSubsettingItemProvider extends SubsettingItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public CrossSubsettingItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/DefinitionItemProvider.java:
⋮
│public class DefinitionItemProvider extends ClassifierItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public DefinitionItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
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

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/EnumerationDefinitionItemProvider.java:
⋮
│public class EnumerationDefinitionItemProvider extends AttributeDefinitionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public EnumerationDefinitionItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/ExposeItemProvider.java:
⋮
│public class ExposeItemProvider extends ImportItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public ExposeItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/FeatureChainExpressionItemProvider.java:
⋮
│public class FeatureChainExpressionItemProvider extends OperatorExpressionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public FeatureChainExpressionItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/FeatureItemProvider.java:
⋮
│public class FeatureItemProvider extends TypeItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public FeatureItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/FeatureMembershipItemProvider.java:
⋮
│public class FeatureMembershipItemProvider extends OwningMembershipItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public FeatureMembershipItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/FunctionItemProvider.java:
⋮
│public class FunctionItemProvider extends BehaviorItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public FunctionItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/IncludeUseCaseUsageItemProvider.java:
⋮
│public class IncludeUseCaseUsageItemProvider extends UseCaseUsageItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public IncludeUseCaseUsageItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/IntersectingItemProvider.java:
⋮
│public class IntersectingItemProvider extends RelationshipItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public IntersectingItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/InvariantItemProvider.java:
⋮
│public class InvariantItemProvider extends BooleanExpressionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public InvariantItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/LiteralBooleanItemProvider.java:
⋮
│public class LiteralBooleanItemProvider extends LiteralExpressionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public LiteralBooleanItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/LiteralIntegerItemProvider.java:
⋮
│public class LiteralIntegerItemProvider extends LiteralExpressionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public LiteralIntegerItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/LiteralStringItemProvider.java:
⋮
│public class LiteralStringItemProvider extends LiteralExpressionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public LiteralStringItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/MembershipImportItemProvider.java:
⋮
│public class MembershipImportItemProvider extends ImportItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public MembershipImportItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/MetadataFeatureItemProvider.java:
⋮
│public class MetadataFeatureItemProvider extends FeatureItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public MetadataFeatureItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/MultiplicityItemProvider.java:
⋮
│public class MultiplicityItemProvider extends FeatureItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public MultiplicityItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/NullExpressionItemProvider.java:
⋮
│public class NullExpressionItemProvider extends ExpressionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public NullExpressionItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/OccurrenceDefinitionItemProvider.java:
⋮
│public class OccurrenceDefinitionItemProvider extends DefinitionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public OccurrenceDefinitionItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/PortConjugationItemProvider.java:
⋮
│public class PortConjugationItemProvider extends ConjugationItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public PortConjugationItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/PortUsageItemProvider.java:
⋮
│public class PortUsageItemProvider extends OccurrenceUsageItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public PortUsageItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/ReferenceUsageItemProvider.java:
⋮
│public class ReferenceUsageItemProvider extends UsageItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public ReferenceUsageItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/RenderingDefinitionItemProvider.java:
⋮
│public class RenderingDefinitionItemProvider extends PartDefinitionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public RenderingDefinitionItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/RequirementVerificationMembershipItemProvid
⋮
│public class RequirementVerificationMembershipItemProvider extends RequirementConstraintMembershipI
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public RequirementVerificationMembershipItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/ReturnParameterMembershipItemProvider.java:
⋮
│public class ReturnParameterMembershipItemProvider extends ParameterMembershipItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public ReturnParameterMembershipItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/SendActionUsageItemProvider.java:
⋮
│public class SendActionUsageItemProvider extends ActionUsageItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public SendActionUsageItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/StateDefinitionItemProvider.java:
⋮
│public class StateDefinitionItemProvider extends ActionDefinitionItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public StateDefinitionItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/StateSubactionMembershipItemProvider.java:
⋮
│public class StateSubactionMembershipItemProvider extends FeatureMembershipItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public StateSubactionMembershipItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/StateUsageItemProvider.java:
⋮
│public class StateUsageItemProvider extends ActionUsageItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public StateUsageItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/SuccessionFlowItemProvider.java:
⋮
│public class SuccessionFlowItemProvider extends FlowItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public SuccessionFlowItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/SuccessionFlowUsageItemProvider.java:
⋮
│public class SuccessionFlowUsageItemProvider extends FlowUsageItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public SuccessionFlowUsageItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
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
│       @Override
│       public void fireNotifyChanged(Notification notification) {
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/UsageItemProvider.java:
⋮
│public class UsageItemProvider extends FeatureItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public UsageItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/VariantMembershipItemProvider.java:
⋮
│public class VariantMembershipItemProvider extends OwningMembershipItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public VariantMembershipItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮

org.omg.sysml.edit/src/org/omg/sysml/lang/sysml/provider/VerificationCaseUsageItemProvider.java:
⋮
│public class VerificationCaseUsageItemProvider extends CaseUsageItemProvider {
│       /**
│        * This constructs an instance from a factory and a notifier.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public VerificationCaseUsageItemProvider(AdapterFactory adapterFactory) {
│               super(adapterFactory);
│       }
│
⋮
│       @Override
│       public void notifyChanged(Notification notification) {
⋮
│       @Override
│       protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object) {
⋮
│       @Override
│       public String getCreateChildText(Object owner, Object feature, Object child, Collection<?> selecti
⋮
```
