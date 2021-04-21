"use strict";
function formatDownloadName(name) {
    while (name.indexOf('/') > 0) {
        name = name.replace('/', '-');
    }
    while (name.indexOf(':') > 0) {
        name = name.replace(':', '-');
    }
    return name;
}
function replaceWhiteSpacesWithUnderscore(str) {
    return str.replace(/\s+/g, '_');
}
function getSuiteName() {
    return cRecorder.currentSuite.suite_name;
}
function removeIdFromString(str) {
    return str.replace(/\s\(id:.*/, '');
}
function removeRecordWordFromString(str) {
    return str.replace(/^RECORD\s/, '');
}
function checkForDefaultTestName(name) {
    var defaultSuiteName = cRecorder.defaultTestName;
    return name === defaultSuiteName;
}
function convertToSlug(str) {
    return str.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '-').replace(/\s+/g, '-');
}
function getNameCombinedJmeterSeleniumFile() {
    var name = getSuiteName();
    name = removeIdFromString(name);
    name = replaceWhiteSpacesWithUnderscore(name);
    name = formatDownloadName(name) + '-Combined-JMeter-and-Selenium.yaml';
    return name;
}
function getNameSeleniumFile(fileFormat, libName) {
    if (fileFormat === void 0) { fileFormat = 'yaml'; }
    if (libName === void 0) { libName = ''; }
    var name = getSuiteName();
    name = removeIdFromString(name);
    name = replaceWhiteSpacesWithUnderscore(name);
    var selenium = libName ? 'Selenium-' : 'Selenium';
    name = formatDownloadName(name) + ("-" + selenium + libName + "." + fileFormat);
    return name;
}
function getNameJmeterFile() {
    var name = getSuiteName();
    name = removeIdFromString(name);
    name = replaceWhiteSpacesWithUnderscore(name);
    name = convertToSlug(name) + '.jmx';
    return name;
}
function getSeleniumScenarioName() {
    var name = getSuiteName();
    name = removeIdFromString(name);
    return name + '-Selenium';
}
function getJmeterScenarioName() {
    var name = getSuiteName();
    name = removeIdFromString(name);
    return name + '-Http';
}
function getNameCombinedJmeterSeleniumTest(recordName) {
    var name = getSuiteName();
    if (recordName !== name) {
        return recordName;
    }
    name = removeIdFromString(name);
    var isDefaultName = checkForDefaultTestName(name);
    if (isDefaultName) {
        name = removeRecordWordFromString(name);
        name = 'EUX Test recorded with Chrome Extension ' + name;
    }
    return name;
}
function getNameSeleniumTest(recordName) {
    var name = getSuiteName();
    if (recordName !== name) {
        return recordName;
    }
    name = removeIdFromString(name);
    var isDefaultName = checkForDefaultTestName(name);
    if (isDefaultName) {
        name = removeRecordWordFromString(name);
        name = 'GUI Functional Test recorded with Chrome Extension ' + name;
    }
    return name;
}
function getNameJmeterTest(recordName) {
    var name = getSuiteName();
    if (recordName !== name) {
        return recordName;
    }
    name = removeIdFromString(name);
    var isDefaultName = checkForDefaultTestName(name);
    if (isDefaultName) {
        name = removeRecordWordFromString(name);
        name = 'Performance Test recorded with Chrome Extension ' + name;
    }
    return name;
}
function getNameFunctionalTest(recordName) {
    var name = getSuiteName();
    if (recordName !== name) {
        return recordName;
    }
    name = removeIdFromString(name);
    var isDefaultName = checkForDefaultTestName(name);
    if (isDefaultName) {
        name = removeRecordWordFromString(name);
        name = 'API Functional Test recorded with Chrome Extension ' + name;
    }
    return name;
}
//# sourceMappingURL=files-names-formats.js.map