"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var debugger_port_1 = require("./debugger-port");
var DebuggerControl = /** @class */ (function () {
    function DebuggerControl(id) {
        this.port = new debugger_port_1.DebuggerPort("dbg-" + id);
        // Passthrough events to the application
        this.port.listen(function (x) { return window.postMessage(x, location.origin); });
    }
    DebuggerControl.prototype.initialize = function (args) {
        var scenario = args.scenario;
        scenario.steps = scenario.scenarioSteps;
        delete scenario.scenarioSteps;
        this.port.send({ type: 'request', command: 'initialize', arguments: __assign(__assign({}, args), { scenario: scenario }) });
    };
    DebuggerControl.prototype.updateModel = function (args) {
        var scenario = args.scenario;
        scenario.steps = scenario.scenarioSteps;
        delete scenario.scenarioSteps;
        this.port.send({ type: 'request', command: 'updateModel', arguments: __assign(__assign({}, args), { scenario: scenario }) });
    };
    DebuggerControl.prototype.pause = function () {
        this.port.send({ type: 'request', command: 'pause' });
    };
    DebuggerControl.prototype.resume = function () {
        this.port.send({ type: 'request', command: 'resume' });
    };
    DebuggerControl.prototype.terminate = function () {
        this.port.send({ type: 'request', command: 'terminate' });
    };
    DebuggerControl.prototype.stepIn = function () {
        this.port.send({ type: 'request', command: 'stepIn' });
    };
    DebuggerControl.prototype.stepOut = function () {
        this.port.send({ type: 'request', command: 'stepOut' });
    };
    DebuggerControl.prototype.launch = function () {
        this.port.send({ type: 'request', command: 'launch' });
    };
    DebuggerControl.prototype.next = function () {
        this.port.send({ type: 'request', command: 'next' });
    };
    DebuggerControl.prototype.continue = function () {
        this.port.send({ type: 'request', command: 'continue' });
    };
    DebuggerControl.prototype.setBreakpoint = function (args) {
        this.port.send({ type: 'request', command: 'setBreakpoint', arguments: __assign({}, args) });
    };
    DebuggerControl.prototype.setIsSkipped = function (args) {
        this.port.send({ type: 'request', command: 'setIsSkipped', arguments: __assign({}, args) });
    };
    DebuggerControl.prototype.executeStep = function (args) {
        this.port.send({ type: 'request', command: 'executeStep', arguments: __assign({}, args) });
    };
    DebuggerControl.prototype.pickObject = function () {
        this.port.send({ type: 'request', command: 'pickObject' });
    };
    DebuggerControl.prototype.cancelPickObject = function () {
        this.port.send({ type: 'request', command: 'cancelPickObject' });
    };
    DebuggerControl.prototype.highlightObject = function (args) {
        this.port.send({ type: 'request', command: 'highlightObject', arguments: __assign({}, args) });
    };
    DebuggerControl.prototype.readVariables = function (args) {
        this.port.send({ type: 'request', command: 'readVariables', arguments: __assign({}, args) });
    };
    DebuggerControl.prototype.setVariable = function (args) {
        this.port.send({ type: 'request', command: 'setVariable', arguments: __assign({}, args) });
    };
    return DebuggerControl;
}());
exports.DebuggerControl = DebuggerControl;
//# sourceMappingURL=debugger-control.js.map