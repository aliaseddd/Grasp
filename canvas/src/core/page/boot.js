// The page's last script: it starts the page, once every script before it has registered what it defines.
(function (C) {
  'use strict';
  const { NARROW, setPanel, start } = C;

  start();
  if (NARROW.matches) setPanel(false);
})(window.SysMLCanvas);
