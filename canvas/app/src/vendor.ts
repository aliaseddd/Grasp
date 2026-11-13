// The libraries, bundled into vendor.js and put on one global, window.GraspVendor, keyed by import path. app.js reads
// them from there: the build answers every import of a library in the application's code from this table, and refuses
// an import of a package that isn't in it. Each library is imported whole here. Icons come one by one, by path, never
// the whole set.

import * as React from 'react';
import * as JsxRuntime from 'react/jsx-runtime';
import * as ReactDOMClient from 'react-dom/client';
import * as XYFlow from '@xyflow/react';
import * as Dockview from 'dockview-react';
import * as MUI from '@mui/material';
import * as TreeView from '@mui/x-tree-view';
import * as FolderOpenOutlined from '@mui/icons-material/FolderOpenOutlined';
import * as SaveOutlined from '@mui/icons-material/SaveOutlined';
import * as Undo from '@mui/icons-material/Undo';
import * as Redo from '@mui/icons-material/Redo';
import * as InfoOutlined from '@mui/icons-material/InfoOutlined';

import '@xyflow/react/dist/style.css';
import 'dockview-react/dist/styles/dockview.css';
import './fonts.css';

window.GraspVendor = {
  'react': React,
  'react/jsx-runtime': JsxRuntime,
  'react-dom/client': ReactDOMClient,
  '@xyflow/react': XYFlow,
  'dockview-react': Dockview,
  '@mui/material': MUI,
  '@mui/x-tree-view': TreeView,
  '@mui/icons-material/FolderOpenOutlined': FolderOpenOutlined,
  '@mui/icons-material/SaveOutlined': SaveOutlined,
  '@mui/icons-material/Undo': Undo,
  '@mui/icons-material/Redo': Redo,
  '@mui/icons-material/InfoOutlined': InfoOutlined,
};
