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

    metadata <n1> : Issue about StrongholdProof::Host { text = "Does a host need to know its own package, or only where its files are?"; }
    metadata StatusInfo about n1 { status = StatusKind::open; }

    metadata <n2> : Issue about StrongholdProof::Page::mount { text = "Should mount be an interface, with what the app registers as its items?"; }
    metadata StatusInfo about n2 { status = StatusKind::open; }

    view proofStructure : StandardViewDefinitions::GeneralView {
        expose StrongholdProof::*::**;
    }

    view elementTable : StandardViewDefinitions::GridView {
        doc
        /*
         * Every element of the proof as a row: what it is, what defines it, where it sits, and
         * what it says.
         */
        expose StrongholdProof::*::**;
        render Views::asElementTable;
    }

    view definitionMatrix : StandardViewDefinitions::GridView {
        doc /* The definitions against each other: which specializes which. */
        expose StrongholdProof::Page;
        expose StrongholdProof::Host;
        expose StrongholdProof::App;
        expose StrongholdProof::StrongholdApp;
        expose StrongholdProof::ServerHost;
        expose StrongholdProof::OnlineHost;
        expose StrongholdProof::DevHost;
    }
}
