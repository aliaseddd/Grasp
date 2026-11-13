// The fields of Details, without React: what the panel shows for what is picked (the form), what a change to a field
// writes and says, and what a field's row in the model library cannot say (the hooks). plan/slice-1.md, step 10, and
// plan/swarm/step-10.md. panels/Details.tsx draws the form as Material UI widgets and calls changeField() from them.
//
// It ports the old page's panel, which stays as it is: the one way every field goes in canvas/src/core/page/panel.js
// (fieldsOf, valueOf, readInput, fieldChangeText, changeField, and the core's hooks), the layout of the two tabs and
// the hooks of Specializes, Subsets and Is Parallel in canvas/src/details/page.js, and the labels, placeholders and
// order of the fields in canvas/src/core/page.html. canvas/src/README.md, "The panel's fields", is the old contract.
//
// Nothing here is React's and nothing asks for a browser: canvas/app/test/core.mjs loads it with
// loadWith('panels/fieldHooks'), beside the core, and its tests run in Node. It imports the core's types only.
//
// What slice 1 leaves out, each as plan/slice-1.md, section 2, "Which editing is slice 1's", gives it to slice 2: the
// code links (the field `code`, a list, has no look and so no row), notes, Delete, Remove from view, a view kind's own
// options (the old page's VIEW_PANELS) and "Show in this view", the lines "Shown in ..." under the fields, and
// changing a message's order. The old hooks' `done` is not ported: what it did is the listeners' (the panel follows
// the model by itself), slice 2's (the notes' labels) or the old page's status line, which the new page has not.

import type { Model, ModelElement, ModelRelationship, ModelView, Picked, PickedType, Session, Touched } from '../core';

// ---- The model library, as far as the fields read it.

/** An element, a relationship or a view of the model: what can be picked. */
export type Item = ModelElement | ModelRelationship | ModelView;

/** The type of a row of the library's FIELDS. A `list` (the code links) is no widget in slice 1. */
export type FieldType = 'string' | 'text' | 'number' | 'bool' | 'enum' | 'ref' | 'list';

/** A row of the library's FIELDS (canvas/src/core/lib/model.js, and each feature's lib.js). */
export interface FieldSpec {
  readonly type: FieldType;
  /** The field's name in sentences: 'multiplicity', 'definition'. Not what the panel labels it with (FIELD_LOOKS). */
  readonly label: string;
  /** A string whose ends are taken off as it is read. */
  readonly trim?: boolean;
  /** An enum's values, in the row's order; '' is "unset". */
  readonly values?: readonly string[];
  /** The view kinds the field shows in; absent for every kind. */
  readonly views?: readonly string[];
  /** false for a field that is no value of the item (the definition, its line, Specializes, Subsets). */
  readonly stored?: boolean;
  /** The attribute of the metamodel the field holds, when it holds one: 'declaredName'. */
  readonly attribute?: string;
  /** A ref's choices: the elements the field may name, in the model's order. */
  options?(model: Model, item: Item): ModelElement[];
}

/** A row of what the library's detailsOf gives for a tab (canvas/src/details/lib.js). */
export interface DetailRow {
  /** The attribute's name in the metamodel: 'declaredName', 'qualifiedName'. */
  readonly name: string;
  /** The same in words: 'Declared Name'. */
  readonly label: string;
  /** The field of the item's kind that holds it, when one does. */
  readonly field?: string;
  /** The value the library knows, when no field holds it and the library can say it. */
  readonly value?: string | boolean;
  /** false when no field holds it and the library cannot say it. */
  readonly held?: false;
}

/** What the library's detailsOf gives for an item. */
export interface Details {
  readonly metaclass: string;
  /** 'Part Definition Properties', 'Part Properties', 'View Properties'. */
  readonly title: string;
  readonly core: readonly DetailRow[];
  readonly advanced: readonly DetailRow[];
}

/**
 * The part of the model library that the fields read, beside what the core declares of it (core/session.ts,
 * core/adapter.ts). It is declared here and reached through fieldLibOf(), not added to the global SysMLModelLibrary, so
 * that it clashes with no other file's declaration of the same rows.
 */
