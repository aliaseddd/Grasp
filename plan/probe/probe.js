// Grasp work-machine probe: classic script, no libraries. Results go to window.REPORT and the table.
(function () {
  'use strict';
  var REPORT = (window.REPORT = { when: new Date().toISOString(), checks: {} });
  var rows = {};

  function show(name, value, level) {
    REPORT.checks[name] = value;
    var tb = document.querySelector('#out tbody');
    if (!tb) return;
    var tr = rows[name];
    if (!tr) {
      tr = rows[name] = document.createElement('tr');
      tr.appendChild(document.createElement('td')).textContent = name;
      tr.appendChild(document.createElement('td'));
      tb.appendChild(tr);
    }
    var td = tr.children[1];
    td.textContent = typeof value === 'string' ? value : JSON.stringify(value);
    td.className = level || '';
  }
  function lvl(v) { return /^(ok|yes|function|true)/i.test(String(v)) ? 'ok' : /^(fail|throw|error|no|blocked|undefined|false)/i.test(String(v)) ? 'bad' : 'warn'; }
  function put(name, v) { show(name, v, lvl(v)); }
  function msg(e) { return (e && e.name ? e.name + ': ' : '') + (e && e.message ? e.message : String(e)); }
  function errText(e) { return 'fail: ' + msg(e); }

  // ---- tiny hand-assembled wasm modules --------------------------------------
  var ADD = new Uint8Array([0,97,115,109,1,0,0,0, 1,7,1,96,2,127,127,1,127, 3,2,1,0, 7,7,1,3,97,100,100,0,0, 10,9,1,7,0,32,0,32,1,106,11]);
  var SUM = new Uint8Array([0,97,115,109,1,0,0,0, 1,6,1,96,1,127,1,127, 3,2,1,0, 7,7,1,3,115,117,109,0,0,
    10,27,1,25,1,1,127, 3,64, 32,1,32,0,106,33,1, 32,0,65,1,107,34,0, 13,0, 11, 32,1, 11]);

  // ---- automatic checks -------------------------------------------------------
  function sync() {
    put('page origin', String(location.origin) + ' (' + location.protocol + ')');
    show('browser', navigator.userAgent + (navigator.userAgentData ? ' | brands: ' + navigator.userAgentData.brands.map(function (b) { return b.brand + ' ' + b.version; }).join(', ') : ''));
    show('cores / memory GB', (navigator.hardwareConcurrency || '?') + ' / ' + (navigator.deviceMemory || '?'));
    put('secure context', window.isSecureContext ? 'yes' : 'no');
    put('classic script (this one)', 'ok');
    put('module script from file', window.MODULE_LOADED ? 'yes (unexpected: blocked in Chromium 153)' : 'no (expected: blocked from file://)');
    put('showDirectoryPicker', typeof window.showDirectoryPicker);
    put('showOpenFilePicker', typeof window.showOpenFilePicker);
    put('showSaveFilePicker', typeof window.showSaveFilePicker);
    put('WebAssembly', typeof window.WebAssembly);
    put('DecompressionStream', typeof window.DecompressionStream);
    try { localStorage.setItem('probe', '1'); put('localStorage', localStorage.getItem('probe') === '1' ? 'ok' : 'fail: no read-back'); }
    catch (e) { put('localStorage', errText(e)); }
  }

  function asyncChecks() {
    var jobs = [];
    jobs.push(new Promise(function (res) {
      try { var r = indexedDB.open('grasp-probe', 1); r.onupgradeneeded = function () { r.result.createObjectStore('h'); }; r.onsuccess = function () { put('indexedDB', 'ok'); r.result.close(); res(); }; r.onerror = function () { put('indexedDB', 'fail: ' + msg(r.error)); res(); }; r.onblocked = function () { put('indexedDB', 'fail: blocked'); res(); }; }
      catch (e) { put('indexedDB', errText(e)); res(); }
    }));
    jobs.push(fetch('probe.css').then(function () { put('fetch of a sibling file', 'yes (unexpected)'); }).catch(function (e) { put('fetch of a sibling file', 'no (expected from file://): ' + msg(e)); }));
    jobs.push(new Promise(function (res) {
      try { var w = new Worker('probe.js'); var t = setTimeout(function () { put('Worker from a file', 'no (timeout)'); res(); }, 1500); w.onmessage = function () { clearTimeout(t); put('Worker from a file', 'yes (unexpected)'); res(); }; w.onerror = function (e) { clearTimeout(t); put('Worker from a file', 'no (expected): ' + (e.message || 'error')); res(); }; }
      catch (e) { put('Worker from a file', 'no (expected): ' + msg(e)); res(); }
    }));
    jobs.push(new Promise(function (res) {
      try {
        var src = 'onmessage=function(e){postMessage("hi:"+e.data)}';
        var w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
        var t = setTimeout(function () { put('Worker from a Blob URL', 'fail: timeout'); res(); }, 3000);
        w.onmessage = function () { clearTimeout(t); put('Worker from a Blob URL', 'ok'); w.terminate(); res(); };
        w.onerror = function (e) { clearTimeout(t); put('Worker from a Blob URL', 'fail: ' + (e.message || 'error')); res(); };
        w.postMessage('x');
      } catch (e) { put('Worker from a Blob URL', errText(e)); res(); }
    }));
    jobs.push(wasmChecks());
    jobs.push(network());
    return Promise.all(jobs);
  }

  function wasmChecks() {
    if (typeof WebAssembly !== 'object') { put('WebAssembly compile', 'blocked: WebAssembly is not defined'); return Promise.resolve(); }
    var t0 = performance.now();
    return WebAssembly.instantiate(ADD).then(function (r) {
      var out = r.instance.exports.add(2, 3);
      put('WebAssembly in page', (out === 5 ? 'ok' : 'fail: add(2,3)=' + out) + ' (' + (performance.now() - t0).toFixed(1) + ' ms)');
    }).catch(function (e) { put('WebAssembly in page', errText(e)); }).then(function () {
      return new Promise(function (res) {
        var src =
          'onmessage=function(e){var R={};try{var t=performance.now();' +
          'WebAssembly.instantiate(e.data.sum).then(function(m){R.compileMs=performance.now()-t;' +
          'var n=e.data.n,a=performance.now();var v=m.instance.exports.sum(n);R.wasmMs=performance.now()-a;R.wasmValue=v;' +
          'var b=performance.now(),acc=0,i=n;do{acc=(acc+i)|0;i=i-1}while(i!==0);R.jsMs=performance.now()-b;R.jsValue=acc;R.n=n;postMessage(R)})' +
          '.catch(function(x){postMessage({error:String(x)})})}catch(x){postMessage({error:String(x)})}}';
        try {
          var w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
          var timer = setTimeout(function () { put('WebAssembly speed in a worker', 'fail: no answer in 120 s (interpreter-only or blocked?)'); w.terminate(); res(); }, 120000);
          w.onmessage = function (e) {
            clearTimeout(timer); var r = e.data; w.terminate();
            if (r.error) { put('WebAssembly speed in a worker', 'fail: ' + r.error); return res(); }
            var ratio = r.wasmMs / Math.max(r.jsMs, 0.01);
            var verdict = ratio < 3 ? 'ok: compiled speed' : ratio < 30 ? 'warn: slower than JS (' + ratio.toFixed(1) + 'x)' : 'warn: interpreter-like (' + ratio.toFixed(0) + 'x slower than JS)';
            show('WebAssembly speed in a worker', verdict + ' | 50M loop: wasm ' + r.wasmMs.toFixed(0) + ' ms, JS ' + r.jsMs.toFixed(0) + ' ms, compile ' + r.compileMs.toFixed(1) + ' ms; values ' + (r.wasmValue === r.jsValue ? 'agree' : 'DIFFER'), /^ok/.test(verdict) ? 'ok' : 'warn');
            res();
          };
          w.onerror = function (e) { clearTimeout(timer); put('WebAssembly speed in a worker', 'fail: ' + (e.message || 'worker error')); res(); };
          w.postMessage({ sum: SUM, n: 50000000 });
        } catch (e) { put('WebAssembly speed in a worker', errText(e)); res(); }
      });
    });
  }

  function net(name, url, opts, describe) {
    var t0 = performance.now();
    return fetch(url, opts).then(function (r) {
      return r.text().then(function (t) { var d = describe ? describe(r, t) : ''; show(name, 'ok: status ' + r.status + ' ' + d + '(' + (performance.now() - t0).toFixed(0) + ' ms)', 'ok'); });
    }).catch(function (e) { put(name, 'fail: ' + msg(e) + ' (network blocked, or a CORS refusal)'); });
  }
  function network() {
    return Promise.all([
      net('GitHub API, GET', 'https://api.github.com/repos/aliaseddd/grasp', {}, function (r) { return 'rate limit remaining ' + r.headers.get('x-ratelimit-remaining') + ' '; }),
      // A PUT with an Authorization header is preflighted. An invalid token must come back 401 (or 404): that proves the preflight passed and nothing is written.
      net('GitHub API, PUT with Authorization (invalid token, nothing written)', 'https://api.github.com/repos/aliaseddd/grasp/contents/probe-never-written.txt', {
        method: 'PUT', headers: { Authorization: 'Bearer invalid-probe-token', 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' }, body: JSON.stringify({ message: 'probe', content: 'AA==' })
      }, function (r) { return r.status === 401 || r.status === 404 ? '(expected: the preflight passed and the token was refused) ' : '(unexpected status) '; }),
      net('raw.githubusercontent.com', 'https://raw.githubusercontent.com/aliaseddd/grasp/main/README.md', {}),
      net('github.com (no-cors reachability)', 'https://github.com/', { mode: 'no-cors' })
    ]);
  }

  // ---- IndexedDB handle store -------------------------------------------------
  function db() { return new Promise(function (res, rej) { var r = indexedDB.open('grasp-probe', 1); r.onupgradeneeded = function () { r.result.createObjectStore('h'); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  function idbPut(k, v) { return db().then(function (d) { return new Promise(function (res, rej) { var t = d.transaction('h', 'readwrite'); t.objectStore('h').put(v, k); t.oncomplete = res; t.onerror = function () { rej(t.error); }; }); }); }
  function idbGet(k) { return db().then(function (d) { return new Promise(function (res, rej) { var q = d.transaction('h').objectStore('h').get(k); q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej(q.error); }; }); }); }

  // ---- click checks -------------------------------------------------------------
  function pickFolder() {
    if (typeof window.showDirectoryPicker !== 'function') return put('folder picker, write, read', 'blocked: showDirectoryPicker is ' + typeof window.showDirectoryPicker);
    var dir;
    window.showDirectoryPicker({ mode: 'readwrite' }).then(function (d) {
      dir = d;
      return dir.getFileHandle('grasp-probe.txt', { create: true });
    }).then(function (fh) { return fh.createWritable().then(function (w) { return w.write('grasp probe ' + new Date().toISOString()).then(function () { return w.close(); }); }).then(function () { return fh.getFile(); }); })
      .then(function (f) { return f.text(); })
      .then(function (t) { put('folder picker, write, read', 'ok: wrote and read back "' + t.slice(0, 40) + '" in folder "' + dir.name + '"'); return idbPut('dir', dir).then(function () { put('folder handle stored in IndexedDB', 'ok (now reload with F5 and click 2)'); }); })
      .catch(function (e) { put('folder picker, write, read', errText(e)); });
  }
  function recheck() {
    idbGet('dir').then(function (d) {
      if (!d) return put('remembered folder after reload', 'no: nothing stored (run 1 first, then F5)');
      return d.queryPermission({ mode: 'readwrite' }).then(function (p) {
        show('remembered folder after reload', 'handle survived; permission is "' + p + '"' + (p === 'granted' ? '' : ' (the page must ask again with requestPermission on a click)'), p === 'granted' ? 'ok' : 'warn');
        if (p !== 'granted') return d.requestPermission({ mode: 'readwrite' }).then(function (q) { show('re-asking permission', q, q === 'granted' ? 'ok' : 'warn'); });
      });
    }).catch(function (e) { put('remembered folder after reload', errText(e)); });
  }
  function savePicker() {
    if (typeof window.showSaveFilePicker !== 'function') return put('save-file picker', 'blocked: ' + typeof window.showSaveFilePicker);
    window.showSaveFilePicker({ suggestedName: 'grasp-probe-save.txt' }).then(function (fh) { return fh.createWritable().then(function (w) { return w.write('saved by the probe').then(function () { return w.close(); }); }).then(function () { put('save-file picker', 'ok: wrote ' + fh.name); }); }).catch(function (e) { put('save-file picker', errText(e)); });
  }
  function openPicker() {
    if (typeof window.showOpenFilePicker !== 'function') return put('open-file picker', 'blocked: ' + typeof window.showOpenFilePicker);
    window.showOpenFilePicker().then(function (a) { return a[0].getFile(); }).then(function (f) { put('open-file picker', 'ok: read "' + f.name + '" (' + f.size + ' bytes)'); }).catch(function (e) { put('open-file picker', errText(e)); });
  }
  function inputFile(ev) {
    var f = ev.target.files && ev.target.files[0];
    if (!f) return put('file input', 'no: no file chosen (the dialog may be blocked by policy)');
    f.text().then(function (t) { put('file input', 'ok: read "' + f.name + '" (' + t.length + ' chars)'); }).catch(function (e) { put('file input', errText(e)); });
  }
  function download() {
    try {
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['downloaded by the probe'], { type: 'text/plain' })); a.download = 'grasp-probe.txt';
      document.body.appendChild(a); a.click(); a.remove();
      show('download', 'clicked: check that grasp-probe.txt arrived in your downloads, and tell us', 'warn');
    } catch (e) { put('download', errText(e)); }
  }

  function report() {
    var lines = ['Grasp work-machine probe ' + REPORT.when];
    Object.keys(REPORT.checks).forEach(function (k) { lines.push('- ' + k + ': ' + (typeof REPORT.checks[k] === 'string' ? REPORT.checks[k] : JSON.stringify(REPORT.checks[k]))); });
    var text = lines.join('\n');
    document.getElementById('report').value = text;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(function () {});
    return text;
  }

  window.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    $('run').onclick = function () { sync(); asyncChecks().then(function () { show('automatic checks', 'finished', 'ok'); }); };
    $('copy').onclick = report;
    $('b-dir').onclick = pickFolder; $('b-dir2').onclick = recheck; $('b-save').onclick = savePicker; $('b-open').onclick = openPicker;
    $('f-input').onchange = inputFile; $('b-dl').onclick = download;
    if (location.hash === '#auto') $('run').click();
  });
})();
