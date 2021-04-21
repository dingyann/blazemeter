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

import { arraysMatch } from '../../common/array-utils';
import { titleCase } from '../../common/string-utils';
import { delay } from '../../common/utils';
import { CommandMapper } from '../background/bg-command-mapper';
import '../global';

type PlaybackState = 'play' | 'pause' | 'stop' | 'breakpoint';
export type Status = 'success' | 'pending' | 'fail';

function newReturnStatement() {
    return { action: 'ret', id: 'deadbeef-dead-beef-dead-beefdead' };
}

export class PlaybackApi {
    public skippedSteps: any[] = [];
    public breakPoints: any[] = [];
    public extCommand: ExtCommand;
    public replayStatus: PlaybackState = 'stop';
    public frames: any[] = [];

    private commandIndex: number = -1;

    private caseFailed = false;
    private suite: any = null;
    private skipNextBreakpoint = false;
    private callbacks: any;
    private replayDelay = 500;
    private virtualBreakpoints: any[] = [];
    private mapper = new CommandMapper();
    private nextStepId: string[];

    constructor(extCommand: ExtCommand, callbacks: any) {
        this.extCommand = extCommand;
        this.callbacks = callbacks;
    }

    public setModel(model: any): void {
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

            const { partial, commandIndex, frames } = this.rebuildFrames(model, this.nextStepId);

            // Partial means that rebuildFrames method was not able to fully restore frames
            if (partial) {
                // In this case we need to grab lastIndex from the previous frames state
                if (this.frames.length !== frames.length) {
                    this.commandIndex = this.frames[frames.length].lastIndex - 1;
                }
            } else {
                this.commandIndex = commandIndex - 1;
            }

            this.frames = frames;

            const nextStepId = this.findAndSaveNextStepId();
            this.callbacks.updateCommandStatus({status: 'pending', nextStepId});
        }

