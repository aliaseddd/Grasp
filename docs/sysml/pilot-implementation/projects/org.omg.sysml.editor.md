# Repo map: org.omg.sysml.editor

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.editor`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.editor) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 15 files there; aider read the 13 that `pilot.aiderignore` leaves in, and the map shows 13 of them, 6 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.editor/.classpath

org.omg.sysml.editor/.gitignore

org.omg.sysml.editor/.project

org.omg.sysml.editor/.settings/org.eclipse.core.resources.prefs

org.omg.sysml.editor/.settings/org.eclipse.jdt.core.prefs

org.omg.sysml.editor/META-INF/MANIFEST.MF

org.omg.sysml.editor/build.properties:
⋮
│bin.includes = .,\
│               icons/,\
│               META-INF/,\
│               plugin.xml,\
│               plugin.properties
│jars.compile.order = .
│source.. = src/
│output.. = bin

org.omg.sysml.editor/plugin.properties:
⋮
│pluginName = SysMLX Editor
│providerName = 
│
│_UI_SysMLEditor_menu = &SysMLX Editor
│_UI_TypesEditor_menu = &Types Editor
│
│_UI_CreateChild_menu_item = &New Child
│_UI_CreateSibling_menu_item = dN&ew Sibling
│
│_UI_ShowPropertiesView_menu_item = Show &Properties View
│_UI_RefreshViewer_menu_item = &Refresh
│
│_UI_SelectionPage_label = Selection
│_UI_ParentPage_label = Parent
│_UI_ListPage_label = List
│_UI_TreePage_label = Tree
│_UI_TablePage_label = Table
│_UI_TreeWithColumnsPage_label = Tree with Columns
│_UI_ObjectColumn_label = Object
│_UI_SelfColumn_label = Self
│
│_UI_NoObjectSelected = Selected Nothing
│_UI_SingleObjectSelected = Selected Object: {0}
│_UI_MultiObjectSelected = Selected {0} Objects
│
│_UI_OpenEditorError_label = Open Editor
│
│_UI_Wizard_category = Example EMF Model Creation Wizards
│
│_UI_CreateModelError_message = Problems encountered in file "{0}"
│
│_UI_SysMLModelWizard_label = SysML Model
│_UI_SysMLModelWizard_description = Create a new SysML model
│
│_UI_SysMLEditor_label = SysML Model Editor
│
│_UI_SysMLEditorFilenameDefaultBase = My
│_UI_SysMLEditorFilenameExtensions = sysml
│
│_UI_TypesModelWizard_label = Types Model
│_UI_TypesModelWizard_description = Create a new Types model
│
│_UI_TypesEditor_label = Types Model Editor
│
│_UI_TypesEditorFilenameDefaultBase = My
│_UI_TypesEditorFilenameExtensions = types
│
│_UI_Wizard_label = New
│
│_WARN_FilenameExtension = The file name must end in ''.{0}''
│_WARN_FilenameExtensions = The file name must have one of the following extensions: {0}
│
│_UI_ModelObject = &Model Object
│_UI_XMLEncoding = &XML Encoding
│_UI_XMLEncodingChoices = UTF-8 ASCII UTF-16 UTF-16BE UTF-16LE ISO-8859-1
│_UI_Wizard_initial_object_description = Select a model object to create
│
│_UI_FileConflict_label = File Conflict
│_WARN_FileConflict = There are unsaved changes that conflict with changes made outside the editor. 
│

org.omg.sysml.editor/plugin.xml

org.omg.sysml.editor/src/org/omg/sysml/lang/sysml/presentation/SysMLActionBarContributor.java:
⋮
│public class SysMLActionBarContributor
│       extends EditingDomainActionBarContributor
│       implements ISelectionChangedListener {
⋮
│       protected IAction showPropertiesViewAction =
│               new Action(SysMLEditorPlugin.INSTANCE.getString("_UI_ShowPropertiesView_menu_item")) {
│                       @Override
│                       public void run() {
│                               try {
│                                       getPage().showView("org.eclipse.ui.views.PropertySheet");
│                               }
│                               catch (PartInitException exception) {
│                                       SysMLEditorPlugin.INSTANCE.log(exception);
│                               }
│                       }
⋮
│       protected IAction refreshViewerAction =
│               new Action(SysMLEditorPlugin.INSTANCE.getString("_UI_RefreshViewer_menu_item")) {
│                       @Override
│                       public boolean isEnabled() {
│                               return activeEditorPart instanceof IViewerProvider;
│                       }
│
│                       @Override
│                       public void run() {
│                               if (activeEditorPart instanceof IViewerProvider) {
│                                       Viewer viewer = ((IViewerProvider)activeEditorPart).getViewer();
⋮
│       @Override
│       public void contributeToToolBar(IToolBarManager toolBarManager) {
⋮
│       @Override
│       public void contributeToMenu(IMenuManager menuManager) {
⋮
│               submenuManager.addMenuListener
│                       (new IMenuListener() {
│                                @Override
│                                public void menuAboutToShow(IMenuManager menuManager) {
│                                        menuManager.updateAll(true);
│                                }
⋮
│       @Override
│       public void setActiveEditor(IEditorPart part) {
⋮
│       @Override
│       public void selectionChanged(SelectionChangedEvent event) {
⋮
│       protected Collection<IAction> generateCreateChildActions(Collection<?> descriptors, ISelection sel
│               Collection<IAction> actions = new ArrayList<IAction>();
│               if (descriptors != null) {
│                       for (Object descriptor : descriptors) {
│                               actions.add(new CreateChildAction(activeEditorPart, selection, descriptor));
│                       }
│               }
│               return actions;
⋮
│       protected Collection<IAction> generateCreateSiblingActions(Collection<?> descriptors, ISelection s
│               Collection<IAction> actions = new ArrayList<IAction>();
│               if (descriptors != null) {
│                       for (Object descriptor : descriptors) {
│                               actions.add(new CreateSiblingAction(activeEditorPart, selection, descriptor));
│                       }
│               }
│               return actions;
⋮
│       protected void populateManager(IContributionManager manager, Collection<? extends IAction> actions
│               if (actions != null) {
│                       for (IAction action : actions) {
│                               if (contributionID != null) {
│                                       manager.insertBefore(contributionID, action);
│                               }
│                               else {
│                                       manager.add(action);
│                               }
│                       }
⋮
│       protected void depopulateManager(IContributionManager manager, Collection<? extends IAction> actio
│               if (actions != null) {
│                       IContributionItem[] items = manager.getItems();
│                       for (int i = 0; i < items.length; i++) {
│                               // Look into SubContributionItems
│                               //
│                               IContributionItem contributionItem = items[i];
│                               while (contributionItem instanceof SubContributionItem) {
│                                       contributionItem = ((SubContributionItem)contributionItem).getInnerItem();
│                               }
│
⋮
│       @Override
│       public void menuAboutToShow(IMenuManager menuManager) {
⋮
│       @Override
│       protected void addGlobalActions(IMenuManager menuManager) {
⋮
│       @Override
│       protected boolean removeAllReferencesOnDelete() {
⋮

org.omg.sysml.editor/src/org/omg/sysml/lang/sysml/presentation/SysMLEditor.java:
⋮
│public class SysMLEditor
│       extends MultiPageEditorPart
│       implements IEditingDomainProvider, ISelectionProvider, IMenuListener, IViewerProvider, IGotoMarker
⋮
│       protected IPartListener partListener =
│               new IPartListener() {
│                       @Override
│                       public void partActivated(IWorkbenchPart p) {
│                               if (p instanceof ContentOutline) {
│                                       if (((ContentOutline)p).getCurrentPage() == contentOutlinePage) {
│                                               getActionBarContributor().setActiveEditor(SysMLEditor.this);
│
│                                               setCurrentViewer(contentOutlineViewer);
│                                       }
│                               }
⋮
│                       @Override
│                       public void partBroughtToTop(IWorkbenchPart p) {
⋮
│                       @Override
│                       public void partClosed(IWorkbenchPart p) {
⋮
│                       @Override
│                       public void partDeactivated(IWorkbenchPart p) {
⋮
│                       @Override
│                       public void partOpened(IWorkbenchPart p) {
⋮
│       protected EContentAdapter problemIndicationAdapter =
│               new EContentAdapter() {
│                       protected boolean dispatching;
│
│                       @Override
│                       public void notifyChanged(Notification notification) {
│                               if (notification.getNotifier() instanceof Resource) {
│                                       switch (notification.getFeatureID(Resource.class)) {
│                                               case Resource.RESOURCE__IS_LOADED:
│                                               case Resource.RESOURCE__ERRORS:
│                                               case Resource.RESOURCE__WARNINGS: {
⋮
│                       protected void dispatchUpdateProblemIndication() {
│                               if (updateProblemIndication && !dispatching) {
│                                       dispatching = true;
│                                       getSite().getShell().getDisplay().asyncExec
│                                               (new Runnable() {
│                                                        @Override
│                                                        public void run() {
│                                                                dispatching = false;
│                                                                updateProblemIndication();
│                                                        }
│                                                });
⋮
│                       @Override
│                       protected void setTarget(Resource target) {
⋮
│                       @Override
│                       protected void unsetTarget(Resource target) {
⋮
│       protected IResourceChangeListener resourceChangeListener =
│               new IResourceChangeListener() {
│                       @Override
│                       public void resourceChanged(IResourceChangeEvent event) {
│                               IResourceDelta delta = event.getDelta();
│                               try {
│                                       class ResourceDeltaVisitor implements IResourceDeltaVisitor {
│                                               protected ResourceSet resourceSet = editingDomain.getResourceSet();
│                                               protected Collection<Resource> changedResources = new ArrayList<Resource>();
│                                               protected Collection<Resource> removedResources = new ArrayList<Resource>();
│
│                                               @Override
│                                               public boolean visit(IResourceDelta delta) {
│                                                       if (delta.getResource().getType() == IResource.FILE) {
│                                                               if (delta.getKind() == IResourceDelta.REMOVED ||
│                                                                   delta.getKind() == IResourceDelta.CHANGED && delta.getFlags() != IResourceDelta.MARKERS
⋮
│                                               public Collection<Resource> getChangedResources() {
│                                                       return changedResources;
⋮
│                                               public Collection<Resource> getRemovedResources() {
│                                                       return removedResources;
⋮
│                                       if (!visitor.getRemovedResources().isEmpty()) {
│                                               getSite().getShell().getDisplay().asyncExec
│                                                       (new Runnable() {
│                                                                @Override
│                                                                public void run() {
│                                                                        removedResources.addAll(visitor.getRemovedResources());
│                                                                        if (!isDirty()) {
│                                                                                getSite().getPage().closeEditor(SysMLEditor.this, false);
│                                                                        }
│                                                                }
⋮
│                                       if (!visitor.getChangedResources().isEmpty()) {
│                                               getSite().getShell().getDisplay().asyncExec
│                                                       (new Runnable() {
│                                                                @Override
│                                                                public void run() {
│                                                                        changedResources.addAll(visitor.getChangedResources());
│                                                                        if (getSite().getPage().getActiveEditor() == SysMLEditor.this) {
│                                                                                handleActivate();
│                                                                        }
│                                                                }
⋮
│       protected void handleActivate() {
│               // Recompute the read only state.
│               //
│               if (editingDomain.getResourceToReadOnlyMap() != null) {
│                 editingDomain.getResourceToReadOnlyMap().clear();
│
│                 // Refresh any actions that may become enabled or disabled.
│                 //
│                 setSelection(getSelection());
│               }
│
⋮
│       protected void handleChangedResources() {
│               if (!changedResources.isEmpty() && (!isDirty() || handleDirtyConflict())) {
│                       ResourceSet resourceSet = editingDomain.getResourceSet();
│                       if (isDirty()) {
│                               changedResources.addAll(resourceSet.getResources());
│                       }
│                       editingDomain.getCommandStack().flush();
│
│                       updateProblemIndication = false;
│                       for (Resource resource : changedResources) {
⋮
│       protected void updateProblemIndication() {
│               if (updateProblemIndication) {
│                       BasicDiagnostic diagnostic =
│                               new BasicDiagnostic
│                                       (Diagnostic.OK,
│                                        "org.omg.sysml.editor",
│                                        0,
│                                        null,
│                                        new Object [] { editingDomain.getResourceSet() });
│                       for (Diagnostic childDiagnostic : resourceToDiagnosticMap.values()) {
⋮
│       protected boolean handleDirtyConflict() {
│               return
│                       MessageDialog.openQuestion
│                               (getSite().getShell(),
│                                getString("_UI_FileConflict_label"),
│                                getString("_WARN_FileConflict"));
⋮
│       protected void initializeEditingDomain() {
│               // Create an adapter factory that yields item providers.
│               //
│               adapterFactory = new ComposedAdapterFactory(ComposedAdapterFactory.Descriptor.Registry.INSTANCE);
│
│               adapterFactory.addAdapterFactory(new ResourceItemProviderAdapterFactory());
│               adapterFactory.addAdapterFactory(new SysMLItemProviderAdapterFactory());
│               adapterFactory.addAdapterFactory(new ReflectiveItemProviderAdapterFactory());
│
│               // Create the command stack that will notify this editor as commands are executed.
⋮
│               commandStack.addCommandStackListener
│                       (new CommandStackListener() {
│                                @Override
│                                public void commandStackChanged(final EventObject event) {
│                                        getContainer().getDisplay().asyncExec
│                                                (new Runnable() {
│                                                         @Override
│                                                         public void run() {
│                                                                 firePropertyChange(IEditorPart.PROP_DIRTY);
│
│                                                                 // Try to select the affected objects.
│                                                                 //
│                                                                 Command mostRecentCommand = ((CommandStack)event.getSource()).getMostRecentCommand();
│                                                                 if (mostRecentCommand != null) {
│                                                                         setSelectionToViewer(mostRecentCommand.getAffectedObjects());
⋮
│                       @Override
│       protected void firePropertyChange(int action) {
⋮
│       public void setSelectionToViewer(Collection<?> collection) {
│               final Collection<?> theSelection = collection;
│               // Make sure it's okay.
│               //
│               if (theSelection != null && !theSelection.isEmpty()) {
│                       Runnable runnable =
│                               new Runnable() {
│                                       @Override
│                                       public void run() {
│                                               // Try to select the items in the current content viewer of the editor.
│                                               //
│                                               if (currentViewer != null) {
│                                                       currentViewer.setSelection(new StructuredSelection(theSelection.toArray()), true);
│                                               }
│                                       }
⋮
│       @Override
│       public EditingDomain getEditingDomain() {
⋮
│       public class ReverseAdapterFactoryContentProvider extends AdapterFactoryContentProvider {
│               /**
│                * <!-- begin-user-doc -->
│                * <!-- end-user-doc -->
│                * @generated
│                */
│               public ReverseAdapterFactoryContentProvider(AdapterFactory adapterFactory) {
│                       super(adapterFactory);
│               }
│
⋮
│               @Override
│               public Object [] getElements(Object object) {
⋮
│               @Override
│               public Object [] getChildren(Object object) {
⋮
│               @Override
│               public boolean hasChildren(Object object) {
⋮
│               @Override
│               public Object getParent(Object object) {
⋮
│       public void setCurrentViewerPane(ViewerPane viewerPane) {
│               if (currentViewerPane != viewerPane) {
│                       if (currentViewerPane != null) {
│                               currentViewerPane.showFocus(false);
│                       }
│                       currentViewerPane = viewerPane;
│               }
│               setCurrentViewer(currentViewerPane.getViewer());
⋮
│       public void setCurrentViewer(Viewer viewer) {
│               // If it is changing...
│               //
│               if (currentViewer != viewer) {
│                       if (selectionChangedListener == null) {
│                               // Create the listener on demand.
│                               //
│                               selectionChangedListener =
│                                       new ISelectionChangedListener() {
│                                               // This just notifies those things that are affected by the section.
│                                               //
│                                               @Override
│                                               public void selectionChanged(SelectionChangedEvent selectionChangedEvent) {
│                                                       setSelection(selectionChangedEvent.getSelection());
│                                               }
⋮
│       @Override
│       public Viewer getViewer() {
⋮
│       protected void createContextMenuFor(StructuredViewer viewer) {
│               MenuManager contextMenu = new MenuManager("#PopUp");
│               contextMenu.add(new Separator("additions"));
│               contextMenu.setRemoveAllWhenShown(true);
│               contextMenu.addMenuListener(this);
│               Menu menu= contextMenu.createContextMenu(viewer.getControl());
│               viewer.getControl().setMenu(menu);
│               getSite().registerContextMenu(contextMenu, new UnwrappingSelectionProvider(viewer));
│
│               int dndOperations = DND.DROP_COPY | DND.DROP_MOVE | DND.DROP_LINK;
⋮
│       public void createModel() {
│               URI resourceURI = EditUIUtil.getURI(getEditorInput(), editingDomain.getResourceSet().getURIConver
│               Exception exception = null;
│               Resource resource = null;
│               try {
│                       // Load the resource through the editing domain.
│                       //
│                       resource = editingDomain.getResourceSet().getResource(resourceURI, true);
│               }
│               catch (Exception e) {
⋮
│       public Diagnostic analyzeResourceProblems(Resource resource, Exception exception) {
│               boolean hasErrors = !resource.getErrors().isEmpty();
│               if (hasErrors || !resource.getWarnings().isEmpty()) {
│                       BasicDiagnostic basicDiagnostic =
│                               new BasicDiagnostic
│                                       (hasErrors ? Diagnostic.ERROR : Diagnostic.WARNING,
│                                        "org.omg.sysml.editor",
│                                        0,
│                                        getString("_UI_CreateModelError_message", resource.getURI()),
│                                        new Object [] { exception == null ? (Object)resource : exception });
⋮
│       @Override
│       public void createPages() {
⋮
│               if (!getEditingDomain().getResourceSet().getResources().isEmpty()) {
│                       // Create a page for the selection tree view.
│                       //
│                       {
│                               ViewerPane viewerPane =
│                                       new ViewerPane(getSite().getPage(), SysMLEditor.this) {
│                                               @Override
│                                               public Viewer createViewer(Composite composite) {
│                                                       Tree tree = new Tree(composite, SWT.MULTI);
│                                                       TreeViewer newTreeViewer = new TreeViewer(tree);
│                                                       return newTreeViewer;
│                                               }
│                                               @Override
│                                               public void requestActivation() {
│                                                       super.requestActivation();
⋮
│                       {
│                               ViewerPane viewerPane =
│                                       new ViewerPane(getSite().getPage(), SysMLEditor.this) {
│                                               @Override
│                                               public Viewer createViewer(Composite composite) {
│                                                       Tree tree = new Tree(composite, SWT.MULTI);
│                                                       TreeViewer newTreeViewer = new TreeViewer(tree);
│                                                       return newTreeViewer;
│                                               }
│                                               @Override
│                                               public void requestActivation() {
│                                                       super.requestActivation();
⋮
│                       {
│                               ViewerPane viewerPane =
│                                       new ViewerPane(getSite().getPage(), SysMLEditor.this) {
│                                               @Override
│                                               public Viewer createViewer(Composite composite) {
│                                                       return new ListViewer(composite);
│                                               }
│                                               @Override
│                                               public void requestActivation() {
│                                                       super.requestActivation();
│                                                       setCurrentViewerPane(this);
│                                               }
⋮
│                       {
│                               ViewerPane viewerPane =
│                                       new ViewerPane(getSite().getPage(), SysMLEditor.this) {
│                                               @Override
│                                               public Viewer createViewer(Composite composite) {
│                                                       return new TreeViewer(composite);
│                                               }
│                                               @Override
│                                               public void requestActivation() {
│                                                       super.requestActivation();
│                                                       setCurrentViewerPane(this);
│                                               }
⋮
│                       {
│                               ViewerPane viewerPane =
│                                       new ViewerPane(getSite().getPage(), SysMLEditor.this) {
│                                               @Override
│                                               public Viewer createViewer(Composite composite) {
│                                                       return new TableViewer(composite);
│                                               }
│                                               @Override
│                                               public void requestActivation() {
│                                                       super.requestActivation();
│                                                       setCurrentViewerPane(this);
│                                               }
⋮
│                       {
│                               ViewerPane viewerPane =
│                                       new ViewerPane(getSite().getPage(), SysMLEditor.this) {
│                                               @Override
│                                               public Viewer createViewer(Composite composite) {
│                                                       return new TreeViewer(composite);
│                                               }
│                                               @Override
│                                               public void requestActivation() {
│                                                       super.requestActivation();
│                                                       setCurrentViewerPane(this);
│                                               }
⋮
│                       getSite().getShell().getDisplay().asyncExec
│                               (new Runnable() {
│                                        @Override
│                                        public void run() {
│                                                if (!getContainer().isDisposed()) {
│                                                        setActivePage(0);
│                                                }
│                                        }
⋮
│               getContainer().addControlListener
│                       (new ControlAdapter() {
│                               boolean guard = false;
│                               @Override
│                               public void controlResized(ControlEvent event) {
│                                       if (!guard) {
│                                               guard = true;
│                                               hideTabs();
│                                               guard = false;
│                                       }
│                               }
⋮
│               getSite().getShell().getDisplay().asyncExec
│                       (new Runnable() {
│                                @Override
│                                public void run() {
│                                        updateProblemIndication();
│                                }
⋮
│       protected void hideTabs() {
│               if (getPageCount() <= 1) {
│                       setPageText(0, "");
│                       if (getContainer() instanceof CTabFolder) {
│                               Point point = getContainer().getSize();
│                               Rectangle clientArea = getContainer().getClientArea();
│                               getContainer().setSize(point.x,  2 * point.y - clientArea.height - clientArea.y);
│                       }
│               }
⋮
│       protected void showTabs() {
│               if (getPageCount() > 1) {
│                       setPageText(0, getString("_UI_SelectionPage_label"));
│                       if (getContainer() instanceof CTabFolder) {
│                               Point point = getContainer().getSize();
│                               Rectangle clientArea = getContainer().getClientArea();
│                               getContainer().setSize(point.x, clientArea.height + clientArea.y);
│                       }
│               }
⋮
│       @Override
│       protected void pageChange(int pageIndex) {
⋮
│       @Override
│       public <T> T getAdapter(Class<T> key) {
⋮
│       public IContentOutlinePage getContentOutlinePage() {
│               if (contentOutlinePage == null) {
│                       // The content outline is just a tree.
│                       //
│                       class MyContentOutlinePage extends ContentOutlinePage {
│                               @Override
│                               public void createControl(Composite parent) {
│                                       super.createControl(parent);
│                                       contentOutlineViewer = getTreeViewer();
│                                       contentOutlineViewer.addSelectionChangedListener(this);
│
│                                       // Set up the tree viewer.
│                                       //
│                                       contentOutlineViewer.setUseHashlookup(true);
⋮
│                               @Override
│                               public void makeContributions(IMenuManager menuManager, IToolBarManager toolBarManager, IStatus
⋮
│                               @Override
│                               public void setActionBars(IActionBars actionBars) {
⋮
│                       contentOutlinePage.addSelectionChangedListener
│                               (new ISelectionChangedListener() {
│                                        // This ensures that we handle selections correctly.
│                                        //
│                                        @Override
│                                        public void selectionChanged(SelectionChangedEvent event) {
│                                                handleContentOutlineSelection(event.getSelection());
│                                        }
⋮
│       public IPropertySheetPage getPropertySheetPage() {
│               PropertySheetPage propertySheetPage =
│                       new ExtendedPropertySheetPage(editingDomain, ExtendedPropertySheetPage.Decoration.NONE, null, 0,
│                               @Override
│                               public void setSelectionToViewer(List<?> selection) {
│                                       SysMLEditor.this.setSelectionToViewer(selection);
│                                       SysMLEditor.this.setFocus();
│                               }
│
│                               @Override
│                               public void setActionBars(IActionBars actionBars) {
│                                       super.setActionBars(actionBars);
⋮
│       public void handleContentOutlineSelection(ISelection selection) {
│               if (currentViewerPane != null && !selection.isEmpty() && selection instanceof IStructuredSelectio
│                       Iterator<?> selectedElements = ((IStructuredSelection)selection).iterator();
│                       if (selectedElements.hasNext()) {
│                               // Get the first selected element.
│                               //
│                               Object selectedElement = selectedElements.next();
│
│                               // If it's the selection viewer, then we want it to select the same selection as this selection
│                               //
⋮
│       @Override
│       public boolean isDirty() {
⋮
│       @Override
│       public void doSave(IProgressMonitor progressMonitor) {
⋮
│               WorkspaceModifyOperation operation =
│                       new WorkspaceModifyOperation() {
│                               // This is the method that gets invoked when the operation runs.
│                               //
│                               @Override
│                               public void execute(IProgressMonitor monitor) {
│                                       // Save the resources to the file system.
│                                       //
│                                       boolean first = true;
│                                       List<Resource> resources = editingDomain.getResourceSet().getResources();
│                                       for (int i = 0; i < resources.size(); ++i) {
⋮
│       protected boolean isPersisted(Resource resource) {
│               boolean result = false;
│               try {
│                       InputStream stream = editingDomain.getResourceSet().getURIConverter().createInputStream(resource
│                       if (stream != null) {
│                               result = true;
│                               stream.close();
│                       }
│               }
│               catch (IOException e) {
⋮
│       @Override
│       public boolean isSaveAsAllowed() {
⋮
│       @Override
│       public void doSaveAs() {
⋮
│       protected void doSaveAs(URI uri, IEditorInput editorInput) {
│               (editingDomain.getResourceSet().getResources().get(0)).setURI(uri);
│               setInputWithNotify(editorInput);
│               setPartName(editorInput.getName());
│               IProgressMonitor progressMonitor =
│                       getActionBars().getStatusLineManager() != null ?
│                               getActionBars().getStatusLineManager().getProgressMonitor() :
│                               new NullProgressMonitor();
│               doSave(progressMonitor);
⋮
│       @Override
│       public void gotoMarker(IMarker marker) {
⋮
│       @Override
│       public void init(IEditorSite site, IEditorInput editorInput) {
⋮
│       @Override
│       public void setFocus() {
⋮
│       @Override
│       public void addSelectionChangedListener(ISelectionChangedListener listener) {
⋮
│       @Override
│       public void removeSelectionChangedListener(ISelectionChangedListener listener) {
⋮
│       @Override
│       public ISelection getSelection() {
⋮
│       @Override
│       public void setSelection(ISelection selection) {
⋮
│       public void setStatusLineManager(ISelection selection) {
│               IStatusLineManager statusLineManager = currentViewer != null && currentViewer == contentOutlineVi
│                       contentOutlineStatusLineManager : getActionBars().getStatusLineManager();
│
│               if (statusLineManager != null) {
│                       if (selection instanceof IStructuredSelection) {
│                               Collection<?> collection = ((IStructuredSelection)selection).toList();
│                               switch (collection.size()) {
│                                       case 0: {
│                                               statusLineManager.setMessage(getString("_UI_NoObjectSelected"));
⋮
│       private static String getString(String key) {
│               return SysMLEditorPlugin.INSTANCE.getString(key);
⋮
│       private static String getString(String key, Object s1) {
│               return SysMLEditorPlugin.INSTANCE.getString(key, new Object [] { s1 });
⋮
│       @Override
│       public void menuAboutToShow(IMenuManager menuManager) {
⋮
│       public EditingDomainActionBarContributor getActionBarContributor() {
│               return (EditingDomainActionBarContributor)getEditorSite().getActionBarContributor();
⋮
│       public IActionBars getActionBars() {
│               return getActionBarContributor().getActionBars();
⋮
│       public AdapterFactory getAdapterFactory() {
│               return adapterFactory;
⋮
│       @Override
│       public void dispose() {
⋮
│       protected boolean showOutlineView() {
│               return true;
⋮

org.omg.sysml.editor/src/org/omg/sysml/lang/sysml/presentation/SysMLEditorPlugin.java:
⋮
│public final class SysMLEditorPlugin extends EMFPlugin {
│       /**
│        * Keep track of the singleton.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public static final SysMLEditorPlugin INSTANCE = new SysMLEditorPlugin();
│       
│       /**
⋮
│       @Override
│       public ResourceLocator getPluginResourceLocator() {
⋮
│       public static Implementation getPlugin() {
│               return plugin;
⋮
│       public static class Implementation extends EclipseUIPlugin {
│               /**
│                * Creates an instance.
│                * <!-- begin-user-doc -->
│                * <!-- end-user-doc -->
│                * @generated
│                */
│               public Implementation() {
│                       super();
│       
⋮

org.omg.sysml.editor/src/org/omg/sysml/lang/sysml/presentation/SysMLModelWizard.java:
⋮
│public class SysMLModelWizard extends Wizard implements INewWizard {
│       /**
│        * The supported extensions for created files.
│        * <!-- begin-user-doc -->
│        * <!-- end-user-doc -->
│        * @generated
│        */
│       public static final List<String> FILE_EXTENSIONS =
│               Collections.unmodifiableList(Arrays.asList(SysMLEditorPlugin.INSTANCE.getString("_UI_SysMLEditorF
│
⋮
│       @Override
│       public void init(IWorkbench workbench, IStructuredSelection selection) {
⋮
│       protected Collection<String> getInitialObjectNames() {
│               if (initialObjectNames == null) {
│                       initialObjectNames = new ArrayList<String>();
│                       for (EClassifier eClassifier : sysMLPackage.getEClassifiers()) {
│                               if (eClassifier instanceof EClass) {
│                                       EClass eClass = (EClass)eClassifier;
│                                       if (!eClass.isAbstract()) {
│                                               initialObjectNames.add(eClass.getName());
│                                       }
│                               }
⋮
│       protected EObject createInitialModel() {
│               EClass eClass = (EClass)sysMLPackage.getEClassifier(initialObjectCreationPage.getInitialObjectNam
│               EObject rootObject = sysMLFactory.create(eClass);
│               return rootObject;
⋮
│       @Override
│       public boolean performFinish() {
│               try {
│                       // Remember the file.
│                       //
│                       final IFile modelFile = getModelFile();
│
│                       // Do the work within an operation.
│                       //
│                       WorkspaceModifyOperation operation =
│                               new WorkspaceModifyOperation() {
│                                       @Override
│                                       protected void execute(IProgressMonitor progressMonitor) {
│                                               try {
│                                                       // Create a resource set
│                                                       //
│                                                       ResourceSet resourceSet = new ResourceSetImpl();
│
│                                                       // Get the URI of the model file.
│                                                       //
⋮
│                       if (activePart instanceof ISetSelectionTarget) {
│                               final ISelection targetSelection = new StructuredSelection(modelFile);
│                               getShell().getDisplay().asyncExec
│                                       (new Runnable() {
│                                                @Override
│                                                public void run() {
│                                                        ((ISetSelectionTarget)activePart).selectReveal(targetSelection);
│                                                }
│                                        });
⋮
│       public class SysMLModelWizardNewFileCreationPage extends WizardNewFileCreationPage {
│               /**
│                * Pass in the selection.
│                * <!-- begin-user-doc -->
│                * <!-- end-user-doc -->
│                * @generated
│                */
│               public SysMLModelWizardNewFileCreationPage(String pageId, IStructuredSelection selection) {
│                       super(pageId, selection);
│               }
│
⋮
│               @Override
│               protected boolean validatePage() {
⋮
│               public IFile getModelFile() {
│                       return ResourcesPlugin.getWorkspace().getRoot().getFile(getContainerFullPath().append(getFileNam
⋮
│       public class SysMLModelWizardInitialObjectCreationPage extends WizardPage {
│               /**
│                * <!-- begin-user-doc -->
│                * <!-- end-user-doc -->
│                * @generated
│                */
│               protected Combo initialObjectField;
│
│               /**
│                * @generated
⋮
│               @Override
│               public void createControl(Composite parent) {
⋮
│               protected ModifyListener validator =
│                       new ModifyListener() {
│                               @Override
│                               public void modifyText(ModifyEvent e) {
│                                       setPageComplete(validatePage());
│                               }
⋮
│               protected boolean validatePage() {
│                       return getInitialObjectName() != null && getEncodings().contains(encodingField.getText());
⋮
│               @Override
│               public void setVisible(boolean visible) {
⋮
│               public String getInitialObjectName() {
│                       String label = initialObjectField.getText();
│
│                       for (String name : getInitialObjectNames()) {
│                               if (getLabel(name).equals(label)) {
│                                       return name;
│                               }
│                       }
│                       return null;
⋮
│               public String getEncoding() {
│                       return encodingField.getText();
⋮
│               protected String getLabel(String typeName) {
│                       try {
│                               return SysMLEditPlugin.INSTANCE.getString("_UI_" + typeName + "_type");
│                       }
│                       catch(MissingResourceException mre) {
│                               SysMLEditorPlugin.INSTANCE.log(mre);
│                       }
│                       return typeName;
⋮
│               protected Collection<String> getEncodings() {
│                       if (encodings == null) {
│                               encodings = new ArrayList<String>();
│                               for (StringTokenizer stringTokenizer = new StringTokenizer(SysMLEditorPlugin.INSTANCE.getString
│                                       encodings.add(stringTokenizer.nextToken());
│                               }
│                       }
│                       return encodings;
⋮
│               @Override
│       public void addPages() {
⋮
│       public IFile getModelFile() {
│               return newFileCreationPage.getModelFile();
⋮
```
