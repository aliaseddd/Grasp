package StrongholdRelease {
    doc
    /*
     * How a release of Stronghold is built: compile, then test and lint side by side, then
     * publish, warn or fix, then wait for the maintainer's approval.
     */
    private import ModelingMetadata::*;

    part def Warning {
        doc /* What a release sends its maintainer when the lint has something to say. */
    }

    part def Approval {
        doc /* What the maintainer sends back to let the release out. */
    }

    action def Release {
        doc /* One release, from the sources to the published bundle. */
        in item source;
        out item bundle;
        action compile {
            doc /* webpack 5 and TypeScript 5.9. */
        }
        action test {
            out item passed;
        }
        action lint {
            out item warnings;
        }
        action publish;
        action notify send new Warning() to maintainer;
        action fix;
        action approve accept approval : Approval;
        fork split;
        join rejoin;
        decide verdict {
            doc /* Reads what the tests and the lint found. */
        }
        if test.passed then publish;
        if lint.warnings then notify;
        else fix;
        merge collect;
        first start then compile;
        succession compiled first compile then split {
            doc /* Tests and lint run side by side once the bundle exists. */
        }
        first split then test;
        first split then lint;
        first test then rejoin;
        first lint then rejoin;
        first rejoin then verdict;
        first publish then collect;
        first notify then collect;
        first fix then collect;
        first collect then approve;
        first approve then done;
    }

    part maintainer [1] {
        doc /* Whoever cuts the release. */
    }

    metadata <n1> : Issue about StrongholdRelease::Release::compiled { text = "Should lint run before the tests instead, so a warning never waits on a slow test?"; }
    metadata StatusInfo about n1 { status = StatusKind::open; }

    metadata <n2> : Issue about StrongholdRelease::Release::verdict { text = "The verdict reads test.passed and lint.warnings; both are items until the item defs are in."; }
    metadata StatusInfo about n2 { status = StatusKind::open; }

    view releaseFlow : StandardViewDefinitions::ActionFlowView {
        expose StrongholdRelease::Release;
        expose StrongholdRelease::Release::source;
        expose StrongholdRelease::Release::bundle;
        expose StrongholdRelease::Release::compile;
        expose StrongholdRelease::Release::test;
        expose StrongholdRelease::Release::test::passed;
        expose StrongholdRelease::Release::lint;
        expose StrongholdRelease::Release::lint::warnings;
        expose StrongholdRelease::Release::publish;
        expose StrongholdRelease::Release::notify;
        expose StrongholdRelease::Release::fix;
        expose StrongholdRelease::Release::approve;
        expose StrongholdRelease::Release::split;
        expose StrongholdRelease::Release::rejoin;
        expose StrongholdRelease::Release::verdict;
        expose StrongholdRelease::Release::collect;
    }
}
