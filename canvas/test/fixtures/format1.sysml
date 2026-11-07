package StrongholdProof {
    doc
    /*
     * One app, built once with current tools, and thin hosts that load it into a page the same
     * way. The names follow the code: app/, hosts/server, hosts/online, hosts/dev.
     */

    part def Page {
        doc
        /*
         * A page with Stronghold on it: a SharePoint Server page, a SharePoint Online page, a
         * Teams tab, or the dev page. Every Stronghold web part on the page mounts the same
         * app, because the first entry file to load wins (app/src/host/load-app.ts).
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

    view proofStructure : StandardViewDefinitions::GeneralView {
        expose StrongholdProof::*::**;
    }
}
