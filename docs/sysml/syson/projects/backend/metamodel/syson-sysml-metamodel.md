# Repo map: backend/metamodel/syson-sysml-metamodel

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/metamodel/syson-sysml-metamodel`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/metamodel/syson-sysml-metamodel) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 439 files there; aider read the 439 that `syson.aiderignore` leaves in, and the map shows 58 of them, 58 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ActionDefinition.java:
⋮
│public interface ActionDefinition extends OccurrenceDefinition, Behavior {
│    /**
│     * Returns the value of the '<em><b>Action</b></em>' reference list. The list contents are of t
│     * {@link org.eclipse.syson.sysml.ActionUsage}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Action</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getActionDefinition_Action()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ActionUsage.java:
⋮
│public interface ActionUsage extends OccurrenceUsage, Step {
│    /**
│     * Returns the value of the '<em><b>Action Definition</b></em>' reference list. The list conten
│     * {@link org.eclipse.syson.sysml.Behavior}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Action Definition</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getActionUsage_ActionDefinition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="redefi
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/AnnotatingElement.java
⋮
│public interface AnnotatingElement extends Element {
│    /**
│     * Returns the value of the '<em><b>Annotated Element</b></em>' reference list. The list conten
│     * {@link org.eclipse.syson.sysml.Element}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Annotated Element</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getAnnotatingElement_AnnotatedElement()
│     * @model required="true" transient="true" changeable="false" volatile="true" derived="true"
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Behavior.java:
⋮
│public interface Behavior extends org.eclipse.syson.sysml.Class {
│    /**
│     * Returns the value of the '<em><b>Parameter</b></em>' reference list. The list contents are o
│     * {@link org.eclipse.syson.sysml.Feature}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Parameter</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getBehavior_Parameter()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="redefi
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/BooleanExpression.java
⋮
│public interface BooleanExpression extends Expression {
│    /**
│     * Returns the value of the '<em><b>Predicate</b></em>' reference. <!-- begin-user-doc --> <!--
│     *
│     * @return the value of the '<em>Predicate</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getBooleanExpression_Predicate()
│     * @model transient="true" changeable="false" volatile="true" derived="true" ordered="false" an
│     * @generated
│     */
│    Predicate getPredicate();
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/CalculationDefinition.
⋮
│public interface CalculationDefinition extends ActionDefinition, Function {
│    /**
│     * Returns the value of the '<em><b>Calculation</b></em>' reference list. The list contents are
│     * {@link org.eclipse.syson.sysml.CalculationUsage}. <!-- begin-user-doc --> <!-- end-user-doc 
│     *
│     * @return the value of the '<em>Calculation</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getCalculationDefinition_Calculation()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/CalculationUsage.java:
⋮
│public interface CalculationUsage extends ActionUsage, Expression {
│    /**
│     * Returns the value of the '<em><b>Calculation Definition</b></em>' reference. <!-- begin-user
│     * end-user-doc -->
│     *
│     * @return the value of the '<em>Calculation Definition</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getCalculationUsage_CalculationDefinition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="redefi
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/CaseDefinition.java:
⋮
│public interface CaseDefinition extends CalculationDefinition {
│    /**
│     * Returns the value of the '<em><b>Actor Parameter</b></em>' reference list. The list contents
│     * {@link org.eclipse.syson.sysml.PartUsage}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Actor Parameter</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getCaseDefinition_ActorParameter()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/CaseUsage.java:
⋮
│public interface CaseUsage extends CalculationUsage {
│    /**
│     * Returns the value of the '<em><b>Actor Parameter</b></em>' reference list. The list contents
│     * {@link org.eclipse.syson.sysml.PartUsage}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Actor Parameter</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getCaseUsage_ActorParameter()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Class.java:
⋮
│public interface Class extends Classifier {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Classifier.java:
⋮
│public interface Classifier extends Type {
│    /**
│     * Returns the value of the '<em><b>Owned Subclassification</b></em>' reference list. The list 
│     * {@link org.eclipse.syson.sysml.Subclassification}. It is bidirectional and its opposite is
│     * '{@link org.eclipse.syson.sysml.Subclassification#getOwningClassifier <em>Owning Classifier<
│     * begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Owned Subclassification</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getClassifier_OwnedSubclassification()
│     * @see org.eclipse.syson.sysml.Subclassification#getOwningClassifier
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ConnectionUsage.java:
⋮
│public interface ConnectionUsage extends ConnectorAsUsage, PartUsage {
│    /**
│     * Returns the value of the '<em><b>Connection Definition</b></em>' reference list. The list co
│     * {@link org.eclipse.syson.sysml.AssociationStructure}. <!-- begin-user-doc --> <!-- end-user-
│     *
│     * @return the value of the '<em>Connection Definition</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getConnectionUsage_ConnectionDefinition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="redefi
│     *        annotation="subsets"
│     * @generated
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Connector.java:
⋮
│public interface Connector extends Feature, Relationship {
│    /**
│     * Returns the value of the '<em><b>Association</b></em>' reference list. The list contents are
│     * {@link org.eclipse.syson.sysml.Association}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Association</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getConnector_Association()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="redefi
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ConnectorAsUsage.java:
⋮
│public interface ConnectorAsUsage extends Usage, Connector {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ConstraintDefinition.j
⋮
│public interface ConstraintDefinition extends OccurrenceDefinition, Predicate {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ConstraintUsage.java:
⋮
│public interface ConstraintUsage extends OccurrenceUsage, BooleanExpression {
│    /**
│     * Returns the value of the '<em><b>Constraint Definition</b></em>' reference. <!-- begin-user-
│     * end-user-doc -->
│     *
│     * @return the value of the '<em>Constraint Definition</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getConstraintUsage_ConstraintDefinition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" ordered="false" an
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ControlNode.java:
⋮
│public interface ControlNode extends ActionUsage {
│    /**
│     * <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @model required="true" ordered="false" multRequired="true" multOrdered="false" lowerRequired
│     *        lowerOrdered="false" upperRequired="true" upperOrdered="false"
│     * @generated
│     */
│    boolean multiplicityHasBounds(Multiplicity mult, int lower, int upper);
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Definition.java:
⋮
│public interface Definition extends Classifier {
│    /**
│     * Returns the value of the '<em><b>Directed Usage</b></em>' reference list. The list contents 
│     * {@link org.eclipse.syson.sysml.Usage}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Directed Usage</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getDefinition_DirectedUsage()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Element.java:
⋮
│public interface Element extends EModelElement {
│    /**
│     * Returns the value of the '<em><b>Alias Ids</b></em>' attribute list. The list contents are o
│     * {@link java.lang.String}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Alias Ids</em>' attribute list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getElement_AliasIds()
│     * @model
│     * @generated
│     */
⋮
│    EList<Relationship> getOwnedRelationship();
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Expression.java:
⋮
│public interface Expression extends Step {
│    /**
│     * Returns the value of the '<em><b>Function</b></em>' reference. <!-- begin-user-doc --> <!-- 
│     *
│     * @return the value of the '<em>Function</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getExpression_Function()
│     * @model transient="true" changeable="false" volatile="true" derived="true" ordered="false" an
│     * @generated
│     */
│    Function getFunction();
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Feature.java:
⋮
│public interface Feature extends Type {
│    /**
│     * Returns the value of the '<em><b>Chaining Feature</b></em>' reference list. The list content
│     * {@link org.eclipse.syson.sysml.Feature}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Chaining Feature</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getFeature_ChainingFeature()
│     * @model transient="true" changeable="false" volatile="true" derived="true"
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/FeatureMembership.java
⋮
│public interface FeatureMembership extends OwningMembership {
│    /**
│     * Returns the value of the '<em><b>Owned Member Feature</b></em>' reference. It is bidirection
│     * is '{@link org.eclipse.syson.sysml.Feature#getOwningFeatureMembership <em>Owning Feature Mem
│     * begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Owned Member Feature</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getFeatureMembership_OwnedMemberFeature()
│     * @see org.eclipse.syson.sysml.Feature#getOwningFeatureMembership
│     * @model opposite="owningFeatureMembership" required="true" transient="true" changeable="false
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Function.java:
⋮
│public interface Function extends Behavior {
│    /**
│     * Returns the value of the '<em><b>Expression</b></em>' reference list. The list contents are 
│     * {@link org.eclipse.syson.sysml.Expression}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Expression</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getFunction_Expression()
│     * @model transient="true" changeable="false" volatile="true" derived="true" ordered="false" an
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Import.java:
⋮
│public interface Import extends Relationship {
│    /**
│     * Returns the value of the '<em><b>Imported Element</b></em>' reference. <!-- begin-user-doc -
│     * -->
│     *
│     * @return the value of the '<em>Imported Element</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getImport_ImportedElement()
│     * @model required="true" transient="true" changeable="false" volatile="true" derived="true" or
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/InstantiationExpressio
⋮
│public interface InstantiationExpression extends Expression {
│    /**
│     * Returns the value of the '<em><b>Argument</b></em>' reference list. The list contents are of
│     * {@link org.eclipse.syson.sysml.Expression}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Argument</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getInstantiationExpression_Argument()
│     * @model transient="true" changeable="false" volatile="true" derived="true"
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/InvocationExpression.j
⋮
│public interface InvocationExpression extends InstantiationExpression {
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ItemDefinition.java:
⋮
│public interface ItemDefinition extends OccurrenceDefinition, Structure {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ItemUsage.java:
⋮
│public interface ItemUsage extends OccurrenceUsage {
│    /**
│     * Returns the value of the '<em><b>Item Definition</b></em>' reference list. The list contents
│     * {@link org.eclipse.syson.sysml.Structure}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Item Definition</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getItemUsage_ItemDefinition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/LiteralExpression.java
⋮
│public interface LiteralExpression extends Expression {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/LoopActionUsage.java:
⋮
│public interface LoopActionUsage extends ActionUsage {
│    /**
│     * Returns the value of the '<em><b>Body Action</b></em>' reference. <!-- begin-user-doc --> <!
│     *
│     * @return the value of the '<em>Body Action</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getLoopActionUsage_BodyAction()
│     * @model required="true" transient="true" changeable="false" volatile="true" derived="true" or
│     * @generated
│     */
│    ActionUsage getBodyAction();
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Membership.java:
⋮
│public interface Membership extends Relationship {
│    /**
│     * Returns the value of the '<em><b>Member Element</b></em>' reference. <!-- begin-user-doc -->
│     * -->
│     *
│     * @return the value of the '<em>Member Element</em>' reference.
│     * @see #setMemberElement(Element)
│     * @see org.eclipse.syson.sysml.SysmlPackage#getMembership_MemberElement()
│     * @model required="true" ordered="false"
│     * @generated
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Namespace.java:
⋮
│public interface Namespace extends Element {
│    /**
│     * Returns the value of the '<em><b>Imported Membership</b></em>' reference list. The list cont
│     * {@link org.eclipse.syson.sysml.Membership}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Imported Membership</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getNamespace_ImportedMembership()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/OccurrenceDefinition.j
⋮
│public interface OccurrenceDefinition extends Definition, org.eclipse.syson.sysml.Class {
│    /**
│     * Returns the value of the '<em><b>Is Individual</b></em>' attribute. The default value is <co
│     * <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Is Individual</em>' attribute.
│     * @see #setIsIndividual(boolean)
│     * @see org.eclipse.syson.sysml.SysmlPackage#getOccurrenceDefinition_IsIndividual()
│     * @model default="false" required="true" ordered="false"
│     * @generated
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/OccurrenceUsage.java:
⋮
│public interface OccurrenceUsage extends Usage {
│    /**
│     * Returns the value of the '<em><b>Individual Definition</b></em>' reference. <!-- begin-user-
│     * end-user-doc -->
│     *
│     * @return the value of the '<em>Individual Definition</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getOccurrenceUsage_IndividualDefinition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" ordered="false" an
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/OperatorExpression.jav
⋮
│public interface OperatorExpression extends InvocationExpression {
│    /**
│     * Returns the value of the '<em><b>Operator</b></em>' attribute. <!-- begin-user-doc --> <!-- 
│     *
│     * @return the value of the '<em>Operator</em>' attribute.
│     * @see #setOperator(String)
│     * @see org.eclipse.syson.sysml.SysmlPackage#getOperatorExpression_Operator()
│     * @model required="true" ordered="false"
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/OwningMembership.java:
⋮
│public interface OwningMembership extends Membership {
│    /**
│     * Returns the value of the '<em><b>Owned Member Element</b></em>' reference. It is bidirection
│     * is '{@link org.eclipse.syson.sysml.Element#getOwningMembership <em>Owning Membership</em>}'.
│     * --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Owned Member Element</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getOwningMembership_OwnedMemberElement()
│     * @see org.eclipse.syson.sysml.Element#getOwningMembership
│     * @model opposite="owningMembership" required="true" transient="true" changeable="false" volat
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/ParameterMembership.ja
⋮
│public interface ParameterMembership extends FeatureMembership {
│    /**
│     * Returns the value of the '<em><b>Owned Member Parameter</b></em>' reference. <!-- begin-user
│     * end-user-doc -->
│     *
│     * @return the value of the '<em>Owned Member Parameter</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getParameterMembership_OwnedMemberParameter()
│     * @model required="true" transient="true" changeable="false" volatile="true" derived="true" or
│     *        annotation="redefines"
│     * @generated
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/PartDefinition.java:
⋮
│public interface PartDefinition extends ItemDefinition {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/PartUsage.java:
⋮
│public interface PartUsage extends ItemUsage {
│    /**
│     * Returns the value of the '<em><b>Part Definition</b></em>' reference list. The list contents
│     * {@link org.eclipse.syson.sysml.PartDefinition}. <!-- begin-user-doc --> <!-- end-user-doc --
│     *
│     * @return the value of the '<em>Part Definition</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getPartUsage_PartDefinition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Predicate.java:
⋮
│public interface Predicate extends Function {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Relationship.java:
⋮
│public interface Relationship extends Element {
│    /**
│     * Returns the value of the '<em><b>Is Implied</b></em>' attribute. The default value is <code>
│     * begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Is Implied</em>' attribute.
│     * @see #setIsImplied(boolean)
│     * @see org.eclipse.syson.sysml.SysmlPackage#getRelationship_IsImplied()
│     * @model default="false" required="true" ordered="false"
│     * @generated
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/RequirementConstraintM
⋮
│public interface RequirementConstraintMembership extends FeatureMembership {
│    /**
│     * Returns the value of the '<em><b>Kind</b></em>' attribute. The literals are from the enumera
│     * {@link org.eclipse.syson.sysml.RequirementConstraintKind}. <!-- begin-user-doc --> <!-- end-
│     *
│     * @return the value of the '<em>Kind</em>' attribute.
│     * @see org.eclipse.syson.sysml.RequirementConstraintKind
│     * @see #setKind(RequirementConstraintKind)
│     * @see org.eclipse.syson.sysml.SysmlPackage#getRequirementConstraintMembership_Kind()
│     * @model required="true" ordered="false"
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/RequirementDefinition.
⋮
│public interface RequirementDefinition extends ConstraintDefinition {
│    /**
│     * Returns the value of the '<em><b>Actor Parameter</b></em>' reference list. The list contents
│     * {@link org.eclipse.syson.sysml.PartUsage}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Actor Parameter</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getRequirementDefinition_ActorParameter()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/RequirementUsage.java:
⋮
│public interface RequirementUsage extends ConstraintUsage {
│    /**
│     * Returns the value of the '<em><b>Actor Parameter</b></em>' reference list. The list contents
│     * {@link org.eclipse.syson.sysml.PartUsage}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Actor Parameter</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getRequirementUsage_ActorParameter()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Specialization.java:
⋮
│public interface Specialization extends Relationship {
│    /**
│     * Returns the value of the '<em><b>General</b></em>' reference. <!-- begin-user-doc --> <!-- e
│     *
│     * @return the value of the '<em>General</em>' reference.
│     * @see #setGeneral(Type)
│     * @see org.eclipse.syson.sysml.SysmlPackage#getSpecialization_General()
│     * @model required="true" ordered="false" annotation="redefines"
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Step.java:
⋮
│public interface Step extends Feature {
│    /**
│     * Returns the value of the '<em><b>Behavior</b></em>' reference list. The list contents are of
│     * {@link org.eclipse.syson.sysml.Behavior}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Behavior</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getStep_Behavior()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="subset
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Structure.java:
⋮
│public interface Structure extends org.eclipse.syson.sysml.Class {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Subsetting.java:
⋮
│public interface Subsetting extends Specialization {
│    /**
│     * Returns the value of the '<em><b>Owning Feature</b></em>' reference. It is bidirectional and
│     * '{@link org.eclipse.syson.sysml.Feature#getOwnedSubsetting <em>Owned Subsetting</em>}'. <!--
│     * <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Owning Feature</em>' reference.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getSubsetting_OwningFeature()
│     * @see org.eclipse.syson.sysml.Feature#getOwnedSubsetting
│     * @model opposite="ownedSubsetting" transient="true" changeable="false" volatile="true" derive
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Succession.java:
⋮
│public interface Succession extends Connector {
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/SysmlPackage.java:
⋮
│public interface SysmlPackage extends EPackage {
│    /**
│     * The package name. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    String eNAME = "sysml";
│
│    /**
│     * The package namespace URI. <!-- begin-user-doc --> <!-- end-user-doc -->
⋮
│    EReference getElement_TextualRepresentation();
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Type.java:
⋮
│public interface Type extends Namespace {
│    /**
│     * Returns the value of the '<em><b>Differencing Type</b></em>' reference list. The list conten
│     * {@link org.eclipse.syson.sysml.Type}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Differencing Type</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getType_DifferencingType()
│     * @model transient="true" changeable="false" volatile="true" derived="true"
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/Usage.java:
⋮
│public interface Usage extends Feature {
│    /**
│     * Returns the value of the '<em><b>Definition</b></em>' reference list. The list contents are 
│     * {@link org.eclipse.syson.sysml.Classifier}. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @return the value of the '<em>Definition</em>' reference list.
│     * @see org.eclipse.syson.sysml.SysmlPackage#getUsage_Definition()
│     * @model transient="true" changeable="false" volatile="true" derived="true" annotation="redefi
│     * @generated
│     */
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/helper/ImplicitSpecial
⋮
│@Deprecated
│public class ImplicitSpecializationAccumulator {
│
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/impl/ElementImpl.java:
⋮
│public abstract class ElementImpl extends EModelElementImpl implements Element {
│    /**
│     * The cached value of the '{@link #getAliasIds() <em>Alias Ids</em>}' attribute list. <!-- beg
│     * end-user-doc -->
│     *
│     * @see #getAliasIds()
│     * @generated
│     * @ordered
│     */
│    protected EList<String> aliasIds;
│
⋮
│    @Override
│    public EList<Relationship> getOwnedRelationship() {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/impl/SysmlFactoryImpl.
⋮
│public class SysmlFactoryImpl extends EFactoryImpl implements SysmlFactory {
│    /**
│     * Creates the default factory implementation. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    public static SysmlFactory init() {
│        try {
│            SysmlFactory theSysmlFactory = (SysmlFactory) EPackage.Registry.INSTANCE.getEFactory(Sy
│            if (theSysmlFactory != null) {
│                return theSysmlFactory;
│            }
│        } catch (Exception exception) {
│            EcorePlugin.INSTANCE.log(exception);
│        }
│        return new SysmlFactoryImpl();
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/impl/SysmlPackageImpl.
⋮
│public class SysmlPackageImpl extends EPackageImpl implements SysmlPackage {
│    /**
│     * <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    private EClass acceptActionUsageEClass = null;
│
│    /**
│     * <!-- begin-user-doc --> <!-- end-user-doc -->
⋮
│    public static SysmlPackage init() {
│        if (isInited) {
│            return (SysmlPackage) EPackage.Registry.INSTANCE.getEPackage(SysmlPackage.eNS_URI);
│        }
│
│        // Obtain or create and register package
│        Object registeredSysmlPackage = EPackage.Registry.INSTANCE.get(eNS_URI);
│        SysmlPackageImpl theSysmlPackage = registeredSysmlPackage instanceof SysmlPackageImpl ? (Sy
│
│        isInited = true;
│
⋮
│    @Override
│    public EReference getElement_TextualRepresentation() {
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/util/ILibraryNamespace
⋮
│public interface ILibraryNamespaceProvider {
│
│    /**
│     * Gets an element from its full qualified name and cast it with the given type if compliant.
│     *
│     * @param <T>
│     *            the expected type
│     * @param qualifiedName
│     *            the full qualified name
│     * @param type
⋮

backend/metamodel/syson-sysml-metamodel/src/main/java/org/eclipse/syson/sysml/util/VirtualLinkAdapte
⋮
│public class VirtualLinkAdapter extends AdapterImpl {
│
│    private final Element virtualOwningRelatedElement;
│
│    private final String virtualReferenceName;
│
│    public VirtualLinkAdapter(Element virtualOwningRelatedElement, String virtualReferenceName) {
│        super();
│        this.virtualOwningRelatedElement = Objects.requireNonNull(virtualOwningRelatedElement);
│        this.virtualReferenceName = Objects.requireNonNull(virtualReferenceName);
⋮
│    public String getVirtualReferenceName() {
│        return this.virtualReferenceName;
⋮
```