export interface FieldLibrary {
  readonly FIELDS: Readonly<Record<string, FieldSpec>>;
  readonly KINDS: Readonly<Record<string, { label: string; fields: string[]; definedBy?: string }>>;
  readonly RELATIONSHIPS: Readonly<Record<string, {
    label: string;
    fields: string[];
    /** The id of the element whose body declares the relationship, or null for the package. */
    owner(model: Model, rel: ModelRelationship, ids: Map<string, ModelElement>): string | null;
  }>>;
  readonly VIEW_KINDS: Readonly<Record<string, { label: string; fields: string[] }>>;
  /** The rows of the Core and the Advanced tab for an item. `type` is 'el', 'rel' or 'view'. */
  detailsOf(model: Model, type: PickedType, item: Item): Details;
  /** The first Specialization line an element starts, or null. */
  firstGeneral(model: Model, el: ModelElement): ModelRelationship | null;
  /** A relationship in words: 'connection mount, api to api', 'hosts defined by Host'. */
  describeRel(model: Model, rel: ModelRelationship): string;
  /** A view in words: 'view proofStructure'. */
  describeView(model: Model, view: ModelView): string;
  /** The elements by id. Inside lib.reading() it is the reading's own map, made once. */
  idsOf(model: Model): Map<string, ModelElement>;
  /** The relationships of a kind, in the model's order. */
  linesOfKind(model: Model, kind: string): ModelRelationship[];
}

/** The model library as the fields read it. */
export type Lib = SysMLModelLibrary & FieldLibrary;

/** A session's model library, typed for the fields. */
export const fieldLibOf = (lib: SysMLModelLibrary): Lib => lib as Lib;

// ---- The words the panel shows that are no field's.

/** What stands for an element or a view with no name, in a picker's list and in the words of a change. */
export const UNNAMED = '(unnamed)';
/** What the words of a change say for an empty value: 'Set the multiplicity of part app in Page to nothing'. */
export const NOTHING = 'nothing';
/** What a row says whose attribute Grasp does not hold. */
export const NOT_HELD = 'not held yet';
/** What such a row says when the pointer rests on it (its `title`), as on the old page. */
export const notHeldWhy = (label: string): string => `The canvas doesn't hold ${label} yet: the text leaves it as SysML has it.`;
/** Why a message's order cannot be changed in slice 1: changing it must re-sort the messages, which slice 2 does. */
export const ORDER_LOCKED = 'The order can\'t be changed here yet. The old page changes it until slice 2.';

// ---- How each field looks: its label, its place, and what the row in FIELDS does not say of its widget.

/** The four groups of the Core tab, in the order they are shown. Only `main` is under the metaclass's title. */
export const GROUP_NAMES = ['main', 'typing', 'general', 'geometry'] as const;
export type GroupName = (typeof GROUP_NAMES)[number];

/** How a field is shown. */
export interface FieldLook {
  /** What the widget is labelled with: the old page's own words for it. */
  readonly label: string;
  /** The group of the Core tab it belongs to, when the library's details put it on neither tab. */
  readonly group: GroupName;
  /** What an empty text field shows in grey. */
  readonly placeholder?: string;
  /** An enum's values that are labelled otherwise than by themselves: '' is 'unset', or 'none'. */
  readonly choices?: Readonly<Record<string, string>>;
}

/**
 * The look of every field the panel shows, by the field's name in the library's FIELDS. The labels and the
 * placeholders are the old page's (canvas/src/core/page.html). A field with no row here has no widget and no row in
 * the form: `code`, the code links, which wait for slice 2.
 */
export const FIELD_LOOKS: Readonly<Record<string, FieldLook>> = {
  name: { label: 'Declared Name', group: 'main' },
  direction: { label: 'Direction', group: 'main', choices: { '': 'unset' } },
  parallel: { label: 'Is Parallel: its regions run at the same time', group: 'main' },
  abstract: { label: 'Is Abstract', group: 'main' },
  multiplicity: { label: 'Multiplicity', group: 'main', placeholder: '1, 0..1, or 1..*' },
  item: { label: 'Item (the payload)', group: 'main' },
  actionKind: { label: 'Kind of action', group: 'main' },
  payload: { label: 'Payload', group: 'main', placeholder: 'new Alert() to send; x : Type or after 10 [SI::s] to accept' },
  target: { label: 'Target (via a port, to anything else)', group: 'main', placeholder: 'a port, a part or an action' },
  role: { label: 'Kind under a state', group: 'main', choices: { '': 'unset' } },
  guard: { label: 'Guard', group: 'main', placeholder: 'a Boolean expression, or else' },
  trigger: { label: 'Trigger (the accept part)', group: 'main', placeholder: 'StartSignal · x : Sig via port · after 48 [SI::h] · when ready' },
  effect: { label: 'Effect', group: 'main', placeholder: 'action name, send new X() to y, assign a := b' },
  order: { label: 'Order (the message\'s place in time, top to bottom)', group: 'main', placeholder: '1, 2, 3…' },
  doc: { label: 'Documentation', group: 'main' },
  type: { label: 'Typed by', group: 'typing' },
  interfaceDef: { label: 'Typed by', group: 'typing' },
  typeLine: { label: 'draw the defined-by line', group: 'typing' },
  conjugated: { label: 'conjugated (~), the other side of the port', group: 'typing' },
  specializes: { label: 'Specializes', group: 'general' },
  subsets: { label: 'Subsets', group: 'general' },
  shape: { label: 'Shape', group: 'geometry', choices: { '': 'none' } },
  unit: { label: 'Unit', group: 'geometry' },
  length: { label: 'Length', group: 'geometry' },
  width: { label: 'Width', group: 'geometry' },
  height: { label: 'Height', group: 'geometry' },
  radius: { label: 'Radius', group: 'geometry' },
  posX: { label: 'Position x', group: 'geometry' },
  posY: { label: 'Position y', group: 'geometry' },
  posZ: { label: 'Position z', group: 'geometry' },
};

