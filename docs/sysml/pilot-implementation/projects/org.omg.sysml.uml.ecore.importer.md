# Repo map: org.omg.sysml.uml.ecore.importer

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.uml.ecore.importer`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.uml.ecore.importer) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 16 files there; aider read the 16 that `pilot.aiderignore` leaves in, and the map shows 16 of them, 9 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.uml.ecore.importer/.classpath

org.omg.sysml.uml.ecore.importer/.gitignore

org.omg.sysml.uml.ecore.importer/.project

org.omg.sysml.uml.ecore.importer/.settings/org.eclipse.core.resources.prefs

org.omg.sysml.uml.ecore.importer/.settings/org.eclipse.jdt.core.prefs

org.omg.sysml.uml.ecore.importer/META-INF/MANIFEST.MF

org.omg.sysml.uml.ecore.importer/build.properties:
│bin.includes = plugin.*,\
⋮
│source.. = src/
│output.. = bin/

org.omg.sysml.uml.ecore.importer/plugin.properties:
⋮
│pluginName = Custom UML2 UML Importer for EMF
│providerName = Eclipse Modeling Project
│
│_UI_UMLImporter_label = UML model (Custom import)
│_UI_UMLModelImporter_description = Create the Ecore model based on UML or CMOF models

org.omg.sysml.uml.ecore.importer/plugin.xml

org.omg.sysml.uml.ecore.importer/src/org/omg/sysml/uml/ecore/importer/CustomUML2EcoreConverter.java:
⋮
│public class CustomUML2EcoreConverter extends UML2EcoreConverter {
│
│       protected static final String ANNOTATION_SYSML = "http://www.omg.org/spec/SysML"; //$NON-NLS-1$
│
│       @Override
│       public Collection<? extends EObject> convert(Collection<? extends EObject> eObjects, Map<String, S
│                       DiagnosticChain diagnostics, Map<Object, Object> context) {
│               Collection<? extends EObject> res = super.convert(eObjects, options, diagnostics, context);
│               customConvert(diagnostics);
│               return res;
⋮
│       private void customConvert(DiagnosticChain diagnostics) {
│               for (Entry<Element, EModelElement> entry : elementToEModelElementMap.entrySet()) {
│                       Element element = entry.getKey();
│                       EModelElement modelElement = entry.getValue();
│                       if (element instanceof Property && modelElement instanceof EStructuralFeature && 
│                                       (((Property)element).isDerived() && !((Property)element).isDerivedUnion() || 
│                                       "elementId".equals(((Property)element).getName())) ||
│                               element instanceof Operation && modelElement instanceof EOperation) {
│                               // Add SysML EAnnotation to derived properties (but not derived unions) and all operations
│                               String qualifiedName = ((NamedElement)element).getQualifiedName();
⋮
│       private void addSysMLAnnotation(String qualifiedName, EModelElement modelElement) {
│               System.out.println("Add annotation: " + qualifiedName);
│               EAnnotation annotation = EcoreFactory.eINSTANCE.createEAnnotation();
│               annotation.setSource(ANNOTATION_SYSML);         
│               modelElement.getEAnnotations().add(annotation);
⋮
│       private void addStructuralFeature(EClass eClass, EStructuralFeature feature, String name, EClassif
│               System.out.println("Add feature:    " + eClass.getName() + "::" + name + ": " + (type == null? "<
│               feature.setName(name);
│               feature.setEType(type);
│               feature.setLowerBound(lower);
│               feature.setUpperBound(upper);
│               feature.setOrdered(upper == -1 || upper > 1);
│               feature.setDerived(true);
│               feature.setTransient(true);
│               feature.setVolatile(true);
⋮

org.omg.sysml.uml.ecore.importer/src/org/omg/sysml/uml/ecore/importer/CustomUMLImporter.java:
⋮
│public class CustomUMLImporter extends UMLImporter {
│
│       private static final String SYSML_URI = "https://www.omg.org/spec/SysML/20250201";
│       private static final String BASE_PACKAGE = "org.omg.sysml.lang";
│       private static final String MODEL_PLUGIN_ID = "org.omg.sysml.model";
│       private static final String TYPES_URI = "https://www.omg.org/spec/UML/20161101/PrimitiveTypes";
│       private static final String TYPES_LEGACY_URI = "http://www.eclipse.org/uml2/5.0.0/Types";
│       private static final String SETTING_DELEGATES_KEY = "settingDelegates";
│       private static final String INVOCATION_DELEGATES_KEY = "invocationDelegates";
│
⋮
│       @Override
│       protected Diagnostic doComputeEPackages(Monitor monitor) throws Exception {
⋮
│               if (locationURIs.isEmpty()) {
│                       diagnostic = new BasicDiagnostic(Diagnostic.ERROR, ConverterPlugin.ID, ConverterUtil.ACTION_DEFA
│                                       UMLImporterPlugin.INSTANCE.getString("_UI_SpecifyAValidUMLModel_message"), null); //$NON-NLS-1
│               } else {
⋮
│                       @SuppressWarnings("unchecked")
│                       Collection<EPackage> ePackages = (Collection<EPackage>) new CustomUML2EcoreConverter() {
│
│                               @Override
│                               protected void processEcoreTaggedValues(EPackage ePackage, Element element, Map<String, String>
│                                               DiagnosticChain diagnostics, Map<Object, Object> context) {
│
│                                       super.processEcoreTaggedValues(ePackage, element, options, diagnostics, context);
│
│                                       Stereotype ePackageStereotype = getAppliedEcoreStereotype(element, UMLUtil.STEREOTYPE__E_PACKA
│
⋮
│       @Override
│       public void adjustEPackage(Monitor monitor, EPackage ePackage) {
⋮
│       @Override
│       protected void adjustGenModel(Monitor monitor) {
⋮
│       private void replacePrimitiveTypes(Collection<EPackage> ePackages) {
│               EPackage primitivePackage = findPrimitivePackage(ePackages);
│               if (primitivePackage == null) {
│                       return;
│               }
│
│               Map<EClassifier, EClassifier> primitiveMappings = new HashMap<EClassifier, EClassifier>();
│               addPrimitiveMapping(primitivePackage, primitiveMappings, "Boolean", EcorePackage.Literals.EBOOLEA
│               addPrimitiveMapping(primitivePackage, primitiveMappings, "String", EcorePackage.Literals.ESTRING)
│               addPrimitiveMapping(primitivePackage, primitiveMappings, "Real", EcorePackage.Literals.EDOUBLE);
⋮
│       private void replacePrimitiveType(ETypedElement typedElement, Map<EClassifier, EClassifier> primit
│               EClassifier mappedType = primitiveMappings.get(typedElement.getEType());
│               if (mappedType != null) {
│                       typedElement.setEType(mappedType);
│               }
⋮
│       private void addPrimitiveMapping(EPackage primitivePackage, Map<EClassifier, EClassifier> primitiv
⋮
│       private void sortEcoreContents(Collection<EPackage> ePackages) {
│               for (EPackage ePackage : ePackages) {
│                       ECollections.sort(ePackage.getEClassifiers(), namedElementComparator());
│                       for (EClassifier eClassifier : ePackage.getEClassifiers()) {
│                               if (eClassifier instanceof EClass) {
│                                       EClass eClass = (EClass) eClassifier;
│                                       ECollections.sort(eClass.getEStructuralFeatures(), namedElementComparator());
│                                       ECollections.sort(eClass.getEOperations(), namedElementComparator());
│                               }
│                       }
⋮
│       private <T extends EObject> Comparator<T> namedElementComparator() {
│               return Comparator.comparing(this::elementName, Comparator.nullsLast(String::compareTo));
⋮
│       private String elementName(EObject eObject) {
│               if (eObject instanceof EClassifier) {
│                       return ((EClassifier) eObject).getName();
│               }
│               if (eObject instanceof org.eclipse.emf.ecore.ENamedElement) {
│                       return ((org.eclipse.emf.ecore.ENamedElement) eObject).getName();
│               }
│               return null;
⋮
│       private void removePrimitivePackage(Collection<EPackage> ePackages) {
│               EPackage primitivePackage = findPrimitivePackage(ePackages);
│               if (primitivePackage != null) {
│                       ePackages.remove(primitivePackage);
│               }
⋮
│       private EPackage findPrimitivePackage(Collection<EPackage> ePackages) {
│               for (EPackage ePackage : ePackages) {
│                       if (TYPES_LEGACY_URI.equals(ePackage.getNsURI()) || TYPES_URI.equals(ePackage.getNsURI())
│                                       || "Types".equals(ePackage.getName())) {
│                               return ePackage;
│                       }
│               }
│               return null;
⋮

org.omg.sysml.uml.ecore.importer/src/org/omg/sysml/uml/ecore/importer/SysMLGenClassGeneratorAdapter.
⋮
│public class SysMLGenClassGeneratorAdapter extends UML2GenClassGeneratorAdapter {
│
│       private final SysMLGeneratedClassNormalizer generatedClassNormalizer;
│
│       /**
│        * Creates the adapter.
│        *
│        * @param generatorAdapterFactory the owning generator adapter factory
│        */
│       public SysMLGenClassGeneratorAdapter(GeneratorAdapterFactory generatorAdapterFactory) {
⋮
│       @Override
│       protected Diagnostic doPostGenerate(Object object, Object projectType) {
⋮

org.omg.sysml.uml.ecore.importer/src/org/omg/sysml/uml/ecore/importer/SysMLGenModelGeneratorAdapterF
⋮
│public class SysMLGenModelGeneratorAdapterFactory extends GenModelGeneratorAdapterFactory {
│
│       /**
│        * Returns a singleton {@link SysMLGenClassGeneratorAdapter}.
│        *
│        * @return the SysML-aware GenClass generator adapter
│        */
│       @Override
│       public Adapter createGenClassAdapter() {
│               if (genClassGeneratorAdapter == null) {
⋮

org.omg.sysml.uml.ecore.importer/src/org/omg/sysml/uml/ecore/importer/SysMLGeneratedClassNormalizer.
⋮
│public class SysMLGeneratedClassNormalizer {
│
│       private static final String UML_UNION_IMPORT =
│                       "import org.eclipse.uml2.common.util.UnionEObjectEList;";
│       private static final String UML_DERIVED_IMPORT =
│                       "import org.eclipse.uml2.common.util.DerivedEObjectEList;";
│       private static final String UML_DERIVED_UNION_IMPORT =
│                       "import org.eclipse.uml2.common.util.DerivedUnionEObjectEList;";
│       private static final String SYSML_UNION_IMPORT =
│                       "import org.omg.sysml.lang.sysml.util.UnionEObjectEList;";
⋮
│       public void normalize(GenClass genClass) {
│               IFile file = this.getGeneratedFile(genClass);
│               if (file == null || !file.exists() || file.getLocationURI() == null) {
│                       return;
│               }
│
│               Path location = Path.of(file.getLocationURI());
│               try {
│                       String original = Files.readString(location, StandardCharsets.UTF_8);
│                       String normalized = this.normalizeImports(original);
⋮
│       private IFile getGeneratedFile(GenClass genClass) {
│               GenModel genModel = genClass.getGenModel();
│               String workspacePath = genModel.getModelDirectory() + "/" +
│                               genClass.getGenPackage().getClassPackageName().replace('.', '/') + "/" +
│                               genClass.getClassName() + ".java";
│               IPath path = new org.eclipse.core.runtime.Path(workspacePath);
│               return ResourcesPlugin.getWorkspace().getRoot().getFile(path);
⋮
│       private String normalizeImports(String source) {
│               return source
│                               .replace(UML_UNION_IMPORT, SYSML_UNION_IMPORT)
│                               .replace(UML_DERIVED_IMPORT, SYSML_DERIVED_IMPORT)
│                               .replace(UML_DERIVED_UNION_IMPORT, SYSML_DERIVED_UNION_IMPORT);
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

org.omg.sysml.uml.ecore.importer/src/org/omg/sysml/uml/ecore/importer/ui/CustomUMLImporterWizard.jav
⋮
│public class CustomUMLImporterWizard extends UMLImporterWizard {
│
│       @Override
│       protected ModelConverter createModelConverter() {
│               return new CustomUMLImporter();
│       }
│
│       @Override
│       public void addPages() {
│               UMLImporterDetailPage detailPage = new CustomUMLImporterDetailPage(getModelImporter(), "UMLImport
⋮
```
