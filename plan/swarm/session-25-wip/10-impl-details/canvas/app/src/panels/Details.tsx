// The Details panel, a side panel of the dock (plan/slice-1.md, step 10; plan/swarm/step-10.md). Until step 10
// builds it, it is the empty state the shell has shown since step 5. The dock renders DetailsPanel as the body of the
// panel 'details' (shell/Dock.tsx, COMPONENTS); it reads the open file, and what else the dock hands on, through useDock()
// (shell/dockContext.ts), and is put into the dock inside SidePanel (panels/SidePanel.tsx).
//
// Details shows the fields of what was picked last (core/selection.ts) as Material UI widgets, laid out as the model
// library's detailsOf lays them out: a Core and an Advanced tab, each under the metaclass's title. What it shows and
// what a change writes and says is panels/fieldHooks.ts's, which knows no React: formOf() gives the form as plain
// data, and every change goes through changeField(), so through the history's edit(). This file draws the form,
// holds what a text field is typed into, and says when a run of typing ends. Its styles are panels/details.css.

import { Autocomplete, Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Tab, Tabs, TextField } from '@mui/material';
import { memo, useEffect, useId, useMemo, useState, useSyncExternalStore } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { selectionOf } from '../core';
import type { Picked, Session } from '../core';
import { useDock } from '../shell/dockContext';
import { changeField, endTyping, fieldKey, fieldLibOf, formOf, NOT_HELD, notHeldWhy, optionsOf, readText } from './fieldHooks';
import type { FieldRow, Option, Row } from './fieldHooks';
import { SidePanel, SideText } from './SidePanel';
import './details.css';

/** What Details says while no file is open. */
export const NO_FILE = 'No file is open.';
/** What Details says while a file is open and it has nothing to show: nothing is picked, or what was picked has left the model. */
export const NOTHING_PICKED = 'Nothing is picked. Click a box, a line or a row of the Explorer to see its fields.';
/** The two tabs, by the name each shows. Core is shown as the page opens. */
export const TABS = ['Core', 'Advanced'] as const;
export type DetailsTab = (typeof TABS)[number];
/** What a row shows for a value the library knows that is an empty string, as on the old page. */
export const NONE = '(none)';
/** The height of a one-line field's box and of the tabs' row, in px: the dense sizes of plan/slice-1.md, section 4. */
export const FIELD_HEIGHT = 32;
/** The height of a checkbox's and of a radio button's row, in px. */
export const CHECK_HEIGHT = 28;

/**
 * The panel's body. It takes no props: the dock makes it once and keeps it mounted while its tab is hidden.
 *
 * Until step 10 builds it, it shows the shell's empty state. Built, its contract is this.
 *
 * **What it shows.**
 * - Always the SidePanel with testId "details" and title "Details".
 * - With no file open (`useDock().session` is null): one SideText, NO_FILE.
 * - With a file open: `<PickedForm>` for the session. The tab that is shown (Core or Advanced) is this component's
 *   state: it starts at Core, a click on a tab or the arrow keys between the tabs change it, and it stays as it is
 *   while the selection changes and while another file is opened. It is not kept across a reload.
 * - When another file is opened, the session in the dock's context is another object: PickedForm then reads that
 *   one's selection and history, and what was picked in the first file is not shown.
 */
export function DetailsPanel(): JSX.Element {
  const { session } = useDock();
  const [tab, setTab] = useState<DetailsTab>('Core');
  return (
    <SidePanel testId="details" title="Details">
      {session ? <PickedForm session={session} tab={tab} onTab={setTab} /> : <SideText>{NO_FILE}</SideText>}
    </SidePanel>
  );
}

export interface PickedFormProps {
  /** The open file. */
  session: Session;
  /** The tab that is shown, and what a change of it calls. */
  tab: DetailsTab;
  onTab: (tab: DetailsTab) => void;
}