        this.suite = model;
    }

    public async next() {
        if (this.replayStatus !== 'pause' && this.replayStatus !== 'breakpoint') {
            return;
        }
        this.skipNextBreakpoint = true;

        const next = this.lastFrame.steps[this.commandIndex + 2];
        if (!next) {
            const prevFrame = this.frames[this.frames.length - 2];
            if (prevFrame) {
                const lastCommand = prevFrame.steps[this.lastFrame.lastIndex + 1];
                if (lastCommand) {
                    this.virtualBreakpoints.push([
                        ...this.frames
                            .map((x) => x.id)
                            .filter((x) => x)
                            .slice(0, -1),
                        lastCommand.id,
                    ]);
                }
            }
        } else {
            this.virtualBreakpoints.push(this.getId(next));
        }

        await this.resume();
    }

    public async stepIn() {
        if (this.replayStatus !== 'pause' && this.replayStatus !== 'breakpoint') {
            return;
        }
        this.skipNextBreakpoint = true;

        const current = this.lastFrame.steps[this.commandIndex + 1];
        if (current.steps) {
            this.virtualBreakpoints.push([
                ...this.frames.map((x) => x.id).filter((x) => x),
                current.id,
                current.steps[0].id,
            ]);
            await this.resume();
        } else {
            await this.next();
        }
    }

    public async stepOut() {
        if (this.replayStatus !== 'pause' && this.replayStatus !== 'breakpoint') {
            return;
        }
        this.skipNextBreakpoint = true;

        // If we're on last item in the frame - we need to make jump outside to previous frame.
        // StepOver can help with that.
        if (this.commandIndex === this.lastFrame.steps.length) {
            await this.next();
        } else {
            // If we're in the middle of frame - go till its end
            const lastStep = this.lastFrame.steps[this.lastFrame.steps.length - 1];
            this.virtualBreakpoints.push([...this.frames.map((x) => x.id).filter((x) => x), lastStep.id]);
            await this.resume();
        }
    }

    public stop() {
        this.replayStatus = 'stop';
        this.finalizePlayingProgress();
    }

    public pause() {
        if (this.replayStatus === 'play') {
            this.replayStatus = 'pause';
        }
    }

    public async resume() {
        if (this.replayStatus !== 'pause' && this.replayStatus !== 'breakpoint') {
            return;
        }

        if (this.replayStatus === 'breakpoint') {
            this.skipNextBreakpoint = true;
        }

        this.replayStatus = 'play';
        this.callbacks.switchOnReplayStatus('playing');
        this.extCommand.attach();
        try {
            await this.executionLoop();
            this.finalizePlayingProgress();
        } catch (ex) {
            this.catchPlayingError(ex);
        }
    }

    public async playSuite(suite: any, i: number) {
        this.callbacks.switchOnReplayStatus('playing');
        this.frames.push(this.suite);

        try {
            await this.initializePlayingProgress();
            await this.executionLoop();
            this.finalizePlayingProgress();
        } catch (reason) {
            this.catchPlayingError(reason);
        }
    }

    public async initSuite() {
        this.frames.push(this.suite);

        try {
            await this.initializePlayingProgress();
            this.virtualBreakpoints.push(this.getFirstStepId());
            await this.executionLoop();
        } catch (reason) {
            console.log('reason: ', reason);
            this.catchPlayingError(reason);
        }
    }

    public async playSingleCommand(id: string[]) {
        await this.initializePlayingProgress();
        const { commandIndex, frames } = this.rebuildFrames(this.suite, id);
        this.frames = frames;
        this.commandIndex = commandIndex;
        const step = this.findStepByPath(this.suite, id);

        if (!step) {
            this.callbacks.updateCommandStatus({ identifier: id, status: 'fail', reason: 'Step was not found'});
            return;
        }

        const mappedCommand = this.mapper.map(step);
        let { command, target, value } = mappedCommand;

        let timeout = 10000;
        if (command === 'waitFor') {
            [value, timeout] = value.split(':', 2);
            timeout = timeout || 10000;
        }

        this.callbacks.updateCommandStatus({ identifier: id, status: 'pending' });
        this.callbacks.switchOnReplayStatus('playing');

        value = expandVariables(value);
        target = expandVariables(target);

        if (ExtCommand.isExtCommand(command)) {
            console.log(`Executing: | ${command} | ${target} | ${value} |`);
            // @ts-ignore
            this.extCommand['do' + titleCase(command)](target, value).then(
                () => {
                    this.callbacks.updateCommandStatus({ identifier: id, status: 'success' });
                },
                (reason: string | { message: string }) => {
                    // Ext command failed?
                    const errorMessage = typeof reason === 'string' ? reason : reason.message;
                    console.error('Command failed. Reason:', errorMessage);
                    this.callbacks.updateCommandStatus({ identifier: id, status: 'fail', reason: errorMessage });
                },
            );
            this.callbacks.switchOnReplayStatus('paused');
        } else {
            if (isWindowMethodCommand(command)) {
                this.callbacks.switchOnReplayStatus('paused');
                return this.extCommand.sendCommand(command, target, value, true);
            }

            let targets;

            if (target.startsWith('cache=')) {
                targets = [target];
            } else if (mappedCommand.targetOptions && mappedCommand.targetOptions.length) {
                targets = mappedCommand.targetOptions.map((x) => expandVariables(x[0]));
            } else {
                targets = [expandVariables(target)];
            }

            if (command === 'waitFor' && value.startsWith('not_')) {
                let overallResult = true;

                for (let i = 0; i < targets.length; ++i) {
                    const t = targets[i];
                    console.log(`Executing: | ${command} | ${t} | ${value} |`);
                    const result = await this.executeCommand(command, t, value, false, timeout);

                    overallResult = overallResult && (result.result === 'success');
                }

                if (overallResult) {
                    this.callbacks.updateCommandStatus({ identifier: id, status: 'success'});
                    this.callbacks.switchOnReplayStatus('paused');
                    return;
                } else {
                    this.callbacks.updateCommandStatus({ identifier: id, status: 'fail', reason: 'One of the locators has matched the element!'});
                    this.callbacks.switchOnReplayStatus('paused');
                    this.caseFailed = true;
                    this.commandIndex--;
                    this.pause();
                }
            } else {

                for (let i = 0; i < targets.length; ++i) {
                    const t = targets[i];
                    console.log(`Executing: | ${command} | ${t} | ${value} |`);
                    const result = await this.executeCommand(command, t, value, false, timeout);

                    if (result.result === 'success') {
                        const successLocator = i === 0 ? undefined : t;
                        const nextStepId = this.findAndSaveNextStepId();
                        this.callbacks.updateCommandStatus({
                            identifier: id,
                            status: 'success',
                            nextStepId,
                            successLocator,
                        });
                        this.callbacks.switchOnReplayStatus('paused');
                        return;
                    }
                }

                this.callbacks.updateCommandStatus({
                    identifier: id,
                    status: 'fail',
                    reason: `Failed to find element using provided locators`,
                });
                this.callbacks.switchOnReplayStatus('paused');
                this.caseFailed = true;
                this.commandIndex--;
                this.pause();
            }
        }
    }

    private async executionLoop(): Promise<any> {
        if (this.frames.length === 0) {
            // If there are no more frames - looks like we are done...
            // Check if failed /Remove?
            if (!this.caseFailed) {
                // WARN: Global reference
                declaredVars = {};
                this.callbacks.switchOnReplayStatus('stopped');
                this.callbacks.successFullReplay();
                return true;
            } else {
                this.caseFailed = false;
                return false;
            }
        }

        this.commandIndex++;
        const commands = this.lastFrame.steps;

        // Did we exhaust last frame?
        if (this.commandIndex >= commands.length) {
            if (this.lastFrame.loop) {
                const { loop, end, step } = this.lastFrame;
                declaredVars[loop] += expandNumOrDefault(step, 1);
                if (declaredVars[loop] <= expandNumOrDefault(end, 0)) {
                    this.commandIndex = -1;
                } else {
                    // If we did, then we need to drop it and return
                    this.commandIndex = this.lastFrame.lastIndex;
                    this.dropLastFrame();
                }
            } else {
                // If we did, then we need to drop it and return
                this.commandIndex = this.lastFrame.lastIndex;
                this.dropLastFrame();
            }

            return await this.executionLoop();
        }

        const cmd = commands[this.commandIndex];
        const cmdId = this.getId(cmd);

        if (this.skippedSteps.some((x) => arraysMatch(x, cmdId))) {
            // Skipping
            return await this.executionLoop();
        }

        if (this.checkIfBreakpoint(cmdId)) {
            this.commandIndex--;
            const nextId = this.findAndSaveNextStepId();
            this.callbacks.updateCommandStatus({ status: 'pending', nextStepId: nextId });
            this.callbacks.switchOnReplayStatus('paused');
            this.callbacks.updateStatus('Paused on breakpoint', 'info');
            this.pause();
            this.virtualBreakpoints = [];
            this.replayStatus = 'breakpoint';
            return Promise.reject('shutdown');
        }

        if (this.replayStatus === 'pause') {
            this.commandIndex--;
            const nextId = this.findAndSaveNextStepId();
            this.callbacks.updateCommandStatus({ status: 'pending', nextStepId: nextId });
            this.callbacks.switchOnReplayStatus('paused');
            return Promise.reject('shutdown');
        }

        if (cmd.type === 'forEachLoopGroup') {
            await this.doPreparation();
            await Promise.all([this.doPrePageWait(), this.doPageWait(), this.doAjaxWait(), this.doDomWait()]);

            this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'pending' });

            await delay(500);

            let iterator: any;
            for (const locator of cmd.target) {
                iterator = await this.executeCommand('findElements', locator, '');
                if (iterator.value) {
                    break;
                }
            }

            if (!iterator || !iterator.value) {
                this.commandIndex--;
                const firstLocator = cmd.target[0];
                this.callbacks.updateCommandStatus({
                    identifier: cmdId,
                    status: 'fail',
                    reason: `Element ${firstLocator.name.toLowerCase()}=${firstLocator.value} not found`,
                });
                this.callbacks.switchOnReplayStatus('paused');
                this.caseFailed = true;
                this.pause();

                return Promise.reject('shutdown');
            }

            declaredVars[`obj_${cmd.iterator}_array`] = iterator.value.split(',');
            declaredVars[`obj_${cmd.iterator}_index`] = 0;

            const steps = [...cmd.steps];
            steps.push(newReturnStatement());
            this.frames.push({
                lastIndex: this.commandIndex,
                loop: `obj_${cmd.iterator}_index`,
                end: declaredVars[`obj_${cmd.iterator}_array`].length - 1,
                step: 1,
                ...cmd,
                steps,
            });
            this.commandIndex = -1;

            return await this.executionLoop();
        }

        if (cmd.loop) {
            const { loop, start, end } = cmd;

            this.callbacks.updateCommandStatus({identifier: cmdId, status: 'pending' });

            declaredVars[loop] = expandNumOrDefault(start, 0);

            if (declaredVars[loop] <= expandNumOrDefault(end, -1)) {
                const steps = [...cmd.steps];
                steps.push(newReturnStatement());
                this.frames.push({ lastIndex: this.commandIndex, ...cmd, steps });
                this.commandIndex = -1;
            }

            await delay(500);
            return await this.executionLoop();
        }

        if (cmd.steps) {
            // If we didn't exhaust the frame, but met a group
            // We make new frame and relaunch the loop
            if (cmd.steps[cmd.steps.length - 1].action !== 'ret') {
                cmd.steps.push(newReturnStatement());
            }
            this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'pending' });
            this.frames.push({ lastIndex: this.commandIndex, ...cmd });
            this.commandIndex = -1;
            await delay(500);
            return await this.executionLoop();
        }

        if (cmd.if) {
            await this.doPreparation();
            await Promise.all([this.doPrePageWait(), this.doPageWait(), this.doAjaxWait(), this.doDomWait()]);
            this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'pending' });

            const condition = expandVariables(cmd.if);
            const evalResult = await this.extCommand.sendCommand('eval', condition, '');
            const steps = evalResult.value ? cmd.then : cmd.else;
            steps.push(newReturnStatement());
            this.frames.push({ lastIndex: this.commandIndex, id: cmd.id, steps });
            this.commandIndex = -1;
            await delay(500);

            return await this.executionLoop();
        }

        // In all other cases - it's just a command that we need to execute
        if (cmd.action === 'ret') {
            // In case we met 'ret' command - relaunch execution loop
            this.callbacks.updateCommandStatus({ identifier: cmdId.slice(0, -1), status: 'success' });
            return await this.executionLoop();
        }

        this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'pending' });

        const mappedCommand = this.mapper.map(cmd);
        let { command, target, value } = mappedCommand;

        if (command === '') {
            return Promise.reject('no command name');
        }

        const speed = this.getDelay(command);
        await delay(speed);

        if (ExtCommand.isExtCommand(command)) {
            value = expandVariables(value);
            target = expandVariables(target);
            console.log(`Executing: | ${command} | ${target} | ${value} |`);
            try {
                // @ts-ignore
                await this.extCommand['do' + titleCase(command)](target, value);
                this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'success' });
            } catch (reason) {
                // Ext command failed?
                console.log(reason);
                this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'fail', reason});
                console.log('Test case failed');
                this.caseFailed = true;
                this.callbacks.switchOnReplayStatus('paused');
                this.commandIndex--;
                this.pause();
            }

            return await this.executionLoop();
        } else {
            await this.doPreparation();
            await Promise.all([this.doPrePageWait(), this.doPageWait(), this.doAjaxWait(), this.doDomWait()]);
            await this.doCommand();
            return await this.executionLoop();
        }
    }

    private getDelay(command: string): number {
        let commandDelay = this.replayDelay;
        if (
            command === 'assertAlert' ||
            command === 'assertConfirmation' ||
            command === 'assertPrompt' ||
            command === 'assertDialog'
        ) {
            commandDelay = 50;
        }
        return commandDelay;
    }

    private checkIfBreakpoint(id: string[]): boolean {
        if (this.skipNextBreakpoint) {
            this.skipNextBreakpoint = false;
            return false;
        }

        return (
            this.virtualBreakpoints.some((x) => arraysMatch(id, x)) || this.breakPoints.some((x) => arraysMatch(id, x))
        );
    }

    private async playAfterConnectionFailed() {
        if (this.replayStatus !== 'play') {
            return;
        }

        try {
            this.initializeAfterConnectionFailed();
            await this.executionLoop();
            this.finalizePlayingProgress();
        } catch (reason) {
            this.catchPlayingError(reason);
        }
    }

    private initializeAfterConnectionFailed() {
        this.replayStatus = 'play';
        this.caseFailed = false;
    }

    private initializePlayingProgress(): Promise<any> {
        this.replayStatus = 'play';
        this.commandIndex = -1;
        this.caseFailed = false;

        return this.extCommand.init();
    }

    private catchPlayingError(reason: string) {
        // doCommands is depend on test website, so if make a new page,
        // doCommands function will fail, so keep retrying to get connection
        if (isReceivingEndError(reason)) {
            setTimeout(async () => {
                this.commandIndex--;
                await this.playAfterConnectionFailed();
            }, 100);
        } else if (reason === 'shutdown') {
            const nextId = this.findAndSaveNextStepId();
            this.callbacks.updateCommandStatus({ status: 'pending', nextStepId: nextId });
            this.callbacks.switchOnReplayStatus('paused');
        } else {
            this.extCommand.clear();
            console.log(reason);

            if (this.commandIndex >= 0) {
                this.callbacks.updateCommandStatus({ status: 'fail', reason });
            }

            console.log('Test case failed');

            this.callbacks.failedReplay(reason);
            this.callbacks.switchOnReplayStatus('stop');

            /* Clear the flag, reset to recording phase */
            /* A small delay for preventing recording events triggered in playing phase*/
            setTimeout(() => {
                this.replayStatus = 'stop';
            }, 500);
        }
    }



    private async doCommand(): Promise<any> {
        const commands = this.lastFrame.steps;
        const cmd = commands[this.commandIndex];
        const mappedCommand = this.mapper.map(cmd);
        let { command, target, value } = mappedCommand;
        if (commands[this.commandIndex].iterator) {
            const ar = declaredVars[`obj_${cmd.iterator}_array`];
            const index = declaredVars[`obj_${cmd.iterator}_index`];
            const id = ar[index];
            if (commands[this.commandIndex].target) {
                // If we have both iterator and target, we need to search for child objects
                const parent = 'cache=' + id;

                for (const t of commands[this.commandIndex].target) {
                    const result = await this.executeCommand('findElements', t, parent);
                    if (result.value) {
                        target = 'cache=' + result.value;
                        break;
                    }
                }
            } else {
                target = 'cache=' + id;
            }
        }
        let timeout = 10000;
        if (command === 'waitFor') {
            [value, timeout] = value.split(':', 2);
            timeout = timeout || 10000;
        }

        if (this.replayStatus !== 'play') {
            this.commandIndex--;
            return Promise.reject('shutdown');
        }

        await this.stabilizePage();
        value = expandVariables(value);

        let targets;

        if (target.startsWith('cache=')) {
            targets = [target];
        } else if (mappedCommand.targetOptions && mappedCommand.targetOptions.length) {
            targets = mappedCommand.targetOptions.map((x) => expandVariables(x[0]));
        } else {
            targets = [expandVariables(target)];
        }

        const isWindowMethod = isWindowMethodCommand(command);
        const cmdId = this.getId(commands[this.commandIndex]);

        if (command === 'waitFor' && value.startsWith('not_')) {
            let overallResult = true;

            for (let i = 0; i < targets.length; ++i) {
                const t = targets[i];
                console.log(`Executing: | ${command} | ${t} | ${value} |`);
                const result = await this.executeCommand(command, t, value, isWindowMethod, timeout);

                overallResult = overallResult && (result.result === 'success');
            }

            if (overallResult) {
                this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'success'});
                return;
            } else {
                this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'fail', reason: 'One of the locators has matched the element!'});
                this.callbacks.switchOnReplayStatus('paused');
                this.caseFailed = true;
                this.commandIndex--;
                this.pause();
            }
        } else {
            for (let i = 0; i < targets.length; ++i) {
                const t = targets[i];
                console.log(`Executing: | ${command} | ${t} | ${value} |`);
                const result = await this.executeCommand(command, t, value, isWindowMethod, timeout);

                if (result.result === 'success') {
                    const successLocator = i === 0 ? undefined : t;
                    this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'success', successLocator});
                    return;
                }
            }


            this.callbacks.updateCommandStatus({ identifier: cmdId, status: 'fail', reason: `Failed to find element using provided locators` });
            this.callbacks.switchOnReplayStatus('paused');
            this.caseFailed = true;
            this.commandIndex--;
            this.pause();
        }


    }

    /**
     * Execute command with retry
     * @param command - Command to execute
     * @param target - Target parameter. Depending on the command it might be either arbitrary parameter or locator
     * @param value - Value parameter
     * @param isWindowMethod - Flag whether this is command that operates on window (resize, maximize, etc)
     * @param timeout
     * @private
     */
    private async executeCommand(
        command: string,
        target: string,
        value: string,
        isWindowMethod: boolean = false,
        timeout: number = 10000,
    ): Promise<any> {
        const startTime = Date.now();
        do {
            const result = await this.extCommand.sendCommand(command, target, value, isWindowMethod);
            console.log(result);
            if (result.result === 'success') {
                return result;
            }

            await delay(500);

            if (result.status === 'failed' || result.result.match(/Element[\s\S]*?not found/)) {
                console.log('Wait until the element is found');
            }
        } while (Date.now() - startTime < timeout);

        console.log(`Implicit Wait timed out after ${timeout}ms`);
        return false;
    }

    private finalizePlayingProgress() {
        if (this.replayStatus !== 'pause') {
            this.extCommand.clear();
        }
        this.frames = [];
        this.commandIndex = 0;
    }

    private findAndSaveNextStepId() {
        const commands = this.lastFrame.steps;
        const lastCommand = commands[this.commandIndex + 1];
        this.nextStepId = this.getId(lastCommand);
        return this.nextStepId;
    }

    /**
     * Locate the step by path provided inside the suite
     * @param suite Suite to search in
     * @param path Path to the step represented as an array of identifiers
     */
    private findStepByPath(suite: any, path: string[]): any {
        let currentNode = suite;
        for (const id of path) {
            const steps: any[] =
                currentNode.type === 'ifElseGroup'
                    ? [...currentNode.then, ...currentNode.else]
                    : [...currentNode.steps];
            currentNode = steps.find((x) => x.id === id);
        }
        return currentNode;
    }

    /**
     * Rebuild execution frames so that execution proceeds from current path
     * @param suite
     * @param path
     */
    private rebuildFrames(suite: any, path: string[]): { partial: boolean; commandIndex: number; frames: any[] } {
        const last = (inp: any[]): any => inp.slice(-1)[0];
        let partial = false;

        const frames = [suite];
        let currentNode = suite;
        for (const id of path) {
            let steps: any[];
            let continuationIndex: number;
            if (currentNode.type === 'ifElseGroup') {
                continuationIndex = currentNode.then.findIndex((x: any) => x.id === id);
                if (continuationIndex >= 0) {
                    steps = [...currentNode.then];
                    currentNode = currentNode.then[continuationIndex];
                } else {
                    continuationIndex = currentNode.else.findIndex((x: any) => x.id === id);
                    if (continuationIndex >= 0) {
                        steps = [...currentNode.else];
                        currentNode = currentNode.else[continuationIndex];
                    }
                }
            } else {
                continuationIndex = currentNode.steps.findIndex((x: any) => x.id === id);
                steps = [...currentNode.steps];
                currentNode = currentNode.steps[continuationIndex];
            }

            if (steps) {
                steps.push(newReturnStatement());
                last(frames).steps = [...steps];

                frames.push({
                    lastIndex: continuationIndex,
                    ...currentNode,
                });
            }

            if (!currentNode) {
                partial = true;
                break;
            }
        }
        const commandIndex = last(frames).lastIndex;
        frames.pop();
        return {
            partial,
            commandIndex,
            frames,
        };
    }

    private getFirstStepId() {
        if (this.frames && this.frames[0].steps && this.frames[0].steps[0].steps) {
            return [this.frames[0].steps[0].id, this.frames[0].steps[0].steps[0].id];
        } else {
            return [];
        }
    }

    //
    // Frame routines
    // TODO: This can be extracted to the separate class
    //
    private get lastFrame() {
        return this.frames[this.frames.length - 1];
    }

    // private
    private dropLastFrame() {
        this.frames.pop();
    }

    // TODO: More full type should be provided, make private
    private getId(command: { id: string }) {
        return [...this.frames.map((x) => x.id).filter((x) => x), command.id];
    }

    //
    // Page stabilization routines
    //

    private async doPreparation() {
        const startTime = Date.now();
        do {
            if (this.replayStatus !== 'play') {
                this.commandIndex--;
                return Promise.reject('shutdown');
            }

            const response = await this.extCommand.sendCommand('waitPreparation', '', '');
            console.log('waitPreparation', response);

            if (response && response.ok) {
                return true;
            }

            console.log('wait preparation');
            await delay(500);
        } while (Date.now() - startTime < 30000);
        return false;
    }

    private async doPrePageWait(): Promise<any> {
        if (this.replayStatus !== 'play') {
            this.commandIndex--;
            return Promise.reject('shutdown');
        }
        const response = await this.extCommand.sendCommand('prePageWait', '', '');
        if (response && response.new_page) {
            return await this.doPrePageWait();
        } else {
            return true;
        }
    }

    private async doPageWait(): Promise<any> {
        const startTime = Date.now();
        do {
            if (this.replayStatus !== 'play') {
                this.commandIndex--;
                return Promise.reject('shutdown');
            }

            const response = await this.extCommand.sendCommand('pageWait', '', '');
            console.log('pageWait', response);
            if (response && response.page_done) {
                return true;
            }

            console.log('Wait for the new page to be fully loaded');
            await delay(500);
        } while (Date.now() - startTime < 30000);

        console.log('Page Wait timed out after 30000ms');
        return false;
    }

    private async doAjaxWait(): Promise<any> {
        const startTime = Date.now();
        do {
            if (this.replayStatus !== 'play') {
                this.commandIndex--;
                return Promise.reject('shutdown');
            }

            const response = await this.extCommand.sendCommand('ajaxWait', '', '');
            console.log('ajaxWait', response);
            if (response && response.ajax_done) {
                return true;
            }

            console.log('Wait for all ajax requests to be done');
            await delay(50);
        } while (Date.now() - startTime < 30000);

        console.log('Ajax Wait timed out after 30000ms');
        return false;
    }

    private async doDomWait(): Promise<any> {
        const startTime = Date.now();
        do {
            if (this.replayStatus !== 'play') {
                this.commandIndex--;
                return Promise.reject('shutdown');
            }

            const response = await this.extCommand.sendCommand('domWait', '', '');
            console.log('domWait', response);
            if (response && (Date.now() - response.dom_time > 400 || !response.dom_time)) {
                return true;
            }

            console.log('Wait for the DOM tree modification');
            await delay(50);
        } while (Date.now() - startTime < 30000);

        console.log('DOM Wait timed out after 30000ms');
        return false;
    }

    private stabilizePage() {
        return new Promise((resolve, reject) => {
            let count = 0;
            const interval = setInterval(() => {
                if (this.replayStatus !== 'play') {
                    this.commandIndex--;
                    reject('shutdown');
                    clearInterval(interval);
                }
                if (count > 60) {
                    console.log('Timed out after 30000ms');
                    reject('Window not Found');
                    clearInterval(interval);
                }
                if (!this.extCommand.getPageStatus()) {
                    if (count === 0) {
                        console.log('Wait for the new page to be fully loaded');
                    }
                    count++;
                } else {
                    resolve();
                    clearInterval(interval);
                }
            }, 500);
        });
    }
}

