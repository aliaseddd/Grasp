package LoginFlow {
    doc
    /*
     * A user logs in: the client asks the server, the server asks the auth service, and the
     * answer comes back.
     */
    private import ModelingMetadata::*;

    part def Client {
        doc /* The browser. */
    }

    part def Server;

    part def Auth;

    part def Login {
        doc /* The interaction: the context the lifelines and the messages belong to. */
        part client : Client {
            event occurrence loginSent;
            then event occurrence loginDone {
                doc /* The client is in. */
            }
        }
        part server : Server;
        part auth : Auth;
        message login from client.loginSent to server;
        message checkCredentials from server to auth;
        message credentialsOk from auth to server;
        message loggedIn from server to client.loginDone {
            doc /* The server tells the client it is in. */
        }
    }

    metadata <n1> : Issue about LoginFlow::Login::login { text = "Should the login carry the user name as its payload?"; }
    metadata StatusInfo about n1 { status = StatusKind::open; }

    view loginSequence : StandardViewDefinitions::SequenceView {
        expose LoginFlow::Login::client;
        expose LoginFlow::Login::client::loginSent;
        expose LoginFlow::Login::client::loginDone;
        expose LoginFlow::Login::server;
        expose LoginFlow::Login::auth;
    }

    view loginStructure : StandardViewDefinitions::GeneralView {
        expose LoginFlow::*::**;
    }
}