/**
 * What Details shows for a session: the form of what was picked last, or NOTHING_PICKED.
 *
 * **What it reads, and when it renders again.** Three things, each through useSyncExternalStore, so that a change is
 * rendered inside the event that made it:
 * - what is picked: `useSyncExternalStore(selection.listen, () => selection.items)`, and the form is that of
 *   `items[0]`, the last picked, whatever else is picked with it;
 * - the view in front: `useSyncExternalStore(selection.listen, () => selection.view)`, which a field that shows only
 *   in some kinds of view is checked against;
 * - the model's state: `useSyncExternalStore(session.history.listen, session.history.mark)`. Neither function reads
 *   `this`. mark() gives another number after every change, Undo and Redo, so the form is read again then, and after
 *   nothing else.
 * The form is `formOf(session, items[0], view)`, worked out once per render that one of the three changed (useMemo
 * over the session, the picked item's type and id, the view and the mark). With nothing picked, and when formOf gives
 * null (the model no longer holds what was picked), it renders one SideText, NOTHING_PICKED, and nothing else.
 *
 * **What a keystroke may cost.** At every keystroke in a text field Details does two things and no more: the change
 * (changeField: one write, and its words read in one lib.reading), and this form again (formOf: one lib.reading). It
 * asks no picker for its options, walks no list of the model outside a reading, and renders again only the rows
 * whose content changed: FormRow is memoized on what its row holds, and its other props (the session, the picked
 * item's type and id) are the same from render to render. Measured in Node at 5,000 elements: formOf 2 to 4 ms,
 * changeField 2 to 3 ms. The limits are 50 ms for the whole keystroke at 5,000 elements and 16 ms on the example
 * (canvas/app/test/scale.test.mjs and instant.test.mjs), and most of that time is the planes'.
 *
 * **The DOM** (plan/swarm/step-10.md has the table the tests are written to).
 * - The root of a form: `<div class="grasp-details" data-picked="<type>:<id>">`, type 'el', 'rel' or 'view'. Its
 *   React `key` is that same `<type>:<id>`, so that every row is made anew when another thing is picked: no row
 *   carries what was typed into it, or an open list, from one item to the next.
 * - `<div class="grasp-details-what">`: form.what, 13 px medium, one line, cut with an ellipsis.
 * - The tabs: Material UI's `Tabs` with `aria-label="Details"`, `selectionFollowsFocus`, and one `Tab` for each of
 *   TABS, labelled by its name; their row is FIELD_HEIGHT high. Material UI gives them the roles tablist and tab and
 *   `aria-selected`.
 * - The page of the tab that is shown, and only that one: `<div class="grasp-details-page" role="tabpanel"
 *   data-tab="Core">` (or "Advanced"). In it `<div class="grasp-details-title">` with form.title, 12 px medium in the
 *   secondary colour; then, for Core, one `<div class="grasp-details-group" data-group="<name>">` per group of
 *   form.core, in order, a 1 px rule in the theme's divider colour above every group but the first; for Advanced,
 *   one such div with data-group "advanced" holding form.advanced.
 * - Each row is a `<FormRow>` whose `key` is its row's kind and name (`field:name`, `known:qualifiedName`), so
 *   that, for one picked thing, a row that stays keeps its element, its focus and what is typed into it while other
 *   rows come and go (the box that draws the line, under a picker that was just given a definition).
 * - The panel's root scrolls when the form is higher than the panel (SidePanel's own); nothing is cut off sideways:
 *   every widget is as wide as the panel less 12 px at each side.
 */
