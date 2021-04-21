"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:only-arrow-functions */
var extension_1 = require("../common/extension");
var string_utils_1 = require("../common/string-utils");
var url_utils_1 = require("../common/url-utils");
var DEFAULT_CONVERTER_URL = 'https://converter.blazemeter.com';
var background = extension_1.getBackgroundPage();
var DEFAULT_ARD_URL = 'https://bard.blazemeter.com';
var DEFAULT_SERVER_URL = 'https://a.blazemeter.com';
$.getJSON(background.configFile, function (data) {
    DEFAULT_SERVER_URL = data.server_url;
    DEFAULT_ARD_URL = data.ard_url;
});
function alertDisplay(el, show) {
    if (show) {
        var left = el.offset().left;
        el.removeAttr('style');
        el.css({ left: left }).animate({
            left: $(window).width() / 2,
        }, 500);
        setTimeout(function () {
            el.animate({ marginLeft: ($(document).width()) + 'px' }, 1500, function () {
            });
        }, 6000);
    }
    else {
        el.animate({ marginLeft: ($(document).width()) + 'px' }, 1500, function () {
        });
    }
}
function saveSettings(settings) {
    background.localSave(settings);
}
function validateElements() {
    var serverJmxInput = $('#serverJmx');
    var customServerInput = $('#server');
    serverJmxInput.removeClass('has-error');
    customServerInput.removeClass('has-error');
    var errEl = $('#error span');
    var msg = '';
    var serverJmx = serverJmxInput.val();
    var customServer = customServerInput.val();
    if ($('#custom_server').is(':checked')) {
        if (string_utils_1.stringIsEmpty(serverJmx) || string_utils_1.stringIsEmpty(customServer)) {
            if (string_utils_1.stringIsEmpty(serverJmx) && !string_utils_1.stringIsEmpty(customServer)) {
                serverJmxInput.addClass('has-error');
                msg = 'Please specify Server Converter';
            }
            else if (!string_utils_1.stringIsEmpty(serverJmx) && string_utils_1.stringIsEmpty(customServer)) {
                customServerInput.addClass('has-error');
                msg = 'Please specify Custom Server URL';
            }
            else {
                msg = 'Please enter all required fields';
                serverJmxInput.addClass('has-error');
                customServerInput.addClass('has-error');
            }
            errEl.text(msg);
            alertDisplay($('#error'), true);
            return false;
        }
        if (!url_utils_1.validUrl(customServer) || !url_utils_1.validUrl(serverJmx)) {
            msg = 'Please enter valid url';
            if (!url_utils_1.validUrl(customServer)) {
                customServerInput.addClass('has-error');
            }
            if (!url_utils_1.validUrl(serverJmx)) {
                serverJmxInput.addClass('has-error');
            }
            errEl.text(msg);
            alertDisplay($('#error'), true);
            return false;
        }
    }
    else {
        if (string_utils_1.stringIsEmpty(serverJmx)) {
            msg = 'Please specify Server Converter';
            errEl.text(msg);
            serverJmxInput.addClass('has-error');
            alertDisplay($('#error'), true);
            return false;
        }
        if (!url_utils_1.validUrl(serverJmx)) {
            msg = 'Please enter valid url';
            serverJmxInput.addClass('has-error');
            errEl.text(msg);
            alertDisplay($('#error'), true);
            return false;
        }
    }
    return true;
}
function saveOptions() {
    var $ardServerUrl = $('#ard_server_url');
    var $serverJmx = $('#serverJmx');
    var $customServer = $('#server');
    var serverjmx = $serverJmx.val();
    var customServer = $customServer.val();
    var ardUrl = $ardServerUrl.val();
    var valid = validateElements();
    // if true save options
    if (valid) {
        serverjmx = string_utils_1.stripTrailingSlash(serverjmx);
        $('#serverJmx').val(serverjmx);
        customServer = string_utils_1.stripTrailingSlash(customServer);
        $('#server').val(customServer);
        ardUrl = string_utils_1.stripTrailingSlash(ardUrl);
        $ardServerUrl.val(ardUrl);
        saveSettings({
            debug: $('#debug').is(':checked'),
        });
        if (serverjmx) {
            saveSettings({
                serverJMX: serverjmx,
            });
        }
        if ($('#custom_server').is(':checked')) {
            saveSettings({
                custom_server: true,
                server: customServer,
            });
        }
        else {
            saveSettings({
                custom_server: false,
                server: DEFAULT_SERVER_URL,
            });
        }
        if ($('#custom_ard_url').is(':checked')) {
            saveSettings({
                custom_ard: true,
                ard_url: ardUrl,
            });
        }
        else {
            saveSettings({
                custom_ard: false,
                ard_url: DEFAULT_ARD_URL,
            });
        }
        // Reload options
        chrome.runtime.sendMessage({
            op: 'reloadoptions',
        });
        background.localSave({
            accountOptions: {
                account: null,
                workspace: null,
                project: null,
                uid: null,
            },
        });
        alertDisplay($('#success'), true);
    }
}
function resetOptions() {
    var resetSubmitted = confirm('Server and Converter URLs will be reset to default values.');
    if (!resetSubmitted) {
        return;
    }
    $('#serverJmx').val(DEFAULT_CONVERTER_URL);
    $('#server').val(DEFAULT_SERVER_URL);
    $('#ard_server_url').val(DEFAULT_ARD_URL);
    saveSettings({
        server: DEFAULT_SERVER_URL,
        serverJMX: DEFAULT_CONVERTER_URL,
        ard_url: DEFAULT_ARD_URL,
    });
    alertDisplay($('#reset-success'), true);
}
$(document).ready(function () {
    $('#custom_server').on('change', function () {
        if ($(this).is(':checked')) {
            $('.required-server span').show();
            $('.server_url').show();
        }
        else {
            $('.required-server span').hide();
            $('.server_url').hide();
        }
    });
    $('#custom_ard_url').on('change', function () {
        if ($(this).is(':checked')) {
            $(this).siblings('.required').children('span').show();
            $('.ard_url').show();
        }
        else {
            $(this).siblings('.required').children('span').hide();
            $('.ard_url').hide();
        }
    });
    chrome.storage.local.get(null, function (items) {
        if (items.debug) {
            $('#debug').prop('checked', true);
        }
        if (items.custom_server) {
            $('.required-server span').show();
            $('#custom_server').prop('checked', true);
            $('.server_url').show();
        }
        if (items.custom_ard) {
            var $customArd = $('#custom_ard_url');
            $customArd.siblings('.required').children('span').show();
            $customArd.prop('checked', true);
            $('.ard_url').show();
        }
        $('#serverJmx').val(items.serverJMX);
        if (items.server == null || string_utils_1.stringIsEmpty(items.server)) {
            saveSettings({
                server: DEFAULT_SERVER_URL,
            });
            $('#server').val(DEFAULT_SERVER_URL);
        }
        else {
            $('#server').val(items.server);
        }
        if (items.ard_url == null || string_utils_1.stringIsEmpty(items.ard_url)) {
            saveSettings({
                ard_url: DEFAULT_ARD_URL,
            });
            $('#ard_server_url').val(DEFAULT_ARD_URL);
        }
        else {
            $('#ard_server_url').val(items.ard_url);
        }
        var theme = items.theme;
        $('#favicon').attr('href', '/theme/' + theme + '/images/48x48.png');
        var name = theme.toLowerCase().replace(/\b[a-z]/g, function (letter) { return letter.toUpperCase(); });
        $('head').append('<link rel="stylesheet" href="../theme/' + theme + '/css/options.css" type="text/css" />');
        $('.close-page').on('click', function () {
            window.close();
        });
        $(document).prop('title', 'Options - ' + name);
    });
});
$('#save').on('click', saveOptions);
$('.close-success, .close-reset').on('click', function () {
    alertDisplay($('#success'), false);
    alertDisplay($('#error'), false);
    alertDisplay($('#reset-success'), false);
});
$('#reset').on('click', resetOptions);
//# sourceMappingURL=options_jq.js.map