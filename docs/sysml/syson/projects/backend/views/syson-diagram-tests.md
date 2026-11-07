# Repo map: backend/views/syson-diagram-tests

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/views/syson-diagram-tests`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/views/syson-diagram-tests) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 27 files there; aider read the 27 that `syson.aiderignore` leaves in, and the map shows 27 of them, 14 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/views/syson-diagram-tests/.checkstyle

backend/views/syson-diagram-tests/.classpath

backend/views/syson-diagram-tests/.project

backend/views/syson-diagram-tests/.settings/org.eclipse.core.resources.prefs

backend/views/syson-diagram-tests/.settings/org.eclipse.core.runtime.prefs

backend/views/syson-diagram-tests/.settings/org.eclipse.jdt.apt.core.prefs

backend/views/syson-diagram-tests/.settings/org.eclipse.jdt.core.prefs

backend/views/syson-diagram-tests/.settings/org.eclipse.jdt.ui.prefs

backend/views/syson-diagram-tests/.settings/org.eclipse.m2e.core.prefs

backend/views/syson-diagram-tests/.settings/org.springframework.ide.eclipse.prefs

backend/views/syson-diagram-tests/pom.xml

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/AQLExpressi
⋮
│public class AQLExpressionCallsExistingServicesChecker extends AbstractChecker<String> {
│
│    private static final String AQL_PREFIX = "aql:";
│
│    private final Set<String> aqlDefaultServiceNames;
│
│    private final List<Class<?>> diagramServiceClasses;
│
│    public AQLExpressionCallsExistingServicesChecker(List<Class<?>> diagramServiceClasses) {
│        IQueryEnvironment environment = Query.newEnvironmentWithDefaultServices(new SimpleCrossRefe
⋮
│    @Override
│    public void check(String expression) {
⋮
│    private boolean isDiagramServiceClassMethod(String serviceName) {
│        for (Class<?> diagramServiceClass : this.diagramServiceClasses) {
│            for (Method method : diagramServiceClass.getMethods()) {
│                if (Modifier.isPublic(method.getModifiers())) {
│                    if (method.getName().equals(serviceName)) {
│                        return true;
│                    }
│                }
│            }
│        }
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/AbstractChe
⋮
│public abstract class AbstractChecker<T> implements Checker<T> {
│
│    @Override
│    public abstract void check(T element);
│
│    /**
│     * Checks the invariant on the provided {@code elements}.
│     * <p>
│     * This method checks all the elements and collects the errors. This ensures that when the chec
│     * all the invalid elements instead of the first one.
⋮
│    @Override
│    public void checkAll(Collection<T> elements) {
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/Checker.jav
⋮
│public interface Checker<T> {
│
│    void check(T element);
│
│    void checkAll(Collection<T> elements);
│
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/DiagramDesc
⋮
│public class DiagramDescriptionHasDropToolChecker extends AbstractChecker<DiagramDescription> {
│
│    @Override
│    public void check(DiagramDescription diagramDescription) {
│        assertThat(diagramDescription.getPalette())
│                .as("DiagramDescription should have a palette")
│                .isNotNull()
│                .extracting(DiagramPalette::getDropTool)
│                .as("DiagramDescription should have a drop tool")
│                .isNotNull();
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/EdgeDescrip
⋮
│public class EdgeDescriptionHasDirectEditToolChecker extends AbstractChecker<EdgeDescription> {
│
│    @Override
│    public void check(EdgeDescription edgeDescription) {
│        assertThat(edgeDescription.getPalette())
│                .as("EdgeDescription %s should have a palette", edgeDescription.getName())
│                .isNotNull()
│                .extracting(EdgePalette::getCenterLabelEditTool)
│                .as("EdgeDescription %s should have a center label edit tool", edgeDescription.getN
│                .isNotNull();
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/EdgeDescrip
⋮
│public class EdgeDescriptionHasReconnectToolChecker extends AbstractChecker<EdgeDescription> {
│
│    private int expectedReconnectToolCount;
│
│    public EdgeDescriptionHasReconnectToolChecker withExpectedReconnectToolCount(int reconnectToolC
│        this.expectedReconnectToolCount = reconnectToolCount;
│        return this;
│    }
│
│    @Override
│    public void check(EdgeDescription edgeDescription) {
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/NodeDescrip
⋮
│public class NodeDescriptionHasChildrenChecker extends AbstractChecker<NodeDescription> {
│
│    private int expectedChildCountLowerBound;
│
│    public NodeDescriptionHasChildrenChecker withExpectedChildCountLowerBound(int childCountLowerBo
│        this.expectedChildCountLowerBound = childCountLowerBound;
│        return this;
│    }
│
│    @Override
│    public void check(NodeDescription nodeDescription) {
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/NodeDescrip
⋮
│public class NodeDescriptionHasDeleteToolChecker extends AbstractChecker<NodeDescription> {
│
│    @Override
│    public void check(NodeDescription nodeDescription) {
│        assertThat(nodeDescription.getPalette())
│                .as("NodeDescription %s should have a palette", nodeDescription.getName())
│                .isNotNull()
│                .extracting(NodePalette::getDeleteTool)
│                .as("NodeDescription %s should have a delete tool", nodeDescription.getName())
│                .isNotNull();
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/NodeDescrip
⋮
│public class NodeDescriptionHasDirectEditToolChecker extends AbstractChecker<NodeDescription> {
│
│    @Override
│    public void check(NodeDescription nodeDescription) {
│        assertThat(nodeDescription.getPalette())
│                .as("NodeDescription %s should have a palette", nodeDescription.getName())
│                .isNotNull()
│                .extracting(NodePalette::getLabelEditTool)
│                .as("NodeDescription %s should have a label edit tool", nodeDescription.getName())
│                .isNotNull();
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/NodeDescrip
⋮
│public class NodeDescriptionHasDropNodeToolChecker extends AbstractChecker<NodeDescription> {
│
│    @Override
│    public void check(NodeDescription nodeDescription) {
│        assertThat(nodeDescription.getPalette())
│                .as("NodeDescription %s should have a palette", nodeDescription.getName())
│                .isNotNull()
│                .extracting(NodePalette::getDropNodeTool)
│                .as("NodeDescription %s should have a graphical drag & drop tool", nodeDescription.
│                .isNotNull();
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/NodeDescrip
⋮
│public class NodeDescriptionHasNameChecker extends AbstractChecker<NodeDescription> {
│
│    private String expectedPrefix;
│
│    public NodeDescriptionHasNameChecker withExpectedPrefix(String prefix) {
│        this.expectedPrefix = prefix;
│        return this;
│    }
│
│    @Override
│    public void check(NodeDescription nodeDescription) {
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/NodeDescrip
⋮
│public class NodeDescriptionIsReusedByChecker extends AbstractChecker<NodeDescription> {
│
│    private final DiagramDescription diagramDescription;
│
│    private int expectedReuserCountLowerBound;
│
│    public NodeDescriptionIsReusedByChecker(DiagramDescription diagramDescription) {
│        this.diagramDescription = diagramDescription;
│    }
│
│    public NodeDescriptionIsReusedByChecker withExpectedReuserCountLowerBound(int reuserCountLowerB
│        this.expectedReuserCountLowerBound = reuserCountLowerBound;
│        return this;
⋮
│    @Override
│    public void check(NodeDescription nodeDescription) {
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/checkers/NodeDescrip
⋮
│public class NodeDescriptionReusesChecker extends AbstractChecker<NodeDescription> {
│
│    private int expectedReuseCount;
│
│    public NodeDescriptionReusesChecker withExpectedReuseCount(int reuseCount) {
│        this.expectedReuseCount = reuseCount;
│        return this;
│    }
│
│    @Override
│    public void check(NodeDescription nodeDescription) {
⋮

backend/views/syson-diagram-tests/src/main/java/org/eclipse/syson/diagram/tests/predicates/DiagramPr
⋮
│public class DiagramPredicates {
│
│    private final Predicate<NodeDescription> isFakeNode;
│
│    private final Predicate<NodeDescription> isEmptyDiagramNode;
│
│    private final Predicate<NodeDescription> isCompartmentNode;
│
│    private final Predicate<NodeDescription> isInheritedCompartmentItemNode;
│
⋮
│    public Predicate<NodeDescription> isFakeNode() {
│        return this.isFakeNode;
⋮
│    public Predicate<NodeDescription> isEmptyDiagramNode() {
│        return this.isEmptyDiagramNode;
⋮
│    public Predicate<NodeDescription> isCompartmentNode() {
│        return this.isCompartmentNode;
⋮
│    public Predicate<NodeDescription> isInheritedCompartmentItemNode() {
│        return this.isInheritedCompartmentItemNode;
⋮
│    public Predicate<NodeDescription> isInheritedBorderNode() {
│        return this.isInheritedBorderNode;
⋮
│    public Predicate<NodeDescription> getIsNamespaceImportNode() {
│        return this.isNamespaceImportNode;
⋮
│    public Predicate<NodeDescription> isStartOrDoneNode() {
│        return this.isStartOrDoneNode;
⋮
│    public Predicate<DiagramElementDescription> hasDomainType(EClass eClass) {
│        return diagramElementDescription -> diagramElementDescription.getDomainType().equals(SysMLM
⋮
│    public Predicate<DiagramElementDescription> hasName(String name) {
│        return diagramElementDescription -> diagramElementDescription.getName().equals(name);
⋮
│    private String getCompartmentNameFragment(IDescriptionNameGenerator nameGenerator) {
│        EClass element = SysmlPackage.eINSTANCE.getElement();
│        EReference reference = SysmlPackage.eINSTANCE.getElement_Documentation();
│        String fullName = nameGenerator.getCompartmentName(element, reference);
│
│        return fullName
│                .replace(element.getName(), "")
│                .replace(reference.getName(), "")
│                .strip()
│                .concat(" ");
⋮
│    private String getInheritedCompartmentItemNameFragment(IDescriptionNameGenerator nameGenerator)
│        EClass element = SysmlPackage.eINSTANCE.getElement();
│        EReference reference = SysmlPackage.eINSTANCE.getElement_Documentation();
│        String fullName = nameGenerator.getInheritedCompartmentItemName(element, reference);
│
│        return fullName.replace(element.getName(), "")
│                .replace(reference.getName(), "")
│                .strip()
│                .concat(" ");
⋮
│    private String getInheritedBorderNodeNameFragment(IDescriptionNameGenerator nameGenerator) {
│        EClass element = SysmlPackage.eINSTANCE.getElement();
│        String fullName = nameGenerator.getInheritedBorderNodeName(element);
│
│        return fullName.replace(element.getName(), "")
│                .strip()
│                .concat(" ");
⋮

backend/views/syson-diagram-tests/src/main/resources/.gitkeep

backend/views/syson-diagram-tests/src/test/resources/.gitkeep
```