/**
 * The order of the fields inside each group of the Core tab: the order of the old page's markup. In `main` the
 * documentation is last whatever else the group holds.
 */
export const GROUP_ORDER: Readonly<Record<GroupName, readonly string[]>> = {
  main: ['name', 'direction', 'parallel', 'abstract', 'multiplicity', 'item', 'actionKind', 'payload', 'target', 'role', 'guard', 'trigger', 'effect', 'order', 'doc'],
  typing: ['type', 'interfaceDef', 'typeLine', 'conjugated'],
  general: ['specializes', 'subsets'],
  geometry: ['shape', 'unit', 'length', 'width', 'height', 'radius', 'posX', 'posY', 'posZ'],
};

// ---- The hooks: what a field's row cannot say.

/** A field of an item, as a hook is given it. `item` is the model's own object, read inside lib.reading(). */
export interface FieldOf {
  readonly lib: Lib;
  readonly model: Model;
  readonly type: PickedType;
  readonly item: Item;
  /** The field's name in FIELDS. */
  readonly field: string;
  readonly spec: FieldSpec;
}

/** What a field holds: a string (a ref holds an element's id, '' for none), a number, or true or false. */
export type FieldValue = string | number | boolean;

/**
 * What the panel needs to know of a field beyond its row, as the old page's FIELD_HOOKS (canvas/src/core/page/base.js
 * lists them). A hook says only what the row can't:
 *
 * - `shown(x)`: whether the panel shows the field for this item. Without it the field shows.
 * - `value(x)`: the value the field shows, when it is not the item's own property `item[field]`.
 * - `none`: the words of a ref's empty choice; NOTHING unless said.
 * - `write(x, value)`: the change, made inside history.edit(), in place of `item[field] = value`.
 * - `said(x)`: the words of the change, read after the write, in place of 'Set the <label> of <what> to <value>';
 *   null when the write did nothing.
 * - `locked(x)`: why the field cannot be changed now, a sentence, or null.
 */
export interface FieldHook {
  shown?(x: FieldOf): boolean;
  value?(x: FieldOf): FieldValue;
  readonly none?: string;
  write?(x: FieldOf, value: FieldValue): void;
  said?(x: FieldOf): string | null;
  locked?(x: FieldOf): string | null;
}

const bag = (o: object): Record<string, unknown> => o as unknown as Record<string, unknown>;
const typingOf = (x: FieldOf): ModelRelationship | null => x.lib.typingOf(x.model, x.item as ModelElement);

/** The hooks of Specializes (a definition's) and Subsets (a usage's): the element's first Specialization line. */
function generalHooks(verb: string, noun: string): FieldHook {
  const lineOf = (x: FieldOf): ModelRelationship | null => x.lib.firstGeneral(x.model, x.item as ModelElement);
  return {
    none: 'nothing: take the line away',
    shown: (x) => lineOf(x) !== null,
    value: (x) => lineOf(x)?.to ?? '',
    write: (x, value) => {
      const line = lineOf(x);
      if (!line) return;
      if (!value) x.model.relationships.splice(x.model.relationships.indexOf(line), 1);
      else line.to = value as string;
    },
    said: (x) => {
      const line = lineOf(x);
      const general = line ? x.lib.idsOf(x.model).get(line.to) : undefined;
      const what = x.lib.describe(x.model, x.item as ModelElement);
      return general ? `Made ${what} ${verb} ${x.lib.textName(general) || UNNAMED}` : `Took away the ${noun} of ${what}`;
    },
  };
}

