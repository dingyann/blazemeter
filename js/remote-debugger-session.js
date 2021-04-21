"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
var utils_1 = require("../common/utils");
var playback_api_1 = require("../sideex/playback/playback-api");
var backgroundRecorder = getRecorder({});
var RemoteDebuggerSession = /** @class */ (function () {
    function RemoteDebuggerSession(port) {
        var _this = this;
        this.port = port;
        this.variables = {};
        this.messageListener = function (request) {
            if (request.selectTarget) {
                _this.objectPicked(request);
                return;
            }
            if (request.cancelSelectTarget) {
                // When received request to cancel object picking
                // - Send broadcast to all tabs
                // - Inform outer systems about the cancellation
                utils_1.forAllTabs(function (tab) { return webextension_polyfill_ts_1.browser.tabs.sendMessage(tab.id, { selectMode: true, selecting: false }); });
                _this.port.postMessage({
                    type: 'event',
                    event: 'pickerCancel',
                });
                return;
            }
            if (!request.command || !_this.replayingWindow) {
                return;
            }
            switch (request.command) {
                case 'changeWindowSize':
                    var _a = request.value, width = _a[0], height = _a[1];
                    _this.resizeWindow(_this.replayingWindow, width, height);
                    break;
                case 'maximizeWindow':
                    _this.maximizeWindow(_this.replayingWindow);
                    break;
            }
        };
        port.onMessage.addListener(function (msg) { return _this.listener(msg); });
        port.onDisconnect.addListener(function () { return webextension_polyfill_ts_1.browser.runtime.onMessage.removeListener(_this.messageListener); });
        this.extCommand = new ExtCommand();
        this.playback = new playback_api_1.PlaybackApi(this.extCommand, {
            updateCommandStatus: this.updateCommandStatus.bind(this),
            updateStatus: this.updateStatus.bind(this),
            successFullReplay: this.successFullReplay.bind(this),
            failedReplay: this.failedReplay.bind(this),
            switchOnReplayStatus: this.switchOnReplayStatus.bind(this),
        });
        webextension_polyfill_ts_1.browser.runtime.onMessage.addListener(this.messageListener);
    }
    RemoteDebuggerSession.prototype.startReplay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var replayWindowId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        backgroundRecorder.replayStatus = 'replaying';
                        return [4 /*yield*/, this.initReplayWindow()];
                    case 1:
                        replayWindowId = _a.sent();
                        webextension_polyfill_ts_1.browser.tabs.onActivated.addListener(this.tabsOnActivatedHandler);
                        return [4 /*yield*/, this.extCommand.init()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.attachPrompt(replayWindowId)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.switchToWindow(replayWindowId)];
                    case 4:
                        _a.sent();
                        this.replayingWindow = replayWindowId;
                        return [4 /*yield*/, this.playback.playSuite(undefined, 0)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RemoteDebuggerSession.prototype.stopReplay = function () {
        backgroundRecorder.replayStatus = 'stopped';
        this.playback.stop();
        // Remove pending status commands
        this.playback.replayStatus = 'stop';
        this.detachPromptAllTabs();
        webextension_polyfill_ts_1.browser.tabs.onActivated.removeListener(this.tabsOnActivatedHandler);
        this.closeReplayWindow();
        this.switchOnReplayStatus('stopped');
    };
    RemoteDebuggerSession.prototype.attachPrompt = function (windowId) {
        return __awaiter(this, void 0, void 0, function () {
            var tabs, firstTab;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, webextension_polyfill_ts_1.browser.tabs.query({ windowId: windowId, active: true })];
                    case 1:
                        tabs = _a.sent();
                        firstTab = tabs[0];
                        return [4 /*yield*/, webextension_polyfill_ts_1.browser.tabs.sendMessage(firstTab.id, { command: 'attachPrompt' })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RemoteDebuggerSession.prototype.detachPromptAllTabs = function () {
        webextension_polyfill_ts_1.browser.tabs.query({}).then(function (tabs) {
            for (var _i = 0, tabs_1 = tabs; _i < tabs_1.length; _i++) {
                var tab = tabs_1[_i];
                webextension_polyfill_ts_1.browser.tabs.sendMessage(tab.id, { command: 'detachPrompt' });
            }
        });
    };
    RemoteDebuggerSession.prototype.switchToWindow = function (windowId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, webextension_polyfill_ts_1.browser.windows.update(windowId, { focused: true })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RemoteDebuggerSession.prototype.resizeWindow = function (windowId, width, height) {
        var updatedOptions = {
            state: 'normal',
            left: 0,
            top: 0,
            width: width,
            height: height,
        };
        return webextension_polyfill_ts_1.browser.windows.update(windowId, updatedOptions);
    };
    RemoteDebuggerSession.prototype.maximizeWindow = function (windowId) {
        var isMac = window.navigator.platform.search('Mac') === 0;
        var options = isMac
            ? { width: screen.availWidth, height: screen.availHeight }
            : { state: 'maximized' };
        return webextension_polyfill_ts_1.browser.windows.update(windowId, options);
    };
    RemoteDebuggerSession.prototype.initReplayWindow = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newWindowParams, window;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newWindowParams = {
                            top: 0,
                            left: 0,
                            state: 'normal',
                        };
                        return [4 /*yield*/, webextension_polyfill_ts_1.browser.windows.create(newWindowParams)];
                    case 1:
                        window = _a.sent();
                        this.extCommand.setContentWindowId(window.id);
                        webextension_polyfill_ts_1.browser.windows.onRemoved.addListener(function (windowId) {
                            if (windowId === window.id && _this.playback.replayStatus !== 'stop') {
                                _this.stopReplay();
                            }
                        });
                        return [2 /*return*/, window.id];
                }
            });
        });
    };
    RemoteDebuggerSession.prototype.closeReplayWindow = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.replayingWindow) return [3 /*break*/, 2];
                        return [4 /*yield*/, webextension_polyfill_ts_1.browser.windows.remove(this.replayingWindow)];
                    case 1:
                        _a.sent();
                        this.replayingWindow = undefined;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    RemoteDebuggerSession.prototype.listener = function (msg) {
        if (msg.type !== 'request') {
            return;
        }
        switch (msg.command) {
            case 'initialize':
                this.playback.setModel(msg.arguments.scenario);
                this.variables = msg.arguments.variables;
                this.playback.breakPoints = [];
                this.playback.skippedSteps = [];
                break;
            case 'updateModel':
                this.playback.setModel(msg.arguments.scenario);
                break;
            case 'terminate':
                this.stopReplay();
                break;
            case 'pause':
                this.playback.pause();
                break;
            case 'resume':
                this.playback.resume();
                break;
            case 'stepIn':
                if (this.shouldInitTest()) {
                    this.initTest();
                }
                else {
                    this.playback.stepIn();
                }
                break;
            case 'stepOut':
                if (this.shouldInitTest()) {
                    this.initTest();
                }
                else {
                    this.playback.stepOut();
                }
                break;
            case 'launch':
                if (this.playback.replayStatus === 'pause' || this.playback.replayStatus === 'breakpoint') {
                    this.playback.resume();
                }
                else {
                    declaredVars = this.variables;
                    this.startReplay();
                }
                break;
            case 'next':
                if (this.shouldInitTest()) {
                    this.initTest();
                }
                else {
                    this.playback.next();
                }
                break;
            case 'continue':
                this.playback.resume();
                break;
            case 'setIsSkipped':
                if (!!msg.arguments.value) {
                    this.playback.skippedSteps.push(msg.arguments.compositeId);
                }
                else {
                    this.playback.skippedSteps = this.playback.skippedSteps.filter(function (x) { return JSON.stringify(x) !== JSON.stringify(msg.arguments.compositeId); });
                }
                break;
            case 'setBreakpoint':
                if (!!msg.arguments.value) {
                    this.playback.breakPoints.push(msg.arguments.compositeId);
                }
                else {
                    this.playback.breakPoints = this.playback.breakPoints.filter(function (x) { return JSON.stringify(x) !== JSON.stringify(msg.arguments.compositeId); });
                }
                break;
            case 'executeStep':
                this.playback.playSingleCommand(msg.arguments.compositeId);
                break;
            case 'pickObject':
                utils_1.forAllTabs(function (tab) { return webextension_polyfill_ts_1.browser.tabs.sendMessage(tab.id, { selectMode: true, selecting: true }); });
                break;
            case 'cancelPickObject':
                utils_1.forAllTabs(function (tab) { return webextension_polyfill_ts_1.browser.tabs.sendMessage(tab.id, { selectMode: true, selecting: false }); });
                break;
            case 'highlightObject':
                utils_1.forAllTabs(function (tab) { return webextension_polyfill_ts_1.browser.tabs.sendMessage(tab.id, msg); });
                break;
            case 'readVariables':
                var result = [];
                for (var _i = 0, _a = msg.arguments.variables; _i < _a.length; _i++) {
                    var variable = _a[_i];
                    var variableName = variable.substring(2, variable.length - 1);
                    if (variableName) {
                        result.push({ name: variableName, value: this.variables[variableName] });
                    }
                }
                this.variablesRead(result);
                break;
            case 'setVariable':
                this.variables[msg.arguments.variable.name] = msg.arguments.variable.value;
                break;
            default: console.log('Wat?', msg.command);
        }
    };
    RemoteDebuggerSession.prototype.successFullReplay = function () {
        this.port.postMessage({
            type: 'event',
            event: 'exited',
            body: {
                exitCode: 0,
            },
        });
        this.playback.replayStatus = 'stop';
        this.closeReplayWindow();
    };
    RemoteDebuggerSession.prototype.failedReplay = function (reason) {
        this.port.postMessage({
            type: 'event',
            event: 'exited',
            body: {
                exitCode: 1,
                reason: reason,
            },
        });
        this.playback.replayStatus = 'stop';
        this.closeReplayWindow();
    };
    RemoteDebuggerSession.prototype.updateCommandStatus = function (data) {
        this.port.postMessage({
            type: 'event',
            event: 'status',
            body: {
                identifier: data.identifier,
                status: data.status,
                error: data.reason,
                nextStepId: data.nextStepId,
                successLocator: data.successLocator,
            },
        });
    };
    RemoteDebuggerSession.prototype.updateStatus = function (status) {
        this.port.postMessage({
            event: 'updateStatus',
            status: status,
        });
    };
    RemoteDebuggerSession.prototype.switchOnReplayStatus = function (status) {
        this.port.postMessage({
            type: 'event',
            event: 'playbackStatus',
            body: {
                status: status,
            },
        });
    };
    RemoteDebuggerSession.prototype.objectPicked = function (request) {
        this.port.postMessage({
            type: 'event',
            event: 'objectPicked',
            body: request,
        });
        utils_1.forAllTabs(function (tab) { return webextension_polyfill_ts_1.browser.tabs.sendMessage(tab.id, { selectMode: true, selecting: false }); });
    };
    RemoteDebuggerSession.prototype.variablesRead = function (request) {
        this.port.postMessage({
            type: 'event',
            event: 'variablesRead',
            body: request,
        });
    };
    RemoteDebuggerSession.prototype.tabsOnActivatedHandler = function (activeInfo) {
        webextension_polyfill_ts_1.browser.tabs.sendMessage(activeInfo.tabId, {
            command: 'attachPrompt',
        });
    };
    RemoteDebuggerSession.prototype.shouldInitTest = function () {
        return !this.playback.frames.length && this.playback.replayStatus === 'stop';
    };
    RemoteDebuggerSession.prototype.initTest = function () {
        var _this = this;
        webextension_polyfill_ts_1.browser.tabs.onActivated.addListener(this.tabsOnActivatedHandler);
        this.initReplayWindow().then(function (windowId) {
            _this.attachPrompt(windowId);
            _this.switchToWindow(windowId);
            _this.replayingWindow = windowId;
            _this.playback.initSuite();
        });
    };
    return RemoteDebuggerSession;
}());
exports.RemoteDebuggerSession = RemoteDebuggerSession;
//# sourceMappingURL=remote-debugger-session.js.map