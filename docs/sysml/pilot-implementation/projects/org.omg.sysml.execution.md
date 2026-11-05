# Repo map: org.omg.sysml.execution

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.execution`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.execution) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 54 files there; aider read the 54 that `pilot.aiderignore` leaves in, and the map shows 54 of them, 47 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.execution/.classpath

org.omg.sysml.execution/.gitignore

org.omg.sysml.execution/.project

org.omg.sysml.execution/.settings/org.eclipse.core.resources.prefs

org.omg.sysml.execution/.settings/org.eclipse.jdt.core.prefs

org.omg.sysml.execution/META-INF/MANIFEST.MF

org.omg.sysml.execution/build.properties:
│source.. = src/
│output.. = target/classes/
│bin.includes = META-INF/,\
⋮

org.omg.sysml.execution/pom.xml

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/ExpressionEvaluator.java:
⋮
│public class ExpressionEvaluator extends ModelLevelExpressionEvaluator {
│       
│       public static final ExpressionEvaluator INSTANCE = new ExpressionEvaluator();
│       
│       public ExpressionEvaluator() {
│               super();
│               setLibraryFunctionFactory(new LibraryFunctionFactory());
│       }
│       
│       @Override
│       public EList<Element> evaluateInvocation(InvocationExpression expression, Element target) {
⋮
│       protected InvocationExpression instantiateInvocation(InvocationExpression expression, Element targ
│               InvocationExpression instantiation = SysMLFactory.eINSTANCE.createInvocationExpression();
│               TypeUtil.addResultParameterTo(instantiation);
│               
│               // Copy instantiatedType from original expression.
│               Type instantiatedType = expression.getInstantiatedType();
│               NamespaceUtil.addMemberTo(instantiation, instantiatedType);
│               
│               // Add implicit generalization.
│               ElementUtil.transform(instantiation);
│               
⋮
│       @Override
│       public EList<Element> evaluateFeature(Feature feature, Type type) {
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/LibraryFunctionFactory.java:
⋮
│public class LibraryFunctionFactory extends org.omg.sysml.expressions.ModelLevelLibraryFunctionFact
│       
│       public static final LibraryFunctionFactory INSTANCE = new LibraryFunctionFactory();
│
│       @Override
│       protected void initialize() {
│               super.initialize();
│               
│               // ControlFunctions
│               put(new ExistsFunction());
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/control/ExistsFunction.jav
⋮
│public class ExistsFunction extends ForAllFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "exists";
│       }
│
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target,
│                       ExpressionEvaluator evaluator) {
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/control/ForAllFunction.jav
⋮
│public class ForAllFunction extends ControlFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "forAll";
│       }
│
│       public Boolean forAll(InvocationExpression invocation, Element target,
│                       ExpressionEvaluator evaluator, Boolean test) {
│               EList<Element> list = evaluator.evaluateArgument(invocation, 0, target);
⋮
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target,
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/control/MaximizeFunction.j
⋮
│public class MaximizeFunction extends ReduceFunction {
│       private static final String MAX_FUNCTION = "DataFunctions::max";
│
│       @Override
│       public String getFunctionName() {
│               return "maximize";
│       }
│
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target,
│                       ExpressionEvaluator evaluator) {
⋮
│               if (list == null || !(expr instanceof Expression)) {
│                       return EvaluationUtil.singletonList(invocation);
│               } else if (list.isEmpty()) {
│                       return EvaluationUtil.nullList();
│               } else {
│                       return reduce(invocation, list, new BiFunction<>() {
│                               @Override
│                               public Element apply(Element result, Element value) {
│                                       EList<Element> exprValue = evaluator.evaluateExpression((Expression)expr, target, value);
│                                       if (exprValue == null || exprValue.size() != 1) {
│                                               return null;
│                                       } else if (result == null) {
│                                               return exprValue.get(0);
│                                       } else {
│                                               Type maxFunction = SysMLLibraryUtil.getLibraryType(expr, MAX_FUNCTION);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/control/MinimizeFunction.j
⋮
│public class MinimizeFunction extends ReduceFunction {
│       private static final String MIN_FUNCTION = "DataFunctions::min";
│
│       @Override
│       public String getFunctionName() {
│               return "minimize";
│       }
│
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target,
│                       ExpressionEvaluator evaluator) {
⋮
│               if (list == null || !(expr instanceof Expression)) {
│                       return EvaluationUtil.singletonList(invocation);
│               } else if (list.isEmpty()) {
│                       return EvaluationUtil.nullList();
│               } else {
│                       return reduce(invocation, list, new BiFunction<>() {
│                               @Override
│                               public Element apply(Element result, Element value) {
│                                       EList<Element> exprValue = evaluator.evaluateExpression((Expression)expr, target, value);
│                                       if (exprValue == null || exprValue.size() != 1) {
│                                               return null;
│                                       } else if (result == null) {
│                                               return exprValue.get(0);
│                                       } else {
│                                               Type minFunction = SysMLLibraryUtil.getLibraryType(expr, MIN_FUNCTION);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/control/ReduceFunction.jav
⋮
│public class ReduceFunction extends ControlFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "reduce";
│       }
│
│       protected EList<Element> reduce(InvocationExpression invocation, EList<Element> list,
│                       BiFunction<Element, Element, Element> compute) {
│               Element result = null;
⋮
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target,
│                       ExpressionEvaluator evaluator) {
⋮
│               if (list == null || !(expr instanceof Expression)) {
│                       return EvaluationUtil.singletonList(invocation);
│               } else if (list.isEmpty()) {
│                       return EvaluationUtil.nullList();
│               } else {
│                       return reduce(invocation, list, new BiFunction<>() {
│                               @Override
│                               public Element apply(Element result, Element value) {
│                                       if (result == null) {
│                                               return value;
│                                       } else {
│                                               EList<Element> exprValue = evaluator.evaluateExpression((Expression)expr, target, result, val
│                                               return exprValue == null || exprValue.size() != 1? null: exprValue.get(0);      
│                                       }
│                               }                       
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/control/RejectFunction.jav
⋮
│public class RejectFunction extends ControlFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "reject";
│       }
│
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target,
│                       ExpressionEvaluator evaluator) {
│               return collectSelected(invocation, target, evaluator, new BiFunction<>() {
│                       @Override
│                       public EList<Element> apply(Element value, EList<Element> exprValue) {
│                               return exprValue != null && exprValue.size() == 1 && Boolean.FALSE.equals(EvaluationUtil.valueO
│                                               EvaluationUtil.singletonList(value):
│                                               EvaluationUtil.nullList();
│                       }                       
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/control/SelectOneFunction.
⋮
│public class SelectOneFunction extends SelectFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "selectOne";
│       }
│
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target,
│                       ExpressionEvaluator evaluator) {
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/data/MaxFunction.java:
⋮
│public class MaxFunction extends ArithmeticFunction {
│       
│       @Override
│       public String getFunctionName() {
│               return "max";
│       }
│       
│       @Override
│       protected EList<Element> binaryIntegerOp(int x, int y) {
│               return x > y? EvaluationUtil.integerResult(x): EvaluationUtil.integerResult(y);
⋮
│       @Override
│       protected EList<Element> binaryRealOp(double x, double y) {
⋮
│       @Override
│       protected EList<Element> binaryStringOp(String x, String y) {
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/data/MinFunction.java:
⋮
│public class MinFunction extends ArithmeticFunction {
│       
│       @Override
│       public String getFunctionName() {
│               return "min";
│       }
│       
│       @Override
│       protected EList<Element> binaryIntegerOp(int x, int y) {
│               return x < y? EvaluationUtil.integerResult(x): EvaluationUtil.integerResult(y);
⋮
│       @Override
│       protected EList<Element> binaryRealOp(double x, double y) {
⋮
│       @Override
│       protected EList<Element> binaryStringOp(String x, String y) {
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/numerical/NumericalFunctio
⋮
│public abstract class NumericalFunction implements LibraryFunction {
│
│       @Override
│       public String getPackageName() {
│               return "NumericalFunctions";
│       }
│
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/numerical/ProdFunction.jav
⋮
│public class ProdFunction extends NumericalFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "product";
│       }
│
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> list = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/numerical/SumFunction.java
⋮
│public class SumFunction extends NumericalFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "sum";
│       }
│
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> list = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/ExcludesFunction.
⋮
│public class ExcludesFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "excludes";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> list1 = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/ExcludingAtFuncti
⋮
│public class ExcludingAtFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "excludingAt";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> seq = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/ExcludingFunction
⋮
│public class ExcludingFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "excluding";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> list1 = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/HeadFunction.java
⋮
│public class HeadFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "head";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> seq = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/IncludesFunction.
⋮
│public class IncludesFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "includes";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> list1 = evaluator.evaluateArgument(invocation, 0, target);
⋮
│       protected static boolean includes(EList<Element> list1, EList<Element> list2) {
│               return list2.stream().allMatch(x->list1.stream().anyMatch(y->EvaluationUtil.equal(x, y)));
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/IncludesOnlyFunct
⋮
│public class IncludesOnlyFunction extends IncludesFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "includesOnly";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> list1 = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/IncludingAtFuncti
⋮
│public class IncludingAtFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "includingAt";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> seq = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/IncludingFunction
⋮
│public class IncludingFunction extends UnionFunction {
│       
│       @Override
│       public String getFunctionName() {
│               return "including";
│       }
│
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/IntersectionFunct
⋮
│public class IntersectionFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "intersection";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> list1 = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/IsEmptyFunction.j
⋮
│public class IsEmptyFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "isEmpty";
│       }
│
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> list = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/LastFunction.java
⋮
│public class LastFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "last";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> seq = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/NotEmptyFunction.
⋮
│public class NotEmptyFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "notEmpty";
│       }
│
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> list = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/SequenceEqualsFun
⋮
│public class SequenceEqualsFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "equals";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target,
│                       ExpressionEvaluator evaluator) {
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

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/SequenceSameFunct
⋮
│public class SequenceSameFunction extends SequenceEqualsFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "same";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target,
│                       ExpressionEvaluator evaluator) {
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/SizeFunction.java
⋮
│public class SizeFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "size";
│       }
│
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> list = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/SubsequenceFuncti
⋮
│public class SubsequenceFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "subsequence";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> seq = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/TailFunction.java
⋮
│public class TailFunction extends SequenceFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "tail";
│       }
│       
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
│               EList<Element> seq = evaluator.evaluateArgument(invocation, 0, target);
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/sequence/UnionFunction.jav
⋮
│public class UnionFunction extends ListConcatFunction {
│       
│       @Override
│       public String getPackageName() {
│               return "SequenceFunctions";
│       }
│
│       @Override
│       public String getFunctionName() {
│               return "union";
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/string/StringFunction.java
⋮
│public abstract class StringFunction implements LibraryFunction {
│
│       @Override
│       public String getPackageName() {
│               return "StringFunctions";
│       }
│
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/string/StringLengthFunctio
⋮
│public class StringLengthFunction extends StringFunction {
│       
│       @Override
│       public String getPackageName() {
│               return "StringFunctions";
│       }
│
│       @Override
│       public String getFunctionName() {
│               return "Length";
⋮
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/string/StringSubstringFunc
⋮
│public class StringSubstringFunction extends StringFunction {
│
│       @Override
│       public String getPackageName() {
│               return "StringFunctions";
│       }
│
│       @Override
│       public String getFunctionName() {
│               return "Substring";
⋮
│       @Override
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/trig/ACosFunction.java:
⋮
│public class ACosFunction extends TrigFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "arccos";
│       }
│
│       @Override
│       protected EList<Element> realFunction(double x) {
│               return EvaluationUtil.realResult(Math.acos(x));
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/trig/AsinFunction.java:
⋮
│public class AsinFunction extends TrigFunction {
│       
│       @Override
│       public String getFunctionName() {
│               return "arcsin";
│       }
│
│       @Override
│       protected EList<Element> realFunction(double x) {
│               return EvaluationUtil.realResult(Math.asin(x));
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/trig/AtanFunction.java:
⋮
│public class AtanFunction extends TrigFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "arctan";
│       }
│
│       @Override
│       protected EList<Element> realFunction(double x) {
│               return EvaluationUtil.realResult(Math.atan(x));
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/trig/CosFunction.java:
⋮
│public class CosFunction extends TrigFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "cos";
│       }
│
│       @Override
│       protected EList<Element> realFunction(double x) {
│               return EvaluationUtil.realResult(Math.cos(x));
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/trig/CotFunction.java:
⋮
│public class CotFunction extends TrigFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "cot";
│       }
│
│       @Override
│       protected EList<Element> realFunction(double x) {
│               return EvaluationUtil.realResult(1.0/Math.tan(x));
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/trig/DegFunction.java:
⋮
│public class DegFunction extends TrigFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "deg";
│       }
│
│       @Override
│       protected EList<Element> realFunction(double x) {
│               return EvaluationUtil.realResult(Math.toDegrees(x));
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/trig/RadFunction.java:
⋮
│public class RadFunction extends TrigFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "rad";
│       }
│
│       @Override
│       protected EList<Element> realFunction(double x) {
│               return EvaluationUtil.realResult(Math.toRadians(x));
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/trig/SinFunction.java:
⋮
│public class SinFunction extends TrigFunction {
│       
│       @Override
│       public String getFunctionName() {
│               return "sin";
│       }
│
│       @Override
│       protected EList<Element> realFunction(double x) {
│               return EvaluationUtil.realResult(Math.sin(x));
⋮

org.omg.sysml.execution/src/org/omg/sysml/execution/expressions/functions/trig/TanFunction.java:
⋮
│public class TanFunction extends TrigFunction {
│
│       @Override
│       public String getFunctionName() {
│               return "tan";
│       }
│
│       @Override
│       protected EList<Element> realFunction(double x) {
│               return EvaluationUtil.realResult(Math.tan(x));
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
│       public EList<Element> invoke(InvocationExpression invocation, Element target, ExpressionEvaluator 
⋮
```
