# Repo map: doc/doc-ui

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`doc/doc-ui`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/doc/doc-ui) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 104 files there; aider read the 91 that `syson.aiderignore` leaves in, and the map shows 91 of them, 26 with definitions. [The README](../../README.md) says how to read it and what it leaves out.

```text
doc/doc-ui/.editorconfig

doc/doc-ui/.eslintrc

doc/doc-ui/.gitignore

doc/doc-ui/.gulp.json

doc/doc-ui/.nvmrc

doc/doc-ui/.stylelintrc

doc/doc-ui/gulp.d/lib/create-task.js:
⋮
│module.exports = ({ name, desc, opts, call: fn, loop }) => {
│  if (name) {
│    const displayName = fn.displayName
│    if (displayName === '<series>' || displayName === '<parallel>') {
│      metadata.get(fn).tree.label = `${displayName} ${name}`
│    }
│    fn.displayName = name
│  }
│  if (loop) {
│    const delegate = fn
│    name = delegate.displayName
│    delegate.displayName = `${name}:loop`
│    fn = () => watch(loop, { ignoreInitial: false }, delegate)
│    fn.displayName = name
⋮

doc/doc-ui/gulp.d/lib/export-tasks.js:
⋮
│module.exports = (...tasks) => {
│  const seed = {}
│  if (tasks.length) {
│    if (tasks.lastIndexOf(tasks[0]) > 0) {
│      const task1 = tasks.shift()
│      seed.default = Object.assign(task1.bind(null), { description: `=> ${task1.displayName}`, disp
│    }
│    return tasks.reduce((acc, it) => (acc[it.displayName || it.name] = it) && acc, seed)
│  } else {
│    return seed
⋮

doc/doc-ui/gulp.d/lib/gulp-prettier-eslint.js:
⋮
│const map = (transform) => new Transform({ objectMode: true, transform })
│
│module.exports = () => {
│  const report = { changed: 0, unchanged: 0 }
│  return map(format).on('finish', () => {
│    if (report.changed > 0) {
│      const changed = 'formatted '
│        .concat(report.changed)
│        .concat(' file')
│        .concat(report.changed === 1 ? '' : 's')
│      const unchanged = 'left '
│        .concat(report.unchanged)
⋮
│  function format (file, enc, next) {
│    if (file.isNull()) return next()
│    if (file.isStream()) return next(new PluginError('gulp-prettier-eslint', 'Streaming not support
│
│    const input = file.contents.toString()
│    const output = prettierEslint({ text: input, filePath: file.path })
│
│    if (input === output) {
│      report.unchanged += 1
│    } else {
⋮

doc/doc-ui/gulp.d/tasks/build-preview-pages.js:
⋮
│const map = (transform = () => {}, flush = undefined) => new Transform({ objectMode: true, transfor
⋮
│module.exports = (src, previewSrc, previewDest, sink = () => map()) => (done) =>
│  Promise.all([
│    loadSampleUiModel(previewSrc),
│    toPromise(
│      merge(compileLayouts(src), registerPartials(src), registerHelpers(src), copyImages(previewSrc
│    ),
│  ])
│    .then(([baseUiModel, { layouts }]) => {
│      const extensions = ((baseUiModel.asciidoc || {}).extensions || []).map((request) => {
│        ASCIIDOC_ATTRIBUTES[request.replace(/^@|\.js$/, '').replace(/[/]/g, '-') + '-loaded'] = ''
⋮
│function loadSampleUiModel (src) {
│  return fs.readFile(ospath.join(src, 'ui-model.yml'), 'utf8').then((contents) => yaml.safeLoad(con
⋮
│function registerPartials (src) {
│  return vfs.src('partials/*.hbs', { base: src, cwd: src }).pipe(
│    map((file, enc, next) => {
│      handlebars.registerPartial(file.stem, file.contents.toString())
│      next()
│    })
│  )
⋮
│function registerHelpers (src) {
│  handlebars.registerHelper('resolvePage', resolvePage)
│  handlebars.registerHelper('resolvePageURL', resolvePageURL)
│  return vfs.src('helpers/*.js', { base: src, cwd: src }).pipe(
│    map((file, enc, next) => {
│      handlebars.registerHelper(file.stem, requireFromString(file.contents.toString()))
│      next()
│    })
│  )
⋮
│function compileLayouts (src) {
│  const layouts = new Map()
│  return vfs.src('layouts/*.hbs', { base: src, cwd: src }).pipe(
│    map(
│      (file, enc, next) => {
│        const srcName = path.join(src, file.relative)
│        layouts.set(file.stem, handlebars.compile(file.contents.toString(), { preventIndent: true, 
│        next()
│      },
│      function (done) {
⋮
│function copyImages (src, dest) {
│  return vfs
│    .src('**/*.{png,svg}', { base: src, cwd: src })
│    .pipe(vfs.dest(dest))
│    .pipe(map((file, enc, next) => next()))
⋮
│function resolvePage (spec, context = {}) {
│  if (spec) return { pub: { url: resolvePageURL(spec) } }
⋮
│function resolvePageURL (spec, context = {}) {
│  if (spec) return '/' + (spec = spec.split(':').pop()).slice(0, spec.lastIndexOf('.')) + '.html'
⋮
│function transformHandlebarsError ({ message, stack }, layout) {
│  const m = stack.match(/^ *at Object\.ret \[as (.+?)\]/m)
│  const templatePath = `src/${m ? 'partials/' + m[1] : 'layouts/' + layout}.hbs`
│  const err = new Error(`${message}${~message.indexOf('\n') ? '\n^ ' : ' '}in UI template ${templat
│  err.stack = [err.toString()].concat(stack.slice(message.length + 8)).join('\n')
│  return err
⋮
│function toPromise (stream) {
│  return new Promise((resolve, reject, data = {}) =>
│    stream
│      .on('error', reject)
│      .on('data', (chunk) => chunk.constructor === Object && Object.assign(data, chunk))
│      .on('finish', () => resolve(data))
│  )
⋮

doc/doc-ui/gulp.d/tasks/build.js:
⋮
│const map = (transform) => new Transform({ objectMode: true, transform })
│const through = () => map((file, enc, next) => next(null, file))
⋮
│module.exports = (src, dest, preview) => () => {
│  const opts = { base: src, cwd: src }
│  const sourcemaps = preview || process.env.SOURCEMAPS === 'true'
│  const postcssPlugins = [
│    postcssImport,
│    (css, { messages, opts: { file } }) =>
│      Promise.all(
│        messages
│          .reduce((accum, { file: depPath, type }) => (type === 'dependency' ? accum.concat(depPath
│          .map((importedPath) => fs.stat(importedPath).then(({ mtime }) => mtime))
│      ).then((mtimes) => {
│        const newestMtime = mtimes.reduce((max, curr) => (!max || curr > max ? curr : max), file.st
│        if (newestMtime > file.stat.mtime) file.stat.mtimeMs = +(file.stat.mtime = newestMtime)
│      }),
│    postcssUrl([
│      {
│        filter: (asset) => new RegExp('^[~][^/]*(?:font|typeface)[^/]*/.*/files/.+[.](?:ttf|woff2?)
│        url: (asset) => {
│          const relpath = asset.pathname.slice(1)
│          const abspath = require.resolve(relpath)
│          const basename = ospath.basename(abspath)
│          const destpath = ospath.join(dest, 'font', basename)
│          if (!fs.pathExistsSync(destpath)) fs.copySync(abspath, destpath)
│          return path.join('..', 'font', basename)
⋮
│function bundle ({ base: basedir, ext: bundleExt = '.bundle.js' }) {
│  return map((file, enc, next) => {
│    if (bundleExt && file.relative.endsWith(bundleExt)) {
│      const mtimePromises = []
│      const bundlePath = file.path
│      browserify(file.relative, { basedir, detectGlobals: false })
│        .plugin('browser-pack-flat/plugin')
│        .on('file', (bundledPath) => {
│          if (bundledPath !== bundlePath) mtimePromises.push(fs.stat(bundledPath).then(({ mtime }) 
│        })
⋮
│function postcssPseudoElementFixer (css, result) {
│  css.walkRules(/(?:^|[^:]):(?:before|after)/, (rule) => {
│    rule.selector = rule.selectors.map((it) => it.replace(/(^|[^:]):(before|after)$/, '$1::$2')).jo
│  })
⋮

doc/doc-ui/gulp.d/tasks/format.js:
⋮
│module.exports = (files) => () =>
│  vfs
│    .src(files)
│    .pipe(prettier())
⋮

doc/doc-ui/gulp.d/tasks/index.js:
⋮
│const camelCase = (name) => name.replace(/[-]./g, (m) => m.slice(1).toUpperCase())
│
⋮

doc/doc-ui/gulp.d/tasks/lint-css.js:
⋮
│module.exports = (files) => (done) =>
│  vfs
│    .src(files)
│    .pipe(stylelint({ reporters: [{ formatter: 'string', console: true }], failAfterError: true }))
⋮

doc/doc-ui/gulp.d/tasks/lint-js.js:
⋮
│module.exports = (files) => (done) =>
│  vfs
│    .src(files)
│    .pipe(eslint())
│    .pipe(eslint.format())
│    .pipe(eslint.failAfterError())
⋮

doc/doc-ui/gulp.d/tasks/pack.js:
⋮
│module.exports = (src, dest, bundleName, onFinish) => () =>
│  vfs
│    .src('**/*', { base: src, cwd: src, dot: true })
│    .pipe(zip.dest(ospath.join(dest, `${bundleName}-bundle.zip`)))
⋮

doc/doc-ui/gulp.d/tasks/remove.js:
⋮
│const map = (transform) => new Transform({ objectMode: true, transform })
⋮
│module.exports = (files) => () =>
⋮

doc/doc-ui/gulp.d/tasks/serve.js:
⋮
│module.exports = (root, opts = {}, watch = undefined) => (done) => {
│  connect.server({ ...opts, middleware: opts.host === ANY_HOST ? decorateLog : undefined, root }, f
│    this.server.on('close', done)
│    if (watch) watch()
│  })
⋮
│function decorateLog (_, app) {
│  const _log = app.log
│  app.log = (msg) => {
│    if (msg.startsWith('Server started ')) {
│      const localIp = getLocalIp()
│      const replacement = '$1://localhost$2' + (localIp ? ` and $1://${localIp}$2` : '')
│      msg = msg.replace(URL_RX, replacement)
│    }
│    _log(msg)
│  }
⋮
│function getLocalIp () {
│  for (const records of Object.values(os.networkInterfaces())) {
│    for (const record of records) {
│      if (!record.internal && record.family === 'IPv4') return record.address
│    }
│  }
│  return 'localhost'
⋮

doc/doc-ui/gulpfile.js

doc/doc-ui/index.js

doc/doc-ui/package.json

doc/doc-ui/preview-src/404.adoc

doc/doc-ui/preview-src/index.adoc

doc/doc-ui/preview-src/ui-model.yml

doc/doc-ui/src/css/base.css

doc/doc-ui/src/css/body.css

doc/doc-ui/src/css/breadcrumbs.css

doc/doc-ui/src/css/custom.css

doc/doc-ui/src/css/doc.css

doc/doc-ui/src/css/footer.css

doc/doc-ui/src/css/header.css

doc/doc-ui/src/css/highlight.css

doc/doc-ui/src/css/main.css

doc/doc-ui/src/css/nav.css

doc/doc-ui/src/css/page-versions.css

doc/doc-ui/src/css/pagination.css

doc/doc-ui/src/css/print.css

doc/doc-ui/src/css/site.css

doc/doc-ui/src/css/toc.css

doc/doc-ui/src/css/toolbar.css

doc/doc-ui/src/css/typeface-roboto-mono.css

doc/doc-ui/src/css/typeface-roboto.css

doc/doc-ui/src/css/vars.css

doc/doc-ui/src/css/vendor/swagger-ui.css

doc/doc-ui/src/helpers/and.js:
⋮
│module.exports = (...args) => {
│  const numArgs = args.length
│  if (numArgs === 3) return args[0] && args[1]
│  if (numArgs < 3) throw new Error('{{and}} helper expects at least 2 arguments')
│  args.pop()
│  return args.every((it) => it)
⋮

doc/doc-ui/src/helpers/detag.js:
⋮
│module.exports = (html) => html && html.replace(TAG_ALL_RX, '')

doc/doc-ui/src/helpers/eq.js:
⋮
│module.exports = (a, b) => a === b

doc/doc-ui/src/helpers/increment.js:
⋮
│module.exports = (value) => (value || 0) + 1

doc/doc-ui/src/helpers/ne.js:
⋮
│module.exports = (a, b) => a !== b

doc/doc-ui/src/helpers/not.js:
⋮
│module.exports = (val) => !val

doc/doc-ui/src/helpers/or.js:
⋮
│module.exports = (...args) => {
│  const numArgs = args.length
│  if (numArgs === 3) return args[0] || args[1]
│  if (numArgs < 3) throw new Error('{{or}} helper expects at least 2 arguments')
│  args.pop()
│  return args.some((it) => it)
⋮

doc/doc-ui/src/helpers/relativize.js:
⋮
│module.exports = (to, from, ctx) => {
│  if (!to) return '#'
│  if (to.charAt() !== '/') return to
│  // NOTE only legacy invocation provides both to and from
│  if (!ctx) from = (ctx = from).data.root.page.url
│  if (!from) return (ctx.data.root.site.path || '') + to
│  let hash = ''
│  const hashIdx = to.indexOf('#')
│  if (~hashIdx) {
│    hash = to.slice(hashIdx)
⋮
│function isDir (str) {
│  return str.charAt(str.length - 1) === '/'
⋮

doc/doc-ui/src/helpers/year.js:
⋮
│module.exports = () => new Date().getFullYear().toString()

doc/doc-ui/src/img/favicon.ico

doc/doc-ui/src/js/01-nav.js:
⋮
│  function onHashChange () {
│    var navLink
│    var hash = window.location.hash
│    if (hash) {
│      if (hash.indexOf('%')) hash = decodeURIComponent(hash)
│      navLink = menuPanel.querySelector('.nav-link[href="' + hash + '"]')
│      if (!navLink) {
│        var targetNode = document.getElementById(hash.slice(1))
│        if (targetNode) {
│          var current = targetNode
⋮
│  function activateCurrentPath (navItem) {
│    var ancestorClasses
│    var ancestor = navItem.parentNode
│    while (!(ancestorClasses = ancestor.classList).contains('nav-menu')) {
│      if (ancestor.tagName === 'LI' && ancestorClasses.contains('nav-item')) {
│        ancestorClasses.add('is-active', 'is-current-path')
│      }
│      ancestor = ancestor.parentNode
│    }
│    navItem.classList.add('is-active')
⋮
│  function toggleActive () {
│    if (this.classList.toggle('is-active')) {
│      var padding = parseFloat(window.getComputedStyle(this).marginTop)
│      var rect = this.getBoundingClientRect()
│      var menuPanelRect = menuPanel.getBoundingClientRect()
│      var overflowY = (rect.bottom - menuPanelRect.top - menuPanelRect.height + padding).toFixed()
│      if (overflowY > 0) menuPanel.scrollTop += Math.min((rect.top - menuPanelRect.top - padding).t
│    }
⋮
│  function showNav (e) {
│    if (navToggle.classList.contains('is-active')) return hideNav(e)
│    trapEvent(e)
│    var html = document.documentElement
│    html.classList.add('is-clipped--nav')
│    navToggle.classList.add('is-active')
│    navContainer.classList.add('is-active')
│    var bounds = nav.getBoundingClientRect()
│    var expectedHeight = window.innerHeight - Math.round(bounds.top)
│    if (Math.round(bounds.height) !== expectedHeight) nav.style.height = expectedHeight + 'px'
⋮
│  function hideNav (e) {
│    trapEvent(e)
│    var html = document.documentElement
│    html.classList.remove('is-clipped--nav')
│    navToggle.classList.remove('is-active')
│    navContainer.classList.remove('is-active')
│    html.removeEventListener('click', hideNav)
⋮
│  function trapEvent (e) {
│    e.stopPropagation()
⋮
│  function scrollItemToMidpoint (panel, el) {
│    var rect = panel.getBoundingClientRect()
│    var effectiveHeight = rect.height
│    var navStyle = window.getComputedStyle(nav)
│    if (navStyle.position === 'sticky') effectiveHeight -= rect.top - parseFloat(navStyle.top)
│    panel.scrollTop = Math.max(0, (el.getBoundingClientRect().height - effectiveHeight) * 0.5 + el.
⋮
│  function find (from, selector) {
│    return [].slice.call(from.querySelectorAll(selector))
⋮
│  function findNextElement (from, selector) {
│    var el = from.nextElementSibling
│    return el && selector ? el[el.matches ? 'matches' : 'msMatchesSelector'](selector) && el : el
⋮

doc/doc-ui/src/js/02-on-this-page.js:
⋮
│  function onScroll () {
│    var scrolledBy = window.pageYOffset
│    var buffer = getNumericStyleVal(document.documentElement, 'fontSize') * 1.15
│    var ceil = article.offsetTop
│    if (scrolledBy && window.innerHeight + scrolledBy + 2 >= document.documentElement.scrollHeight)
│      lastActiveFragment = Array.isArray(lastActiveFragment) ? lastActiveFragment : Array(lastActiv
│      var activeFragments = []
│      var lastIdx = headings.length - 1
│      headings.forEach(function (heading, idx) {
│        var fragment = '#' + heading.id
⋮
│  function find (selector, from) {
│    return [].slice.call((from || document).querySelectorAll(selector))
⋮
│  function getNumericStyleVal (el, prop) {
│    return parseFloat(window.getComputedStyle(el)[prop])
⋮

doc/doc-ui/src/js/03-fragment-jumper.js:
⋮
│  function decodeFragment (hash) {
│    return hash && (~hash.indexOf('%') ? decodeURIComponent(hash) : hash).slice(1)
⋮
│  function computePosition (el, sum) {
│    return article.contains(el) ? computePosition(el.offsetParent, el.offsetTop + sum) : sum
⋮
│  function jumpToAnchor (e) {
│    if (e) {
│      if (e.altKey || e.ctrlKey) return
│      window.location.hash = '#' + this.id
│      e.preventDefault()
│    }
│    var y = computePosition(this, 0) - toolbar.getBoundingClientRect().bottom
│    var instant = e === false && supportsScrollToOptions
│    instant ? window.scrollTo({ left: 0, top: y, behavior: 'instant' }) : window.scrollTo(0, y)
⋮
│  window.addEventListener('load', function jumpOnLoad (e) {
│    var fragment, target
│    if ((fragment = decodeFragment(window.location.hash)) && (target = document.getElementById(frag
│      jumpToAnchor.call(target, false)
│      setTimeout(jumpToAnchor.bind(target, false), 250)
│    }
│    window.removeEventListener('load', jumpOnLoad)
⋮

doc/doc-ui/src/js/04-page-versions.js

doc/doc-ui/src/js/05-mobile-navbar.js:
⋮
│  function toggleNavbarMenu (e) {
│    e.stopPropagation() // trap event
│    document.documentElement.classList.toggle('is-clipped--navbar')
│    navbarBurger.setAttribute('aria-expanded', this.classList.toggle('is-active'))
│    var menu = document.getElementById(this.getAttribute('aria-controls') || this.dataset.target)
│    if (menu.classList.toggle('is-active')) {
│      menu.style.maxHeight = ''
│      var expectedMaxHeight = window.innerHeight - Math.round(menu.getBoundingClientRect().top)
│      var actualMaxHeight = parseInt(window.getComputedStyle(menu).maxHeight, 10)
│      if (actualMaxHeight !== expectedMaxHeight) menu.style.maxHeight = expectedMaxHeight + 'px'
⋮

doc/doc-ui/src/js/06-copy-to-clipboard.js:
⋮
│  function extractCommands (text) {
│    var cmds = []
│    var m
│    while ((m = CMD_RX.exec(text))) cmds.push(m[1].replace(LINE_CONTINUATION_RX, '$1$2'))
│    return cmds.join(' && ')
⋮
│  function writeToClipboard (code) {
│    var text = code.innerText.replace(TRAILING_SPACE_RX, '')
│    if (code.dataset.lang === 'console' && text.startsWith('$ ')) text = extractCommands(text)
│    window.navigator.clipboard.writeText(text).then(
│      function () {
│        this.classList.add('clicked')
│        this.offsetHeight // eslint-disable-line no-unused-expressions
│        this.classList.remove('clicked')
│      }.bind(this),
│      function () {}
⋮

doc/doc-ui/src/layouts/404.hbs

doc/doc-ui/src/layouts/default.hbs

doc/doc-ui/src/partials/article-404.hbs

doc/doc-ui/src/partials/article.hbs

doc/doc-ui/src/partials/body.hbs

doc/doc-ui/src/partials/breadcrumbs.hbs

doc/doc-ui/src/partials/edit-this-page.hbs

doc/doc-ui/src/partials/footer-content.hbs

doc/doc-ui/src/partials/footer-scripts.hbs

doc/doc-ui/src/partials/footer.hbs

doc/doc-ui/src/partials/head-icons.hbs

doc/doc-ui/src/partials/head-info.hbs

doc/doc-ui/src/partials/head-meta.hbs

doc/doc-ui/src/partials/head-prelude.hbs

doc/doc-ui/src/partials/head-scripts.hbs

doc/doc-ui/src/partials/head-styles.hbs

doc/doc-ui/src/partials/head-title.hbs

doc/doc-ui/src/partials/head.hbs

doc/doc-ui/src/partials/header-content.hbs

doc/doc-ui/src/partials/header-scripts.hbs

doc/doc-ui/src/partials/header.hbs

doc/doc-ui/src/partials/main.hbs

doc/doc-ui/src/partials/nav-explore.hbs

doc/doc-ui/src/partials/nav-menu.hbs

doc/doc-ui/src/partials/nav-toggle.hbs

doc/doc-ui/src/partials/nav-tree.hbs

doc/doc-ui/src/partials/nav.hbs

doc/doc-ui/src/partials/page-versions.hbs

doc/doc-ui/src/partials/pagination.hbs

doc/doc-ui/src/partials/toc.hbs

doc/doc-ui/src/partials/toolbar.hbs
```