/**
 * The hooks, by the field's name. In the words below, `describe` is lib.describe(model, item) ('part def Host',
 * 'port api in hosts'), `describeRel` lib.describeRel(model, rel) ('connection mount, api to api'), `what` is whatOf()
 * of the item, and a named element is said by lib.textName(el), or UNNAMED when that is empty.
 *
 * - **name.** said: for an element, 'Renamed to ' + describe; for a line, 'Named the ' + describeRel; for a view,
 *   'Renamed the view to ' + its name, trimmed, or UNNAMED. An empty name is allowed and is what it says: an unnamed
 *   element, line or view.
 * - **abstract.** said: 'Made abstract: ' + describe when the item is abstract after the write, else
 *   'Made concrete: ' + describe.
 * - **conjugated.** said: 'Conjugated ' + describe when it is conjugated after the write, else 'Unconjugated ' +
 *   describe.
 * - **doc.** said: 'Wrote the doc of ' + what.
 * - **type**, a usage's definition, which is no value of the usage but its FeatureTyping relationship
 *   (lib.typingOf(model, item)). none: 'nothing yet'. value: the typing's `to`, or '' when the usage has none. write:
 *   with '' the typing is taken out of model.relationships (nothing when there is none); with an id, a usage that
 *   has a typing keeps it and only its `to` becomes the id (the same relationship, its end moved, so that what is
 *   pinned to the line stays on it); a usage that has none gets a new one, pushed at the end of
 *   model.relationships: `{ id, kind: 'FeatureTyping', from: the usage's id, to: the id, hidden: true }`, those five
 *   keys in that order, its id made as the old page's newId('r') makes one ('r', then Date.now() in base 36, then
 *   five characters of a random number in base 36) and made again while the model holds a relationship of that id.
 *   It is hidden: it shows as text in the usage's name line, and its line is not drawn until `typeLine` is ticked.
 *   said: 'Defined ' + describe + ' by ' + the definition's name when the usage has a typing after the write whose
 *   `to` names an element, else 'Undefined ' + describe.
 * - **typeLine**, whether the usage's typing is drawn as a line. shown: while the usage has a typing. value: true
 *   when it has one that is not hidden. write: true deletes the typing's `hidden` key, false sets it to true; with no
 *   typing, nothing. said: 'Drew the line ' + describeRel of the typing when it is not hidden after the write, 'Hid
 *   the line ' + describeRel when it is; null with no typing.
 * - **specializes** (a definition's) and **subsets** (a usage's): the element's first Specialization line,
 *   lib.firstGeneral(model, item). none: 'nothing: take the line away'. shown: while there is such a line. value:
 *   its `to`, or ''. write: with '' the line is taken out of model.relationships; with an id its `to` becomes the id;
 *   with no such line, nothing. said: 'Made ' + describe + ' specialize ' + the general's name (for subsets: ' subset
 *   ') when the line is there after the write and its `to` names an element; else 'Took away the specialization of '
 *   + describe (for subsets: 'Took away the subsetting of ').
 * - **parallel.** locked: while the model holds a TransitionUsage whose owner, by
 *   lib.RELATIONSHIPS.TransitionUsage.owner(model, rel, ids), is this item's id: 'Is Parallel can't change while ' +
 *   describe + ' holds transitions, as in SysON.' Else null. Its words are the generic ones.
 * - **order**, a message's place in time. locked: always, ORDER_LOCKED. So it is shown and never changed in slice 1;
 *   the old hook's write, which re-sorts the messages, comes with slice 2.
 *
 * Every other field has no hook: it is the item's own property, shown by its row's type, and its change is said in
 * the generic words (changeField).
 */
export const FIELD_HOOKS: Readonly<Record<string, FieldHook>> = {
  name: {
    said: (x) => {
      if (x.type === 'el') return `Renamed to ${x.lib.describe(x.model, x.item as ModelElement)}`;
      if (x.type === 'rel') return `Named the ${x.lib.describeRel(x.model, x.item as ModelRelationship)}`;
      return `Renamed the view to ${String((x.item as ModelView).name ?? '').trim() || UNNAMED}`;
    },
  },
  abstract: {
    said: (x) => `${bag(x.item).abstract ? 'Made abstract: ' : 'Made concrete: '}${x.lib.describe(x.model, x.item as ModelElement)}`,
  },
  conjugated: {
    said: (x) => `${bag(x.item).conjugated ? 'Conjugated ' : 'Unconjugated '}${x.lib.describe(x.model, x.item as ModelElement)}`,
  },
  doc: { said: (x) => `Wrote the doc of ${whatOf(x.lib, x.model, x.type, x.item)}` },
  type: {
    none: 'nothing yet',
    value: (x) => typingOf(x)?.to ?? '',
    write: (x, value) => {
      const typing = typingOf(x);
      const rels = x.model.relationships;
      if (!value) {
        if (typing) rels.splice(rels.indexOf(typing), 1);
        return;
      }
      if (typing) {
        typing.to = value as string;
        return;
      }
      let id: string;
      do id = `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
      while (rels.some((r) => r.id === id));
      rels.push({ id, kind: 'FeatureTyping', from: x.item.id, to: value as string, hidden: true } as ModelRelationship);
    },
    said: (x) => {
      const typing = typingOf(x);
      const def = typing ? x.lib.idsOf(x.model).get(typing.to) : undefined;
      const what = x.lib.describe(x.model, x.item as ModelElement);
      return def ? `Defined ${what} by ${x.lib.textName(def) || UNNAMED}` : `Undefined ${what}`;
    },
  },
  typeLine: {
    shown: (x) => typingOf(x) !== null,
    value: (x) => { const typing = typingOf(x); return !!typing && !bag(typing).hidden; },
    write: (x, value) => {
      const typing = typingOf(x);
      if (!typing) return;
      if (value) delete bag(typing).hidden; else bag(typing).hidden = true;
    },
    said: (x) => {
      const typing = typingOf(x);
      return typing ? `${bag(typing).hidden ? 'Hid the line ' : 'Drew the line '}${x.lib.describeRel(x.model, typing)}` : null;
    },
  },
  specializes: generalHooks('specialize', 'specialization'),
  subsets: generalHooks('subset', 'subsetting'),
  parallel: {
    locked: (x) => {
      const ids = x.lib.idsOf(x.model);
      const holds = x.lib.linesOfKind(x.model, 'TransitionUsage').some((r) => x.lib.RELATIONSHIPS.TransitionUsage.owner(x.model, r, ids) === x.item.id);
      return holds ? `Is Parallel can't change while ${x.lib.describe(x.model, x.item as ModelElement)} holds transitions, as in SysON.` : null;
    },
  },
  order: { locked: () => ORDER_LOCKED },
};

