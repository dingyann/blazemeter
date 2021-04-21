"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var extension_1 = require("../common/extension");
var TransactionControls = function () {
    var background = extension_1.getBackgroundPage();
    var _a = react_1.useState(''), recordingState = _a[0], setRecordingState = _a[1];
    react_1.useEffect(function () {
        chrome.runtime.sendMessage({ command: 'check_status' }, function (response) { return setRecordingState(response.recording); });
        function notificationListener(request) {
            switch (request.command) {
                case 'recorderNotification':
                    setRecordingState(request.observable.recording);
                    break;
            }
        }
        chrome.runtime.onMessage.addListener(notificationListener);
        return function () { return chrome.runtime.onMessage.removeListener(notificationListener); };
    }, []);
    var canStop = recordingState !== 'stopped';
    var canPause = recordingState === 'record';
    var canResume = recordingState === 'pause';
    var stopRecording = function () {
        chrome.runtime.sendMessage({ command: 'stop_recording' }, function () { });
        chrome.extension.sendRequest({ type: 'stop_traffic' }, function () { });
        background.functionalIconBlinkMode = true;
    };
    var resumeRecording = function () {
        background.mixpanelTrack('CE Start Recording');
        chrome.runtime.sendMessage({ command: 'resume_recording' }, function () { });
        chrome.extension.sendRequest({ type: 'start_traffic' }, function () { });
    };
    var pauseRecording = function () {
        background.mixpanelTrack('CE Pause Recording');
        chrome.runtime.sendMessage({ command: 'pause_recording' }, function () { });
        chrome.extension.sendRequest({ type: 'pause_traffic' }, function () { });
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        canStop &&
            react_1.default.createElement("div", { id: 'stop', className: 'button_container mar', onClick: stopRecording },
                react_1.default.createElement("input", { type: 'button', className: 'tooltip-btn button_style gray', title: 'Stop recording' }),
                react_1.default.createElement("i", { className: 'fa fa-stop font_style yellow_font' })),
        canPause &&
            react_1.default.createElement("div", { id: 'pause', className: 'button_container mar', onClick: pauseRecording },
                react_1.default.createElement("input", { type: 'button', className: 'tooltip-btn button_style gray', title: 'Pause recording' }),
                react_1.default.createElement("i", { className: 'fa fa-pause font_style dark_grey_font' })),
        canResume &&
            react_1.default.createElement("div", { id: 'resume', className: 'button_container mar', onClick: resumeRecording },
                react_1.default.createElement("input", { type: 'button', className: 'tooltip-btn button_style gray', title: 'Resume recording' }),
                react_1.default.createElement("i", { className: 'fa fa-circle font_style yellow_font' }))));
};
exports.default = TransactionControls;
//# sourceMappingURL=transaction-controls.js.map