export function PickedForm({ session, tab, onTab }: PickedFormProps): JSX.Element {
  const selection = selectionOf(session);
  const items = useSyncExternalStore(selection.listen, () => selection.items);
  const view = useSyncExternalStore(selection.listen, () => selection.view);
  const mark = useSyncExternalStore(session.history.listen, session.history.mark);
  const first = items[0] ?? null;
  const type = first?.type;
  const id = first?.id;
  const picked = useMemo<Picked | null>(() => (type && id !== undefined ? { type, id } : null), [type, id]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const form = useMemo(() => (picked ? formOf(session, picked, view) : null), [session, picked, view, mark]);
  if (!picked || !form) return <SideText>{NOTHING_PICKED}</SideText>;
  const groups = tab === 'Core' ? form.core.map((g) => ({ name: g.name as string, rows: g.rows })) : [{ name: 'advanced', rows: form.advanced }];
  const tabSx = { minHeight: FIELD_HEIGHT, height: FIELD_HEIGHT, py: 0, fontSize: 13, textTransform: 'none' } as const;
  const rowKey = (r: Row): string => (r.row === 'field' ? `field:${r.field}` : `${r.row}:${r.name}`);
  return (
    <div className="grasp-details" data-picked={`${picked.type}:${picked.id}`} key={`${picked.type}:${picked.id}`}>
      <div className="grasp-details-what">{form.what}</div>
      <Tabs
        value={tab}
        onChange={(_e, v: DetailsTab) => onTab(v)}
        aria-label="Details"
        selectionFollowsFocus
        sx={{ minHeight: FIELD_HEIGHT, height: FIELD_HEIGHT }}
      >
        {TABS.map((t) => <Tab key={t} value={t} label={t} sx={tabSx} />)}
      </Tabs>
      <div className="grasp-details-page" role="tabpanel" data-tab={tab}>
        <div className="grasp-details-title">{form.title}</div>
        {groups.map((g) => (
          <div className="grasp-details-group" data-group={g.name} key={g.name}>
            {g.rows.map((r) => <FormRow key={rowKey(r)} session={session} picked={picked} row={r} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface FormRowProps {
  /** The open file. */
  session: Session;
  /** What the form is of. The same object from render to render while the same thing is picked. */
  picked: Picked;
  /** The row, as formOf gave it. */
  row: Row;
}

/**
 * One row of the form. Memoized: it renders again only when its row reads otherwise than before (compare the two
 * rows as JSON; formOf makes new objects each time) or the session or the picked item changed.
 *
 * **A row the library knows (`row: 'known'`)**: `<div class="grasp-detail" data-detail="<name>">` holding
 * `<span class="grasp-detail-label">` with the label, 12 px in the secondary colour, and
 * `<span class="grasp-detail-value">`: for a string the value, or NONE when it is empty; for true or false a
 * Material UI Checkbox that is disabled, checked when true, with `aria-label` the label. It cannot be changed.
 *
 * **A row Grasp does not hold (`row: 'notHeld'`)**: the same div with the classes `grasp-detail not-held`, its value
 * the words NOT_HELD in the secondary colour, and its `title` notHeldWhy(label).
 *
 * **A field (`row: 'field'`)**: `<div class="grasp-field" data-field="<field>">`, with the class `locked` as well
 * when row.locked is a sentence, holding one widget by row.type. Every widget has row.label as its accessible name,
 * is `disabled` when the row is locked, and then has under it `<div class="grasp-field-why">` with row.locked, 12 px
 * in the secondary colour. The widget's data-testid is `field-<field>` (helpers.mjs, TESTIDS.field), on the element
 * the lists below name.
 *
 * A text field and a picker have their label above them, not Material UI's floating one, which at 13 px would be
 * drawn under 10 px: `<label class="grasp-field-label" for="<the input's id>">`, 12 px in the secondary colour, the
 * id from React's useId. The TextField itself is given no `label`.
 *
 * - **`string` and `number`**: a TextField, `size="small"`, `fullWidth`, outlined, with the `id` its label names,
 *   `placeholder` row.placeholder, its box FIELD_HEIGHT high, 13 px text. The `<input type="text">` carries the
 *   data-testid, `autoComplete="off"`, `spellCheck={false}`, and for a number `inputMode="decimal"`.
 * - **`text`** (the documentation): the same with `multiline` and `minRows={2}`; the visible `<textarea>` carries
 *   the data-testid and `spellCheck`.
 * - **`bool`**: a FormControlLabel whose control is a small Checkbox, CHECK_HEIGHT high; its `<input
 *   type="checkbox">` carries the data-testid (`slotProps.input`). A change calls changeField(session, picked,
 *   field, checked) at once, with no key.
 * - **`enum`**: a FormControl as a fieldset with a FormLabel as its legend, 12 px in the secondary colour whether
 *   or not a button of the group has the focus, and a RadioGroup, `row`, whose root (role radiogroup, named by the
 *   legend through `aria-labelledby`) carries the data-testid and whose `name` is `field-<field>`; one
 *   FormControlLabel with a small Radio per choice of row.choices, in order, `value` the choice's value, labelled by
 *   the choice's label. The one checked is row.value. A change calls changeField(..., value) at once, with no key.
 * - **`ref`**: an Autocomplete over `Option`s, `size="small"`, `fullWidth`, `disableClearable`, its box FIELD_HEIGHT
 *   high. Its value is row.choice. Its options are `[row.choice]` while its list is closed and optionsOf(session,
 *   picked, field) while it is open, asked once, as the list opens (`onOpen`), and dropped as it closes. An option is
 *   labelled by its label, keyed by its id, and equal to the value when the ids are equal. Each option's `<li>`
 *   carries `data-option="<id>"` (`renderOption`). The Autocomplete's `id` is the one its label names. `renderInput`
 *   gives a TextField with no label of its own; its `<input>` (Material UI makes it role combobox) carries the
 *   data-testid and `data-value="<row.value>"`, beside the props Material UI hands it
 *   (`slotProps.htmlInput = { ...params.inputProps, 'data-testid': ..., 'data-value': ... }`).
 *   Picking an option whose id is not row.value calls changeField(..., id) at once, with no key; picking the present
 *   one changes nothing. Text typed into it narrows the list by Material UI's own filter and changes nothing in the
 *   model; text that picks nothing is dropped when the picker is left, by Material UI's own.
 *
 * **Typing in a text field** (string, text, number), which is the one thing a widget holds for itself:
 * - The field has a draft: the text as it is typed, a string or null, in this row's own state (`useState`). What the
 *   widget shows, as its controlled `value`, is the draft while there is one and it still reads as what the model
 *   holds (`readText(spec, draft) === row.value`), and else the model's value as text: '' for an empty value, and
 *   String(number) for a number. So the input always holds exactly what was typed, React never writes another text
 *   into it under the caret, and after an Undo or a Redo that changed the field it shows what the model holds.
 * - At every `onChange`: the draft becomes the input's text, and then, in the same handler, changeField(session,
 *   picked, field, readText(spec, text), fieldKey(field, picked.id)). The change is made inside the keystroke's own
 *   event, never in an effect or a timer. A text that reads as what the field holds already (a space typed at the
 *   end of a field whose row trims) makes no change, and stays in the input as the draft.
 * - The run of typing ends, by endTyping(session, fieldKey(field, picked.id)) with the draft set to null, when the
 *   field loses the focus (`onBlur`: a Tab, a click anywhere else, another tab of the panel, another window); at
 *   Enter in a one-line field (string or number), which keeps the focus, so that what is typed next is a new step;
 *   and when this row is unmounted with its run still open (an effect's cleanup: another thing was picked or the
 *   panel's tab changed without the field losing the focus first, or another file was opened), where only
 *   endTyping() is called. In the documentation Enter is a new line. Another change, an Undo or a Redo coming first
 *   ends the run by the history's own rule.
 * - Escape does nothing to a field and is not stopped: the text stays, and the run stays open. (In an open picker
 *   Material UI closes the list at Escape, picks nothing, and stops the event.)
 * - Ctrl or ⌘ + Z in a text field is the browser's own undo of the field's text (shell/TopBar.tsx leaves the key
 *   alone there). The browser then sends an input event, which is a keystroke of the same run as any other: the
 *   model follows the text back, and a run that ends where it began is no undo step at all.
 * - A number field shows the text as typed while it is typed into; the model holds the number, or '' while the text
 *   is no number, and once the field is left it shows what the model holds, so a text that was no number is gone.
 * - A locked field takes no typing: its input is disabled.
 */
function FormRowBody({ session, picked, row }: FormRowProps): JSX.Element {
  if (row.row === 'known') {
    return (
      <div className="grasp-detail" data-detail={row.name}>
        <span className="grasp-detail-label">{row.label}</span>
        <span className="grasp-detail-value">
          {typeof row.value === 'boolean'
            ? <Checkbox size="small" disabled checked={row.value} slotProps={{ input: { 'aria-label': row.label } }} />
            : row.value === '' ? NONE : row.value}
        </span>
      </div>
    );
  }
  if (row.row === 'notHeld') {
    return (
      <div className="grasp-detail not-held" data-detail={row.name} title={notHeldWhy(row.label)}>
        <span className="grasp-detail-label">{row.label}</span>
        <span className="grasp-detail-value">{NOT_HELD}</span>
      </div>
    );
  }
  return <FieldBody session={session} picked={picked} row={row} />;
}

const sameRow = (a: FormRowProps, b: FormRowProps): boolean =>
  a.session === b.session && a.picked === b.picked && (a.row === b.row || JSON.stringify(a.row) === JSON.stringify(b.row));

export const FormRow = memo(FormRowBody, sameRow);

const boxSx = {
  '& .MuiInputBase-root': { fontSize: 13, minHeight: FIELD_HEIGHT },
  '& .MuiInputBase-input': { fontSize: 13 },
} as const;
const oneLineSx = { '& .MuiInputBase-root': { fontSize: 13, height: FIELD_HEIGHT }, '& .MuiInputBase-input': { fontSize: 13, py: 0 } } as const;

function FieldBody({ session, picked, row }: { session: Session; picked: Picked; row: FieldRow }): JSX.Element {
  const id = useId();
  const disabled = row.locked !== null;
  const label = <label className="grasp-field-label" htmlFor={id}>{row.label}</label>;
  let widget: JSX.Element;
  switch (row.type) {
    case 'string': case 'number': case 'text':
      widget = <TextBody session={session} picked={picked} row={row} id={id} label={label} />;
      break;
    case 'bool':
      widget = (
        <FormControlLabel
          label={row.label}
          disabled={disabled}
          sx={{ height: CHECK_HEIGHT, m: 0, '& .MuiFormControlLabel-label': { fontSize: 13 } }}
          control={(
            <Checkbox
              size="small"
              sx={{ p: '4px' }}
              checked={row.value === true}
              onChange={(e) => changeField(session, picked, row.field, e.target.checked)}
              slotProps={{ input: { 'data-testid': `field-${row.field}` } as object }}
            />
          )}
        />
      );
      break;
    case 'enum': {
      const legend = `${id}-legend`;
      widget = (
        <FormControl component="fieldset" disabled={disabled}>
          <FormLabel component="legend" id={legend} focused={false} sx={{ fontSize: 12, color: 'text.secondary', '&.Mui-focused, &.Mui-disabled': { color: 'text.secondary' } }}>{row.label}</FormLabel>
          <RadioGroup
            row
            aria-labelledby={legend}
            name={`field-${row.field}`}
            value={String(row.value)}
            data-testid={`field-${row.field}`}
            onChange={(e) => changeField(session, picked, row.field, e.target.value)}
          >
            {(row.choices ?? []).map((c) => (
              <FormControlLabel
                key={c.value}
                value={c.value}
                label={c.label}
                control={<Radio size="small" sx={{ p: '4px' }} />}
                sx={{ height: CHECK_HEIGHT, '& .MuiFormControlLabel-label': { fontSize: 13 } }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );
      break;
    }
    default:
      widget = <RefBody session={session} picked={picked} row={row} id={id} label={label} />;
  }
  return (
    <div className={`grasp-field${disabled ? ' locked' : ''}`} data-field={row.field}>
      {widget}
      {row.locked ? <div className="grasp-field-why">{row.locked}</div> : null}
    </div>
  );
}

interface WidgetProps { session: Session; picked: Picked; row: FieldRow; id: string; label: JSX.Element }

function TextBody({ session, picked, row, id, label }: WidgetProps): JSX.Element {
  const spec = fieldLibOf(session.lib).FIELDS[row.field];
  const key = fieldKey(row.field, picked.id);
  const [draft, setDraft] = useState<string | null>(null);
  // The run of typing ends when the row goes while it is open.
  useEffect(() => () => endTyping(session, key), [session, key]);
  const held = row.value === '' ? '' : String(row.value);
  const shown = draft !== null && readText(spec, draft) === row.value ? draft : held;
  const multiline = row.type === 'text';
  const end = () => { setDraft(null); endTyping(session, key); };
  const input = {
    'data-testid': `field-${row.field}`,
    spellCheck: false,
    ...(multiline ? {} : { autoComplete: 'off', ...(row.type === 'number' ? { inputMode: 'decimal' as const } : {}) }),
  };
  return (
    <>
      {label}
      <TextField
        id={id}
        size="small"
        fullWidth
        multiline={multiline}
        minRows={multiline ? 2 : undefined}
        disabled={row.locked !== null}
        placeholder={row.placeholder}
        value={shown}
        onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const text = e.target.value;
          setDraft(text);
          changeField(session, picked, row.field, readText(spec, text), key);
        }}
        onBlur={end}
        onKeyDown={multiline ? undefined : (e: KeyboardEvent) => { if (e.key === 'Enter') end(); }}
        sx={multiline ? boxSx : oneLineSx}
        slotProps={{ htmlInput: input }}
      />
    </>
  );
}

function RefBody({ session, picked, row, id, label }: WidgetProps): JSX.Element {
  const choice = row.choice ?? { id: '', label: '' };
  const [options, setOptions] = useState<Option[] | null>(null);
  const list = useMemo(() => options ?? [choice], [options, choice.id, choice.label]); // eslint-disable-line react-hooks/exhaustive-deps
  const value = useMemo(() => choice, [choice.id, choice.label]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      {label}
      <Autocomplete<Option, false, true>
        id={id}
        size="small"
        fullWidth
        disableClearable
        disabled={row.locked !== null}
        options={list}
        value={value}
        getOptionLabel={(o) => o.label}
        getOptionKey={(o) => o.id}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        onOpen={() => setOptions(optionsOf(session, picked, row.field))}
        onClose={() => setOptions(null)}
        onChange={(_e, o) => { if (o.id !== row.value) changeField(session, picked, row.field, o.id); }}
        sx={oneLineSx}
        renderOption={(props, o) => {
          const { key, ...rest } = props as typeof props & { key: string };
          return <li key={key} {...rest} data-option={o.id}>{o.label}</li>;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            slotProps={{ htmlInput: { ...params.inputProps, 'data-testid': `field-${row.field}`, 'data-value': String(row.value) } }}
          />
        )}
      />
    </>
  );
}
