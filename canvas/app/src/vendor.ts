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
// Slice 2's icons (plan/slice-2.md, section 8, package 2-1): New view; Add note; Archive and Restore; Delete; Copy; the text tab.
import * as Add from '@mui/icons-material/Add';
import * as AddCommentOutlined from '@mui/icons-material/AddCommentOutlined';
import * as ArchiveOutlined from '@mui/icons-material/ArchiveOutlined';
import * as UnarchiveOutlined from '@mui/icons-material/UnarchiveOutlined';
import * as DeleteOutline from '@mui/icons-material/DeleteOutline';
import * as ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import * as ArticleOutlined from '@mui/icons-material/ArticleOutlined';

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
  '@mui/icons-material/Add': Add,
  '@mui/icons-material/AddCommentOutlined': AddCommentOutlined,
  '@mui/icons-material/ArchiveOutlined': ArchiveOutlined,
  '@mui/icons-material/UnarchiveOutlined': UnarchiveOutlined,
  '@mui/icons-material/DeleteOutline': DeleteOutline,
  '@mui/icons-material/ContentCopyOutlined': ContentCopyOutlined,
  '@mui/icons-material/ArticleOutlined': ArticleOutlined,
};