// ---- The form: what Details shows for what is picked, as plain data.

/** A choice of a picker: an element's id and its name, or the empty choice (id ''). */
export interface Option {
  readonly id: string;
  readonly label: string;
}

/** A field of the item, with its widget's needs. */
export interface FieldRow {
  readonly row: 'field';
  /** The field's name in FIELDS: the widget's data-testid is `field-<field>`. */
  readonly field: string;
  /** FIELD_LOOKS[field].label. */
  readonly label: string;
  /** The row's type, never 'list'. */
  readonly type: Exclude<FieldType, 'list'>;
  /**
   * What the field holds, by its hook's value() or as the item's property. A string or text: the string ('' when
   * the item has none). A number: the number, or '' when it is unset. A bool: true only when the value is true. An
   * enum: the value when it is one of the row's values, else the first of them. A ref: the id when the model holds
   * an element of that id, else ''.
   */
  readonly value: FieldValue;
  /** A text field's placeholder (FIELD_LOOKS), or undefined. */
  readonly placeholder?: string;
  /** An enum's choices, in the order of the row's values, each labelled by FIELD_LOOKS's `choices` or by itself. */
  readonly choices?: readonly { readonly value: string; readonly label: string }[];
  /**
   * A ref's present choice: the element `value` names, labelled by lib.textName(el) or UNNAMED; or the empty choice,
   * { id: '', label: the hook's `none` or NOTHING }.
   */
  readonly choice?: Option;
  /** Why it cannot be changed now (the hook's locked()), or null. */
  readonly locked: string | null;
}

/** An attribute no field holds, whose value the library knows: shown, never changed. */
export interface KnownRow {
  readonly row: 'known';
  /** The attribute's name in the metamodel: 'qualifiedName', 'elementId'. */
  readonly name: string;
  readonly label: string;
  /** The value as the library gives it: a string ('' when it has none to give), or true or false. */
  readonly value: string | boolean;
}

/** An attribute Grasp does not hold: it says NOT_HELD. */
export interface NotHeldRow {
  readonly row: 'notHeld';
  readonly name: string;
  readonly label: string;
}

export type Row = FieldRow | KnownRow | NotHeldRow;

/** A group of the Core tab. A group with no row is not in the form. */
export interface Group {
  readonly name: GroupName;
  readonly rows: readonly Row[];
}

/** What Details shows for one picked thing. */
export interface Form {
  readonly type: PickedType;
  readonly id: string;
  /** What is shown, in words: whatOf() without 'the'. 'part def Host', 'connection mount, api to api', 'view proofStructure'. */
  readonly what: string;
  /** The metaclass's title, over each tab's rows: detailsOf().title. */
  readonly title: string;
  /** The Core tab: its groups, in the order of GROUP_NAMES. */
  readonly core: readonly Group[];
  /** The Advanced tab: its rows. */
  readonly advanced: readonly Row[];
}

// ---- What the functions below share.

const TABLES = { el: 'elements', rel: 'relationships', view: 'views' } as const;

const itemIn = (model: Model, type: PickedType, id: string): Item | null => {
  const list = model[TABLES[type]] as Item[];
  return list.find((x) => x.id === id) ?? null;
};

const kindRowOf = (lib: Lib, type: PickedType, item: Item): { fields: string[] } | undefined => {
  const table = type === 'el' ? lib.KINDS : type === 'rel' ? lib.RELATIONSHIPS : lib.VIEW_KINDS;
  return table[item.kind];
};

