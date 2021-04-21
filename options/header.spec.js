"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_dom_1 = require("react-dom");
var test_utils_1 = require("react-dom/test-utils");
var header_1 = __importDefault(require("./header"));
var container;
beforeEach(function () {
    container = document.createElement('div');
    document.body.append(container);
});
afterEach(function () {
    react_dom_1.unmountComponentAtNode(container);
    container.remove();
    container = null;
});
test('Close button should close the page', function () {
    var spy = jest.spyOn(window, 'close').mockImplementation(function () { return undefined; });
    test_utils_1.act(function () {
        react_dom_1.render(react_1.default.createElement(header_1.default, null), container);
    });
    var closeBtn = container.querySelector('.close-page');
    expect(closeBtn).toBeDefined();
    test_utils_1.act(function () {
        closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(spy).toHaveBeenCalled();
});
//# sourceMappingURL=header.spec.js.map