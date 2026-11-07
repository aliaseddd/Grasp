# Repo map: backend/services/syson-diagram-services

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/services/syson-diagram-services`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/services/syson-diagram-services) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 51 files there; aider read the 51 that `syson.aiderignore` leaves in, and the map shows 29 of them, 29 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/ConnectedEl
⋮
│public class ConnectedElementRepresentationFilter {
│
│    private final IObjectSearchService objectSearchService;
│
│    private final NodeDescriptionService nodeDescriptionService;
│
│    private final IEditingContext editingContext;
│
│    private final DiagramContext diagramContext;
│
⋮
│    public boolean canRenderInside(Element candidate, Node reference) {
│        var owner = this.objectSearchService.getObject(this.editingContext, reference.getTargetObje
│        var description = this.convertedNodes.values().stream().filter(value -> Objects.equals(valu
│        if (owner.isEmpty() || description.isEmpty()) {
│            return false;
│        }
│        var ancestors = new ArrayList<Object>();
│        var finder = new NodeFinder(this.diagramContext.diagram());
│        Object current = reference;
│        while (current instanceof Node node) {
⋮
│    private boolean canRenderInside(Element candidate, Element owner, NodeDescription description, 
│        if (!visited.add(description.getId())) {
│            return false;
│        }
│        var children = Stream.concat(Stream.concat(description.getChildNodeDescriptions().stream(),
│                this.convertedNodes.values().stream().filter(value -> description.getReusedChildNod
│                        || description.getReusedBorderNodeDescriptionIds().contains(value.getId()))
│        boolean canRender = false;
│        for (var child : children) {
│            if (this.nodeDescriptionService.canNodeDescriptionRenderElement(child, candidate, owner
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramMuta
⋮
│@Service
│public class DiagramMutationCompartmentService {
│
⋮
│    private boolean needToRevealCompartment(Element element, boolean isGeneralView) {
│        return new RevealCompartmentSwitch(isGeneralView).doSwitch(element);
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramMuta
⋮
│@Service
│public class DiagramMutationDiagramService {
│
⋮
│    public List<Element> duplicateElementAndExpose(List<Element> elements, IEditingContext editingC
⋮
│    public Element duplicateElementAndExpose(Element element, IEditingContext editingContext, Diagr
⋮
│    private Element duplicateElementAndExpose(Element element, IEditingContext editingContext, Diag
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramMuta
⋮
│@Service
│public class DiagramMutationElementService {
│
⋮
│    public ViewCreationRequest createView(Element element, IEditingContext editingContext, DiagramC
⋮
│    private ViewCreationRequest createView(Element element, IEditingContext editingContext, Diagram
⋮
│    public ViewCreationRequest createView(Element element, String parentElementId, String descripti
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramMuta
⋮
│@Service
│public class DiagramMutationMoveService {
│
⋮
│    public void moveElement(Element droppedElement, Node droppedNode, Element targetElement, Node t
⋮
│    private String getLabel(Object droppedElement) {
│        final String label;
│        StyledString styledLabel = this.labelService.getStyledLabel(droppedElement);
│        if (styledLabel != null && !styledLabel.toString().isEmpty()) {
│            label = styledLabel.toString();
│        } else if (droppedElement instanceof EObject droppedEObject) {
│            label = droppedEObject.eClass().getName();
│        } else {
│            label = "";
│        }
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramMuta
⋮
│@Service
│public class DiagramMutationToolService {
│
⋮
│    public Element createReferenceUsage(Element owner, Element selectedElement) {
│        var newReferenceUsage = SysmlFactory.eINSTANCE.createReferenceUsage();
│        final Membership membership;
│        if (owner instanceof Package) {
│            membership = SysmlFactory.eINSTANCE.createOwningMembership();
│        } else {
│            membership = SysmlFactory.eINSTANCE.createFeatureMembership();
│        }
│        membership.getOwnedRelatedElement().add(newReferenceUsage);
│        owner.getOwnedRelationship().add(membership);
⋮
│    private Membership createMembership(Element element, EClass membershipType) {
│        Membership membership = null;
│        var eObject = SysmlFactory.eINSTANCE.create(membershipType);
│        if (eObject instanceof Membership typedMembership) {
│            membership = typedMembership;
│            element.getOwnedRelationship().add(membership);
│        }
│        return membership;
⋮
│    private boolean isAction(Element element) {
│        return element instanceof ActionUsage || element instanceof ActionDefinition;
⋮
│    private Package getClosestContainingPackageFrom(Element element) {
│        var owner = element.eContainer();
│        while (!(owner instanceof Package) && owner != null) {
│            owner = owner.eContainer();
│        }
│        return (Package) owner;
⋮
│    private String getLabel(Object droppedElement) {
│        final String label;
│        StyledString styledLabel = this.labelService.getStyledLabel(droppedElement);
│        if (styledLabel != null && !styledLabel.toString().isEmpty()) {
│            label = styledLabel.toString();
│        } else if (droppedElement instanceof EObject droppedEObject) {
│            label = droppedEObject.eClass().getName();
│        } else {
│            label = "";
│        }
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramQuer
⋮
│@Service
│public class DiagramQueryAnnotatingService {
│
⋮
│    private boolean isAnnotatingNodeOnRoot(DiagramContext diagramContext, IEditingContext editingCo
│        boolean isAnnotatingNodeOnRoot = false;
│        String diagramTargetObjectId = diagramContext.diagram().getTargetObjectId();
│        Element diagramTargetObject = this.objectSearchService.getObject(editingContext, diagramTar
│                .filter(Element.class::isInstance)
│                .map(Element.class::cast)
│                .findFirst()
│                .orElse(null);
│        if (diagramTargetObject instanceof ViewUsage viewUsage) {
│            if (annotatedElements.contains(viewUsage)) {
⋮
│    private Edge getOneMatchingAnnotatedEdge(Edge edge, List<Element> annotatedElements, DiagramCon
│        Edge matchingAnnotatedEdge = null;
│        Optional<Object> semanticNodeOpt = this.objectSearchService.getObject(editingContext, edge.
│        if (semanticNodeOpt.isPresent()) {
│            if (annotatedElements.contains(semanticNodeOpt.get())) {
│                boolean isDeletingAnnotatingEdge = diagramContext.viewDeletionRequests().stream()
│                        .anyMatch(viewDeletionRequest -> Objects.equals(viewDeletionRequest.getElem
│                if (!isDeletingAnnotatingEdge) {
│                    matchingAnnotatedEdge = edge;
│                }
⋮
│    private Node getOneMatchingAnnotatedNode(Node node, List<Element> annotatedElements, DiagramCon
│        Node matchingAnnotatedNode = null;
│        Optional<Object> semanticNodeOpt = this.objectSearchService.getObject(editingContext, node.
│        if (semanticNodeOpt.isPresent()) {
│            if (annotatedElements.contains(semanticNodeOpt.get())) {
│                boolean isDeletingAnnotatingNode = diagramContext.viewDeletionRequests().stream()
│                        .anyMatch(viewDeletionRequest -> Objects.equals(viewDeletionRequest.getElem
│                if (!isDeletingAnnotatingNode) {
│                    matchingAnnotatedNode = node;
│                }
⋮
│    private Node getFirstMatchingChildAnnotatedNode(Node node, List<Element> annotatedElements, Dia
│        List<Node> childrenNodes = Stream.concat(node.getChildNodes().stream(), node.getBorderNodes
│        for (Node childNode : childrenNodes) {
│            Node matchingChildAnnotatedNode = this.getOneMatchingAnnotatedNode(childNode, annotated
│            if (matchingChildAnnotatedNode != null) {
│                return matchingChildAnnotatedNode;
│            }
│        }
│        return null;
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramQuer
⋮
│@Service
│public class DiagramQueryElementService {
│
⋮
│    public ViewUsage getViewUsage(IEditingContext editingContext, DiagramContext diagramContext, No
│        Optional<ViewUsage> optViewUsage = Optional.empty();
│        if (node == null) {
│            optViewUsage = this.objectSearchService.getObject(editingContext, diagramContext.diagra
│                    .filter(ViewUsage.class::isInstance)
│                    .map(ViewUsage.class::cast);
│        } else {
│            optViewUsage = this.objectSearchService.getObject(editingContext, node.getTargetObjectI
│                    .filter(ViewUsage.class::isInstance)
│                    .map(ViewUsage.class::cast);
⋮
│    private Optional<ViewUsage> getParentViewUsage(Node node, IEditingContext editingContext, Diagr
│        Optional<ViewUsage> optViewUsage = Optional.empty();
│        if (optViewUsage.isEmpty()) {
│            var parentGraphicalObj = new NodeFinder(diagramContext.diagram()).getParent(node);
│            if (parentGraphicalObj instanceof Node parentNode) {
│                optViewUsage = this.objectSearchService.getObject(editingContext, parentNode.getTar
│                        .filter(ViewUsage.class::isInstance)
│                        .map(ViewUsage.class::cast);
│                if (optViewUsage.isEmpty()) {
│                    return this.getParentViewUsage(parentNode, editingContext, diagramContext);
⋮
│    private boolean previousNodesOnlyContainsEmptyDiagramImageNode(IEditingContext editingContext, 
│        return previousNodes.isEmpty() || (previousNodes.size() == 1 && previousNodes.stream()
│                .anyMatch(
│                        node -> Objects.equals("siriusComponents://nodeDescription?sourceKind=view&
│                                node.getDescriptionId())));
⋮
│    private boolean previousNodesOnlyContainsMissingElements(IEditingContext editingContext, List<N
│        for (Node node : previousNodes) {
│            var targetObjectId = node.getTargetObjectId();
│            var optObject = this.objectSearchService.getObject(editingContext, targetObjectId)
│                    .filter(Element.class::isInstance)
│                    .map(Element.class::cast);
│            if (optObject.isPresent()) {
│                return false;
│            }
│        }
⋮
│    private boolean previousNodesOnlyViewDeletionRequests(List<Node> previousNodes, List<ViewDeleti
│        var nodesIds = previousNodes.stream().map(Node::getId).toList();
│        for (ViewDeletionRequest viewDeletionRequest : viewDeletionRequests) {
│            if (!nodesIds.contains(viewDeletionRequest.getElementId())) {
│                return false;
│            }
│        }
│        return true;
⋮
│    private boolean isValidConnectionEnd(Feature endFeature, org.eclipse.sirius.components.represen
⋮
│    private boolean isDisplayIn(Feature expectedSemanticParent, org.eclipse.sirius.components.repre
│        if (node.getProps() instanceof NodeElementProps sourceNodeProps) {
│            return cacheRendering.getParent(sourceNodeProps.getId())
│                    .map(org.eclipse.sirius.components.representations.Element::getProps)
│                    .filter(NodeElementProps.class::isInstance)
│                    .map(NodeElementProps.class::cast)
│                    .map(NodeElementProps::getTargetObjectId)
│                    .flatMap(id -> this.objectSearchService.getObject(editingContext, id))
│                    .map(semanticParent -> semanticParent == expectedSemanticParent)
│                    .orElse(allowRootElement);
⋮
│    public Optional<Node> findNodeById(Diagram diagram, String nodeId) {
│        return this.diagramQueryService.findNodeById(diagram, nodeId);
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramQuer
⋮
│@Service
│public class DiagramQueryExposeService {
│
⋮
│    public List<Element> getExposedElements(Element element, EClass domainType, List<Object> ancest
│        return this.getExposedElements(element, null, domainType, ancestors, editingContext, diagra
⋮
│    public List<Element> getExposedElements(Element element, Element parent, EClass domainType, Lis
│        List<Element> elementsToExpose = new ArrayList<>();
│        if (element instanceof ViewUsage viewUsage) {
│            var exposedElements = new ArrayList<Element>();
│            if (parent == null) {
│                exposedElements.addAll(this.getDirectExposedElements(viewUsage));
│            } else {
│                exposedElements.addAll(viewUsage.getExposedElement());
│            }
│            var filteredExposedElements = exposedElements.stream()
⋮
│    private List<Element> getRecursiveContents(Element element) {
│        var contents = new ArrayList<Element>();
│        var ownedElements = element.getOwnedElement().stream().filter(Objects::nonNull).toList();
│        contents.addAll(ownedElements);
│        ownedElements.forEach(oe -> contents.addAll(this.getRecursiveContents(oe)));
│        return contents;
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramQuer
⋮
│@Service
│public class DiagramQueryGraphicalService {
│
⋮
│    private boolean isAncestorOf(org.eclipse.sirius.components.representations.Element parentNodeEl
⋮
│    private String getParentId(DiagramRenderingCache cache, NodeElementProps nodeElementProps) {
│        return cache.getParent(nodeElementProps.getId())
│                .map(org.eclipse.sirius.components.representations.Element::getProps)
│                .map(props -> {
│                    if (props instanceof NodeElementProps parentNodeProps) {
│                        return parentNodeProps.getId();
│                    }
│                    return null;
│                })
│                .filter(Objects::nonNull)
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramQuer
⋮
│@Service
│public class DiagramQueryLabelService implements IDiagramLabelService {
│
⋮
│    @Override
│    public String getIdentificationLabel(Element element) {
⋮
│    @Override
│    public String getReferenceSubsettingLabel(Element element) {
⋮
│    @Override
│    public String getRedefinitionLabel(Element element) {
⋮
│    @Override
│    public String getSubclassificationLabel(Element element) {
⋮
│    @Override
│    public String getSubsettingLabel(Element element) {
⋮
│    @Override
│    public String getTypingLabel(Element element) {
⋮
│    @Override
│    public String getValueLabel(Usage usage) {
⋮
│    @Override
│    public String getSysmlTextualRepresentation(Element element, boolean resolvableName) {
⋮
│    private String getBasicNamePrefix(Element element) {
│        StringBuilder label = new StringBuilder();
│        if (element instanceof OccurrenceUsage occurrenceUsage && occurrenceUsage.isSetPortionKind(
│            if (occurrenceUsage.getPortionKind().equals(PortionKind.TIMESLICE)) {
│                label.append(LabelConstants.TIMESLICE + LabelConstants.SPACE);
│            } else if (occurrenceUsage.getPortionKind().equals(PortionKind.SNAPSHOT)) {
│                label.append(LabelConstants.SNAPSHOT + LabelConstants.SPACE);
│            }
│        }
│        if (element instanceof Usage usage) {
⋮
│    private String getDeclaredNameLabel(Element element) {
│        var label = element.getName();
│        if (ElementUtil.isFromStandardLibrary(element)) {
│            label = element.getQualifiedName();
│        }
│        return label;
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramQuer
⋮
│@Service
│public class DiagramQueryToolService {
│
⋮
│    private List<Type> getSpecializationTypeHierarchy(Type type) {
│        List<Type> specializationTypeHierarchy = new ArrayList<>();
│        this.getSpecializationTypeHierarchy(type, specializationTypeHierarchy);
│        return specializationTypeHierarchy;
⋮
│    private void getSpecializationTypeHierarchy(Type type, List<Type> specializationTypeHierarchy) 
│        if (type != null) {
│            List<Type> specializationTypes = new ArrayList<>();
│            type.getOwnedSpecialization().stream()
│                    .map(Specialization::getGeneral)
│                    .forEach(general -> {
│                        if (general != null && !specializationTypeHierarchy.contains(general) && !s
│                            specializationTypes.add(general);
│                            specializationTypeHierarchy.add(general);
│                        }
⋮
│    private boolean isRootNamespace(Element element) {
│        return Objects.equals(element.eClass(), SysmlPackage.eINSTANCE.getNamespace())
│                && element instanceof InternalEObject internalEObject
│                && internalEObject.eDirectResource() != null;
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/DiagramQuer
⋮
│@Service
│public class DiagramQueryViewService {
│
⋮
│    private List<Object> getAncestors(Node selectedNode, Diagram diagram, IEditingContext editingCo
│        var ancestors = new ArrayList<>();
│        var parent = new NodeFinder(diagram).getParent(selectedNode);
│        if (parent instanceof Node parentNode) {
│            var parentObject = this.objectSearchService.getObject(editingContext, parentNode.getTar
│            if (parentObject.isPresent()) {
│                ancestors.add(parentObject.get());
│                ancestors.addAll(this.getAncestors(parentNode, diagram, editingContext));
│            }
│        } else if (parent instanceof Diagram) {
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/GeneralView
⋮
│public class GeneralViewEdgeEndpointsSwitch extends SysmlSwitch<GeneralViewEdgeEndpointsSwitch.Edge
│
│    private final MetamodelQueryElementService metamodelQueryElementService = new MetamodelQueryEle
│
│    /**
│     * Return the General View edge endpoints for the given AllocationUsage.
│     *
│     * @param allocationUsage
│     *            the relationship to inspect
│     * @return its endpoints, including an empty set for missing endpoints
│     */
│    @Override
│    public EdgeEndpoints caseAllocationUsage(AllocationUsage allocationUsage) {
⋮
│    @Override
│    public EdgeEndpoints caseFlowUsage(FlowUsage flowUsage) {
⋮
│    @Override
│    public EdgeEndpoints caseConnector(Connector connector) {
⋮
│    @Override
│    public EdgeEndpoints caseTransitionUsage(TransitionUsage transitionUsage) {
⋮
│    @Override
│    public EdgeEndpoints caseSatisfyRequirementUsage(SatisfyRequirementUsage satisfy) {
⋮
│    @Override
│    public EdgeEndpoints caseIncludeUseCaseUsage(IncludeUseCaseUsage include) {
⋮
│    @Override
│    public EdgeEndpoints caseFeatureValue(FeatureValue featureValue) {
⋮
│    @Override
│    public EdgeEndpoints caseFramedConcernMembership(FramedConcernMembership framedConcern) {
⋮
│    @Override
│    public EdgeEndpoints caseRequirementConstraintMembership(RequirementConstraintMembership requir
⋮
│    @Override
│    public EdgeEndpoints caseAnnotation(Annotation annotation) {
⋮
│    @Override
│    public EdgeEndpoints caseDependency(Dependency dependency) {
⋮
│    @Override
│    public EdgeEndpoints caseFeatureTyping(FeatureTyping featureTyping) {
⋮
│    @Override
│    public EdgeEndpoints caseRedefinition(Redefinition redefinition) {
⋮
│    @Override
│    public EdgeEndpoints caseReferenceSubsetting(ReferenceSubsetting referenceSubsetting) {
⋮
│    @Override
│    public EdgeEndpoints caseSubsetting(Subsetting subsetting) {
⋮
│    @Override
│    public EdgeEndpoints caseSubclassification(Subclassification subclassification) {
⋮
│    @Override
│    public EdgeEndpoints defaultCase(EObject object) {
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/InheritedCo
⋮
│public class InheritedCompartmentItemFilterSwitch extends SysmlSwitch<Boolean> {
│
│    private final EReference eReference;
│
│    /**
│     * Creates the filter for the given compartment reference.
│     *
│     * @param eReference
│     *            the compartment reference used to decide whether an inherited feature should be k
│     */
⋮
│    @Override
│    public Boolean defaultCase(EObject object) {
⋮
│    private boolean isSubjectReference() {
│        return this.eReference.equals(SysmlPackage.eINSTANCE.getRequirementUsage_SubjectParameter()
│                || this.eReference.equals(SysmlPackage.eINSTANCE.getRequirementDefinition_SubjectPa
│                || this.eReference.equals(SysmlPackage.eINSTANCE.getCaseDefinition_SubjectParameter
│                || this.eReference.equals(SysmlPackage.eINSTANCE.getCaseUsage_SubjectParameter());
⋮
│    private boolean shouldConsiderParameter(Feature feature) {
│        Type owningType = feature.getOwningType();
│        return (owningType instanceof Behavior && this.eReference.equals(SysmlPackage.eINSTANCE.get
│                || (owningType instanceof Step && this.eReference.equals(SysmlPackage.eINSTANCE.get
⋮
│    private boolean isInheritedParameter(Feature feature) {
│        List<Feature> featureParameter = switch (feature.getOwner()) {
│            case Behavior behavior -> behavior.getParameter();
│            case Step step -> step.getParameter();
│            default -> List.of();
│        };
│        return featureParameter.contains(feature);
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/ShowDiagram
⋮
│@Service
│public class ShowDiagramsInheritedMembersService {
│
⋮
│    public boolean getShowInheritedMembers() {
│        return this.showInheritedMembers;
⋮
│    public void setShowInheritedMembers(boolean showInheritedMembers) {
│        this.showInheritedMembers = showInheritedMembers;
⋮
│    public boolean getShowInheritedMembersFromStandardLibraries() {
│        return this.showInheritedMembersFromStandardLibraries;
⋮
│    public void setShowInheritedMembersFromStandardLibraries(boolean showInheritedMembersFromStanda
│        this.showInheritedMembersFromStandardLibraries = showInheritedMembersFromStandardLibraries;
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/api/IDiagra
⋮
│public interface IDiagramLabelService {
│
│    /**
│     * Returns the identification of the provided {@code element}.
│     * <p>
│     * The identification of an element is the concatenation of its <i>short name</i> and its <i>de
│     * </p>
│     *
│     * @param element
│     *            the element to get the identification from
⋮
│    String getIdentificationLabel(Element element);
│
⋮
│    String getRedefinitionLabel(Element element);
│
⋮
│    String getSubclassificationLabel(Element element);
│
⋮
│    String getSubsettingLabel(Element element);
│
⋮
│    String getReferenceSubsettingLabel(Element element);
│
⋮
│    String getSysmlTextualRepresentation(Element element, boolean resolvableName);
│
⋮
│    String getTypingLabel(Element element);
│
⋮
│    String getValueLabel(Usage usage);
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/aql/Diagram
⋮
│public class DiagramMutationAQLService {
│
│    private final DiagramMutationDndService diagramMutationDndService;
│
│    private final DiagramMutationElementService diagramMutationElementService;
│
│    private final DiagramMutationExposeService diagramMutationExposeService;
│
│    private final DiagramMutationLabelService diagramMutationLabelService;
│
⋮
│    public Element directEdit(Element element, String newLabel) {
│        return this.diagramMutationLabelService.directEdit(element, newLabel);
⋮
│    public Element duplicateElementAndExpose(Element element, IEditingContext editingContext, Diagr
⋮
│    public Element createReferenceUsage(Element owner, Element usage) {
│        return this.diagramMutationToolService.createReferenceUsage(owner, usage);
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/aql/Diagram
⋮
│public class DiagramQueryAQLService {
│
│    private final DiagramQueryElementService diagramQueryElementService;
│
│    private final DiagramQueryLabelService diagramQueryLabelService;
│
│    private final DiagramQueryExposeService diagramQueryExposeService;
│
│    private final DiagramQueryGraphicalService diagramQueryGraphicalService;
│
⋮
│    public String getCompartmentItemLabel(Element element) {
│        String compartmentItemLabel = "";
│        if (element instanceof Documentation documentation) {
│            compartmentItemLabel = this.diagramQueryLabelService.getCompartmentItemLabel(documentat
│        } else if (element instanceof Usage usage) {
│            compartmentItemLabel = this.diagramQueryLabelService.getCompartmentItemLabel(usage);
│        }
│        return compartmentItemLabel;
⋮
│    public String getDefaultInitialDirectEditLabel(Element element) {
│        String defaultInitialDirectEditLabel = "";
│        if (element instanceof Comment comment) {
│            defaultInitialDirectEditLabel = this.diagramQueryLabelService.getDefaultInitialDirectEd
│        } else if (element instanceof TextualRepresentation textualRepresentation) {
│            defaultInitialDirectEditLabel = this.diagramQueryLabelService.getDefaultInitialDirectEd
│        } else {
│            defaultInitialDirectEditLabel = this.diagramQueryLabelService.getDefaultInitialDirectEd
│        }
│        return defaultInitialDirectEditLabel;
⋮
│    public List<Element> getExposedElements(Element element, EClass domainType, List<Object> ancest
│        return this.diagramQueryExposeService.getExposedElements(element, domainType, ancestors, ed
⋮
│    public List<Element> getExposedElements(Element element, Element parent, EClass domainType, Lis
│        return this.diagramQueryExposeService.getExposedElements(element, parent, domainType, ances
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/utils/Compa
⋮
│public class CompartmentItemPreconditionSwitch extends SysmlEClassSwitch<String> {
│
│    private final EReference eReference;
│
│    public CompartmentItemPreconditionSwitch(EReference eReference) {
│        this.eReference = Objects.requireNonNull(eReference);
│    }
│
│    @Override
│    public String defaultCase(EObject object) {
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/utils/Multi
⋮
│public class MultiLineLabelSwitch extends SysmlSwitch<String> {
│
│    private final IDiagramLabelService labelService;
│
│    public MultiLineLabelSwitch(IDiagramLabelService labelService) {
│        this.labelService = Objects.requireNonNull(labelService);
│    }
│
│    @Override
│    public String caseElement(Element object) {
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/utils/Revea
⋮
│public class RevealCompartmentSwitch extends SysmlSwitch<Boolean> {
│
│    private final boolean isGeneralView;
│
│    public RevealCompartmentSwitch(boolean isGeneralView) {
│        this.isGeneralView = isGeneralView;
│    }
│
│    @Override
│    public Boolean defaultCase(EObject object) {
⋮

backend/services/syson-diagram-services/src/main/java/org/eclipse/syson/diagram/services/utils/ViewF
⋮
│public class ViewFilterSwitch extends SysmlSwitch<Boolean> {
│
│    private final ViewDefinitionKind kind;
│
│    private final List<Element> exposedElements;
│
│    private final Element parentElement;
│
│    private final MetamodelQueryElementService metamodelQueryElementService;
│
⋮
│    @Override
│    public Boolean defaultCase(EObject object) {
⋮
│    private boolean isIndirectNestedNode(EObject object) {
│        boolean isDirectNestedNode = false;
│        if (this.parentElement instanceof Namespace elt && !elt.getOwnedMember().contains(object)) 
│            isDirectNestedNode = true;
│        } else {
│            for (Element exposedElement : this.exposedElements) {
│                if (Objects.equals(exposedElement, object)) {
│                    continue;
│                } else if (this.parentElement == null && EMFUtils.isAncestor(exposedElement, object
│                    isDirectNestedNode = true;
⋮

backend/services/syson-diagram-services/src/test/java/org/eclipse/syson/diagram/services/Architectur
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_DIAGRAM_SERVICES_ROOT_PACKAGE = "org.eclipse.syson.diagram.ser
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_DIAGRAM_SERVICES_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/services/syson-diagram-services/src/test/java/org/eclipse/syson/diagram/services/CodingRules
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_DIAGRAM_SERVICES_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮

backend/services/syson-diagram-services/src/test/java/org/eclipse/syson/diagram/services/DiagramAQLS
⋮
│public class DiagramAQLServiceClassArchitectureTest {
│
│    @Test
│    void checkDiagramMutationAqlServiceClassDependencies() {
│        JavaClasses imported = new ClassFileImporter()
│                .importPackages("org.eclipse.syson.diagram.services.aql");
│
│        ArchRule rule = ArchRuleDefinition.classes()
│                .that().haveSimpleName("DiagramMutationAQLService")
│                .should().onlyDependOnClassesThat(new SysONServiceDependencyPredicate(List.of("Diag
⋮
│    @Test
│    void checkDiagramQueryAqlServiceClassDependencies() {
⋮

backend/services/syson-diagram-services/src/test/java/org/eclipse/syson/diagram/services/DiagramMuta
⋮
│public class DiagramMutationMoveServiceTest {
│
│    private static final String DROPPED_LABEL = "Dropped part";
│
│    private static final String TARGET_LABEL = "Target part";
│
│    @DisplayName("GIVEN a failed semantic move, WHEN moving an element in a diagram, THEN a warning
│    @Test
│    void testMoveElementFailureCreatesFeedbackMessageWithLabels() {
│        PartUsage droppedElement = SysmlFactory.eINSTANCE.createPartUsage();
⋮
│    private static final class CapturingFeedbackMessageService implements IFeedbackMessageService {
│
│        private final List<Message> feedbackMessages = new ArrayList<>();
│
│        @Override
│        public void addFeedbackMessage(Message message) {
│            this.feedbackMessages.add(message);
│        }
│
│        @Override
│        public List<Message> getFeedbackMessages() {
⋮
│    private static final class TestLabelService extends ILabelService.NoOp {
│
│        private final IdentityHashMap<Object, StyledString> labels = new IdentityHashMap<>();
│
│        TestLabelService withLabel(Object object, String label) {
│            this.labels.put(object, StyledString.of(label));
│            return this;
│        }
│
│        @Override
│        public StyledString getStyledLabel(Object object) {
⋮

backend/services/syson-diagram-services/src/test/java/org/eclipse/syson/diagram/services/DiagramMuta
⋮
│public class DiagramMutationToolServiceTest {
│
│    private static final String FAILURE_MESSAGE = "move refused";
│
│    @DisplayName("GIVEN a failed semantic move, WHEN becoming a nested usage, THEN a warning feedba
│    @Test
│    void testBecomeNestedUsageFailureCreatesFeedbackMessageWithLabels() {
│        Usage usage = SysmlFactory.eINSTANCE.createPartUsage();
│        PartUsage newContainer = SysmlFactory.eINSTANCE.createPartUsage();
│        TestServices testServices = this.createService(usage, "Nested usage", newContainer, "New co
│
⋮
│    private TestServices createService(Object firstObject, String firstLabel, Object secondObject, 
│        return this.createService(firstObject, firstLabel, secondObject, secondLabel, null, null);
⋮
│    private TestServices createService(Object firstObject, String firstLabel, Object secondObject, 
│        TestMoveElementService moveService = new TestMoveElementService(MoveStatus.buildFailure(FAI
│        CapturingFeedbackMessageService feedbackMessageService = new CapturingFeedbackMessageServic
│        TestLabelService labelService = new TestLabelService()
│                .withLabel(firstObject, firstLabel)
│                .withLabel(secondObject, secondLabel);
│        if (thirdObject != null) {
│            labelService.withLabel(thirdObject, thirdLabel);
│        }
│
⋮
│    private static final class TestMoveElementService implements ISysMLMoveElementService {
│
│        private final MoveStatus moveStatus;
│
│        private Element movedElement;
│
│        private Element newParent;
│
│        private int callCount;
│
⋮
│        @Override
│        public MoveStatus moveSemanticElement(Element element, Element targetParent) {
⋮
│    private static final class CapturingFeedbackMessageService implements IFeedbackMessageService {
│
│        private final List<Message> feedbackMessages = new ArrayList<>();
│
│        @Override
│        public void addFeedbackMessage(Message message) {
│            this.feedbackMessages.add(message);
│        }
│
│        @Override
│        public List<Message> getFeedbackMessages() {
⋮
│    private static final class TestLabelService extends ILabelService.NoOp {
│
│        private final IdentityHashMap<Object, StyledString> labels = new IdentityHashMap<>();
│
│        TestLabelService withLabel(Object object, String label) {
│            this.labels.put(object, StyledString.of(label));
│            return this;
│        }
│
│        @Override
│        public StyledString getStyledLabel(Object object) {
⋮

backend/services/syson-diagram-services/src/test/java/org/eclipse/syson/diagram/services/DiagramQuer
⋮
│class DiagramQueryToolServiceTest {
│
│    @DisplayName("GIVEN selected nodes, WHEN checking a control-node action, THEN only action usage
│    @Test
│    void testIsControlNodeActionCreationToolInAction() {
│        IObjectSearchService objectSearchService = mock(IObjectSearchService.class);
│        IEditingContext editingContext = mock(IEditingContext.class);
│        Node selectedNode = mock(Node.class);
│        when(selectedNode.getTargetObjectId()).thenReturn("selected-node");
│        DiagramQueryToolService service = this.createService(objectSearchService);
│
⋮
│    private DiagramQueryToolService createService(IObjectSearchService objectSearchService) {
│        return new DiagramQueryToolService(objectSearchService, new ShowDiagramsInheritedMembersSer
⋮
```
