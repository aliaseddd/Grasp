# Repo map: backend/metamodel/syson-sysml-metamodel-edit

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/metamodel/syson-sysml-metamodel-edit`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/metamodel/syson-sysml-metamodel-edit) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 391 files there; aider read the 192 that `syson.aiderignore` leaves in, and the map shows 42 of them, 42 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Allocati
⋮
│public class AllocationUsageItemProvider extends ConnectionUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public AllocationUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Attribut
⋮
│public class AttributeDefinitionItemProvider extends DefinitionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public AttributeDefinitionItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/BindingC
⋮
│public class BindingConnectorAsUsageItemProvider extends ConnectorAsUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public BindingConnectorAsUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/CaseDefi
⋮
│public class CaseDefinitionItemProvider extends CalculationDefinitionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public CaseDefinitionItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/ClassIte
⋮
│public class ClassItemProvider extends ClassifierItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public ClassItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/ConcernU
⋮
│public class ConcernUsageItemProvider extends RequirementUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public ConcernUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Constrai
⋮
│public class ConstraintUsageItemProvider extends OccurrenceUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public ConstraintUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Definiti
⋮
│public class DefinitionItemProvider extends ClassifierItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public DefinitionItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/ElementI
⋮
│public class ElementItemProvider
│        extends EModelElementItemProvider {
⋮
│    @Override
│    protected ItemPropertyDescriptor createItemPropertyDescriptor(AdapterFactory adapterFactory, Re
⋮
│    @Override
│    public ResourceLocator getResourceLocator() {
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Enumerat
⋮
│public class EnumerationDefinitionItemProvider extends AttributeDefinitionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public EnumerationDefinitionItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/EventOcc
⋮
│public class EventOccurrenceUsageItemProvider extends OccurrenceUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public EventOccurrenceUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/ExhibitS
⋮
│public class ExhibitStateUsageItemProvider extends StateUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public ExhibitStateUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/FeatureC
⋮
│public class FeatureChainExpressionItemProvider extends OperatorExpressionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public FeatureChainExpressionItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/IfAction
⋮
│public class IfActionUsageItemProvider extends ActionUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public IfActionUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/ImportIt
⋮
│public class ImportItemProvider extends RelationshipItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public ImportItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Interact
⋮
│public class InteractionItemProvider extends AssociationItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public InteractionItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Intersec
⋮
│public class IntersectingItemProvider extends RelationshipItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public IntersectingItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Invarian
⋮
│public class InvariantItemProvider extends BooleanExpressionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public InvariantItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/LibraryP
⋮
│public class LibraryPackageItemProvider extends PackageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public LibraryPackageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/LiteralE
⋮
│public class LiteralExpressionItemProvider extends ExpressionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public LiteralExpressionItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/LiteralI
⋮
│public class LiteralInfinityItemProvider extends LiteralExpressionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public LiteralInfinityItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/LiteralS
⋮
│public class LiteralStringItemProvider extends LiteralExpressionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public LiteralStringItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/LoopActi
⋮
│public class LoopActionUsageItemProvider extends ActionUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public LoopActionUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/MergeNod
⋮
│public class MergeNodeItemProvider extends ControlNodeItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public MergeNodeItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Multipli
⋮
│public class MultiplicityItemProvider extends FeatureItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public MultiplicityItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Namespac
⋮
│public class NamespaceImportItemProvider extends ImportItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public NamespaceImportItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    protected Object overlayImage(Object object, Object image) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Namespac
⋮
│public class NamespaceItemProvider extends ElementItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public NamespaceItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    protected Object overlayImage(Object object, Object image) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Operator
⋮
│public class OperatorExpressionItemProvider extends InvocationExpressionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public OperatorExpressionItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Predicat
⋮
│public class PredicateItemProvider extends FunctionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public PredicateItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Redefini
⋮
│public class RedefinitionItemProvider extends SubsettingItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public RedefinitionItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Referenc
⋮
│public class ReferenceSubsettingItemProvider extends SubsettingItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public ReferenceSubsettingItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Renderin
⋮
│public class RenderingUsageItemProvider extends PartUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public RenderingUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Requirem
⋮
│public class RequirementDefinitionItemProvider extends ConstraintDefinitionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public RequirementDefinitionItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Requirem
⋮
│public class RequirementUsageItemProvider extends ConstraintUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public RequirementUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/SatisfyR
⋮
│public class SatisfyRequirementUsageItemProvider extends RequirementUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public SatisfyRequirementUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/SelectEx
⋮
│public class SelectExpressionItemProvider extends OperatorExpressionItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public SelectExpressionItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/StepItem
⋮
│public class StepItemProvider extends FeatureItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public StepItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Subsetti
⋮
│public class SubsettingItemProvider extends SpecializationItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public SubsettingItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/SysmlEdi
⋮
│public final class SysmlEditPlugin extends EMFPlugin {
│    /**
│     * Keep track of the singleton. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    public static final SysmlEditPlugin INSTANCE = new SysmlEditPlugin();
│
│    /**
│     * Keep track of the singleton. <!-- begin-user-doc --> <!-- end-user-doc -->
⋮
│    protected static String extensionFor(String key) {
│        String result = ".gif";
│        int index = key.lastIndexOf('.');
│        if (index != -1) {
│            String extension = key.substring(index + 1);
│            if ("png".equalsIgnoreCase(extension) ||
│                    "gif".equalsIgnoreCase(extension) ||
│                    "bmp".equalsIgnoreCase(extension) ||
│                    "ico".equalsIgnoreCase(extension) ||
│                    "jpg".equalsIgnoreCase(extension) ||
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/SysmlIte
⋮
│public class SysmlItemProviderAdapterFactory extends SysmlAdapterFactory implements ComposeableAdap
│    /**
│     * This keeps track of the root adapter factory that delegates to this adapter factory. <!-- be
│     * end-user-doc -->
│     *
│     * @generated
│     */
│    protected ComposedAdapterFactory parentAdapterFactory;
│
│    /**
⋮
│    @Override
│    public ComposeableAdapterFactory getRootAdapterFactory() {
⋮
│    @Override
│    public ResourceLocator getResourceLocator() {
⋮
│    @Override
│    public void fireNotifyChanged(Notification notification) {
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Terminat
⋮
│public class TerminateActionUsageItemProvider extends ActionUsageItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public TerminateActionUsageItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮

backend/metamodel/syson-sysml-metamodel-edit/src/main/java/org/eclipse/syson/sysml/provider/Transiti
⋮
│public class TransitionFeatureMembershipItemProvider extends FeatureMembershipItemProvider {
│    /**
│     * This constructs an instance from a factory and a notifier. <!-- begin-user-doc --> <!-- end-
│     *
│     * @generated
│     */
│    public TransitionFeatureMembershipItemProvider(AdapterFactory adapterFactory) {
│        super(adapterFactory);
│    }
│
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮
```