function isReceivingEndError(reason: any): boolean {
    return (
        reason === 'TypeError: response is undefined' ||
        reason === 'Error: Could not establish connection. Receiving end does not exist.' ||
        // Below message is for Google Chrome
        reason.message === 'Could not establish connection. Receiving end does not exist.' ||
        // Google Chrome misspells "response"
        reason.message === 'The message port closed before a reponse was received.' ||
        reason.message === 'The message port closed before a response was received.'
    );
}

function isWindowMethodCommand(command: string): boolean {
    return (
        command === 'answerOnNextPrompt' ||
        command === 'chooseCancelOnNextPrompt' ||
        command === 'assertPrompt' ||
        command === 'chooseOkOnNextConfirmation' ||
        command === 'chooseCancelOnNextConfirmation' ||
        command === 'assertConfirmation' ||
        command === 'assertAlert' ||
        command === 'assertDialog' ||
        command === 'answerDialog'
    );
}

/**
 * Substitutes all the variables into the string.
 * Variables are taken from global object 'declaredVars'.
 *
 * @param variable
 * @returns {string}
 */
function expandVariables(variable: any) {
    if (typeof variable !== 'string') {
        return variable;
    }

    let frontIndex = variable.indexOf('${');
    let newStr = '';
    while (frontIndex !== -1) {
        const prefix = variable.substring(0, frontIndex);
        const suffix = variable.substring(frontIndex);
        const tailIndex = suffix.indexOf('}');
        const suffixFront = suffix.substring(0, tailIndex + 1);
        const suffixTail = suffix.substring(tailIndex + 1);
        newStr += prefix + xlateArgument(suffixFront);
        variable = suffixTail;
        frontIndex = variable.indexOf('${');
    }
    return newStr + variable;
}

function expandNumOrDefault(variable: any, defaultVal: any) {
    return Number(expandVariables(variable)) || Number(defaultVal);
}
