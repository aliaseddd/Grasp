# Repo map: org.omg.sysml.plantuml

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`org.omg.sysml.plantuml`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/org.omg.sysml.plantuml) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 35 files there; aider read the 35 that `pilot.aiderignore` leaves in, and the map shows 16 of them, 16 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
org.omg.sysml.plantuml/build.properties:
│source.. = src/
│output.. = target/classes/
│bin.includes = META-INF/,\
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/CompartmentEntry.java:
⋮
│class CompartmentEntry implements Comparable<CompartmentEntry> {
│    public final Feature f;
│    public final OwningMembership om;
│    public final String alias;
│    public final String prefix;
│    public final boolean isInherited;
│
│    public String getParameterPrefix() {
│        FeatureDirectionKind fdk = f.getDirection();
│        if ((om instanceof SubjectMembership)
⋮
│    public int compareTo(CompartmentEntry o) {
│        int v = owningMembershipCompare(om, o.om);
│        if (v != 0) return v;
│        v = featureCompare(f, o.f);
│        if (v != 0) return v;
│        if (alias == null) {
│            if (o.alias == null) return 0;
│            return -1;
│        }
│        if (o.alias == null) return 1;
⋮
│    public void add(CompartmentEntry fe) {
│        if (children == null) {
│            children = new ArrayList<CompartmentEntry>();
│        }
│        children.add(fe);
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/InheritKey.java:
⋮
│class InheritKey {
│    public final Type[] keys;
│    /* If isDirect, the last key directly owns the target feature.
│       Otherwise, the last key is denoted as ^ow. */
│    private final boolean isDirect;
│
│    private static boolean containsWithRedefined(List<Feature> fs, Feature ft) {
│        for (Feature f : fs) {
│            if (f.equals(ft)) return true;
│            if (matchRedefined(f, ft)) return true;
│        }
│        return false;
⋮
│    private static List<Feature> belongingFeatures(Type typ) {
│        List<Feature> fs = new ArrayList<>();
│        for (Relationship rel : Visitor.toOwnedRelationshipArray(typ)) {
│            if (rel instanceof FeatureMembership
│                || rel instanceof FeatureValue) {
│                for (Element tgt: rel.getTarget()) {
│                    fs.add((Feature) tgt);
│                }
│            }
│        }
⋮
│    private static boolean isBelonging(Type typ, Feature f) {
│        if (containsWithRedefined(belongingFeatures(typ), f)) return true;
│        // if (typ.getOwnedFeature().contains(f)) return true;
│        if (containsWithRedefined(typ.getInheritedFeature(), f)) return true;
│        // if (typ.getInheritedFeature().contains(f)) return true;
│        return false;
⋮
│    private static boolean isBelonging(Type typ, Membership ms) {
│        if (typ.getOwnedMembership().contains(ms)) return true;
│        if (typ.getInheritedMembership().contains(ms)) return true;
│        return false;
⋮
│    @Override
│    public int hashCode() {
⋮
│    private static int findKeyType(List<Namespace> ctx, Feature ref) {
│        for (int i = ctx.size() - 1; i >=0; i--) {
│            Namespace ns = ctx.get(i);
│            if (!(ns instanceof Type)) continue;
│            Type typ = (Type) ns;
│            if (isBelonging(typ, ref)) return i;
│        }
│        return -1;
⋮
│    private static int findKeyType(List<Namespace> ctx, Membership ref) {
│        for (int i = ctx.size() - 1; i >=0; i--) {
│            Namespace ns = ctx.get(i);
│            if (!(ns instanceof Type)) continue;
│            Type typ = (Type) ns;
│            if (isBelonging(typ, ref)) return i;
│        }
│        return -1;
⋮
│    private static Type identifyRedefiningTargetOwner(Type redefinedOwner, Feature f, boolean showI
│        for (Specialization sp: redefinedOwner.getOwnedSpecialization()) {
│            Type g = sp.getGeneral();
│            if (showInherited) {
│                if (isBelonging(g, f)) return g;
│            } else {
│                if (containsWithRedefined(belongingFeatures(g), f)) return g;
│            }
│        }
│        return null;
⋮
│    @Override
│    public String toString() {
⋮
│    private static InheritKey constructInternal(List<Namespace> ctx, List<Integer> inheritIdices, i
│        if (idx < 0) return null;
│        for (int i = inheritIdices.size(); i > 0; i--) {
│            int idx2 = inheritIdices.get(i - 1);
│            if (idx2 == idx) {
│                // case of [t0, t1, ..., t_idx2 == ^ow]
│                return new InheritKey(ctx, inheritIdices, i);
│            } else if (idx2 < idx) {
│                // case of [t0, t1, ..., t_idx2, ^ow)
│                Type typ = (Type) ctx.get(idx);
⋮
│    private static boolean matchRedefined(Feature f, Feature ft) {
│        Set<Feature> redefs = FeatureUtil.getAllRedefinedFeaturesOf(f);
│        return redefs.contains(ft);
⋮
│    public static boolean matchElementWithRedefined(Element e, Element et) {
│        if (e.equals(et)) return true;
│        if ((e instanceof Feature) && (et instanceof Feature)) {
│            return matchRedefined((Feature) e, (Feature) et);
│        }
│        return false;
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/PRelation.java:
⋮
│class PRelation {
│    public final InheritKey ik;
│    private final Object src;
│    private final Object dest;
│    public final Element rel;
│
│    public Element getSrcElement() {
│        if (src instanceof Element) {
│            return (Element) src;
│        } else {
⋮
│    public String getDescription() {
│        return description;
⋮
│    private static String makeIdStr(Integer ii) {
│        return 'E' + ii.toString();
⋮
│    private String compElemId(SysML2PlantUMLText s2p, Element e) {
│        if (e == null) return "[*]";
│        Integer ii = s2p.getVPath().getId(ik, e);
│        if (ii == null) {
│            if (!s2p.checkId(e)) {
│                if (e instanceof Feature) {
│                       Feature f = (Feature) e;
│                       if (!f.isEnd()) return null;
│                    e = ConnectorUtil.getRelatedFeatureOfEnd(f);
│                    if (e == null) return null;
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/SysML2PlantUMLLinkProvider.java:
⋮
│public interface SysML2PlantUMLLinkProvider {
│    /* Provider must return a proper link string navigatable to eObj.
│     * It would be embedded in PlantUML text and then in generated diagrams.*/
│    String getLinkString(EObject eObj);
│
│    String getText(EObject eObj);
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/SysML2PlantUMLStyle.java:
⋮
│public class SysML2PlantUMLStyle {
│    private static Map<String, SysML2PlantUMLStyle> styleMap = new HashMap<String, SysML2PlantUMLSt
│    private static List<SysML2PlantUMLStyle> styles = new ArrayList<SysML2PlantUMLStyle>();
│    private static SysML2PlantUMLStyle defaultStyle;
│
│    static {
│        addp(null,
│             "Standard B&&W",
│             "skin sysmlbw\n"
│             + "skinparam monochrome true\n"
⋮
│    public static class StyleSwitch {
│        public final StyleRelSwitch styleRelSwitch;
│        public final StyleStereotypeSwitch styleStereotypeSwitch;
│
│        public StyleSwitch(StyleRelSwitch styleRelSwitch,
│                           StyleStereotypeSwitch styleStereotypeSwitch) {
│            this.styleRelSwitch = styleRelSwitch;
│            this.styleStereotypeSwitch = styleStereotypeSwitch;
│        }
⋮
│    public static abstract class StyleRelSwitch extends SysMLSwitch<String> {
⋮
│    public static abstract class StyleStereotypeSwitch extends SysMLSwitch<String> {
│        protected String defaultStr() {
│            return " <<";
│        }
⋮
│    private static Map<String, String> convOptions(String[] options) {
│        if (options == null) return null;
│        int size = options.length / 2;
│        Map<String, String> map = new HashMap<String, String>(size);
│        for (int i = 0; i < options.length;) {
│            map.put(options[i], options[i + 1]);
│            i += 2;
│        }
│        return map;
⋮
│    public boolean isPrimary() {
│        return kind == Kind.PRIMARY;
⋮
│    private static String getAvailableStyles() {
│        return String.join(", ", styleMap.keySet());
⋮
│    public static SysML2PlantUMLStyle get(String name) {
│        SysML2PlantUMLStyle s = styleMap.get(name.toUpperCase());
│        if (s != null) return s;
│
│        throw new IllegalArgumentException("Invalid Style: "
│                                           + name
│                                           + " Possible styles: "
│                                           + getAvailableStyles());
⋮
│    public static class StyleRelDefaultSwitch extends StyleRelSwitch {
│        @Override
│        public String caseOwningMembership(OwningMembership m) {
│            return " +-- ";
│        }
│
│               @Override
│        public String caseMembership(Membership m) {
│            return " +.. ";
│        }
│
⋮
│    public static class StyleStereotypeDefaultSwitch extends StyleStereotypeSwitch {
│               @Override
│               public String caseClass(Class object) {
│            if (SysMLPackage.Literals.CLASS.equals(object.eClass())) return " ";
│            return null;
│               }
│
│               @Override
│               public String caseAcceptActionUsage(AcceptActionUsage aau) {
│            return " accept action>> ";
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/SysML2PlantUMLText.java:
⋮
│public class SysML2PlantUMLText {
│    public enum MODE {
│        Default,
│        Tree,
│        State,
│        Interconnection,
│        Action,
│        Sequence,
│        Case,
│        MIXED;
⋮
│    private void enableStyle() {
│        styleSwitch = null;
│        styleValueMap.clear();
│        for (int i = 0; i < styles.size(); i++) {
│            SysML2PlantUMLStyle style = styles.get(i);
│            if (style.styleSwitch != null) {
│                styleSwitch = style.styleSwitch;
│            }
│            if (style.options != null) {
│                styleValueMap.putAll(style.options);
⋮
│    private void resetStyle(SysML2PlantUMLStyle style) {
│        if (!style.isPrimary()) return;
│        SysML2PlantUMLStyle[] ss = new SysML2PlantUMLStyle[styles.size()];
│        ss = styles.toArray(ss);
│        for (int i = 0; i < ss.length; i++) {
│            SysML2PlantUMLStyle s = ss[i];
│            if (s.isPrimary()) {
│                styles.remove(i);
│            }
│        }
⋮
│    private SysML2PlantUMLStyle getVisitorStyle() {
│        if (currentVisitor == null) return null;
│        return currentVisitor.getStyle();
⋮
│    String getRelStyle(Element e) {
│        String ret;
│        SysML2PlantUMLStyle vStyle = getVisitorStyle();
│        if (vStyle != null) {
│            StyleSwitch ss = vStyle.styleSwitch;
│            if ((ss != null) && (ss.styleRelSwitch != null)) {
│                ret = ss.styleRelSwitch.doSwitch(e);
│                if (ret != null) return ret;
│            }
│        }
⋮
│    public static String getStereotypeName(Type typ) {
│        EClass eCls = typ.eClass();
│        String str = eCls.getName();
│        if (str == null) return "";
│        if (str.isEmpty()) return str;
│        Matcher m = patMetaclassName.matcher(str);
│        if (m.matches()) {
│            str = m.group(2);
│            if (str == null) {
│                str = m.group(3);
⋮
│    private String individualPrefix(Type typ) {
│        if (typ instanceof OccurrenceUsage) {
│            OccurrenceUsage ou = (OccurrenceUsage) typ;
│            String str;
│            PortionKind pk = ou.getPortionKind();
│            if (pk == PortionKind.TIMESLICE) {
│                str = " timeslice";
│            } else if (pk == PortionKind.SNAPSHOT) {
│                str = " snapshot";
│            } else {
⋮
│    public static String getMetadataUsageName(Element e) {
│        StringBuilder sb = null;
│        for (Element oe: e.getOwnedElement()) {
│            if (!(oe instanceof MetadataUsage)) continue;
│            MetadataUsage mu = (MetadataUsage) oe;
│
│            if (!VMetadata.isEmptyMetadata(mu)) continue; /// Only empty MetadataUsage is rendered 
│            List<FeatureTyping> tt = mu.getOwnedTyping();
│            for (FeatureTyping ft: tt) {
│                if (ft == null) continue;
⋮
│    private static void appendVariation(StringBuilder sb, Type typ) {
│        if (typ instanceof Usage) {
│            Usage u = (Usage) typ;
│            if (!u.isVariation()) return;
│        } else if (typ instanceof Definition) {
│            Definition d = (Definition) typ;
│            if (d instanceof EnumerationDefinition // Do not render <<variation>> for EnumerationDe
│               || !d.isVariation()) return;
│        } else {
│            return;
⋮
│    private String addStereotypeStyle(StringBuilder sb, Type typ) {
│        String ss = getStereotypeStyle(typ);
│        if (ss == null) {
│            appendVariation(sb, typ);
│            sb.append(" <<(T,blue)");
│            sb.append(individualPrefix(typ));
│        } else if (" ".equals(ss)) {
│            return ss;
│        } else {
│            appendVariation(sb, typ);
⋮
│    String styleString(Type typ) {
│        StringBuilder sb = new StringBuilder();
│        String mName = getMetadataUsageName(typ);
│        if (mName == null) {
│            addStereotypeStyle(sb, typ);
│        } else {
│            if (showMetaclass) {
│                addStereotypeStyle(sb, typ);
│            }
│            sb.append(mName);
⋮
│    String styleValue(String key) {
│        return styleValueMap.get(key);
⋮
│    String getLinkStr(EObject eObj) {
│        if (linkProvider == null) return null;
│        return linkProvider.getLinkString(eObj);
⋮
│    private void initStyle() {
│        if (styles.isEmpty()) {
│            clearStyle();
│            addStyle(SysML2PlantUMLStyle.getDefault());
│        }
⋮
│    private static boolean isNamespace(EObject eObj) {
│        return eObj instanceof org.omg.sysml.lang.sysml.Namespace;
⋮
│    private List<EObject> setupVisualizationMode(EObject eObj) {
│        MODE mode = getMode(eObj);
│        setMode(mode);
│        return Arrays.asList(eObj);
⋮
│    VPath getVPath() {
│        return vpath;
⋮
│    private class IDMap {      
│        private final Map<Element, Integer> idMap = new HashMap<Element, Integer>();
│        private final IDMap prev;
│
│        boolean checkId(Element e) {
│            if (idMap.containsKey(e)) return true;
│            if (prev == null) return false;
│            return prev.checkId(e);
│        }
│
│        private Integer lookupId(Element e) {
│            Integer ii = idMap.get(e);
│            if (ii != null) return ii;
│            if (prev == null) return null;
│            return prev.lookupId(e);
⋮
│    void setInherited(boolean flag) {
│        this.inherited = flag;
│    }
│    boolean isInherited() {
│        return inherited;
⋮
│    private boolean exceedsTheLimit() {
│        return numVisits > MAX_VISITS;
⋮
│    Namespace getCurrentNamespace() {
│        int size = namespaces.size();
│        if (size == 0) return null;
│        return namespaces.get(size - 1);
⋮
│    void popNamespace() {
│        int idx = namespaces.size() - 1;
│        namespaces.remove(idx);
│        int sizeI = inheritingIdices.size();
│        if (sizeI == 0) return;
│        sizeI--;
│        int idxI = inheritingIdices.get(sizeI);
│        if (idxI == idx) {
│            inheritingIdices.remove(sizeI);
│        }
⋮
│    InheritKey makeInheritKey(Feature tgt) {
│        return InheritKey.construct(namespaces, inheritingIdices, tgt);
⋮
│    InheritKey makeInheritKey(Membership tgt) {
│        return InheritKey.construct(namespaces, inheritingIdices, tgt);
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VBehavior.java:
⋮
│public abstract class VBehavior extends VDefault {
│    protected boolean isDoneAction(Feature f) {
│        return f != null && f.specializesFromLibrary("Actions::Action::done");
│    }
│
│    protected boolean isStartAction(Feature f) {
│        return f != null && f.specializesFromLibrary("Actions::Action::start");
│    }
│
│    protected boolean isEntryAction(ActionUsage au) {
⋮
│    private static boolean appendNameAndType(StringBuilder sb, Feature f, String defaultName) {
│        if (f == null) return false;
│        String name = getName(f);
│
│        if (name != null) {
│            if (defaultName == null || !name.equals(defaultName)) {
│                sb.append(name);
│                appendFeatureType(sb, ": ", f);
│                return true;
│            }
⋮
│    private static class LineFoldStringBuilder {
│       private StringBuilder sb = new StringBuilder();
│        private static int LINEFOLD_LEN = 20;
│        private int curLen;
│        public void fold() {
│            if (curLen <= LINEFOLD_LEN) return;
│            sb.append("\\n");
│            curLen = 0;
│        }
│
│        public void append(String s) {
│            curLen += s.length();
│            sb.append(s);
⋮
│        public void append(char ch) {
│            curLen++;
│            sb.append(ch);
⋮
│        @Override
│        public String toString() {
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VCompartment.java:
⋮
│public class VCompartment extends VStructure {
│    private List<VTree> subtrees = new ArrayList<VTree>();
│
│    private VTree parent;
│
│    private Type currentType;
│
│    private final boolean compartmentMost;
│
│    protected boolean isCompartmentMost() {
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VComposite.java:
⋮
│public class VComposite extends VMixed {
│    private static final SysML2PlantUMLStyle style
│    = new SysML2PlantUMLStyle
│    ("VComposite",
│      null,
│     "skinparam ranksep 10\n"
│     + "skinparam rectangle {\n backgroundColor<<block>> LightGreen\n}\n",
│     new StyleSwitch(null, new StyleStereotypeSwitch() {
│         @Override
│         public String casePartUsage(PartUsage object) {
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VDefault.java:
⋮
│public class VDefault extends VTraverser {
│    protected void addConnector(Element rel, Connector c, String desc) {
│        List<Feature> ends = c.getConnectorEnd();
│        int size = ends.size();
│        if (size >= 2) {
│            Feature end1 = ends.get(0);
│            if (end1 == null) return;
│            for (int i = 1; i < size; i++) {
│                Feature end2 = ends.get(i);
│                if (end2 == null) continue;
│                addPRelation(end1, end2, rel, desc);
⋮
│    protected void addConnector(Connector c, String desc) {
│        addConnector(c, c, desc);
⋮
│    protected int addPUMLLine(Type typ, String keyword, String name, String style) {
│        append(keyword);
│        int id = addNameWithId(typ, name, true);
│        if (style != null) {
│            append(style);
│        }
│        addLink(typ);
│        return id;
⋮
│    protected int addPUMLLine(Type typ, String keyword, String name) {
│        return addPUMLLine(typ, keyword, name, styleString(typ));
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VMetadata.java:
⋮
│public class VMetadata extends Visitor {
│    private final boolean hideMetadata;
│    
│    public VMetadata(Visitor v) {
│       super(v, true);
│        hideMetadata = styleBooleanValue("hideMetadata");
│       }
│    
│    private static final String metadataTitle = "«metadata»";
│    private static final int INDENT = 2;
│
⋮
│    public static boolean isEmptyMetadata(MetadataFeature mf) {
│        return mf.getOwnedMembership().isEmpty();
⋮
│    public boolean isHidden(MetadataFeature mf) {
│        return hideMetadata || isEmptyMetadata(mf);
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VPath.java:
⋮
│public class VPath extends VTraverser {
│    public static Expression getRefTarget(Expression e) {
│        if ((e instanceof FeatureChainExpression)
│            || (e instanceof FeatureReferenceExpression)) return e;
│        return null;
│    }
│
│    private boolean initialized;
│
│    // PC (PathContext) management. 
│    private abstract class PC {
│        private final Element idTarget;
│
│        // If it's true, PC does consider Redefinition when it match with idTarget.
│        // This is used for Redefinition.
│        protected final boolean noRedefine;
│
│        private PC next;
│        private PC prev;
│        public void setPrev(PC prev) {
⋮
│        protected abstract Element getTarget();
│
⋮
│    private class PCFeatureChainExpression extends PC {
│        private final FeatureChainExpression fce;
│
│        private Expression getTargetExp() {
│            List<Expression> ops = fce.getArgument();
│            if (ops.isEmpty()) {
│               return null;
│            } else {
│               return ops.get(0);
│            }
⋮
│        @Override
│        protected Element getTarget() {
⋮
│    private class PCFeature extends PC {
│        private final Feature f;
│
│        @Override
│        protected Element getTarget() {
│            return f;
│        }
│
│        @Override
│        protected PC getNext() {
⋮
│    private class PCFeatureChain extends PC {
│        private final List<FeatureChaining> fcs;
│        private final int index;
│
│        @Override
│        protected Element getTarget() {
│            FeatureChaining fc = fcs.get(index);
│            return fc.getChainingFeature();
│        }
│
⋮
│    private class PCTerminal extends PC {
│        @Override
│        protected boolean isTerminal() {
│            return true;
│        }
│        @Override
│        protected Element getTarget() {
│            return null;
│        }
│        @Override
⋮
│    private class PCFlowEnd extends PC {
│        private final Feature ioTarget;
│        private final PC basePC;
│
│        public PCFlowEnd(FlowEnd ife, PC basePC, Feature ioTarget) {
│            super(ife, false);
│            this.basePC = basePC;
│            this.ioTarget = ioTarget;
│        }
│
⋮
│        @Override
│        protected Element getTarget() {
⋮
│    private class PCInheritKey extends PC {
│        public final InheritKey ik;
│        private final PC pc;
│
│        @Override
│        protected PC getNext() {
│            return pc;
│        }
│
│        @Override
⋮
│        @Override
│        protected Element getTarget() {
⋮
│    private class PCNamespace extends PC {
│        public final Namespace ns;
│        private final PC pc;
│
│        @Override
│        protected PC getNext() {
│            return pc;
│        }
│
│        @Override
⋮
│        @Override
│        protected Element getTarget() {
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VSequence.java:
⋮
│public class VSequence extends VDefault {
│    private static final SysML2PlantUMLStyle style
│    = new SysML2PlantUMLStyle
│    ("VSequence",
│      null,
│     "skinparam roundcorner 20\n"
│     + "skinparam BoxPadding 20\n"
│     + "skinparam SequenceBoxBackgroundColor #white\n"
│     + "skinparam style strictuml\n"
│     + "skinparam maxMessageSize 100\n",
⋮
│    @Override
│    protected String getString() {
⋮
│    private static class FCMessage {
│        public final boolean isSource;
│        public final FlowUsage fcu;
│        public final Feature[] chains;
│        public final Type inheriting;
│
│        private Element getTarget(int i) {
│            if (i >= 0) return chains[i];
│            Element e = chains[0];
│            for (int k = 0; k > i; k--) {
│                e = e.getOwner();
│                if (e == null) return null;
│            }
│            return e;
⋮
│        @Override
│        public int hashCode() {
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/VStateMachine.java:
⋮
│public class VStateMachine extends VDefault {
│    private final boolean showStereotype;
│
│    private void addState(Type typ, boolean isParallel, boolean withStyle) {
│        String name = getNameAnyway(typ);
│        if (isParallel) {
│            name = name + "\\n" + "<b>parallel</b>";
│        }
│        int id = addRecLine(name, typ, withStyle);
│        addSpecializations(id, typ);
⋮

org.omg.sysml.plantuml/src/org/omg/sysml/plantuml/Visitor.java:
⋮
│public abstract class Visitor extends SysMLSwitch<String> {
│    private SysML2PlantUMLText s2p = null;
│
│    public void setSysML2PlantUMLText(SysML2PlantUMLText s2p) {
│        this.s2p = s2p;
│    }
│
│    public enum MultiplicityStyle {
│        NONE,
│        DEFAULT,
│
⋮
│    protected void append(String str) {
│        sb.append(str);
⋮
│    protected void append(char ch) {
│        sb.append(ch);
⋮
│    protected void append(Object o) {
│        sb.append(o);
⋮
│    protected void append(String str, int st, int end) {
│        sb.append(str, st, end);
⋮
│    private void addContext(Visitor v) {
│        if (contexts != null) {
│            contexts.add(v);
│        } else {
│            prev.addContext(v);
│        }
⋮
│    protected String getString() {
│        if (prev == null) {
│            flushPRelations(true);
│            flushContexts();
│            sb.append(pRelationsSB);
│            pRelationsSB.setLength(0);
│        }
│        return sb.toString();
⋮
│    protected VPath getVPath() {
│        return s2p.getVPath();
⋮
│    protected Namespace getCurrentNamespace() {
│        return s2p.getCurrentNamespace();
⋮
│    protected void popNamespace() {
│        s2p.popNamespace();
⋮
│    protected InheritKey makeInheritKey(Feature ref) {
│        return s2p.makeInheritKey(ref);
⋮
│    protected InheritKey makeInheritKey(Membership ref) {
│        return s2p.makeInheritKey(ref);
⋮
│    protected void setInherited(boolean flag) {
│        s2p.setInherited(flag);
⋮
│    protected boolean isInherited() {
│        return s2p.isInherited();
⋮
│    protected String styleString(Type typ) {
│        return s2p.styleString(typ);
⋮
│    protected String styleValue(String option) {
│        return s2p.styleValue(option);
⋮
│    protected boolean styleBooleanValue(String option) {
│        return s2p.styleValue(option) != null;
⋮
│    private String quote0Str(String s) {
│        if (s.indexOf('\n') >= 0) {
│            // Replace nonsafe NL to "\n"
│            s = s.replace("\n", "\\n");
│        }
│        if (s.indexOf('"') >= 0) {
│            // Replace nonsafe " to ''
│            return s.replace("\"", "''");
│        }
│        return s;
⋮
│    public static Feature getSpecialReference(Element e) {
│        if (!(e instanceof PerformActionUsage
│              || e instanceof ExhibitStateUsage
│              || e instanceof EventOccurrenceUsage
│              || e instanceof IncludeUseCaseUsage
│              || e instanceof AssertConstraintUsage
│              || e instanceof SatisfyRequirementUsage)) return null;
│        Feature f = (Feature) e;
│        if (f.getDeclaredName() != null) return null;
│        if (f.getDeclaredShortName() != null) return null;
⋮
│    protected int addNameWithId(Element e, String name, boolean force) {
│        Feature ref = getSpecialReference(e);
│        if (ref != null) {
│            String refName = getRefName(ref, null);
│            if (refName != null) name = refName;
│        }
│        quote(name);
│        append(" as ");
│        int id = addIdStr(e, force);
│        append(' ');
⋮
│    protected void closeBlock() {
│        if (prev == null) return;
│        prev.sb.append("{\n");
│        prev.sb.append(sb);
│        prev.sb.append("}\n");
│        close();
⋮
│    protected int addIdStr(Element e, boolean force) {
│        return appendId(sb, e, force);
⋮
│    protected PRelation addPRelation(PRelation pr) {
│        pRelations.add(pr);
│        return pr;
⋮
│    protected PRelation addPRelation(InheritKey ik, Element src, Element dest, Element rel, String 
│        PRelation pr = new PRelation(ik, src, dest, rel, description);
│        pRelations.add(pr);
│        return pr;
⋮
│    protected PRelation addPRelation(Element src, Element dest, Element rel, String description) {
│        if (rel instanceof Feature) {
│            return addPRelation(makeInheritKey((Feature) rel), src, dest, rel, description);
│        } else if (rel instanceof Membership) {
│            return addPRelation(makeInheritKey((Membership) rel), src, dest, rel, description);
│        } else {
│            return addPRelation(null, src, dest, rel, description);
│        }
⋮
│    protected PRelation addPRelation(Element src, Element dest, Element rel) {
│        return addPRelation(src, dest, rel, null);
⋮
│    private void addMultiplicityStringOnEdge(StringBuilder ss, Element e) {
│        if (!showsMultiplicity(false)) return;
│        String str = getMultiplicityString(e);
│        if (str == null) return;
│        ss.append('"');
│        ss.append(quote0Str(str));
│        ss.append('"');
⋮
│    protected static String getFeatureName(Feature f) {
│        return f.getName();
⋮
│    protected String getNameAnyway(Element e, boolean creole, boolean isInherited) {
│        String ret = null;
│        String shortName = e.getShortName();
│        if (e.equals(fullyQualifiedElement)) {
│            ret = e.getQualifiedName();
│        }
│        if (ret == null) {
│            ret = getName(e);
│        }
│        if (shortName != null) {
⋮
│    protected String getNameAnyway(Element e) {
│        return getNameAnyway(e, true, isInherited());
⋮
│    private static String getFeatureChainName(List<FeatureChaining> fcs) {
│        StringBuilder sb = new StringBuilder();
│        for (FeatureChaining fc : fcs) {
│            if (sb.length() > 0) {
│                sb.append('.');
│            }
│            sb.append(fc.getChainingFeature().getName());
│        }
│        return sb.toString();
⋮
│    protected static String getFeatureChainName(Feature f) {
│        String name = f.getName();
│        if (name != null) return name;
│        for (Subsetting ss: f.getOwnedSubsetting()) {
│            Feature sf = ss.getSubsettedFeature();
│            List<FeatureChaining> fcs = sf.getOwnedFeatureChaining();
│            if (fcs.isEmpty()) continue;
│            return getFeatureChainName(fcs);
│        }
│        return null;
⋮
│    protected static String getRefName(Feature f, org.omg.sysml.lang.sysml.Namespace enclosingNs) {
│        List<FeatureChaining> fcs = f.getOwnedFeatureChaining();
│        if (fcs.isEmpty()) return getNameWithNamespace(f, enclosingNs);
│        return getFeatureChainName(fcs);
⋮
│    protected static boolean appendFeatureType(StringBuilder sb, String prefix, Feature f) {
│        List<FeatureTyping> tt = f.getOwnedTyping();
│        if (tt.isEmpty()) return false;
│        boolean added = false;
│        for (FeatureTyping ft: tt) {
│            if (ft == null) continue;
│            Type typ = ft.getType();
│            if (typ == null) continue;
│            String typeName = typ.getName();
│            if (typeName == null) continue;
⋮
│    private boolean outputPRelation(StringBuilder ss, PRelation pr) {
│        if (pr.isInvalid()) return true;
│
│        String srcId = pr.compSrcId(s2p);
│        if (srcId == null) return false;
│        String destId = pr.compDestId(s2p);
│        if (destId == null) return false;
│
│        String relStr = getRelStyle(pr.rel);
│        if (relStr == null) return true;
│        
⋮
│    private void flushPRelations(boolean last) {
│        PRelation[] prs = new PRelation[pRelations.size()];
│        prs = pRelations.toArray(prs);
│        pRelations.clear();
│
│        for (PRelation pr: prs) {
│            if (!outputPRelation(pRelationsSB, pr)) {
│                pRelations.add(pr);
│            }
│        }
⋮
│    public static Relationship[] toOwnedRelationshipArray(Element e) {
│        List<Relationship> rels = e.getOwnedRelationship();
│        Relationship[] array = new Relationship[rels.size()];
│        return rels.toArray(array);
⋮
```
