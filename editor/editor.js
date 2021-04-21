"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:only-arrow-functions */
require("./editor.scss");
var jsoneditor_1 = __importDefault(require("jsoneditor"));
var webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
var extension_1 = require("../common/extension");
var string_utils_1 = require("../common/string-utils");
var manifest = chrome.runtime.getManifest();
var isLogged = false;
var background = extension_1.getBackgroundPage();
$(function () {
    // TODO: now we always read from config.json, as currently we only have one GA account.
    // Therefore GA code from config_dynatrace.json will be ignored.
    $.getJSON(background.configFile).then(function (data) {
        background.googleAnalytics('create', data.GA_code, 'auto');
        background.googleAnalytics('set', 'checkProtocolTask', null);
    });
    $('.version').html(manifest.version);
    var container = $('#jsoneditor')[0];
    var editor = new jsoneditor_1.default(container);
    chrome.extension.sendRequest({ type: 'get_traffic' }, function (data) {
        if (data) {
            editor.set(JSON.parse(data));
        }
    });
    webextension_polyfill_ts_1.browser.storage.local.get(null).then(function (items) {
        chrome.extension.sendRequest({ type: 'get_logged' }, function (data) {
            if (!data) {
                return;
            }
            isLogged = data.logged;
            if (items.record_name) {
                $.elementName.val(items.record_name);
                $.enableBtn('export-json');
                $.enableBtn('export-taurus');
            }
            else {
                $.elementName.val('');
                $.disableBtn('export-json');
                $.disableBtn('export-taurus');
            }
            if (items.record_name && isLogged) {
                chrome.extension.sendRequest({ type: 'traffic_exists' }, function (exists) {
                    if (exists) {
                        $.enableBtn('button-upload-jmeter');
                        $.enableBtn('upload-jmx');
                        $.enableBtn('export-json');
                        $.enableBtn('export-taurus');
                    }
                    else {
                        $.disableBtn('button-upload-jmeter');
                        $.disableBtn('export-json');
                        $.disableBtn('export-taurus');
                        $.disableBtn('upload-jmx');
                    }
                });
            }
            else {
                $.disableBtn('button-upload-jmeter');
                $.disableBtn('upload-jmx');
            }
            if (!isLogged) {
                $('#button-upload-jmeter-off').attr('title', 'You must log in to upload and create a new test.');
            }
            background.googleAnalytics('set', 'dimension1', manifest.version);
            background.googleAnalytics('set', 'dimension2', items.theme);
            background.googleAnalytics('set', 'dimension3', items.server);
            background.googleAnalytics('send', 'pageview', 'editor.html');
        });
    });
    $.elementName.on('change', function () {
        background.mixpanelTrack('CE Editor Test Name Change', {
            Value: $(this).val(),
        });
    });
    $('.jsoneditor-search input').on('change', function () {
        background.mixpanelTrack('CE Editor Json Search');
    });
    // Save name on out of focus
    $.elementName.on('keyup', function () {
        background.localSave({
            record_name: $(this).val(),
            jmxname: $(this).val(),
        });
        chrome.extension.sendRequest({
            type: 'traffic_exists',
        }, function (exists) {
            if (exists) {
                if (string_utils_1.stringIsEmpty($.elementName.val())) {
                    $.disableBtn('button-upload-jmeter');
                    $.disableBtn('export-taurus');
                    $.disableBtn('export-json');
                    $.disableBtn('upload-jmx');
                }
                else {
                    if (!isLogged) {
                        $.disableBtn('button-upload-jmeter');
                        $.disableBtn('upload-jmx');
                        $('#button-upload-jmeter-off').attr('title', 'You must log in to upload and create a new test.');
                    }
                    else {
                        $.enableBtn('button-upload-jmeter');
                        $.enableBtn('upload-jmx');
                        $('#button-upload-jmeter-off').attr('title', 'Adjust test properties and run from the cloud.');
                    }
                    $.enableBtn('export-json');
                    $.enableBtn('export-taurus');
                }
            }
        });
    });
    $('.tooltip-btn').tooltip();
    $('.selectall').on('click', function () {
        $('.include-domains :checkbox').each(function () {
            this.checked = true;
        });
    });
    $('.unselectall').on('click', function () {
        $('.include-domains :checkbox').each(function () {
            this.checked = false;
        });
    });
    function adjustSubmitButton() {
        var windowHeight = $(window).height();
        var xPos = $('.include-domains').position().top;
        $('.include-domains').height(windowHeight - xPos - 250);
    }
    function closeEditorOverlay() {
        $('#jsoneditor').show();
        $.closeOverlay();
        $.cancelTest();
    }
    function closeExportOverlay() {
        $('#jsoneditor').show();
        $.closeOverlay();
    }
    $(window).on('resize', function () {
        adjustSubmitButton();
    });
    function uploadData() {
        background.mixpanelTrack('CE Editor Run Test');
        // $('#jsoneditor').hide();
        var traffic = checkAndChangeToExpectingTypesTraffic(editor.get());
        webextension_polyfill_ts_1.browser.runtime.sendMessage({ op: 'json', json: JSON.stringify(traffic) }).then(function () {
            chrome.extension.sendRequest({
                type: 'upload_traffic',
            });
        });
    }
    function checkAndChangeToExpectingTypesTraffic(traffic) {
        var keys = Object.keys(traffic);
        keys.forEach(function (key) {
            if (traffic[key].label && typeof traffic[key].label !== 'string') {
                traffic[key].label = String(traffic[key].label);
            }
            if (traffic[key].method && typeof traffic[key].method !== 'string') {
                traffic[key].method = String(traffic[key].method);
            }
            if (traffic[key].request_subtype && typeof traffic[key].request_subtype !== 'string') {
                traffic[key].request_subtype = String(traffic[key].request_subtype);
            }
            if (traffic[key].request_type && typeof traffic[key].request_type !== 'string') {
                traffic[key].request_type = String(traffic[key].request_type);
            }
            if (traffic[key].url && typeof traffic[key].url !== 'string') {
                traffic[key].url = String(traffic[key].url);
            }
            if (traffic[key].timestamp && typeof traffic[key].timestamp !== 'number') {
                traffic[key].timestamp = 0;
            }
            if (traffic[key].transaction_key && typeof traffic[key].transaction_key !== 'number') {
                traffic[key].transaction_key = 0;
            }
            if (traffic[key].headers.length > 1) {
                traffic[key].headers.forEach(function (header) {
                    if (header.name && typeof header.name !== 'string') {
                        header.name = String(header.name);
                    }
                    if (header.value && typeof header.value !== 'string') {
                        header.value = String(header.value);
                    }
                });
            }
        });
        return traffic;
    }
    function exportTaurus() {
        background.mixpanelTrack('CE Editor Export Taurus');
        var traffic = checkAndChangeToExpectingTypesTraffic(editor.get());
        webextension_polyfill_ts_1.browser.runtime.sendMessage({ op: 'json', json: JSON.stringify(traffic) }).then(function () {
            // @ts-ignore
            background.getYamlJmeter().then(function (yaml) {
                var blob = new Blob([yaml], { type: 'text/yaml' });
                var url = URL.createObjectURL(blob);
                var link = $('<a>Download</a>');
                $('#jsoneditor').append(link);
                link.attr('download', $.elementName.val() + '-JMeter.yaml');
                link.attr('href', url);
                link[0].click();
                link.remove();
            });
        });
    }
    function exportJson() {
        background.mixpanelTrack('CE Editor Export JSON');
        var traffic = checkAndChangeToExpectingTypesTraffic(editor.get());
        webextension_polyfill_ts_1.browser.runtime.sendMessage({ op: 'json', json: JSON.stringify(traffic) }).then(function () {
            chrome.extension.sendRequest({ type: 'get_json' }, function (jsonString) {
                if (jsonString) {
                    var blob = new Blob([jsonString], { type: 'application/json' });
                    var url = URL.createObjectURL(blob);
                    var link = $('<a></a>');
                    $('#jsoneditor').append(link);
                    link.attr('download', $.elementName.val() + '-JMeter.json');
                    link.attr('href', url);
                    link[0].click();
                    link.remove();
                }
            });
        });
    }
    function exportJmeter() {
        background.mixpanelTrack('CE Editor Export Jmeter');
        $('#jsoneditor').hide();
        $('.progress-body .text').text($.stringExporting);
        var traffic = checkAndChangeToExpectingTypesTraffic(editor.get());
        var jmxname = $.elementName.val();
        $.elementStatus.html('Converting...');
        background.localSave({ jmxname: jmxname });
        webextension_polyfill_ts_1.browser.runtime.sendMessage({ op: 'json', json: JSON.stringify(traffic) }).then(function () {
            chrome.extension.sendRequest({ type: 'export_jmeter' });
        });
    }
    $.elementUploadJmeter.on('click', uploadData);
    $('#export-json').on('click', exportJson);
    $('#export-taurus').on('click', exportTaurus);
    $.elementUploadJmx.on('click', exportJmeter);
    webextension_polyfill_ts_1.browser.runtime.onMessage.addListener(function (request) {
        if (request.status) {
            var text = request.status;
            if (request.status.indexOf('level: "fatal"') !== -1) {
                text = 'Export to JMX failed';
            }
            $.elementStatus.html(text);
            $('#jsoneditor').show();
        }
        else if (request.op === 'progressbar') {
            webextension_polyfill_ts_1.browser.storage.local.get('mode').then(function (data) {
                if (data.mode === 'mode-record') {
                    if (request.progress) {
                        $('.progress-body .text').text('Launching servers in the cloud can take about 2 minutes. Please wait while cloud servers are being launched');
                        $.waitOverlay(request.progress);
                        $.elementRunOverlayClose.on('click', $.closeOverlay);
                        $.elementRunOverlayClose.on('click', closeEditorOverlay);
                    }
                    else {
                        $.elementRunOverlayProgress.hide();
                        $.closeOverlay();
                    }
                }
            });
        }
        else if (request.op === 'domainoverlay') {
            $.elementStatus.html('');
            $.elementRunOverlayClose.off('click');
            $.elementDomainsButton.off('click');
            if (request.action === 'upload') {
                $.elementRunOverlayClose.on('click', closeEditorOverlay);
                $.elementDomainsButton.on('click', $.uploadSelectedDomains);
            }
            else if (request.action === 'export') {
                $.elementRunOverlayClose.on('click', closeExportOverlay);
                $.elementDomainsButton.on('click', $.exportSelectedDomains);
            }
            $.domainOverlay(JSON.parse(request.domains));
            adjustSubmitButton();
        }
        else if (request.op === 'exportJMX') {
            if (request.progress < 100) {
                $.waitOverlay(request.progress);
            }
        }
        else if (request.op === 'closeOverlay') {
            $.closeOverlay();
        }
        else if (request.op === 'exported_to_jmx') {
            $.closeOverlay();
            $('#jsoneditor').show();
            $.elementStatus.html('Successfully exported to JMX file.');
        }
        else if (request.op === 'uploadDataFailed') {
            $.elementStatus.html('Sending data failed. Please try again.');
            closeEditorOverlay();
        }
    });
});
//# sourceMappingURL=editor.js.map