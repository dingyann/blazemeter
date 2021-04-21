export class CommandMapper {
    private actionsMap: {[key: string]: string} = {
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

    private conditions: {[key: string]: string} = {
        Present: 'present',
        NotPresent: 'not_present',
        Visible: 'visible',
        NotVisible: 'not_visible',
        Clickable: 'clickable',
        NotClickable: 'not_clickable',
    };

    private selectorsMap: {[key: string]: (_: string) => string} = {
        name: selector => 'name=' + selector,
        linktext: selector => 'link=' + selector,
        id: selector => 'id=' + selector,
        css: selector => 'css=' + selector,
        xpath: selector => (selector.startsWith('//') ? selector : 'xpath=' + selector),
        shadow: selector => 'shadow=' + selector,
    };

    public map(step: any) {
        const command = this.actionsMap[step.action];
        let value = step.value || step.param || '';

        let target = '';
        let targetOptions = [];

        if (step.action === 'keys') {
            value = '${' + value + '}';
        }

        if (step.action === 'waitFor') {
            const ec = this.conditions[step.param];
            value = `${ec}:${step.value * 1000}`;
        }

        if (step.action === 'drag') {
            targetOptions = this.populateTargets(step.source);

            if (step.target && step.target.length > 0) {
                const firstLocator = step.target[0];
                const type = firstLocator.name.toLowerCase();
                const selectorMapFn = this.selectorsMap[type];
                value = selectorMapFn(firstLocator.value);
            }
        } else {
            targetOptions = this.populateTargets(step.target);
        }

        if (targetOptions.length > 0) {
            target = targetOptions[0][0];
        }

        // Commands that expect plaintext value to be provided in target field
        const plainTargetActions = [
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

        return { command, value, target, targetOptions };
    }

    private populateTargets(locators: Array<{name: string, value: string}>) {
        if (!locators || locators.length === 0) {
            return [];
        }

        const result = [];

        for (const locator of locators) {
            const type = locator.name.toLowerCase();
            const selectorMapFn = this.selectorsMap[type];
            result.push([selectorMapFn(locator.value), type]);
        }
        return result;
    }
}
