package RoomPlan {
    doc
    /*
     * A room with a desk, a cabinet and a pillar: its plan drawn to scale in a geometry view,
     * its structure in a general view.
     */
    private import MeasurementReferences::*;
    private import ModelingMetadata::*;
    private import SI::*;
    private import ShapeItems::*;
    private import SpatialItems::*;

    part def Room {
        doc /* A room; its frame's origin is the south-west floor corner, x east, y north, z up. */
    }

    part def Desk;

    part def Cabinet;

    part def Pillar;

    part room : Room [1] : SpatialItem {
        doc /* The room is 8 by 6 metres and 3 metres high. */
        item :>> shape : Box {
            :>> length = 8 [m];
            :>> width = 6 [m];
            :>> height = 3 [m];
        }
        attribute :>> coordinateFrame {
            :>> transformation : TranslationRotationSequence {
                :>> elements = (new Translation((0 [m], 0 [m], 0 [m])));
            }
        }
        part desk : Desk : SpatialItem :> subSpatialParts {
            item :>> shape : Box {
                :>> length = 2 [m];
                :>> width = 1 [m];
                :>> height = 0.75 [m];
            }
            attribute :>> coordinateFrame {
                :>> transformation : TranslationRotationSequence {
                    :>> elements = (new Translation((2 [m], 1.5 [m], 0 [m])));
                }
            }
        }
        part cabinet : Cabinet : SpatialItem :> subSpatialParts {
            item :>> shape : Box {
                :>> length = 1 [m];
                :>> width = 0.5 [m];
                :>> height = 2 [m];
            }
            attribute :>> coordinateFrame {
                :>> transformation : TranslationRotationSequence {
                    :>> elements = (new Translation((6.5 [m], 0.5 [m], 0 [m])));
                }
            }
        }
        part pillar : Pillar : SpatialItem :> subSpatialParts {
            item :>> shape : CircularCylinder {
                :>> radius = 0.25 [m];
                :>> height = 3 [m];
            }
            attribute :>> coordinateFrame {
                :>> transformation : TranslationRotationSequence {
                    :>> elements = (new Translation((5 [m], 4 [m], 0 [m])));
                }
            }
        }
    }

    metadata <n1> : Issue about RoomPlan::room::desk { text = "Is 2 m long enough for two screens side by side?"; }
    metadata StatusInfo about n1 { status = StatusKind::open; }

    view plan : StandardViewDefinitions::GeometryView {
        doc /* The room seen from above, in metres. */
        expose RoomPlan::room;
        expose RoomPlan::room::desk;
        expose RoomPlan::room::cabinet;
        expose RoomPlan::room::pillar;
    }

    view structure : StandardViewDefinitions::GeneralView {
        expose RoomPlan::*::**;
    }
}
