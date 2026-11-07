package StrongholdHost {
    doc
    /*
     * The life of a host's web part: idle until the page mounts it, loading the entry file,
     * then running until the page unmounts it.
     */
    private import ModelingMetadata::*;

    part def Mount {
        doc /* The page puts the web part on. */
    }

    part def Loaded {
        doc /* The entry file has run. */
    }

    part def Fault {
        doc /* The app threw. */
    }

    part def Unmount {
        doc /* The page takes the web part off. */
    }

    state def HostLifecycle {
        doc /* One web part on one page. */
        entry;
        then idle;
        state idle {
            doc /* Placed on the page, nothing loaded yet. */
        }
        state loading {
            entry action fetchEntry {
                doc /* Loads the entry file with the shared loader. */
            }
        }
        state running parallel {
            state serving;
            state watching;
        }
        transition mount first idle accept Mount then loading;
        transition first loading accept Loaded if loading.fetchEntry.done then running {
            doc /* The app is mounted once the entry file has run. */
            metadata <n2> : Issue { text = "Does the guard need the entry action at all, or is the Loaded signal enough?"; }
            metadata StatusInfo about n2 { status = StatusKind::open; }
        }
        transition first running accept Fault do action restart then idle;
        transition unmount first running accept Unmount then done;
    }

    metadata <n1> : Issue about StrongholdHost::HostLifecycle::idle { text = "Idle hosts keep no state at all; is that still true once the page remembers the last app?"; }
    metadata StatusInfo about n1 { status = StatusKind::open; }

    view hostStates : StandardViewDefinitions::StateTransitionView {
        expose StrongholdHost::HostLifecycle;
        expose StrongholdHost::HostLifecycle::idle;
        expose StrongholdHost::HostLifecycle::loading;
        expose StrongholdHost::HostLifecycle::loading::fetchEntry;
        expose StrongholdHost::HostLifecycle::running;
        expose StrongholdHost::HostLifecycle::running::serving;
        expose StrongholdHost::HostLifecycle::running::watching;
    }
}
