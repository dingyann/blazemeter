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
function getMappings() {
    return {
        click: 'clickBy:s',
        type: 'typeBy:sv',
        sendKeys: 'keysBy:sk',
        assertText: 'assertTextBy:sv',
        assertValue: 'assertValueBy:sv',
        assertTitle: 'assertTitle:t',
        doubleClick: 'doubleClickBy:s',
        mouseDownAt: 'mouseDownBy:s',
        mouseMoveAt: 'mouseMoveBy:s',
        mouseUpAt: 'mouseUpBy:s',
        select: 'selectBy:sv',
        storeText: 'storeTextBy:sv',
        storeTitle: 'storeTitle:v',
        storeValue: 'storeValueBy:sv',
        store: 'storeString:sv',
        submit: 'submitBy:s',
        runScript: 'scriptEval:t',
        close: 'closeWindow:t',
        dragAndDropToObject: 'dragBy:sv',
        echo: 'echoString:t',
        editContent: 'editContentBy:sv',
        selectFrame: 'switchFrame:t',
        selectWindow: 'switchWindow:t',
        pause: 'pauseFor:v',
        mouseOver: 'mouseOver:s',
        mouseOut: 'mouseOut:s',
        answerDialog: 'answerDialog:sv',
        assertDialog: 'assertDialog:sv',
        storeEval: 'storeEval:sv',
        assertEval: 'storeEval:t',
        waitFor: 'waitFor:sv',
    };
}
function getSelectors() {
    return {
        'name=': 'Name',
        'link=': 'LinkText',
        'id=': 'ID',
        'css=': 'CSS',
        '//': 'XPath',
        'xpath=': 'XPath',
        'shadow=': 'shadow',
    };
}
function mapArdCommand(testCommand) {
    var _a, _b;
    var actionsMap = getMappings();
    var selectorsMap = getSelectors();
    // TODO: Implement it better way...
    if (testCommand.command === 'clickAt') {
        testCommand.command = 'click';
    }
    else if (testCommand.command === 'doubleClickAt') {
        testCommand.command = 'doubleClick';
    }
    if (testCommand.command === 'open') {
        return { type: 'go', param: testCommand.target };
    }
    if (testCommand.command === 'openWindow') {
        return { type: 'openWindow', param: testCommand.target };
    }
    if (testCommand.command === 'resizeWindow') {
        return { type: 'resizeWindow', param: testCommand.value };
    }
    if (testCommand.command === 'maximizeWindow') {
        return { type: 'maximizeWindow' };
    }
    if (testCommand.command === 'store') {
        return { type: 'storeString', param: testCommand.target, value: testCommand.value };
    }
    if (testCommand.command === 'answerDialog') {
        return { type: 'answerDialog', param: testCommand.target, value: testCommand.value };
    }
    if (testCommand.command === 'assertDialog') {
        return { type: 'assertDialog', param: testCommand.target, value: testCommand.value };
    }
    if (testCommand.command === 'storeEval') {
        return { type: 'storeEval', param: testCommand.value, value: testCommand.target };
    }
    if (testCommand.command === 'assertEval') {
        return { type: 'assertEval', param: testCommand.target, value: testCommand.value };
    }
    if (testCommand.command in actionsMap) {
        var _c = actionsMap[testCommand.command].split(':'), cmd = _c[0], flags = _c[1];
        if (cmd.endsWith('By')) {
            cmd = cmd.slice(0, -2);
        }
        var action = { type: cmd };
        if (flags[0] === 's') {
            var key = testCommand.command === 'dragAndDropToObject' ? 'source' : 'locators';
            action[key] = [];
            var targetOptions = Array.isArray(testCommand.targetOptions) ? testCommand.targetOptions : [];
            var targets = [testCommand.target].concat(targetOptions.map(function (x) { return x[0]; }));
            var dedupedTargets = Array.from(new Set(targets));
            for (var _i = 0, dedupedTargets_1 = dedupedTargets; _i < dedupedTargets_1.length; _i++) {
                var target = dedupedTargets_1[_i];
                for (var _d = 0, _e = Object.keys(selectorsMap); _d < _e.length; _d++) {
                    var selector = _e[_d];
                    if (target.startsWith(selector)) {
                        var selectorName = selectorsMap[selector];
                        var selectorValue = selector === '//'
                            ? target.trim()
                            : target.replace(selector, '').trim();
                        action[key].push((_a = {}, _a[selectorName] = selectorValue, _a));
                        break;
                    }
                }
            }
            if (flags[1] === 'v') {
                var commandValue = testCommand.value.trim();
                if (testCommand.command === 'select') {
                    action.param = commandValue.replace('label=', '');
                }
                else if (testCommand.command === 'dragAndDropToObject') {
                    var key_1 = 'target';
                    action[key_1] = [];
                    for (var _f = 0, _g = Object.keys(selectorsMap); _f < _g.length; _f++) {
                        var selector = _g[_f];
                        if (commandValue.startsWith(selector)) {
                            var selectorName = selectorsMap[selector];
                            var selectorValue = selector === '//'
                                ? commandValue.trim()
                                : commandValue.replace(selector, '').trim();
                            action[key_1].push((_b = {}, _b[selectorName] = selectorValue, _b));
                            break;
                        }
                    }
                }
                else if (testCommand.command === 'waitFor') {
                    var _h = commandValue.split(':', 2), condition = _h[0], timeout = _h[1];
                    timeout = timeout || '10000';
                    action.value = timeout;
                    action.param = condition;
                }
                else {
                    action.param = commandValue;
                }
            }
            else if (flags[1] === 'k') {
                action.param = testCommand.value.replace('${', '').replace('}', '').trim();
            }
        }
        else if (flags[0] === 't') {
            action.param = testCommand.target.trim();
        }
        else if (flags[0] === 'v') {
            action.param = testCommand.value.trim();
            if (cmd === 'pauseFor') {
                action.param += 'ms';
            }
        }
        if (testCommand.attributes) {
            action.metadata = __assign({}, testCommand.attributes);
        }
        return action;
    }
    else {
        var cmd = testCommand.command;
        var target = JSON.stringify(testCommand.target)
            .replace(/\r\n|\r|\n/g, '\\n')
            .trim();
        var value = JSON.stringify(testCommand.value)
            .replace(/\r\n|\r|\n/g, '\\n')
            .trim();
        return { type: "# WARN: Command Not yet supported. ('" + cmd + ":" + target + ":" + value + "')" };
    }
}
function ln(line) {
    return '\r\n' + line;
}
function needEscapingQuotes(value) {
    var colonExists = value.search(/:/g) >= 0;
    var singleQuoteExists = value.search(/'/g) >= 0;
    var startsWithHash = value.startsWith('#');
    return !singleQuoteExists && (startsWithHash || colonExists);
}
// noinspection JSUnusedLocalSymbols
function getCombinedYaml() {
    return new Promise(function (resolve) {
        getYamlJmeter().then(function (yaml) {
            var seleniumRecorder = getRecorder({});
            var suite = seleniumRecorder.currentSuite;
            getSuiteYAML(suite).then(function (SuiteYAML) {
                var partsSelenium = SuiteYAML.split('scenarios:');
                // remove iteration option as it redundant in combine file
                var withoutIteration = partsSelenium[0].replace('iterations: 1', '');
                var formatFirstPartSelenium = $.trim(withoutIteration);
                chrome.storage.local.get('record_name', function (item) {
                    var recordName = item.record_name;
                    var httpPart = yaml.split(recordName + ':');
                    if (httpPart.length === 1) {
                        httpPart = yaml.split("'" + recordName + "':");
                    }
                    var nameScenarioJmeter = getJmeterScenarioName();
                    var combinedYamlText = ln(formatFirstPartSelenium) +
                        ln('  hold-for: 20m') +
                        ln('') +
                        ln('- executor: jmeter') +
                        ln("  scenario: " + nameScenarioJmeter) +
                        ln('  concurrency: 20') +
                        ln('  ramp-up: 1m') +
                        ln('  hold-for: 19m') +
                        ln('') +
                        ln("scenarios:" + partsSelenium[1]) +
                        ln('') +
                        ln("  " + nameScenarioJmeter + ":" + httpPart[1]);
                    var blob = new Blob([combinedYamlText], { type: 'text/yaml' });
                    resolve(blob);
                });
            });
        });
    });
}
function getYamlJmeter() {
    return new Promise(function (resolve) {
        var emptyTransactionsCount = 0;
        var requests = Object.values(traffic).sort(function (r1, r2) { return r1.timestamp - r2.timestamp; });
        chrome.storage.local.get(['concurrency', 'record_name', 'options', 'transactions'], function (item) {
            var _a;
            var name = item.record_name;
            var yamlObj = {
                execution: [{
                        scenario: name,
                        concurrency: 20,
                        'ramp-up': '1m',
                        'hold-for': '19m'
                    }],
                scenarios: (_a = {},
                    _a[name] = {
                        headers: {},
                        requests: []
                    },
                    _a)
            };
            if (item.options.edit_transaction_labels) {
                var transactionRequests = yamlObj.scenarios[name].requests;
            }
            else {
                var scenarioRequests = yamlObj.scenarios[name].requests;
            }
            var globalHeaders = yamlObj.scenarios[name].headers;
            var pl = /\+/g;
            var search = /([^&=]+)=?([^&]*)/g;
            var decode = function (s) {
                return decodeURIComponent(s.replace(pl, ' '));
            };
            var previousTransactionKey = -1;
            var delay = 0;
            requests.forEach(function (request, index) {
                var scenarioReq = {
                    url: request.url,
                    method: request.method,
                    label: request.label
                };
                if (request.assertions) {
                    scenarioReq.assert = [];
                    request.assertions.forEach(function (assertion) {
                        var assertionType = assertion.testField === 'responseCode' ? 'http-code' : 'body';
                        scenarioReq.assert.push({
                            'assume-success': false,
                            'contains': [assertion.testStrings[0]],
                            'not': false,
                            'regexp': false,
                            'subject': assertionType
                        });
                    });
                }
                //Add think-times
                if (request.request_type === 'top_level') {
                    if (index > 0) {
                        delay = request.timestamp - requests[index - 1].timestamp;
                    }
                    scenarioReq['think-time'] = delay + 'ms';
                }
                if (request.headers && request.headers.length) {
                    scenarioReq.headers = {};
                    request.headers.forEach(function (header) {
                        scenarioReq.headers[header.name] = header.value;
                    });
                    if (index === 0) {
                        Object.assign(globalHeaders, scenarioReq.headers);
                    }
                    else {
                        Object.keys(globalHeaders).forEach(function (header) {
                            if (scenarioReq.headers[header] !== globalHeaders[header]) {
                                delete globalHeaders[header];
                            }
                        });
                    }
                }
                if (request.body) {
                    var body = request.body;
                    if (Array.isArray(body)) {
                        body = body.join('');
                    }
                    scenarioReq.body = body;
                }
                else if (request.method == 'GET' && /\?/.test(request.url)) {
                    var baseUrl = request.url.split('?')[0];
                    var query = request.url.split('?')[1];
                    var match = void 0;
                    scenarioReq.body = {};
                    scenarioReq.url = baseUrl;
                    scenarioReq.label = baseUrl;
                    while ((match = search.exec(query))) {
                        scenarioReq.body[decode(match[1])] = decode(match[2]);
                    }
                }
                //TransactionController
                if (item.options.edit_transaction_labels) {
                    if (request.transaction_key > previousTransactionKey) {
                        if (request.transaction_key - previousTransactionKey > 1) {
                            emptyTransactionsCount += (request.transaction_key - previousTransactionKey) - 1;
                        }
                        previousTransactionKey = request.transaction_key;
                        var transactionObject = {
                            transaction: item.transactions[request.transaction_key].name,
                            'force-parent-sample': false,
                            'do': [scenarioReq]
                        };
                        transactionRequests.push(transactionObject);
                    }
                    else {
                        transactionRequests[request.transaction_key - emptyTransactionsCount].do.push(scenarioReq);
                    }
                }
                else {
                    scenarioRequests.push(scenarioReq);
                }
            });
            if (item.options.edit_transaction_labels) {
                transactionRequests.forEach(function (trequest) {
                    trequest.do.forEach(function (request) {
                        Object.keys(globalHeaders).forEach(function (header) {
                            delete request.headers[header];
                        });
                    });
                });
            }
            else {
                scenarioRequests.forEach(function (request) {
                    Object.keys(globalHeaders).forEach(function (header) {
                        delete request.headers[header];
                    });
                });
            }
            var yaml = jsyaml.dump(yamlObj).replace(/\r?\n/g, '\r\n');
            var output = ln('# Script generated by Blazemeter Chrome Extension') + ln('') + ln(yaml);
            resolve(output);
        });
    });
}
// noinspection JSUnusedLocalSymbols
function getYamlJmeterFunctionalTest() {
    return new Promise(function (resolve) {
        var _a;
        var requests = Object.values(traffic).sort(function (r1, r2) { return r1.timestamp - r2.timestamp; });
        var name = getJmeterScenarioName();
        var yamlObj = {
            execution: [
                {
                    scenario: name
                }
            ],
            scenarios: (_a = {},
                _a[name] = {
                    headers: {},
                    requests: []
                },
                _a)
        };
        var scenarioRequests = yamlObj.scenarios[name].requests;
        var globalHeaders = yamlObj.scenarios[name].headers;
        var pl = /\+/g;
        var search = /([^&=]+)=?([^&]*)/g;
        var decode = function (s) {
            return decodeURIComponent(s.replace(pl, ' '));
        };
        var delay = 0;
        requests.forEach(function (request, index) {
            var scenarioReq = {
                url: request.url,
                method: request.method,
                label: request.label
            };
            //Add think-times
            if (request.request_type === 'top_level') {
                if (index > 0) {
                    delay = request.timestamp - requests[index - 1].timestamp;
                }
                scenarioReq['think-time'] = delay + 'ms';
            }
            if (request.headers && request.headers.length) {
                scenarioReq.headers = {};
                request.headers.forEach(function (header) {
                    scenarioReq.headers[header.name] = header.value;
                });
                if (index === 0) {
                    Object.assign(globalHeaders, scenarioReq.headers);
                }
                else {
                    Object.keys(globalHeaders).forEach(function (header) {
                        if (scenarioReq.headers[header] !== globalHeaders[header]) {
                            delete globalHeaders[header];
                        }
                    });
                }
            }
            if (request.body) {
                var body = request.body;
                if (Array.isArray(body)) {
                    body = body.join('');
                }
                scenarioReq.body = body;
            }
            else if (request.method == 'GET' && /\?/.test(request.url)) {
                var baseUrl = request.url.split('?')[0];
                var query = request.url.split('?')[1];
                var match = void 0;
                scenarioReq.body = {};
                scenarioReq.label = baseUrl;
                while ((match = search.exec(query))) {
                    scenarioReq.body[decode(match[1])] = decode(match[2]);
                }
            }
            if (request.method == 'POST' && /\?/.test(request.url)) {
                var baseUrl = request.url.split('?')[0];
                scenarioReq.label = baseUrl;
            }
            scenarioRequests.push(scenarioReq);
        });
        scenarioRequests.forEach(function (request) {
            Object.keys(globalHeaders).forEach(function (header) {
                delete request.headers[header];
            });
        });
        var yaml = jsyaml.dump(yamlObj);
        resolve(yaml);
    });
}
function mapBlazemeterCommand(command_obj) {
    var mapping_actions = getMappings();
    var mapping_selectors = getSelectors();
    var output = '';
    if (command_obj.command == 'open') {
        //Do nothing, open command is handled few lines top
        output += ln('      - go(' + command_obj.target + ')');
    }
    else if (command_obj.command == 'openWindow') {
        output += ln('      - openWindow(' + command_obj.target + ')');
    }
    else if (command_obj.command === 'resizeWindow') {
        output += ln('      - resizeWindow(' + command_obj.value + ')');
    }
    else if (command_obj.command === 'maximizeWindow') {
        output += ln('      - maximizeWindow()');
    }
    else if (command_obj.command == 'store') {
        output += ln('      - storeString(' + command_obj.target + '): ' + command_obj.value);
    }
    else if (command_obj.command in mapping_actions) {
        var found_selector = false;
        var mapped_command = mapping_actions[command_obj.command].split(':');
        if (mapped_command[1][0] == 's') {
            for (var bysel in mapping_selectors) {
                if (command_obj.target.startsWith(bysel.trim())) {
                    found_selector = true;
                    if (bysel.indexOf('=') >= 0) {
                        if (needEscapingQuotes(command_obj.target)) {
                            output += ln('      - ' + '\'' + mapped_command[0] + mapping_selectors[bysel] + '(' + command_obj.target.replace(bysel, '').trim() + ')' + '\'');
                        }
                        else {
                            output += ln('      - ' + mapped_command[0] + mapping_selectors[bysel] + '(' + command_obj.target.replace(bysel, '').trim() + ')');
                        }
                    }
                    else {
                        if (needEscapingQuotes(command_obj.target)) {
                            output += ln('      - ' + '\'' + mapped_command[0] + mapping_selectors[bysel] + '(' + command_obj.target.trim() + ')' + '\'');
                        }
                        else {
                            output += ln('      - ' + mapped_command[0] + mapping_selectors[bysel] + '(' + command_obj.target.trim() + ')');
                        }
                    }
                    if (mapped_command.length == 2 && mapped_command[1][1] == 'v') {
                        var command_value = command_obj.value.replace(/\\/g, '\\\\');
                        command_value = command_value.replace(/"/g, '\\\"');
                        command_value = command_value.trim().replace(/\r\n|\r|\n/g, '\\' + 'n');
                        if (command_obj.command == 'select') {
                            command_value = command_value.replace('label=', '');
                            output += ': ' + '"' + command_value + '"';
                        }
                        else if (command_obj.command == 'dragAndDropToObject') {
                            for (var sel in mapping_selectors) {
                                if (command_value.startsWith(sel.trim())) {
                                    command_value = 'elementBy' + mapping_selectors[sel] + '(' + command_value.replace(sel, '').trim() + ')';
                                }
                            }
                            output += ': ' + command_value;
                        }
                        else {
                            output += ': ' + '"' + command_value + '"';
                        }
                    }
                    else if (mapped_command.length == 2 && mapped_command[1][1] == 'k') {
                        output += ': ' + command_obj.value.replace('${', '').replace('}', '').trim().replace(/\r\n|\r|\n/g, '\\' + 'n');
                    }
                }
            }
        }
        else if (mapped_command[1] == 't') {
            found_selector = true;
            if (needEscapingQuotes(command_obj.target)) {
                output += ln('      - ' + '\'' + mapped_command[0] + '(' + command_obj.target.trim() + ')' + '\'');
            }
            else {
                output += ln('      - ' + mapped_command[0] + '(' + command_obj.target.trim() + ')');
            }
        }
        else if (mapped_command[1] == 'v') {
            found_selector = true;
            var command_value = command_obj.value.replace(/\\/g, '\\\\');
            command_value = command_value.replace(/"/g, '\\\"');
            command_value = command_value.trim().replace(/\r\n|\r|\n/g, '\\' + 'n');
            if (mapped_command[0] == 'pauseFor') {
                output += ln('      - ' + mapped_command[0] + '(' + command_value + 's)');
            }
            else {
                output += ln('      - ' + mapped_command[0] + '()');
                output += ': ' + '"' + command_value + '"';
            }
        }
        if (!found_selector) {
            output += ln('      # WARN: Selector Not yet supported. (\'' + command_obj.command + ':' + command_obj.target.trim() + ')\'');
        }
    }
    else {
        output += ln('      # WARN: Command Not yet supported. (\'' + command_obj.command + ':' + JSON.stringify(command_obj.target).replace(/\r\n|\r|\n/g, '\\n').trim() + ':' + JSON.stringify(command_obj.value).replace(/\r\n|\r|\n/g, '\\n').trim() + '\')');
    }
    return output;
}
function getExtendedYAML(suite) {
    var _a;
    var scenarioName = getSeleniumScenarioName();
    var model = {
        modules: {
            nose: {
                'ignore-unknown-actions': true,
            },
        },
        execution: [
            {
                executor: 'selenium',
                scenario: scenarioName,
                blazegrid: true,
                iterations: 1,
                capabilities: {
                    browserName: 'chrome',
                },
            },
        ],
        scenarios: (_a = {},
            _a[scenarioName] = {
                'generate-flow-markers': true,
                'headless': false,
                'timeout': '60s',
                'think-time': '0s',
                'requests': suite.test_cases.map(function (x) { return ({
                    label: x.testStep,
                    actions: x.commands.map(function (c) { return mapArdCommand(c); }),
                }); }),
            },
            _a),
    };
    var yaml = jsyaml.safeDump(model, { noArrayIndent: true });
    // Unfortunately, serializer doesn't handle adding comment to the output,
    // so we need this monkey-patching of strings.
    var unsupportedRegex = /(\s+)- type:\s"(# WARN:.+)"/g;
    var result = ln('# Script generated by Blazemeter Chrome Extension') +
        ln('') +
        ln(yaml.replace(unsupportedRegex, '$1$2'));
    return Promise.resolve(result);
}
function getSuiteYAML(s_suite, extended) {
    var suite_pre_json = JSON.stringify(s_suite);
    var suite_json = JSON.parse(suite_pre_json);
    if (extended) {
        return getExtendedYAML(suite_json);
    }
    var browser_headless = 'false';
    var scenario_timeout = '60';
    var scenario_thinktime = '0';
    var seleniumScenarioName = getSeleniumScenarioName();
    var output = '';
    // Selenium
    output += ln('# Script generated by Blazemeter Chrome Extension');
    output += ln('');
    // Selenium logic
    output += ln('modules:');
    output += ln('  nose:');
    output += ln('    ignore-unknown-actions: true');
    output += ln('');
    // Execution
    output += ln('execution:');
    output += ln('- executor: selenium');
    output += ln('  scenario: ' + seleniumScenarioName);
    output += ln('  blazegrid: true');
    output += ln('  iterations: 1');
    output += ln('  capabilities: ');
    output += ln('    browserName: chrome');
    output += ln('');
    output += ln('scenarios:');
    output += ln('  ' + seleniumScenarioName + ':');
    output += ln('    generate-flow-markers: true ');
    output += ln('    headless: ' + browser_headless);
    output += ln('    timeout: ' + scenario_timeout + 's');
    output += ln('    think-time: ' + scenario_thinktime + 's');
    output += ln('    requests:');
    return new Promise(function (resolve) {
        chrome.storage.local.get(null, function (items) {
            for (var _i = 0, _a = suite_json.test_cases; _i < _a.length; _i++) {
                var test_case_obj = _a[_i];
                if (test_case_obj.commands.length === 0) {
                    continue;
                }
                if (test_case_obj.testStep.match(/:/g)) {
                    output += ln('    - label: ' + '\'' + test_case_obj.testStep + '\'');
                }
                else {
                    output += ln('    - label: ' + test_case_obj.testStep);
                }
                output += ln('      actions:');
                for (var _b = 0, _c = test_case_obj.commands; _b < _c.length; _b++) {
                    var command_obj = _c[_b];
                    output += mapBlazemeterCommand(command_obj);
                }
            }
            resolve(output);
        });
    });
}
//# sourceMappingURL=generate-yaml.js.map