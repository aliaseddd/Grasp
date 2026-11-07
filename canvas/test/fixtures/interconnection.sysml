package FuelSystem {
    doc
    /*
     * A pump draws fuel from a tank and delivers it at the system's outlet, on the
     * controller's command.
     */

    item def Fuel {
        doc /* What the pump moves. */
    }

    item def Signal {
        doc /* A command to the pump. */
    }

    port def FuelPort {
        doc /* Fuel out, unused fuel back. */
        out item supply : Fuel;
        in item back : Fuel;
    }

    port def CtrlPort {
        doc /* Where a pump takes commands. */
        in item cmd : Signal;
    }

    interface def FuelLine {
        doc /* From a FuelPort to its conjugate. */
        end port a : FuelPort;
        end port b : ~FuelPort;
    }

    interface def CtrlLink {
        doc /* From a controller to a pump. */
        end port c : ~CtrlPort;
        end port p : CtrlPort;
    }

    part def Pump {
        doc /* Moves fuel while commanded. */
    }

    part def Tank {
        doc /* Holds the fuel. */
        item stored : Fuel [0..*];
    }

    part def Controller {
        doc /* Commands the pump. */
    }

    part def System {
        doc /* A tank, a pump, and the controller that drives it. */
        port outlet : FuelPort {
            doc /* Where the system delivers its fuel. */
        }
        part controller : Controller [1] {
            port ctrl : ~CtrlPort;
        }
        part tank : Tank [1] {
            port fuelOut : FuelPort;
        }
        part pump : Pump [1] {
            port fuelIn : ~FuelPort;
            port fuelOut : FuelPort;
            port ctrl : CtrlPort;
        }
        interface fuelLine : FuelLine connect tank.fuelOut to pump.fuelIn {
            doc /* The line from the tank to the pump. */
        }
        flow command of Signal from controller.ctrl.cmd to pump.ctrl.cmd;
        bind pump.fuelOut = outlet {
            doc /* The pump's outlet is the system's. */
        }
        connection sensing connect controller to tank {
            doc /* The controller reads the tank's level. */
        }
    }

    view fuelSystem : StandardViewDefinitions::InterconnectionView {
        doc
        /*
         * The whole system: its definitions, and the parts of System with the lines between
         * their ports.
         */
        expose FuelSystem::*::**;
    }

    view definitions : StandardViewDefinitions::GeneralView {
        expose FuelSystem::Fuel;
        expose FuelSystem::Signal;
        expose FuelSystem::FuelPort;
        expose FuelSystem::FuelPort::supply;
        expose FuelSystem::FuelPort::back;
        expose FuelSystem::CtrlPort;
        expose FuelSystem::CtrlPort::cmd;
        expose FuelSystem::FuelLine;
        expose FuelSystem::FuelLine::a;
        expose FuelSystem::FuelLine::b;
        expose FuelSystem::CtrlLink;
        expose FuelSystem::CtrlLink::c;
        expose FuelSystem::CtrlLink::p;
        expose FuelSystem::Pump;
        expose FuelSystem::Tank;
        expose FuelSystem::Tank::stored;
        expose FuelSystem::Controller;
    }
}
