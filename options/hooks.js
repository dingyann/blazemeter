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
var fade_1 = __importDefault(require("./fade"));
exports.useNotifications = function () {
    var _a = react_1.useState(null), notification = _a[0], setNotification = _a[1];
    var showNotification = function (message, type) {
        setNotification({ message: message, type: type, visible: true });
    };
    var hideNotification = function () { return setNotification(function (x) { return (__assign(__assign({}, x), { visible: false })); }); };
    var component = react_1.default.createElement(fade_1.default, { onClick: hideNotification, notification: notification });
    react_1.useEffect(function () {
        var timer = setTimeout(function () { return hideNotification(); }, 3000);
        return function () { return clearTimeout(timer); };
    }, [notification]);
    return {
        showNotification: showNotification,
        component: component,
    };
};
//# sourceMappingURL=hooks.js.map