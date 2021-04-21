"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var dapCommands_1 = require("./dapCommands");
var debugger_control_1 = require("./debugger-control");
var pingv2_1 = require("./handlers/pingv2");
var messages_1 = require("./messages");
// Source: https://stackoverflow.com/a/2117523/1105235
function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
        var random = Math.random() * 16 | 0;
        var value = char === 'x' ? random : (random & 0x3 | 0x8);
        return value.toString(16);
    });
}
var Application = /** @class */ (function () {
    function Application() {
        var _a;
        var _this = this;
        this.handleCommand = function (e) {
            var _a;
            var command = e.data.command;
            var commandHandlers = (_a = {},
                _a[dapCommands_1.PAUSE] = function () { return _this.debugger.pause(); },
                _a[dapCommands_1.RESUME] = function () { return _this.debugger.resume(); },
                _a[dapCommands_1.STEP_IN] = function () { return _this.debugger.stepIn(); },
                _a[dapCommands_1.STEP_OUT] = function () { return _this.debugger.stepOut(); },
                _a[dapCommands_1.TERMINATE] = function () { return _this.debugger.terminate(); },
                _a[dapCommands_1.NEXT] = function () { return _this.debugger.next(); },
                _a[dapCommands_1.CONTINUE] = function () { return _this.debugger.continue(); },
                _a[dapCommands_1.LAUNCH] = function () { return _this.debugger.launch(); },
                _a[dapCommands_1.SET_BREAKPOINT] = function () { return _this.debugger.setBreakpoint(e.data.arguments); },
                _a[dapCommands_1.SET_IS_SKIPPED] = function () { return _this.debugger.setIsSkipped(e.data.arguments); },
                _a[dapCommands_1.INITIALIZE] = function () { return _this.debugger.initialize(e.data.arguments); },
                _a[dapCommands_1.UPDATE_MODEL] = function () { return _this.debugger.updateModel(e.data.arguments); },
                _a[dapCommands_1.EXECUTE_STEP] = function () { return _this.debugger.executeStep(e.data.arguments); },
                _a[dapCommands_1.PICK_OBJECT] = function () { return _this.debugger.pickObject(); },
                _a[dapCommands_1.CANCEL_PICK_OBJECT] = function () { return _this.debugger.cancelPickObject(); },
                _a[dapCommands_1.HIGHLIGHT_OBJECT] = function () { return _this.debugger.highlightObject(e.data.arguments); },
                _a[dapCommands_1.READ_VARIABLES] = function () { return _this.debugger.readVariables(e.data.arguments); },
                _a[dapCommands_1.SET_VARIABLE] = function () { return _this.debugger.setVariable(e.data.arguments); },
                _a);
            var commandHandler = commandHandlers[command];
            if (commandHandler) {
                commandHandler();
            }
        };
        this.messageHandlers = (_a = {},
            _a[messages_1.DEBUGGER_PING_V2] = pingv2_1.pingv2Handler,
            _a[messages_1.REQUEST] = this.handleCommand,
            _a);
    }
    Application.prototype.run = function () {
        var _this = this;
        this.uuid = generateUuid();
        this.debugger = new debugger_control_1.DebuggerControl(this.uuid);
        window.addEventListener('message', function (e) {
            if (!(e.origin.endsWith(constants_1.BZM_DOMAIN_COM) || e.origin.endsWith(constants_1.BZM_DOMAIN_NET))) {
                return;
            }
            else if (e.data && e.data.type) {
                var handler = _this.messageHandlers[e.data.type];
                if (handler) {
                    handler(e);
                }
            }
        });
    };
    return Application;
}());
exports.Application = Application;
//# sourceMappingURL=application.js.map