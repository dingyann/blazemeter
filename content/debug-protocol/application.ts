import { BZM_DOMAIN_COM, BZM_DOMAIN_NET } from './constants';
import {
    CANCEL_PICK_OBJECT,
    CONTINUE,
    EXECUTE_STEP, HIGHLIGHT_OBJECT,
    INITIALIZE,
    LAUNCH,
    NEXT,
    PAUSE,
    PICK_OBJECT, READ_VARIABLES,
    RESUME,
    SET_BREAKPOINT,
    SET_IS_SKIPPED, SET_VARIABLE,
    STEP_IN,
    STEP_OUT,
    TERMINATE,
    UPDATE_MODEL,
} from './dapCommands';
import { DebuggerControl } from './debugger-control';
import { pingv2Handler } from './handlers/pingv2';
import { DEBUGGER_PING_V2, REQUEST } from './messages';
import { DapRequest, HandlerFn } from './types';

// Source: https://stackoverflow.com/a/2117523/1105235
function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(char) {
        const random = Math.random() * 16 | 0;
        const value = char === 'x' ? random : (random & 0x3 | 0x8);
        return value.toString(16);
    });
}

export class Application {
    private uuid: string;
    private debugger: DebuggerControl;

    private handleCommand = (e: DapRequest) => {
        const command: string = e.data.command;
        const commandHandlers: { [key: string]: () => void } = {
            [PAUSE]: () => this.debugger.pause(),
            [RESUME]: () => this.debugger.resume(),
            [STEP_IN]: () => this.debugger.stepIn(),
            [STEP_OUT]: () => this.debugger.stepOut(),
            [TERMINATE]: () => this.debugger.terminate(),
            [NEXT]: () => this.debugger.next(),
            [CONTINUE]: () => this.debugger.continue(),
            [LAUNCH]: () => this.debugger.launch(),
            [SET_BREAKPOINT]: () => this.debugger.setBreakpoint(e.data.arguments),
            [SET_IS_SKIPPED]: () => this.debugger.setIsSkipped(e.data.arguments),
            [INITIALIZE]: () => this.debugger.initialize(e.data.arguments),
            [UPDATE_MODEL]: () => this.debugger.updateModel(e.data.arguments),
            [EXECUTE_STEP]: () => this.debugger.executeStep(e.data.arguments),
            [PICK_OBJECT]: () => this.debugger.pickObject(),
            [CANCEL_PICK_OBJECT]: () => this.debugger.cancelPickObject(),
            [HIGHLIGHT_OBJECT]: () => this.debugger.highlightObject(e.data.arguments),
            [READ_VARIABLES]: () => this.debugger.readVariables(e.data.arguments),
            [SET_VARIABLE]: () => this.debugger.setVariable(e.data.arguments),
        };
        const commandHandler = commandHandlers[command];
        if (commandHandler) {
            commandHandler();
        }
    };

    private messageHandlers: { [key: string]: HandlerFn } = {
        [DEBUGGER_PING_V2]: pingv2Handler,
        [REQUEST]: this.handleCommand,
    };

    public run() {
        this.uuid = generateUuid();
        this.debugger = new DebuggerControl(this.uuid);

        window.addEventListener('message', (e) => {
            if (!(e.origin.endsWith(BZM_DOMAIN_COM) || e.origin.endsWith(BZM_DOMAIN_NET))) {
                return;
            } else if (e.data && e.data.type) {
                const handler = this.messageHandlers[e.data.type];
                if (handler) {
                    handler(e);
                }
            }
        });
    }
}
