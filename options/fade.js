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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_transition_group_1 = require("react-transition-group");
var defaultStyle = {
    transition: "margin-left 500ms ease-in-out",
    marginLeft: 6000,
};
var transitionStyles = {
    entering: { marginLeft: 6000 },
    entered: { marginLeft: 0 },
    exiting: { marginLeft: 6000 },
    exited: { marginLeft: 6000 },
};
var Fade = function (_a) {
    var onClick = _a.onClick, notification = _a.notification;
    var makeStyle = function (state) { return (__assign(__assign({}, defaultStyle), transitionStyles[state])); };
    notification = notification || {
        message: '',
        type: 'success',
        visible: false,
    };
    var className = "msg " + notification.type;
    return (react_1.default.createElement(react_transition_group_1.Transition, { in: notification.visible, timeout: 0 }, function (state) { return (react_1.default.createElement("div", { className: className, style: makeStyle(state) },
        react_1.default.createElement("span", null, notification.message),
        react_1.default.createElement("div", { className: 'close', onClick: onClick }, "x"))); }));
};
exports.default = Fade;
//# sourceMappingURL=fade.js.map