/** The field as the hooks are given it, when it applies to the item (formOf, rule 2, but for the view's say). */
function fieldOf(lib: Lib, model: Model, type: PickedType, item: Item, field: string): FieldOf | null {
  const spec = lib.FIELDS[field];
  if (!spec || spec.type === 'list' || !FIELD_LOOKS[field]) return null;
  if (!kindRowOf(lib, type, item)?.fields.includes(field)) return null;
  const x: FieldOf = { lib, model, type, item, field, spec };
  const hook = FIELD_HOOKS[field];
  return hook?.shown && !hook.shown(x) ? null : x;
}

/** What the field holds, as the model has it. */
const rawOf = (x: FieldOf): unknown => {
  const hook = FIELD_HOOKS[x.field];
  return hook?.value ? hook.value(x) : bag(x.item)[x.field];
};

/** A named element's name, or UNNAMED. */
const nameOf = (lib: Lib, el: ModelElement): string => lib.textName(el) || UNNAMED;

const noneOf = (field: string): string => FIELD_HOOKS[field]?.none ?? NOTHING;

/**
 * The form of what is picked, or null when the session's model holds no element, relationship or view of that type
 * and id (an undo took it out of the model and the selection has not yet let it go: Details then shows what it shows
 * with nothing picked).
 *
 * `viewId` is the view in front (the selection's `view`), or null. It only decides which kind of view a field with
 * `views` is checked against (viewKindFor).
 *
 * How the form is made, which is how the old page lays the panel out (details/page.js, renderDetails):
 *
 * 1. `details = lib.detailsOf(model, picked.type, item)`. `title` is its title.
 * 2. **A field's row.** A field applies to the item when the item's kind lists it (KINDS, RELATIONSHIPS or
 *    VIEW_KINDS, by picked.type: `[kind].fields`), FIELDS has a row for it whose type is not 'list', FIELD_LOOKS has
 *    a look for it, and its hook's shown(), when it has one, is true. A field has a row in the form when it applies
 *    and its row's `views`, when it has any, includes viewKindFor(model, picked.id, viewId). The row is a FieldRow as
 *    its comment says.
 * 3. **The Advanced tab** is details.advanced, row for row: a row with `field` is that field's FieldRow, and is left
 *    out when the field has no row by rule 2; a row with `value` (not undefined) is a KnownRow; any other is a
 *    NotHeldRow.
 * 4. **The Core tab's `main` group** is details.core, row for row, by the same three cases; then every field of
 *    GROUP_ORDER.main that has a row by rule 2 and is in neither details.core nor details.advanced, in that order,
 *    but for `doc`; then `doc`, when it has a row and is on neither tab already.
 * 5. **The groups `typing`, `general` and `geometry`** hold the fields of their GROUP_ORDER that have a row by rule 2
 *    and are in neither details.core nor details.advanced, in that order. A group with no row is left out.
 * 6. Every field is in the form at most once.
 *
 * It reads the model once, inside one lib.reading(model, ...), and asks no row for its `options`: a picker's list is
 * worked out when it is opened (optionsOf). Details calls it at every change of the model, a keystroke included: at
 * 5,000 elements it takes 2 to 4 ms so made, and 400 ms were one picker's options asked outside a reading. It
 * changes nothing and may be called at any time, also in the middle of a run of typing.
 */
export function formOf(session: Session, picked: Picked, viewId: string | null): Form | null {
  const model = session.model;
  const lib = fieldLibOf(session.lib);
  const item = itemIn(model, picked.type, picked.id);
  if (!item) return null;
  return lib.reading(model, () => {
    const details = lib.detailsOf(model, picked.type, item);
    const ids = lib.idsOf(model);
    let kind: string | null | undefined;
    const rows = new Map<string, FieldRow | null>();
    const rowOf = (field: string): FieldRow | null => {
      const known = rows.get(field);
      if (known !== undefined) return known;
      let row: FieldRow | null = null;
      const x = fieldOf(lib, model, picked.type, item, field);
      if (x) {
        if (x.spec.views && kind === undefined) kind = viewKindFor(model, picked.id, viewId);
        if (!x.spec.views || (kind != null && x.spec.views.includes(kind))) row = fieldRow(x, ids);
      }
      rows.set(field, row);
      return row;
    };
    const used = new Set<string>();
    const take = (field: string): FieldRow | null => {
      if (used.has(field)) return null;
      const row = rowOf(field);
      if (row) used.add(field);
      return row;
    };
    const ofDetails = (r: DetailRow): Row | null => {
      if (r.field !== undefined) return take(r.field);
      if (r.value !== undefined) return { row: 'known', name: r.name, label: r.label, value: r.value ?? '' };
      return { row: 'notHeld', name: r.name, label: r.label };
    };
    const onTabs = new Set<string>();
    for (const r of [...details.core, ...details.advanced]) if (r.field !== undefined) onTabs.add(r.field);
    const extra = (field: string): FieldRow | null => (onTabs.has(field) ? null : take(field));
    const compact = (list: (Row | null)[]): Row[] => list.filter((r): r is Row => r !== null);
    const main = compact(details.core.map(ofDetails));
    for (const f of GROUP_ORDER.main) if (f !== 'doc') { const r = extra(f); if (r) main.push(r); }
    const doc = extra('doc');
    if (doc) main.push(doc);
    const groups: Group[] = [{ name: 'main', rows: main }];
    for (const name of GROUP_NAMES) {
      if (name !== 'main') groups.push({ name, rows: compact(GROUP_ORDER[name].map(extra)) });
    }
    return {
      type: picked.type,
      id: picked.id,
      what: picked.type === 'rel' ? lib.describeRel(model, item as ModelRelationship) : whatOf(lib, model, picked.type, item),
      title: details.title,
      core: groups.filter((g) => g.rows.length),
      advanced: compact(details.advanced.map(ofDetails)),
    };
  });
}

