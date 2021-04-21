"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var Header = function () {
    return (react_1.default.createElement("header", { className: 'header' },
        react_1.default.createElement("a", { href: '#', title: 'Go to dashboard', className: 'header-logo' }),
        react_1.default.createElement("button", { type: 'button', className: 'close-page btn btn-primary', onClick: window.close }, "Close")));
};
exports.default = Header;
//# sourceMappingURL=header.js.map