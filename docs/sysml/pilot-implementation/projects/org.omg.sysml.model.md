# Repo map: org.omg.sysml.model

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.model`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.model) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 376 files there; aider read the 376 that `pilot.aiderignore` leaves in, and the map shows 57 of them, 57 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
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

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/AssociationStructure.java:
⋮
│public interface AssociationStructure extends Association, Structure {
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

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/ConnectionDefinition.java:
⋮
│public interface ConnectionDefinition extends PartDefinition, AssociationStructure {
│       /**
│        * Returns the value of the '<em><b>Connection End</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.Usage}.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Association#getAssociationEnd() <em>Association End</em>
│        * </ul>
⋮

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/ConnectionUsage.java:
⋮
│public interface ConnectionUsage extends ConnectorAsUsage, PartUsage {
│       /**
│        * Returns the value of the '<em><b>Connection Definition</b></em>' reference list.
│        * The list contents are of type {@link org.omg.sysml.lang.sysml.AssociationStructure}.
│        * <p>
│        * This feature subsets the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.ItemUsage#getItemDefinition() <em>Item Definition</em>}'
│        * </ul>
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

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/ConnectorAsUsage.java:
⋮
│public interface ConnectorAsUsage extends Usage, Connector {
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

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/RequirementDefinition.java:
⋮
│public interface RequirementDefinition extends ConstraintDefinition {
│       /**
│        * Returns the value of the '<em><b>Req Id</b></em>' attribute.
│        * <p>
│        * This feature redefines the following features:
│        * </p>
│        * <ul>
│        *   <li>'{@link org.omg.sysml.lang.sysml.Element#getDeclaredShortName() <em>Declared Short Name</
│        * </ul>
│        * <!-- begin-user-doc -->
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

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/Succession.java:
⋮
│public interface Succession extends Connector {
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

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/impl/ClassifierImpl.java:
⋮
│public class ClassifierImpl extends TypeImpl implements Classifier {
│       /**
│        * The cached setting delegate for the '{@link #getOwnedSubclassification() <em>Owned Subclassific
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @see #getOwnedSubclassification()
│        * @generated
│        * @ordered
│        */
│       protected EStructuralFeature.Internal.SettingDelegate OWNED_SUBCLASSIFICATION__ESETTING_DELEGATE =
│
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

org.omg.sysml.model/src/main/java/org/omg/sysml/lang/sysml/util/DerivedEObjectEList.java:
⋮
│public class DerivedEObjectEList<E> extends AbstractSequentialInternalEList<E> implements EStructur
│
│       protected class DerivedListIterator implements ListIterator<E> {
│
│               protected int index = 0;
│
│               protected int featureIndex = 0;
│
│               protected ListIterator<Object> valuesIterator = null;
│
⋮
│       @Override
│       public ListIterator<E> basicListIterator(int index) {
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
│               return eObject.eIsProxy()
│                       ? owner.eResolveProxy((InternalEObject) eObject)
│                       : eObject;
⋮
│       protected boolean isLoading() {
│               Resource.Internal eInternalResource = owner.eInternalResource();
│               return eInternalResource != null && eInternalResource.isLoading();
⋮
│       @Override
│       public NotificationChain basicRemove(Object object,
⋮
│       @Override
│       public NotificationChain basicAdd(E object, NotificationChain notifications) {
⋮
```
