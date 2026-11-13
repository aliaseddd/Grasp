const V = window.GraspVendor; const React = V['react']; const M = V['@mui/material']; const h = React.createElement;
const { useState, useId } = React;
window.log = [];
function Text({ field, label, multiline }) {
  const id = useId(); const [model, setModel] = useState('Host'); const [draft, setDraft] = useState(null);
  const value = draft !== null ? draft : model;
  return h('div', { className: 'grasp-field', 'data-field': field },
    h('label', { className: 'grasp-field-label', htmlFor: id }, label),
    h(M.TextField, { id, size: 'small', fullWidth: true, multiline, minRows: multiline ? 2 : undefined, value,
      onChange: (e) => { setDraft(e.target.value); setModel(e.target.value); window.log.push(['change', field, e.target.value, e.nativeEvent.inputType]); },
      onBlur: () => { setDraft(null); window.log.push(['blur', field]); },
      slotProps: { htmlInput: { 'data-testid': 'field-' + field, autoComplete: 'off', spellCheck: false } } }));
}
function Check({ field, label }) {
  const [v, setV] = useState(false);
  return h('div', { className: 'grasp-field', 'data-field': field }, h(M.FormControlLabel, { label, control: h(M.Checkbox, { size: 'small', checked: v, onChange: (e) => { setV(e.target.checked); window.log.push(['check', field, e.target.checked]); }, slotProps: { input: { 'data-testid': 'field-' + field } } }) }));
}
function Radios({ field, label, values }) {
  const id = useId(); const [v, setV] = useState('out');
  return h('div', { className: 'grasp-field', 'data-field': field }, h(M.FormControl, { component: 'fieldset' },
    h(M.FormLabel, { component: 'legend', id }, label),
    h(M.RadioGroup, { row: true, 'aria-labelledby': id, 'data-testid': 'field-' + field, name: 'field-' + field, value: v, onChange: (e) => { setV(e.target.value); window.log.push(['radio', field, e.target.value]); } },
      values.map((x) => h(M.FormControlLabel, { key: x, value: x, label: x || 'unset', control: h(M.Radio, { size: 'small' }) })))));
}
const ALL = [{ id: '', label: 'nothing yet' }, ...['Page', 'Host', 'App', 'ServerHost', 'OnlineHost', 'DevHost'].map((x) => ({ id: x, label: x }))];
function Picker({ field, label }) {
  const id = useId(); const [choice, setChoice] = useState(ALL[2]); const [open, setOpen] = useState(null);
  return h('div', { className: 'grasp-field', 'data-field': field }, h('label', { className: 'grasp-field-label', htmlFor: id }, label),
    h(M.Autocomplete, { id, size: 'small', fullWidth: true, disableClearable: true, value: choice, options: open || [choice],
      onOpen: () => { setOpen(ALL); window.log.push(['open']); }, onClose: () => { setOpen(null); window.log.push(['close']); },
      getOptionLabel: (o) => o.label, getOptionKey: (o) => o.id, isOptionEqualToValue: (a, b) => a.id === b.id,
      onChange: (e, o) => { window.log.push(['pick', o.id]); if (o.id !== choice.id) setChoice(o); },
      renderOption: (props, option) => { const { key, ...rest } = props; return h('li', { key, ...rest, 'data-option': option.id }, option.label); },
      renderInput: (params) => h(M.TextField, { ...params, slotProps: { htmlInput: { ...params.inputProps, 'data-testid': 'field-' + field, 'data-value': choice.id } } }) }));
}
function App() {
  const [tab, setTab] = useState('Core');
  return h('div', { className: 'grasp-details' },
    h(M.Tabs, { value: tab, onChange: (e, v) => setTab(v), 'aria-label': 'Details', selectionFollowsFocus: true }, h(M.Tab, { value: 'Core', label: 'Core' }), h(M.Tab, { value: 'Advanced', label: 'Advanced' })),
    h('div', { className: 'grasp-details-page', role: 'tabpanel', 'data-tab': tab },
      h(Text, { field: 'name', label: 'Declared Name' }), h(Text, { field: 'doc', label: 'Documentation', multiline: true }),
      h(Check, { field: 'abstract', label: 'Is Abstract' }), h(Radios, { field: 'direction', label: 'Direction', values: ['', 'in', 'inout', 'out'] }),
      h(Picker, { field: 'type', label: 'Typed by' }),
      h('div', { className: 'grasp-detail', 'data-detail': 'isLibraryElement' }, h('span', { className: 'grasp-detail-label' }, 'Is Library Element'), h('span', { className: 'grasp-detail-value' }, h(M.Checkbox, { size: 'small', disabled: true, checked: false, slotProps: { input: { 'aria-label': 'Is Library Element' } } })))));
}
V['react-dom/client'].createRoot(document.getElementById('root')).render(h(App));
