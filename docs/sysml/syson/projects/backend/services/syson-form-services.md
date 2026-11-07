# Repo map: backend/services/syson-form-services

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`backend/services/syson-form-services`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/backend/services/syson-form-services) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 24 files there; aider read the 24 that `syson.aiderignore` leaves in, and the map shows 24 of them, 11 with definitions. [The README](../../../README.md) says how to read it and what it leaves out.

```text
backend/services/syson-form-services/.checkstyle

backend/services/syson-form-services/.classpath

backend/services/syson-form-services/.project

backend/services/syson-form-services/.settings/org.eclipse.core.resources.prefs

backend/services/syson-form-services/.settings/org.eclipse.core.runtime.prefs

backend/services/syson-form-services/.settings/org.eclipse.jdt.apt.core.prefs

backend/services/syson-form-services/.settings/org.eclipse.jdt.core.prefs

backend/services/syson-form-services/.settings/org.eclipse.jdt.ui.prefs

backend/services/syson-form-services/.settings/org.eclipse.m2e.core.prefs

backend/services/syson-form-services/.settings/org.springframework.ide.eclipse.prefs

backend/services/syson-form-services/pom.xml

backend/services/syson-form-services/src/main/java/org/eclipse/syson/form/services/CoreFeaturesSwitc
⋮
│public class CoreFeaturesSwitch extends SysmlSwitch<List<EStructuralFeature>> {
│
│    @Override
│    public List<EStructuralFeature> defaultCase(EObject object) {
│        return List.of();
│    }
│
│    @Override
│    public List<EStructuralFeature> caseComment(Comment object) {
│        var features = new ArrayList<EStructuralFeature>();
⋮
│    @Override
│    public List<EStructuralFeature> caseDependency(Dependency object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseElement(Element object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseFeature(Feature object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseFeatureChaining(FeatureChaining object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseFeatureValue(FeatureValue object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseFeatureTyping(FeatureTyping object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseLiteralBoolean(LiteralBoolean object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseLiteralInteger(LiteralInteger object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseLiteralRational(LiteralRational object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseLiteralString(LiteralString object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseMembership(Membership object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseMembershipImport(MembershipImport object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseNamespaceImport(NamespaceImport object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseOccurrenceDefinition(OccurrenceDefinition object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseOccurrenceUsage(OccurrenceUsage object) {
⋮
│    @Override
│    public List<EStructuralFeature> casePortConjugation(PortConjugation object) {
⋮
│    @Override
│    public List<EStructuralFeature> casePortUsage(PortUsage object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseRedefinition(Redefinition object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseReferenceSubsetting(ReferenceSubsetting object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseRequirementConstraintMembership(RequirementConstraintMember
⋮
│    @Override
│    public List<EStructuralFeature> caseRequirementDefinition(RequirementDefinition object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseRequirementUsage(RequirementUsage object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseSpecialization(Specialization object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseStateDefinition(StateDefinition object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseStateSubactionMembership(StateSubactionMembership object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseStateUsage(StateUsage object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseSubclassification(Subclassification object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseSubsetting(Subsetting object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseTextualRepresentation(TextualRepresentation object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseType(Type object) {
⋮
│    @Override
│    public List<EStructuralFeature> caseViewUsage(ViewUsage object) {
⋮

backend/services/syson-form-services/src/main/java/org/eclipse/syson/form/services/EStructuralFeatur
⋮
│public class EStructuralFeatureLabelProvider implements BiFunction<Element, EStructuralFeature, Str
│
│    private final List<Descriptor> composedAdapterFactoryDescriptors;
│
│    public EStructuralFeatureLabelProvider(List<Descriptor> composedAdapterFactoryDescriptors) {
│        this.composedAdapterFactoryDescriptors = Objects.requireNonNull(composedAdapterFactoryDescr
│    }
│
│    @Override
│    public String apply(Element element, EStructuralFeature eStructuralFeature) {
⋮

backend/services/syson-form-services/src/main/java/org/eclipse/syson/form/services/FormMutationEleme
⋮
│@Service
│public class FormMutationElementService {
│
⋮
│    public Element getOrCreateAcceptActionUsagePayloadFeatureTyping(AcceptActionUsage acceptActionU
│        this.checkAndRepairAcceptActionUsageStructure(acceptActionUsage);
│        ReferenceUsage payloadParameter = acceptActionUsage.getPayloadParameter();
│        if (payloadParameter == null) {
│            return null;
│        }
│        return payloadParameter.getOwnedRelationship().stream()
│                .filter(FeatureTyping.class::isInstance)
│                .map(FeatureTyping.class::cast)
│                .findFirst()
⋮
│    public Element getOrCreateAcceptActionUsageReceiverMembership(AcceptActionUsage acceptActionUsa
│        this.checkAndRepairAcceptActionUsageStructure(acceptActionUsage);
│        Expression receiverArgument = acceptActionUsage.getReceiverArgument();
│        if (receiverArgument == null) {
│            return null;
│        }
│        return receiverArgument.getOwnedRelationship().stream()
│                .filter(Membership.class::isInstance)
│                .map(Membership.class::cast)
│                .findFirst()
⋮
│    public Element handleFeatureTypingNewValue(Feature feature, Object newValue) {
│        if (!this.isValidTypedByValue(feature, newValue)) {
│            this.feedbackMessageService.addFeedbackMessage(new Message("Unable to update the value 
│            return feature;
│        }
│        EList<Relationship> ownedRelationship = feature.getOwnedRelationship();
│        FeatureTyping featureTyping = ownedRelationship.stream()
│                .filter(FeatureTyping.class::isInstance)
│                .map(FeatureTyping.class::cast)
│                .findFirst()
⋮
│    public Element handleReferenceWidgetNewValue(Element element, String eStructuralFeature, Object
│        this.setNewValue(element, element.eClass().getEStructuralFeature(eStructuralFeature), newVa
│        if (element.eContainer() instanceof Element parent) {
│            if (newValue instanceof Element elementToImport) {
│                this.metamodelMutationImportService.handleImport(parent, elementToImport);
│            } else if (newValue instanceof Collection<?> newValues) {
│                newValues.stream()
│                        .filter(Element.class::isInstance)
│                        .map(Element.class::cast)
│                        .forEach(elementToImport -> {
⋮
│    public boolean setAcceptActionUsagePayloadParameter(AcceptActionUsage acceptActionUsage, Elemen
│        if (newPayloadParameter instanceof Type newType) {
│            var payloadParam = acceptActionUsage.getPayloadParameter();
│            if (payloadParam != null) {
│                payloadParam.getOwnedRelationship().stream()
│                        .filter(FeatureTyping.class::isInstance)
│                        .map(FeatureTyping.class::cast)
│                        .findFirst()
│                        .ifPresent(ft -> ft.setType(newType));
│                return true;
⋮
│    public boolean setAcceptActionUsageReceiverArgument(AcceptActionUsage acceptActionUsage, Elemen
│        var receiverArgument = acceptActionUsage.getReceiverArgument();
│        if (receiverArgument != null) {
│            var m = receiverArgument.getOwnedRelationship().stream()
│                    .filter(Membership.class::isInstance)
│                    .map(Membership.class::cast)
│                    .findFirst()
│                    .orElse(null);
│            if (m != null) {
│                m.setMemberElement(newReceiverArgument);
⋮
│    public Element setNewCommentValue(Element self, String newValue) {
│        Comment comment = this.metamodelQueryElementService.getComment(self);
│        if (comment == null) {
│            var newComment = SysmlFactory.eINSTANCE.createComment();
│            newComment.setBody(newValue);
│            var owningMembership = SysmlFactory.eINSTANCE.createOwningMembership();
│            self.getOwnedRelationship().add(owningMembership);
│            owningMembership.getOwnedRelatedElement().add(newComment);
│        } else {
│            comment.setBody(newValue);
⋮
│    public Element setNewDocumentationValue(Element self, String newValue) {
│        var documentations = self.getDocumentation();
│        if (documentations.isEmpty()) {
│            var documentation = SysmlFactory.eINSTANCE.createDocumentation();
│            documentation.setBody(newValue);
│            var owningMembership = SysmlFactory.eINSTANCE.createOwningMembership();
│            self.getOwnedRelationship().add(owningMembership);
│            owningMembership.getOwnedRelatedElement().add(documentation);
│        } else {
│            documentations.get(0).setBody(newValue);
⋮
│    public boolean setNewValue(Element element, EStructuralFeature eStructuralFeature, Object newVa
│        try {
│            Object valueToSet = newValue;
│            if (!eStructuralFeature.isMany()) {
│                if (newValue instanceof List<?> newListValue) {
│                    valueToSet = newListValue.get(0);
│                }
│            }
│            if (eStructuralFeature.getEType() instanceof EEnum && eStructuralFeature.isUnsettable()
│                element.eUnset(eStructuralFeature);
⋮
│    public boolean setNewValue(Element element, String eStructuralFeatureName, Object newValue) {
│        EStructuralFeature eStructuralFeature = element.eClass().getEStructuralFeature(eStructuralF
│        if (eStructuralFeature != null) {
│            return this.setNewValue(element, eStructuralFeature, newValue);
│        } else {
│            this.feedbackMessageService.addFeedbackMessage(new Message("Unable to update the value 
│            return false;
│        }
⋮
│    public boolean setTransitionSourceParameter(TransitionUsage transitionUsage, Element newSource)
│        if (newSource instanceof ActionUsage au) {
│            // Update transition source
│            transitionUsage.getOwnedMembership().stream()
│                    .filter(Objects::nonNull)
│                    .findFirst()
│                    .ifPresent(mem -> mem.setMemberElement(au));
│            // Update succession source
│            Succession succession = transitionUsage.getSuccession();
│            succession.getFeatureMembership().stream()
⋮
│    public boolean setTransitionTargetParameter(TransitionUsage transitionUsage, Element newTarget)
│        if (newTarget instanceof ActionUsage au) {
│            // Update succession target
│            Succession succession = transitionUsage.getSuccession();
│            List<EndFeatureMembership> succFeatMemberships = succession.getFeatureMembership().stre
│                    .filter(EndFeatureMembership.class::isInstance)
│                    .map(EndFeatureMembership.class::cast)
│                    .toList();
│            if (succFeatMemberships.size() > 1) {
│                succFeatMemberships.get(1).getOwnedRelatedElement().stream()
⋮
│    public boolean setVisibilityValue(Element self, Object newValue) {
│        boolean result = false;
│        if (self instanceof Membership membership) {
│            result = this.setNewValue(membership, SysmlPackage.eINSTANCE.getMembership_Visibility()
│        }
│        return result;
⋮
│    public boolean clearTypedByReferenceWidget(Element self) {
│        var elementsToRemove = self.getOwnedRelationship().stream()
│                .filter(FeatureTyping.class::isInstance)
│                .map(FeatureTyping.class::cast)
│                .toList();
│
│        var iterator = elementsToRemove.iterator();
│        while (iterator.hasNext()) {
│            var next = iterator.next();
│            this.deleteService.deleteFromModel(next);
⋮
│    private void checkAndRepairAcceptActionUsagePayload(AcceptActionUsage aau) {
│        var payloadParam = aau.getOwnedRelationship().stream()
│                .filter(ParameterMembership.class::isInstance)
│                .map(ParameterMembership.class::cast)
│                .findFirst()
│                .orElse(null);
│        if (payloadParam == null) {
│            payloadParam = SysmlFactory.eINSTANCE.createParameterMembership();
│            aau.getOwnedRelationship().add(payloadParam);
│        }
⋮
│    private void checkAndRepairAcceptActionUsageReceiver(AcceptActionUsage aau) {
│        // find or create the second parameter membership
│        var paramList = aau.getOwnedRelationship().stream()
│                .filter(ParameterMembership.class::isInstance)
│                .map(ParameterMembership.class::cast)
│                .toList();
│        final ParameterMembership receiverParam;
│        if (paramList.size() < 2) {
│            receiverParam = SysmlFactory.eINSTANCE.createParameterMembership();
│            aau.getOwnedRelationship().add(receiverParam);
⋮
│    private void checkAndRepairAcceptActionUsageStructure(AcceptActionUsage aau) {
│        this.checkAndRepairAcceptActionUsagePayload(aau);
│        this.checkAndRepairAcceptActionUsageReceiver(aau);
⋮
│    private void handleImplied(Element element, EStructuralFeature eStructuralFeature) {
│        if (element instanceof Relationship relationship) {
│            if (SysmlPackage.eINSTANCE.getRedefinition_RedefinedFeature().equals(eStructuralFeature
│                relationship.setIsImplied(false);
│            } else if (SysmlPackage.eINSTANCE.getReferenceSubsetting_ReferencedFeature().equals(eSt
│                relationship.setIsImplied(false);
│            } else if (SysmlPackage.eINSTANCE.getSubsetting_SubsettedFeature().equals(eStructuralFe
│                relationship.setIsImplied(false);
│            } else if (SysmlPackage.eINSTANCE.getSubclassification_Superclassifier().equals(eStruct
│                relationship.setIsImplied(false);
⋮
│    private boolean isValidTypedByValue(Feature feature, Object newValue) {
│        EClass allowedType = this.formQueryElementService.getTypedByReference(feature).getEReferenc
│        if (newValue instanceof Collection<?> values) {
│            return !values.isEmpty() && values.stream().allMatch(allowedType::isInstance);
│        }
│        return allowedType.isInstance(newValue);
⋮

backend/services/syson-form-services/src/main/java/org/eclipse/syson/form/services/FormQueryElementS
⋮
│@Service
│public class FormQueryElementService {
│
⋮
│    public AcceptActionUsage getAcceptActionUsage(Element self) {
│        if (self instanceof AcceptActionUsage accept) {
│            return accept;
│        }
│        return null;
⋮
│    public List<EStructuralFeature> getAdvancedFeatures(Element element) {
│        List<EStructuralFeature> coreFeatures = new CoreFeaturesSwitch().doSwitch(element);
│        return element.eClass().getEAllStructuralFeatures().stream().filter(feature -> !coreFeature
⋮
│    public List<EStructuralFeature> getCoreFeatures(Element element) {
│        return new CoreFeaturesSwitch().doSwitch(element);
⋮
│    public String getDetailsViewHelpText(Element element, EStructuralFeature eStructuralFeature) {
│        return this.detailsViewHelpTextProviders.stream()
│                .filter(provider -> provider.canHandle(element, eStructuralFeature))
│                .findFirst()
│                .map(provider -> provider.getHelpText(element, eStructuralFeature))
│                .orElse("");
⋮
│    public String getDetailsViewLabel(Element element, EStructuralFeature eStructuralFeature) {
│        return this.getLabelProvider().apply(element, eStructuralFeature);
⋮
│    public List<EEnumLiteral> getEnumCandidates(Element element, EAttribute eAttribute) {
│        List<EEnumLiteral> candidates = new ArrayList<>();
│        if (eAttribute.getEAttributeType() instanceof EEnum eEnum) {
│            EList<EEnumLiteral> eLiterals = eEnum.getELiterals();
│            candidates.addAll(eLiterals);
│            if (eAttribute.isUnsettable()) {
│                candidates.add(this.unsetEnumLiteral);
│            }
│        }
│        return candidates;
⋮
│    public List<EEnumLiteral> getEnumCandidates(Element element, String eAttributeName) {
│        EStructuralFeature eStructuralFeature = element.eClass().getEStructuralFeature(eAttributeNa
│        if (eStructuralFeature instanceof EAttribute eAttribute) {
│            return this.getEnumCandidates(element, eAttribute);
│        }
│        return List.of();
⋮
│    public EEnumLiteral getEnumValue(Element element, EAttribute eAttribute) {
│        EEnumLiteral enumValue = null;
│        if (eAttribute.getEAttributeType() instanceof EEnum eEnum) {
│            Object eLiteralValue = element.eGet(eAttribute);
│            if (eLiteralValue != null) {
│                enumValue = eEnum.getEEnumLiteralByLiteral(eLiteralValue.toString());
│            } else if (eAttribute.isUnsettable()) {
│                enumValue = this.unsetEnumLiteral;
│            }
│        }
⋮
│    public EEnumLiteral getEnumValue(Element element, String eAttributeName) {
│        EStructuralFeature eStructuralFeature = element.eClass().getEStructuralFeature(eAttributeNa
│        if (eStructuralFeature instanceof EAttribute eAttribute) {
│            return this.getEnumValue(element, eAttribute);
│        }
│        return null;
⋮
│    public Element getExpression(Element self) {
│        if (self instanceof Expression && !(self instanceof Usage) && !(self instanceof Definition)
│            return self;
│        } else {
│            return null;
│        }
⋮
│    public String getExpressionTextualRepresentation(Expression expression) {
│        return this.getExpressionAsText(expression);
⋮
│    public FeatureValue getFeatureValue(Element self) {
│        FeatureValue result = null;
│        if (self instanceof FeatureValue featureValue && featureValue.getValue() != null) {
│            result = featureValue;
│        } else if (self instanceof Feature feature) {
│            result = feature.getOwnedRelationship().stream()
│                    .filter(FeatureValue.class::isInstance)
│                    .map(FeatureValue.class::cast)
│                    .findFirst()
│                    .orElse(null);
⋮
│    public Expression getGuardExpression(Element self) {
│        Expression result = null;
│        if (self instanceof TransitionFeatureMembership expressionMembership && expressionMembershi
│            result = expression;
│        } else if (self instanceof TransitionUsage transitionUsage && !transitionUsage.getGuardExpr
│            result = transitionUsage.getGuardExpression().get(0);
│        }
│        return result;
⋮
│    public Element getPotentialExpressionOwner(Element self) {
│        if (!this.readOnlyObjectPredicate.test(self) && this.metamodelQueryElementService.canContai
│                && !this.metamodelQueryElementService.hasSingleExpressionDefinition(self)) {
│            return self;
│        } else {
│            return null;
│        }
⋮
│    public Element getResultExpression(Element self) {
│        Element result = null;
│        if (self instanceof ResultExpressionMembership expressionMembership && expressionMembership
│            result = expressionMembership;
│        } else if (self instanceof Namespace namespace && this.metamodelQueryElementService.getResu
│                && this.metamodelQueryElementService.getResultExpressionMembership(namespace).getOw
│            result = this.metamodelQueryElementService.getResultExpressionMembership(namespace);
│        }
│        return result;
⋮
│    public String getResultExpressionTextualRepresentation(ResultExpressionMembership resultExpress
│        Expression value = resultExpression.getOwnedResultExpression();
│        return this.getExpressionAsText(value);
⋮
│    public StateUsage getStateUsage(Element self) {
│        if (self instanceof StateUsage su) {
│            return su;
│        }
│        return null;
⋮
│    public TransitionUsage getTransitionUsage(Element self) {
│        if (self instanceof TransitionUsage transition) {
│            return transition;
│        }
│        return null;
⋮
│    public EReference getTypedByReference(Feature feature) {
│        if (feature instanceof Usage) {
│            return Stream.concat(Stream.of(feature.eClass()), feature.eClass().getEAllSuperTypes().
│                    .map(this::getDefinitionReference)
│                    .flatMap(Optional::stream)
│                    .findFirst()
│                    .orElse(SysmlPackage.eINSTANCE.getFeature_Type());
│        }
│        return SysmlPackage.eINSTANCE.getFeature_Type();
⋮
│    public String getTypedByReferenceName(Feature feature) {
│        return this.getTypedByReference(feature).getName();
⋮
│    public String getValueExpressionTextualRepresentation(FeatureValue featureValue) {
│        Expression value = featureValue.getValue();
│        return this.getExpressionAsText(value);
⋮
│    public List<EEnumLiteral> getVisibilityEnumLiterals(Element self) {
│        List<EEnumLiteral> result = List.of();
│        if (self instanceof Membership membership) {
│            result = this.getEnumCandidates(membership, SysmlPackage.eINSTANCE.getMembership_Visibi
│        }
│        return result;
⋮
│    public Element getVisibilityPropertyOwner(Element self) {
│        if (!(self instanceof Import) && (self.eContainer() instanceof Membership membership)) {
│            return membership;
│        }
│        return null;
⋮
│    public EEnumLiteral getVisibilityValue(Element self) {
│        EEnumLiteral result = null;
│        if (self instanceof Membership membership) {
│            result = this.getEnumValue(membership, SysmlPackage.eINSTANCE.getMembership_Visibility(
│        }
│        return result;
⋮
│    public boolean isBooleanAttribute(EStructuralFeature eStructuralFeature) {
│        return eStructuralFeature instanceof EAttribute eAttribute && EcorePackage.Literals.EBOOLEA
⋮
│    public boolean isEnumAttribute(EStructuralFeature eStructuralFeature) {
│        return eStructuralFeature instanceof EAttribute eAttribute && eAttribute.getEType() instanc
⋮
│    public boolean isMultilineStringAttribute(Element element, EStructuralFeature eStructuralFeatur
│        boolean isMultiline = false;
│        isMultiline = this.isBodyField(eStructuralFeature);
│        return isMultiline;
⋮
│    public boolean isNumberAttribute(EStructuralFeature eStructuralFeature) {
│        var numericDataTypes = List.of(
│                EcorePackage.Literals.EINT,
│                EcorePackage.Literals.EINTEGER_OBJECT,
│                EcorePackage.Literals.EDOUBLE,
│                EcorePackage.Literals.EDOUBLE_OBJECT,
│                EcorePackage.Literals.EFLOAT,
│                EcorePackage.Literals.EFLOAT_OBJECT,
│                EcorePackage.Literals.ELONG,
│                EcorePackage.Literals.ELONG_OBJECT,
⋮
│    public boolean isReadOnly(EStructuralFeature eStructuralFeature) {
│        boolean isReadOnly = false;
│        if (SysmlPackage.eINSTANCE.getConjugation_ConjugatedType().equals(eStructuralFeature)) {
│            isReadOnly = true;
│        } else if (SysmlPackage.eINSTANCE.getPortConjugation_OriginalPortDefinition().equals(eStruc
│            isReadOnly = true;
│        } else if (SysmlPackage.eINSTANCE.getLibraryPackage_IsStandard().equals(eStructuralFeature)
│            // Based on KerML 8.3.4.13.3, this feature should be set for LibraryPackages in the sta
│            // Libraries or normative model libraries for a language built on KerML.
│            // SysON only allows to work with SysML at the moment, and does not support the definit
⋮
│    public boolean isReadOnly(Element element) {
│        return this.readOnlyObjectPredicate.test(element);
⋮
│    public boolean isReadOnly(Element element, EStructuralFeature eStructuralFeature) {
│        boolean isReadOnly = false;
│        if (eStructuralFeature != null) {
│            isReadOnly = isReadOnly || this.isReadOnly(eStructuralFeature);
│        }
│        if (element != null) {
│            isReadOnly = isReadOnly || this.isReadOnly(element);
│            if ((element instanceof StateUsage && SysmlPackage.eINSTANCE.getStateUsage_IsParallel()
│                    || (element instanceof StateDefinition && SysmlPackage.eINSTANCE.getStateDefini
│                isReadOnly = isReadOnly || ((Type) element).getOwnedFeature().stream().anyMatch(Tra
⋮
│    public boolean isReadOnlyStringAttribute(Element element, EStructuralFeature eStructuralFeature
│        if (eStructuralFeature instanceof EAttribute) {
│            EClassifier eType = eStructuralFeature.getEType();
│            boolean readOnlyProperty = false;
│            if (SysmlPackage.eINSTANCE.getElement_ElementId().equals(eStructuralFeature)) {
│                readOnlyProperty = true;
│            } else if (eStructuralFeature.isDerived() || !eStructuralFeature.isChangeable()) {
│                readOnlyProperty = true;
│            } else if (element instanceof ConjugatedPortDefinition) {
│                readOnlyProperty = true;
⋮
│    public boolean isReference(EStructuralFeature eStructuralFeature) {
│        return eStructuralFeature instanceof EReference eReference && !eReference.isContainment() &
⋮
│    public boolean isStringAttribute(Element element, EStructuralFeature eStructuralFeature) {
│        if (eStructuralFeature instanceof EAttribute && !eStructuralFeature.isMany() && !this.isMul
│            EClassifier eType = eStructuralFeature.getEType();
│            boolean readOnlyProperty = false;
│            if (SysmlPackage.eINSTANCE.getElement_ElementId().equals(eStructuralFeature)) {
│                readOnlyProperty = true;
│            } else if (eStructuralFeature.isDerived() || !eStructuralFeature.isChangeable()) {
│                readOnlyProperty = true;
│            } else if (element instanceof ConjugatedPortDefinition) {
│                readOnlyProperty = true;
⋮
│    public StyledString getStyledLabel(EClassifier eClassifier) {
│        return this.labelService.getStyledLabel(eClassifier);
⋮
│    private Optional<EReference> getDefinitionReference(EClass usageEClass) {
│        String usageName = usageEClass.getName();
│        if (!usageName.endsWith("Usage") || usageName.length() == "Usage".length()) {
│            return Optional.empty();
│        }
│        String definitionReferenceName = Character.toLowerCase(usageName.charAt(0)) + usageName.sub
│        return Optional.ofNullable(usageEClass.getEStructuralFeature(definitionReferenceName))
│                .filter(EReference.class::isInstance)
│                .map(EReference.class::cast);
⋮
│    private String getExpressionAsText(Expression expression) {
│        return this.metamodelQueryElementService.getExpressionTextualRepresentation(expression);
⋮
│    private BiFunction<Element, EStructuralFeature, String> getLabelProvider() {
│        return new EStructuralFeatureLabelProvider(this.composedAdapterFactoryDescriptors);
⋮
│    private boolean isBodyField(EStructuralFeature eStructuralFeature) {
│        return SysmlPackage.eINSTANCE.getTextualRepresentation_Body().equals(eStructuralFeature) ||
⋮

backend/services/syson-form-services/src/main/java/org/eclipse/syson/form/services/api/IDetailsViewH
⋮
│public interface IDetailsViewHelpTextProvider {
│
│    boolean canHandle(Element element, EStructuralFeature eStructuralFeature);
│
│    String getHelpText(Element element, EStructuralFeature eStructuralFeature);
│
⋮

backend/services/syson-form-services/src/main/java/org/eclipse/syson/form/services/aql/FormMutationA
⋮
│public class FormMutationAQLService {
│
│    private final FormMutationElementService formMutationElementService;
│
│    /**
│     * Creates a mutation AQL service.
│     *
│     * @param formMutationElementService
│     *            the shared form details element service
│     */
⋮
│    public boolean clearTypedByReferenceWidget(Element self) {
│        return this.formMutationElementService.clearTypedByReferenceWidget(self);
⋮
│    public Element getOrCreateAcceptActionUsagePayloadFeatureTyping(AcceptActionUsage usage) {
│        return this.formMutationElementService.getOrCreateAcceptActionUsagePayloadFeatureTyping(usa
⋮
│    public Element getOrCreateAcceptActionUsageReceiverMembership(AcceptActionUsage usage) {
│        return this.formMutationElementService.getOrCreateAcceptActionUsageReceiverMembership(usage
⋮
│    public Element handleFeatureTypingNewValue(Feature feature, Object value) {
│        return this.formMutationElementService.handleFeatureTypingNewValue(feature, value);
⋮
│    public Element handleReferenceWidgetNewValue(Element element, String featureName, Object value)
│        return this.formMutationElementService.handleReferenceWidgetNewValue(element, featureName, 
⋮
│    public boolean setAcceptActionUsagePayloadParameter(AcceptActionUsage usage, Element value) {
│        return this.formMutationElementService.setAcceptActionUsagePayloadParameter(usage, value);
⋮
│    public boolean setAcceptActionUsageReceiverArgument(AcceptActionUsage usage, Element value) {
│        return this.formMutationElementService.setAcceptActionUsageReceiverArgument(usage, value);
⋮
│    public Element setNewCommentValue(Element element, String value) {
│        return this.formMutationElementService.setNewCommentValue(element, value);
⋮
│    public Element setNewDocumentationValue(Element element, String value) {
│        return this.formMutationElementService.setNewDocumentationValue(element, value);
⋮
│    public boolean setNewValue(Element element, EStructuralFeature feature, Object value) {
│        return this.formMutationElementService.setNewValue(element, feature, value);
⋮
│    public boolean setNewValue(Element element, String featureName, Object value) {
│        return this.formMutationElementService.setNewValue(element, featureName, value);
⋮
│    public boolean setTransitionSourceParameter(TransitionUsage usage, Element value) {
│        return this.formMutationElementService.setTransitionSourceParameter(usage, value);
⋮
│    public boolean setTransitionTargetParameter(TransitionUsage usage, Element value) {
│        return this.formMutationElementService.setTransitionTargetParameter(usage, value);
⋮
│    public boolean setVisibilityValue(Element element, Object value) {
│        return this.formMutationElementService.setVisibilityValue(element, value);
⋮

backend/services/syson-form-services/src/main/java/org/eclipse/syson/form/services/aql/FormQueryAQLS
⋮
│public class FormQueryAQLService {
│
│    private final FormQueryElementService formQueryElementService;
│
│    private final MetamodelQueryElementService metamodelQueryElementService;
│
│    /**
│     * Creates a query AQL service.
│     *
│     * @param formQueryElementService
⋮
│    public AcceptActionUsage getAcceptActionUsage(Element element) {
│        return this.formQueryElementService.getAcceptActionUsage(element);
⋮
│    public List<EStructuralFeature> getAdvancedFeatures(Element element) {
│        return this.formQueryElementService.getAdvancedFeatures(element);
⋮
│    public String getCommentBody(Element element) {
│        return this.metamodelQueryElementService.getCommentBody(element);
⋮
│    public List<EStructuralFeature> getCoreFeatures(Element element) {
│        return this.formQueryElementService.getCoreFeatures(element);
⋮
│    public String getDetailsViewHelpText(Element element, EStructuralFeature feature) {
│        return this.formQueryElementService.getDetailsViewHelpText(element, feature);
⋮
│    public String getDetailsViewLabel(Element element, EStructuralFeature feature) {
│        return this.formQueryElementService.getDetailsViewLabel(element, feature);
⋮
│    public String getDocumentation(Element element) {
│        return this.metamodelQueryElementService.getDocumentation(element);
⋮
│    public List<EEnumLiteral> getEnumCandidates(Element element, EAttribute attribute) {
│        return this.formQueryElementService.getEnumCandidates(element, attribute);
⋮
│    public List<EEnumLiteral> getEnumCandidates(Element element, String attributeName) {
│        return this.formQueryElementService.getEnumCandidates(element, attributeName);
⋮
│    public EEnumLiteral getEnumValue(Element element, EAttribute attribute) {
│        return this.formQueryElementService.getEnumValue(element, attribute);
⋮
│    public EEnumLiteral getEnumValue(Element element, String attributeName) {
│        return this.formQueryElementService.getEnumValue(element, attributeName);
⋮
│    public Element getExpression(Element element) {
│        return this.formQueryElementService.getExpression(element);
⋮
│    public String getExpressionTextualRepresentation(Expression expression) {
│        return this.formQueryElementService.getExpressionTextualRepresentation(expression);
⋮
│    public FeatureValue getFeatureValue(Element element) {
│        return this.formQueryElementService.getFeatureValue(element);
⋮
│    public Expression getGuardExpression(Element element) {
│        return this.formQueryElementService.getGuardExpression(element);
⋮
│    public Element getPotentialExpressionOwner(Element element) {
│        return this.formQueryElementService.getPotentialExpressionOwner(element);
⋮
│    public Element getResultExpression(Element element) {
│        return this.formQueryElementService.getResultExpression(element);
⋮
│    public String getResultExpressionTextualRepresentation(ResultExpressionMembership expression) {
│        return this.formQueryElementService.getResultExpressionTextualRepresentation(expression);
⋮
│    public StateUsage getStateUsage(Element element) {
│        return this.formQueryElementService.getStateUsage(element);
⋮
│    public StyledString getStyledLabel(EClassifier eClassifier) {
│        return this.formQueryElementService.getStyledLabel(eClassifier);
⋮
│    public TransitionUsage getTransitionUsage(Element element) {
│        return this.formQueryElementService.getTransitionUsage(element);
⋮
│    public String getTypedByReferenceName(Feature feature) {
│        return this.formQueryElementService.getTypedByReferenceName(feature);
⋮
│    public String getValueExpressionTextualRepresentation(FeatureValue value) {
│        return this.formQueryElementService.getValueExpressionTextualRepresentation(value);
⋮
│    public List<EEnumLiteral> getVisibilityEnumLiterals(Element element) {
│        return this.formQueryElementService.getVisibilityEnumLiterals(element);
⋮
│    public Element getVisibilityPropertyOwner(Element element) {
│        return this.formQueryElementService.getVisibilityPropertyOwner(element);
⋮
│    public EEnumLiteral getVisibilityValue(Element element) {
│        return this.formQueryElementService.getVisibilityValue(element);
⋮
│    public boolean isBooleanAttribute(EStructuralFeature feature) {
│        return this.formQueryElementService.isBooleanAttribute(feature);
⋮
│    public boolean isEnumAttribute(EStructuralFeature feature) {
│        return this.formQueryElementService.isEnumAttribute(feature);
⋮
│    public boolean isMultilineStringAttribute(Element element, EStructuralFeature feature) {
│        return this.formQueryElementService.isMultilineStringAttribute(element, feature);
⋮
│    public boolean isNumberAttribute(EStructuralFeature feature) {
│        return this.formQueryElementService.isNumberAttribute(feature);
⋮
│    public boolean isReadOnly(EStructuralFeature feature) {
│        return this.formQueryElementService.isReadOnly(feature);
⋮
│    public boolean isReadOnly(Element element) {
│        return this.formQueryElementService.isReadOnly(element);
⋮
│    public boolean isReadOnly(Element element, EStructuralFeature feature) {
│        return this.formQueryElementService.isReadOnly(element, feature);
⋮
│    public boolean isReadOnlyStringAttribute(Element element, EStructuralFeature feature) {
│        return this.formQueryElementService.isReadOnlyStringAttribute(element, feature);
⋮
│    public boolean isReference(EStructuralFeature feature) {
│        return this.formQueryElementService.isReference(feature);
⋮
│    public boolean isStringAttribute(Element element, EStructuralFeature feature) {
│        return this.formQueryElementService.isStringAttribute(element, feature);
⋮

backend/services/syson-form-services/src/main/resources/.gitkeep

backend/services/syson-form-services/src/test/java/org/eclipse/syson/form/services/ArchitectureConst
⋮
│public final class ArchitectureConstants {
│    public static final String SYSON_FORM_SERVICES_ROOT_PACKAGE = "org.eclipse.syson.form.services.
│
│    public static final JavaClasses CLASSES = new ClassFileImporter()
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
│            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
│            .importPackages(SYSON_FORM_SERVICES_ROOT_PACKAGE);
│
│    private ArchitectureConstants() {
│        // Prevent instantiation
⋮

backend/services/syson-form-services/src/test/java/org/eclipse/syson/form/services/CodingRulesTests.
⋮
│public class CodingRulesTests extends AbstractCodingRulesTests {
│
│    @Override
│    protected String getProjectRootPackage() {
│        return ArchitectureConstants.SYSON_FORM_SERVICES_ROOT_PACKAGE;
│    }
│
│    @Override
│    protected JavaClasses getClasses() {
│        return ArchitectureConstants.CLASSES;
⋮

backend/services/syson-form-services/src/test/java/org/eclipse/syson/form/services/FormMutationEleme
⋮
│public class FormMutationElementServiceTest {
│
│    private FormMutationElementService formMutationElementService;
│
│    @BeforeEach
│    public void setUp() {
│        FormQueryElementService formQueryElementService = new FormQueryElementService(List.of(), el
│        this.formMutationElementService = new FormMutationElementService(new IFeedbackMessageServic
│    }
│
│    @Test
│    public void setPartUsageTypedByPartDefinition() {
⋮
│    private static Stream<Arguments> typedByTypes() {
│        var sysml = SysmlPackage.eINSTANCE;
│        return Stream.of(
│                Arguments.of(sysml.getActionUsage(), sysml.getActionDefinition()),
│                Arguments.of(sysml.getAttributeUsage(), sysml.getAttributeDefinition()),
│                Arguments.of(sysml.getAllocationUsage(), sysml.getAllocationDefinition()),
│                Arguments.of(sysml.getFlowUsage(), sysml.getFlowDefinition()),
│                Arguments.of(sysml.getInterfaceUsage(), sysml.getInterfaceDefinition()),
│                Arguments.of(sysml.getStateUsage(), sysml.getStateDefinition()),
│                Arguments.of(sysml.getPartUsage(), sysml.getPartDefinition()));
⋮
│    @ParameterizedTest
│    @MethodSource("typedByTypes")
│    public void selectedDefinitionIsDisplayed(EClass usageType, EClass definitionType) {
⋮
│    @Test
│    public void setAnalysisCaseUsageTypedByAnalysisCaseDefinition() {
⋮
│    @Test
│    public void setCalculationUsageTypedByCalculationDefinition() {
⋮
│    @Test
│    public void setConcernUsageTypedByConcernDefinition() {
⋮
│    @Test
│    public void setRenderingUsageTypedByRenderingDefinition() {
⋮
│    @Test
│    public void setVerificationCaseUsageTypedByVerificationCaseDefinition() {
⋮
│    @Test
│    public void setViewpointUsageTypedByViewpointDefinition() {
⋮
│    @Test
│    public void rejectPartUsageAsPartUsageTypedByValue() {
⋮

backend/services/syson-form-services/src/test/java/org/eclipse/syson/form/services/FormQueryElementS
⋮
│public class FormQueryElementServiceTest {
│
│    private FormQueryElementService formQueryElementService;
│
│    @BeforeEach
│    public void setUp() {
│        this.formQueryElementService = new FormQueryElementService(List.of(), element -> false, Lis
│    }
│
│    @Test
│    public void getCoreFeaturesOfPartUsage() {
⋮
│    @Test
│    public void getTypedByReferenceNameOfPartUsage() {
⋮
│    @Test
│    public void getCoreFeaturesOfFeatureChaining() {
⋮
│    @Test
│    public void getCoreFeaturesOfFeatureValue() {
⋮
│    @Test
│    public void getCoreFeaturesOfMembership() {
⋮
│    @Test
│    public void getCoreFeaturesOfRequirementDefinition() {
⋮
│    @Test
│    public void getCoreFeaturesOfRequirementUsage() {
⋮
│    @Test
│    public void isReadOnlyElementUsesInjectedPredicate() {
⋮
│    @Test
│    public void isReadOnlyLibraryPackageIsStandardEAttribute() {
⋮

backend/services/syson-form-services/src/test/resources/.gitkeep
```
