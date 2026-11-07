# Repo map: backend/services/syson-model-services

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/services/syson-model-services`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/services/syson-model-services) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 21 files there; aider read the 21 that `syson.aiderignore` leaves in, and the map shows 21 of them, 8 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/services/syson-model-services/.checkstyle

backend/services/syson-model-services/.classpath

backend/services/syson-model-services/.project

backend/services/syson-model-services/.settings/org.eclipse.core.resources.prefs

backend/services/syson-model-services/.settings/org.eclipse.core.runtime.prefs

backend/services/syson-model-services/.settings/org.eclipse.jdt.apt.core.prefs

backend/services/syson-model-services/.settings/org.eclipse.jdt.core.prefs

backend/services/syson-model-services/.settings/org.eclipse.jdt.ui.prefs

backend/services/syson-model-services/.settings/org.eclipse.m2e.core.prefs

backend/services/syson-model-services/.settings/org.springframework.ide.eclipse.prefs

backend/services/syson-model-services/pom.xml

backend/services/syson-model-services/src/main/java/org/eclipse/syson/model/services/ModelMutationEl
⋮
│@Service
│public class ModelMutationElementService {
│
⋮
│    public Element createRequirementDerivation(RequirementUsage derived, RequirementUsage original)
│        var derivationMetadata = this.utilService.retrieveDerivationMetadata(derived);
│        var originalEndMetadata = this.utilService.retrieveOriginalRequirementMetadata(derived);
│        var derivedEndMetadata = this.utilService.retrieveDerivedRequirementMetadata(derived);
│        boolean metadataFound = derivationMetadata != null && originalEndMetadata != null && derive
│
│        if (metadataFound && derived.getOwner() instanceof Namespace owningNamespace) {
│            var derivation = this.metamodelMutationElementService.createRequirementDerivation(deriv
│                    derivedEndMetadata);
│            // The ends and the connection reference the metadata of the RequirementDerivation libr
⋮
│    public Element setAsView(ViewUsage viewUsage, String newViewDefinition) {
│        var types = viewUsage.getType();
│        var generalViewViewDef = this.elementUtil.findByNameAndType(viewUsage, newViewDefinition, V
│        if (types == null || types.isEmpty()) {
│            var featureTyping = SysmlFactory.eINSTANCE.createFeatureTyping();
│            viewUsage.getOwnedRelationship().add(featureTyping);
│            featureTyping.setType(generalViewViewDef);
│            featureTyping.setTypedFeature(viewUsage);
│        } else {
│            Relationship relationship = viewUsage.getOwnedRelationship().get(0);
⋮
│    public Element createPartUsageAndBindingConnectorAsUsage(PartUsage self) {
│        var parent = self.getOwner();
│        if (parent instanceof Namespace parentNamespace) {
│            // create a new port on given part usage
│            var newSelfPort = SysmlFactory.eINSTANCE.createPortUsage();
│            this.metamodelMutationElementService.addChildInParent(self, newSelfPort);
│            this.metamodelMutationElementService.initialize(newSelfPort);
│            // create a new part usage as a self sibling
│            var newPartUsage = SysmlFactory.eINSTANCE.createPartUsage();
│            this.metamodelMutationElementService.addChildInParent(parent, newPartUsage);
⋮
│    public PartUsage createPartUsageAndFlowConnection(PartUsage self) {
│        var parent = self.getOwner();
│        if (parent instanceof Namespace parentNamespace) {
│            // create a new port on given part usage
│            var newSelfPort = SysmlFactory.eINSTANCE.createPortUsage();
│            this.metamodelMutationElementService.addChildInParent(self, newSelfPort);
│            this.metamodelMutationElementService.initialize(newSelfPort);
│            // create a new part usage as a self sibling
│            var newPartUsage = SysmlFactory.eINSTANCE.createPartUsage();
│            this.metamodelMutationElementService.addChildInParent(parent, newPartUsage);
⋮
│    public PartUsage createPartUsageAndInterface(PartUsage self) {
│        var parent = self.getOwner();
│        if (parent instanceof Namespace parentNamespace) {
│            // create a new port on given part usage
│            var newSelfPort = SysmlFactory.eINSTANCE.createPortUsage();
│            this.metamodelMutationElementService.addChildInParent(self, newSelfPort);
│            this.metamodelMutationElementService.initialize(newSelfPort);
│            // create a new part usage as a self sibling
│            var newPartUsage = SysmlFactory.eINSTANCE.createPartUsage();
│            this.metamodelMutationElementService.addChildInParent(parent, newPartUsage);
⋮
│    public SatisfyRequirementUsage createSatisfy(Element element, RequirementUsage existingRequirem
│        // create a new SatisfyRequirementUsage as child of the given Element
│        var newSatisfyRequirementUsage = SysmlFactory.eINSTANCE.createSatisfyRequirementUsage();
│        this.metamodelMutationElementService.addChildInParent(element, newSatisfyRequirementUsage);
│        // create a new ReferenceSubsetting as child of the new SatisfyRequirementUsage
│        var newReferenceSubsetting = SysmlFactory.eINSTANCE.createReferenceSubsetting();
│        newSatisfyRequirementUsage.getOwnedRelationship().add(newReferenceSubsetting);
│        // link the new ReferenceSubsetting to the given existing RequirementUsage
│        newReferenceSubsetting.setReferencedFeature(existingRequirement);
│        // initialize the new SatisfyRequirementUsage, after added it in the model and after linked
⋮
│    public FramedConcernMembership createFramedConcern(Type type, ConcernUsage concernUsage) {
│        if (type instanceof RequirementDefinition || type instanceof RequirementUsage) {
│            var newFramedConcernMembership = SysmlFactory.eINSTANCE.createFramedConcernMembership()
│            type.getOwnedRelationship().add(newFramedConcernMembership);
│
│            var newConcernUsage = SysmlFactory.eINSTANCE.createConcernUsage();
│            newFramedConcernMembership.getOwnedRelatedElement().add(newConcernUsage);
│
│            this.metamodelMutationElementService.initialize(newFramedConcernMembership);
│            this.metamodelMutationElementService.initialize(newConcernUsage);
│
⋮
│    public RequirementConstraintMembership createConstraint(Type type, ConstraintUsage constraintUs
│        if (type instanceof RequirementDefinition || type instanceof RequirementUsage) {
│            var newRequirementConstraintMembership = SysmlFactory.eINSTANCE.createRequirementConstr
│            type.getOwnedRelationship().add(newRequirementConstraintMembership);
│            newRequirementConstraintMembership.setKind(constraintKind);
│
│            var newConstraintUsage = SysmlFactory.eINSTANCE.createConstraintUsage();
│            newRequirementConstraintMembership.getOwnedRelatedElement().add(newConstraintUsage);
│
│            this.metamodelMutationElementService.initialize(newRequirementConstraintMembership);
⋮
│    public SatisfyRequirementUsage createSatisfyRequirement(Element parentElement, Element selected
│        // create a new SatisfyRequirementUsage as child of the given Element
│        var newSatisfyRequirementUsage = SysmlFactory.eINSTANCE.createSatisfyRequirementUsage();
│        this.metamodelMutationElementService.addChildInParent(parentElement, newSatisfyRequirementU
│
│        if (selectedObject instanceof Definition definition) {
│            var newFeatureTyping = SysmlFactory.eINSTANCE.createFeatureTyping();
│            newSatisfyRequirementUsage.getOwnedRelationship().add(newFeatureTyping);
│            newFeatureTyping.setType(definition);
│            newFeatureTyping.setTypedFeature(newSatisfyRequirementUsage);
⋮
│    public Optional<ViewUsage> createViewUsage(Element owningElement, String viewName) {
│        Optional<ViewUsage> viewUsageOpt = Optional.empty();
│
│        Optional<EClass> membershipClassOpt = new GetIntermediateContainerCreationSwitch(owningElem
│        if (membershipClassOpt.isPresent()) {
│            EObject viewUsageMembership = SysmlFactory.eINSTANCE.create(membershipClassOpt.get());
│            if (viewUsageMembership instanceof Relationship viewUsageRelationship) {
│                ViewUsage viewUsage = SysmlFactory.eINSTANCE.createViewUsage();
│                owningElement.getOwnedRelationship().add(viewUsageRelationship);
│                viewUsageRelationship.getOwnedRelatedElement().add(viewUsage);
⋮
│    public void featureTypeViewUsage(ViewUsage viewUsage, String diagramName) {
│        FeatureTyping featureTyping = SysmlFactory.eINSTANCE.createFeatureTyping();
│        viewUsage.getOwnedRelationship().add(featureTyping);
│        var viewDefinition = this.elementUtil.findByNameAndType(viewUsage, diagramName, ViewDefinit
│        featureTyping.setType(viewDefinition);
│        featureTyping.setTypedFeature(viewUsage);
⋮
│    public Optional<Element> duplicateElement(Element elementToDuplicate, boolean duplicateContent,
│        Optional<EObject> duplicateObject;
│        if (duplicateContent) {
│            EcoreUtil.Copier copier = new EcoreUtil.Copier();
│            EObject duplicatedObject = copier.copy(elementToDuplicate);
│            if (copyOutgoingReferences) {
│                copier.copyReferences();
│            }
│            duplicateObject = Optional.ofNullable(duplicatedObject);
│        } else {
⋮

backend/services/syson-model-services/src/main/java/org/eclipse/syson/model/services/ModelQueryEleme
⋮
│@Service
│public class ModelQueryElementService {
│
⋮
│    public boolean isExposable(Element element) {
│        boolean isExposable = false;
│        if (this.utilService.isStandardDoneAction(element) || this.utilService.isStandardStartActio
│            isExposable = false;
│        } else {
│            isExposable = this.hasName(element);
│        }
│        return isExposable;
⋮
│    public boolean isExposed(Element element, ViewUsage viewUsage) {
│        return viewUsage != null && viewUsage.getExposedElement().contains(element);
⋮
│    public List<AllocationUsage> getAllReachableAllocateEdges(EObject eObject) {
│        return this.utilService.getAllReachableType(eObject, SysmlPackage.eINSTANCE.getAllocationUs
│                .filter(AllocationUsage.class::isInstance)
│                .map(AllocationUsage.class::cast)
│                .filter(this::isAllocateEdge)
│                .toList();
⋮
│    public boolean checkTransitionEdgeTarget(Element source, Element target) {
│        boolean sameParent = false;
│        if (source instanceof ActionUsage sourceAction && target instanceof ActionUsage targetActio
│            sameParent = sourceAction.getOwner() == targetAction.getOwner();
│        }
│        boolean parentIsParallel = this.utilService.isParallelState(source.getOwner());
│        return sameParent && !parentIsParallel;
⋮
│    private boolean hasName(Element element) {
│        String dName = element.getName();
│        if (dName != null && !dName.isBlank()) {
│            return true;
│        }
│        String sName = element.getShortName();
│        return sName != null && !sName.isBlank();
⋮
│    private boolean isAllocateEdge(AllocationUsage allocationUsage) {
│        return allocationUsage.getOwnedFeatureMembership().stream()
│                .filter(EndFeatureMembership.class::isInstance)
│                .limit(3)
│                .count() == 2;
⋮

backend/services/syson-model-services/src/main/java/org/eclipse/syson/model/services/aql/ModelMutati
⋮
│public class ModelMutationAQLService {
│
│    private final ModelMutationElementService modelMutationElementService;
│
│    private final MetamodelMutationElementService metamodelElementMutationService;
│
│    public ModelMutationAQLService(ModelMutationElementService modelMutationElementService) {
│        this.modelMutationElementService = Objects.requireNonNull(modelMutationElementService);
│        this.metamodelElementMutationService = new MetamodelMutationElementService();
│    }
│
⋮
│    public Documentation createObjectiveDocumentation(Element element, String referenceName) {
│        return this.metamodelElementMutationService.createObjectiveDocumentation(element, reference
⋮
│    public Membership createMembership(Element element) {
│        return this.metamodelElementMutationService.createMembership(element);
⋮
│    public Element initialize(Element element) {
│        return this.metamodelElementMutationService.initialize(element);
⋮
│    public Element createPartUsageAndInterface(PartUsage self) {
│        return this.modelMutationElementService.createPartUsageAndInterface(self);
⋮
│    public Element createPartUsageAndBindingConnectorAsUsage(PartUsage self) {
│        return this.modelMutationElementService.createPartUsageAndBindingConnectorAsUsage(self);
⋮
│    public Element createPartUsageAndFlowConnection(PartUsage self) {
│        return this.modelMutationElementService.createPartUsageAndFlowConnection(self);
⋮
│    public Element createSatisfy(Element element, RequirementUsage existingRequirement) {
│        return this.modelMutationElementService.createSatisfy(element, existingRequirement);
⋮
│    public Element createSatisfyRequirement(Element self, Element selectedObject) {
│        return this.modelMutationElementService.createSatisfyRequirement(self, selectedObject);
⋮
│    public Element createRequirementDerivation(RequirementUsage derived, RequirementUsage original)
│        return this.modelMutationElementService.createRequirementDerivation(derived, original);
⋮
│    public EObject createOccurrenceInOccurrence(Type container, EClass eClass) {
│        return this.metamodelElementMutationService.createOccurrenceInOccurrence(container, eClass)
⋮
│    public Element setAsView(ViewUsage viewUsage, String newViewDefinition) {
│        return this.modelMutationElementService.setAsView(viewUsage, newViewDefinition);
⋮
│    public Element createFramedConcern(Type type, ConcernUsage concernUsage) {
│        return this.modelMutationElementService.createFramedConcern(type, concernUsage);
⋮
│    public Element createConstraint(Type type, ConstraintUsage constraintUsage, RequirementConstrai
│        return this.modelMutationElementService.createConstraint(type, constraintUsage, constraintK
⋮

backend/services/syson-model-services/src/main/java/org/eclipse/syson/model/services/aql/ModelQueryA
⋮
│public class ModelQueryAQLService {
│
│    private final ModelQueryElementService modelQueryElementService;
│
│    private final MetamodelQueryElementService metamodelQueryElementService;
│
│    public ModelQueryAQLService() {
│        this.modelQueryElementService = new ModelQueryElementService();
│        this.metamodelQueryElementService = new MetamodelQueryElementService();
│    }
│
⋮
│    public boolean checkTransitionEdgeTarget(Element source, Element target) {
│        return this.modelQueryElementService.checkTransitionEdgeTarget(source, target);
⋮
│    public List<AllocationUsage> getAllReachableAllocateEdges(EObject eObject) {
│        return this.modelQueryElementService.getAllReachableAllocateEdges(eObject);
⋮
│    public Feature getConnectorSource(Connector connector) {
│        return this.metamodelQueryElementService.getConnectorSource(connector);
⋮
│    public List<Feature> getConnectorTarget(ConnectorAsUsage connector) {
│        return this.metamodelQueryElementService.getConnectorTarget(connector);
⋮
│    public Feature getDerivationDerivedEnd(ConnectionUsage connectionUsage) {
│        return this.metamodelQueryElementService.getDerivationDerivedEnd(connectionUsage);
⋮
│    public Feature getDerivationOriginalEnd(ConnectionUsage connectionUsage) {
│        return this.metamodelQueryElementService.getDerivationOriginalEnd(connectionUsage);
⋮
│    public boolean isRequirementDerivation(ConnectionUsage connectionUsage) {
│        return this.metamodelQueryElementService.isRequirementDerivation(connectionUsage);
⋮
│    public Feature getFeatureValueTarget(FeatureValue featureValue) {
│        return this.metamodelQueryElementService.getFeatureValueTarget(featureValue);
⋮
│    public ConcernUsage getFramedConcernTarget(FramedConcernMembership framedConcernMembership) {
│        return this.metamodelQueryElementService.getFramedConcernTarget(framedConcernMembership);
⋮
│    public ConstraintUsage getRequirementConstraintTarget(RequirementConstraintMembership requireme
│        return this.metamodelQueryElementService.getRequirementConstraintTarget(requirementConstrai
⋮
│    public Element getSourceAllocateEdge(AllocationUsage allocationUsage) {
│        return this.metamodelQueryElementService.getSourceAllocateEdge(allocationUsage);
⋮
│    public Element getTargetAllocateEdge(AllocationUsage allocationUsage) {
│        return this.metamodelQueryElementService.getTargetAllocateEdge(allocationUsage);
⋮
│    public Element getSourceFlowUsageEdge(FlowUsage flowUsage) {
│        return this.metamodelQueryElementService.getSourceFlowUsageEdge(flowUsage);
⋮
│    public Element getTargetFlowUsageEdge(FlowUsage flowUsage) {
│        return this.metamodelQueryElementService.getTargetFlowUsageEdge(flowUsage);
⋮
│    public boolean isActor(Element element) {
│        return this.metamodelQueryElementService.isActor(element);
⋮
│    public boolean isStakeholder(Element element) {
│        return this.metamodelQueryElementService.isStakeholder(element);
⋮
│    public boolean isSubject(Element element) {
│        return this.metamodelQueryElementService.isSubject(element);
⋮
│    public boolean isTransitionUsageForState(TransitionUsage transition) {
│        return this.metamodelQueryElementService.isTransitionUsageForState(transition);
⋮
│    public List<ConcernUsage> getFramedConcerns(Namespace namespace) {
│        return this.metamodelQueryElementService.getFramedConcerns(namespace);
⋮
│    public List<PortUsage> getInterfaceEnds(InterfaceDefinition interfaceDefinition) {
│        return this.metamodelQueryElementService.getInterfaceEnds(interfaceDefinition);
⋮
│    public List<PartUsage> getActors(Namespace namespace) {
│        return this.metamodelQueryElementService.getActors(namespace);
⋮

backend/services/syson-model-services/src/main/resources/.gitkeep

backend/services/syson-model-services/src/test/java/org/eclipse/syson/model/services/ArchitectureCon
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_MODEL_SERVICES_ROOT_PACKAGE = "org.eclipse.syson.model.service
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_MODEL_SERVICES_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/services/syson-model-services/src/test/java/org/eclipse/syson/model/services/CodingRulesTest
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_MODEL_SERVICES_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮

backend/services/syson-model-services/src/test/java/org/eclipse/syson/model/services/ModelAQLService
⋮
│public class ModelAQLServiceClassArchitectureTest {
│
│    @Test
│    void checkDiagramMutationAqlServiceClassDependencies() {
│        JavaClasses imported = new ClassFileImporter()
│                .importPackages("org.eclipse.syson.model.services.aql");
│
│        ArchRule rule = ArchRuleDefinition.classes()
│                .that().haveSimpleName("ModelMutationAQLService")
│                .should().onlyDependOnClassesThat(new SysONServiceDependencyPredicate(List.of("Mode
⋮
│    @Test
│    void checkDiagramQueryAqlServiceClassDependencies() {
⋮

backend/services/syson-model-services/src/test/java/org/eclipse/syson/model/services/ModelMutationEl
⋮
│public class ModelMutationElementServiceTests {
│
│    private final ModelBuilder modelBuilder = new ModelBuilder();
│
│    private final ModelMutationElementService modelMutationElementService = new ModelMutationElemen
│
│    private final MetamodelQueryElementService metamodelElementQueryService = new MetamodelQueryEle
│
│    @Test
│    @DisplayName("GIVEN a element with a name, WHEN duplicating this element, THEN the name and id 
│    public void checkElementWithNameDuplication() {
⋮
│    @Test
│    @DisplayName("GIVEN a element with a shortname only, WHEN duplicating this element, THEN the sh
│    public void checkElementWithShortnameDuplication() {
⋮
│    @Test
│    @DisplayName("GIVEN a element with content and outgoing references, WHEN duplicating this eleme
│    public void checkElementWithContentDuplication() {
⋮
│    @DisplayName("GIVEN a PartUsage, WHEN using createPartUsageAndBindingConnectorAsUsage method, T
│    @Test
│    public void checkCreatePartUsageAndFlowConnection() {
⋮

backend/services/syson-model-services/src/test/resources/.gitkeep
```
