// The Stronghold proof as a SysML v2 model: "How it fits together" in the Stronghold repository's
// docs/PROOF.md, as structure.
// stronghold-proof.svg draws the view at the end of the package. README.md in this folder says how
// the model was checked.

package StrongholdProof {
    doc
    /*
     * One app, built once with current tools, and thin hosts that load it into a page the
     * same way. The names follow the code: app/, hosts/server, hosts/online, hosts/dev.
     */

    private import ScalarValues::String;
    private import HostFiles::*;

    part def Page {
        doc
        /*
         * A page with Stronghold on it: a SharePoint Server page, a SharePoint Online page, a
         * Teams tab, or the dev page. Every Stronghold web part on the page mounts the same
         * app, because the first entry file to load wins (app/src/host/load-app.ts).
         */
        part hosts : Host[1..*];
        part app : App[1];

        interface mount connect [1..*] hosts.api to [1] app.api;
    }

    part def App {
        doc
        /*
         * app/: Stronghold itself, built once with webpack 5 and TypeScript 5.9. Nothing in it
         * knows about SharePoint.
         */
        port api : StrongholdApp;
        part shell : Shell;
    }

    part def Shell {
        doc
        /*
         * app/src/shell: draws inside a shadow root, with the design's tokens and the Inter
         * font, then opens the first module in its registry.
         */
        part hello : Module {
            doc /* app/src/modules/hello: draws "Hello world!". The only module so far. */
        }
    }

    part def Module {
        doc
        /*
         * One import() per module, so each module is its own file, fetched the first time it
         * opens. BOLOs and Logbooks will be modules.
         */
    }

    abstract part def Host {
        doc
        /*
         * hosts/: the small piece of code that plugs the app into one place. It works out
         * where its package's files are, loads the entry file with the shared loader, and
         * calls mount. It has no settings: it only ever loads the app from its own package.
         */
        attribute toolchain : String;
        attribute ships : String[0..1];
        port api : ~StrongholdApp;
        part loader : Loader;
    }

    part def ServerHost :> Host {
        doc /* hosts/server: the web part for SharePoint Server. */
        attribute :>> toolchain = "SPFx 1.4.1, TypeScript 2.4, Node 8";
        attribute :>> ships = "stronghold-server.sppkg";
    }

    part def OnlineHost :> Host {
        doc /* hosts/online: the web part for SharePoint Online, which is also the Teams tab. */
        attribute :>> toolchain = "SPFx 1.24.1, Heft, Node 22.14+";
        attribute :>> ships = "stronghold-online.sppkg";
    }

    part def DevHost :> Host {
        doc
        /*
         * hosts/dev: a plain page that mounts the app the way the SharePoint hosts do. It
         * never ships.
         */
        attribute :>> toolchain = "tsc, Playwright";
        attribute :>> ships[0];
    }

    package HostFiles {
        doc
        /*
         * app/src/host: the only code every host's toolchain compiles, written for
         * TypeScript 2.4. Each host copies it in with prepare-shared.js.
         */

        private import ScalarValues::String;

        port def StrongholdApp {
            doc /* What the app's entry file registers on window.Stronghold. */
            in item container : HTMLElement;
            in attribute services : HostServices;
            out attribute handle : AppHandle;
            out attribute version : String;
        }

        attribute def HostServices {
            doc
            /*
             * What a host gives the app. Empty until proof step 4 adds the signed-in person
             * and SharePoint's REST API.
             */
        }

        attribute def AppHandle {
            doc /* What mount hands back. Its unmount() takes the app off the page. */
        }

        item def HTMLElement {
            doc /* The web part's own element, which the app draws into. */
        }

        part def Loader {
            doc
            /*
             * load-app.ts: adds one <script> for the entry file, then waits for
             * window.Stronghold.
             */
        }
    }

    view proofStructure : StandardViewDefinitions::GeneralView {
        doc /* The structure of the proof, as stronghold-proof.svg draws it. */
        expose StrongholdProof::*::**;
    }
}
