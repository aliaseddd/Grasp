# Repo map: backend/views/syson-table-requirements-view

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/views/syson-table-requirements-view`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/views/syson-table-requirements-view) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 24 files there; aider read the 20 that `syson.aiderignore` leaves in, and the map shows 20 of them, 10 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/views/syson-table-requirements-view/.checkstyle

backend/views/syson-table-requirements-view/.classpath

backend/views/syson-table-requirements-view/.project

backend/views/syson-table-requirements-view/.settings/org.eclipse.core.resources.prefs

backend/views/syson-table-requirements-view/.settings/org.eclipse.jdt.apt.core.prefs

backend/views/syson-table-requirements-view/.settings/org.eclipse.jdt.core.prefs

backend/views/syson-table-requirements-view/.settings/org.eclipse.jdt.ui.prefs

backend/views/syson-table-requirements-view/.settings/org.eclipse.m2e.core.prefs

backend/views/syson-table-requirements-view/.settings/org.springframework.ide.eclipse.prefs

backend/views/syson-table-requirements-view/pom.xml

backend/views/syson-table-requirements-view/src/main/java/org/eclipse/syson/table/requirements/view/
⋮
│@Service
│public class RTVDescriptionProvider implements IViewDescriptionProvider {
│
│    @Override
│    public String getViewId() {
⋮
│    @Override
│    public IRepresentationDescriptionProvider getRepresentationDescriptionProvider() {
⋮

backend/views/syson-table-requirements-view/src/main/java/org/eclipse/syson/table/requirements/view/
⋮
│@Configuration
│public class RTVJavaServiceProvider implements IJavaServiceProvider {
│
│    @Override
│    public List<Class<?>> getServiceClasses(View view) {
⋮

backend/views/syson-table-requirements-view/src/main/java/org/eclipse/syson/table/requirements/view/
⋮
│@Service
│public class RTVTableCreateRequirementToolExecutor implements IToolMenuEntryExecutor {
│
⋮
│    @Override
│    public boolean canExecute(IEditingContext editingContext, TableDescription tableDescription, Ta
⋮
│    @Override
│    public IStatus execute(IEditingContext editingContext, TableDescription tableDescription, Table
│
⋮
│    private ViewUsage getViewUsage(IEditingContext editingContext, Table table) {
│        var objectId = table.getTargetObjectId();
│        var parentObject = this.objectSearchService.getObject(editingContext, objectId);
│        if (parentObject.isPresent()) {
│            var object = parentObject.get();
│            if (object instanceof ViewUsage viewUsage) {
│                return viewUsage;
│            }
│        }
│        return null;
⋮

backend/views/syson-table-requirements-view/src/main/java/org/eclipse/syson/table/requirements/view/
⋮
│public class RTVTableDescriptionProvider implements IRepresentationDescriptionProvider {
│
│    public static final String DESCRIPTION_NAME = "Requirements Table View";
│
│    private final TableBuilders tableBuilders = new TableBuilders();
│
│    private final ViewBuilders viewBuilders = new ViewBuilders();
│
│    @Override
│    public RepresentationDescription create(IColorProvider colorProvider) {
⋮
│    private List<ColumnDescription> createColumns() {
│        List<ColumnDescription> columns = new ArrayList<>();
│
│        var declaredNameColumnDescription = this.tableBuilders.newColumnDescription()
│                .name("RTV-ColumnDescription-DeclaredName")
│                .semanticCandidatesExpression("aql:'DeclaredName'")
│                .headerLabelExpression("DeclaredName")
│                .initialWidthExpression("250")
│                .isResizableExpression(AQLConstants.AQL_TRUE)
│                .isSortableExpression(AQLConstants.AQL_TRUE)
⋮
│    private List<CellDescription> createCells() {
│        List<CellDescription> cells = new ArrayList<>();
│
│        var declaredNameCellDescription = this.tableBuilders.newCellDescription()
│                .name("RTV-CellDescription-DeclaredName")
│                .preconditionExpression("aql:columnTargetObject == 'DeclaredName'")
│                .valueExpression("aql:self.declaredName")
│                .cellWidgetDescription(this.tableBuilders.newCellTextfieldWidgetDescription()
│                        .body(this.viewBuilders.newSetValue()
│                                .featureName("declaredName")
⋮
│    private List<RowContextMenuEntry> createContextMenuEntries() {
│        List<RowContextMenuEntry> entries = new ArrayList<>();
│
│        var removeContextMenuEntry = this.tableBuilders.newRowContextMenuEntry()
│                .name("RTV-ContextMenuEntry-RemoveRequirement")
│                .labelExpression("Delete from table")
│                .iconURLExpression("/images/graphicalDelete.svg")
│                .body(this.viewBuilders.newChangeContext()
│                        .expression(ServiceMethod.of2(RTVMutationServices::removeFromExposedElement
│                        .build())
⋮

backend/views/syson-table-requirements-view/src/main/java/org/eclipse/syson/table/requirements/view/
⋮
│@Service
│public class RTVTableImportExistingRequirementsToolExecutor implements IToolMenuEntryExecutor {
│
⋮
│    @Override
│    public boolean canExecute(IEditingContext editingContext, TableDescription tableDescription, Ta
⋮
│    @Override
│    public IStatus execute(IEditingContext editingContext, TableDescription tableDescription, Table
│
⋮
│    private ViewUsage getViewUsage(IEditingContext editingContext, Table table) {
│        var objectId = table.getTargetObjectId();
│        var parentObject = this.objectSearchService.getObject(editingContext, objectId);
│        if (parentObject.isPresent()) {
│            var object = parentObject.get();
│            if (object instanceof ViewUsage viewUsage) {
│                return viewUsage;
│            }
│        }
│        return null;
⋮
│    private void exposeRequirements(IEditingContext editingContext, ViewUsage viewUsage) {
│        var owningNamespace = viewUsage.getOwningNamespace();
│        owningNamespace.getOwnedMember().stream()
│                .filter(RequirementUsage.class::isInstance)
│                .map(RequirementUsage.class::cast)
│                .flatMap(this::flattenRequirements)
│                .forEach(requirementUsage -> this.addExposedRequirement(viewUsage, requirementUsage
⋮
│    private Stream<RequirementUsage> flattenRequirements(RequirementUsage requirementUsage) {
│        return Stream.concat(
│                Stream.of(requirementUsage),
│                this.getRequirementChildren(requirementUsage).stream().flatMap(this::flattenRequire
│        );
⋮
│    private List<RequirementUsage> getRequirementChildren(RequirementUsage requirementUsage) {
│        return requirementUsage.getOwnedMember().stream()
│                .filter(RequirementUsage.class::isInstance)
│                .map(RequirementUsage.class::cast)
│                .toList();
⋮
│    private void addExposedRequirement(ViewUsage viewUsage, RequirementUsage requirementUsage) {
│        if (!viewUsage.getExposedElement().contains(requirementUsage)) {
│            var membershipExpose = SysmlFactory.eINSTANCE.createMembershipExpose();
│            viewUsage.getOwnedRelationship().add(membershipExpose);
│            new ElementInitializerSwitch().doSwitch(membershipExpose);
│            membershipExpose.setImportedMembership(requirementUsage.getOwningMembership());
│        }
⋮

backend/views/syson-table-requirements-view/src/main/java/org/eclipse/syson/table/requirements/view/
⋮
│@Service
│public class RTVTableToolMenuEntriesProvider implements IToolMenuEntriesProvider {
│
⋮
│    @Override
│    public boolean canHandle(IEditingContext editingContext, Table table, TableDescription tableDes
⋮
│    @Override
│    public List<ToolMenuEntry> getToolMenuEntries(IEditingContext editingContext, Table table, Tabl
⋮

backend/views/syson-table-requirements-view/src/main/java/org/eclipse/syson/table/requirements/view/
⋮
│public class RTVMutationServices {
│
│    private final IObjectSearchService objectSearchService;
│
│    private final DeleteService deleteService;
│
│    public RTVMutationServices(IObjectSearchService objectSearchService) {
│        this.objectSearchService = Objects.requireNonNull(objectSearchService);
│        this.deleteService = new DeleteService();
│    }
│
│    public boolean removeFromExposedElements(RequirementUsage requirementUsage, IEditingContext edi
│        var viewUsage = this.getViewUsage(editingContext, siriusTable);
│        if (viewUsage != null) {
│            if (viewUsage.getExposedElement().contains(requirementUsage)) {
│                List<MembershipExpose> membershipsExposed = viewUsage.getOwnedRelationship().stream
│                        .filter(MembershipExpose.class::isInstance)
│                        .map(MembershipExpose.class::cast)
│                        .filter(membershipExposed -> Objects.equals(membershipExposed.getImportedEl
│                        .toList();
│                var iterator = membershipsExposed.iterator();
⋮
│    private ViewUsage getViewUsage(IEditingContext editingContext, Table table) {
│        var tableTargetObjectId = table.getTargetObjectId();
│        return this.objectSearchService.getObject(editingContext, tableTargetObjectId).stream()
│                .filter(ViewUsage.class::isInstance)
│                .map(ViewUsage.class::cast)
│                .findFirst()
│                .orElse(null);
⋮
│    public boolean editDocumentation(RequirementUsage requirementUsage, String newValue) {
│        Documentation documentation = requirementUsage.getDocumentation().stream()
│                .findFirst()
│                .orElse(null);
│        if (documentation != null) {
│            documentation.setBody(newValue);
│        } else {
│            var newDocumentation = SysmlFactory.eINSTANCE.createDocumentation();
│            newDocumentation.setBody(newValue);
│            var owningMembership = SysmlFactory.eINSTANCE.createOwningMembership();
⋮
│    public boolean createRequirement(ViewUsage viewUsage) {
│        var owningNamespace = viewUsage.getOwningNamespace();
│        return this.createRequirement(owningNamespace, viewUsage) != null;
⋮
│    private RequirementUsage createRequirement(Element parent, ViewUsage viewUsage) {
│        RequirementUsage newRequirementUsage = SysmlFactory.eINSTANCE.createRequirementUsage();
│        Optional<EClass> optMembershipEClass = new GetIntermediateContainerCreationSwitch(parent).d
│        if (optMembershipEClass.isPresent()) {
│            var newMembership = SysmlFactory.eINSTANCE.create(optMembershipEClass.get());
│            if (newMembership instanceof Membership membership) {
│                var elementInitializerSwitch = new ElementInitializerSwitch();
│                parent.getOwnedRelationship().add(membership);
│                membership.getOwnedRelatedElement().add(newRequirementUsage);
│                elementInitializerSwitch.doSwitch(newRequirementUsage);
⋮
│    public RequirementUsage createNestedRequirement(RequirementUsage parent, IEditingContext editin
│        var viewUsage = this.getViewUsage(editingContext, table);
│        if (viewUsage != null) {
│            return this.createRequirement(parent, viewUsage);
│        }
│        return null;
⋮

backend/views/syson-table-requirements-view/src/main/java/org/eclipse/syson/table/requirements/view/
⋮
│public class RTVQueryServices {
│
│    private final Logger logger = LoggerFactory.getLogger(RTVQueryServices.class);
│
│    private final ObjectMapper objectMapper;
│
│    private final IIdentityService identityService;
│
│    public RTVQueryServices(ObjectMapper objectMapper, IIdentityService identityService) {
│        this.objectMapper = objectMapper;
⋮
│    public List<RequirementUsage> getExposedRequirements(ViewUsage viewUsage, List<String> expanded
│        var allExposedRequirementUsages = viewUsage.getExposedElement().stream()
│                .filter(RequirementUsage.class::isInstance)
│                .map(RequirementUsage.class::cast)
│                .filter(eObject -> this.hasExpandedParent(eObject, expandedIds, expandAll))
│                .toList();
│        // exposed element in ViewUsage are not in correct order to by displayed in the hierarchica
│        // we have to sort them by depth first order
│        return allExposedRequirementUsages.stream()
│                .sorted(this.byDepthFirstOrder(allExposedRequirementUsages))
⋮
│    private Comparator<RequirementUsage> byDepthFirstOrder(List<RequirementUsage> requirements) {
│        // 1. Identify requirements that are children of another RequirementUsage
│        Set<RequirementUsage> isChild = Collections.newSetFromMap(new IdentityHashMap<>());
│        requirements.forEach(e -> isChild.addAll(this.getChildren(e)));
│
│        // 2. Roots = requirements that are not children of anyone
│        List<RequirementUsage> roots = requirements.stream()
│                .filter(e -> !isChild.contains(e))
│                .toList();
│
⋮
│    private void depthFirstPositions(RequirementUsage requirementUsage, Map<RequirementUsage, Integ
│        positions.put(requirementUsage, index[0]++);
│        for (RequirementUsage child : this.getChildren(requirementUsage)) {
│            this.depthFirstPositions(child, positions, index);
│        }
⋮
│    private List<RequirementUsage> getChildren(RequirementUsage elem) {
│        return elem.getOwnedMember().stream()
│                .filter(RequirementUsage.class::isInstance)
│                .map(RequirementUsage.class::cast)
│                .toList();
⋮
│    private boolean hasExpandedParent(EObject eObject, List<String> expandedIds, boolean expandAll)
│        EObject parent = eObject.eContainer().eContainer();
│        if (!expandAll && parent != null && !this.isRootRequirement(eObject)) {
│            var parentId = this.identityService.getId(parent);
│            return expandedIds.contains(parentId) && this.hasExpandedParent(parent, expandedIds, fa
│        }
│        return true;
⋮
│    public boolean hasRequirementChildren(RequirementUsage requirementUsage) {
│        return requirementUsage.getOwnedMember().stream().anyMatch(RequirementUsage.class::isInstan
⋮
│    public int getRequirementDepthLevel(RequirementUsage requirementUsage) {
│        if (this.isRootRequirement(requirementUsage)) {
│            return 0;
│        } else {
│            return this.getRequirementDepthLevel((RequirementUsage) requirementUsage.getOwner()) + 
│        }
⋮
│    private boolean isRootRequirement(EObject eObject) {
│        return eObject instanceof RequirementUsage requirementUsage && !(requirementUsage.getOwner(
⋮
│    public String getDocumentationBody(RequirementUsage requirementUsage) {
│        return requirementUsage.getDocumentation().stream()
│                .map(Documentation::getBody)
│                .findFirst()
│                .orElse("");
⋮
│    public List<RequirementUsage> sortAndFilterRequirements(List<Object> objects, List<ColumnSort> 
│        var requirementsElements = objects.stream().filter(RequirementUsage.class::isInstance).map(
│        this.filterRequirements(columnFilters, globalFilterData, requirementsElements);
│        this.sortRequirements(columnSort, requirementsElements);
│        return requirementsElements;
⋮
│    private void filterRequirements(List<ColumnFilter> columnFilters, String globalFilterData, List
│        if (globalFilterData != null && !globalFilterData.isBlank()) {
│            requirementsElements.removeIf(r -> !this.isValidGlobalFilterCandidate(r, globalFilterDa
│        }
│        for (ColumnFilter columnFilter : columnFilters) {
│            if ("DeclaredName".equals(columnFilter.id())) {
│                requirementsElements.removeIf(r -> !this.isValidColumnFilterCandidate(r.getDeclared
│            } else if ("ReqId".equals(columnFilter.id())) {
│                requirementsElements.removeIf(r -> !this.isValidColumnFilterCandidate(r.getReqId(),
│            } else if ("Documentation".equals(columnFilter.id())) {
⋮
│    private void sortRequirements(List<ColumnSort> columnSort, List<RequirementUsage> requirementsE
│        for (ColumnSort colSort : columnSort) {
│            if ("DeclaredName".equals(colSort.id())) {
│                if (colSort.desc()) {
│                    requirementsElements.sort(Comparator.comparing(RequirementUsage::getDeclaredNam
│                } else {
│                    requirementsElements.sort(Comparator.comparing(RequirementUsage::getDeclaredNam
│                }
│            } else if ("ReqId".equals(colSort.id())) {
│                if (colSort.desc()) {
⋮
│    private boolean isValidColumnFilterCandidate(String candidate, ColumnFilter columnFilter) {
│        var isValid = true;
│        try {
│            JavaType javaType = objectMapper.getTypeFactory().constructType(String.class);
│            String filterValue = this.objectMapper.readValue(columnFilter.value(), javaType);
│            isValid = candidate != null && candidate.contains(filterValue);
│        } catch (JacksonException exception) {
│            this.logger.warn(exception.getMessage(), exception);
│        }
│        return isValid;
⋮
│    private boolean isValidGlobalFilterCandidate(RequirementUsage requirementUsage, String globalFi
│        boolean isValid = false;
│        // check declaredName
│        if (requirementUsage.getDeclaredName() != null && requirementUsage.getDeclaredName().contai
│            isValid = true;
│        }
│        // check reqId
│        if (!isValid && requirementUsage.getReqId() != null && requirementUsage.getReqId().contains
│            isValid = true;
│        }
⋮

backend/views/syson-table-requirements-view/src/test/java/org/eclipse/syson/table/requirements/view/
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_TABLE_REQUIREMENTS_VIEW_ROOT_PACKAGE = "org.eclipse.syson.tabl
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_TABLE_REQUIREMENTS_VIEW_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/views/syson-table-requirements-view/src/test/java/org/eclipse/syson/table/requirements/view/
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_TABLE_REQUIREMENTS_VIEW_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮
```
