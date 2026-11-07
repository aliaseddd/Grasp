# Repo map: backend/metamodel/syson-siriusweb-customnodes-metamodel-edit

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/metamodel/syson-siriusweb-customnodes-metamodel-edit`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/metamodel/syson-siriusweb-customnodes-metamodel-edit) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 32 files there; aider read the 20 that `syson.aiderignore` leaves in, and the map shows 20 of them, 7 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/.checkstyle

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/.classpath

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/.gitignore

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/.project

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/.settings/org.eclipse.core.resources.pr

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/.settings/org.eclipse.core.runtime.pref

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/.settings/org.eclipse.jdt.apt.core.pref

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/.settings/org.eclipse.jdt.core.prefs

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/.settings/org.eclipse.jdt.ui.prefs

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/.settings/org.eclipse.m2e.core.prefs

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/.settings/org.springframework.ide.eclip

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/pom.xml

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/src/main/java/org/eclipse/syson/sysmlcu
⋮
│public final class SysMLCustomNodesEditPlugin extends EMFPlugin {
│    /**
│     * Keep track of the singleton. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    public static final SysMLCustomNodesEditPlugin INSTANCE = new SysMLCustomNodesEditPlugin();
│
│    /**
│     * Keep track of the singleton. <!-- begin-user-doc --> <!-- end-user-doc -->
⋮
│    @Override
│    public ResourceLocator getPluginResourceLocator() {
⋮
│    public static Implementation getPlugin() {
│        return plugin;
⋮
│    public static class Implementation extends EclipsePlugin {
│        /**
│         * Creates an instance. <!-- begin-user-doc --> <!-- end-user-doc -->
│         *
│         * @generated
│         */
│        public Implementation() {
│            super();
│
│            // Remember the static instance.
⋮
│    @Override
│    protected Object doGetImage(String key) throws IOException {
⋮
│    protected static String extensionFor(String key) {
│        String result = ".gif";
│        int index = key.lastIndexOf('.');
│        if (index != -1) {
│            String extension = key.substring(index + 1);
│            if ("png".equalsIgnoreCase(extension) || "gif".equalsIgnoreCase(extension) || "bmp".equ
│                    || "jpeg".equalsIgnoreCase(extension) || "tif".equalsIgnoreCase(extension) || "
│                result = "";
│            }
│        }
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/src/main/java/org/eclipse/syson/sysmlcu
⋮
│public class SysMLCustomnodesItemProviderAdapterFactory extends SysMLCustomnodesAdapterFactory impl
│    /**
│     * This keeps track of the root adapter factory that delegates to this adapter factory. <!-- be
│     * end-user-doc -->
│     *
│     * @generated
│     */
│    protected ComposedAdapterFactory parentAdapterFactory;
│
│    /**
⋮
│    @Override
│    public Adapter createSysMLPackageNodeStyleDescriptionAdapter() {
⋮
│    @Override
│    public Adapter createSysMLNoteNodeStyleDescriptionAdapter() {
⋮
│    @Override
│    public Adapter createSysMLImportedPackageNodeStyleDescriptionAdapter() {
⋮
│    @Override
│    public Adapter createSysMLViewFrameNodeStyleDescriptionAdapter() {
⋮
│    @Override
│    public ComposeableAdapterFactory getRootAdapterFactory() {
⋮
│    @Override
│    public void setParentAdapterFactory(ComposedAdapterFactory parentAdapterFactory) {
⋮
│    @Override
│    public boolean isFactoryForType(Object type) {
⋮
│    @Override
│    public Adapter adapt(Notifier notifier, Object type) {
⋮
│    @Override
│    public Object adapt(Object object, Object type) {
⋮
│    @Override
│    public void addListener(INotifyChangedListener notifyChangedListener) {
⋮
│    @Override
│    public void removeListener(INotifyChangedListener notifyChangedListener) {
⋮
│    @Override
│    public void fireNotifyChanged(Notification notification) {
⋮
│    @Override
│    public void dispose() {
⋮
│    public static class DiagramChildCreationExtender implements IChildCreationExtender {
│        /**
│         * The switch for creating child descriptors specific to each extended class. <!-- begin-us
│         * end-user-doc -->
│         *
│         * @generated
│         */
│        protected static class CreationSwitch extends DiagramSwitch<Object> {
│            /**
│             * The child descriptors being populated. <!-- begin-user-doc --> <!-- end-user-doc -->
│             *
│             * @generated
│             */
│            protected List<Object> newChildDescriptors;
│
│            /**
│             * The domain in which to create the children. <!-- begin-user-doc --> <!-- end-user-do
⋮
│            @Override
│            public Object caseNodeDescription(NodeDescription object) {
⋮
│            @Override
│            public Object caseConditionalNodeStyle(ConditionalNodeStyle object) {
⋮
│            protected CommandParameter createChildParameter(Object feature, Object child) {
│                return new CommandParameter(null, feature, child);
⋮
│        @Override
│        public Collection<Object> getNewChildDescriptors(Object object, EditingDomain editingDomain
⋮
│        @Override
│        public ResourceLocator getResourceLocator() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/src/main/java/org/eclipse/syson/sysmlcu
⋮
│public class SysMLImportedPackageNodeStyleDescriptionItemProvider
⋮
│        IItemPropertySource {
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    protected void addBorderColorPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderColor_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderColor_f
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_COLOR,
│                true,
│                false,
│                false,
│                null,
⋮
│    protected void addBorderRadiusPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderRadius_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderRadius_
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_RADIUS,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.INTEGRAL_VALUE_IMAGE,
⋮
│    protected void addBorderSizePropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderSize_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderSize_fe
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_SIZE,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.INTEGRAL_VALUE_IMAGE,
⋮
│    protected void addBorderLineStylePropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderLineStyle_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderLineSty
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_LINE_STYLE,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.GENERIC_VALUE_IMAGE,
⋮
│    protected void addDescriptionPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_NodeStyleDescription_description_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_NodeStyleDescription_desc
│                DiagramPackage.Literals.NODE_STYLE_DESCRIPTION__DESCRIPTION,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.GENERIC_VALUE_IMAGE,
⋮
│    protected void addBackgroundPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_SysMLImportedPackageNodeStyleDescription_background_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_SysMLImportedPackageNodeS
│                SysMLCustomnodesPackage.Literals.SYS_ML_IMPORTED_PACKAGE_NODE_STYLE_DESCRIPTION__BA
│                true,
│                false,
│                true,
│                null,
⋮
│    @Override
│    public Collection<? extends EStructuralFeature> getChildrenFeatures(Object object) {
⋮
│    @Override
│    protected EStructuralFeature getChildFeature(Object object, Object child) {
⋮
│    @Override
│    public Object getImage(Object object) {
⋮
│    @Override
│    public String getText(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮
│    @Override
│    public ResourceLocator getResourceLocator() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/src/main/java/org/eclipse/syson/sysmlcu
⋮
│public class SysMLNoteNodeStyleDescriptionItemProvider
⋮
│        IItemPropertySource {
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    protected void addBorderColorPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderColor_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderColor_f
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_COLOR,
│                true,
│                false,
│                false,
│                null,
⋮
│    protected void addBorderRadiusPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderRadius_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderRadius_
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_RADIUS,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.INTEGRAL_VALUE_IMAGE,
⋮
│    protected void addBorderSizePropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderSize_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderSize_fe
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_SIZE,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.INTEGRAL_VALUE_IMAGE,
⋮
│    protected void addBorderLineStylePropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderLineStyle_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderLineSty
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_LINE_STYLE,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.GENERIC_VALUE_IMAGE,
⋮
│    protected void addDescriptionPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_NodeStyleDescription_description_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_NodeStyleDescription_desc
│                DiagramPackage.Literals.NODE_STYLE_DESCRIPTION__DESCRIPTION,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.GENERIC_VALUE_IMAGE,
⋮
│    protected void addBackgroundPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_SysMLNoteNodeStyleDescription_background_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_SysMLNoteNodeStyleDescrip
│                SysMLCustomnodesPackage.Literals.SYS_ML_NOTE_NODE_STYLE_DESCRIPTION__BACKGROUND,
│                true,
│                false,
│                true,
│                null,
⋮
│    @Override
│    public Collection<? extends EStructuralFeature> getChildrenFeatures(Object object) {
⋮
│    @Override
│    protected EStructuralFeature getChildFeature(Object object, Object child) {
⋮
│    @Override
│    public Object getImage(Object object) {
⋮
│    @Override
│    public String getText(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮
│    @Override
│    public ResourceLocator getResourceLocator() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/src/main/java/org/eclipse/syson/sysmlcu
⋮
│public class SysMLPackageNodeStyleDescriptionItemProvider extends ItemProviderAdapter
│        implements IEditingDomainItemProvider, IStructuredItemContentProvider, ITreeItemContentProv
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    protected void addBorderColorPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderColor_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderColor_f
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_COLOR,
│                true,
│                false,
│                false,
│                null,
⋮
│    protected void addBorderRadiusPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderRadius_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderRadius_
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_RADIUS,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.INTEGRAL_VALUE_IMAGE,
⋮
│    protected void addBorderSizePropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderSize_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderSize_fe
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_SIZE,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.INTEGRAL_VALUE_IMAGE,
⋮
│    protected void addBorderLineStylePropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderLineStyle_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderLineSty
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_LINE_STYLE,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.GENERIC_VALUE_IMAGE,
⋮
│    protected void addDescriptionPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_NodeStyleDescription_description_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_NodeStyleDescription_desc
│                DiagramPackage.Literals.NODE_STYLE_DESCRIPTION__DESCRIPTION,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.GENERIC_VALUE_IMAGE,
⋮
│    protected void addBackgroundPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_SysMLPackageNodeStyleDescription_background_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_SysMLPackageNodeStyleDesc
│                SysMLCustomnodesPackage.Literals.SYS_ML_PACKAGE_NODE_STYLE_DESCRIPTION__BACKGROUND,
│                true,
│                false,
│                true,
│                null,
⋮
│    @Override
│    public Collection<? extends EStructuralFeature> getChildrenFeatures(Object object) {
⋮
│    @Override
│    protected EStructuralFeature getChildFeature(Object object, Object child) {
⋮
│    @Override
│    public Object getImage(Object object) {
⋮
│    @Override
│    public String getText(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮
│    @Override
│    public ResourceLocator getResourceLocator() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/src/main/java/org/eclipse/syson/sysmlcu
⋮
│public class SysMLViewFrameNodeStyleDescriptionItemProvider
⋮
│        IItemPropertySource {
│
⋮
│    @Override
│    public List<IItemPropertyDescriptor> getPropertyDescriptors(Object object) {
⋮
│    protected void addBorderColorPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderColor_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderColor_f
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_COLOR,
│                true,
│                false,
│                false,
│                null,
⋮
│    protected void addBorderRadiusPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderRadius_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderRadius_
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_RADIUS,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.INTEGRAL_VALUE_IMAGE,
⋮
│    protected void addBorderSizePropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderSize_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderSize_fe
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_SIZE,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.INTEGRAL_VALUE_IMAGE,
⋮
│    protected void addBorderLineStylePropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_BorderStyle_borderLineStyle_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_BorderStyle_borderLineSty
│                DiagramPackage.Literals.BORDER_STYLE__BORDER_LINE_STYLE,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.GENERIC_VALUE_IMAGE,
⋮
│    protected void addDescriptionPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_NodeStyleDescription_description_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_NodeStyleDescription_desc
│                DiagramPackage.Literals.NODE_STYLE_DESCRIPTION__DESCRIPTION,
│                true,
│                false,
│                false,
│                ItemPropertyDescriptor.GENERIC_VALUE_IMAGE,
⋮
│    protected void addBackgroundPropertyDescriptor(Object object) {
│        this.itemPropertyDescriptors.add(this.createItemPropertyDescriptor(((ComposeableAdapterFact
│                this.getResourceLocator(),
│                this.getString("_UI_SysMLViewFrameNodeStyleDescription_background_feature"),
│                this.getString("_UI_PropertyDescriptor_description", "_UI_SysMLViewFrameNodeStyleDe
│                SysMLCustomnodesPackage.Literals.SYS_ML_VIEW_FRAME_NODE_STYLE_DESCRIPTION__BACKGROU
│                true,
│                false,
│                true,
│                null,
⋮
│    @Override
│    public Collection<? extends EStructuralFeature> getChildrenFeatures(Object object) {
⋮
│    @Override
│    protected EStructuralFeature getChildFeature(Object object, Object child) {
⋮
│    @Override
│    public Object getImage(Object object) {
⋮
│    @Override
│    public String getText(Object object) {
⋮
│    @Override
│    public void notifyChanged(Notification notification) {
⋮
│    @Override
│    protected void collectNewChildDescriptors(Collection<Object> newChildDescriptors, Object object
⋮
│    @Override
│    public ResourceLocator getResourceLocator() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/src/main/resources/plugin.properties:
⋮
│pluginName = SysMLCustomnodes Edit Support
│providerName = www.example.org
│
│_UI_CreateChild_text = {0}
│_UI_CreateChild_text2 = {1} {0}
│_UI_CreateChild_text3 = {1}
│_UI_CreateChild_tooltip = Create New {0} Under {1} Feature
│_UI_CreateChild_description = Create a new child of type {0} for the {1} feature of the selected {2
│_UI_CreateSibling_description = Create a new sibling of type {0} for the selected {2}, under the {1
│
│_UI_PropertyDescriptor_description = The {0} of the {1}
│
│_UI_SysMLPackageNodeStyleDescription_type = SysML Package Node Style Description
│_UI_SysMLNoteNodeStyleDescription_type = SysML Note Node Style Description
│_UI_SysMLImportedPackageNodeStyleDescription_type = SysML Imported Package Node Style Description
│_UI_SysMLViewFrameNodeStyleDescription_type = SysML View Frame Node Style Description
│_UI_Unknown_type = Object
│
│_UI_Unknown_datatype= Value
│
│_UI_SysMLPackageNodeStyleDescription_background_feature = Background
│_UI_SysMLNoteNodeStyleDescription_background_feature = Background
│_UI_SysMLImportedPackageNodeStyleDescription_background_feature = Background
│_UI_SysMLViewFrameNodeStyleDescription_background_feature = Background
│_UI_Unknown_feature = Unspecified
│

backend/metamodel/syson-siriusweb-customnodes-metamodel-edit/src/test/java/.gitkeep
```
