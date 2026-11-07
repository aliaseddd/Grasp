# Repo map: backend/views/syson-tree-explorer-view

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/views/syson-tree-explorer-view`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/views/syson-tree-explorer-view) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 40 files there; aider read the 38 that `syson.aiderignore` leaves in, and the map shows 38 of them, 26 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/views/syson-tree-explorer-view/.checkstyle

backend/views/syson-tree-explorer-view/.classpath

backend/views/syson-tree-explorer-view/.project

backend/views/syson-tree-explorer-view/.settings/org.eclipse.core.resources.prefs

backend/views/syson-tree-explorer-view/.settings/org.eclipse.core.runtime.prefs

backend/views/syson-tree-explorer-view/.settings/org.eclipse.jdt.apt.core.prefs

backend/views/syson-tree-explorer-view/.settings/org.eclipse.jdt.core.prefs

backend/views/syson-tree-explorer-view/.settings/org.eclipse.jdt.ui.prefs

backend/views/syson-tree-explorer-view/.settings/org.eclipse.m2e.core.prefs

backend/views/syson-tree-explorer-view/.settings/org.springframework.ide.eclipse.prefs

backend/views/syson-tree-explorer-view/pom.xml

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/SysONExplo
⋮
│@Service
│public class SysONExplorerContributionProvider implements IExplorerTreeDescriptionProvider {
│
⋮
│    @Override
│    public List<TreeDescription> getDescriptions(IEditingContext editingContext) {
⋮
│    private Optional<TreeDescription> getSysONExplorerTreeDescription(IEditingContext editingContex
│        Optional<TreeDescription> result = Optional.empty();
│        if (!this.studioCapableEditingContextPredicate.test(editingContext.getId())) {
│            // Do not use the custom SysON Explorer in studio project: they should be managed by th
│            // explorer.
│            result = this.representationDescriptionSearchService
│                    .findAll(editingContext).values().stream()
│                    .filter(TreeDescription.class::isInstance)
│                    .map(TreeDescription.class::cast)
│                    .filter(td -> this.isSysONExplorerView(td, editingContext))
⋮
│    private boolean isSysONExplorerView(TreeDescription treeDescription, IEditingContext editingCon
│        if (treeDescription.getId().startsWith(ITreeIdProvider.TREE_DESCRIPTION_KIND)) {
│            // This tree description comes from a tree DSL
│            var optionalViewTreeDescription = this.viewRepresentationDescriptionSearchService.findB
│            if (optionalViewTreeDescription.isPresent()) {
│                return optionalViewTreeDescription.get().getName().equals(SysONExplorerTreeDescript
│            }
│        }
│        return false;
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/SysONExplo
⋮
│@Configuration
│public class SysONExplorerJavaServiceProvider implements IJavaServiceProvider {
│
│    @Override
│    public List<Class<?>> getServiceClasses(View view) {
⋮
│    private boolean isSysONDefaultExplorerTreeDescription(RepresentationDescription representationD
│        return SysONExplorerTreeDescriptionProvider.SYSON_EXPLORER.equals(representationDescription
│
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/SysONExplo
⋮
│@Service
│public class SysONExplorerTreeDescriptionOrderer implements IExplorerTreeDescriptionOrderer {
│
│    @Override
│    public void order(List<ExplorerDescriptionMetadata> explorerDescriptionMetadataList) {
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/SysONExplo
⋮
│public class SysONExplorerTreeDescriptionProvider {
│
│    public static final String SYSON_EXPLORER = "SysON Explorer";
│
│    public View createView() {
│
│        var sysonDefaultTreeView = new ViewBuilders()
│                .newView()
│                .descriptions(this.build())
│                .build();
│
│        UUID resourceId = UUID.nameUUIDFromBytes(SysONExplorerTreeDescriptionProvider.SYSON_EXPLORE
│        String resourcePath = resourceId.toString();
│        JsonResource resource = new JSONResourceFactory().createResourceFromPath(resourcePath);
⋮
│    private TreeDescription build() {
│        TreeDescription description = new TreeDescriptionBuilder()
│                .name(SYSON_EXPLORER)
│                .childrenExpression(ServiceMethod.of4(TreeQueryAQLService::getChildren).aqlSelf(Cor
│                .deletableExpression(ServiceMethod.of0(TreeQueryAQLService::isDeletable).aqlSelf())
│                .editableExpression(ServiceMethod.of0(TreeQueryAQLService::isEditable).aqlSelf())
│                .elementsExpression(ServiceMethod.of1(TreeQueryAQLService::getElements).aql(CoreVar
│                .hasChildrenExpression(ServiceMethod.of4(TreeQueryAQLService::hasChildren).aqlSelf(
│                .treeItemIconExpression(ServiceMethod.of0(TreeQueryAQLService::getImageURL).aqlSelf
│                .kindExpression(ServiceMethod.of0(TreeQueryAQLService::getKind).aqlSelf())
⋮
│    private TreeItemLabelDescription createDefaultStyle() {
│        return new TreeBuilders()
│                .newTreeItemLabelDescription()
│                .name("Default style")
│                .preconditionExpression("aql:true")
│                .children(this.getShortNameLabelFragmentDescription(),
│                        this.getDefaultLabelFragmentDescription(),
│                        this.getTypeFragmentDescription(),
│                        this.getLibraryLabelFragmentDescription(),
│                        this.getReadOnlyFragmentDescription())
⋮
│    private TreeItemLabelFragmentDescription getDefaultLabelFragmentDescription() {
│        return new TreeBuilders().newTreeItemLabelFragmentDescription()
│                .labelExpression(ServiceMethod.of0(TreeQueryAQLService::getLabel).aqlSelf())
│                .build();
⋮
│    private TreeItemLabelFragmentDescription getShortNameLabelFragmentDescription() {
│        return new TreeBuilders().newTreeItemLabelFragmentDescription()
│                .labelExpression(ServiceMethod.of0(TreeQueryAQLService::getShortName).aqlSelf())
│                .style(new TextStyleDescriptionBuilder()
│                        .name("ShortNamePrefixStyle")
│                        // Using color from MUI theme does not work so we use the hard coded color
│                        // See https://github.com/eclipse-sirius/sirius-web/issues/5672
│                        .foregroundColorExpression("aql:'#64669b'")
│                        .build())
│                .build();
⋮
│    private TreeItemLabelFragmentDescription getTypeFragmentDescription() {
│        return new TreeBuilders().newTreeItemLabelFragmentDescription()
│                .labelExpression(ServiceMethod.of0(TreeQueryAQLService::getType).aqlSelf())
│                .style(new ViewBuilders().newTextStyleDescription()
│                        .name("GOLD_TEXT_STYLE_NAME")
│                        .foregroundColorExpression("aql:'#ab8b01'")
│                        .build())
│                .build();
⋮
│    private TreeItemLabelFragmentDescription getReadOnlyFragmentDescription() {
│        return new TreeBuilders().newTreeItemLabelFragmentDescription()
│                .labelExpression(ServiceMethod.of0(TreeQueryAQLService::getReadOnlyTag).aqlSelf())
│                .style(new ViewBuilders().newTextStyleDescription()
│                        .name("ReadOnlyTagStyle")
│                        .foregroundColorExpression("aql:'#64669b'")
│                        .build())
│                .build();
⋮
│    private TreeItemLabelFragmentDescription getLibraryLabelFragmentDescription() {
│        return new TreeBuilders().newTreeItemLabelFragmentDescription()
│                .labelExpression(ServiceMethod.of0(TreeQueryAQLService::getLibraryLabel).aqlSelf())
│                .style(new ViewBuilders().newTextStyleDescription()
│                        .name("LibraryLabelStyle")
│                        .foregroundColorExpression("aql:'#ab8b01'")
│                        .build())
│                .build();
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/SysONExplo
⋮
│@Service
│public class SysONExplorerTreeRepresentationMetadataProvider implements IRepresentationMetadataProv
│
⋮
│    @Override
│    public Optional<RepresentationMetadata> getMetadata(String editingContextId, String representat
⋮
│    private String getTreeDescriptionIdFromRepresentationId(String representationId) {
│        if (representationId.indexOf(ExplorerEventProcessorFactory.TREE_DESCRIPTION_ID_PARAMETER) >
│            Map<String, List<String>> parameters = this.urlParser.getParameterValues(representation
│            return parameters.get(ExplorerEventProcessorFactory.TREE_DESCRIPTION_ID_PARAMETER).get(
│        }
│        return "";
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/SysONTreeF
⋮
│@Service
│public class SysONTreeFilterProvider implements ITreeFilterProvider {
│
│    @Override
│    public List<TreeFilter> get(String editingContextId, TreeDescription treeDescription) {
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/SysONTreeV
⋮
│@Service
│public class SysONTreeViewDescriptionProvider implements IEditingContextProcessor {
│
⋮
│    @Override
│    public void preProcess(IEditingContext editingContext) {
⋮
│    public String getDescriptionId() {
│        return this.descriptionId;
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/duplicate/
⋮
│@Service
│public class ElementContainmentFeatureProviderDelegate implements IContainmentFeatureProviderDelega
│
⋮
│    @Override
│    public boolean canHandle(Object container, Object child) {
⋮
│    @Override
│    public List<ContainmentFeature> getContainmentFeatures(Object container, Object child) {
⋮
│    private boolean isNonMembershipElement(Object target) {
│        return !(target instanceof Membership) && target instanceof Element;
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/duplicate/
⋮
│public class SysMLContainmentMembershipLabelSwitch extends SysmlEClassSwitch<String> {
│
│    @Override
│    public String caseOwningMembership(OwningMembership object) {
│        return "Add as an owning member";
│    }
│
│    @Override
│    public String caseFeatureMembership(FeatureMembership object) {
│        return "Add as a feature member";
⋮
│    @Override
│    public String caseActorMembership(ActorMembership object) {
⋮
│    @Override
│    public String caseObjectiveMembership(ObjectiveMembership object) {
⋮
│    @Override
│    public String caseVariantMembership(VariantMembership object) {
⋮
│    @Override
│    public String caseFeatureValue(FeatureValue object) {
⋮
│    @Override
│    public String caseElementFilterMembership(ElementFilterMembership object) {
⋮
│    @Override
│    public String caseResultExpressionMembership(ResultExpressionMembership object) {
⋮
│    @Override
│    public String caseRequirementConstraintMembership(RequirementConstraintMembership object) {
⋮
│    @Override
│    public String caseFramedConcernMembership(FramedConcernMembership object) {
⋮
│    @Override
│    public String caseRequirementVerificationMembership(RequirementVerificationMembership object) {
⋮
│    @Override
│    public String caseStateSubactionMembership(StateSubactionMembership object) {
⋮
│    @Override
│    public String caseViewRenderingMembership(ViewRenderingMembership object) {
⋮
│    @Override
│    public String caseTransitionFeatureMembership(TransitionFeatureMembership object) {
⋮
│    @Override
│    public String caseParameterMembership(ParameterMembership object) {
⋮
│    @Override
│    public String caseStakeholderMembership(StakeholderMembership object) {
⋮
│    @Override
│    public String caseSubjectMembership(SubjectMembership object) {
⋮
│    @Override
│    public String caseReturnParameterMembership(ReturnParameterMembership object) {
⋮
│    @Override
│    public String caseEndFeatureMembership(EndFeatureMembership object) {
⋮
│    @Override
│    public String caseMembership(Membership object) {
⋮
│    @Override
│    public String defaultCase(EObject object) {
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/duplicate/
⋮
│@Service
│public class SysONDuplicateDelegate implements IObjectDuplicatorDelegate {
│
⋮
│    @Override
│    public boolean canHandle(IEditingContext editingContext, EObject objectToDuplicate, EObject con
⋮
│    @Override
│    public IStatus duplicateObject(IEditingContext editingContext, EObject objectToDuplicate, EObje
⋮
│    private List<Message> getMessages(DuplicationSettings settings) {
│        final List<Message> messages;
│        if (settings.updateIncomingReferences()) {
│            messages = List.of(new Message("The option 'Update incoming references' is ignored. It 
│        } else {
│            messages = List.of();
│        }
│        return messages;
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/duplicate/
⋮
│@Service
│public class SysONDuplicateTargetBrowserTreeDescriptionIdProviderDelegate implements IModelBrowserT
│
⋮
│    @Override
│    public boolean canHandle(IEditingContext editingContext, String modelBrowserId) {
⋮
│    @Override
│    public String getModelBrowserTreeDescriptionId(IEditingContext editingContext, String modelBrow
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/duplicate/
⋮
│@Service
│public class SysONDuplicateTargetBrowserTreeDescriptionProvider implements IEditingContextRepresent
│
⋮
│    @Override
│    public List<IRepresentationDescription> getRepresentationDescriptions(IEditingContext editingCo
⋮
│    private Object getTreeItemObject(VariableManager variableManager) {
│        Object result = null;
│        var optionalEditingContext = variableManager.get(CoreVariables.EDITING_CONTEXT.name(), IEdi
│        var optionalId = variableManager.get(TreeDescription.ID, String.class);
│        if (optionalId.isPresent() && optionalEditingContext.isPresent()) {
│            var optionalObject = this.objectSearchService.getObject(optionalEditingContext.get(), o
│            if (optionalObject.isPresent()) {
│                result = optionalObject.get();
│            } else {
│                var optionalEditingDomain = Optional.of(optionalEditingContext.get())
⋮
│    private Object getParentObject(VariableManager variableManager) {
│        Object result = null;
│        var self = variableManager.getVariables().get(RepresentationVariables.SELF.name());
│        if (self instanceof Element element) {
│            var owningMemberElement = element.getOwningMembership();
│            if (owningMemberElement != null) {
│                result = owningMemberElement.eContainer();
│            }
│        }
│
⋮
│    private boolean hasChildren(VariableManager variableManager) {
│        boolean hasChildren = false;
│        var self = variableManager.getVariables().get(RepresentationVariables.SELF.name());
│        if (self instanceof Element element) {
│            hasChildren = !element.getOwnedElement().isEmpty();
│        } else if (self instanceof Resource resource) {
│            hasChildren = resource.getContents().stream()
│                    .anyMatch(Element.class::isInstance);
│        }
│        return hasChildren;
⋮
│    private List<Object> getChildren(VariableManager variableManager) {
│        List<Object> result = new ArrayList<>();
│
│        List<String> expandedIds = new ArrayList<>();
│        var objects = variableManager.getVariables().get(TreeRenderer.EXPANDED);
│        if (objects instanceof List<?> list) {
│            expandedIds = list.stream().filter(String.class::isInstance).map(String.class::cast).to
│        }
│
│        var optionalEditingContext = variableManager.get(CoreVariables.EDITING_CONTEXT.name(), IEdi
⋮
│    private List<? extends Object> getElements(VariableManager variableManager) {
│        var optionalResourceSet = variableManager.get(CoreVariables.EDITING_CONTEXT.name(), IEMFEdi
│                .map(IEMFEditingContext::getDomain)
│                .map(EditingDomain::getResourceSet);
│
│        if (optionalResourceSet.isPresent()) {
│            var resourceSet = optionalResourceSet.get();
│            return resourceSet.getResources().stream()
│                    .filter(this::isValidTargetResource)
│                    .sorted(Comparator.nullsLast(Comparator.comparing(this::getResourceLabel, Strin
⋮
│    private String getResourceLabel(Resource resource) {
│        return resource.eAdapters().stream()
│                .filter(ResourceMetadataAdapter.class::isInstance)
│                .map(ResourceMetadataAdapter.class::cast)
│                .findFirst()
│                .map(ResourceMetadataAdapter::getName)
│                .orElse(resource.getURI().lastSegment());
⋮
│    private Boolean isSelectableProvider(VariableManager variableManager, IEditingContext editingCo
│        var targetContainer = variableManager.getVariables().get(RepresentationVariables.SELF.name(
│        var representationId = variableManager.get(GetOrCreateRandomIdProvider.PREVIOUS_REPRESENTAT
│        var ownerId = this.urlParser.getParameterValues(representationId).get("ownerId");
│        return ownerId != null && ownerId.stream()
│                .map(id -> this.objectSearchService.getObject(editingContext, id))
│                .filter(Optional::isPresent)
│                .map(Optional::get)
│                .findFirst()
│                .map(child -> !this.containmentFeatureProvider.getContainmentFeatures(targetContain
⋮
│    private List<String> getImageURL(VariableManager variableManager) {
│        List<String> imageURL = List.of(CoreImageConstants.DEFAULT_SVG);
│        var self = variableManager.getVariables().get(RepresentationVariables.SELF.name());
│        if (self instanceof EObject) {
│            imageURL = this.labelService.getImagePaths(self);
│        } else if (self instanceof Resource) {
│            imageURL = List.of("/icons/Resource.svg");
│        }
│        return imageURL;
⋮
│    private StyledString getLabel(VariableManager variableManager) {
│        String label = "";
│        var self = variableManager.getVariables().get(RepresentationVariables.SELF.name());
│        if (self instanceof EObject) {
│            var styledString = this.labelService.getStyledLabel(self);
│            if (!styledString.toString().isBlank()) {
│                return styledString;
│            } else {
│                var kind = this.identityService.getKind(self);
│                label = this.urlParser.getParameterValues(kind).get(SemanticKindConstants.ENTITY_AR
⋮
│    private String getTreeItemId(VariableManager variableManager) {
│        String id = null;
│        var self = variableManager.getVariables().get(RepresentationVariables.SELF.name());
│        if (self instanceof Resource || self instanceof EObject) {
│            id = this.identityService.getId(self);
│        }
│        return id;
⋮
│    private String getKind(VariableManager variableManager) {
│        final String kind;
│        var self = variableManager.getVariables().get(RepresentationVariables.SELF.name());
│        if (self instanceof Resource) {
│            kind = ExplorerDescriptionProvider.DOCUMENT_KIND;
│        } else {
│            kind = this.identityService.getKind(self);
│        }
│        return kind;
⋮
│    private boolean isValidTargetResource(Resource resource) {
│        return resource.getURI() != null
│                && IEMFEditingContext.RESOURCE_SCHEME.equals(resource.getURI().scheme())
│                && !this.readOnlyObjectPredicate.test(resource)
│                && resource.getContents().stream().anyMatch(Element.class::isInstance);
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/handlers/D
⋮
│@Service
│public class DropTreeItemHandler implements IDropTreeItemHandler {
│
⋮
│    @Override
│    public boolean canHandle(IEditingContext editingContext, Tree tree) {
⋮
│    @Override
│    public IStatus handle(IEditingContext editingContext, Tree tree, DropTreeItemInput input) {
│
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

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/menu/conte
⋮
│@Service
│public class CreateRepresentationInputProcessor implements IInputPreProcessor, IInputPostProcessor 
│
⋮
│    @Override
│    public IInput preProcess(IEditingContext editingContext, IInput input, Many<ChangeDescription> 
⋮
│    @Override
│    public void postProcess(IEditingContext editingContext, IInput input, Many<ChangeDescription> c
⋮
│    private boolean canHandle(CreateRepresentationInput createRepresentationInput) {
│        boolean canHandle = false;
│        var representationDescriptionId = createRepresentationInput.representationDescriptionId();
│        if (Objects.equals(SysONRepresentationDescriptionIdentifiers.GENERAL_VIEW_DIAGRAM_DESCRIPTI
│            canHandle = true;
│        } else if (Objects.equals(SysONRepresentationDescriptionIdentifiers.INTERCONNECTION_VIEW_DI
│            canHandle = true;
│        } else if (Objects.equals(SysONRepresentationDescriptionIdentifiers.ACTION_FLOW_VIEW_DIAGRA
│            canHandle = true;
│        } else if (Objects.equals(SysONRepresentationDescriptionIdentifiers.STATE_TRANSITION_VIEW_D
⋮
│    private String getRepresentationDescriptionId(String representationDescriptionId) {
│        String id = "";
│        if (Objects.equals(SysONRepresentationDescriptionIdentifiers.GENERAL_VIEW_DIAGRAM_DESCRIPTI
│            id = SysONRepresentationDescriptionIdentifiers.GENERAL_VIEW_DIAGRAM_DESCRIPTION_ID;
│        } else if (Objects.equals(SysONRepresentationDescriptionIdentifiers.INTERCONNECTION_VIEW_DI
│            id = SysONRepresentationDescriptionIdentifiers.GENERAL_VIEW_DIAGRAM_DESCRIPTION_ID;
│        } else if (Objects.equals(SysONRepresentationDescriptionIdentifiers.ACTION_FLOW_VIEW_DIAGRA
│            id = SysONRepresentationDescriptionIdentifiers.GENERAL_VIEW_DIAGRAM_DESCRIPTION_ID;
│        } else if (Objects.equals(SysONRepresentationDescriptionIdentifiers.STATE_TRANSITION_VIEW_D
│            id = SysONRepresentationDescriptionIdentifiers.GENERAL_VIEW_DIAGRAM_DESCRIPTION_ID;
⋮
│    private Optional<Element> getObject(IEditingContext editingContext, CreateRepresentationInput i
│        return this.objectSearchService.getObject(editingContext, input.objectId())
│                .filter(Element.class::isInstance)
│                .map(Element.class::cast);
⋮
│    private ViewUsage createViewUsage(IInput input, Element containerElement, String viewUsageName)
│        Optional<ViewUsage> optionalViewUsage = this.modelMutationElementService.createViewUsage(co
│        optionalViewUsage.ifPresent(view -> this.setViewDefinition(containerElement, view, input));
│        return optionalViewUsage.orElse(null);
⋮
│    private void setViewDefinition(Element containerElement, ViewUsage viewUsage, IInput input) {
│        var viewDefinition = this.getViewDefinition(containerElement, (CreateRepresentationInput) i
│        if (viewDefinition.isPresent()) {
│            var featureTyping = SysmlFactory.eINSTANCE.createFeatureTyping();
│            viewUsage.getOwnedRelationship().add(featureTyping);
│            featureTyping.setType(viewDefinition.get());
│            featureTyping.setTypedFeature(viewUsage);
│        }
⋮
│    private Optional<ViewDefinition> getViewDefinition(Element containerElement, CreateRepresentati
│        Optional<ViewDefinition> optViewDef = Optional.empty();
│        var representationDescriptionId = input.representationDescriptionId();
│        if (Objects.equals(SysONRepresentationDescriptionIdentifiers.GENERAL_VIEW_DIAGRAM_DESCRIPTI
│            var generalViewViewDef = this.elementUtil.findByNameAndType(containerElement, StandardD
│            optViewDef = Optional.ofNullable(generalViewViewDef);
│        } else if (Objects.equals(SysONRepresentationDescriptionIdentifiers.INTERCONNECTION_VIEW_DI
│            var generalViewViewDef = this.elementUtil.findByNameAndType(containerElement, StandardD
│            optViewDef = Optional.ofNullable(generalViewViewDef);
│        } else if (Objects.equals(SysONRepresentationDescriptionIdentifiers.ACTION_FLOW_VIEW_DIAGRA
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/menu/conte

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/menu/conte
⋮
│@Service
│public class SysONExplorerTreeItemContextMenuEntryProvider implements ITreeItemPaletteCustomizer {
│
⋮
│    @Override
│    public boolean canHandle(IEditingContext editingContext, TreeDescription treeDescription, Tree 
⋮
│    @Override
│    public Palette customize(IEditingContext editingContext, TreeDescription treeDescription, Tree 
⋮
│    public Palette getPalette(IEditingContext editingContext, TreeDescription treeDescription, Tree
│        List<IPaletteEntry> result = new ArrayList<>();
│        if (editingContext instanceof IEMFEditingContext emfEditingContext) {
│            result.addAll(this.getDocumentContextMenuEntries(emfEditingContext, treeItem));
│            result.addAll(this.getObjectContextMenuEntries(emfEditingContext, treeItem));
│            result.addAll(this.getRepresentationContextMenuEntries(emfEditingContext, treeItem));
│            result.addAll(this.getLibraryRelatedEntries(emfEditingContext, treeItem));
│        }
│        if (this.sysonExplorerService.canExpandAll(treeItem, editingContext)) {
│            result.add(new SingleClickTreeItemTool(ExplorerTreeItemContextMenuEntryProvider.EXPAND_
⋮
│    private List<IPaletteEntry> getDocumentContextMenuEntries(IEMFEditingContext editingContext, Tr
│        var optionalResource = this.objectSearchService.getObject(editingContext, treeItem.getId())
│                .filter(Resource.class::isInstance)
│                .map(Resource.class::cast);
│        if (optionalResource.isPresent()) {
│            var resource = optionalResource.get();
│
│            List<IPaletteEntry> entries = new ArrayList<>();
│            if (this.sysonExplorerService.isEditable(resource)) {
│                entries.add(new SingleClickTreeItemTool(ExplorerTreeItemContextMenuEntryProvider.NE
⋮
│    private List<IPaletteEntry> getObjectContextMenuEntries(IEMFEditingContext editingContext, Tree
│        List<IPaletteEntry> entries = new ArrayList<>();
│        var optionalEObject = this.objectSearchService.getObject(editingContext, treeItem.getId())
│                .filter(EObject.class::isInstance)
│                .map(EObject.class::cast);
│        if (optionalEObject.isPresent()) {
│            var object = optionalEObject.get();
│            if (this.sysonExplorerService.isEditable(object)) {
│                entries.add(new SingleClickTreeItemTool(ExplorerTreeItemContextMenuEntryProvider.NE
│                if (this.canHaveNewRepresentation(editingContext, treeItem.getId(), object)) {
⋮
│    private boolean canHaveNewRepresentation(IEMFEditingContext editingContext, String treeItemId, 
│        boolean result = true;
│        if (object instanceof ViewUsage) {
│            Optional<UUID> semanticDataId = new UUIDParser().parse(editingContext.getId());
│            var sysonRepresentationAlreadyExists = this.representationMetadataSearchService
│                    .findAllRepresentationMetadataBySemanticDataAndTargetObjectId(AggregateReferenc
│                    .anyMatch(rm -> SysONRepresentationDescriptionIdentifiers.GENERAL_VIEW_DIAGRAM_
│                            || SysONRepresentationDescriptionIdentifiers.REQUIREMENTS_TABLE_VIEW_DE
│            if (sysonRepresentationAlreadyExists) {
│                result = false;
⋮
│    private boolean canHaveNewExpression(IEMFEditingContext editingContext, EObject object) {
│        return !this.readOnlyObjectPredicate.test(object) && object instanceof Element element && t
│                && !this.metamodelQueryElementService.hasSingleExpressionDefinition(element);
⋮
│    private void addExpressionEditionEntries(List<IPaletteEntry> entries, Element element) {
│        // "Edit expression" on the root Expression element itself; the normal "Delete" operation w
│        // to also add "Delete expression"
│        if (this.metamodelQueryElementService.isTopLevelExpression(element)) {
│            entries.add(new SingleClickTreeItemTool(EDIT_EXPRESSION_MENU_ENTRY_CONTRIBUTION_ID, EDI
│        } else if (this.metamodelQueryElementService.hasSingleExpressionDefinition(element)
│                && !this.metamodelQueryElementService.hasSingleExpressionDefinition(element.getOwne
│            // "Edit expression" and "Delete expression" on the owner of a root Expression element
│            entries.add(new SingleClickTreeItemTool(EDIT_EXPRESSION_MENU_ENTRY_CONTRIBUTION_ID, EDI
│            entries.add(new SingleClickTreeItemTool(DELETE_EXPRESSION_MENU_ENTRY_CONTRIBUTION_ID, D
⋮
│    private List<IPaletteEntry> getRepresentationContextMenuEntries(IEMFEditingContext editingConte
│        var optionalRepresentationMetadata = this.objectSearchService.getObject(editingContext, tre
│                .filter(RepresentationMetadata.class::isInstance)
│                .map(RepresentationMetadata.class::cast);
│        if (optionalRepresentationMetadata.isPresent()) {
│            RepresentationMetadata representationMetadata = optionalRepresentationMetadata.get();
│            if (!SysONRepresentationDescriptionIdentifiers.GENERAL_VIEW_DIAGRAM_DESCRIPTION_ID.equa
│                    && !SysONRepresentationDescriptionIdentifiers.REQUIREMENTS_TABLE_VIEW_DESCRIPTI
│                return List.of(
│                        new SingleClickTreeItemTool(ExplorerTreeItemContextMenuEntryProvider.DUPLIC
⋮
│    private List<IPaletteEntry> getLibraryRelatedEntries(IEMFEditingContext editingContext, TreeIte
│        List<IPaletteEntry> result = new ArrayList<>();
│        var optionalNotifier = this.objectSearchService.getObject(editingContext, treeItem.getId())
│                .filter(Notifier.class::isInstance)
│                .map(Notifier.class::cast);
│
│        if (optionalNotifier.isEmpty()) {
│            optionalNotifier = editingContext.getDomain().getResourceSet().getResources().stream()
│                    .filter(resource -> resource.getURI().toString().contains(treeItem.getId()))
│                    .map(Notifier.class::cast)
⋮
│    private boolean isDirectDependency(IEMFEditingContext emfEditingContext, LibraryMetadataAdapter
│        var editingContextDependencies = new UUIDParser().parse(emfEditingContext.getId())
│                .map(this.semanticDataSearchService::findAllDependenciesIdById)
│                .stream()
│                .flatMap(Collection::stream)
│                .map(AggregateReference::getId)
│                .toList();
│        return this.librarySearchService.findByNamespaceAndNameAndVersion(libraryMetadataAdapter.ge
│                .map(Library::getSemanticData)
│                .map(AggregateReference::getId)
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/reference/
⋮
│@Service
│public class SysONReferenceWidgetModelBrowserTreeDescriptionIdProviderDelegate implements IModelBro
│
│    @Override
│    public boolean canHandle(IEditingContext editingContext, String modelBrowserId) {
⋮
│    @Override
│    public String getModelBrowserTreeDescriptionId(IEditingContext editingContext, String modelBrow
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/reference/
⋮
│@Service
│public class SysONReferenceWidgetModelBrowserTreeDescriptionProvider implements IEditingContextRepr
│
⋮
│    @Override
│    public List<IRepresentationDescription> getRepresentationDescriptions(IEditingContext editingCo
⋮
│    private TreeDescription createDescription(TreeDescription defaultDescription) {
│        return TreeDescription.newTreeDescription(defaultDescription)
│                .id(DESCRIPTION_ID)
│                .hasChildrenProvider(this::hasChildren)
│                .childrenProvider(variableManager -> this.getChildren(defaultDescription, variableM
│                .parentObjectProvider(this::getParentObject)
│                .build();
⋮
│    private boolean hasChildren(VariableManager variableManager) {
│        return !this.applyFilters(variableManager, this.getDefaultChildren(variableManager)).isEmpt
⋮
│    private List<Object> getChildren(TreeDescription defaultDescription, VariableManager variableMa
│        List<? extends Object> defaultChildren = defaultDescription.getChildrenProvider().apply(var
│        return this.applyFilters(variableManager, defaultChildren);
⋮
│    private List<Object> getDefaultChildren(VariableManager variableManager) {
│        Object self = variableManager.getVariables().get(RepresentationVariables.SELF.name());
│        List<Object> children = List.of();
│        if (self instanceof Resource resource) {
│            children = new ArrayList<>(resource.getContents());
│        } else if (self instanceof EObject) {
│            children = this.contentService.getContents(self);
│        }
│        return children;
⋮
│    private List<Object> applyFilters(VariableManager variableManager, List<? extends Object> child
│        return variableManager.get(CoreVariables.EDITING_CONTEXT.name(), IEditingContext.class)
│                .map(editingContext -> this.filterService.applyFilters(editingContext, children, FI
│                .orElseGet(List::of);
⋮
│    private Object getParentObject(VariableManager variableManager) {
│        Object self = variableManager.getVariables().get(RepresentationVariables.SELF.name());
│        Object parent = null;
│        if (self instanceof Element element && element.getOwningMembership() != null) {
│            parent = element.getOwningMembership().eContainer();
│        } else if (self instanceof EObject eObject) {
│            parent = eObject.eContainer();
│        }
│
│        if (parent instanceof Namespace namespace && namespace.eContainer() == null) {
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/services/S
⋮
│@Service
│@Order(Ordered.HIGHEST_PRECEDENCE)
│public class SysONExplorerInitialDirectEditTreeItemLabelProvider implements IInitialDirectEditTreeI
│
⋮
│    @Override
│    public boolean canHandle(Tree tree) {
⋮
│    @Override
│    public IPayload handle(IEditingContext editingContext, Tree tree, InitialDirectEditElementLabel
⋮
│    private Optional<TreeItem> searchById(TreeItem treeItem, String id) {
│        Optional<TreeItem> optionalTreeItem = Optional.empty();
│        if (treeItem.getId().equals(id)) {
│            optionalTreeItem = Optional.of(treeItem);
│        }
│        if (optionalTreeItem.isEmpty() && treeItem.isHasChildren()) {
│            optionalTreeItem = treeItem.getChildren().stream()
│                    .map(treeItems -> this.searchById(treeItems, id))
│                    .filter(Optional::isPresent)
│                    .map(Optional::get).findFirst();
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/services/S
⋮
│@Service
│public class SysONExplorerLabelService implements IExplorerLabelServiceDelegate {
│
⋮
│    @Override
│    public boolean canHandle(Object object) {
⋮
│    @Override
│    public boolean isEditable(Object self) {
⋮
│    @Override
│    public void editLabel(Object self, String newValue) {
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/services/S
⋮
│@Service
│public class SysONExplorerRenderVariablesCustomizer implements IRepresentationRenderVariableCustomi
│
⋮
│    @Override
│    public VariableManager customize(IRepresentationDescription representationDescription, Variable
⋮

backend/views/syson-tree-explorer-view/src/main/java/org/eclipse/syson/tree/explorer/view/services/S
⋮
│@Service
│public class SysONExplorerTreePathProvider implements ITreePathProvider {
│
⋮
│    @Override
│    public boolean canHandle(Tree tree) {
⋮
│    @Override
│    public IPayload handle(IEditingContext editingContext, Tree tree, TreePathInput input) {
⋮
│    private Optional<String> getItemId(IEditingContext editingContext, TreeDescription treeDescript
│        if (treeDescription != null) {
│            var variableManager = new VariableManager();
│            variableManager.put(RepresentationVariables.SELF.name(), object);
│            return Optional.of(treeDescription.getTreeItemIdProvider().apply(variableManager));
│        }
│        return Optional.empty();
⋮
│    private Optional<Object> getTreeItemObject(IEditingContext editingContext, TreeDescription tree
│        if (treeDescription != null) {
│            var variableManager = new VariableManager();
│            variableManager.put(CoreVariables.EDITING_CONTEXT.name(), editingContext);
│            variableManager.put(TreeDescription.ID, id);
│            return Optional.ofNullable(treeDescription.getTreeItemObjectProvider().apply(variableMa
│        }
│        return Optional.empty();
⋮
│    private Optional<TreeDescription> getTreeDescription(IEditingContext editingContext, String des
│        return this.representationDescriptionSearchService.findById(editingContext, descriptionId)
│                .filter(TreeDescription.class::isInstance)
│                .map(TreeDescription.class::cast);
⋮
│    private List<Object> applyFilters(IEditingContext editingContext, List<Object> elements, List<S
│        var alteredElements = new ArrayList<>(elements);
│        if (activeFilterIds.contains(SysONTreeFilterConstants.HIDE_MEMBERSHIPS_TREE_ITEM_FILTER_ID)
│            alteredElements.removeIf(Membership.class::isInstance);
│        }
│        if (activeFilterIds.contains(SysONTreeFilterConstants.HIDE_KERML_STANDARD_LIBRARIES_TREE_FI
│            alteredElements.removeIf(this.filterService::isKerMLStandardLibrary);
│        }
│        if (activeFilterIds.contains(SysONTreeFilterConstants.HIDE_SYSML_STANDARD_LIBRARIES_TREE_FI
│            alteredElements.removeIf(this.filterService::isSysMLStandardLibrary);
⋮

backend/views/syson-tree-explorer-view/src/test/java/org/eclipse/syson/tree/explorer/view/Architectu
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_TREE_EXPLORER_VIEW_ROOT_PACKAGE = "org.eclipse.syson.tree.expl
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_TREE_EXPLORER_VIEW_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/views/syson-tree-explorer-view/src/test/java/org/eclipse/syson/tree/explorer/view/CodingRule
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_TREE_EXPLORER_VIEW_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮

backend/views/syson-tree-explorer-view/src/test/java/org/eclipse/syson/tree/explorer/view/duplicate/
⋮
│public class SysMLContainmentMembershipLabelSwitchTest {
│
│    private final SysMLContainmentMembershipLabelSwitch labelSwitch = new SysMLContainmentMembershi
│
│    @DisplayName("GIVEN a Membership subtype, WHEN computing the user-friendly label, THEN a custom
│    @Test
│    public void checkMembershipSubTypeLabels() {
│        // This test aims to verify that subtype of Membership have a custom label (in case of meta
│        List<EClass> membershipSubtypes = EMFUtils.allContainedObjectOfType(SysmlPackage.eINSTANCE,
│                .filter(eClass -> eClass.getEAllSuperTypes().contains(SysmlPackage.eINSTANCE.getMem
⋮
│    @DisplayName("GIVEN a Membership, WHEN computing the user-friendly label, THEN a custom label i
│    @Test
│    public void checkMembershipLabel() {
⋮

backend/views/syson-tree-explorer-view/src/test/java/org/eclipse/syson/tree/explorer/view/reference/
⋮
│public class SysONReferenceWidgetModelBrowserTreeDescriptionIdProviderDelegateTest {
│
│    /**
│     * Verifies that only Reference Widget model browsers are handled.
│     */
│    @Test
│    @DisplayName("GIVEN a model browser identifier, WHEN it is a reference browser, THEN the custom
│    void handlesReferenceModelBrowsers() {
│        var delegate = new SysONReferenceWidgetModelBrowserTreeDescriptionIdProviderDelegate();
│        IEditingContext editingContext = null;
│
⋮

backend/views/syson-tree-explorer-view/src/test/java/org/eclipse/syson/tree/explorer/view/reference/
⋮
│public class SysONReferenceWidgetModelBrowserTreeDescriptionProviderTest {
│
│    /**
│     * Verifies that only the default Reference Widget description is replaced.
│     */
│    @Test
│    @DisplayName("GIVEN default model browser descriptions, WHEN they are customized, THEN only the
│    void getRepresentationDescriptions() {
│        var defaultProvider = mock(DefaultModelBrowsersTreeDescriptionProvider.class);
│        var contentService = mock(IContentService.class);
⋮
│    @Test
│    @DisplayName("GIVEN a resource or semantic object, WHEN checking children, THEN its filtered ch
│    void hasChildrenUsesFilteredSemanticChildren() {
⋮
│    @Test
│    @DisplayName("GIVEN a membership owned element, WHEN its parent is retrieved, THEN the namespac
│    void parentObjectProviderFlattensMembershipsAndRootNamespaces() {
⋮
│    private VariableManager variableManager(IEditingContext editingContext, Object self) {
│        var variableManager = new VariableManager();
│        variableManager.put(CoreVariables.EDITING_CONTEXT.name(), editingContext);
│        variableManager.put(RepresentationVariables.SELF.name(), self);
│        return variableManager;
⋮
│    private TreeDescription treeDescription(String id, List<?> children) {
│        return TreeDescription.newTreeDescription(id)
│                .label("Reference Widget")
│                .idProvider(variableManager -> id)
│                .treeItemIdProvider(variableManager -> "item")
│                .kindProvider(variableManager -> "kind")
│                .labelProvider(variableManager -> null)
│                .targetObjectIdProvider(variableManager -> null)
│                .parentObjectProvider(variableManager -> null)
│                .treeItemIconURLsProvider(variableManager -> List.of())
⋮
```
