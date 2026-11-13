import { Divider, Menu, MenuItem, Snackbar, ToggleButton, Tooltip } from '@mui/material';
export function P(): JSX.Element {
  return (
    <>
      <Menu open anchorReference="anchorPosition" anchorPosition={{ left: 1, top: 2 }} transitionDuration={0}
        slotProps={{ list: { 'data-testid': 'palette', 'aria-label': 'Make here', dense: true }, root: { onContextMenu: (e) => { e.preventDefault(); e.stopPropagation(); } } }}>
        {[<MenuItem key="a" data-tool="PartUsage">part</MenuItem>, <Divider key="d" component="li" />]}
      </Menu>
      <Snackbar open message="x" autoHideDuration={8000} disableWindowBlurListener transitionDuration={0} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={(_e, why) => { if (why === 'clickaway') return; }} slotProps={{ content: { 'data-testid': 'toast', role: 'status', sx: { bgcolor: '#000' } } }} />
      <Tooltip title="t" describeChild placement="right"><ToggleButton value="k" selected={false} data-testid="tool" data-tool="k">part def</ToggleButton></Tooltip>
    </>
  );
}
