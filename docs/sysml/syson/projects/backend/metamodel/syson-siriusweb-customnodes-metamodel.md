# Repo map: backend/metamodel/syson-siriusweb-customnodes-metamodel

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/metamodel/syson-siriusweb-customnodes-metamodel`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/metamodel/syson-siriusweb-customnodes-metamodel) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 31 files there; aider read the 31 that `syson.aiderignore` leaves in, and the map shows 31 of them, 16 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/metamodel/syson-siriusweb-customnodes-metamodel/.checkstyle

backend/metamodel/syson-siriusweb-customnodes-metamodel/.classpath

backend/metamodel/syson-siriusweb-customnodes-metamodel/.gitignore

backend/metamodel/syson-siriusweb-customnodes-metamodel/.project

backend/metamodel/syson-siriusweb-customnodes-metamodel/.settings/org.eclipse.core.resources.prefs

backend/metamodel/syson-siriusweb-customnodes-metamodel/.settings/org.eclipse.core.runtime.prefs

backend/metamodel/syson-siriusweb-customnodes-metamodel/.settings/org.eclipse.jdt.apt.core.prefs

backend/metamodel/syson-siriusweb-customnodes-metamodel/.settings/org.eclipse.jdt.core.prefs

backend/metamodel/syson-siriusweb-customnodes-metamodel/.settings/org.eclipse.jdt.ui.prefs

backend/metamodel/syson-siriusweb-customnodes-metamodel/.settings/org.eclipse.m2e.core.prefs

backend/metamodel/syson-siriusweb-customnodes-metamodel/.settings/org.springframework.ide.eclipse.pr

backend/metamodel/syson-siriusweb-customnodes-metamodel/pom.xml

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public interface SysMLCustomnodesFactory extends EFactory {
│    /**
│     * The singleton instance of the factory. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    SysMLCustomnodesFactory eINSTANCE = org.eclipse.syson.sysmlcustomnodes.impl.SysMLCustomnodesFac
│
│    /**
│     * Returns a new object of class '<em>Sys ML Package Node Style Description</em>'. <!-- begin-u
⋮
│    SysMLPackageNodeStyleDescription createSysMLPackageNodeStyleDescription();
│
⋮
│    SysMLNoteNodeStyleDescription createSysMLNoteNodeStyleDescription();
│
⋮
│    SysMLImportedPackageNodeStyleDescription createSysMLImportedPackageNodeStyleDescription();
│
⋮
│    SysMLViewFrameNodeStyleDescription createSysMLViewFrameNodeStyleDescription();
│
⋮
│    SysMLCustomnodesPackage getSysMLCustomnodesPackage();
│
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public interface SysMLCustomnodesPackage extends EPackage {
│    /**
│     * The package name. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    String eNAME = "sysmlcustomnodes";
│
│    /**
│     * The package namespace URI. <!-- begin-user-doc --> <!-- end-user-doc -->
⋮
│    EClass getSysMLPackageNodeStyleDescription();
│
⋮
│    EReference getSysMLPackageNodeStyleDescription_Background();
│
⋮
│    EClass getSysMLNoteNodeStyleDescription();
│
⋮
│    EReference getSysMLNoteNodeStyleDescription_Background();
│
⋮
│    EClass getSysMLImportedPackageNodeStyleDescription();
│
⋮
│    EReference getSysMLImportedPackageNodeStyleDescription_Background();
│
⋮
│    EClass getSysMLViewFrameNodeStyleDescription();
│
⋮
│    EReference getSysMLViewFrameNodeStyleDescription_Background();
│
⋮
│    SysMLCustomnodesFactory getSysMLCustomnodesFactory();
│
⋮
│    interface Literals {
│        /**
│         * The meta object literal for the
│         * '{@link org.eclipse.syson.sysmlcustomnodes.impl.SysMLPackageNodeStyleDescriptionImpl <em
│         * Style Description</em>}' class. <!-- begin-user-doc --> <!-- end-user-doc -->
│         *
│         * @see org.eclipse.syson.sysmlcustomnodes.impl.SysMLPackageNodeStyleDescriptionImpl
│         * @see org.eclipse.syson.sysmlcustomnodes.impl.SysMLCustomnodesPackageImpl#getSysMLPackage
│         * @generated
│         */
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public interface SysMLImportedPackageNodeStyleDescription extends NodeStyleDescription {
│    /**
│     * Returns the value of the '<em><b>Background</b></em>' reference. <!-- begin-user-doc --> <!-
│     *
│     * @return the value of the '<em>Background</em>' reference.
│     * @see #setBackground(UserColor)
│     * @see org.eclipse.syson.sysmlcustomnodes.SysMLCustomnodesPackage#getSysMLImportedPackageNodeS
│     * @model
│     * @generated
│     */
│    UserColor getBackground();
│
⋮
│    void setBackground(UserColor value);
│
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public interface SysMLNoteNodeStyleDescription extends NodeStyleDescription {
│    /**
│     * Returns the value of the '<em><b>Background</b></em>' reference. <!-- begin-user-doc --> <!-
│     *
│     * @return the value of the '<em>Background</em>' reference.
│     * @see #setBackground(UserColor)
│     * @see org.eclipse.syson.sysmlcustomnodes.SysMLCustomnodesPackage#getSysMLNoteNodeStyleDescrip
│     * @model
│     * @generated
│     */
│    UserColor getBackground();
│
⋮
│    void setBackground(UserColor value);
│
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public interface SysMLPackageNodeStyleDescription extends NodeStyleDescription {
│
│    /**
│     * Returns the value of the '<em><b>Background</b></em>' reference. <!-- begin-user-doc --> <!-
│     *
│     * @return the value of the '<em>Background</em>' reference.
│     * @see #setBackground(UserColor)
│     * @see org.eclipse.syson.sysmlcustomnodes.SysMLCustomnodesPackage#getSysMLPackageNodeStyleDesc
│     * @model
│     * @generated
│     */
│    UserColor getBackground();
│
⋮
│    void setBackground(UserColor value);
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public interface SysMLViewFrameNodeStyleDescription extends NodeStyleDescription {
│
│    /**
│     * Returns the value of the '<em><b>Background</b></em>' reference. <!-- begin-user-doc --> <!-
│     *
│     * @return the value of the '<em>Background</em>' reference.
│     * @see #setBackground(UserColor)
│     * @see org.eclipse.syson.sysmlcustomnodes.SysMLCustomnodesPackage#getSysMLViewFrameNodeStyleDe
│     * @model
│     * @generated
│     */
│    UserColor getBackground();
│
⋮
│    void setBackground(UserColor value);
│
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public class SysMLCustomnodesFactoryImpl extends EFactoryImpl implements SysMLCustomnodesFactory {
│    /**
│     * Creates the default factory implementation. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    public static SysMLCustomnodesFactory init() {
│        try {
│            SysMLCustomnodesFactory theSysMLCustomnodesFactory = (SysMLCustomnodesFactory) EPackage
│            if (theSysMLCustomnodesFactory != null) {
│                return theSysMLCustomnodesFactory;
│            }
│        } catch (Exception exception) {
│            EcorePlugin.INSTANCE.log(exception);
│        }
│        return new SysMLCustomnodesFactoryImpl();
⋮
│    @Override
│    public EObject create(EClass eClass) {
⋮
│    @Override
│    public SysMLPackageNodeStyleDescription createSysMLPackageNodeStyleDescription() {
⋮
│    @Override
│    public SysMLNoteNodeStyleDescription createSysMLNoteNodeStyleDescription() {
⋮
│    @Override
│    public SysMLImportedPackageNodeStyleDescription createSysMLImportedPackageNodeStyleDescription(
⋮
│    @Override
│    public SysMLViewFrameNodeStyleDescription createSysMLViewFrameNodeStyleDescription() {
⋮
│    @Override
│    public SysMLCustomnodesPackage getSysMLCustomnodesPackage() {
⋮
│    @Deprecated
│    public static SysMLCustomnodesPackage getPackage() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public class SysMLCustomnodesPackageImpl extends EPackageImpl implements SysMLCustomnodesPackage {
│    /**
│     * <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    private EClass sysMLPackageNodeStyleDescriptionEClass = null;
│
│    /**
│     * <!-- begin-user-doc --> <!-- end-user-doc -->
⋮
│    public static SysMLCustomnodesPackage init() {
│        if (isInited)
│            return (SysMLCustomnodesPackage) EPackage.Registry.INSTANCE.getEPackage(SysMLCustomnode
│
│        // Obtain or create and register package
│        Object registeredSysMLCustomnodesPackage = EPackage.Registry.INSTANCE.get(eNS_URI);
│        SysMLCustomnodesPackageImpl theSysMLCustomnodesPackage = registeredSysMLCustomnodesPackage 
│                ? (SysMLCustomnodesPackageImpl) registeredSysMLCustomnodesPackage
│                : new SysMLCustomnodesPackageImpl();
│
⋮
│    @Override
│    public EClass getSysMLPackageNodeStyleDescription() {
⋮
│    @Override
│    public EReference getSysMLPackageNodeStyleDescription_Background() {
⋮
│    @Override
│    public EClass getSysMLNoteNodeStyleDescription() {
⋮
│    @Override
│    public EReference getSysMLNoteNodeStyleDescription_Background() {
⋮
│    @Override
│    public EClass getSysMLImportedPackageNodeStyleDescription() {
⋮
│    @Override
│    public EReference getSysMLImportedPackageNodeStyleDescription_Background() {
⋮
│    @Override
│    public EClass getSysMLViewFrameNodeStyleDescription() {
⋮
│    @Override
│    public EReference getSysMLViewFrameNodeStyleDescription_Background() {
⋮
│    @Override
│    public SysMLCustomnodesFactory getSysMLCustomnodesFactory() {
⋮
│    public void createPackageContents() {
│        if (this.isCreated)
│            return;
│        this.isCreated = true;
│
│        // Create classes and their features
│        this.sysMLPackageNodeStyleDescriptionEClass = this.createEClass(SYS_ML_PACKAGE_NODE_STYLE_D
│        this.createEReference(this.sysMLPackageNodeStyleDescriptionEClass, SYS_ML_PACKAGE_NODE_STYL
│
│        this.sysMLNoteNodeStyleDescriptionEClass = this.createEClass(SYS_ML_NOTE_NODE_STYLE_DESCRIP
⋮
│    public void initializePackageContents() {
│        if (this.isInitialized)
│            return;
│        this.isInitialized = true;
│
│        // Initialize package
│        this.setName(eNAME);
│        this.setNsPrefix(eNS_PREFIX);
│        this.setNsURI(eNS_URI);
│
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public class SysMLImportedPackageNodeStyleDescriptionImpl extends MinimalEObjectImpl.Container impl
│    /**
│     * The cached value of the '{@link #getBorderColor() <em>Border Color</em>}' reference. <!-- be
│     * end-user-doc -->
│     *
│     * @see #getBorderColor()
│     * @generated
│     * @ordered
│     */
│    protected UserColor borderColor;
│
⋮
│    @Override
│    protected EClass eStaticClass() {
⋮
│    @Override
│    public UserColor getBorderColor() {
⋮
│    public UserColor basicGetBorderColor() {
│        return this.borderColor;
⋮
│    @Override
│    public void setBorderColor(UserColor newBorderColor) {
⋮
│    @Override
│    public int getBorderRadius() {
⋮
│    @Override
│    public void setBorderRadius(int newBorderRadius) {
⋮
│    @Override
│    public int getBorderSize() {
⋮
│    @Override
│    public void setBorderSize(int newBorderSize) {
⋮
│    @Override
│    public LineStyle getBorderLineStyle() {
⋮
│    @Override
│    public void setBorderLineStyle(LineStyle newBorderLineStyle) {
⋮
│    @Override
│    public LayoutStrategyDescription getChildrenLayoutStrategy() {
⋮
│    public NotificationChain basicSetChildrenLayoutStrategy(LayoutStrategyDescription newChildrenLa
│        LayoutStrategyDescription oldChildrenLayoutStrategy = this.childrenLayoutStrategy;
│        this.childrenLayoutStrategy = newChildrenLayoutStrategy;
│        if (this.eNotificationRequired()) {
│            ENotificationImpl notification = new ENotificationImpl(this, Notification.SET, SysMLCus
│                    oldChildrenLayoutStrategy, newChildrenLayoutStrategy);
│            if (msgs == null)
│                msgs = notification;
│            else
│                msgs.add(notification);
⋮
│    @Override
│    public void setChildrenLayoutStrategy(LayoutStrategyDescription newChildrenLayoutStrategy) {
⋮
│    @Override
│    public String getDescription() {
⋮
│    @Override
│    public void setDescription(String newDescription) {
⋮
│    @Override
│    public UserColor getBackground() {
⋮
│    public UserColor basicGetBackground() {
│        return this.background;
⋮
│    @Override
│    public void setBackground(UserColor newBackground) {
⋮
│    @Override
│    public NotificationChain eInverseRemove(InternalEObject otherEnd, int featureID, NotificationCh
⋮
│    @Override
│    public Object eGet(int featureID, boolean resolve, boolean coreType) {
⋮
│    @Override
│    public void eSet(int featureID, Object newValue) {
⋮
│    @Override
│    public void eUnset(int featureID) {
⋮
│    @Override
│    public boolean eIsSet(int featureID) {
⋮
│    @Override
│    public String toString() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public class SysMLNoteNodeStyleDescriptionImpl extends MinimalEObjectImpl.Container implements SysM
│    /**
│     * The cached value of the '{@link #getBorderColor() <em>Border Color</em>}' reference. <!-- be
│     * end-user-doc -->
│     *
│     * @see #getBorderColor()
│     * @generated
│     * @ordered
│     */
│    protected UserColor borderColor;
│
⋮
│    @Override
│    protected EClass eStaticClass() {
⋮
│    @Override
│    public UserColor getBorderColor() {
⋮
│    public UserColor basicGetBorderColor() {
│        return this.borderColor;
⋮
│    @Override
│    public void setBorderColor(UserColor newBorderColor) {
⋮
│    @Override
│    public int getBorderRadius() {
⋮
│    @Override
│    public void setBorderRadius(int newBorderRadius) {
⋮
│    @Override
│    public int getBorderSize() {
⋮
│    @Override
│    public void setBorderSize(int newBorderSize) {
⋮
│    @Override
│    public LineStyle getBorderLineStyle() {
⋮
│    @Override
│    public void setBorderLineStyle(LineStyle newBorderLineStyle) {
⋮
│    @Override
│    public LayoutStrategyDescription getChildrenLayoutStrategy() {
⋮
│    public NotificationChain basicSetChildrenLayoutStrategy(LayoutStrategyDescription newChildrenLa
│        LayoutStrategyDescription oldChildrenLayoutStrategy = this.childrenLayoutStrategy;
│        this.childrenLayoutStrategy = newChildrenLayoutStrategy;
│        if (this.eNotificationRequired()) {
│            ENotificationImpl notification = new ENotificationImpl(this, Notification.SET, SysMLCus
│                    oldChildrenLayoutStrategy, newChildrenLayoutStrategy);
│            if (msgs == null)
│                msgs = notification;
│            else
│                msgs.add(notification);
⋮
│    @Override
│    public void setChildrenLayoutStrategy(LayoutStrategyDescription newChildrenLayoutStrategy) {
⋮
│    @Override
│    public String getDescription() {
⋮
│    @Override
│    public void setDescription(String newDescription) {
⋮
│    @Override
│    public UserColor getBackground() {
⋮
│    public UserColor basicGetBackground() {
│        return this.background;
⋮
│    @Override
│    public void setBackground(UserColor newBackground) {
⋮
│    @Override
│    public NotificationChain eInverseRemove(InternalEObject otherEnd, int featureID, NotificationCh
⋮
│    @Override
│    public Object eGet(int featureID, boolean resolve, boolean coreType) {
⋮
│    @Override
│    public void eSet(int featureID, Object newValue) {
⋮
│    @Override
│    public void eUnset(int featureID) {
⋮
│    @Override
│    public boolean eIsSet(int featureID) {
⋮
│    @Override
│    public String toString() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public class SysMLPackageNodeStyleDescriptionImpl extends MinimalEObjectImpl.Container implements S
│    /**
│     * The cached value of the '{@link #getBorderColor() <em>Border Color</em>}' reference. <!-- be
│     * end-user-doc -->
│     *
│     * @see #getBorderColor()
│     * @generated
│     * @ordered
│     */
│    protected UserColor borderColor;
│
⋮
│    @Override
│    protected EClass eStaticClass() {
⋮
│    @Override
│    public UserColor getBorderColor() {
⋮
│    public UserColor basicGetBorderColor() {
│        return this.borderColor;
⋮
│    @Override
│    public void setBorderColor(UserColor newBorderColor) {
⋮
│    @Override
│    public int getBorderRadius() {
⋮
│    @Override
│    public void setBorderRadius(int newBorderRadius) {
⋮
│    @Override
│    public int getBorderSize() {
⋮
│    @Override
│    public void setBorderSize(int newBorderSize) {
⋮
│    @Override
│    public LineStyle getBorderLineStyle() {
⋮
│    @Override
│    public void setBorderLineStyle(LineStyle newBorderLineStyle) {
⋮
│    @Override
│    public LayoutStrategyDescription getChildrenLayoutStrategy() {
⋮
│    public NotificationChain basicSetChildrenLayoutStrategy(LayoutStrategyDescription newChildrenLa
│        LayoutStrategyDescription oldChildrenLayoutStrategy = this.childrenLayoutStrategy;
│        this.childrenLayoutStrategy = newChildrenLayoutStrategy;
│        if (this.eNotificationRequired()) {
│            ENotificationImpl notification = new ENotificationImpl(this, Notification.SET, SysMLCus
│                    oldChildrenLayoutStrategy, newChildrenLayoutStrategy);
│            if (msgs == null)
│                msgs = notification;
│            else
│                msgs.add(notification);
⋮
│    @Override
│    public void setChildrenLayoutStrategy(LayoutStrategyDescription newChildrenLayoutStrategy) {
⋮
│    @Override
│    public String getDescription() {
⋮
│    @Override
│    public void setDescription(String newDescription) {
⋮
│    @Override
│    public UserColor getBackground() {
⋮
│    public UserColor basicGetBackground() {
│        return this.background;
⋮
│    @Override
│    public void setBackground(UserColor newBackground) {
⋮
│    @Override
│    public NotificationChain eInverseRemove(InternalEObject otherEnd, int featureID, NotificationCh
⋮
│    @Override
│    public Object eGet(int featureID, boolean resolve, boolean coreType) {
⋮
│    @Override
│    public void eSet(int featureID, Object newValue) {
⋮
│    @Override
│    public void eUnset(int featureID) {
⋮
│    @Override
│    public boolean eIsSet(int featureID) {
⋮
│    @Override
│    public String toString() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public class SysMLViewFrameNodeStyleDescriptionImpl extends MinimalEObjectImpl.Container implements
│
│    /**
│     * The cached value of the '{@link #getBorderColor() <em>Border Color</em>}' reference. <!-- be
│     * end-user-doc -->
│     *
│     * @see #getBorderColor()
│     * @generated
│     * @ordered
│     */
⋮
│    @Override
│    protected EClass eStaticClass() {
⋮
│    @Override
│    public UserColor getBorderColor() {
⋮
│    @Override
│    public void setBorderColor(UserColor newBorderColor) {
⋮
│    public UserColor basicGetBorderColor() {
│        return this.borderColor;
⋮
│    @Override
│    public int getBorderRadius() {
⋮
│    @Override
│    public void setBorderRadius(int newBorderRadius) {
⋮
│    @Override
│    public int getBorderSize() {
⋮
│    @Override
│    public void setBorderSize(int newBorderSize) {
⋮
│    @Override
│    public LineStyle getBorderLineStyle() {
⋮
│    @Override
│    public void setBorderLineStyle(LineStyle newBorderLineStyle) {
⋮
│    @Override
│    public LayoutStrategyDescription getChildrenLayoutStrategy() {
⋮
│    public NotificationChain basicSetChildrenLayoutStrategy(LayoutStrategyDescription newChildrenLa
│        LayoutStrategyDescription oldChildrenLayoutStrategy = this.childrenLayoutStrategy;
│        this.childrenLayoutStrategy = newChildrenLayoutStrategy;
│        if (this.eNotificationRequired()) {
│            ENotificationImpl notification = new ENotificationImpl(this, Notification.SET, SysMLCus
│                    oldChildrenLayoutStrategy, newChildrenLayoutStrategy);
│            if (msgs == null)
│                msgs = notification;
│            else
│                msgs.add(notification);
⋮
│    @Override
│    public void setChildrenLayoutStrategy(LayoutStrategyDescription newChildrenLayoutStrategy) {
⋮
│    @Override
│    public String getDescription() {
⋮
│    @Override
│    public void setDescription(String newDescription) {
⋮
│    @Override
│    public UserColor getBackground() {
⋮
│    @Override
│    public void setBackground(UserColor newBackground) {
⋮
│    @Override
│    public NotificationChain eInverseRemove(InternalEObject otherEnd, int featureID, NotificationCh
⋮
│    public UserColor basicGetBackground() {
│        return this.background;
⋮
│    @Override
│    public Object eGet(int featureID, boolean resolve, boolean coreType) {
⋮
│    @Override
│    public void eSet(int featureID, Object newValue) {
⋮
│    @Override
│    public void eUnset(int featureID) {
⋮
│    @Override
│    public boolean eIsSet(int featureID) {
⋮
│    @Override
│    public String toString() {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public class SysMLCustomnodesAdapterFactory extends AdapterFactoryImpl {
│    /**
│     * The cached model package. <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    protected static SysMLCustomnodesPackage modelPackage;
│
│    /**
│     * Creates an instance of the adapter factory. <!-- begin-user-doc --> <!-- end-user-doc -->
⋮
│    @Override
│    public boolean isFactoryForType(Object object) {
⋮
│    protected SysMLCustomnodesSwitch<Adapter> modelSwitch = new SysMLCustomnodesSwitch<>() {
│        @Override
│        public Adapter caseSysMLPackageNodeStyleDescription(SysMLPackageNodeStyleDescription object
│            return SysMLCustomnodesAdapterFactory.this.createSysMLPackageNodeStyleDescriptionAdapte
│        }
│
│        @Override
│        public Adapter caseSysMLNoteNodeStyleDescription(SysMLNoteNodeStyleDescription object) {
│            return SysMLCustomnodesAdapterFactory.this.createSysMLNoteNodeStyleDescriptionAdapter()
│        }
│
│        @Override
│        public Adapter caseSysMLImportedPackageNodeStyleDescription(SysMLImportedPackageNodeStyleDe
⋮
│        @Override
│        public Adapter caseSysMLViewFrameNodeStyleDescription(SysMLViewFrameNodeStyleDescription ob
⋮
│        @Override
│        public Adapter caseBorderStyle(BorderStyle object) {
⋮
│        @Override
│        public Adapter caseNodeStyleDescription(NodeStyleDescription object) {
⋮
│        @Override
│        public Adapter defaultCase(EObject object) {
⋮
│    @Override
│    public Adapter createAdapter(Notifier target) {
⋮
│    public Adapter createSysMLPackageNodeStyleDescriptionAdapter() {
│        return null;
⋮
│    public Adapter createSysMLNoteNodeStyleDescriptionAdapter() {
│        return null;
⋮
│    public Adapter createSysMLImportedPackageNodeStyleDescriptionAdapter() {
│        return null;
⋮
│    public Adapter createSysMLViewFrameNodeStyleDescriptionAdapter() {
│        return null;
⋮
│    public Adapter createBorderStyleAdapter() {
│        return null;
⋮
│    public Adapter createNodeStyleDescriptionAdapter() {
│        return null;
⋮
│    public Adapter createEObjectAdapter() {
│        return null;
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/java/org/eclipse/syson/sysmlcustomn
⋮
│public class SysMLCustomnodesSwitch<T> extends Switch<T> {
│    /**
│     * The cached model package <!-- begin-user-doc --> <!-- end-user-doc -->
│     *
│     * @generated
│     */
│    protected static SysMLCustomnodesPackage modelPackage;
│
│    /**
│     * Creates an instance of the switch. <!-- begin-user-doc --> <!-- end-user-doc -->
⋮
│    @Override
│    protected boolean isSwitchFor(EPackage ePackage) {
⋮
│    @Override
│    protected T doSwitch(int classifierID, EObject theEObject) {
⋮
│    public T caseSysMLPackageNodeStyleDescription(SysMLPackageNodeStyleDescription object) {
│        return null;
⋮
│    public T caseSysMLNoteNodeStyleDescription(SysMLNoteNodeStyleDescription object) {
│        return null;
⋮
│    public T caseSysMLImportedPackageNodeStyleDescription(SysMLImportedPackageNodeStyleDescription 
│        return null;
⋮
│    public T caseSysMLViewFrameNodeStyleDescription(SysMLViewFrameNodeStyleDescription object) {
│        return null;
⋮
│    public T caseBorderStyle(BorderStyle object) {
│        return null;
⋮
│    public T caseNodeStyleDescription(NodeStyleDescription object) {
│        return null;
⋮
│    @Override
│    public T defaultCase(EObject object) {
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/resources/model/sysml-customnodes.e

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/main/resources/model/sysml-customnodes.g

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/test/java/.gitkeep

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/test/java/org/eclipse/syson/customnodes/
⋮
│class SysMLCustomnodesSwitchTest {
│
│    /**
│     * Verifies dispatch to each custom-node style case.
│     */
│    @DisplayName("GIVEN each custom-node style, WHEN switching on it, THEN its dedicated case is se
│    @Test
│    void testSwitchDispatchesConcreteCustomNodeStyles() {
│        SysMLCustomnodesSwitch<String> styleSwitch = new SysMLCustomnodesSwitch<>() {
│            @Override
│            public String caseSysMLPackageNodeStyleDescription(SysMLPackageNodeStyleDescription obj
│                return "package";
│            }
│
│            @Override
│            public String caseSysMLNoteNodeStyleDescription(SysMLNoteNodeStyleDescription object) {
│                return "note";
│            }
│
│            @Override
│            public String caseSysMLImportedPackageNodeStyleDescription(SysMLImportedPackageNodeStyl
⋮
│            @Override
│            public String caseSysMLViewFrameNodeStyleDescription(SysMLViewFrameNodeStyleDescription
⋮
│    @DisplayName("GIVEN custom-node styles, WHEN adapting them, THEN the generated factory accepts 
│    @Test
│    void testAdapterFactoryAcceptsAndAdaptsCustomNodeStyles() {
⋮
│    @DisplayName("GIVEN custom-node EClasses, WHEN creating from their classifier, THEN the matchin
│    @Test
│    void testFactoryCreatesCustomNodeStylesFromEClass() {
⋮
│    @DisplayName("GIVEN custom-node styles, WHEN assigning their backgrounds, THEN each style retai
│    @Test
│    void testCustomNodeStylesRetainBackgroundColors() {
⋮
│    private FixedColor fixedColor(String value) {
│        FixedColor color = ViewFactory.eINSTANCE.createFixedColor();
│        color.setValue(value);
│        return color;
⋮

backend/metamodel/syson-siriusweb-customnodes-metamodel/src/test/java/org/eclipse/syson/customnodes/
⋮
│public class SysMLImportedPackageNodeStyleDescriptionTests {
│
│    @Test
│    public void testImportedPackageNodeStyle() {
│        FixedColor bgColor = ViewFactory.eINSTANCE.createFixedColor();
│        bgColor.setValue("#123456");
│        FixedColor borderColor = ViewFactory.eINSTANCE.createFixedColor();
│        bgColor.setValue("#abcdef");
│
│        var importedPackageNodeStyleDescription = SysMLCustomnodesFactory.eINSTANCE.createSysMLImpo
│
⋮
```
