"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_dom_1 = require("react-dom");
var test_utils_1 = require("react-dom/test-utils");
var transaction_controls_1 = __importDefault(require("./transaction-controls"));
var backgroundPageMock = {
    mixpanelTrack: jest.fn(),
    functionalIconBlinkMode: false,
};
jest.mock('../common/extension', function () { return ({
    getBackgroundPage: function () { return backgroundPageMock; },
}); });
global.chrome = {
    runtime: {
        sendMessage: jest.fn(),
        onMessage: {
            addListener: jest.fn(),
            removeListener: jest.fn(),
        },
    },
    extension: {
        sendRequest: jest.fn(),
    },
};
var mockCheckStatus = function (response) {
    global.chrome.runtime.sendMessage.mockImplementation(function (msg, callback) {
        if (msg.command === 'check_status') {
            callback(response);
        }
    });
};
var queryAllButtons = function (c) {
    return {
        stop: c.querySelector('#stop'),
        pause: c.querySelector('#pause'),
        resume: c.querySelector('#resume'),
    };
};
var container;
beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
});
afterEach(function () {
    react_dom_1.unmountComponentAtNode(container);
    container.remove();
    container = null;
});
test('Paused state', function () {
    mockCheckStatus({ recording: 'pause' });
    test_utils_1.act(function () {
        react_dom_1.render(react_1.default.createElement(transaction_controls_1.default, null), container);
    });
    var _a = queryAllButtons(container), stop = _a.stop, pause = _a.pause, resume = _a.resume;
    expect(stop).toBeDefined();
    expect(pause).toBeNull();
    expect(resume).toBeDefined();
    test_utils_1.act(function () {
        resume.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(backgroundPageMock.mixpanelTrack).toHaveBeenCalledWith('CE Start Recording');
    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ command: 'resume_recording' }, expect.any(Function));
    expect(global.chrome.extension.sendRequest).toHaveBeenCalledWith({ type: 'start_traffic' }, expect.any(Function));
});
test('Record state', function () {
    mockCheckStatus({ recording: 'record' });
    test_utils_1.act(function () {
        react_dom_1.render(react_1.default.createElement(transaction_controls_1.default, null), container);
    });
    var _a = queryAllButtons(container), stop = _a.stop, pause = _a.pause, resume = _a.resume;
    expect(stop).toBeDefined();
    expect(pause).toBeDefined();
    expect(resume).toBeNull();
    test_utils_1.act(function () {
        pause.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(backgroundPageMock.mixpanelTrack).toHaveBeenCalledWith('CE Pause Recording');
    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ command: 'pause_recording' }, expect.any(Function));
    expect(global.chrome.extension.sendRequest).toHaveBeenCalledWith({ type: 'pause_traffic' }, expect.any(Function));
    test_utils_1.act(function () {
        stop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ command: 'stop_recording' }, expect.any(Function));
    expect(global.chrome.extension.sendRequest).toHaveBeenCalledWith({ type: 'stop_traffic' }, expect.any(Function));
});
test('Stopped state', function () {
    mockCheckStatus({ recording: 'stopped' });
    test_utils_1.act(function () {
        react_dom_1.render(react_1.default.createElement(transaction_controls_1.default, null), container);
    });
    var _a = queryAllButtons(container), stop = _a.stop, pause = _a.pause, resume = _a.resume;
    expect(stop).toBeNull();
    expect(pause).toBeNull();
    expect(resume).toBeNull();
});
test('Listener', function () {
    mockCheckStatus({ recording: 'pause' });
    var registeredListener;
    global.chrome.runtime.onMessage.addListener.mockImplementation(function (listener) {
        registeredListener = listener;
    });
    test_utils_1.act(function () {
        react_dom_1.render(react_1.default.createElement(transaction_controls_1.default, null), container);
    });
    test_utils_1.act(function () {
        registeredListener({ command: 'recorderNotification', observable: { recording: 'stopped' } });
    });
    {
        var _a = queryAllButtons(container), stop_1 = _a.stop, pause = _a.pause, resume = _a.resume;
        expect(stop_1).toBeNull();
        expect(pause).toBeNull();
        expect(resume).toBeNull();
    }
});
//# sourceMappingURL=transaction-controls.spec.js.map