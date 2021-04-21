"use strict";
/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var array_utils_1 = require("../../common/array-utils");
var string_utils_1 = require("../../common/string-utils");
var utils_1 = require("../../common/utils");
var bg_command_mapper_1 = require("../background/bg-command-mapper");
require("../global");
function newReturnStatement() {
    return { action: 'ret', id: 'deadbeef-dead-beef-dead-beefdead' };
}
var PlaybackApi = /** @class */ (function () {
    function PlaybackApi(extCommand, callbacks) {
        this.skippedSteps = [];
        this.breakPoints = [];
        this.replayStatus = 'stop';
        this.frames = [];
        this.commandIndex = -1;
        this.caseFailed = false;
        this.suite = null;
        this.skipNextBreakpoint = false;
        this.replayDelay = 500;
        this.virtualBreakpoints = [];
        this.mapper = new bg_command_mapper_1.CommandMapper();
        this.extCommand = extCommand;
        this.callbacks = callbacks;
    }
    PlaybackApi.prototype.setModel = function (model) {
        if (this.frames.length > 0) {
            // Here we need to rebuild our frames.
            // Idea is that we need to track how cursor would be moved
            // There are several cases for this:
            // 1. We deleted item that doesn't break the path of current step
            // In this case we can reuse the logic of shifting cursor that's used in execute step.
            // It will simply rebuild the frames and calculate returns properly.
            // 2. We deleted item that breaks the path of current step
            // For example, we deleted the step itself, or any block (group or control block) that contained it.
            // In this case we need to shift the cursor on the next step right after deleted one.
            // In case if next step right after deleted one is the return statement (ret action), then we need to
            // advance the cursor forward until we meet normal action or start of the block. (Should we?)
            // The logic here should be that we need to start rebuilding frames from new suite, but using old
            // cursor position.
            // If there's an iteration where we miss part of path - that's basically the level on which container
            // of the item or the item itself no longer exist, so we should advance the return index and place
            // the cursor there.
            var _a = this.rebuildFrames(model, this.nextStepId), partial = _a.partial, commandIndex = _a.commandIndex, frames_1 = _a.frames;
            // Partial means that rebuildFrames method was not able to fully restore frames
            if (partial) {
                // In this case we need to grab lastIndex from the previous frames state
                if (this.frames.length !== frames_1.length) {
                    this.commandIndex = this.frames[frames_1.length].lastIndex - 1;
                }
            }
            else {
                this.commandIndex = commandIndex - 1;
            }
            this.frames = frames_1;
            var nextStepId = this.findAndSaveNextStepId();
            this.callbacks.updateCommandStatus({ status: 'pending', nextStepId: nextStepId });
        }
        this.suite = model;
    };
    PlaybackApi.prototype.next = function () {
        return __awaiter(this, void 0, void 0, function () {
            var next, prevFrame, lastCommand;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.replayStatus !== 'pause' && this.replayStatus !== 'breakpoint') {
                            return [2 /*return*/];
                        }
                        this.skipNextBreakpoint = true;
                        next = this.lastFrame.steps[this.commandIndex + 2];
                        if (!next) {
                            prevFrame = this.frames[this.frames.length - 2];
                            if (prevFrame) {
                                lastCommand = prevFrame.steps[this.lastFrame.lastIndex + 1];
                                if (lastCommand) {
                                    this.virtualBreakpoints.push(__spreadArrays(this.frames
                                        .map(function (x) { return x.id; })
                                        .filter(function (x) { return x; })
                                        .slice(0, -1), [
                                        lastCommand.id,
                                    ]));
                                }
                            }
                        }
                        else {
                            this.virtualBreakpoints.push(this.getId(next));
                        }
                        return [4 /*yield*/, this.resume()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PlaybackApi.prototype.stepIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var current;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.replayStatus !== 'pause' && this.replayStatus !== 'breakpoint') {
                            return [2 /*return*/];
                        }
                        this.skipNextBreakpoint = true;
                        current = this.lastFrame.steps[this.commandIndex + 1];
                        if (!current.steps) return [3 /*break*/, 2];
                        this.virtualBreakpoints.push(__spreadArrays(this.frames.map(function (x) { return x.id; }).filter(function (x) { return x; }), [
                            current.id,
                            current.steps[0].id,
                        ]));
                        return [4 /*yield*/, this.resume()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.next()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PlaybackApi.prototype.stepOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lastStep;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.replayStatus !== 'pause' && this.replayStatus !== 'breakpoint') {
                            return [2 /*return*/];
                        }
                        this.skipNextBreakpoint = true;
                        if (!(this.commandIndex === this.lastFrame.steps.length)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.next()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        lastStep = this.lastFrame.steps[this.lastFrame.steps.length - 1];
                        this.virtualBreakpoints.push(__spreadArrays(this.frames.map(function (x) { return x.id; }).filter(function (x) { return x; }), [lastStep.id]));
                        return [4 /*yield*/, this.resume()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PlaybackApi.prototype.stop = function () {
        this.replayStatus = 'stop';
        this.finalizePlayingProgress();
    };
    PlaybackApi.prototype.pause = function () {
        if (this.replayStatus === 'play') {
            this.replayStatus = 'pause';
        }
    };
    PlaybackApi.prototype.resume = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.replayStatus !== 'pause' && this.replayStatus !== 'breakpoint') {
                            return [2 /*return*/];
                        }
                        if (this.replayStatus === 'breakpoint') {
                            this.skipNextBreakpoint = true;
                        }
                        this.replayStatus = 'play';
                        this.callbacks.switchOnReplayStatus('playing');
                        this.extCommand.attach();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.executionLoop()];
                    case 2:
                        _a.sent();
                        this.finalizePlayingProgress();
                        return [3 /*break*/, 4];
                    case 3:
                        ex_1 = _a.sent();
                        this.catchPlayingError(ex_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PlaybackApi.prototype.playSuite = function (suite, i) {
        return __awaiter(this, void 0, void 0, function () {
            var reason_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.callbacks.switchOnReplayStatus('playing');
                        this.frames.push(this.suite);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.initializePlayingProgress()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.executionLoop()];
                    case 3:
                        _a.sent();
                        this.finalizePlayingProgress();
                        return [3 /*break*/, 5];
                    case 4:
                        reason_1 = _a.sent();
                        this.catchPlayingError(reason_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PlaybackApi.prototype.initSuite = function () {
        return __awaiter(this, void 0, void 0, function () {
            var reason_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.frames.push(this.suite);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.initializePlayingProgress()];
                    case 2:
                        _a.sent();
                        this.virtualBreakpoints.push(this.getFirstStepId());
                        return [4 /*yield*/, this.executionLoop()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        reason_2 = _a.sent();
                        console.log('reason: ', reason_2);
                        this.catchPlayingError(reason_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PlaybackApi.prototype.playSingleCommand = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, commandIndex, frames, step, mappedCommand, command, target, value, timeout, targets, overallResult, i, t, result, i, t, result, successLocator, nextStepId;
            var _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.initializePlayingProgress()];
                    case 1:
                        _c.sent();
                        _a = this.rebuildFrames(this.suite, id), commandIndex = _a.commandIndex, frames = _a.frames;
                        this.frames = frames;
                        this.commandIndex = commandIndex;
                        step = this.findStepByPath(this.suite, id);
                        if (!step) {
                            this.callbacks.updateCommandStatus({ identifier: id, status: 'fail', reason: 'Step was not found' });
                            return [2 /*return*/];
                        }
                        mappedCommand = this.mapper.map(step);
                        command = mappedCommand.command, target = mappedCommand.target, value = mappedCommand.value;
                        timeout = 10000;
                        if (command === 'waitFor') {
                            _b = value.split(':', 2), value = _b[0], timeout = _b[1];
                            timeout = timeout || 10000;
                        }
                        this.callbacks.updateCommandStatus({ identifier: id, status: 'pending' });
                        this.callbacks.switchOnReplayStatus('playing');
                        value = expandVariables(value);
                        target = expandVariables(target);
                        if (!ExtCommand.isExtCommand(command)) return [3 /*break*/, 2];
                        console.log("Executing: | " + command + " | " + target + " | " + value + " |");
                        // @ts-ignore
                        this.extCommand['do' + string_utils_1.titleCase(command)](target, value).then(function () {
                            _this.callbacks.updateCommandStatus({ identifier: id, status: 'success' });
                        }, function (reason) {
                            // Ext command failed?
                            var errorMessage = typeof reason === 'string' ? reason : reason.message;
                            console.error('Command failed. Reason:', errorMessage);
                            _this.callbacks.updateCommandStatus({ identifier: id, status: 'fail', reason: errorMessage });
                        });
                        this.callbacks.switchOnReplayStatus('paused');
                        return [3 /*break*/, 12];
                    case 2:
                        if (isWindowMethodCommand(command)) {
                            this.callbacks.switchOnReplayStatus('paused');
                            return [2 /*return*/, this.extCommand.sendCommand(command, target, value, true)];
                        }
                        targets = void 0;
                        if (target.startsWith('cache=')) {
                            targets = [target];
                        }
                        else if (mappedCommand.targetOptions && mappedCommand.targetOptions.length) {
                            targets = mappedCommand.targetOptions.map(function (x) { return expandVariables(x[0]); });
                        }
                        else {
                            targets = [expandVariables(target)];
                        }
                        if (!(command === 'waitFor' && value.startsWith('not_'))) return [3 /*break*/, 7];
                        overallResult = true;
                        i = 0;
                        _c.label = 3;
                    case 3:
                        if (!(i < targets.length)) return [3 /*break*/, 6];
                        t = targets[i];
                        console.log("Executing: | " + command + " | " + t + " | " + value + " |");
                        return [4 /*yield*/, this.executeCommand(command, t, value, false, timeout)];
                    case 4:
                        result = _c.sent();
                        overallResult = overallResult && (result.result === 'success');
                        _c.label = 5;
                    case 5:
                        ++i;
                        return [3 /*break*/, 3];
                    case 6:
                        if (overallResult) {
                            this.callbacks.updateCommandStatus({ identifier: id, status: 'success' });
                            this.callbacks.switchOnReplayStatus('paused');
                            return [2 /*return*/];
                        }
                        else {
                            this.callbacks.updateCommandStatus({ identifier: id, status: 'fail', reason: 'One of the locators has matched the element!' });
                            this.callbacks.switchOnReplayStatus('paused');
                            this.caseFailed = true;
                            this.commandIndex--;
                            this.pause();
                        }
                        return [3 /*break*/, 12];
                    case 7:
                        i = 0;
                        _c.label = 8;
                    case 8:
                        if (!(i < targets.length)) return [3 /*break*/, 11];
                        t = targets[i];
                        console.log("Executing: | " + command + " | " + t + " | " + value + " |");
                        return [4 /*yield*/, this.executeCommand(command, t, value, false, timeout)];
                    case 9:
                        result = _c.sent();
                        if (result.result === 'success') {
                            successLocator = i === 0 ? undefined : t;
                            nextStepId = this.findAndSaveNextStepId();
                            this.callbacks.updateCommandStatus({
                                identifier: id,
                                status: 'success',
                                nextStepId: nextStepId,
                                successLocator: successLocator,
                            });
                            this.callbacks.switchOnReplayStatus('paused');
                            return [2 /*return*/];
                        }
                        _c.label = 10;
                    case 10:
                        ++i;
                        return [3 /*break*/, 8];
                    case 11:
                        this.callbacks.updateCommandStatus({
                            identifier: id,
                            status: 'fail',
                            reason: "Failed to find element using provided locators",
                        });
                        this.callbacks.switchOnReplayStatus('paused');
                        this.caseFailed = true;
                        this.commandIndex--;
                        this.pause();
                        _c.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    PlaybackApi.prototype.executionLoop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var commands, _a, loop, end, step, cmd, cmdId, nextId, nextId, iterator, _i, _b, locator, firstLocator, steps, loop, start, end, steps, condition, evalResult, steps, mappedCommand, command, target, value, speed, reason_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.frames.length === 0) {
                            // If there are no more frames - looks like we are done...
                            // Check if failed /Remove?
                            if (!this.caseFailed) {
                                // WARN: Global reference
                                declaredVars = {};
                                this.callbacks.switchOnReplayStatus('stopped');
                                this.callbacks.successFullReplay();
                                return [2 /*return*/, true];
                            }
                            else {
                                this.caseFailed = false;
                                return [2 /*return*/, false];
                            }
                        }
                        this.commandIndex++;
                        commands = this.lastFrame.steps;
                        if (!(this.commandIndex >= commands.length)) return [3 /*break*/, 2];
                        if (this.lastFrame.loop) {
                            _a = this.lastFrame, loop = _a.loop, end = _a.end, step = _a.step;
                            declaredVars[loop] += expandNumOrDefault(step, 1);
                            if (declaredVars[loop] <= expandNumOrDefault(end, 0)) {
                                this.commandIndex = -1;
                            }
                            else {
                                // If we did, then we need to drop it and return
                                this.commandIndex = this.lastFrame.lastIndex;
                                this.dropLastFrame();
                            }
                        }
                        else {
                            // If we did, then we need to drop it and return
                            this.commandIndex = this.lastFrame.lastIndex;
                            this.dropLastFrame();
                        }
                        return [4 /*yield*/, this.executionLoop()];
                    case 1: return [2 /*return*/, _c.sent()];
                    case 2:
                        cmd = commands[this.commandIndex];
                        cmdId = this.getId(cmd);
                        if (!this.skippedSteps.some(function (x) { return array_utils_1.arraysMatch(x, cmdId); })) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.executionLoop()];
                    case 3: 
                    // Skipping
                    return [2 /*return*/, _c.sent()];
                    case 4:
                        if (this.checkIfBreakpoint(cmdId)) {
                            this.commandIndex--;
                            nextId = this.findAndSaveNextStepId();
                            this.callbacks.updateCommandStatus({ status: 'pending', nextStepId: nextId });
                            this.callbacks.switchOnReplayStatus('paused');
                            this.callbacks.updateStatus('Paused on breakpoint', 'info');
                            this.pause();
                            this.virtualBreakpoints = [];
                            this.replayStatus = 'breakpoint';
                            return [2 /*return*/, Promise.reject('shutdown')];
                        }
                        if (this.replayStatus === 'pause') {
                            this.commandIndex--;
                            nextId = this.findAndSaveNextStepId();
                            this.callbacks.updateCommandStatus({ status: 'pending', nextStepId: nextId });
                            this.callbacks.switchOnReplayStatus('paused');
                            return [2 /*return*/, Promise.reject('shutdown')];
                        }
                        if (!(cmd.type === 'forEachLoopGroup')) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.doPreparation()];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, Promise.all([this.doPrePageWait(), this.doPageWait(), this.doAjaxWait(), this.doDomWait()])];
                    case 6:
                        _c.sent();
                        this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'pending' });
                        return [4 /*yield*/, utils_1.delay(500)];
                    case 7:
                        _c.sent();
                        iterator = void 0;
                        _i = 0, _b = cmd.target;
                        _c.label = 8;
                    case 8:
                        if (!(_i < _b.length)) return [3 /*break*/, 11];
                        locator = _b[_i];
                        return [4 /*yield*/, this.executeCommand('findElements', locator, '')];
                    case 9:
                        iterator = _c.sent();
                        if (iterator.value) {
                            return [3 /*break*/, 11];
                        }
                        _c.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 8];
                    case 11:
                        if (!iterator || !iterator.value) {
                            this.commandIndex--;
                            firstLocator = cmd.target[0];
                            this.callbacks.updateCommandStatus({
                                identifier: cmdId,
                                status: 'fail',
                                reason: "Element " + firstLocator.name.toLowerCase() + "=" + firstLocator.value + " not found",
                            });
                            this.callbacks.switchOnReplayStatus('paused');
                            this.caseFailed = true;
                            this.pause();
                            return [2 /*return*/, Promise.reject('shutdown')];
                        }
                        declaredVars["obj_" + cmd.iterator + "_array"] = iterator.value.split(',');
                        declaredVars["obj_" + cmd.iterator + "_index"] = 0;
                        steps = __spreadArrays(cmd.steps);
                        steps.push(newReturnStatement());
                        this.frames.push(__assign(__assign({ lastIndex: this.commandIndex, loop: "obj_" + cmd.iterator + "_index", end: declaredVars["obj_" + cmd.iterator + "_array"].length - 1, step: 1 }, cmd), { steps: steps }));
                        this.commandIndex = -1;
                        return [4 /*yield*/, this.executionLoop()];
                    case 12: return [2 /*return*/, _c.sent()];
                    case 13:
                        if (!cmd.loop) return [3 /*break*/, 16];
                        loop = cmd.loop, start = cmd.start, end = cmd.end;
                        this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'pending' });
                        declaredVars[loop] = expandNumOrDefault(start, 0);
                        if (declaredVars[loop] <= expandNumOrDefault(end, -1)) {
                            steps = __spreadArrays(cmd.steps);
                            steps.push(newReturnStatement());
                            this.frames.push(__assign(__assign({ lastIndex: this.commandIndex }, cmd), { steps: steps }));
                            this.commandIndex = -1;
                        }
                        return [4 /*yield*/, utils_1.delay(500)];
                    case 14:
                        _c.sent();
                        return [4 /*yield*/, this.executionLoop()];
                    case 15: return [2 /*return*/, _c.sent()];
                    case 16:
                        if (!cmd.steps) return [3 /*break*/, 19];
                        // If we didn't exhaust the frame, but met a group
                        // We make new frame and relaunch the loop
                        if (cmd.steps[cmd.steps.length - 1].action !== 'ret') {
                            cmd.steps.push(newReturnStatement());
                        }
                        this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'pending' });
                        this.frames.push(__assign({ lastIndex: this.commandIndex }, cmd));
                        this.commandIndex = -1;
                        return [4 /*yield*/, utils_1.delay(500)];
                    case 17:
                        _c.sent();
                        return [4 /*yield*/, this.executionLoop()];
                    case 18: return [2 /*return*/, _c.sent()];
                    case 19:
                        if (!cmd.if) return [3 /*break*/, 25];
                        return [4 /*yield*/, this.doPreparation()];
                    case 20:
                        _c.sent();
                        return [4 /*yield*/, Promise.all([this.doPrePageWait(), this.doPageWait(), this.doAjaxWait(), this.doDomWait()])];
                    case 21:
                        _c.sent();
                        this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'pending' });
                        condition = expandVariables(cmd.if);
                        return [4 /*yield*/, this.extCommand.sendCommand('eval', condition, '')];
                    case 22:
                        evalResult = _c.sent();
                        steps = evalResult.value ? cmd.then : cmd.else;
                        steps.push(newReturnStatement());
                        this.frames.push({ lastIndex: this.commandIndex, id: cmd.id, steps: steps });
                        this.commandIndex = -1;
                        return [4 /*yield*/, utils_1.delay(500)];
                    case 23:
                        _c.sent();
                        return [4 /*yield*/, this.executionLoop()];
                    case 24: return [2 /*return*/, _c.sent()];
                    case 25:
                        if (!(cmd.action === 'ret')) return [3 /*break*/, 27];
                        // In case we met 'ret' command - relaunch execution loop
                        this.callbacks.updateCommandStatus({ identifier: cmdId.slice(0, -1), status: 'success' });
                        return [4 /*yield*/, this.executionLoop()];
                    case 26: return [2 /*return*/, _c.sent()];
                    case 27:
                        this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'pending' });
                        mappedCommand = this.mapper.map(cmd);
                        command = mappedCommand.command, target = mappedCommand.target, value = mappedCommand.value;
                        if (command === '') {
                            return [2 /*return*/, Promise.reject('no command name')];
                        }
                        speed = this.getDelay(command);
                        return [4 /*yield*/, utils_1.delay(speed)];
                    case 28:
                        _c.sent();
                        if (!ExtCommand.isExtCommand(command)) return [3 /*break*/, 34];
                        value = expandVariables(value);
                        target = expandVariables(target);
                        console.log("Executing: | " + command + " | " + target + " | " + value + " |");
                        _c.label = 29;
                    case 29:
                        _c.trys.push([29, 31, , 32]);
                        // @ts-ignore
                        return [4 /*yield*/, this.extCommand['do' + string_utils_1.titleCase(command)](target, value)];
                    case 30:
                        // @ts-ignore
                        _c.sent();
                        this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'success' });
                        return [3 /*break*/, 32];
                    case 31:
                        reason_3 = _c.sent();
                        // Ext command failed?
                        console.log(reason_3);
                        this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'fail', reason: reason_3 });
                        console.log('Test case failed');
                        this.caseFailed = true;
                        this.callbacks.switchOnReplayStatus('paused');
                        this.commandIndex--;
                        this.pause();
                        return [3 /*break*/, 32];
                    case 32: return [4 /*yield*/, this.executionLoop()];
                    case 33: return [2 /*return*/, _c.sent()];
                    case 34: return [4 /*yield*/, this.doPreparation()];
                    case 35:
                        _c.sent();
                        return [4 /*yield*/, Promise.all([this.doPrePageWait(), this.doPageWait(), this.doAjaxWait(), this.doDomWait()])];
                    case 36:
                        _c.sent();
                        return [4 /*yield*/, this.doCommand()];
                    case 37:
                        _c.sent();
                        return [4 /*yield*/, this.executionLoop()];
                    case 38: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    PlaybackApi.prototype.getDelay = function (command) {
        var commandDelay = this.replayDelay;
        if (command === 'assertAlert' ||
            command === 'assertConfirmation' ||
            command === 'assertPrompt' ||
            command === 'assertDialog') {
            commandDelay = 50;
        }
        return commandDelay;
    };
    PlaybackApi.prototype.checkIfBreakpoint = function (id) {
        if (this.skipNextBreakpoint) {
            this.skipNextBreakpoint = false;
            return false;
        }
        return (this.virtualBreakpoints.some(function (x) { return array_utils_1.arraysMatch(id, x); }) || this.breakPoints.some(function (x) { return array_utils_1.arraysMatch(id, x); }));
    };
    PlaybackApi.prototype.playAfterConnectionFailed = function () {
        return __awaiter(this, void 0, void 0, function () {
            var reason_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.replayStatus !== 'play') {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this.initializeAfterConnectionFailed();
                        return [4 /*yield*/, this.executionLoop()];
                    case 2:
                        _a.sent();
                        this.finalizePlayingProgress();
                        return [3 /*break*/, 4];
                    case 3:
                        reason_4 = _a.sent();
                        this.catchPlayingError(reason_4);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PlaybackApi.prototype.initializeAfterConnectionFailed = function () {
        this.replayStatus = 'play';
        this.caseFailed = false;
    };
    PlaybackApi.prototype.initializePlayingProgress = function () {
        this.replayStatus = 'play';
        this.commandIndex = -1;
        this.caseFailed = false;
        return this.extCommand.init();
    };
    PlaybackApi.prototype.catchPlayingError = function (reason) {
        var _this = this;
        // doCommands is depend on test website, so if make a new page,
        // doCommands function will fail, so keep retrying to get connection
        if (isReceivingEndError(reason)) {
            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.commandIndex--;
                            return [4 /*yield*/, this.playAfterConnectionFailed()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); }, 100);
        }
        else if (reason === 'shutdown') {
            var nextId = this.findAndSaveNextStepId();
            this.callbacks.updateCommandStatus({ status: 'pending', nextStepId: nextId });
            this.callbacks.switchOnReplayStatus('paused');
        }
        else {
            this.extCommand.clear();
            console.log(reason);
            if (this.commandIndex >= 0) {
                this.callbacks.updateCommandStatus({ status: 'fail', reason: reason });
            }
            console.log('Test case failed');
            this.callbacks.failedReplay(reason);
            this.callbacks.switchOnReplayStatus('stop');
            /* Clear the flag, reset to recording phase */
            /* A small delay for preventing recording events triggered in playing phase*/
            setTimeout(function () {
                _this.replayStatus = 'stop';
            }, 500);
        }
    };
    PlaybackApi.prototype.doCommand = function () {
        return __awaiter(this, void 0, void 0, function () {
            var commands, cmd, mappedCommand, command, target, value, ar, index, id, parent_1, _i, _a, t, result, timeout, targets, isWindowMethod, cmdId, overallResult, i, t, result, i, t, result, successLocator;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        commands = this.lastFrame.steps;
                        cmd = commands[this.commandIndex];
                        mappedCommand = this.mapper.map(cmd);
                        command = mappedCommand.command, target = mappedCommand.target, value = mappedCommand.value;
                        if (!commands[this.commandIndex].iterator) return [3 /*break*/, 6];
                        ar = declaredVars["obj_" + cmd.iterator + "_array"];
                        index = declaredVars["obj_" + cmd.iterator + "_index"];
                        id = ar[index];
                        if (!commands[this.commandIndex].target) return [3 /*break*/, 5];
                        parent_1 = 'cache=' + id;
                        _i = 0, _a = commands[this.commandIndex].target;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        t = _a[_i];
                        return [4 /*yield*/, this.executeCommand('findElements', t, parent_1)];
                    case 2:
                        result = _c.sent();
                        if (result.value) {
                            target = 'cache=' + result.value;
                            return [3 /*break*/, 4];
                        }
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        target = 'cache=' + id;
                        _c.label = 6;
                    case 6:
                        timeout = 10000;
                        if (command === 'waitFor') {
                            _b = value.split(':', 2), value = _b[0], timeout = _b[1];
                            timeout = timeout || 10000;
                        }
                        if (this.replayStatus !== 'play') {
                            this.commandIndex--;
                            return [2 /*return*/, Promise.reject('shutdown')];
                        }
                        return [4 /*yield*/, this.stabilizePage()];
                    case 7:
                        _c.sent();
                        value = expandVariables(value);
                        if (target.startsWith('cache=')) {
                            targets = [target];
                        }
                        else if (mappedCommand.targetOptions && mappedCommand.targetOptions.length) {
                            targets = mappedCommand.targetOptions.map(function (x) { return expandVariables(x[0]); });
                        }
                        else {
                            targets = [expandVariables(target)];
                        }
                        isWindowMethod = isWindowMethodCommand(command);
                        cmdId = this.getId(commands[this.commandIndex]);
                        if (!(command === 'waitFor' && value.startsWith('not_'))) return [3 /*break*/, 12];
                        overallResult = true;
                        i = 0;
                        _c.label = 8;
                    case 8:
                        if (!(i < targets.length)) return [3 /*break*/, 11];
                        t = targets[i];
                        console.log("Executing: | " + command + " | " + t + " | " + value + " |");
                        return [4 /*yield*/, this.executeCommand(command, t, value, isWindowMethod, timeout)];
                    case 9:
                        result = _c.sent();
                        overallResult = overallResult && (result.result === 'success');
                        _c.label = 10;
                    case 10:
                        ++i;
                        return [3 /*break*/, 8];
                    case 11:
                        if (overallResult) {
                            this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'success' });
                            return [2 /*return*/];
                        }
                        else {
                            this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'fail', reason: 'One of the locators has matched the element!' });
                            this.callbacks.switchOnReplayStatus('paused');
                            this.caseFailed = true;
                            this.commandIndex--;
                            this.pause();
                        }
                        return [3 /*break*/, 17];
                    case 12:
                        i = 0;
                        _c.label = 13;
                    case 13:
                        if (!(i < targets.length)) return [3 /*break*/, 16];
                        t = targets[i];
                        console.log("Executing: | " + command + " | " + t + " | " + value + " |");
                        return [4 /*yield*/, this.executeCommand(command, t, value, isWindowMethod, timeout)];
                    case 14:
                        result = _c.sent();
                        if (result.result === 'success') {
                            successLocator = i === 0 ? undefined : t;
                            this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'success', successLocator: successLocator });
                            return [2 /*return*/];
                        }
                        _c.label = 15;
                    case 15:
                        ++i;
                        return [3 /*break*/, 13];
                    case 16:
                        this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'fail', reason: "Failed to find element using provided locators" });
                        this.callbacks.switchOnReplayStatus('paused');
                        this.caseFailed = true;
                        this.commandIndex--;
                        this.pause();
                        _c.label = 17;
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute command with retry
     * @param command - Command to execute
     * @param target - Target parameter. Depending on the command it might be either arbitrary parameter or locator
     * @param value - Value parameter
     * @param isWindowMethod - Flag whether this is command that operates on window (resize, maximize, etc)
     * @param timeout
     * @private
     */
    PlaybackApi.prototype.executeCommand = function (command, target, value, isWindowMethod, timeout) {
        if (isWindowMethod === void 0) { isWindowMethod = false; }
        if (timeout === void 0) { timeout = 10000; }
        return __awaiter(this, void 0, void 0, function () {
            var startTime, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1: return [4 /*yield*/, this.extCommand.sendCommand(command, target, value, isWindowMethod)];
                    case 2:
                        result = _a.sent();
                        console.log(result);
                        if (result.result === 'success') {
                            return [2 /*return*/, result];
                        }
                        return [4 /*yield*/, utils_1.delay(500)];
                    case 3:
                        _a.sent();
                        if (result.status === 'failed' || result.result.match(/Element[\s\S]*?not found/)) {
                            console.log('Wait until the element is found');
                        }
                        _a.label = 4;
                    case 4:
                        if (Date.now() - startTime < timeout) return [3 /*break*/, 1];
                        _a.label = 5;
                    case 5:
                        console.log("Implicit Wait timed out after " + timeout + "ms");
                        return [2 /*return*/, false];
                }
            });
        });
    };
    PlaybackApi.prototype.finalizePlayingProgress = function () {
        if (this.replayStatus !== 'pause') {
            this.extCommand.clear();
        }
        this.frames = [];
        this.commandIndex = 0;
    };
    PlaybackApi.prototype.findAndSaveNextStepId = function () {
        var commands = this.lastFrame.steps;
        var lastCommand = commands[this.commandIndex + 1];
        this.nextStepId = this.getId(lastCommand);
        return this.nextStepId;
    };
    /**
     * Locate the step by path provided inside the suite
     * @param suite Suite to search in
     * @param path Path to the step represented as an array of identifiers
     */
    PlaybackApi.prototype.findStepByPath = function (suite, path) {
        var currentNode = suite;
        var _loop_1 = function (id) {
            var steps = currentNode.type === 'ifElseGroup'
                ? __spreadArrays(currentNode.then, currentNode.else) : __spreadArrays(currentNode.steps);
            currentNode = steps.find(function (x) { return x.id === id; });
        };
        for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
            var id = path_1[_i];
            _loop_1(id);
        }
        return currentNode;
    };
    /**
     * Rebuild execution frames so that execution proceeds from current path
     * @param suite
     * @param path
     */
    PlaybackApi.prototype.rebuildFrames = function (suite, path) {
        var last = function (inp) { return inp.slice(-1)[0]; };
        var partial = false;
        var frames = [suite];
        var currentNode = suite;
        var _loop_2 = function (id) {
            var steps = void 0;
            var continuationIndex = void 0;
            if (currentNode.type === 'ifElseGroup') {
                continuationIndex = currentNode.then.findIndex(function (x) { return x.id === id; });
                if (continuationIndex >= 0) {
                    steps = __spreadArrays(currentNode.then);
                    currentNode = currentNode.then[continuationIndex];
                }
                else {
                    continuationIndex = currentNode.else.findIndex(function (x) { return x.id === id; });
                    if (continuationIndex >= 0) {
                        steps = __spreadArrays(currentNode.else);
                        currentNode = currentNode.else[continuationIndex];
                    }
                }
            }
            else {
                continuationIndex = currentNode.steps.findIndex(function (x) { return x.id === id; });
                steps = __spreadArrays(currentNode.steps);
                currentNode = currentNode.steps[continuationIndex];
            }
            if (steps) {
                steps.push(newReturnStatement());
                last(frames).steps = __spreadArrays(steps);
                frames.push(__assign({ lastIndex: continuationIndex }, currentNode));
            }
            if (!currentNode) {
                partial = true;
                return "break";
            }
        };
        for (var _i = 0, path_2 = path; _i < path_2.length; _i++) {
            var id = path_2[_i];
            var state_1 = _loop_2(id);
            if (state_1 === "break")
                break;
        }
        var commandIndex = last(frames).lastIndex;
        frames.pop();
        return {
            partial: partial,
            commandIndex: commandIndex,
            frames: frames,
        };
    };
    PlaybackApi.prototype.getFirstStepId = function () {
        if (this.frames && this.frames[0].steps && this.frames[0].steps[0].steps) {
            return [this.frames[0].steps[0].id, this.frames[0].steps[0].steps[0].id];
        }
        else {
            return [];
        }
    };
    Object.defineProperty(PlaybackApi.prototype, "lastFrame", {
        //
        // Frame routines
        // TODO: This can be extracted to the separate class
        //
        get: function () {
            return this.frames[this.frames.length - 1];
        },
        enumerable: true,
        configurable: true
    });
    // private
    PlaybackApi.prototype.dropLastFrame = function () {
        this.frames.pop();
    };
    // TODO: More full type should be provided, make private
    PlaybackApi.prototype.getId = function (command) {
        return __spreadArrays(this.frames.map(function (x) { return x.id; }).filter(function (x) { return x; }), [command.id]);
    };
    //
    // Page stabilization routines
    //
    PlaybackApi.prototype.doPreparation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        if (this.replayStatus !== 'play') {
                            this.commandIndex--;
                            return [2 /*return*/, Promise.reject('shutdown')];
                        }
                        return [4 /*yield*/, this.extCommand.sendCommand('waitPreparation', '', '')];
                    case 2:
                        response = _a.sent();
                        console.log('waitPreparation', response);
                        if (response && response.ok) {
                            return [2 /*return*/, true];
                        }
                        console.log('wait preparation');
                        return [4 /*yield*/, utils_1.delay(500)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (Date.now() - startTime < 30000) return [3 /*break*/, 1];
                        _a.label = 5;
                    case 5: return [2 /*return*/, false];
                }
            });
        });
    };
    PlaybackApi.prototype.doPrePageWait = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.replayStatus !== 'play') {
                            this.commandIndex--;
                            return [2 /*return*/, Promise.reject('shutdown')];
                        }
                        return [4 /*yield*/, this.extCommand.sendCommand('prePageWait', '', '')];
                    case 1:
                        response = _a.sent();
                        if (!(response && response.new_page)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.doPrePageWait()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [2 /*return*/, true];
                }
            });
        });
    };
    PlaybackApi.prototype.doPageWait = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        if (this.replayStatus !== 'play') {
                            this.commandIndex--;
                            return [2 /*return*/, Promise.reject('shutdown')];
                        }
                        return [4 /*yield*/, this.extCommand.sendCommand('pageWait', '', '')];
                    case 2:
                        response = _a.sent();
                        console.log('pageWait', response);
                        if (response && response.page_done) {
                            return [2 /*return*/, true];
                        }
                        console.log('Wait for the new page to be fully loaded');
                        return [4 /*yield*/, utils_1.delay(500)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (Date.now() - startTime < 30000) return [3 /*break*/, 1];
                        _a.label = 5;
                    case 5:
                        console.log('Page Wait timed out after 30000ms');
                        return [2 /*return*/, false];
                }
            });
        });
    };
    PlaybackApi.prototype.doAjaxWait = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        if (this.replayStatus !== 'play') {
                            this.commandIndex--;
                            return [2 /*return*/, Promise.reject('shutdown')];
                        }
                        return [4 /*yield*/, this.extCommand.sendCommand('ajaxWait', '', '')];
                    case 2:
                        response = _a.sent();
                        console.log('ajaxWait', response);
                        if (response && response.ajax_done) {
                            return [2 /*return*/, true];
                        }
                        console.log('Wait for all ajax requests to be done');
                        return [4 /*yield*/, utils_1.delay(50)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (Date.now() - startTime < 30000) return [3 /*break*/, 1];
                        _a.label = 5;
                    case 5:
                        console.log('Ajax Wait timed out after 30000ms');
                        return [2 /*return*/, false];
                }
            });
        });
    };
    PlaybackApi.prototype.doDomWait = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        if (this.replayStatus !== 'play') {
                            this.commandIndex--;
                            return [2 /*return*/, Promise.reject('shutdown')];
                        }
                        return [4 /*yield*/, this.extCommand.sendCommand('domWait', '', '')];
                    case 2:
                        response = _a.sent();
                        console.log('domWait', response);
                        if (response && (Date.now() - response.dom_time > 400 || !response.dom_time)) {
                            return [2 /*return*/, true];
                        }
                        console.log('Wait for the DOM tree modification');
                        return [4 /*yield*/, utils_1.delay(50)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (Date.now() - startTime < 30000) return [3 /*break*/, 1];
                        _a.label = 5;
                    case 5:
                        console.log('DOM Wait timed out after 30000ms');
                        return [2 /*return*/, false];
                }
            });
        });
    };
    PlaybackApi.prototype.stabilizePage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var count = 0;
            var interval = setInterval(function () {
                if (_this.replayStatus !== 'play') {
                    _this.commandIndex--;
                    reject('shutdown');
                    clearInterval(interval);
                }
                if (count > 60) {
                    console.log('Timed out after 30000ms');
                    reject('Window not Found');
                    clearInterval(interval);
                }
                if (!_this.extCommand.getPageStatus()) {
                    if (count === 0) {
                        console.log('Wait for the new page to be fully loaded');
                    }
                    count++;
                }
                else {
                    resolve();
                    clearInterval(interval);
                }
            }, 500);
        });
    };
    return PlaybackApi;
}());
exports.PlaybackApi = PlaybackApi;
function isReceivingEndError(reason) {
    return (reason === 'TypeError: response is undefined' ||
        reason === 'Error: Could not establish connection. Receiving end does not exist.' ||
        // Below message is for Google Chrome
        reason.message === 'Could not establish connection. Receiving end does not exist.' ||
        // Google Chrome misspells "response"
        reason.message === 'The message port closed before a reponse was received.' ||
        reason.message === 'The message port closed before a response was received.');
}
function isWindowMethodCommand(command) {
    return (command === 'answerOnNextPrompt' ||
        command === 'chooseCancelOnNextPrompt' ||
        command === 'assertPrompt' ||
        command === 'chooseOkOnNextConfirmation' ||
        command === 'chooseCancelOnNextConfirmation' ||
        command === 'assertConfirmation' ||
        command === 'assertAlert' ||
        command === 'assertDialog' ||
        command === 'answerDialog');
}
/**
 * Substitutes all the variables into the string.
 * Variables are taken from global object 'declaredVars'.
 *
 * @param variable
 * @returns {string}
 */
function expandVariables(variable) {
    if (typeof variable !== 'string') {
        return variable;
    }
    var frontIndex = variable.indexOf('${');
    var newStr = '';
    while (frontIndex !== -1) {
        var prefix = variable.substring(0, frontIndex);
        var suffix = variable.substring(frontIndex);
        var tailIndex = suffix.indexOf('}');
        var suffixFront = suffix.substring(0, tailIndex + 1);
        var suffixTail = suffix.substring(tailIndex + 1);
        newStr += prefix + xlateArgument(suffixFront);
        variable = suffixTail;
        frontIndex = variable.indexOf('${');
    }
    return newStr + variable;
}
function expandNumOrDefault(variable, defaultVal) {
    return Number(expandVariables(variable)) || Number(defaultVal);
}
//# sourceMappingURL=playback-api.js.map