"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommandMapper = /** @class */ (function () {
    function CommandMapper() {
        this.actionsMap = {
            click: 'clickAt',
            type: 'type',
            keys: 'sendKeys',
            assertText: 'assertText',
            assertValue: 'assertValue',
            assertTitle: 'assertTitle',
            doubleClick: 'doubleClick',
            mouseDown: 'mouseDownAt',
            mouseMove: 'mouseMoveAt',
            mouseUp: 'mouseUpAt',
            select: 'select',
            storeText: 'storeText',
            storeTitle: 'storeTitle',
            storeValue: 'storeValue',
            storeString: 'store',
            submit: 'submit',
            scriptEval: 'runScript',
            closeWindow: 'close',
            drag: 'dragAndDropToObject',
            echoString: 'echo',
            editContent: 'editContent',
            switchFrame: 'selectFrame',
            switchWindow: 'selectWindow',
            pauseFor: 'pause',
            go: 'open',
            openWindow: 'openWindow',
            resizeWindow: 'resizeWindow',
            maximizeWindow: 'maximizeWindow',
            waitFor: 'waitFor',
            answerDialog: 'answerDialog',
            assertDialog: 'assertDialog',
            storeEval: 'storeEval',
            assertEval: 'assertEval',
            mouseOver: 'mouseOver',
            mouseOut: 'mouseOut',
        };
        this.conditions = {
            Present: 'present',
            NotPresent: 'not_present',
            Visible: 'visible',
            NotVisible: 'not_visible',
            Clickable: 'clickable',
            NotClickable: 'not_clickable',
        };
        this.selectorsMap = {
            name: function (selector) { return 'name=' + selector; },
            linktext: function (selector) { return 'link=' + selector; },
            id: function (selector) { return 'id=' + selector; },
            css: function (selector) { return 'css=' + selector; },
            xpath: function (selector) { return (selector.startsWith('//') ? selector : 'xpath=' + selector); },
            shadow: function (selector) { return 'shadow=' + selector; },
        };
    }
    CommandMapper.prototype.map = function (step) {
        var command = this.actionsMap[step.action];
        var value = step.value || step.param || '';
        var target = '';
        var targetOptions = [];
        if (step.action === 'keys') {
            value = '${' + value + '}';
        }
        if (step.action === 'waitFor') {
            var ec = this.conditions[step.param];
            value = ec + ":" + step.value * 1000;
        }
        if (step.action === 'drag') {
            targetOptions = this.populateTargets(step.source);
            if (step.target && step.target.length > 0) {
                var firstLocator = step.target[0];
                var type = firstLocator.name.toLowerCase();
                var selectorMapFn = this.selectorsMap[type];
                value = selectorMapFn(firstLocator.value);
            }
        }
        else {
            targetOptions = this.populateTargets(step.target);
        }
        if (targetOptions.length > 0) {
            target = targetOptions[0][0];
        }
        // Commands that expect plaintext value to be provided in target field
        var plainTargetActions = [
            'open',
            'openWindow',
            'selectFrame',
            'assertTitle',
            'close',
            'selectWindow',
            'echo',
            'store',
            'runScript',
            'storeEval',
            'assertEval',
            'answerDialog',
            'assertDialog',
        ];
        if (plainTargetActions.includes(command)) {
            target = step.param;
        }
        return { command: command, value: value, target: target, targetOptions: targetOptions };
    };
    CommandMapper.prototype.populateTargets = function (locators) {
        if (!locators || locators.length === 0) {
            return [];
        }
        var result = [];
        for (var _i = 0, locators_1 = locators; _i < locators_1.length; _i++) {
            var locator = locators_1[_i];
            var type = locator.name.toLowerCase();
            var selectorMapFn = this.selectorsMap[type];
            result.push([selectorMapFn(locator.value), type]);
        }
        return result;
    };
    return CommandMapper;
}());
exports.CommandMapper = CommandMapper;
//# sourceMappingURL=bg-command-mapper.js.map