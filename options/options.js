"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_hook_form_1 = require("react-hook-form");
var webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
var url_utils_1 = require("../common/url-utils");
var header_1 = __importDefault(require("./header"));
var helpers_1 = require("./helpers");
var hooks_1 = require("./hooks");
var messages_1 = require("./messages");
var sub_header_1 = __importDefault(require("./sub-header"));
var Options = function () {
    var _a = hooks_1.useNotifications(), showNotification = _a.showNotification, component = _a.component;
    var _b = react_hook_form_1.useForm(), register = _b.register, watch = _b.watch, handleSubmit = _b.handleSubmit, resetForm = _b.reset, errors = _b.errors;
    var customServer = watch('custom_server');
    var customArd = watch('custom_ard');
    var onSubmit = function (data) {
        helpers_1.saveSettings(data)
            .then(resetForm)
            .then(function () { return webextension_polyfill_ts_1.browser.runtime.sendMessage({ op: 'reloadoptions' }); })
            .then(function () { return showNotification(messages_1.MESSAGE_SETTINGS_SAVED, 'success'); });
    };
    var onReset = function () {
        if (confirm(messages_1.CONFIRM_RESET_VALUES)) {
            helpers_1.resetSettings()
                .then(resetForm)
                .then(function () { return webextension_polyfill_ts_1.browser.runtime.sendMessage({ op: 'reloadoptions' }); })
                .then(function () { return showNotification(messages_1.MESSAGE_SETTINGS_RESET, 'success'); });
        }
    };
    react_1.useEffect(function () {
        helpers_1.loadSettings().then(resetForm);
    }, []);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        component,
        react_1.default.createElement(header_1.default, null),
        react_1.default.createElement(sub_header_1.default, null),
        react_1.default.createElement("form", { className: 'boxes', onSubmit: handleSubmit(onSubmit) },
            react_1.default.createElement("div", { className: 'form-group' },
                react_1.default.createElement("input", { type: 'checkbox', id: 'debug', name: 'debug', ref: register }),
                react_1.default.createElement("label", { className: 'checkbox', htmlFor: 'debug' },
                    react_1.default.createElement("span", null, "Enable Debug mode"))),
            react_1.default.createElement("div", { className: 'form-group' },
                react_1.default.createElement("input", { type: 'checkbox', id: 'custom_server', name: 'custom_server', ref: register }),
                react_1.default.createElement("label", { className: 'checkbox', htmlFor: 'custom_server' },
                    "Custom Server URL ",
                    customServer && react_1.default.createElement("span", { className: 'required' }, "*"))),
            customServer && (react_1.default.createElement("div", { className: 'form-group' },
                react_1.default.createElement("input", { type: 'text', className: errors.server && 'has-error', id: 'server', name: 'server', ref: register({ validate: function (x) { return url_utils_1.validUrl(x); } }) }),
                errors.server && react_1.default.createElement("p", null, messages_1.ERROR_SPECIFY_VALID_URL))),
            react_1.default.createElement("div", { className: 'form-group' },
                react_1.default.createElement("input", { type: 'checkbox', id: 'custom_ard', name: 'custom_ard', ref: register }),
                react_1.default.createElement("label", { className: 'checkbox', htmlFor: 'custom_ard' },
                    "Custom ARD URL ",
                    customArd && react_1.default.createElement("span", { className: 'required' }, "*"))),
            customArd && (react_1.default.createElement("div", { className: 'form-group' },
                react_1.default.createElement("input", { className: errors.ard_url && 'has-error', type: 'text', id: 'ard_url', name: 'ard_url', ref: register({
                        validate: function (x) { return url_utils_1.validUrl(x); },
                    }) }),
                errors.ard_url && react_1.default.createElement("p", null, messages_1.ERROR_SPECIFY_VALID_URL))),
            react_1.default.createElement("div", { className: 'form-group' },
                react_1.default.createElement("label", { htmlFor: 'serverJMX' },
                    "Server Converter ",
                    react_1.default.createElement("span", { className: 'required' }, "*")),
                react_1.default.createElement("br", null),
                react_1.default.createElement("input", { className: errors.serverJMX && 'has-error', style: { marginTop: '.5rem' }, type: 'text', id: 'serverJMX', name: 'serverJMX', ref: register({ validate: function (x) { return url_utils_1.validUrl(x); } }) }),
                errors.serverJMX && react_1.default.createElement("p", null, messages_1.ERROR_SPECIFY_VALID_URL)),
            react_1.default.createElement("button", { type: 'submit', className: 'btn btn-primary mr-1' }, "Save"),
            react_1.default.createElement("button", { type: 'button', className: 'btn btn-primary', onClick: onReset }, "Reset"))));
};
exports.default = Options;
//# sourceMappingURL=options.js.map