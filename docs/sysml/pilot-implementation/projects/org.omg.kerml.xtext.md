# Repo map: org.omg.kerml.xtext

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.kerml.xtext`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.kerml.xtext) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 105 files there; aider read the 91 that `pilot.aiderignore` leaves in, and the map shows 54 of them, 54 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.kerml.xtext/build.properties:
│source.. = src/,\
⋮
│bin.includes = .,\
│               META-INF/
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

org.omg.kerml.xtext/src/org/omg/kerml/xtext/library/ILibraryIndexProvider.java:
⋮
│public interface ILibraryIndexProvider {
│       /**
│        * Use this method to return a library index for a given resource. Return an
│        * {@link org.omg.kerml.xtext.library.LibraryIndex#EMPTY_INDEX empty index} in case there is no
│        * index for the given resource. Never return null.
│        */
│        public LibraryIndex getIndexFor(Resource resource);
│        
│        /**
│         * Use this method to disable the library index.
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/library/LibraryIndex.java:
⋮
│public class LibraryIndex {
│       
│       public static final String FILE_NAME = ".index.json";
│       
│       /**
│        * Library index containing no entries. Use this object when a library index is not available.
│        */
│       public static final LibraryIndex EMPTY_INDEX = new LibraryIndex();
│       
│       private static final Type JAVA_TYPE = new TypeToken<LibraryIndex>() {}.getType();
│       
⋮
│       public static LibraryIndex fromJson(Reader reader) {
│               Gson gson = new Gson();
│               return gson.fromJson(reader, JAVA_TYPE);
⋮
│       private String createChecksum(Map<String, Set<String>> index) {
│                HashCode hashedIndex = Hashing.sha256().hashObject(index, (from, into) -> {
│                       from.forEach((libFqn, shortNames) -> {
│                               into.putBytes(libFqn.getBytes(StandardCharsets.UTF_8));
│                               shortNames.forEach(shortName -> into.putBytes(shortName.getBytes(StandardCharsets.UTF_8)));
│                       });
│               });
│            
│        return hashedIndex.toString();
⋮
│       private static void addIfNotNull(final Map<String, Set<String>> names, final String ns, final Stri
│               if (name != null) {
│                       names.computeIfAbsent(ns, key -> new HashSet<>()).add(name);
│               }
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/library/PrecalculatedLibraryIndexProvider.java:
⋮
│public class PrecalculatedLibraryIndexProvider implements ILibraryIndexProvider {
│       
│       private static Logger log = Logger.getLogger(PrecalculatedLibraryIndexProvider.class);
│       private static final String LIBRARY_FOLDER = "sysml.library";
│
│       //Using a singleton to prevent multiple library indexes in a multi-injector environment
│       //Accessing this singleton should be still done through dependency injection and not directly
│       private static PrecalculatedLibraryIndexProvider INSTANCE = null;
│       
│       private LibraryIndex index = null;
⋮
│       public boolean isIndexDisabled() {
│               return disabled;
⋮
│       private File getIndexFile(URI uri) {
│               String fileString = uri.toFileString();
│               if (fileString == null) return null;
│               int idx = fileString.lastIndexOf(LIBRARY_FOLDER);
│               if (idx < 0) return null;
│               String parentPath = fileString.substring(0, idx + LIBRARY_FOLDER.length());
│               return new File(parentPath, LibraryIndex.FILE_NAME);
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/linking/KerMLLazyLinkingResource.java:
⋮
│public class KerMLLazyLinkingResource extends LazyLinkingResource {
│       
│       public void clearUnresolvableURIFragments() {
│               getUnresolvableURIFragments().clear();
│       }
│       
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/naming/KerMLQualifiedNameProvider.java:
⋮
│public class KerMLQualifiedNameProvider extends DefaultDeclarativeQualifiedNameProvider {
│
│       private Function<EObject, String> resolver = SimpleAttributeResolver.newResolver(String.class, "de
│       
│       @Override
│       protected Function<EObject, String> getResolver() {
│               Function<EObject, String> parentResolver = resolver;
│               return object -> {
│                       String unescapedName = parentResolver.apply(object);
│                       return unescapedName == null ? null : "'" + ElementUtil.escapeString(unescapedName) + "'";
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/naming/QualifiedNameUtil.java:
⋮
│public class QualifiedNameUtil {
│       
│       public static QualifiedName createQualifiedName(List<String> segments) {
│               return QualifiedName.create(segments);
│       }
│       
│       public static boolean isGlobalScopeQualification(QualifiedName qualifiedName) {
│               return qualifiedName != null &&
│                               qualifiedName.getSegmentCount() > 0 &&
│                               ElementUtil.isGlobalScopeSymbol(qualifiedName.getFirstSegment()); 
⋮
│       public static String toQualifiedNameString(QualifiedName qualifiedName) {
│               return ElementUtil.toQualifiedNameString(qualifiedName.getSegments());
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/AnnotatingElementParserPostProcessor.java
⋮
│public class AnnotatingElementParserPostProcessor extends ElementParserPostProcessor {
│
│       public AnnotatingElementParserPostProcessor(AnnotatingElement element) {
│               super(element);
│       }
│       
│       public AnnotatingElement getTarget() {
│               return (AnnotatingElement)super.getTarget();
│       }
│
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/AnnotationParserPostProcessor.java:
⋮
│public class AnnotationParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public AnnotationParserPostProcessor(Annotation element) {
│               super(element);
│       }
│
│       @Override
│       public Annotation getTarget() {
│               return (Annotation)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/ClassifierParserPostProcessor.java:
⋮
│public class ClassifierParserPostProcessor extends TypeParserPostProcessor {
│
│       public ClassifierParserPostProcessor(Classifier element) {
│               super(element);
│       }
│
│       @Override
│       public Classifier getTarget() {
│               return (Classifier)super.getTarget();
│       }
│
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/CommentParserPostProcessor.java:
⋮
│public class CommentParserPostProcessor extends AnnotatingElementParserPostProcessor {
│
│       public CommentParserPostProcessor(Comment element) {
│               super(element);
│       }
│
│       @Override
│       public Comment getTarget() {
│               return (Comment)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/ConjugationParserPostProcessor.java:
⋮
│public class ConjugationParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public ConjugationParserPostProcessor(Conjugation element) {
│               super(element);
│       }
│
│       @Override
│       public Conjugation getTarget() {
│               return (Conjugation)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/DependencyParserPostProcessor.java:
⋮
│public class DependencyParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public DependencyParserPostProcessor(Dependency element) {
│               super(element);
│       }
│
│       @Override
│       public Dependency getTarget() {
│               return (Dependency)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/DifferencingParserPostProcessor.java:
⋮
│public class DifferencingParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public DifferencingParserPostProcessor(Differencing element) {
│               super(element);
│       }
│
│       @Override
│       public Differencing getTarget() {
│               return (Differencing)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/DisjoiningParserPostProcessor.java:
⋮
│public class DisjoiningParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public DisjoiningParserPostProcessor(Disjoining element) {
│               super(element);
│       }
│
│       @Override
│       public Disjoining getTarget() {
│               return (Disjoining)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/ElementParserPostProcessor.java:
⋮
│public class ElementParserPostProcessor {
│
│       private final Element target;
│
│       public ElementParserPostProcessor(Element element) {
│               target = element;
│       }
│
│       public Element getTarget() {
│               return target;
⋮
│       public void postProcess() {
│               Element target = getTarget();
│               target.setDeclaredName(ElementUtil.unescapeString(target.getDeclaredName()));
│               target.setDeclaredShortName(ElementUtil.unescapeString(target.getDeclaredShortName()));
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/EndFeatureMembershipParserPostProcessor.j
⋮
│public class EndFeatureMembershipParserPostProcessor extends FeatureMembershipParserPostProcessor {
│
│       public EndFeatureMembershipParserPostProcessor(EndFeatureMembership element) {
│               super(element);
│       }
│
│       @Override
│       public EndFeatureMembership getTarget() {
│               return (EndFeatureMembership)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/ExpressionParserPostProcessor.java:
⋮
│public class ExpressionParserPostProcessor extends StepParserPostProcessor {
│
│       public ExpressionParserPostProcessor(Expression element) {
│               super(element);
│       }
│
│       @Override
│       public Expression getTarget() {
│               return (Expression)super.getTarget();
│       }
│
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/FeatureChainExpressionParserPostProcessor
⋮
│public class FeatureChainExpressionParserPostProcessor extends InvocationExpressionParserPostProces
│
│       public FeatureChainExpressionParserPostProcessor(FeatureChainExpression element) {
│               super(element);
│       }
│
│       @Override
│       public FeatureChainExpression getTarget() {
│               return (FeatureChainExpression)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/FeatureInvertingParserPostProcessor.java:
⋮
│public class FeatureInvertingParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public FeatureInvertingParserPostProcessor(FeatureInverting element) {
│               super(element);
│       }
│
│       @Override
│       public FeatureInverting getTarget() {
│               return (FeatureInverting)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/FeatureMembershipParserPostProcessor.java
⋮
│public class FeatureMembershipParserPostProcessor extends OwningMembershipParserPostProcessor {
│
│       public FeatureMembershipParserPostProcessor(FeatureMembership element) {
│               super(element);
│       }
│       
│       public FeatureMembership getTarget() {
│               return (FeatureMembership)super.getTarget();
│       }
│
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/FeatureParserPostProcessor.java:
⋮
│public class FeatureParserPostProcessor extends TypeParserPostProcessor {
│
│       public FeatureParserPostProcessor(Feature element) {
│               super(element);
│       }
│
│       @Override
│       public Feature getTarget() {
│               return (Feature)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮
│       protected void setIsVariableIfConstant() {
│               Feature target = getTarget();
│               if (target.isConstant()) {
│                       target.setIsVariable(true);
│               }               
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/FeatureReferenceExpressionParserPostProce
⋮
│public class FeatureReferenceExpressionParserPostProcessor extends ExpressionParserPostProcessor {
│
│       public FeatureReferenceExpressionParserPostProcessor(FeatureReferenceExpression element) {
│               super(element);
│       }
│
│       @Override
│       public FeatureReferenceExpression getTarget() {
│               return (FeatureReferenceExpression)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
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
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/ImportParserPostProcessor.java:
⋮
│public class ImportParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public ImportParserPostProcessor(Import element) {
│               super(element);
│       }
│
│       @Override
│       public Import getTarget() {
│               return (Import)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/InstantiationExpressionParserPostProcesso
⋮
│public class InstantiationExpressionParserPostProcessor extends ExpressionParserPostProcessor {
│
│       public InstantiationExpressionParserPostProcessor(InstantiationExpression element) {
│               super(element);
│       }
│
│       @Override
│       public InstantiationExpression getTarget() {
│               return (InstantiationExpression)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/IntersectingParserPostProcessor.java:
⋮
│public class IntersectingParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public IntersectingParserPostProcessor(Intersecting element) {
│               super(element);
│       }
│
│       @Override
│       public Intersecting getTarget() {
│               return (Intersecting)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/InvocationExpressionParserPostProcessor.j
⋮
│public class InvocationExpressionParserPostProcessor extends InstantiationExpressionParserPostProce
│
│       public InvocationExpressionParserPostProcessor(InvocationExpression element) {
│               super(element);
│       }
│
│       @Override
│       public InvocationExpression getTarget() {
│               return (InvocationExpression)super.getTarget();
│       }
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/LiteralExpressionParserPostProcessor.java
⋮
│public class LiteralExpressionParserPostProcessor extends ExpressionParserPostProcessor {
│
│       public LiteralExpressionParserPostProcessor(LiteralExpression element) {
│               super(element);
│       }
│
│       @Override
│       public LiteralExpression getTarget() {
│               return (LiteralExpression)super.getTarget();
│       }
│
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/LiteralStringParserPostProcessor.java:
⋮
│public class LiteralStringParserPostProcessor extends LiteralExpressionParserPostProcessor {
│
│       public LiteralStringParserPostProcessor(LiteralString element) {
│               super(element);
│       }
│
│       @Override
│       public LiteralString getTarget() {
│               return (LiteralString)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/MembershipParserPostProcessor.java:
⋮
│public class MembershipParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public MembershipParserPostProcessor(Membership element) {
│               super(element);
│       }
│
│       @Override
│       public Membership getTarget() {
│               return (Membership)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/NamespaceImportParserPostProcessor.java:
⋮
│public class NamespaceImportParserPostProcessor extends ImportParserPostProcessor {
│
│       public NamespaceImportParserPostProcessor(NamespaceImport element) {
│               super(element);
│       }
│
│       @Override
│       public NamespaceImport getTarget() {
│               return (NamespaceImport)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/NamespaceParserPostProcessor.java:
⋮
│public class NamespaceParserPostProcessor extends ElementParserPostProcessor {
│
│       public NamespaceParserPostProcessor(Namespace element) {
│               super(element);
│       }
│       
│       public Namespace getTarget() {
│               return (Namespace)super.getTarget();
│       }
│
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/OwningMembershipParserPostProcessor.java:
⋮
│public class OwningMembershipParserPostProcessor extends MembershipParserPostProcessor {
│
│       public OwningMembershipParserPostProcessor(OwningMembership element) {
│               super(element);
│       }
│       
│       public OwningMembership getTarget() {
│               return (OwningMembership)super.getTarget();
│       }
│
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/ParameterMembershipParserPostProcessor.ja
⋮
│public class ParameterMembershipParserPostProcessor extends FeatureMembershipParserPostProcessor {
│
│       public ParameterMembershipParserPostProcessor(ParameterMembership element) {
│               super(element);
│       }
│
│       @Override
│       public ParameterMembership getTarget() {
│               return (ParameterMembership)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/RedefinitionParserPostProcessor.java:
⋮
│public class RedefinitionParserPostProcessor extends SubsettingParserPostProcessor {
│
│       public RedefinitionParserPostProcessor(Redefinition element) {
│               super(element);
│       }
│
│       @Override
│       public Redefinition getTarget() {
│               return (Redefinition)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/ReferenceSubsettingParserPostProcessor.ja
⋮
│public class ReferenceSubsettingParserPostProcessor extends SubsettingParserPostProcessor {
│
│       public ReferenceSubsettingParserPostProcessor(ReferenceSubsetting element) {
│               super(element);
│       }
│
│       @Override
│       public ReferenceSubsetting getTarget() {
│               return (ReferenceSubsetting)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/RelationshipParserPostProcessor.java:
⋮
│public class RelationshipParserPostProcessor extends ElementParserPostProcessor {
│
│       public RelationshipParserPostProcessor(Relationship element) {
│               super(element);
│       }
│       
│       public Relationship getTarget() {
│               return (Relationship)super.getTarget();
│       }
│
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/SpecializationParserPostProcessor.java:
⋮
│public class SpecializationParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public SpecializationParserPostProcessor(Specialization element) {
│               super(element);
│       }
│
│       @Override
│       public Specialization getTarget() {
│               return (Specialization)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/StepParserPostProcessor.java:
⋮
│public class StepParserPostProcessor extends FeatureParserPostProcessor {
│
│       public StepParserPostProcessor(Step element) {
│               super(element);
│       }
│
│       @Override
│       public Step getTarget() {
│               return (Step)super.getTarget();
│       }
│
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/SubclassificationParserPostProcessor.java
⋮
│public class SubclassificationParserPostProcessor extends SpecializationParserPostProcessor {
│
│       public SubclassificationParserPostProcessor(Subclassification element) {
│               super(element);
│       }
│
│       @Override
│       public Subclassification getTarget() {
│               return (Subclassification)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/SubsettingParserPostProcessor.java:
⋮
│public class SubsettingParserPostProcessor extends SpecializationParserPostProcessor {
│
│       public SubsettingParserPostProcessor(Subsetting element) {
│               super(element);
│       }
│
│       @Override
│       public Subsetting getTarget() {
│               return (Subsetting)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/TextualRepresentationParserPostProcessor.
⋮
│public class TextualRepresentationParserPostProcessor extends AnnotatingElementParserPostProcessor 
│
│       public TextualRepresentationParserPostProcessor(TextualRepresentation element) {
│               super(element);
│       }
│
│       @Override
│       public TextualRepresentation getTarget() {
│               return (TextualRepresentation)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/TypeFeaturingParserPostProcessor.java:
⋮
│public class TypeFeaturingParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public TypeFeaturingParserPostProcessor(TypeFeaturing element) {
│               super(element);
│       }
│
│       @Override
│       public TypeFeaturing getTarget() {
│               return (TypeFeaturing)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/TypeParserPostProcessor.java:
⋮
│public class TypeParserPostProcessor extends NamespaceParserPostProcessor {
│
│       public TypeParserPostProcessor(Type element) {
│               super(element);
│       }
│       
│       public Type getTarget() {
│               return (Type)super.getTarget();
│       }
│
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/postprocessing/UnioningParserPostProcessor.java:
⋮
│public class UnioningParserPostProcessor extends RelationshipParserPostProcessor {
│
│       public UnioningParserPostProcessor(Unioning element) {
│               super(element);
│       }
│
│       @Override
│       public Unioning getTarget() {
│               return (Unioning)super.getTarget();
│       }
│
│       @Override
│       public void postProcess() {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/qvt/KerML2Instances.java:
⋮
│public class KerML2Instances extends QVTRunner {
│
│       @SuppressWarnings("unused")
│       protected void initialize() {
│               super.initialize();
│               
│               UMLResourcesUtil.init(this.resourceSet);
│           Resource.Factory.Registry.INSTANCE.getExtensionToFactoryMap().put("xmi", XMI2UMLResource.Facto
│           
│           SysMLPackage sysml = SysMLPackage.eINSTANCE;            
⋮
│       @Override
│       public void saveOutput(final Resource resource) throws Exception {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/qvt/KerML2UML.java:
⋮
│public class KerML2UML extends QVTRunner {
│
│       @SuppressWarnings("unused")
│       protected void initialize() {
│               super.initialize();
│               
│               UMLResourcesUtil.init(this.resourceSet);
│           Resource.Factory.Registry.INSTANCE.getExtensionToFactoryMap().put("xmi", XMI2UMLResource.Facto
│           
│           SysMLPackage sysml = SysMLPackage.eINSTANCE;
│           
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/util/KerML2JSON.java:
⋮
│public class KerML2JSON extends KerMLTraversalUtil {
│       
│       public static final String JSON_EXTENSION = "json";
│       
│       private String libraryPath = null;
│       private boolean isAddDerivedElements = false;
│       private boolean isAddImplicitElements = false;
│       private String outputPath = null;
│       
│       public KerML2JSON() {
⋮
│       public String getLibraryPath() {
│               return this.libraryPath;
⋮
│       public String getOutputPath() {
│               return this.outputPath;
⋮
│       public String[] processArgs(String[] args) {
│               int n = args.length;
│               if (n > 0) {
│                       int i = 0;
│                       while(("-l".equals(args[i]) || "-d".equals(args[i]) || "-g".equals(args[i]) || "-v".equals(args[
│                                       i + 1 < n) {
│                               if ("-l".equals(args[i])) {
│                                       this.libraryPath = args[++i];
│                                       if (!libraryPath.endsWith("/")) {
│                                               libraryPath += "/";
⋮
│       public void initialize(String[] args)  {
│               String libraryPath = this.getLibraryPath();
│               if (libraryPath != null) {
│                       SysMLLibraryUtil.setModelLibraryDirectory(libraryPath);
│                       for (int k = 1; k < args.length; k++) {
│                               args[k] = libraryPath + args[k];
│                       }
│               }
│               
│               this.outputPath = args[0];
⋮
│       @Override
│       public void run(String[] args) {
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/util/KerML2XMI.java:
⋮
│public class KerML2XMI extends SysMLUtil {
│       
│       public static final String KERML_EXTENSION = "kerml";
│       public static final String KERML_XMI_EXTENSION = "kermlx";
│       
│       protected boolean isAddImplicitElements = false;
│       protected String outputDirectoryBase = null;
│       protected Path inputDirectoryBasePath = null;
│       
│       public KerML2XMI() {
⋮
│       protected XMIResource createOutputResource(String path) {
│               final XMIResource resource = new XMIResourceImpl(URI.createFileURI(path)) {
│                       @Override
│                       public void attachedHelper(EObject eObject) {
│                               if (eObject instanceof Element) {
│                                       setID(eObject, ((Element)eObject).getElementId());
│                               }
│                               super.attachedHelper(eObject);
│                       }
│               };
│               
⋮
│       public void writeResource(final Resource resource) throws IOException {
│               println("Writing " + resource.getURI().toFileString() + "...");
│               resource.save(null);
⋮
│       protected String getOutputPath(URI inputUri) {
│               String fileName = inputUri.lastSegment();
│               int i = fileName.lastIndexOf('.');
│               if (i >= 0) {
│                       fileName = fileName.substring(0, i);
│               }
│               fileName += "." + getExtension(inputUri);
│               String outputDirectory = inputUri.trimSegments(1).toFileString();
│               if (outputDirectoryBase != null && inputDirectoryBasePath != null) {
│                       outputDirectory = inputDirectoryBasePath.relativize(Path.of(outputDirectory)).toString();
⋮
│       protected String getExtension(URI inputUri) {
│               return KERML_XMI_EXTENSION;
⋮
│       protected String[] processOptions(String[] args) {
│               while (args.length > 0) {
│                       String arg = args[0];
│                       if ("-g".equals(arg)) {
│                               isAddImplicitElements = true;
│                       } else if ("-o".equals(arg)) {
│                               if (args.length > 1) {
│                                       outputDirectoryBase = args[1];
│                                       if (outputDirectoryBase.endsWith("/")) {
│                                               outputDirectoryBase += outputDirectoryBase.substring(0, outputDirectoryBase.length() - 1);
⋮
│       public void run(String[] args) {
│               try {
│                       args = processOptions(args);                    
│                       this.read(args);                        
│                       this.write();
│               } catch (Exception e) {
│                       e.printStackTrace();
│               }
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/util/KerMLIndexUtil.java:
⋮
│public class KerMLIndexUtil extends SysMLUtil {
│       
│       public KerMLIndexUtil() {
│               super();
│               KerMLStandaloneSetup.doSetup();
│               addExtension(".kerml");
│       }
│       
│       protected static String formatEntry(String elementName, String resourcePath) {
│               return "    \"" + elementName + "\": \"" + resourcePath + "\"";
⋮
│       public java.util.LinkedHashMap<String, String> indexAsMap(String inputPath) {
│               read(inputPath);
│               File inputFile = new File(inputPath);
│               String inputDir = inputPath;
│               if (!inputFile.isDirectory()) {
│                       inputDir = inputFile.getParent();
│                       if (inputDir == null) inputDir = "";
│               }
│               java.util.TreeMap<String, String> sorted = new java.util.TreeMap<>();
│               for (Resource resource : getInputResources()) {
⋮
│       public void writeIndex(String inputPath, String outputPath) throws IOException {
│               String index = index(inputPath);
│               System.out.println("Writing " + outputPath + "...");
│               Files.writeString(Path.of(outputPath), index);
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/util/KerMLRepositorySaveUtil.java:
⋮
│public class KerMLRepositorySaveUtil extends KerMLTraversalUtil {
│       
│       public static final String BASE_PATH_OPTION_LONG_NAME = "base-path-url";
│       public static final String LIBRARY_OPTION_LONG_NAME = "library-base-path";
│       public static final String BRANCH_OPTION = "gives the project branch to use (if none is given, the
│       public static final String PROJECT_NAME_OPTION_DESCRIPTION = "gives the name of the project to upl
│       public static final String DERIVED_OPTION_DESCRIPTION = "specifies that derived attributes should 
│       public static final String IMPLICIT_GEN_OPTION_DESCRIPTION = "specifies that implicit generalizati
│       public static final String VERBOSE_MODE_OPTION_DESCRIPTION = "verbose mode";
│       public static final String BASE_PATH_OPTION_DESCRIPTION = "gives the URL for the base path to be u
⋮
│       public String getProjectId() {
│               return ((ApiElementProcessingFacade)this.traversal.getFacade()).getProjectId();
⋮
│       public String getBasePath() {
│               return this.basePath;
⋮
│       public String getLibraryPath() {
│               return this.libraryPath;
⋮
│       public String getProjectName() {
│               return this.projectName;
⋮
│       public boolean isCommitted() {
│               return this.isCommitted;
⋮
│       protected String[] processArgs(String[] args) {
│               var libraryPathOption = new Option("l", LIBRARY_OPTION_LONG_NAME, true, LIBRARY_OPTION_DESCRIPTIO
│               var basePathOption = new Option("b", BASE_PATH_OPTION_LONG_NAME, true, BASE_PATH_OPTION_DESCRIPTI
│               var isVerboseOption = new Option("v", false, VERBOSE_MODE_OPTION_DESCRIPTION);
│               var addImplicitsOption = new Option("g", IMPLICIT_GEN_OPTION_DESCRIPTION);
│               var addDerivedOption = new Option("d", DERIVED_OPTION_DESCRIPTION);
│               var projectOption = new Option("p", true, PROJECT_NAME_OPTION_DESCRIPTION);
│               var branchOption = new Option(null, "branch", true, BRANCH_OPTION);
│               
│               libraryPathOption.setRequired(true);
⋮
│       protected void initialize(String[] args)  {
│               String libraryPath = this.getLibraryPath();
│               if (libraryPath != null) {
│                       SysMLLibraryUtil.setModelLibraryDirectory(libraryPath);
│               }
│               
│               if (this.projectName == null) {
│                       this.projectName = Paths.get(args[0]).getFileName().toString();
│                       int j = this.projectName.lastIndexOf('.');
│                       if (j > 0) {
⋮
│       public void run(String[] args) {
│               args = this.processArgs(args);
│               
│               if (args != null) {
│                       System.out.println("Saving " + args[0] + "...");
│                       
│                       this.initialize(args);                          
│                       this.read(args);
│                       
│                       System.out.println("Transforming" + 
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/util/KerMLTraversalUtil.java:
⋮
│public class KerMLTraversalUtil extends SysMLUtil {
│       
│       /**
│        * The traversal object used to manage the traversal of the model graph.
│        */
│       protected Traversal traversal;
│       
│       public KerMLTraversalUtil() {
│               super();
│               KerMLStandaloneSetup.doSetup();
⋮
│       protected Traversal initialize(ElementProcessingFacade processingFacade) {
│               this.traversal = new Traversal(processingFacade);
│               return this.traversal;
⋮
│       public void run(String[] args) {
│               try {
│                       this.initialize(new DefaultElementProcessingFacadeImpl());
│                       this.read(args);
│                       
│                       println("Processing...");
│                       this.process();
│               } catch (Exception e) {
│                       e.printStackTrace();
│               }
⋮

org.omg.kerml.xtext/src/org/omg/kerml/xtext/validation/KerMLResourceValidator.java:
⋮
│public class KerMLResourceValidator extends ResourceValidatorImpl {
│
│       @Override
│       protected void resolveProxies(Resource resource, CancelIndicator monitor) {
│               ElementUtil.transformAll(resource, false);
│               getOperationCanceledManager().checkCanceled(monitor);
│               if (resource instanceof KerMLLazyLinkingResource) {
│                       ((KerMLLazyLinkingResource)resource).clearUnresolvableURIFragments();
│               }
│               super.resolveProxies(resource, monitor);
⋮
```