/** The row of a field that applies, with the value and the choices it shows. Reads inside lib.reading(). */
function fieldRow(x: FieldOf, ids: Map<string, ModelElement>): FieldRow {
  const { spec, field } = x;
  const look = FIELD_LOOKS[field];
  const raw = rawOf(x);
  const type = spec.type as FieldRow['type'];
  let value: FieldValue;
  let choice: Option | undefined;
  let choices: FieldRow['choices'];
  if (type === 'bool') value = raw === true;
  else if (type === 'number') value = typeof raw === 'number' ? raw : '';
  else if (type === 'enum') {
    const values = spec.values ?? [];
    value = typeof raw === 'string' && values.includes(raw) ? raw : values[0] ?? '';
    choices = values.map((v) => ({ value: v, label: look.choices?.[v] ?? v }));
  } else if (type === 'ref') {
    const el = typeof raw === 'string' ? ids.get(raw) : undefined;
    value = el ? el.id : '';
    choice = el ? { id: el.id, label: nameOf(x.lib, el) } : { id: '', label: noneOf(field) };
  } else value = raw == null ? '' : String(raw);
  return {
    row: 'field',
    field,
    label: look.label,
    type,
    value,
    ...(look.placeholder !== undefined && (type === 'string' || type === 'text' || type === 'number') ? { placeholder: look.placeholder } : {}),
    ...(choices ? { choices } : {}),
    ...(choice ? { choice } : {}),
    locked: FIELD_HOOKS[field]?.locked?.(x) ?? null,
  };
}

/**
 * The kind of the view that a field with `views` is checked against for the element, relationship or view of this id,
 * as the old page's viewKindShowing: the view in front (`viewId`) when it places the id (its layout has a place
 * under it); else the first view of the model, in the model's order, that places it; else, when none places it, the
 * view in front. The kind of that view, or null when there is none (no view in front, or one the model no longer
 * holds, and no view places the id).
 */
export function viewKindFor(model: Model, id: string, viewId: string | null): string | null {
  const front = viewId === null ? null : model.views.find((v) => v.id === viewId) ?? null;
  const places = (v: ModelView): boolean => Object.prototype.hasOwnProperty.call(v.layout, id);
  const view = front && places(front) ? front : model.views.find(places) ?? front;
  return view ? view.kind : null;
}

/**
 * An item in a sentence, as the generic words of a change name it: an element as lib.describe says it ('part app in
 * Page'), a line as 'the ' + lib.describeRel ('the connection mount, api to api'), a view as lib.describeView ('view
 * proofStructure').
 */
export function whatOf(lib: Lib, model: Model, type: PickedType, item: Item): string {
  if (type === 'el') return lib.describe(model, item as ModelElement);
  if (type === 'rel') return `the ${lib.describeRel(model, item as ModelRelationship)}`;
  return lib.describeView(model, item as ModelView);
}

/**
 * The list a picker shows when it is opened, for a ref field of what is picked: the empty choice first, { id: '',
 * label: the hook's `none` or NOTHING }, then each element the row's options(model, item) gives, in its order,
 * labelled by lib.textName(el) or UNNAMED; and last the field's present choice, when it names an element the options
 * do not hold, so that what the field shows is always in its own list. The row's options are asked inside
 * lib.reading(model, ...): outside one, Specializes's take 400 ms at 5,000 elements, inside 2 ms.
 *
 * An empty list when the model no longer holds the item, or the field does not apply to it (formOf, rule 2), or is
 * not a ref.
 */
