package StrongholdProof {
    doc
    /*
     * One app, built once with current tools, and thin hosts that load it into a page the same
     * way. The names follow the code: app/, hosts/server, hosts/online, hosts/dev.
     */
    private import ModelingMetadata::*;

    part def Page {
        doc
        /*
         * A page with Stronghold on it: a SharePoint Server page, a SharePoint Online page, a
         * Teams tab, or the dev page. Every Stronghold web part on the page mounts the same
         * app, because the first entry file to load wins (app/src/host/load-app.ts).
         */
        rep 'app/src/host/load-app.ts' language "typescript"
        /*
         * export function loadApp(root: HTMLElement): void {
         *   // The first entry file to load wins: a second web part on the page finds the app mounted.
         *   if (window.Stronghold) return;
         *   mount(root);
         * }
         */
        part hosts : Host [1..*] {
            port :>> api : ~StrongholdApp;
        }
        part app : App [1] {
            port :>> api : StrongholdApp;
        }
        connection mount connect hosts.api to app.api;
    }

    abstract part def Host {
        doc
        /*
         * hosts/: the small piece of code that plugs the app into one place. It works out
         * where its package's files are, loads the entry file with the shared loader, and
         * calls mount. It has no settings: it only ever loads the app from its own package.
         */
        rep 'hosts/README.md' language "markdown" /* */
        port api : ~StrongholdApp;
    }

    part def App {
        doc
        /*
         * app/: Stronghold itself, built once with webpack 5 and TypeScript 5.9. Nothing in it
         * knows about SharePoint.
         */
        port api : StrongholdApp;
    }

    port def StrongholdApp {
        doc /* What the app's entry file registers on window.Stronghold. */
    }

    part def ServerHost :> Host {
        doc /* hosts/server: the web part for SharePoint Server. */
    }

    part def OnlineHost :> Host {
        doc /* hosts/online: the web part for SharePoint Online, which is also the Teams tab. */
    }

    part def DevHost :> Host {
        doc
        /*
         * hosts/dev: a plain page that mounts the app the way the SharePoint hosts do. It
         * never ships.
         */
    }

    metadata <n1> : Issue about StrongholdProof::Host { text = "Should Host stay abstract now that DevHost, the one host that never ships, is a part def of its own?"; }
    metadata StatusInfo about n1 { status = StatusKind::open; }

    metadata <n2> : Issue about StrongholdProof::Page::mount { text = "Is the mount one connection or one per host?"; }
    metadata Rationale about n2 { text = "One connection usage: hosts is [1..*], so each host's api is connected to the app's api."; }
    metadata StatusInfo about n2 { status = StatusKind::done; }

    metadata <n3> : Issue { text = "HostFiles, the package of files a host serves, is not drawn yet. Where does it go: beside Host, or inside it?"; }
    metadata StatusInfo about n3 { status = StatusKind::open; }

    metadata <n4> : Issue about StrongholdProof::Page { text = "Rename Page to HostPage?"; }
    metadata Rationale about n4 { text = "No: Page is the SharePoint page itself, whichever host put the app on it, so the name stands."; }
    metadata StatusInfo about n4 { status = StatusKind::closed; }

    view proofStructure : StandardViewDefinitions::GeneralView {
        expose StrongholdProof::*::**;
    }
}
