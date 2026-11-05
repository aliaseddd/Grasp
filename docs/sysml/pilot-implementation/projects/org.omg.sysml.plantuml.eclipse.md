# Repo map: org.omg.sysml.plantuml.eclipse

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.plantuml.eclipse`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.plantuml.eclipse) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 11 files there; aider read the 11 that `pilot.aiderignore` leaves in, and the map shows 11 of them, 4 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.plantuml.eclipse/.classpath

org.omg.sysml.plantuml.eclipse/.project

org.omg.sysml.plantuml.eclipse/.settings/org.eclipse.core.resources.prefs

org.omg.sysml.plantuml.eclipse/.settings/org.eclipse.jdt.core.prefs

org.omg.sysml.plantuml.eclipse/.settings/org.eclipse.m2e.core.prefs

org.omg.sysml.plantuml.eclipse/META-INF/MANIFEST.MF

org.omg.sysml.plantuml.eclipse/build.properties:
│source.. = src/
│output.. = target/classes/
│bin.includes = META-INF/,\
│               .,\
⋮

org.omg.sysml.plantuml.eclipse/plugin.xml

org.omg.sysml.plantuml.eclipse/src/org/omg/sysml/plantuml/eclipse/Activator.java:
⋮
│public class Activator implements BundleActivator {
│
│    //private BundleContext bundleContext;
│    private static Activator _default;
│
│    public static Activator getDefault() {
│        return _default;
│    }
│
│    /**
⋮
│    @Override
│    public void start(BundleContext context) throws Exception {
⋮
│    @Override
│    public void stop(BundleContext context) throws Exception {
⋮
│    private synchronized Element get(String id) {
│        return elementsMap.get(id);
⋮
│    private synchronized String register(EObject eObj) {
│        if (!(eObj instanceof Element)) return null;
│        Element e = (Element) eObj;
│        String id = e.getElementId();
│        if (id == null) return null;
│        elementsMap.put(id, e);
│        return id;
⋮
│    public static EObject findEObject(String id) {
│        return getDefault().get(id);
⋮
│    public static String registerEObject(EObject eObj) {
│        return getDefault().register(eObj);
⋮

org.omg.sysml.plantuml.eclipse/src/org/omg/sysml/plantuml/eclipse/SysMLDiagramLinkOpener.java:
⋮
│public class SysMLDiagramLinkOpener implements ILinkOpener {
│    public static final String SYSML_PLINK_SCHEME = "psysml";
│
│    private URI getURI(LinkData link) {
│        try {
│            return URI.createURI(link.href);
│        } catch (IllegalArgumentException e) {
│        }
│        return null;
│    }
│
│    public static URI getEObjectLink(EObject eObj) {
│        String id = Activator.registerEObject(eObj);
│        if (id == null) return null;
│        return URI.createGenericURI(SYSML_PLINK_SCHEME, id, null);
⋮
│    @Override
│    public int supportsLink(LinkData link) {
⋮
│    private IPath getPath(EObject eObj) {
│        Resource r = eObj.eResource();
│        if (r == null) return null;
│
│        URI uri = r.getURI();
│        uri = r.getResourceSet().getURIConverter().normalize(uri);
│        int size = uri.segmentCount();
│        if ((size > 1)
│            && ("platform".equals(uri.scheme()))
│            && ("resource".equals(uri.segment(0)))) {
⋮
│    private EObject getEObject(URI uri) {
│        String str = uri.opaquePart();
│        if (str == null) return null;
│        return Activator.findEObject(str);
⋮
│    @Override
│    public void openLink(LinkData link) {
⋮

org.omg.sysml.plantuml.eclipse/src/org/omg/sysml/plantuml/eclipse/SysMLDiagramTextProvider.java:
⋮
│public class SysMLDiagramTextProvider extends AbstractEcoreClassDiagramTextProvider implements Diag
│    public SysMLDiagramTextProvider() {
│        super(IEditorPart.class);
│    }
│
│    @Override
│    public boolean supportsSelection(final ISelection selection) {
│        return selection instanceof ITextSelection || selection instanceof IStructuredSelection;
│    }
│    
│    // @Override
│    public boolean supportsPath(IPath path) {
│        String ext = path.getFileExtension();
│        return "sysml".equals(ext) || "sysmlx".equals(ext);
⋮
│    private static class LinkProvider implements SysML2PlantUMLLinkProvider {
│        @Override
│        public String getLinkString(EObject eObj) {
│            URI uri = SysMLDiagramLinkOpener.getEObjectLink(eObj);
│            if (uri == null) return null;
│            return uri.toString();
│        }
│
│        @Override
│        public String getText(EObject eObj) {
⋮
│    private static List<String> getModeNames() {
│        SysML2PlantUMLText.MODE[] modes = SysML2PlantUMLText.MODE.values();
│        int len = modes.length;
│        ArrayList<String> ret = new ArrayList<String>(len);
│        for (int i = 0; i < len; i++) {
│            ret.add(modes[i].name());
│        }
│        return ret;
⋮
│    @Override
│    public Collection<String> getViews() {
⋮
│       @Override
│       public void setView(String view) {
⋮
│    private String getDiagramXtext(XtextEditor xe, ISelection selection, Map<String, Object> marker
│        XtextResource res = xe.getDocument().readOnly(new IUnitOfWork<XtextResource, XtextResource>
│            @Override
│            public XtextResource exec(XtextResource st) {
│                return st;
│            }
│        });
│
│        if (selection instanceof ITextSelection) {
│            ITextSelection its = (ITextSelection) selection;
⋮
│    private String getDiagram(List<? extends EObject> eObjs) {
│        if (eObjs == null) return null;
│        sysml2PlantUMLText.setMode(mode);
│        return sysml2PlantUMLText.sysML2PUML(eObjs);
⋮
│    private String getDiagramFromSelection(IStructuredSelection selection, Map<String, Object> mark
│        final Object obj = selection.getFirstElement();
│        if (obj instanceof EObject) {
│            EObject eObj = (EObject) obj;
│            if (markerAttributes != null) {
│                markerAttributes.put("eObjectUri", EcoreUtil.getURI(eObj).toString());
│            }
│            sysml2PlantUMLText.setupVisualizationEObjects(eObj);
│            // Visualize eObj only.
│            return getDiagram(Arrays.asList(eObj));
⋮
│    private String getDiagramFromEditingDomain(IEditingDomainProvider provider, Map<String, Object>
│               ResourceSet rset = provider.getEditingDomain().getResourceSet();
│        sysml2PlantUMLText.setMode(mode);
│        List<EObject> eObjs = new ArrayList<>();
│        Iterator<Notifier> it = rset.getAllContents();
│        while (it.hasNext()) {
│            Notifier n = it.next();
│            if (n instanceof EObject) {
│                eObjs.add((EObject) n);
│            }
⋮
│    @Override
│    public String getDiagramText(IEditorPart editorPart, ISelection selection, Map<String, Object> 
⋮
│    public String getDiagramText(IPath path) {
│        URI uri = URI.createPlatformResourceURI(path.toString(), true);
│        ResourceSet resourceSet = new ResourceSetImpl();
│        Resource res = resourceSet.getResource(uri, true);
│        return sysml2PlantUMLText.sysML2PUML(res.getContents());
⋮
│       @Override
│       public Collection<String> getStyles() {
⋮
│       @Override
│       public boolean isStyleEnabled(String style) {
⋮
│       @Override
│       public void setStyle(String style) {
⋮
│       @Override
│       public void disableStyle(String style) {
⋮
```