export function optionsOf(session: Session, picked: Picked, field: string): Option[] {
  const model = session.model;
  const lib = fieldLibOf(session.lib);
  const item = itemIn(model, picked.type, picked.id);
  if (!item) return [];
  return lib.reading(model, () => {
    const x = fieldOf(lib, model, picked.type, item, field);
    if (!x || x.spec.type !== 'ref') return [];
    const ids = lib.idsOf(model);
    const list: Option[] = [{ id: '', label: noneOf(field) }];
    const seen = new Set<string>();
    for (const el of x.spec.options ? x.spec.options(model, item) : []) {
      seen.add(el.id);
      list.push({ id: el.id, label: nameOf(lib, el) });
    }
    const raw = rawOf(x);
    const present = typeof raw === 'string' && raw !== '' ? ids.get(raw) : undefined;
    if (present && !seen.has(present.id)) list.push({ id: present.id, label: nameOf(lib, present) });
    return list;
  });
}

/**
 * What the text of a text field is read as, by its row, as the old page's readInput: a `number` is the number the
 * text writes when the text, trimmed, is not empty and Number.isFinite(+text), else '' (the field is unset: 'abc',
 * '1,5' and 'Infinity' are no number); a string whose row has `trim` is the text with its ends off; any other string
 * or text is the text as it is.
 */
export function readText(spec: FieldSpec, text: string): string | number {
  if (spec.type === 'number') return text.trim() !== '' && Number.isFinite(+text) ? +text : '';
  return spec.trim ? text.trim() : text;
}

/** The key of a field's run of typing in the history: `<field>:<id>` (plan/slice-1.md, step 10). */
export const fieldKey = (field: string, id: string): string => `${field}:${id}`;

/**
 * Makes the change a widget asks for, through the session's history.edit(), and returns what edit() returns: what the
 * change touched, or null when nothing was changed.
 *
 * - `value` is what the widget holds, as the row reads it: a text field's readText(), a checkbox's true or false, a
 *   radio group's value, a picker's id ('' for the empty choice).
 * - Nothing is changed, no step is made and null is returned when the model no longer holds the item; when the field
 *   does not apply to it (formOf, rule 2: whether a view shows it is not asked here); when it is locked; when an
 *   enum's value is none of the row's values; or when `value` is what the field holds already (=== the hook's
 *   value(), or the item's property).
 * - The change, inside edit(): the hook's write(x, value), or `item[field] = value`. Then its words, read after the
 *   write inside a lib.reading(model, ...) of their own: the hook's said(x), or the generic 'Set the ' + spec.label +
 *   ' of ' + whatOf() + ' to ' + the value, where the value is NOTHING for '', and for a ref the name of the element
 *   it names (lib.textName or UNNAMED; NOTHING when it names none), and else String(value): 'Set the multiplicity of
 *   part app in Page to 1..2', 'Set the parallel of state running in HostLifecycle to true'.
 * - `key` joins the keystrokes of one field into one undo step: a text field passes fieldKey(field, id) at every
 *   keystroke, and endTyping() ends the run. A checkbox, a radio group and a picker pass none: each change of
 *   theirs is a step at once.
 * - The words are the step's (`history.steps`), which Undo's and Redo's tooltips show, and the log's entry.
 */
export function changeField(session: Session, picked: Picked, field: string, value: FieldValue, key?: string | null): Touched | null {
  const model = session.model;
  const lib = fieldLibOf(session.lib);
  const item = itemIn(model, picked.type, picked.id);
  if (!item) return null;
  const hook = FIELD_HOOKS[field];
  const go = lib.reading(model, () => {
    const x = fieldOf(lib, model, picked.type, item, field);
    if (!x || hook?.locked?.(x)) return null;
    if (x.spec.type === 'enum' && !(typeof value === 'string' && (x.spec.values ?? []).includes(value))) return null;
    return rawOf(x) === value ? null : x;
  });
  if (!go) return null;
  return session.history.edit(() => {
    if (hook?.write) hook.write(go, value); else bag(item)[field] = value;
    return lib.reading(model, () => {
      if (hook?.said) return hook.said(go) ?? undefined;
      const shown = go.spec.type === 'ref'
        ? (() => { const el = value === '' ? undefined : lib.idsOf(model).get(String(value)); return el ? nameOf(lib, el) : NOTHING; })()
        : value === '' ? NOTHING : String(value);
      return `Set the ${go.spec.label} of ${whatOf(lib, model, picked.type, item)} to ${shown}`;
    });
  }, key ?? null);
}

/**
 * Ends a field's run of typing: when the newest undo step is a run still open under this key (`history.steps`'s last
 * has `key === key`), history.endEdit(), which makes the run one step, or none when it ended where it began. It does
 * nothing when the newest step is another's or is closed, so it may be called whenever a field is left, and it never
 * ends a run that is not this field's.
 */
export function endTyping(session: Session, key: string): void {
  const last = session.history.steps.at(-1);
  if (last && last.key === key) session.history.endEdit();
}
