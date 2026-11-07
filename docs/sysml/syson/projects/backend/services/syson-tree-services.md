# Repo map: backend/services/syson-tree-services

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/services/syson-tree-services`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/services/syson-tree-services) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 51 files there; aider read the 47 that `syson.aiderignore` leaves in, and the map shows 26 of them, 26 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/filters/SysONTree
⋮
│public class SysONTreeFilterConstants {
│
│    public static final String HIDE_MEMBERSHIPS_TREE_ITEM_FILTER_ID = UUID.nameUUIDFromBytes("SysON
│
│    public static final String HIDE_KERML_STANDARD_LIBRARIES_TREE_FILTER_ID = UUID.nameUUIDFromByte
│
│    public static final String HIDE_SYSML_STANDARD_LIBRARIES_TREE_FILTER_ID = UUID.nameUUIDFromByte
│
│    public static final String HIDE_USER_LIBRARIES_TREE_FILTER_ID = UUID.nameUUIDFromBytes("SysONTr
│
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/fragments/KerMLSt
⋮
│public class KerMLStandardLibraryDirectory implements ISysONExplorerFragment {
│
│    private final String id = UUID.nameUUIDFromBytes("SysON_KerML_Directory".getBytes()).toString()
│
│    private final Object parent;
│
│    private final ISysONExplorerFilterService filterService;
│
│    public KerMLStandardLibraryDirectory(Object parent, ISysONExplorerFilterService filterService) 
│        this.parent = Objects.requireNonNull(parent);
⋮
│    @Override
│    public String getLabel() {
⋮
│    @Override
│    public List<String> getIconURL() {
⋮
│    @Override
│    public boolean hasChildren(IEditingContext editingContext, List<RepresentationMetadata> existin
⋮
│    @Override
│    public List<Object> getChildren(IEditingContext editingContext, List<RepresentationMetadata> ex
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/fragments/Librari
⋮
│public class LibrariesDirectory implements ISysONExplorerFragment {
│
│    public static final String LIBRARIES_DIRECTORY_ID = UUID.nameUUIDFromBytes("SysON_Libraries_Dir
│
│    private final String label;
│
│    private final Object parent;
│
│    private final ISysONExplorerFilterService filterService;
│
⋮
│    @Override
│    public String getLabel() {
⋮
│    @Override
│    public Object getParent() {
⋮
│    @Override
│    public List<String> getIconURL() {
⋮
│    @Override
│    public boolean hasChildren(IEditingContext editingContext, List<RepresentationMetadata> existin
⋮
│    @Override
│    public List<Object> getChildren(IEditingContext editingContext, List<RepresentationMetadata> ex
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/fragments/SysMLSt
⋮
│public class SysMLStandardLibraryDirectory implements ISysONExplorerFragment {
│
│    private final String id = UUID.nameUUIDFromBytes("SysON_SysML_Directory".getBytes()).toString()
│
│    private final Object parent;
│
│    private final ISysONExplorerFilterService filterService;
│
│    public SysMLStandardLibraryDirectory(Object parent, ISysONExplorerFilterService filterService) 
│        this.parent = Objects.requireNonNull(parent);
⋮
│    @Override
│    public String getLabel() {
⋮
│    @Override
│    public Object getParent() {
⋮
│    @Override
│    public List<String> getIconURL() {
⋮
│    @Override
│    public boolean hasChildren(IEditingContext editingContext, List<RepresentationMetadata> existin
⋮
│    @Override
│    public List<Object> getChildren(IEditingContext editingContext, List<RepresentationMetadata> ex
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/fragments/UserLib
⋮
│public class UserLibrariesDirectory implements ISysONExplorerFragment {
│
│    public static final String USER_LIBRARIES_DIRECTORY_ID = UUID.nameUUIDFromBytes("SysON_User_Lib
│
│    private final String label;
│
│    private final Object parent;
│
│    private final ISysONExplorerFilterService filterService;
│
⋮
│    @Override
│    public String getLabel() {
⋮
│    @Override
│    public Object getParent() {
⋮
│    @Override
│    public List<String> getIconURL() {
⋮
│    @Override
│    public boolean hasChildren(IEditingContext editingContext, List<RepresentationMetadata> existin
⋮
│    @Override
│    public List<Object> getChildren(IEditingContext editingContext, List<RepresentationMetadata> ex
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/services/Composed
⋮
│@Service
│public class ComposedSysONExplorerService implements ISysONExplorerService {
│
⋮
│    @Override
│    public String getLabel(Object self) {
⋮
│    @Override
│    public boolean hasChildren(Object self, IEditingContext editingContext, List<RepresentationMeta
⋮
│    @Override
│    public List<Object> getChildren(Object self, IEditingContext editingContext, List<Representatio
⋮
│    @Override
│    public boolean canExpandAll(TreeItem treeItem, IEditingContext editingContext) {
⋮
│    @Override
│    public boolean canCreateNewObjectsFromText(Object self) {
⋮
│    private Optional<ISysONExplorerServiceDelegate> getDelegate(Object object) {
│        return this.explorerServiceDelegate.stream()
│                .filter(delegate -> delegate.canHandle(object))
│                .findFirst();
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/services/SysONDef
⋮
│@Service
│public class SysONDefaultExplorerServices implements ISysONDefaultExplorerService {
│
⋮
│    @Override
│    public String getLabel(Object self) {
⋮
│    private String getFallbackLabel(Object self) {
│        StyledString styledLabel = this.labelService.getStyledLabel(self);
│        if (styledLabel != null) {
│            return styledLabel.toString();
│        }
│        return "";
⋮
│    @Override
│    public boolean hasChildren(Object self, IEditingContext editingContext, List<RepresentationMeta
⋮
│    private boolean hasRepresentation(EObject self, IEditingContext editingContext) {
│        var optionalSemanticDataId = new UUIDParser().parse(editingContext.getId());
│        if (optionalSemanticDataId.isPresent()) {
│            String id = this.identityService.getId(self);
│            return this.representationMetadataSearchService.existAnyRepresentationMetadataForSemant
│        }
│        return false;
⋮
│    @Override
│    public List<Object> getChildren(Object self, IEditingContext editingContext, List<Representatio
⋮
│    @Override
│    public boolean canExpandAll(TreeItem treeItem, IEditingContext editingContext) {
⋮
│    @Override
│    public boolean canCreateNewObjectsFromText(Object self) {
⋮
│    @Override
│    public Object getParent(Object self, String treeItemId, IEditingContext editingContext) {
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/services/SysONExp
⋮
│@Service
│public class SysONExplorerFilterService implements ISysONExplorerFilterService {
│
⋮
│    @Override
│    public boolean isKerMLStandardLibrary(Object object) {
⋮
│    @Override
│    public boolean isSysMLStandardLibrary(Object object) {
⋮
│    @Override
│    public boolean isUserLibrary(IEditingContext editingContext, Object object) {
⋮
│    private boolean containsOnlyLibraryPackages(Resource resource) {
│        var namespaces = resource.getContents().stream()
│                .filter(Namespace.class::isInstance)
│                .map(Namespace.class::cast)
│                .filter(this.utilService::isRootNamespace)
│                .flatMap(namespace -> namespace.getOwnedElement().stream()
│                        .filter(Namespace.class::isInstance))
│                .toList();
│        return !namespaces.isEmpty() && namespaces.stream().allMatch(LibraryPackage.class::isInstan
⋮
│    @Override
│    public List<Object> hideKerMLStandardLibraries(List<Object> elements) {
⋮
│    @Override
│    public List<Object> hideSysMLStandardLibraries(List<Object> elements) {
⋮
│    @Override
│    public List<Object> hideUserLibraries(IEditingContext editingContext, List<Object> elements) {
⋮
│    @Override
│    public List<Object> hideMemberships(List<Object> elements) {
⋮
│    @Override
│    public List<Object> hideRootNamespace(List<Object> elements) {
⋮
│    @Override
│    public List<Object> hideExposeElements(List<Object> elements) {
⋮
│    @Override
│    public List<Object> hideExpressionInternals(List<Object> elements) {
⋮
│    @Override
│    public List<Object> applyFilters(IEditingContext editingContext, List<?> elements, List<String>
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/services/api/ISys
⋮
│public interface ISysONDefaultExplorerService {
│
│    String getTreeItemId(Object self);
│
│    String getTreeItemTooltip(Object self);
│
│    String getKind(Object self);
│
│    String getLabel(Object self);
│
⋮
│    boolean hasChildren(Object self, IEditingContext editingContext, List<RepresentationMetadata> e
│
│    List<Object> getChildren(Object self, IEditingContext editingContext, List<RepresentationMetada
│
│    boolean canExpandAll(TreeItem treeItem, IEditingContext editingContext);
│
│    boolean canCreateNewObjectsFromText(Object self);
│
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/services/api/ISys
⋮
│public interface ISysONExplorerFilterService {
│
│    boolean isKerMLStandardLibrary(Object object);
│
│    boolean isSysMLStandardLibrary(Object object);
│
│    boolean isUserLibrary(IEditingContext editingContext, Object object);
│
│    List<Object> hideKerMLStandardLibraries(List<Object> elements);
│
│    List<Object> hideSysMLStandardLibraries(List<Object> elements);
│
│    List<Object> hideUserLibraries(IEditingContext editingContext, List<Object> elements);
│
│    List<Object> hideMemberships(List<Object> elements);
│
│    List<Object> hideRootNamespace(List<Object> elements);
│
│    List<Object> hideExposeElements(List<Object> elements);
│
│    List<Object> hideExpressionInternals(List<Object> elements);
│
│    List<Object> applyFilters(IEditingContext editingContext, List<?> elements, List<String> active
│
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/services/api/ISys
⋮
│public interface ISysONExplorerFragment {
│
│    String getId();
│
│    String getTooltip();
│
│    String getLabel();
│
│    String getKind();
│
⋮
│    List<String> getIconURL();
│
│    boolean hasChildren(IEditingContext editingContext, List<RepresentationMetadata> existingRepres
│
│    List<Object> getChildren(IEditingContext editingContext, List<RepresentationMetadata> existingR
│
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/services/api/ISys
⋮
│public interface ISysONExplorerService {
│
│    String getTreeItemId(Object self);
│
│    String getTreeItemTooltip(Object self);
│
│    String getKind(Object self);
│
│    String getLabel(Object self);
│
⋮
│    Object getParent(Object self, String treeItemId, IEditingContext editingContext);
│
│    boolean hasChildren(Object self, IEditingContext editingContext, List<RepresentationMetadata> e
│
│    List<Object> getChildren(Object self, IEditingContext editingContext, List<RepresentationMetada
│
│    boolean canExpandAll(TreeItem treeItem, IEditingContext editingContext);
│
│    boolean canCreateNewObjectsFromText(Object self);
│
⋮
│    class NoOp implements ISysONExplorerService {
│
│        @Override
│        public String getTreeItemId(Object self) {
│            return "";
│        }
│
│        @Override
│        public String getTreeItemTooltip(Object self) {
│            return "";
⋮
│        @Override
│        public String getLabel(Object self) {
⋮
│        @Override
│        public Object getParent(Object self, String treeItemId, org.eclipse.sirius.components.core.
⋮
│        @Override
│        public boolean hasChildren(Object self, org.eclipse.sirius.components.core.api.IEditingCont
⋮
│        @Override
│        public List<Object> getChildren(Object self, org.eclipse.sirius.components.core.api.IEditin
⋮
│        @Override
│        public boolean canExpandAll(TreeItem treeItem, org.eclipse.sirius.components.core.api.IEdit
⋮
│        @Override
│        public boolean canCreateNewObjectsFromText(Object self) {
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/explorer/services/api/ISys
⋮
│public interface ISysONExplorerServiceDelegate {
│
│    boolean canHandle(Object self);
│
│    String getTreeItemId(Object self);
│
│    String getTreeItemTooltip(Object self);
│
│    String getKind(Object self);
│
│    String getLabel(Object self);
│
⋮
│    boolean hasChildren(Object self, IEditingContext editingContext, List<RepresentationMetadata> e
│
│    List<Object> getChildren(Object self, IEditingContext editingContext, List<RepresentationMetada
│
│    boolean canExpandAll(TreeItem treeItem, IEditingContext editingContext);
│
│    boolean canCreateNewObjectsFromText(Object self);
│
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/impactanalysis/services/Sy
⋮
│@Service
│public class SysONChangeDescriptionDataTreeProvider implements IChangeDescriptionDataTreeProviderDe
│
⋮
│    private List<DataTreeNode> createResourceDataTreeNodes(IEditingContext editingContext, Resource
│        List<DataTreeNode> result = new ArrayList<>();
│        // We need to add a suffix to the ids to ensure they remain unique in case we display 2 res
│        // ID. This is for example the case when updating a library, where both the old and new ver
│        // same ID.
│        String idSuffix = "#" + changeKind.getName();
│        String resourceId = this.identityService.getId(resource) + idSuffix;
│        String resourceLabel = this.labelService.getStyledLabel(resource) + this.getLibraryLabelFra
│        Optional<StyledString> optionalStyledString = this.getResourceNodeStyledString(resourceLabe
│        Optional<List<List<String>>> optionalEndIconsURLs = this.getResourceNodeEndIconsURLs(change
⋮
│    private List<DataTreeNode> createResourceChangeContentDataTreeNode(IEditingContext editingConte
│        List<DataTreeNode> result = new ArrayList<>();
│        String idSuffix = "#" + changeKind.getName();
│        String objectId = this.identityService.getId(object) + idSuffix;
│        String objectLabel = this.labelService.getStyledLabel(object).toString();
│        Optional<StyledString> optionalStyledString = this.getResourceNodeStyledString(objectLabel,
│        Optional<List<List<String>>> optionalEndIconsURLs = this.getResourceNodeEndIconsURLs(change
│        if (optionalStyledString.isPresent() && optionalEndIconsURLs.isPresent()) {
│            result.add(new DataTreeNode(objectId, this.identityService.getId(parent) + idSuffix, op
│            List<Object> children = this.filterService.applyFilters(editingContext, this.contentSer
⋮
│    private Optional<StyledString> getResourceNodeStyledString(String label, ChangeKind changeKind)
│        Optional<StyledString> result = Optional.empty();
│        if (changeKind == ChangeKind.ADD_LITERAL) {
│            result = Optional.of(this.getDeletionStyledString(label));
│        } else if (changeKind == ChangeKind.REMOVE_LITERAL) {
│            result = Optional.of(this.getAdditionStyledString(label));
│        }
│        return result;
⋮
│    private Optional<List<List<String>>> getResourceNodeEndIconsURLs(ChangeKind changeKind) {
│        Optional<List<List<String>>> result = Optional.empty();
│        if (changeKind == ChangeKind.ADD_LITERAL) {
│            result = Optional.of(this.getDeletionEndIconsURLs());
│        } else if (changeKind == ChangeKind.REMOVE_LITERAL) {
│            result = Optional.of(this.getAdditionEndIconsURLs());
│        }
│        return result;
⋮
│    private List<DataTreeNode> getObjectChangeDataTreeNode(IEditingContext editingContext, Object o
│        List<DataTreeNode> result = new ArrayList<>();
│        String objectId = this.getId(object);
│        if (this.isFeatureChange(object)
│                || allImpactObjectIds.contains(objectId)) {
│            result.add(new DataTreeNode(objectId, this.getId(parent), this.getStyledLabel(object), 
│            List<Object> children = this.getChildren(editingContext, object, changeDescription);
│            for (Object child : children) {
│                result.addAll(this.getObjectChangeDataTreeNode(editingContext, child, object, chang
│            }
⋮
│    private boolean isFeatureChange(Object object) {
│        return object instanceof FeatureAddition
│                || object instanceof FeatureDeletion
│                || object instanceof FeatureModification;
⋮
│    private List<String> getIconURLs(Object object) {
│        List<String> result = List.of();
│        if (this.isFeatureChange(object)) {
│            if (object instanceof FeatureAddition featureAddition) {
│                result = this.labelService.getImagePaths(featureAddition.newValue());
│            } else if (object instanceof FeatureDeletion featureDeletion) {
│                result = this.labelService.getImagePaths(featureDeletion.oldValue());
│            } else if (object instanceof FeatureModification featureModification) {
│                result = this.labelService.getImagePaths(featureModification.newValue());
│            }
⋮
│    private StyledString getStyledLabel(Object object) {
│        final StyledString result;
│        if (this.isFeatureChange(object)) {
│            String label = "";
│            if (object instanceof FeatureAddition featureAddition) {
│                label = featureAddition.feature() + FEATURE_SEPARATOR + this.getFeatureObjectLabel(
│                result = this.getAdditionStyledString(label);
│            } else if (object instanceof FeatureDeletion featureDeletion) {
│                label = featureDeletion.feature() + FEATURE_SEPARATOR + this.getFeatureObjectLabel(
│                result = this.getDeletionStyledString(label);
⋮
│    private StyledString getAdditionStyledString(String label) {
│        return this.getStyledString(label, "#48752C");
⋮
│    private StyledString getDeletionStyledString(String label) {
│        return this.getStyledString(label, "#BB271A");
⋮
│    private StyledString getStyledString(String label, String foregroundColor) {
│        return new StyledString(List.of(
│                new StyledStringFragment(label, StyledStringFragmentStyle.newDefaultStyledStringFra
│                        .foregroundColor(foregroundColor)
│                        .build())
│        ));
⋮
│    private String getFeatureObjectLabel(Object object) {
│        String result;
│        if (object instanceof EObject) {
│            result = this.labelService.getStyledLabel(object).toString();
│        } else {
│            result = object.toString();
│        }
│        return result;
⋮
│    private List<List<String>> getAdditionEndIconsURLs() {
│        return List.of(List.of("/impact-analysis/FeatureAddition.svg"));
⋮
│    private List<List<String>> getDeletionEndIconsURLs() {
│        return List.of(List.of("/impact-analysis/FeatureDeletion.svg"));
⋮
│    private List<Object> getChildren(IEditingContext editingContext, Object object, ChangeDescripti
│        List<Object> children = new ArrayList<>();
│        for (Map.Entry<EObject, EList<FeatureChange>> changes : changeDescription.getObjectChanges(
│            if (changes.getKey().equals(object)) {
│                for (FeatureChange featureChange : changes.getValue()) {
│                    children.addAll(this.getChildren(changes.getKey(), featureChange));
│                }
│            }
│        }
│        children.addAll(this.filterService.applyFilters(editingContext, this.contentService.getCont
⋮
│    private List<Object> getChildren(EObject changedEObject, FeatureChange featureChange) {
│        final List<Object> children;
│        if (featureChange.getFeature().isMany()) {
│            children = this.getChildrenForMultiValuedFeatureChange(changedEObject, featureChange);
│        } else {
│            children = this.getChildrenForSingleValuedFeatureChange(changedEObject, featureChange);
│        }
│        return children;
⋮
│    private List<String> getDefaultFilters() {
│        return List.of(SysONTreeFilterConstants.HIDE_MEMBERSHIPS_TREE_ITEM_FILTER_ID,
│                SysONTreeFilterConstants.HIDE_KERML_STANDARD_LIBRARIES_TREE_FILTER_ID,
│                SysONTreeFilterConstants.HIDE_SYSML_STANDARD_LIBRARIES_TREE_FILTER_ID,
│                SysONTreeFilterConstants.HIDE_ROOT_NAMESPACES_ID,
│                SysONTreeFilterConstants.HIDE_EXPOSE_ELEMENTS_TREE_ITEM_FILTER_ID,
│                SysONTreeFilterConstants.HIDE_EXPRESSION_INTERNALS_ID);
⋮
│    private List<?> getFeatureAsList(EObject eObject, EStructuralFeature eStructuralFeature) {
│        List<?> result = List.of();
│        Object featureValue = eObject.eGet(eStructuralFeature);
│        if (featureValue instanceof List<?>) {
│            result = (List<?>) featureValue;
│        }
│        return result;
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/selectiondialog/services/S
⋮
│@Service
│public class SysONSelectionDialogFragmentIdentityService implements IIdentityServiceDelegate {
│
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/selectiondialog/services/S
⋮
│@Service
│public class SysONSelectionDialogFragmentLabelService implements ILabelServiceDelegate {
│
⋮
│    @Override
│    public StyledString getStyledLabel(Object object) {
⋮
│    @Override
│    public List<String> getImagePaths(Object object) {
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/services/TreeQuerySelectio
⋮
│@Service
│public class TreeQuerySelectionDialogService {
│
⋮
│    public List<Object> getSelectionDialogElements(IEditingContext editingContext, List<EClassifier
│        var elementsContainingClassifiers = new ArrayList<>();
│        List<Object> elements = this.sysONExplorerService.getElements(editingContext, SELECTION_DIA
│        for (Object rootElement : elements) {
│            if (rootElement instanceof Resource resource && this.containsDirectlyOrIndirectlyInstan
│                elementsContainingClassifiers.add(resource);
│            } else if (rootElement instanceof ISysONExplorerFragment fragment) {
│                elementsContainingClassifiers.add(fragment);
│            }
│        }
│
⋮
│    public List<? extends Object> getSelectionDialogChildren(Object selectionDialogTreeElement, IEd
│        final List<? extends Object> result;
│
│        if (selectionDialogTreeElement instanceof Resource resource) {
│            result = this.filterService.applyFilters(editingContext, resource.getContents(), SELECT
│                    .filter(content -> candidates.stream().anyMatch(eClassifier -> eClassifier.isIn
│                    .toList();
│        } else if (selectionDialogTreeElement instanceof Element sysmlElement) {
│            List<Membership> memberships = sysmlElement.getOwnedRelationship().stream()
│                    .filter(Membership.class::isInstance)
⋮
│    private boolean containsDirectlyOrIndirectlyInstancesOf(Object object, List<EClassifier> eClass
│        boolean containsInstances = false;
│        if (object instanceof Resource resource) {
│            containsInstances = this.containsDirectlyOrIndirectlyInstancesOf(resource, eClassifiers
│        } else if (object instanceof EObject eObject) {
│            containsInstances = this.containsDirectlyOrIndirectlyInstancesOf(eObject, eClassifiers)
│        }
│        return containsInstances;
⋮
│    private boolean containsDirectlyOrIndirectlyInstancesOf(Resource resource, List<EClassifier> eC
│        boolean found = false;
│        final Iterator<EObject> allContents = resource.getAllContents();
│        while (!found && allContents.hasNext()) {
│            var eObject = allContents.next();
│            for (EClassifier it : eClassifiers) {
│                found = it.isInstance(eObject);
│                if (found) {
│                    break;
│                }
⋮
│    private boolean containsDirectlyOrIndirectlyInstancesOf(EObject eObject, List<EClassifier> eCla
│        boolean found = false;
│        final Iterator<EObject> allContents = eObject.eAllContents();
│        while (!found && allContents.hasNext()) {
│            var content = allContents.next();
│            for (EClassifier it : eClassifiers) {
│                found = it.isInstance(content);
│                if (found) {
│                    break;
│                }
⋮
│    private String getResourceName(Resource resource) {
│        return resource.eAdapters().stream()
│                .filter(ResourceMetadataAdapter.class::isInstance)
│                .map(ResourceMetadataAdapter.class::cast)
│                .findFirst()
│                .map(ResourceMetadataAdapter::getName)
│                .orElse(resource.getURI().lastSegment());
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/services/aql/TreeMutationA
⋮
│public class TreeMutationAQLService {
│
⋮

backend/services/syson-tree-services/src/main/java/org/eclipse/syson/tree/services/aql/TreeQueryAQLS
⋮
│public class TreeQueryAQLService {
│
│    private final ISysONExplorerService sysonExplorerService;
│
│    private final TreeQuerySelectionDialogService treeQuerySelectionDialogService;
│
│    /**
│     * Creates a new tree query AQL service.
│     *
│     * @param sysonExplorerService
⋮
│    public List<Object> getChildren(Object self, IEditingContext editingContext, List<Representatio
│        return this.sysonExplorerService.getChildren(self, editingContext, existingRepresentations,
⋮
│    public String getLabel(Object self) {
│        return this.sysonExplorerService.getLabel(self);
⋮
│    public Object getParent(Object self, String treeItemId, IEditingContext editingContext) {
│        return this.sysonExplorerService.getParent(self, treeItemId, editingContext);
⋮
│    public boolean hasChildren(Object self, IEditingContext editingContext, List<RepresentationMeta
│        return this.sysonExplorerService.hasChildren(self, editingContext, existingRepresentations,
⋮
│    public List<? extends Object> getSelectionDialogChildren(Object selectionDialogTreeElement, IEd
│        return this.treeQuerySelectionDialogService.getSelectionDialogChildren(selectionDialogTreeE
⋮
│    public List<Object> getSelectionDialogElements(IEditingContext editingContext, List<EClassifier
│        return this.treeQuerySelectionDialogService.getSelectionDialogElements(editingContext, cand
⋮

backend/services/syson-tree-services/src/test/java/org/eclipse/syson/tree/explorer/services/IReprese
⋮
│public class IRepresentationMetadataSearchServiceNoOp implements IRepresentationMetadataSearchServi
│
│    @Override
│    public List<RepresentationMetadata> findAllRepresentationMetadataBySemanticDataAndTargetObjectI
│        return null;
│    }
│
│    @Override
│    public List<RepresentationMetadata> findAllRepresentationMetadataBySemanticData(AggregateRefere
│        return null;
⋮
│    @Override
│    public Window<RepresentationMetadata> findAllRepresentationMetadataBySemanticData(AggregateRefe
⋮
│    @Override
│    public boolean existAnyRepresentationMetadataForSemanticDataAndTargetObjectId(AggregateReferenc
⋮
│    @Override
│    public boolean existsBySemanticDataAndRepresentationMetadataId(AggregateReference<SemanticData,
⋮
│    @Override
│    public Optional<RepresentationMetadata> findMetadataById(AggregateReference<SemanticData, UUID>
⋮
│    @Override
│    public boolean existsByIdAndKind(AggregateReference<SemanticData, UUID> semanticData, UUID repr
⋮

backend/services/syson-tree-services/src/test/java/org/eclipse/syson/tree/explorer/services/LibraryS
⋮
│public class LibrarySearchServiceNoOp implements ILibrarySearchService {
│
│    @Override
│    public Page<Library> findAll(Pageable pageable) {
│        return new PageImpl<>(List.of());
│    }
│
│    @Override
│    public boolean existsByNamespaceAndNameAndVersion(String namespace, String name, String version
│        return false;
⋮
│    @Override
│    public Optional<Library> findByNamespaceAndNameAndVersion(String namespace, String name, String
⋮
│    @Override
│    public Optional<Library> findBySemanticData(AggregateReference<SemanticData, UUID> semanticData
⋮
│    @Override
│    public Page<Library> findAllByNamespaceAndName(String namespace, String name, Pageable pageable
⋮
│    @Override
│    public List<Library> findAllById(Iterable<UUID> ids) {
⋮
│    @Override
│    public Optional<Library> findById(UUID id) {
⋮

backend/services/syson-tree-services/src/test/java/org/eclipse/syson/tree/explorer/services/SysONDef
⋮
│public class SysONDefaultExplorerServicesTest {
│
│    private static EditingContext editingContext;
│
│    private final ISysONResourceService resourceService;
│
│    private final ISysONDefaultExplorerService defaultExplorerService;
│
│    public SysONDefaultExplorerServicesTest() {
│        this.resourceService = new SysONResourceService(new LibrarySearchServiceNoOp());
⋮
│    private List<EClass> getAllConcreteEClasses(final EPackage ePackage) {
│        return ePackage.getEClassifiers().stream()
│                .filter(EClass.class::isInstance)
│                .map(EClass.class::cast)
│                .filter(
│                        Predicate.not(EClass::isInterface)
│                                .and(Predicate.not(EClass::isAbstract)))
│                .toList();
⋮

backend/services/syson-tree-services/src/test/java/org/eclipse/syson/tree/explorer/services/SysONExp
⋮
│public class SysONExplorerFilterServiceTest {
│
│    private final ISysONResourceService sysONResourceService = new SysONResourceService(new Library
│
│    private final ISysONExplorerFilterService filterService = new SysONExplorerFilterService(this.s
│
│    private final Resource.Factory resourceFactory = new JsonResourceFactoryImpl();
│
│    @Test
│    public void isKerMLStandardLibraryNotResource() {
⋮
│    @Test
│    public void hideKerMLStandardLibraries() {
⋮
│    @Test
│    public void hideSysMLStandardLibraries() {
⋮
│    @Test
│    public void hideMemberships() {
⋮
│    @Test
│    public void hideRootNamespace() {
⋮
│    private Resource createKerMLResource() {
│        return this.resourceFactory.createResource(URI.createURI(ElementUtil.KERML_LIBRARY_SCHEME +
⋮
│    private Resource createSysMLResource() {
│        return this.resourceFactory.createResource(URI.createURI(ElementUtil.SYSML_LIBRARY_SCHEME +
⋮

backend/services/syson-tree-services/src/test/java/org/eclipse/syson/tree/explorer/services/SysONSel
⋮
│@SuppressWarnings("checkstyle:MultipleStringLiterals")
│public class SysONSelectionDialogFragmentServicesTest {
│
⋮
│    private static final class TestFragment implements ISysONExplorerFragment {
│
│        private final String id;
│
│        private final String kind;
│
│        private final String label;
│
│        private final List<String> iconURL;
│
⋮
│        @Override
│        public String getLabel() {
⋮
│        @Override
│        public Object getParent() {
⋮
│        @Override
│        public List<String> getIconURL() {
⋮
│        @Override
│        public boolean hasChildren(IEditingContext editingContext, List<RepresentationMetadata> exi
⋮
│        @Override
│        public List<Object> getChildren(IEditingContext editingContext, List<RepresentationMetadata
⋮

backend/services/syson-tree-services/src/test/java/org/eclipse/syson/tree/services/ArchitectureConst
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_TREE_SERVICES_ROOT_PACKAGE = "org.eclipse.syson.tree.services.
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_TREE_SERVICES_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/services/syson-tree-services/src/test/java/org/eclipse/syson/tree/services/CodingRulesTests.
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_TREE_SERVICES_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮
```
