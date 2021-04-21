"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:only-arrow-functions */
var webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
var extension_1 = require("../common/extension");
var string_utils_1 = require("../common/string-utils");
var manifest = chrome.runtime.getManifest();
var op = 'stopped';
var options = {};
var stringLoginContinue = 'Please log in or sign up to continue.';
var stringAdjustProp = 'Adjust your properties and run tests from the cloud. The domains filter list must be completed before you click this button.';
var stringRunCloud = 'Click to run JMeter test from the cloud now.';
var stringAdjustPropCloud = 'Adjust test properties and run from the cloud.';
var stringTimeDistDesc = 'Set the time interval during which FollowMe\'s virtual users will start "following" your online activity. The virtual users will join randomly during this specified period.';
var tooltipBigRecordButtonDefault = 'Start recording';
var tooltipBigRecordButtonResume = 'Resume recording';
var mode = '';
var userId = null;
var serverUrl = '';
var startRecMode = '';
var availableTests = [];
var availableLocations = [];
var availableFunctionalLocations = [];
var userAccounts = [];
var userWorkspaces = [];
var userProjects = [];
var userDefaults;
var locationDefault = 'eu-west-1';
var concurrencyDefault = 50;
var concurrencyDefaultMax = 100;
var MAX_FOLLOW_ME_LIMIT = 10000;
var MAX_RECORDING_LIMIT = 18000;
var maxconcurrentusers = concurrencyDefaultMax;
var isLogged = false;
var version = 'v4';
var changedAccount = false;
var background = extension_1.getBackgroundPage();
var locationDummy = {
    text: 'US Central (Iowa, Google)',
    value: 'us-central1-a',
};
// merge-modify
// Functional recorder variables
var functionalRecorder = background.getRecorder({});
var debuggerWidth = 410;
var debuggerHeigth = 600;
// Initialization
chrome.storage.local.set({
    selected_domains: {},
});
chrome.storage.local.get('server', function (item) { return (serverUrl = item.server); });
function initFollowMeInterface() {
    var followMe = $('#follow-name').val();
    var regexFollowInput = $('#regex_follow_input').val();
    if (isLogged && !string_utils_1.stringIsEmpty(followMe) && !string_utils_1.stringIsEmpty(regexFollowInput)) {
        $.enableBtn('follow-record');
    }
    else {
        $.disableBtn('follow-record');
    }
    $.enableBtn('follow-reset');
    $.disableBtn('follow-stop');
    $.disableBtn('follow-pause');
    $.disableBtn('follow-upload-jmx');
    $.disableBtn('follow-report');
}
function showRecordingActions(enable) {
    // if ($('#advanced-options-fieldset').hasClass('opened') && mode === 'mode-record') {
    // }
    $('#recording-actions').show();
    if (enable === true) {
        $('#recording-actions').addClass('opened');
    }
}
function hideRecordingActions(disable) {
    $('#recording-actions').hide();
    if (disable === true) {
        $('#recording-actions').removeClass('opened');
    }
}
function showHideRecordingActionsBlock() {
    var isTestRecorded = false;
    if (background.cRecorder.currentSuite) {
        isTestRecorded = true;
    }
    if (mode === 'mode-record' && isTestRecorded && op === 'stopped') {
        showRecordingActions(false);
    }
    else {
        hideRecordingActions(true);
    }
}
function setTooltipRecordButton(tooltip) {
    $('#record .button_big_style > input').attr('title', tooltip);
}
function initRecordInterface() {
    $.enableBtn('record');
    $.enableBtn('reset');
    $.disableBtn('pause');
    $.disableBtn('stop');
    $.disableBtn('edit');
    $.disableBtn('debugger');
    $.disableBtn('download');
    $.disableBtn('upload');
    $.disableBtn('upload-jmx');
    $.disableBtn('upload-functional');
    // Hide block with by default
    hideRecordingActions();
    setTooltipRecordButton(tooltipBigRecordButtonDefault);
}
function showHideButtonsByExistingTraffic(exists) {
    // if JMeter traffic was not recorded make buttons not active
    if (!exists) {
        $('#button-edit-jmeter').hide();
        $('#button-edit-selenium').show();
        $('#button-upload-jmeter').hide();
        $('#button-upload-selenium').show();
        $.disableDropdownBtn('button-upload-jmeter-dropdown');
        $.disableDropdownBtn('button-upload-functional-dropdown');
        $.disableDropdownBtn('button-upload-combined-dropdown');
        $.disableDropdownBtn('button-edit-jmeter-dropdown');
    }
    else {
        $('#button-edit-jmeter').show();
        $('#button-edit-selenium').hide();
        $('#button-upload-jmeter').show();
        $('#button-upload-selenium').hide();
        $.enableDropdownBtn('button-upload-jmeter-dropdown');
        $.enableDropdownBtn('button-upload-functional-dropdown');
        $.enableDropdownBtn('button-upload-combined-dropdown');
        $.enableDropdownBtn('button-edit-jmeter-dropdown');
    }
}
$(document).ready(function () {
    // @todo: now we always read from config.json, as currently we only have one GA account.
    // Therefore GA code from config_dynatrace.json will be ignored.
    $.getJSON(background.configFile, function (data) {
        background.googleAnalytics('create', data.GA_code, 'auto');
        background.googleAnalytics('set', 'checkProtocolTask', null);
    });
    $('#load-origin').chosen();
    $('#parallel-downloads-list').chosen({ width: '245px' });
    // @ts-ignore
    var swiper = new Swiper('.swiper-container', {
        simulateTouch: false,
        effect: 'fade',
        init: false,
    });
    swiper.on('init', function () {
        attachResizeEvent();
    });
    swiper.init();
    $('html, body').css({ height: 'auto' });
    background.functionalIconBlinkMode = false;
    function removeTransactionPopupMessage() {
        // Broadcast to all tabs to remove Transaction popup
        chrome.tabs.query({}, function (tabs) {
            for (var _i = 0, tabs_1 = tabs; _i < tabs_1.length; _i++) {
                var tab = tabs_1[_i];
                chrome.tabs.sendMessage(tab.id, { msg: 'removeTransactionPopup' });
            }
        });
    }
    // fix bug Layout breakes if use pageUp/pageDown/Home/End keys in filter pattern field field
    var regexWrapper = $('.regex-wrapper');
    var swiperSlideNext = $('.swiper-slide-next');
    regexWrapper.on('focusin', function () {
        swiperSlideNext.css({ display: 'none' });
    });
    regexWrapper.on('focusout', function () {
        swiperSlideNext.css({ display: 'block' });
    });
    // end fix bug Layout breaks if use pageUp/pageDown/Home/End keys in filter pattern field field
    // adding position absolute in follow-me mode to user agent wrapper
    // to make inner <ul> be on top of (over) popup html
    function changeTestOptionsWrapperPosition() {
        var userAgentWrapper = $('#user-agent-wrapper');
        var originWrapper = $('#origin-wrapper');
        var concurrencyWrapper = $('#concurrency-wrapper');
        if (mode === 'mode-follow') {
            originWrapper.show();
            concurrencyWrapper.show();
            userAgentWrapper.addClass('test-options-position-absolute');
            originWrapper.addClass('test-options-position-absolute');
        }
        else {
            originWrapper.hide();
            concurrencyWrapper.hide();
            userAgentWrapper.removeClass('test-options-position-absolute');
            originWrapper.removeClass('test-options-position-absolute');
        }
    }
    setTimeout(changeTestOptionsWrapperPosition, 100);
    function reloadConcurrency() {
        chrome.storage.local.get(null, function (items) {
            var currentconc = items.concurrency;
            var sliderConcurrency = $('#concurrency');
            var setConcurrency = items.account_plan.concurrency;
            var location = getSelectedLocation(items.location);
            if (location && location.limits) {
                if (location.limits.concurrency < setConcurrency) {
                    setConcurrency = location.limits.concurrency;
                }
            }
            if (mode === 'mode-record' && setConcurrency > MAX_RECORDING_LIMIT) {
                setConcurrency = MAX_RECORDING_LIMIT;
            }
            if (mode === 'mode-follow' && setConcurrency > MAX_FOLLOW_ME_LIMIT) {
                setConcurrency = MAX_FOLLOW_ME_LIMIT;
            }
            if (setConcurrency < currentconc) {
                background.localSave({
                    concurrency: setConcurrency,
                });
                // @ts-ignore
                sliderConcurrency.slider('option', 'value', setConcurrency);
                // @ts-ignore
                sliderConcurrency.slider('option', 'max', setConcurrency);
                background.localSave({
                    real_max_follow_limit: setConcurrency,
                });
                $('#concurrency-display-textfield').val(setConcurrency);
            }
            else {
                // @ts-ignore
                sliderConcurrency.slider('option', 'value', currentconc);
                // @ts-ignore
                sliderConcurrency.slider('option', 'max', setConcurrency);
                background.localSave({
                    real_max_follow_limit: setConcurrency,
                });
                $('#concurrency-display-textfield').val(currentconc);
            }
            sliderConcurrency.slider({
                disabled: false,
            });
        });
    }
    // Add permissions required in new version notification block
    chrome.storage.local.get(function (item) {
        if (item.hasOwnProperty('permissionsBlockFirstTimeShow')) {
            if (item.permissionsBlockFirstTimeShow) {
                chrome.storage.local.set({
                    permissionsBlockFirstTimeShow: false,
                });
            }
        }
    });
    // plugin notifications
    var openNotificationButtons = document.querySelectorAll('.notification-text-alert .close-open-button.open-button');
    openNotificationButtons.forEach(function (openButton) {
        openButton.onclick = function () {
            var alertBlock = openButton.closest('.notification-text-alert-inner');
            var hiddenBlock = alertBlock.querySelector('.notification-text-hide-block');
            var closeButton = alertBlock.querySelector('.close-open-button.close-button');
            // it'll be better to replace jq fade with js classList.add()
            $(hiddenBlock).fadeIn(300);
            $(openButton).fadeOut(100);
            $(closeButton).css('display', 'flex').fadeIn(300);
        };
    });
    var closeNotificationButtons = document.querySelectorAll('.notification-text-alert .close-open-button.close-button');
    closeNotificationButtons.forEach(function (closeButton) {
        closeButton.onclick = function () {
            var alertBlock = closeButton.closest('.notification-text-alert-inner');
            var hiddenBlock = alertBlock.querySelector('.notification-text-hide-block');
            var openButton = alertBlock.querySelector('.close-open-button.open-button');
            // it'll be better to replace jq fade with js classList.add()
            $(hiddenBlock).fadeOut(300);
            $(openButton).fadeIn(100);
            $(closeButton).fadeOut(300);
        };
    });
    function closeAllNotification() {
        // @ts-ignore
        closeNotificationButtons.forEach(function (closeButton) { return closeButton.onclick(); });
    }
    // Listener for dropdowns in Actions Block
    // @ts-ignore
    actionDropdownOpenerListener();
    // END Listener for dropdowns in Actions Block
    function setDefaultProject(reloadDefaults) {
        background.localSave({
            accountOptions: {
                account: userDefaults.accountId,
                workspace: userDefaults.workspaceId,
                project: userDefaults.id,
                uid: userId,
            },
        });
        if (reloadDefaults) {
            $('#account-status').text('');
            $('#options-fieldset-test').removeClass('not-saved');
            $('#accounts').val(userDefaults.accountId).trigger('chosen:updated');
            changedAccount = false;
            setWorkspaces(userDefaults.accountId);
            loadAccountInfo(userDefaults.accountId, userDefaults.workspaceId);
            $('.account-loader').show();
            $('.account-expand').hide();
        }
    }
    function setProjects(workspaceId) {
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: serverUrl + "/api/" + version + "/projects?workspaceId=" + workspaceId + "&limit=1000&" + background.ApiClientIdentification(),
            dataType: 'json',
            success: function (response) {
                var result = response.result;
                var list = $('#projects');
                list.empty();
                $.each(result, function (key, value) {
                    if (value.workspaceId === workspaceId) {
                        list.append('<option class="' +
                            value.workspaceId +
                            '" value="' +
                            value.id +
                            '">' +
                            value.name +
                            '</option>');
                        userProjects.push(value.id);
                    }
                });
                // @ts-ignore
                list.chosen({ width: '170px' });
                if (changedAccount) {
                    list.val($('#projects option:first').val()).trigger('chosen:updated');
                }
                else {
                    chrome.storage.local.get('accountOptions', function (item) {
                        if (item.hasOwnProperty('accountOptions')) {
                            if (userId === item.accountOptions.uid &&
                                item.accountOptions.account &&
                                item.accountOptions.workspace &&
                                item.accountOptions.project) {
                                $('#projects').val(item.accountOptions.project).trigger('chosen:updated');
                            }
                            else {
                                $('#projects').val(userDefaults.id).trigger('chosen:updated');
                                setDefaultProject(false);
                            }
                        }
                        else {
                            $('#projects').val(userDefaults.id).trigger('chosen:updated');
                            setDefaultProject(false);
                        }
                        $('.project-name').text($('#projects option:selected').text());
                    });
                }
                loaderHide(true);
            },
            error: function (e) {
                handleAccoountError(e);
            },
        });
    }
    function setWorkspaces(accountId) {
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: serverUrl +
                '/api/' +
                version +
                '/workspaces?limit=0&skip=0&accountId=' +
                accountId +
                '&enabled=true?' +
                background.ApiClientIdentification(),
            dataType: 'json',
            success: function (response) {
                var result = response.result;
                var list = $('#workspaces');
                var defLoad = false;
                list.empty();
                $.each(result, function (key, value) {
                    if (value.accountId === accountId) {
                        list.append('<option class="' +
                            value.accountId +
                            '" value="' +
                            value.id +
                            '">' +
                            value.name +
                            '</option>');
                        userWorkspaces.push(value.id);
                    }
                });
                // @ts-ignore
                list.chosen({ width: '170px' });
                if (changedAccount) {
                    list.val($('#workspaces option:first').val()).trigger('chosen:updated');
                    setProjects(Number(list.val()));
                }
                else {
                    chrome.storage.local.get('accountOptions', function (item) {
                        if (item.hasOwnProperty('accountOptions')) {
                            if (userId === item.accountOptions.uid &&
                                item.accountOptions.account &&
                                item.accountOptions.workspace &&
                                item.accountOptions.project) {
                                setProjects(item.accountOptions.workspace);
                                $('#workspaces').val(item.accountOptions.workspace).trigger('chosen:updated');
                            }
                            else {
                                defLoad = true;
                            }
                        }
                        else {
                            defLoad = true;
                        }
                        if (defLoad) {
                            setProjects(userDefaults.workspaceId);
                            $('#workspaces').val(userDefaults.workspaceId).trigger('chosen:updated');
                            setDefaultProject(false);
                        }
                    });
                }
            },
            error: function (e) {
                handleAccoountError(e);
            },
        });
    }
    function handleAccoountError(e) {
        loaderHide(true);
        if (e.responseJSON.hasOwnProperty('error')) {
            $('.account-expand').html('<p class="account-options-error">Error loading account! <br>' + e.responseJSON.error.message + '</p>');
        }
    }
    function setAccounts() {
        var defLoad = false;
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: serverUrl + '/api/' + version + '/accounts?' + background.ApiClientIdentification(),
            dataType: 'json',
            success: function (response) {
                var result = response.result;
                var list = $('#accounts');
                list.empty(); // remove if any <option>
                $.each(result, function (key, value) {
                    list.append('<option value="' + value.id + '">' + value.name + '</option>');
                    userAccounts.push(value.id);
                });
                // @ts-ignore
                list.chosen({ width: '170px' });
                chrome.storage.local.get('accountOptions', function (item) {
                    if (item.hasOwnProperty('accountOptions')) {
                        if (userId === item.accountOptions.uid &&
                            item.accountOptions.account &&
                            item.accountOptions.workspace &&
                            item.accountOptions.project) {
                            setWorkspaces(item.accountOptions.account);
                            $('#accounts').val(item.accountOptions.account).trigger('chosen:updated');
                            loadAccountInfo(item.accountOptions.account, item.accountOptions.workspace);
                            loadProjectTests(item.accountOptions.project);
                        }
                        else {
                            defLoad = true;
                        }
                    }
                    else {
                        defLoad = true;
                    }
                    if (defLoad) {
                        setWorkspaces(userDefaults.accountId);
                        loadAccountInfo(userDefaults.accountId, userDefaults.workspaceId);
                        loadProjectTests(userDefaults.id);
                        $('#accounts').val(userDefaults.accountId).trigger('chosen:updated');
                        setDefaultProject(false);
                    }
                });
            },
            error: function (e) { return handleAccoountError(e); },
        });
    }
    function setUIForLoggedUser(username, uid) {
        if (username) {
            if (username.length > 8) {
                username = $.trim(username).substring(0, 8).slice(0, -1) + '...';
            }
        }
        else {
            username = 'user';
        }
        var signedBlock = $('#signed-block');
        $('#sign-block').hide();
        signedBlock.show();
        signedBlock.html("<div class='welcome'>Hi <a href='" + serverUrl + "/app' target='_blank'>" + username + "</a></div>");
        $('.welcome a').on('click', function () {
            background.mixpanelTrack('CE User Name Clicked');
        });
        chrome.storage.local.set({
            logged: true,
            username: username,
            uid: uid,
        });
        userId = uid;
        isLogged = true;
        // FIXME(rp): sendMessage is not available in 'extension', so most probably this code never worked
        // @ts-ignore
        chrome.extension.sendMessage({
            op: 'reloadoptions',
        });
        if ($('#update-settings').is(':checked')) {
            $('#button-upload-jmeter input').attr('title', stringAdjustProp);
            $('#upload-off input').attr('title', stringLoginContinue);
        }
        else {
            $('#button-upload-jmeter input').attr('title', stringRunCloud);
            $('#upload-off input').attr('title', stringRunCloud);
            $('#follow-record-off input').attr('title', stringAdjustProp);
        }
        if (string_utils_1.stringIsEmpty($('#follow-name').val()) &&
            !string_utils_1.stringIsEmpty($('#regex_follow_input').val()) &&
            op === 'stopped') {
            $.enableBtn('follow-record');
        }
        chrome.extension.sendRequest({
            type: 'get_status',
        }, function (data) {
            op = data.op;
            chrome.extension.sendRequest({
                type: 'traffic_exists',
            }, function (exists) {
                chrome.storage.local.get('record_name', function (item) {
                    if (exists && op === 'stopped' && item.record_name && !string_utils_1.stringIsEmpty(item.record_name)) {
                        if (isLogged) {
                            $.enableBtn('upload');
                        }
                        $.enableBtn('upload-jmx');
                    }
                });
            });
        });
    }
    function loaderHide(state) {
        if (state) {
            $('.account-loader').hide();
            $('.account-expand').show();
        }
        else {
            $('.account-loader').show();
            $('.account-expand').hide();
        }
    }
    function pageSwitch(index) {
        // @ts-ignore
        var mySwiper = $('.swiper-container')[0].swiper;
        mySwiper.slideTo(index);
        if (index === '1') {
            $('.swiper-container').css({
                overflow: 'hidden',
            });
            $('.back-to span').html('Cancel');
            $('#account-status').text('');
            background.mixpanelTrack('CE Save In Project Opened');
        }
        else {
            $('.swiper-container').css({
                overflow: 'visible',
            });
            background.mixpanelTrack('CE Save In Project Closed');
        }
        var height = $('.swiper-slide-active').height();
        window.parent.postMessage({ height: height }, '*');
    }
    function loadOriginConcurrency() {
        if (availableLocations.length > 0) {
            if (op !== 'follow' && op !== 'pause' && isLogged) {
                reloadConcurrency();
            }
            else {
                // @ts-ignore
                $('#concurrency').slider({ disabled: false });
            }
        }
    }
    /**
     * @param {string|number} accountId - Account ID
     * @param {string|number} workspaceId - Workspace ID
     */
    function loadAccountInfo(accountId, workspaceId) {
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: serverUrl + "/api/" + version + "/accounts/" + accountId + "?" + background.ApiClientIdentification(),
            dataType: 'json',
            success: function (response) {
                chrome.storage.local.get(null, function () {
                    var params = response.result;
                    var concurrency = params.plan.concurrency;
                    var realmaxfollow = Math.min(concurrency, MAX_FOLLOW_ME_LIMIT);
                    background.localSave({
                        account_plan: params.plan,
                        duration: params.plan.duration,
                        real_max_follow_limit: realmaxfollow,
                        features: params.features,
                    });
                    setAvailableLocations(workspaceId);
                    chrome.extension.sendRequest({ type: 'get_status' }, function (data) {
                        op = data.op;
                        if (op !== 'stopped' &&
                            (mode === 'mode-follow' || (mode === 'mode-record' && startRecMode === 'mode-follow'))) {
                            chrome.storage.local.get('max_concurrent_users', function (x) {
                                maxconcurrentusers = x.max_concurrent_users;
                            });
                        }
                        else {
                            var limits = {
                                max_follow_limit: Math.min(params.plan.concurrency, MAX_FOLLOW_ME_LIMIT),
                                max_record_limit: Math.min(params.plan.concurrency, MAX_RECORDING_LIMIT),
                            };
                            background.localSave(limits);
                            maxconcurrentusers =
                                mode === 'mode-follow' ? limits.max_follow_limit : limits.max_record_limit;
                        }
                    });
                });
            },
        });
    }
    function setAvailableTests(response) {
        availableTests = [];
        var availableTags = [];
        var availableRecordTags = [];
        // right now functional-test section is commented in popup.html
        var isFunctional = $('#functional-test').is(':checked');
        response.result.forEach(function (entry) {
            var type = entry.configuration.type;
            if (type === 'followme') {
                availableTags.push({
                    value: entry.name + ' (id: ' + entry.id + ')',
                    test_id: entry.id,
                });
                availableTests[entry.id] = entry.name + ' (id: ' + entry.id + ')';
            }
            else if (type === 'taurus' && !isFunctional) {
                availableRecordTags.push({
                    value: entry.name + ' (id: ' + entry.id + ')',
                    test_id: entry.id,
                });
                availableTests[entry.id] = entry.name + ' (id: ' + entry.id + ')';
            }
            else if (type === 'functionalApi' && !isFunctional) {
                availableRecordTags.push({
                    value: entry.name + ' (id: ' + entry.id + ')',
                    test_id: entry.id,
                });
                availableTests[entry.id] = entry.name + ' (id: ' + entry.id + ')';
            }
        });
        $.elementName.autocomplete({
            lookup: availableRecordTags,
            lookupLimit: 5,
            onSelect: function (suggestion) {
                var value = suggestion.value;
                background.localSave({
                    record_name: value,
                });
                // Functional suite name update
                functionalRecorder.updateSuiteName(value);
                chrome.storage.local.set({
                    record_id: suggestion.test_id,
                });
                background.mixpanelTrack('CE Autocomplete Record Test Selected');
                console.log('something happend??');
            },
        });
        $('#follow-name').autocomplete({
            lookup: availableTags,
            lookupLimit: 5,
            onSelect: function (suggestion) {
                var value = suggestion.value;
                background.localSave({
                    test_name: value,
                    jmxname: value,
                });
                background.mixpanelTrack('CE Autocomplete FollowMe Test Selected');
            },
        });
    }
    function loadProjectTests(project) {
        $('.project-name').text($('#projects option:selected').text());
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: serverUrl + "/api/" + version + "/tests?projectId=" + project + "&" + background.ApiClientIdentification(),
            dataType: 'json',
            success: function (response) { return setAvailableTests(response); },
        });
    }
    $('#accounts, #workspaces, #projects').on('change', function () {
        $('#options-fieldset-test').addClass('not-saved');
        $('#save_test_options').prop('disabled', false);
        $('.back-to span').html('Cancel');
        if ($(this).attr('id') === 'accounts') {
            $('#account-status').text('');
            $('.account-loader').show();
            $('.account-expand').hide();
            changedAccount = true;
            setWorkspaces(Number($(this).val()));
        }
        else if ($(this).attr('id') === 'workspaces') {
            $('#account-status').text('');
            $('.account-loader').show();
            $('.account-expand').hide();
            changedAccount = true;
            setProjects(Number($(this).val()));
        }
    });
    $('#save_test_options').on('click', function (e) {
        e.preventDefault();
        chrome.storage.local.get('accountOptions', function (data) {
            var accountOptions = data.accountOptions;
            background.mixpanelTrack('CE Account Options Saved');
            var account = Number($('#accounts').val());
            var workspace = Number($('#workspaces').val());
            var project = Number($('#projects').val());
            if (accountOptions.account !== account) {
                background.mixpanelTrack('CE Account Changed', {
                    Value: $('#accounts option:selected').text(),
                });
            }
            if (accountOptions.workspace !== workspace) {
                background.mixpanelTrack('CE Workspace Changed', {
                    Value: $('#workspaces option:selected').text(),
                });
            }
            if (accountOptions.project !== project) {
                background.mixpanelTrack('CE Project Changed', {
                    Value: $('#projects option:selected').text(),
                });
            }
            $('#save_test_options').prop('disabled', true);
            $('#options-fieldset-test').removeClass('not-saved');
            if (project > 0) {
                background.localSave({
                    accountOptions: {
                        account: account,
                        workspace: workspace,
                        project: project,
                        uid: userId,
                    },
                });
                loadAccountInfo(account, workspace);
                loadProjectTests(project);
                $('#account-status').html('<span class="message">Account Options saved!</span>');
                $('.back-to span').html('Go back');
            }
            else {
                $('#save_test_options').prop('disabled', false);
                if (workspace > 0) {
                    $('#account-status').html('<span class="error">Workspace has no project. Please choose another one.</span>');
                }
                else {
                    $('#account-status').html('<span class="error">Account has no workspace. Please choose another one.</span>');
                }
            }
        });
    });
    function autoTimeDistribution(concurrency) {
        var timeauto = 10;
        if (concurrency <= 1000 && concurrency > 100) {
            timeauto = 20;
        }
        else if (concurrency <= 10000 && concurrency > 1000) {
            timeauto = 60;
        }
        else if (concurrency > 10000) {
            timeauto = 300;
        }
        timeDistributionInMinutes(timeauto, true);
        background.localSave({
            auto_time_distribution: timeauto,
        });
    }
    function timeDistributionInMinutes(timeDistribution, auto) {
        var text;
        if (timeDistribution < 60) {
            text = timeDistribution + 's';
        }
        else {
            var minutes = Math.floor(timeDistribution / 60);
            var seconds = timeDistribution - minutes * 60;
            text = minutes + 'm ' + seconds + 's';
            if (seconds < 1) {
                text = minutes + 'm ';
            }
        }
        if (auto) {
            text += ' Auto';
        }
        $('.time-distribution-display .text').html(text);
    }
    // TODO: refactor???
    function updateSliderLabel(newVal) {
        var concTextfield = $('#concurrency-display-textfield');
        if (isNaN(newVal)) {
            newVal = concurrencyDefault;
            concTextfield.val(concurrencyDefault);
        }
        concTextfield.val(newVal);
    }
    function setSliderLabel(newVal) {
        chrome.storage.local.get('time_distribution', function (item) {
            background.localSave({
                concurrency: newVal,
            });
            if (item.time_distribution === 0) {
                autoTimeDistribution(newVal);
            }
        });
    }
    function toggleMode() {
        // get max values for concurrency by mode from storage
        chrome.storage.local.get(null, function (data) {
            chrome.storage.local.get(null, function (localData) {
                var keyToGet;
                var onoffSwither = $('.onoffswitch-checkbox');
                if (localData.disable_followme === 'TRUE') {
                    mode = 'mode-record';
                    chrome.storage.local.set({ mode: mode });
                    chrome.extension.sendRequest({
                        type: 'switch_mode',
                    });
                }
                showHideRecordingActionsBlock();
                if (mode === 'mode-follow') {
                    keyToGet = 'max_follow_limit';
                    $('.time-distribution-wrapper').show();
                    $('#follow-wrapper').show();
                    $('#record-wrapper').hide();
                    $('.domains-to-follow-wrapper').show();
                    onoffSwither.val('mode-follow');
                    onoffSwither.attr('checked', 'checked');
                    $('.update-settings-wrapper').hide();
                    $('.cookie-wrapper').hide();
                    $('.record-cookies-wrapper').hide();
                    $('.random-think-time-wrapper').show();
                    $('.css-wrapper').hide();
                    $('.js-wrapper').hide();
                    $('.images-wrapper').hide();
                    $('.ajax-wrapper').hide();
                    $('.functional-test-wrapper').hide();
                    $('.other-wrapper').hide();
                    $('.regex-wrapper').hide();
                    $('.autolabel-transactions-wrapper').hide();
                    $('.top-level-wrapper').hide();
                    $('.following-wrapper').hide();
                    $('.following').show();
                    $('.parallel-downloads-wrapper').hide();
                    $('.parallel-downloads-text').hide();
                    $('.requests').hide();
                    $('.transactions-wrapper').hide();
                    $('.following').addClass('followme');
                    $('#test-configuration').addClass('followmode');
                    $('#test-configuration').removeClass('recordmode');
                    // Added to set max-heigth in recordmode
                    $('#advanced-options').addClass('followmode');
                    $('#advanced-options').removeClass('recordmode');
                    //
                    $('.regex-follow-wrapper').show();
                    $('.mode-record').attr('id', 'not-current');
                    $('.mode-follow').attr('id', 'current');
                    $('#mode').val('mode-record');
                    if ($('#functional-test').is(':checked')) {
                        // FollowMe mode doesn't have Functional API test, therefore reset list to Load test
                        setLoadTestLocations();
                    }
                    // expandAdvancedOptions();
                }
                else {
                    keyToGet = 'max_record_limit';
                    $('#record-wrapper').show();
                    $('.domains-to-follow-wrapper').hide();
                    $('#test-configuration').addClass('recordmode');
                    $('#test-configuration').removeClass('followmode');
                    // Added to set max-heigth in recordmode
                    $('#advanced-options').addClass('recordmode');
                    $('#advanced-options').removeClass('followmode');
                    //
                    $('.time-distribution-wrapper').hide();
                    $('.top-level-wrapper').show();
                    $('.following-wrapper').show();
                    $('.transactions-wrapper').show();
                    $('#follow-wrapper').hide();
                    $('#add-concurrency').hide();
                    onoffSwither.val('mode-record');
                    onoffSwither.removeAttr('checked');
                    $('.update-settings-wrapper').show();
                    $('.cookie-wrapper').show();
                    $('.record-cookies-wrapper').hide();
                    $('.random-think-time-wrapper').show();
                    $('.css-wrapper').show();
                    $('.js-wrapper').show();
                    $('.images-wrapper').show();
                    $('.ajax-wrapper').show();
                    $('.functional-test-wrapper').show();
                    if ($("input[name='requests_to_record']:checked").val() !== 'top_level_and_following') {
                        $('.following').hide();
                        $('.parallel-downloads-wrapper').show();
                        if ($('#parallel-downloads-list').find(':selected').val() === 'other') {
                            $('.parallel-downloads-text').show();
                        }
                    }
                    if ($('#edit-transaction-labels').is(':checked')) {
                        $('.autolabel-transactions-wrapper').show();
                        $('.swiper-container').css({
                            overflow: 'visible',
                        });
                    }
                    $('.requests').show();
                    $('.following').removeClass('followme');
                    $('.other-wrapper').show();
                    $('.regex-follow-wrapper').hide();
                    $('.regex-wrapper').show();
                    $('.mode-record').attr('id', 'current');
                    $('.mode-follow').attr('id', 'not-current');
                    $('#mode').val('mode-follow');
                    if ($('#functional-test').is(':checked')) {
                        setFunctionalTestLocations();
                    }
                    if ($('#advanced-options').hasClass('openedRecord')) {
                        expandAdvancedOptions();
                    }
                    else {
                        collapseAdvancedOptions();
                    }
                    if ($('#recording-actions').hasClass('opened')) {
                        showRecordingActions(false);
                    }
                }
                data = data || {};
                var newMax;
                var $slider = $('#concurrency');
                var curValue = $slider.slider('option', 'value');
                var usermaxlimit;
                if (op !== 'stopped' && mode === 'mode-follow') {
                    chrome.storage.local.get('max_concurrent_users', function (items) {
                        $slider.slider('option', 'max', items.max_concurrent_users);
                        var newValue = Math.min(curValue, items.max_concurrent_users);
                        $slider.slider('option', 'value', newValue);
                        $('#concurrency-display-textfield').val(newValue);
                        updateSliderLabel(newValue);
                        setSliderLabel(newValue);
                        background.localSave({
                            concurrency: newValue,
                        });
                        $('#add-concurrency').hide();
                    });
                    return;
                }
                else if (op === 'stopped' && mode === 'mode-follow' && isLogged) {
                    usermaxlimit = data.real_max_follow_limit;
                }
                else if (isLogged && mode === 'mode-follow') {
                    newMax = concurrencyDefaultMax;
                }
                else {
                    newMax = data[keyToGet];
                    if (!newMax) {
                        return;
                    }
                }
                var newValue = Math.min(curValue, newMax);
                $slider.slider('option', 'value', newValue);
                // Show + button only if user can add more
                if (mode === 'mode-follow' && newMax !== usermaxlimit && op === 'stopped' && isLogged) {
                    // $('#add-concurrency').show();
                }
                else {
                    $('#add-concurrency').hide();
                }
                updateSliderLabel(newValue);
                setSliderLabel(newValue);
                if (data.time_distribution === '0') {
                    autoTimeDistribution(curValue);
                }
                else {
                    timeDistributionInMinutes(data.time_distribution);
                    // @ts-ignore
                    $('#time-distribution').slider('option', 'value', data.time_distribution);
                }
            });
            loadOriginConcurrency();
            changeTestOptionsWrapperPosition();
        });
        if (mode === 'mode-follow') {
            document.getElementById('mode').click();
        }
    }
    function getSelectedLocation(currentLocation) {
        return availableLocations.find(function (x) { return x.id === currentLocation; });
    }
    function setAvailableLocations(workspace) {
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: serverUrl + '/api/' + version + '/workspaces/' + workspace + '?' + background.ApiClientIdentification(),
            dataType: 'json',
            success: function (response) {
                var locations = response.result.locations;
                $('#load-origin').html('');
                availableLocations = []; // reset load locations list
                availableFunctionalLocations = []; // reset functional locations list
                locations.forEach(function (location) {
                    // TODO: Provide proper type
                    if (location.sandbox === false) {
                        availableLocations.push({
                            title: location.title,
                            id: location.id,
                            limits: location.limits,
                        });
                        if (location.hasOwnProperty('purposes') && location.purposes.functional) {
                            availableFunctionalLocations.push({
                                title: location.title,
                                id: location.id,
                                limits: location.limits,
                            });
                        }
                    }
                });
                if ($('#functional-test').is(':checked') && mode !== 'mode-follow') {
                    setFunctionalTestLocations();
                }
                else {
                    setLoadTestLocations();
                }
                $('#load-origin').trigger('chosen:updated');
            },
            error: function () {
                $.elementStatus.html('Error loading locations!');
            },
        });
    }
    function getTestsAndUserLimits() {
        chrome.storage.local.get(null, function (items) {
            serverUrl = items.server;
            setTimeout(function () {
                $('.main_popup').show();
                $('.loader').hide();
            }, 1500);
            $('.welcome a').attr('href', serverUrl + '/app/');
        });
    }
    function removejscssfile(filename, filetype) {
        var targetelement = filetype === 'js' ? 'script' : filetype === 'css' ? 'link' : 'none';
        var targetattr = filetype === 'js' ? 'src' : filetype === 'css' ? 'href' : 'none';
        var allsuspects = document.getElementsByTagName(targetelement);
        for (var i = allsuspects.length; i >= 0; i--) {
            if (allsuspects[i] &&
                allsuspects[i].getAttribute(targetattr) != null &&
                allsuspects[i].getAttribute(targetattr).indexOf(filename) !== -1) {
                allsuspects[i].parentNode.removeChild(allsuspects[i]);
            }
        }
    }
    function loadNewTheme(newTheme) {
        $('.loader').show();
        $('.main_popup').hide();
        background.localSave({
            theme: newTheme,
            accountOptions: {
                account: null,
                workspace: null,
                project: null,
                uid: userId,
            },
        });
        // @ts-ignore
        chrome.extension.sendMessage({
            op: 'themeChanged',
            theme: newTheme,
        });
        removejscssfile('popup.css', 'css');
        if (newTheme !== 'blazemeter') {
            $.getJSON('/config_' + newTheme + '.json', function (dataDefault) {
                $.selectTheme(dataDefault);
            });
        }
        else {
            $.getJSON(background.configFile, function (dataDefault) {
                $.selectTheme(dataDefault);
            });
        }
        if (mode === 'mode-follow') {
            $('.onoffswitch-checkbox').trigger('click');
        }
    }
    function resetLogin() {
        var signedBlock = $('#signed-block');
        var sliderConcurrency = $('#concurrency');
        var sliderTextfield = $('#concurrency-display-textfield');
        $('#options-fieldset-test').addClass('disabled-section');
        $('.main_popup').show();
        $('.loader').hide();
        $('#sign-block').show();
        signedBlock.hide();
        signedBlock.html('');
        // @ts-ignore
        sliderConcurrency.slider({
            disabled: false,
        });
        if (!sliderTextfield.val() || sliderTextfield.val() === 'null') {
            sliderTextfield.val(concurrencyDefault);
            // @ts-ignore
            sliderConcurrency.slider('value', concurrencyDefault);
        }
        background.localSave({
            real_max_follow_limit: concurrencyDefaultMax,
        });
        chrome.storage.local.set({
            logged: false,
        });
        // @ts-ignore
        chrome.extension.sendMessage({
            op: 'reloadoptions',
        });
        isLogged = false;
        $.disableBtn('upload');
        $.disableBtn('upload-jmx');
        $.disableBtn('follow-upload-jmx');
        $.disableBtn('follow-report');
        $.disableBtn('follow-record');
        $('#upload-off input').attr('title', stringLoginContinue);
        $('#follow-record-off input').attr('title', stringLoginContinue);
        $('#upload-jmx-off input').attr('title', stringLoginContinue);
        $('.signup').attr('href', serverUrl + '/app/sign-up?app=chrome&ver=' + manifest.version);
        $('.login').attr('href', serverUrl + '/app/sign-in?app=chrome&ver=' + manifest.version);
        background.localSave({
            accountOptions: {
                account: null,
                workspace: null,
                project: null,
                uid: null,
            },
            account_plan: null,
            account_info: null,
            features: null,
        });
        background.mixpanel.reset();
    }
    function userLoad(serverUrl, customServer) {
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: serverUrl + '/api/' + version + '/user?' + background.ApiClientIdentification(),
            dataType: 'json',
            success: function (response) {
                background.localSave({
                    server: serverUrl,
                    account_info: response.result,
                });
                setTimeout(function () {
                    $.elementStatus.html('');
                }, 2500);
                getTestsAndUserLimits();
                chrome.storage.local.get('theme', function (item) {
                    if (serverUrl === 'https://loadtest.dynatrace.com' && item.theme !== 'dynatrace') {
                        loadNewTheme('dynatrace');
                    }
                    else if (serverUrl !== 'https://loadtest.dynatrace.com' && item.theme !== 'blazemeter') {
                        loadNewTheme('blazemeter');
                    }
                    setAccounts();
                    setUIForLoggedUser(response.result.name, response.result.id);
                    userDefaults = response.result.defaultProject;
                    toggleMode();
                    // Report chrome ext as dimension
                    background.googleAnalytics('set', 'dimension1', manifest.version);
                    // Report theme as dimension
                    background.googleAnalytics('set', 'dimension2', item.theme);
                    // Report server_url as dimension
                    background.googleAnalytics('set', 'dimension3', serverUrl);
                    /*
                     Send a virtual pageview by specifying the path – '/main.html' – otherwise Google Analytics
                     will reject a URL in the format chrome-extension://ojehmjphecelonjjkifejnebdodfjkjd/main.html
                     */
                    background.googleAnalytics('send', 'pageview', 'main.html');
                });
            },
            error: function () {
                console.log('userLoad error');
                resetLogin();
                if (!customServer && serverUrl !== 'https://loadtest.dynatrace.com') {
                    $('#options-fieldset-test').removeClass('disabled-section');
                    requestSetup(true); // now check if its Dynatrace user
                    console.log('userLoad error if 1');
                }
                else {
                    chrome.storage.local.get('theme', function (item) {
                        // hit pageview only once
                        // Report chrome ext as dimension
                        background.googleAnalytics('set', 'dimension1', manifest.version);
                        // Report theme as dimension
                        background.googleAnalytics('set', 'dimension2', item.theme);
                        // Report server_url as dimension
                        background.googleAnalytics('set', 'dimension3', serverUrl);
                        /*
                         Send a virtual pageview by specifying the path – '/main.html' – otherwise Google Analytics
                         will reject a URL in the format chrome-extension://ojehmjphecelonjjkifejnebdodfjkjd/main.html
                         */
                        background.googleAnalytics('send', 'pageview', 'main.html');
                        console.log('userLoad error if 2');
                    });
                }
            },
        });
    }
    function requestSetup(failed) {
        chrome.storage.local.get(null, function (items) {
            if (items.custom_server) {
                userLoad(items.server, items.custom_server);
            }
            else {
                if (!failed) {
                    $.getJSON(background.configFile, function (data) {
                        userLoad(data.server_url, items.custom_server);
                    });
                }
                else {
                    $.getJSON('/config_dynatrace.json', function (data) {
                        userLoad(data.server_url, items.custom_server);
                    });
                }
            }
        });
    }
    $("input[name='requests_to_record']").on('change', function () {
        switch ($(this).val()) {
            case 'top_level':
                $('.following').hide();
                $('.parallel-downloads-wrapper').show();
                if ($('#parallel-downloads-list').find(':selected').val() === 'other') {
                    $('.parallel-downloads-text').show();
                }
                $('#cookie, #record-js, #record-css, #record-other, #record-images').prop('checked', false);
                break;
            case 'top_level_and_following':
                $('.following').show();
                $('.parallel-downloads-wrapper').hide();
                $('.parallel-downloads-text').hide();
                break;
        }
        saveAdvancedOptions();
        background.mixpanelTrack('CE Requests to Record', {
            Value: $(this).val(),
        });
    });
    $('#edit-transaction-labels').on('change', function () {
        $('.autolabel-transactions-wrapper').toggle(this.checked);
        if (this.checked) {
            $('.swiper-container').css({
                overflow: 'visible',
            });
        }
    });
    function saveAdvancedOptions() {
        // Set options
        options.regex_include = $('#regex_include').val();
        options.regex_follow_input = $('#regex_follow_input').val();
        options.requests_to_record = $("input[name='requests_to_record']:checked").val();
        if (mode === 'mode-record') {
            options.cookie = $('#cookie').is(':checked');
            $('#record-cookies').prop('checked', options.cookie);
            options.random_think_time = $('#random-think-time').is(':checked');
            $('#random-think-time').prop('checked', options.random_think_time);
        }
        else {
            options.cookie = $('#record-cookies').is(':checked');
            if (options.cookie) {
                $('#cookie').prop('checked', true);
                // @todo: test this:
                // $('#following').prop('checked', true);
            }
            else {
                $('#cookie').prop('checked', false);
            }
        }
        options.cache = $('#cache').is(':checked');
        options.service_workers = $('#service-workers').is(':checked');
        options.update_settings = $('#update-settings').is(':checked');
        options.record_css = $('#record-css').is(':checked');
        options.record_js = $('#record-js').is(':checked');
        options.record_images = $('#record-images').is(':checked');
        options.record_ajax = $('#record-ajax').is(':checked');
        options.functional_test = $('#functional-test').is(':checked');
        options.record_redirects = $('#record-redirects').is(':checked');
        options.record_other = $('#record-other').is(':checked');
        // options.edit_transaction_labels = $('#edit-transaction-labels').is(':checked');
        options.edit_transaction_labels = true;
        options.autolabel_transactions = $('#autolabel-transactions').is(':checked');
        background.localSave({ options: options });
    }
    function updateSliderTimeDistribution(newValue) {
        background.localSave({
            time_distribution: newValue,
        });
        chrome.storage.local.get('concurrency', function (item) {
            if (newValue === 0) {
                autoTimeDistribution(item.concurrency);
            }
            else {
                timeDistributionInMinutes(newValue);
            }
        });
    }
    function initFollowMeOptions() {
        chrome.storage.local.get(null, function (all) {
            if (all.test_name) {
                $('#follow-name').val(all.test_name);
            }
            else {
                $('#follow-name').val('');
            }
            initFollowMeInterface();
            var concurrency = all.concurrency;
            // @ts-ignore
            $('#concurrency').slider('option', 'value', concurrency);
            $('#concurrency-display-textfield').val(concurrency);
            if (all.location) {
                $('#load-origin').val(all.location);
            }
            else {
                $('#load-origin').val(locationDefault);
            }
        });
    }
    // show/hide license info by clicking on info button
    function licenseInfoListener() {
        $('.info-button i').on('click', function () {
            // @ts-ignore
            $('.license-info').toggle('slide');
        });
    }
    licenseInfoListener();
    chrome.storage.local.get(null, function (items) {
        requestSetup(false);
        $('#sign-block').show();
        if (!items.time_distribution) {
            timeDistributionInMinutes(10, true);
            background.localSave({
                time_distribution: 0,
                auto_time_distribution: 10,
            });
        }
    });
    if ($("input[name='requests_to_record']:checked").val() !== 'top_level_and_following') {
        $('#cookie, #record-js, #record-css, #record-other, #record-images').prop('checked', false);
    }
    $('.selectall').on('click', function () {
        $('.include-domains :checkbox').each(function () {
            this.checked = true;
        });
    });
    $('.include-domains').on('click', function () {
        checkDownloadCheckboxState();
    });
    $('.unselectall').on('click', function () {
        $('.include-domains :checkbox').each(function () {
            this.checked = false;
        });
    });
    $('#concurrency').slider({ disabled: true });
    $('#add-concurrency').on('click', function () {
        background.mixpanelTrack('CE Increase Concurrency Clicked');
        if (op === 'stopped' && mode !== 'mode-record' && isLogged) {
            // changeSliderMax();
        }
    });
    $('.version').html(manifest.version);
    $('.checkbox-wrapper input:checkbox').on('change', function () {
        saveAdvancedOptions();
        background.mixpanelTrack('CE ' + $.trim($(this).parent().text()) + ' checkbox changed', {
            Value: $(this).is(':checked'),
        });
    });
    $('#regex_include').on('keyup', function () {
        saveAdvancedOptions();
    });
    $('#regex_include').on('change', function () {
        background.mixpanelTrack('CE Filter Pattern Changed', {
            Value: $(this).val(),
        });
    });
    $('#regex_follow_input').on('change', function () {
        background.mixpanelTrack('CE Domains To Follow Changed', {
            Value: $(this).val(),
        });
    });
    // When Functional test is enabled, update Locations list
    $('#functional-test').on('change', function () {
        // reload available tests on functional test checkbox change
        // if functional test checkbox checked show list of only functional tests existing
        // else show list of only load tests existing
        chrome.storage.local.get('accountOptions', function (item) {
            loadProjectTests(item.accountOptions.project);
        });
        if ($(this).is(':checked')) {
            setFunctionalTestLocations();
        }
        else {
            var sliderConcurrency = $('#concurrency');
            sliderConcurrency.slider({
                disabled: false,
            });
            sliderConcurrency.slider('option', 'value', '1');
            sliderConcurrency.slider('option', 'max', MAX_RECORDING_LIMIT);
            setLoadTestLocations();
        }
    });
    // user agent parse json and set from storage
    $.getJSON(chrome.extension.getURL('js') + '/useragentswitcher.json', function (data) {
        var userArray = [];
        var list = $('#user-agents-list');
        list.append('<option value="Current Browser">Current Browser</option>');
        $.each(data, function (key, value) {
            if (typeof value.useragent !== 'undefined') {
                userArray.push(value);
            }
            if (typeof value.folder !== 'undefined') {
                var array = value.folder;
                if (typeof array.useragent !== 'undefined') {
                    userArray.push(array);
                }
                $.each(array, function (key, value) {
                    if (typeof value.useragent !== 'undefined') {
                        userArray.push(value);
                    }
                    if (typeof value.folder !== 'undefined') {
                        $.each(value.folder, function (key, valueUseragent) {
                            userArray.push(valueUseragent);
                        });
                    }
                });
            }
        });
        $.each(userArray, function (key, useragent) {
            if (useragent._description !== 'UA List :: About') {
                var listgroup_1 = '<optgroup label="' + useragent._description + '">' + useragent._description + '</optgroup>';
                if (typeof useragent.useragent !== 'undefined') {
                    $.each(useragent.useragent, function (key, useragents) {
                        var listoption;
                        if (typeof useragents === 'string') {
                            listoption =
                                '<option value="' +
                                    useragent.useragent._useragent +
                                    '">' +
                                    useragent.useragent._description +
                                    '</option>';
                            listgroup_1 += listoption;
                        }
                        else {
                            listoption =
                                '<option value="' +
                                    useragents._useragent +
                                    '">' +
                                    useragents._description +
                                    '</option>';
                            listgroup_1 += listoption;
                        }
                    });
                    list.append(listgroup_1);
                }
            }
        });
        chrome.storage.local.get('options', function (items) {
            if (items.options && items.options.useragent) {
                $('#user-agents-list').val(items.options.useragent);
            }
            else {
                $('#user-agents-list').val('Current Browser');
            }
            // @ts-ignore
            list.chosen();
        });
        return false;
    });
    // Record/Follow Me switch
    $('.onoffswitch-checkbox').on('click', function (e) {
        if (op !== 'stopped') {
            e.preventDefault();
        }
        else {
            mode = $(this).val();
            chrome.storage.local.get('disable_followme', function (item) {
                if (item.disable_followme === 'TRUE') {
                    mode = 'mode-record';
                }
                toggleMode();
                chrome.storage.local.set({
                    mode: mode,
                });
                chrome.extension.sendRequest({
                    type: 'switch_mode',
                });
                if (op !== 'stopped' && op !== 'pause') {
                    $.elementStatus.html('');
                    $.disableBtn('record');
                    $.enableBtn('pause');
                    $.enableBtn('stop');
                }
                var modeValue = 'Record';
                // merge-modify
                // Hide recording-mode settings and show them on follow-me mode
                if (mode !== 'mode-record') {
                    modeValue = 'FollowMe';
                    // expandAdvancedOptions();
                    // $('#test-configuration').css({display: "block"});
                }
                else {
                    // collapseAdvancedOptions();
                    // $('#test-configuration').css({display: "none"});
                }
                background.mixpanelTrack('CE Record/FollowMe Switched', {
                    Value: modeValue,
                });
            });
        }
    });
    // Concurrency textfield
    $('#concurrency-display-textfield').on('change', function () {
        var value = parseInt($(this).val(), 10);
        background.mixpanelTrack('CE Concurrency Textfield Changed', {
            Concurrency: value,
        });
        chrome.storage.local.get('real_max_follow_limit', function (item) {
            var realmax = parseInt(item.real_max_follow_limit, 10);
            if (isNaN(value)) {
                value = concurrencyDefault;
                $('#concurrency-display-textfield').val(concurrencyDefault);
            }
            else if (op === 'follow') {
                var followmax = $('#concurrency').slider('option', 'max');
                if (value > followmax) {
                    $('#concurrency').slider('value', followmax);
                    $('#concurrency-display-textfield').val(followmax);
                    value = followmax;
                }
            }
            if (value > realmax) {
                value = realmax;
                $('#concurrency-display-textfield').val(value);
            }
            $('#concurrency').slider('value', value);
            background.localSave({
                concurrency: value,
            });
        });
    });
    $('#load-origin').on('change', function () {
        background.localSave({
            location: $(this).val(),
        });
        loadOriginConcurrency();
        background.mixpanelTrack('CE Load Origin Changed', {
            'Location name': $('#load-origin option:selected').text(),
            Value: $(this).val(),
        });
    });
    $('#parallel-downloads-list').on('chosen:hiding_dropdown', function () {
        // Remove unneeded elements
        $('#parallel_downloads_list_chosen > div > ul > li').remove();
    });
    $('#parallel-downloads-list').on('change', function (event, source) {
        // Save which select option was selected
        background.localSave({
            parallelDownloadsList: $(this).val(),
        });
        if ($(this).val() === 'other') {
            // Show textfield
            $('.parallel-downloads-text').show();
        }
        else {
            // Hide textfield
            $('.parallel-downloads-text').hide();
            // Save parallel number of downloads value
            background.localSave({
                parallel_downloads: $(this).find(':selected').data('value'),
            });
        }
        if (source !== 'reset') {
            // Send Mixpanel event, only if event is not generated by Reset button
            background.mixpanelTrack('CE Parallel Number of Downloads Changed', {
                Name: $('#load-origin option:selected').text(),
                Value: $(this).val(),
            });
        }
    });
    $('#cookie, #record-js, #record-css, #record-other, #record-images').on('change', function () {
        if ($(this).is(':checked')) {
            $('input:radio[name="requests_to_record"]')
                .filter('[value="top_level_and_following"]')
                .prop('checked', true);
        }
        saveAdvancedOptions();
    });
    $('#update-settings').on('change', function () {
        if (isLogged) {
            if ($(this).is(':checked')) {
                $('#button-upload-jmeter input').attr('title', stringAdjustPropCloud);
                $('#upload-off input').attr('title', stringAdjustPropCloud);
            }
            else {
                $('#button-upload-jmeter input').attr('title', stringRunCloud);
                $('#upload-off input').attr('title', stringRunCloud);
            }
        }
    });
    $('.login').on('click', function () {
        background.mixpanelTrack('CE Login Clicked');
    });
    $('.question_style').on('click', function () {
        background.mixpanelTrack('CE Guide Link Clicked');
    });
    $('.help a').on('click', function () {
        background.mixpanelTrack('CE Guide Link Clicked');
    });
    $('.signup').on('click', function () {
        background.mixpanelTrack('CE Signup Clicked');
    });
    $('#record').find('input').tooltip();
    $('.onoffswitch-label').tooltip();
    $('#record-off').find('input').tooltip();
    $('#upload').find('input').tooltip();
    $('#upload-off').find('input').tooltip();
    $('#follow-record').find('input').tooltip();
    $('#follow-record-off').find('input').tooltip();
    $('#follow-stop').find('input').tooltip();
    $('#follow-stop-off').find('input').tooltip();
    $('#reset').find('input').tooltip();
    $('#reset-off').find('input').tooltip();
    $('#follow-reset').find('input').tooltip();
    $('#follow-reset-off').find('input').tooltip();
    $('.tooltip-btn').tooltip();
    $('#add-concurrency').tooltip();
    $('.description a').tooltip();
    $('.time-distribution-wrapper label').attr('title', stringTimeDistDesc);
    $('.time-distribution-display').attr('title', stringTimeDistDesc);
    $('.time-distribution-wrapper label').tooltip();
    $('.time-distribution-display').tooltip();
    $('.description').tooltip();
    $.elementName.on('change', function () {
        background.mixpanelTrack('CE Test Name Changed', {
            Value: $(this).val(),
        });
    });
    $('#follow-name').on('change', function () {
        background.mixpanelTrack('CE Follow Name Changed', {
            Value: $(this).val(),
        });
    });
    // Save name on out of focus
    $.elementName.on('keyup', function () {
        background.localSave({
            record_name: $(this).val(),
            jmxname: $(this).val(),
        });
        // merge-modify
        // Functional suite name update
        if ($(this).val()) {
            functionalRecorder.updateSuiteName($(this).val());
        }
        //
        if (string_utils_1.stringIsEmpty($.elementName.val())) {
            $.disableBtn('edit');
            $.disableBtn('debugger');
            $.disableBtn('download');
            $.disableBtn('upload');
            $.disableBtn('upload-jmx');
        }
        else {
            $.enableBtn('edit');
            $.enableBtn('download');
            $.enableBtn('debugger');
            if (isLogged) {
                $.enableBtn('upload');
                $.enableBtn('upload-jmx');
            }
        }
    });
    function field_numeric_enforcer(field) {
        var val = parseInt(field.val(), 10);
        var min = parseInt(field.attr('min'), 10);
        var max = parseInt(field.attr('max'), 10);
        if (isNaN(val)) {
            val = min;
            field.val(min);
        }
        else {
            if (typeof min !== 'undefined' && val < min) {
                val = min;
                field.val(min);
            }
            if (typeof max !== 'undefined' && val > max) {
                val = max;
                field.val(max);
            }
        }
        return val;
    }
    $('#parallel_downloads').on('change', function () {
        var val = field_numeric_enforcer($(this));
        background.mixpanelTrack('CE Parallel Downloads Changed');
        background.localSave({
            parallel_downloads: val,
        });
    });
    // Save name on out of focus
    $('#follow-name').on('keyup', function () {
        var val = $(this).val();
        if (val.replace(/ /g, '').length < 1) {
            $.disableBtn('follow-record');
        }
        else {
            background.localSave({
                test_name: $(this).val(),
                jmxname: $(this).val(),
            });
            var regexinput = $('#regex_follow_input').val();
            if (isLogged && regexinput.replace(/ /g, '').length > 0 && !string_utils_1.stringIsEmpty(regexinput)) {
                $.enableBtn('follow-record');
            }
        }
    });
    // Save regex follow
    $('#regex_follow_input').on('keyup', function () {
        var val = $(this).val();
        if (val.replace(/ /g, '').length < 1) {
            $.disableBtn('follow-record');
        }
        else {
            var followinput = $('#follow-name').val();
            if (isLogged &&
                followinput.replace(/ /g, '').length > 0 &&
                !string_utils_1.stringIsEmpty(followinput) &&
                op === 'stopped') {
                $.enableBtn('follow-record');
            }
        }
        saveAdvancedOptions();
        chrome.extension.sendRequest({
            type: 'change_regex_follow_input',
        });
    });
    initFollowMeInterface();
    initRecordInterface();
    hideRecordingActions();
    chrome.storage.local.get(null, function (all) {
        chrome.storage.local.get(null, function (localAll) {
            isLogged = localAll.logged;
            if (JSON.stringify(all) !== '{}') {
                if (all.record_name) {
                    $('#name').val(all.record_name);
                }
                if (all.test_name) {
                    $('#follow-name').val(all.test_name);
                }
                if (all.options) {
                    options = all.options;
                    if (options.regex_follow_input) {
                        $('#regex_follow_input').val(options.regex_follow_input);
                    }
                    else {
                        $('#regex_follow_input').val('');
                    }
                    if (options.regex_include) {
                        $('#regex_include').val(options.regex_include);
                    }
                    else {
                        $('#regex_include').val('http://*/*, https://*/*');
                    }
                    $('input:radio[name="requests_to_record"]')
                        .filter('[value="' + options.requests_to_record + '"]')
                        .prop('checked', true);
                    $('#cache').prop('checked', options.cache);
                    $('#service-workers').prop('checked', options.service_workers);
                    $('#cookie').prop('checked', options.cookie);
                    $('#record-cookies').prop('checked', options.cookie);
                    $('#update-settings').prop('checked', options.update_settings);
                    $('#record-css').prop('checked', options.record_css);
                    $('#record-js').prop('checked', options.record_js);
                    $('#record-images').prop('checked', options.record_images);
                    $('#record-ajax').prop('checked', options.record_ajax);
                    $('#functional-test').prop('checked', options.functional_test);
                    $('#record-redirects').prop('checked', options.record_redirects);
                    $('#record-other').prop('checked', options.record_other);
                    $('#edit-transaction-labels').prop('checked', options.edit_transaction_labels);
                    $('#autolabel-transactions').prop('checked', options.autolabel_transactions);
                    $('#random-think-time').prop('checked', options.random_think_time);
                    if (options.edit_transaction_labels) {
                        $('.autolabel-transactions-wrapper').show();
                        $('.swiper-container').css({
                            overflow: 'abort-testvisible',
                        });
                    }
                    if (options.requests_to_record === 'top_level_and_following') {
                        $('.following').show();
                        $('.parallel-downloads-wrapper').hide();
                        $('.parallel-downloads-text').hide();
                    }
                }
                else {
                    // First time run, save options
                }
                if (all.parallel_downloads) {
                    $('#parallel_downloads').val(all.parallel_downloads);
                }
                else {
                    $('#parallel_downloads').val($('#parallel_downloads').attr('data-default'));
                    background.localSave({
                        parallel_downloads: $('#parallel_downloads').attr('data-default'),
                    });
                }
                if (all.parallelDownloadsList) {
                    $('#parallel-downloads-list').val(all.parallelDownloadsList).trigger('chosen:updated');
                    if (all.parallelDownloadsList === 'other' && options.requests_to_record === 'top_level') {
                        // Show textfield
                        $('.parallel-downloads-text').show();
                    }
                }
            }
            if (!all.concurrency) {
                background.localSave({
                    concurrency: concurrencyDefault,
                });
            }
            // Concurrency slider
            $('#concurrency').slider({
                range: 'max',
                min: 1,
                max: MAX_RECORDING_LIMIT,
                value: all.concurrency,
                slide: function (event, ui) {
                    updateSliderLabel(ui.value);
                },
                change: function (event, ui) {
                    setSliderLabel(ui.value);
                },
                stop: function (event, ui) {
                    background.mixpanelTrack('CE Concurrency Slider Changed', {
                        Concurrency: ui.value,
                    });
                },
            });
            $('#time-distribution').slider({
                range: 'max',
                min: 0,
                max: 300,
                step: 10,
                value: all.time_distribution,
                slide: function (event, ui) {
                    updateSliderTimeDistribution(ui.value);
                },
                stop: function (event, ui) {
                    background.mixpanelTrack('CE Time Distribution Slider Changed', {
                        Value: ui.value,
                    });
                },
            });
            if (all.time_distribution == '0') {
                autoTimeDistribution(all.concurrency);
            }
            else {
                timeDistributionInMinutes(all.time_distribution);
                $('#time-distribution').slider('option', 'value', all.time_distribution);
            }
            // merge-modify
            // Added local variables load
            // if (typeof all['chk-yaml'] !== 'undefined') $('#chk-yaml').prop('checked', all["chk-yaml"]);
            // if (typeof all['chk-jmx'] !== 'undefined') $('#chk-jmx').prop('checked', all["chk-jmx"]);
            // if (typeof all['chk-taurus'] !== 'undefined') $('#chk-taurus').prop('checked', all["chk-taurus"]);
            checkDownloadCheckboxState();
            if (typeof localAll.mode === 'undefined') {
                mode = 'mode-record';
                startRecMode = 'mode-record';
                chrome.storage.local.set({
                    start_recording_mode: 'mode-record',
                    mode: 'mode-record',
                });
            }
            else {
                mode = localAll.mode;
                startRecMode = localAll.start_recording_mode;
            }
            // Show/hide test config options
            if (mode !== 'mode-record') {
                // $('#test-configuration').css({display: "block"});
            }
            else {
                // $('#test-configuration').css({display: "none"});
            }
            chrome.extension.sendRequest({
                type: 'get_status',
            }, function (data) {
                op = data.op;
                toggleMode();
                if (op === 'record') {
                    setTooltipRecordButton(tooltipBigRecordButtonDefault);
                    // Record mode running
                    $.disableBtn('record');
                    $.disableBtn('reset');
                    $.enableBtn('pause');
                    $.enableBtn('stop');
                    $('#cookie, #record-js, #record-css, #record-other, #record-images, #record-ajax, #edit-transaction-labels').prop('disabled', true);
                    $('input:radio[name="requests_to_record"]').prop('disabled', true);
                }
                else if (op === 'follow') {
                    // Follow mode running
                    $.disableBtn('follow-record');
                    $.disableBtn('follow-reset');
                    $.enableBtn('follow-pause');
                    $.enableBtn('follow-stop');
                    $.enableBtn('follow-report');
                    // When the test is running, the load origin becomes read only.
                    $('#load-origin').prop('disabled', true).trigger('chosen:updated');
                    // When the test is running, the select script becomes read only.
                    $('#follow-name').prop('disabled', true);
                    $('#add-concurrency').hide();
                    // Recording is also running if following
                    $.disableBtn('record');
                    $.disableBtn('reset');
                    $.enableBtn('pause');
                    $.enableBtn('stop');
                    // $('#accounts, #projects, #workspaces').prop('disabled', true).trigger('chosen:updated');
                }
                else if (op === 'pause') {
                    setTooltipRecordButton(tooltipBigRecordButtonResume);
                    $.enableBtn('follow-stop');
                    // When the test is running, the load origin becomes read only.
                    $('#load-origin').prop('disabled', true).trigger('chosen:updated');
                    // When the test is running, the select script becomes read only.
                    $('#follow-name').prop('disabled', true);
                    $.enableBtn('stop');
                    $.disableBtn('follow-pause');
                    $.enableBtn('follow-record');
                    $.disableBtn('pause');
                    $.enableBtn('reset');
                    // $('#accounts, #projects, #workspaces').prop('disabled', true).trigger('chosen:updated');
                    $('#cookie, #record-js, #record-css, #record-other, #record-images, #record-ajax').prop('disabled', false);
                    $('input:radio[name="requests_to_record"]').prop('disabled', false);
                    $('#edit-transaction-labels').prop('disabled', true);
                    if (startRecMode === 'mode-record') {
                        $.enableBtn('record');
                    }
                    else {
                        $.disableBtn('record');
                    }
                }
                else if (op === 'waiting') {
                    $.waitOverlay(1);
                }
                else if (op === 'stopped') {
                    if (localAll.test_id) {
                        $.enableBtn('follow-report');
                    }
                    $('#cookie, #record-js, #record-css, #record-other, #record-images, #record-ajax, #edit-transaction-labels').prop('disabled', false);
                    $('input:radio[name="requests_to_record"]').prop('disabled', false);
                    chrome.extension.sendRequest({
                        type: 'traffic_exists',
                    }, function (exists) {
                        // merge-modify
                        // Also checks if the functional recording exists
                        chrome.runtime.sendMessage({ command: 'getCurrentSuite' }, function (functionalResponse) {
                            chrome.storage.local.get('test_name', function (item) {
                                if ((exists || functionalResponse.suite) && !string_utils_1.stringIsEmpty(item.record_name)) {
                                    $('#recording-actions').addClass('opened');
                                    if (mode === 'mode-record') {
                                        showRecordingActions(false);
                                    }
                                    if ((exists || background.cRecorder.currentSuite) &&
                                        !string_utils_1.stringIsEmpty($.elementName.val())) {
                                        $.enableBtn('download');
                                        $.enableBtn('edit');
                                        if (isLogged) {
                                            $.enableBtn('upload');
                                        }
                                    }
                                    else {
                                        $.disableBtn('edit');
                                        $.disableBtn('upload');
                                    }
                                    // if JMeter traffic was not recorded make buttons not active
                                    showHideButtonsByExistingTraffic(exists);
                                    if (functionalResponse.suite) {
                                        $.enableBtn('debugger');
                                    }
                                    else {
                                        $.disableBtn('debugger');
                                    }
                                }
                                else {
                                    $.disableBtn('edit');
                                    $.disableBtn('download');
                                    $.disableBtn('debugger');
                                    $.disableBtn('upload');
                                    $.disableBtn('upload-jmx');
                                }
                            });
                        });
                    });
                    chrome.extension.sendRequest({
                        type: 'traffic_exists_follow',
                    }, function (exists) {
                        if (exists) {
                            $.enableBtn('follow-report');
                            $.enableBtn('follow-upload-jmx');
                        }
                    });
                }
                else {
                    $.enableBtn('record');
                    $.enableBtn('reset');
                    $.disableBtn('pause');
                    $.disableBtn('stop');
                }
            });
            if (all.stopped_test) {
                $.testEndedOverlay();
            }
        });
    });
    function startRecording() {
        // Validate filter pattern field before starting recording
        if (!validateFilterPattern($('#regex_include').val())) {
            $.elementStatus.html('Incorrect Filter pattern!');
            return false;
        }
        chrome.browserAction.setBadgeText({
            text: '',
        });
        // background.localSave({'chk-yaml':true});
        // background.localSave({'chk-jmx':true});
        background.localSave({ 'chk-taurus': true });
        $('#regex_include').removeClass('text-error');
        background.mixpanelTrack('CE Start Recording');
        var timeString = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
        var H = +timeString.substr(0, 2);
        var h = H % 12 || 12;
        var ampm = H < 12 ? ' AM' : ' PM';
        timeString = h + timeString.substr(2, 6) + ampm;
        while (timeString.indexOf(':') > 0) {
            timeString = timeString.replace(':', '.');
        }
        var currentTime = $.datepicker.formatDate('mm-dd-y', new Date());
        if (string_utils_1.stringIsEmpty($.elementName.val())) {
            var defaultTestName = 'RECORD ' + currentTime + ' ' + timeString;
            $.elementName.val(defaultTestName);
            background.cRecorder.defaultTestName = defaultTestName;
        }
        background.localSave({
            record_name: $.elementName.val(),
            jmxname: $.elementName.val(),
        });
        // Functional suite name update
        functionalRecorder.updateSuiteName($.elementName.val());
        startRecMode = mode;
        chrome.storage.local.set({
            start_recording_mode: mode,
        });
        // Set options
        saveAdvancedOptions();
        $.disableBtn('edit');
        $.disableBtn('download');
        $.disableBtn('debugger');
        $.disableBtn('upload');
        $.disableBtn('upload-jmx');
        $.disableBtn('reset');
        $('input:radio[name="requests_to_record"]').prop('disabled', true);
        $('#cache').prop('disabled', true);
        $('#service-workers').prop('disabled', true);
        $('#cookie').prop('disabled', true);
        $('#record-css').prop('disabled', true);
        $('#record-js').prop('disabled', true);
        $('#record-images').prop('disabled', true);
        $('#record-ajax').prop('disabled', true);
        $('#edit-transaction-labels').prop('disabled', true);
        $('#record-other').prop('disabled', true);
        $('#update-settings').prop(function () {
            saveAdvancedOptions();
        });
        $.elementStatus.html('');
        $.disableBtn('record');
        $.enableBtn('pause');
        // $('#accounts, #projects, #workspaces').prop('disabled', true).trigger('chosen:updated');
        $.enableBtn('stop');
        chrome.extension.sendRequest({
            type: 'start_traffic',
        });
        // merge-modify
        // Functional recorder start command
        if (op === 'stopped') {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs.length > 0 && tabs[0].hasOwnProperty('id')) {
                    var message = {
                        command: 'start_recording',
                        suite_name: $.elementName.val(),
                        recordingTab: tabs[0],
                    };
                    webextension_polyfill_ts_1.browser.runtime.sendMessage(message).catch(function (reason) {
                        console.log('Failed starting recorder: ');
                        console.log(reason);
                    });
                    // Closes the popup
                    window.top.close();
                }
            });
        }
        else if (op === 'pause') {
            webextension_polyfill_ts_1.browser.runtime.sendMessage({ command: 'resume_recording' }).catch(function (reason) {
                console.log('Failed stopping recorder: ');
                console.log(reason);
            });
        }
        op = 'record';
    }
    $.resetRecording = function resetRecording() {
        op = 'stopped';
        background.mixpanelTrack('CE Reset Recording');
        $.elementName.val('');
        startRecMode = '';
        $('#regex_include').removeClass('text-error');
        chrome.storage.local.set({
            start_recording_mode: '',
        });
        $('#concurrency').slider({ disabled: true });
        $('.parallel-downloads-wrapper').show();
        setTooltipRecordButton(tooltipBigRecordButtonDefault);
        removeTransactionPopupMessage();
        // hideRecordingActions(true);
        chrome.extension.sendRequest({
            type: 'reset_traffic',
        }, function () {
            background.localSave({
                test_name: '',
                location: locationDefault,
                record_name: '',
                concurrency: concurrencyDefault,
                time_distribution: 0,
            });
            chrome.storage.local.set({
                test_id: null,
                record_id: null,
            });
            $('#concurrency').slider('option', 'value', concurrencyDefault);
            $('#time-distribution').slider('option', 'value', '0');
            autoTimeDistribution(0);
            $('#concurrency-textfield').val(0);
            background.localSave({
                location: locationDefault,
            });
            $('#load-origin').prop('disabled', false).trigger('chosen:updated');
            $('#follow-name').prop('disabled', false);
            $('#user-agents-list').val('Current Browser');
            $('#user-agents-list').trigger('chosen:updated');
            initFollowMeOptions();
            options.requests_to_record = 'top_level';
            options.record_ajax = true;
            options.functional_test = false;
            options.cookie = false;
            options.record_css = false;
            options.record_js = false;
            options.record_images = false;
            options.record_redirects = false;
            options.record_other = false;
            options.edit_transaction_labels = false;
            options.autolabel_transactions = false;
            options.cache = true;
            options.service_workers = true;
            options.random_think_time = true;
            options.update_settings = false;
            options.regex_include = 'http://*/*, https://*/*';
            options.regex_follow_input = '';
            options.useragent = 'Current Browser';
            background.localSave({
                options: options,
                record_name: '',
                jmxname: '',
                parallel_downloads: $('#parallel_downloads').attr('data-default'),
            });
            $.elementName.val('');
            $('#regex_follow_input').val('');
            $('#regex_include').val(options.regex_include);
            $('input:radio[name="requests_to_record"]')
                .filter('[value="' + options.requests_to_record + '"]')
                .prop('checked', true);
            $('#regex_follow_input').prop('checked', options.regex_follow_input);
            $('#cookie').prop('checked', options.cookie);
            $('#record-cookies').prop('checked', options.cookie);
            $('#cache').prop('checked', options.cache);
            $('#service-workers').prop('checked', options.service_workers);
            $('#update-settings').prop('checked', options.update_settings);
            $('#record-css').prop('checked', options.record_css);
            $('#record-js').prop('checked', options.record_js);
            $('#record-images').prop('checked', options.record_images);
            $('#record-ajax').prop('checked', options.record_ajax);
            $('#functional-test').prop('checked', options.functional_test);
            $('#record-redirects').prop('checked', options.record_redirects);
            $('#record-other').prop('checked', options.record_other);
            $('#edit-transaction-labels').prop('checked', options.edit_transaction_labels);
            $('#autolabel-transactions').prop('checked', options.autolabel_transactions);
            $('#random-think-time').prop('checked', options.random_think_time);
            $('.autolabel-transactions-wrapper').hide();
            $('#parallel-downloads-list').val('Chrome').trigger('chosen:updated').trigger('change', ['reset']);
            $('#parallel_downloads').val($('#parallel_downloads').attr('data-default'));
            $('.following').hide();
            collapseAdvancedOptions();
            if (isLogged) {
                setDefaultProject(true);
            }
            initRecordInterface();
            $.elementStatus.html('Options were reset');
            chrome.browserAction.setBadgeText({
                text: '',
            });
            // loadOriginConcurrency();
            $('#concurrency').slider({ disabled: false });
            // merge-modify
            // Functional recorder pause command
            webextension_polyfill_ts_1.browser.runtime.sendMessage({ command: 'reset_recording' }).catch(function (reason) {
                console.log('Failed reseting recorder: ');
                console.log(reason);
            });
        });
    };
    function pauseRecording() {
        op = 'pause';
        setTooltipRecordButton(tooltipBigRecordButtonResume);
        if (mode === 'mode-follow') {
            background.mixpanelTrack('CE Pause FollowMe Test');
        }
        else {
            background.mixpanelTrack('CE Pause Recording');
        }
        chrome.extension.sendRequest({
            type: 'pause_traffic',
        }, function () {
            if (startRecMode === 'mode-record') {
                $.enableBtn('record');
            }
            else {
                $.enableBtn('follow-record');
                $.disableBtn('record');
                startRecMode = 'mode-follow';
            }
            chrome.storage.local.set({
                start_recording_mode: startRecMode,
            });
            $.disableBtn('pause');
            $.enableBtn('reset');
            $.disableBtn('follow-pause');
            $.elementStatus.html('Recording paused!');
            $('#cookie, #record-js, #record-css, #record-other, #record-images, #record-ajax').prop('disabled', false);
            $('input:radio[name="requests_to_record"]').prop('disabled', false);
        });
        if (mode === 'mode-record') {
            // merge-modify
            // Functional recorder pause command
            webextension_polyfill_ts_1.browser.runtime.sendMessage({ command: 'pause_recording' }).catch(function (reason) {
                console.log('Failed pausing recorder: ');
                console.log(reason);
            });
        }
    }
    $.stopRecording = function stopRecording() {
        removeTransactionPopupMessage();
        setTooltipRecordButton(tooltipBigRecordButtonDefault);
        $('#user-agents-list').prop('disabled', false).trigger('chosen:updated');
        $('input:radio[name="requests_to_record"]').prop('disabled', false);
        $('#cache').prop('disabled', false);
        $('#service-workers').prop('disabled', false);
        $('#cookie').prop('disabled', false);
        $('#record-css').prop('disabled', false);
        $('#record-js').prop('disabled', false);
        $('#record-images').prop('disabled', false);
        $('#record-ajax').prop('disabled', false);
        $('#edit-transaction-labels').prop('disabled', false);
        $('#record-other').prop('disabled', false);
        op = 'stopped';
        chrome.extension.sendRequest({
            type: 'stop_traffic',
        }, function () {
            chrome.storage.local.get(null, function (items) {
                // $('#accounts, #projects, #workspaces').prop('disabled', false).trigger('chosen:updated');
                if (mode === 'mode-follow') {
                    $.disableBtn('follow-pause');
                    $.disableBtn('follow-stop');
                    $.enableBtn('follow-record');
                    $.enableBtn('follow-reset');
                    $('#load-origin').prop('disabled', false).trigger('chosen:updated');
                    $('#follow-name').prop('disabled', false);
                    $('#overlay').remove();
                }
                else {
                    $.disableBtn('pause');
                    $.disableBtn('stop');
                    $.enableBtn('record');
                    $.enableBtn('reset');
                }
                if (startRecMode !== 'mode-record') {
                    // mode-follow
                    $.disableBtn('follow-pause');
                    $.disableBtn('follow-stop');
                    $.enableBtn('follow-record');
                    $.enableBtn('follow-reset');
                    $('#load-origin').prop('disabled', false).trigger('chosen:updated');
                    $('#follow-name').prop('disabled', false);
                    $('#concurrency').slider('option', 'max', items.real_max_follow_limit);
                    $('#overlay').remove();
                    // mode-record
                    $.disableBtn('pause');
                    $.disableBtn('stop');
                    $.enableBtn('record');
                    $.enableBtn('reset');
                }
                chrome.extension.sendRequest({
                    type: 'traffic_exists',
                }, function (exists) {
                    chrome.runtime.sendMessage({ command: 'getCurrentSuite' }, function (functionalResponse) {
                        if (exists || functionalResponse.suite) {
                            if (string_utils_1.stringIsEmpty(items.record_name)) {
                                // If name is empty
                                chrome.extension.sendRequest({
                                    type: 'get_status',
                                }, function (data) {
                                    op = data.op;
                                    var timeString = new Date()
                                        .toTimeString()
                                        .replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
                                    var H = +timeString.substr(0, 2);
                                    var h = H % 12 || 12;
                                    var ampm = H < 12 ? ' AM' : ' PM';
                                    timeString = h + timeString.substr(2, 6) + ampm;
                                    while (timeString.indexOf(':') > 0) {
                                        timeString = timeString.replace(':', '.');
                                    }
                                    var currentTime = $.datepicker.formatDate('mm-dd-y', new Date());
                                    var nameVal = $.elementName.val();
                                    if (string_utils_1.stringIsEmpty(nameVal)) {
                                        $.elementName.val('RECORD ' + currentTime + ' ' + timeString);
                                        nameVal = 'RECORD ' + currentTime + ' ' + timeString;
                                    }
                                    background.localSave({
                                        options: options,
                                        record_name: nameVal,
                                        jmxname: nameVal,
                                    });
                                    // Functional suite name update
                                    functionalRecorder.updateSuiteName(nameVal);
                                });
                            }
                            // Enable edit button if there is data to edit
                            $.enableBtn('edit');
                            $.enableBtn('download');
                            $.enableBtn('debugger');
                            if (mode === 'mode-record') {
                                showRecordingActions(true);
                                showHideButtonsByExistingTraffic(exists);
                            }
                            // The upload button should be enabled only if a. you are logged in b.
                            // you are in stop mode c. there is something to upload d. the name is
                            // full
                            if (isLogged) {
                                $.enableBtn('upload');
                                $.enableBtn('upload-jmx');
                            }
                        }
                    });
                });
                chrome.extension.sendRequest({
                    type: 'traffic_exists_follow',
                }, function (exists) {
                    if (exists) {
                        $.enableBtn('follow-upload-jmx');
                        $.enableBtn('follow-report');
                    }
                });
                startRecMode = '';
                chrome.storage.local.set({
                    start_recording_mode: '',
                });
                if (mode === 'mode-follow') {
                    $.elementStatus.html('FollowMe test stopped!');
                    chrome.browserAction.setBadgeText({
                        text: '',
                    });
                }
                else {
                    $.elementStatus.html('Recording stopped!');
                }
            });
        });
        if (mode === 'mode-record') {
            // merge-modify
            // Functional recorder stop command
            webextension_polyfill_ts_1.browser.runtime.sendMessage({ command: 'stop_recording' }).catch(function (reason) {
                console.log('Failed stopping recorder: ');
                console.log(reason);
            });
        }
    };
    function editData() {
        background.mixpanelTrack('CE Edit Recording Before Upload');
        chrome.tabs.create({
            url: 'dist/editor.html',
        });
    }
    // merge-modify
    // Added functions to open functional debugger
    function debugFunctional() {
        background.mixpanelTrack('CE-Selenium debug and edit');
        webextension_polyfill_ts_1.browser.windows
            .getCurrent()
            .then(function (currentWindows) {
            webextension_polyfill_ts_1.browser.runtime.sendMessage({ command: 'setReplayWindowId', replayWindowId: currentWindows.id });
        })
            .then(function () {
            chrome.runtime.sendMessage({ command: 'get_debuggerTab' }, function (response) {
                chrome.storage.local.get('position-debugger', function (position) {
                    var posLeft = 0;
                    var posTop = 0;
                    if (position['position-debugger']) {
                        posLeft = position['position-debugger'].left;
                        posTop = position['position-debugger'].top;
                    }
                    // Debugger popup is opened
                    if (response.debuggerTab) {
                        var debuggerTabId = response.debuggerTab.id;
                        chrome.tabs.get(debuggerTabId, function (tab) {
                            if (chrome.runtime.lastError) {
                                console.log(chrome.runtime.lastError.message);
                                background.openPopup('html/debugger.html', debuggerWidth, debuggerHeigth, function () {
                                    closeCurrentWindow();
                                }, posLeft, posTop);
                            }
                            else {
                                // Tab exists
                                chrome.windows.update(tab.windowId, { focused: true }, function () {
                                    closeCurrentWindow();
                                });
                            }
                        });
                    }
                    else {
                        background.openPopup('html/debugger.html', debuggerWidth, debuggerHeigth, function () {
                            closeCurrentWindow();
                        }, posLeft, posTop);
                    }
                });
            });
        });
    }
    function closeCurrentWindow() {
        if (window.top) {
            window.top.close();
        }
    }
    function uploadData(event) {
        $.elementStatus.html('Creating test..');
        var location = $('#load-origin').val();
        background.localSave({
            location: location,
        });
        var recordname = $.elementName.val();
        var recordId = null;
        availableTests.forEach(function (testname, index) {
            if (testname === recordname) {
                recordId = index;
            }
        });
        background.localSave({
            record_name: recordname,
        });
        chrome.storage.local.set({
            record_id: recordId,
        });
        $('#advanced-options-fieldset').removeClass('opened');
        $('#advanced-options').hide();
        saveAdvancedOptions();
        chrome.extension.sendRequest({
            type: 'upload_traffic',
            testType: event.data.testType,
        });
    }
    function changeUserAgent() {
        options.useragent = $(this).val();
        background.localSave({
            options: options,
        });
        chrome.extension.sendRequest({
            type: 'change_useragent',
            action: $(this).val(),
        });
        background.mixpanelTrack('CE User Agent Changed', {
            'User Agent': $(this).val(),
        });
    }
    function exportJmeter() {
        background.mixpanelTrack('CE Export Jmeter');
        chrome.storage.local.get('mode', function (data) {
            if (data.mode === 'mode-follow') {
                chrome.extension.sendRequest({
                    type: 'export_jmeter_follow',
                });
            }
            else {
                chrome.extension.sendRequest({
                    type: 'export_jmeter',
                });
            }
        });
    }
    // merge-modify
    // Added function to open download overlay
    function openDownloadOverlay() {
        chrome.extension.sendRequest({ type: 'get_traffic' }, function (traffic) {
            traffic = JSON.parse(traffic);
            var urlList = {};
            if (jQuery.isEmptyObject(traffic)) {
                $('#chk-jmx').attr('disabled', 'disabled').prop('checked', false);
                $('label[for="chk-jmx"]').text('JMeter only (JMX) - No JMeter traffic recorded');
                $('label[for="chk-jmx"]').prepend($('<div class="disabled-checkbox"></div>'));
                $('#run-overlay .download-body .domains-body').hide();
                $('#chk-taurus').attr('disabled', 'disabled').prop('checked', false);
                $('label[for="chk-taurus"]').html('JMeter & Selenium combined (YAML) - No JMeter traffic recorded');
                $('label[for="chk-taurus"]').prepend($('<div class="disabled-checkbox"></div>'));
            }
            else {
                for (var _i = 0, _a = Object.keys(traffic); _i < _a.length; _i++) {
                    var key = _a[_i];
                    var urlLabel = background.parseURL(traffic[key].url);
                    if (!urlList[urlLabel]) {
                        urlList[urlLabel] = urlLabel;
                    }
                }
            }
            getFunctionalSuite().then(function (suite) {
                if (jQuery.isEmptyObject(suite)) {
                    $('#chk-yaml').attr('disabled', 'disabled').prop('checked', false);
                    $('label[for="chk-yaml"]').text('Selenium (YAML) - No actions recorded');
                }
            }, function () {
                $('#chk-yaml').attr('disabled', 'disabled').prop('checked', false);
                $('label[for="chk-yaml"]').text('Selenium (YAML) - No actions recorded');
            });
            if ($('#chk-jmx').prop('checked') && isLogged) {
                $('#run-overlay .download-body .domains-body').show();
            }
            if (!isLogged) {
                $('#chk-jmx-wrapper').hide();
            }
            $('#run-overlay .top-overlay-title').html('Download your scripts');
            $.elementStatus.html('');
            $.elementRunOverlayClose.off('click');
            $.elementRunOverlayClose.on('click', $.closeOverlay);
            $.domainDownloadOverlay(urlList);
        });
        background.mixpanelTrack('CE Download the Recording clicked');
    }
    function getDateTime() {
        var now = new Date();
        var year = now.getFullYear() - 2000;
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        if (month.toString().length === 1) {
            month = '0' + month;
        }
        if (day.toString().length === 1) {
            day = '0' + day;
        }
        if (hour.toString().length === 1) {
            hour = '0' + hour;
        }
        if (minute.toString().length === 1) {
            minute = '0' + minute;
        }
        if (second.toString().length === 1) {
            second = '0' + second;
        }
        // @ts-ignore
        return (month +
            '/' +
            day +
            '/' +
            year +
            ' ' +
            (hour < 10 ? '0' : '' + (hour > 12 ? hour - 12 : hour)) +
            ':' +
            minute +
            ':' +
            second +
            ' ' +
            (hour > 12 ? 'PM' : 'AM'));
    }
    function isDomain(domain) {
        var pregex = /(http(s?))\/\//gi;
        if (pregex.test(domain)) {
            // User shouldn't enter http or https
            return false;
        }
        else if (domain.search(/\./) > 0) {
            // Contains at least one "." dot.
            return true;
        }
        return false;
    }
    function isDomains(selectedDomains) {
        for (var _i = 0, _a = selectedDomains.split(','); _i < _a.length; _i++) {
            var d = _a[_i];
            if (!isDomain(d)) {
                return false;
            }
        }
        return true;
    }
    // Added function to validate filter pattern before starting any of the recorders
    function validateFilterPattern(filterString) {
        for (var _i = 0, _a = filterString.split(','); _i < _a.length; _i++) {
            var f = _a[_i];
            if (!background.validateMatchPattern(f.trim())) {
                return false;
            }
        }
        return true;
    }
    function startFollow() {
        if (!isDomains($('#regex_follow_input').val())) {
            $.elementStatus.html('Incorrect Domains to Follow!');
            return false;
        }
        saveAdvancedOptions();
        background.localSave({
            jmxname: $('#follow-name').val(),
        });
        if (op !== 'pause') {
            chrome.storage.local.get('concurrency', function (item) {
                // Clean selenium recording
                webextension_polyfill_ts_1.browser.runtime.sendMessage({ command: 'reset_recording' }).catch(function (reason) {
                    console.log('Failed reseting recorder: ');
                    console.log(reason);
                });
                // hideRecordingActions(true);
                initRecordInterface();
                op = 'waiting';
                $.elementStatus.html('Starting test..');
                // This is new follow me
                $.disableBtn('follow-report');
                $.disableBtn('follow-upload-jmx');
                startRecMode = mode;
                // While the test is running the user can change the concurrency level to
                // any value from ZERO to the pre chosen max concurrency level.
                var concurrency = item.concurrency;
                $('#concurrency').slider('option', 'max', concurrency);
                // Options
                var followname = $('#follow-name').val();
                var testId = null;
                availableTests.forEach(function (testname, index) {
                    if (testname === followname) {
                        testId = index;
                    }
                });
                if (string_utils_1.stringIsEmpty($('#follow-name').val())) {
                    followname = 'Follow Me ' + getDateTime();
                    $('#follow-name').val(followname);
                }
                var location = $('#load-origin').val();
                background.localSave({
                    max_concurrent_users: concurrency,
                    test_name: followname,
                    location: location,
                });
                chrome.storage.local.set({
                    start_recording_mode: mode,
                    test_id: testId,
                });
            });
        }
        else {
            // pause
            $.disableBtn('follow-record');
            $.enableBtn('follow-pause');
            $.enableBtn('pause');
        }
        $.disableBtn('follow-reset');
        $.disableBtn('reset');
        $.elementStatus.html('');
        $.enableBtn('stop');
        // $('#accounts, #projects, #workspaces').prop('disabled', true).trigger('chosen:updated');
        chrome.extension.sendRequest({
            type: 'follow_traffic',
        });
    }
    function viewReport() {
        background.mixpanelTrack('CE View Report');
        chrome.storage.local.get(null, function (item) {
            var accountOptions = item.accountOptions;
            if (accountOptions && item.testSessionId) {
                chrome.tabs.create({
                    url: serverUrl +
                        '/app/#/accounts/' +
                        accountOptions.account +
                        '/workspaces/' +
                        accountOptions.workspace +
                        '/projects/' +
                        accountOptions.project +
                        '/masters/' +
                        item.testSessionId +
                        '/summary',
                });
            }
        });
    }
    function toggleAdvancedOptions() {
        if ($('#advanced-options-fieldset').hasClass('opened')) {
            if (mode === 'mode-record') {
                $('#advanced-options').removeClass('openedRecord');
            }
            collapseAdvancedOptions();
            background.mixpanelTrack('CE Advanced Options Closed');
            return false;
        }
        else {
            if (mode === 'mode-record') {
                $('#advanced-options').addClass('openedRecord');
            }
            expandAdvancedOptions();
            background.mixpanelTrack('CE Advanced Options Opened');
            return false;
        }
    }
    function collapseAdvancedOptions() {
        $('.openclose').attr('id', 'closed');
        $('#advanced-options-fieldset').removeClass('opened');
        $('#advanced-options').hide();
        closeAllNotification();
        // $('html, body').animate({scrollTop: 0}, 'slow');
        // window.scrollTo(0,0);
    }
    function expandAdvancedOptions() {
        $('.openclose').attr('id', 'opened');
        $('#advanced-options-fieldset').addClass('opened');
        $('#advanced-options').show();
        // $('#advanced-options').slideDown("fast");
        $('.swiper-container').css({
            overflow: 'visible',
        });
        closeAllNotification();
        // closePermissionsInfoBlock();
        // $('html, body').animate({scrollTop: $(document).height()}, 'slow');
    }
    $('.main_popup').on('click', function (e) {
        $('html,body').scrollTop(0);
        if (e.which === 2) {
            e.preventDefault();
        }
        var container = $('.notification-text-alert');
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            closeAllNotification();
        }
    });
    function setFunctionalTestLocations() {
        $('#load-origin').html('');
        availableFunctionalLocations.forEach(function (location, index) {
            $('#load-origin').append($('<option>').text(location.title).attr('value', location.id));
            if (index === 0) {
                $('#load-origin').val(location.id);
            }
        });
        $('#load-origin').trigger('chosen:updated');
        // Set concurrecncy to 1
        var sliderConcurrency = $('#concurrency');
        sliderConcurrency.slider('option', 'value', 1);
        sliderConcurrency.slider('option', 'max', 1);
        $('#concurrency-display-textfield').val(1);
        sliderConcurrency.slider({
            disabled: true,
        });
    }
    function setLoadTestLocations() {
        chrome.storage.local.get('location', function (items) {
            var isMyLocation = false;
            $('#load-origin').html('');
            if (Object.keys(availableLocations).length > 0) {
                availableLocations.forEach(function (location) {
                    $('#load-origin').append($('<option>').text(location.title).attr('value', location.id));
                    if (items.location === location.id) {
                        isMyLocation = true;
                    }
                });
                if (items.location && isMyLocation) {
                    $('#load-origin').val(items.location);
                }
                else {
                    $('#load-origin').val(locationDefault);
                    background.localSave({
                        location: locationDefault,
                    });
                }
                loadOriginConcurrency();
            }
            else {
                $('#load-origin').append($('<option>').text(locationDummy.text).attr('value', locationDummy.value));
            }
            $('#load-origin').trigger('chosen:updated');
        });
    }
    function languagesUncheckAll() {
        // FIXME(rp): Return back to this strange array destructuring
        // @ts-ignore
        var languagesArray = __spreadArrays($('.download-body .languages-body input'));
        languagesArray.forEach(function (elem) {
            $(elem).prop('checked', false);
        });
    }
    function attachResizeEvent() {
        // merge-modify
        // Added observer to auto-resize the window size
        try {
            // if (document.readyState === "complete") {
            // @ts-ignore
            var ro = new ResizeObserver(function (entries) {
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var entry = entries_1[_i];
                    // Check run-overlay is not on top
                    if (!$('#run-overlay').is(':visible')) {
                        $('html,body').scrollTop(0);
                        var height = entry.contentRect.height;
                        window.parent.postMessage({ height: height }, '*');
                    }
                }
            });
            // Only observe the selected element
            ro.observe(document.querySelector('.swiper-slide-active'));
            // }
        }
        catch (ex) {
            $('.swiper-slide-active').on('resize', function () {
                // Check run-overlay is not on top
                if (!$('#run-overlay').is(':visible')) {
                    var height = $(this).height();
                    window.parent.postMessage({ height: height }, '*');
                }
            });
        }
    }
    function downloadYaml() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        background.mixpanelTrack('CE-Selenium Download Yaml file');
                        return [4 /*yield*/, getFunctionalSuite().then(function (suite) {
                                // @ts-ignore
                                return downloadSuiteScript(suite, { language: 'yaml' });
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function download_suite_script(language, fileFormat) {
        return __awaiter(this, void 0, void 0, function () {
            var suite;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        background.mixpanelTrack('CE-Selenium Download Yaml file');
                        return [4 /*yield*/, getFunctionalSuite()];
                    case 1:
                        suite = _a.sent();
                        // @ts-ignore
                        return [4 /*yield*/, downloadSuiteScript(suite, { language: language, fileFormat: fileFormat })];
                    case 2:
                        // @ts-ignore
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function getFunctionalSuite() {
        return new Promise(function (resolve, reject) {
            webextension_polyfill_ts_1.browser.runtime.sendMessage({ command: 'getCurrentSuite' }).then(function (suite) {
                if (suite.suite) {
                    resolve(suite.suite);
                }
                else {
                    reject();
                }
            });
        });
    }
    // Button actions
    $.elementUploadJmeter.on('click', { testType: 'jmeter' }, uploadData);
    $.elementUploadSelenium.on('click', { testType: 'selenium' }, uploadData);
    $('#button-upload-jmeter-dropdown').on('click', { testType: 'jmeter' }, uploadData);
    $('#button-upload-functional-dropdown').on('click', { testType: 'functionalApi' }, uploadData);
    $('#button-upload-selenium-dropdown').on('click', { testType: 'selenium' }, uploadData);
    $('#button-upload-combined-dropdown').on('click', { testType: 'combinedJmeterAndSelenium' }, uploadData);
    $.elementUploadJmx.on('click', exportJmeter);
    $('#button-edit-jmeter').on('click', editData);
    $('#button-edit-selenium').on('click', debugFunctional);
    $('#button-edit-jmeter-dropdown').on('click', editData);
    $('#button-edit-selenium-dropdown').on('click', debugFunctional);
    // $('#pause').click(pauseRecording);
    // Stop button
    $('#record-off').on('click', pauseRecording);
    // $('#pause').click(pauseRecording);
    $('#stop').on('click', $.stopRecording);
    $('#record').on('click', startRecording);
    $('#reset').on('click', $.resetRecording);
    // $('#debugger').click(debugFunctional);
    // merge-modify
    // Added events for new download overlay
    $('#download').on('click', openDownloadOverlay);
    $('#chk-all').on('click', function () {
        if ($(this).prop('checked')) {
            $('.languages-body').show();
        }
        else {
            $('.languages-body').hide();
            languagesUncheckAll();
            checkDownloadCheckboxState();
        }
    });
    $('#chk-jmx').on('click', function () {
        background.localSave({ 'chk-jmx': $(this).prop('checked') });
        checkDownloadCheckboxState();
        if ($(this).prop('checked')) {
            $('#run-overlay .download-body .domains-body').show();
        }
        else {
            $('#run-overlay .download-body .domains-body').hide();
        }
    });
    $('.download-body .checkbox-wrapper input').on('click', function () {
        checkDownloadCheckboxState();
    });
    $('#chk-taurus').on('click', function () {
        background.localSave({ 'chk-taurus': $(this).prop('checked') });
        checkDownloadCheckboxState();
    });
    function checkDownloadCheckboxState() {
        // @ts-ignore
        var elements = __spreadArrays($('.download-body .checkbox-wrapper input:not([name="domains"]):not(#chk-all)'));
        var amountOfCheckboxes = elements.reduce(function (summ, item) {
            if ($(item).prop('name') === 'chk-jmx') {
                var hasCheckedDomains = $('input[name=domains]:checked').length > 0;
                return $(item).prop('checked') ? Number(hasCheckedDomains) + summ : summ;
            }
            return $(item).prop('checked') ? summ + 1 : summ;
        }, 0);
        updateSelectedCheckboxStatus();
        if (amountOfCheckboxes) {
            $('#run-overlay .download-button')
                .removeAttr('disabled')
                .removeClass('disabled')
                .text("Save (" + amountOfCheckboxes + ")");
        }
        else {
            $('#run-overlay .download-button')
                .attr('disabled', 'disabled')
                .addClass('disabled')
                .text("Save (" + amountOfCheckboxes + ")");
        }
    }
    function updateSelectedCheckboxStatus() {
        // @ts-ignore
        var languagesSelectedAmount = __spreadArrays($('.download-body .include-language input')).reduce(function (summ, item) {
            return $(item).prop('checked') ? summ + 1 : summ;
        }, 0);
        // @ts-ignore
        var domainsElems = __spreadArrays($('.download-body .checkbox-wrapper input[name="domains"]'));
        var allDomainsAmount = domainsElems.length;
        console.log(languagesSelectedAmount, domainsElems, allDomainsAmount);
        var checkedDomainsAmount = domainsElems.reduce(function (summ, item) {
            return $(item).prop('checked') ? summ + 1 : summ;
        }, 0);
        $('#domains-counter').text(checkedDomainsAmount);
        $('#alldomains').text(allDomainsAmount);
        $('#languages-counter').text(languagesSelectedAmount);
    }
    function downloadTaurus() {
        // background.mixpanelTrack('CE-Selenium Download Yaml file');
        event.stopPropagation();
        background.getCombinedYaml().then(function (yamlFile) {
            var url = URL.createObjectURL(yamlFile);
            var fileName = background.getNameCombinedJmeterSeleniumFile();
            // @ts-ignore
            downloadFile(fileName, url);
        });
    }
    $('#run-overlay .download-button').on('click', function () {
        return __awaiter(this, void 0, void 0, function () {
            var chkYaml, chkJmx, chkTaurus, chkCsWdNunit, chkCsWdMstest, chkJavaWdTestng, chkJavaWdJunit, chkJavaRcJunit, chkPython2WdUnittest, chkRubyWdRspec, chkXml;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chkYaml = $('#chk-yaml').prop('checked');
                        chkJmx = $('#chk-jmx').prop('checked');
                        chkTaurus = $('#chk-taurus').prop('checked');
                        chkCsWdNunit = $('#chk-cs-wd-nunit').prop('checked');
                        chkCsWdMstest = $('#chk-cs-wd-mstest').prop('checked');
                        chkJavaWdTestng = $('#chk-java-wd-testng').prop('checked');
                        chkJavaWdJunit = $('#chk-java-wd-junit').prop('checked');
                        chkJavaRcJunit = $('#chk-java-rc-junit').prop('checked');
                        chkPython2WdUnittest = $('#chk-python-wd-unittest').prop('checked');
                        chkRubyWdRspec = $('#chk-ruby-wd-rspec').prop('checked');
                        chkXml = $('#chk-xml').prop('checked');
                        if (!chkYaml) return [3 /*break*/, 2];
                        return [4 /*yield*/, downloadYaml()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (chkTaurus) {
                            background.mixpanelTrack('CE Download Yaml selenium and jmeter file');
                            downloadTaurus();
                        }
                        if (!chkCsWdNunit) return [3 /*break*/, 4];
                        return [4 /*yield*/, download_suite_script('cs-wd-nunit', 'cs')];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!chkCsWdMstest) return [3 /*break*/, 6];
                        return [4 /*yield*/, download_suite_script('cs-wd-mstest', 'cs')];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!chkJavaWdTestng) return [3 /*break*/, 8];
                        return [4 /*yield*/, download_suite_script('java-wd-testng', 'java')];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        if (!chkJavaWdJunit) return [3 /*break*/, 10];
                        return [4 /*yield*/, download_suite_script('java-wd-junit', 'java')];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        if (!chkJavaRcJunit) return [3 /*break*/, 12];
                        return [4 /*yield*/, download_suite_script('java-rc-junit', 'java')];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12:
                        if (!chkPython2WdUnittest) return [3 /*break*/, 14];
                        return [4 /*yield*/, download_suite_script('python-wd-unittest', 'py')];
                    case 13:
                        _a.sent();
                        _a.label = 14;
                    case 14:
                        if (!chkRubyWdRspec) return [3 /*break*/, 16];
                        return [4 /*yield*/, download_suite_script('ruby-wd-rspec', 'rb')];
                    case 15:
                        _a.sent();
                        _a.label = 16;
                    case 16:
                        if (!chkXml) return [3 /*break*/, 18];
                        return [4 /*yield*/, download_suite_script('xml', 'xml')];
                    case 17:
                        _a.sent();
                        _a.label = 18;
                    case 18:
                        if (chkJmx && isLogged) {
                            background.mixpanelTrack('CE Download jmx file');
                            $.exportSelectedDomains();
                        }
                        // Close overlay if no jmx download
                        if (!chkJmx) {
                            $.closeOverlay();
                        }
                        return [2 /*return*/];
                }
            });
        });
    });
    $('#advanced-options-fieldset').on('click', toggleAdvancedOptions);
    $('.slide-to').on('click', function () {
        if (isLogged) {
            var page = $(this).attr('data-page');
            pageSwitch(page);
        }
    });
    // Cancel Account Options changes
    $('.cancel-account').on('click', function () {
        changedAccount = false;
        setAccounts();
        $('#save_test_options').prop('disabled', true);
    });
    // Follow me
    $('#follow-record').on('click', startFollow);
    $('#follow-stop').on('click', $.stopRecording);
    $('#follow-pause').on('click', pauseRecording);
    $('#follow-upload-jmx').on('click', exportJmeter);
    $('#follow-report').on('click', viewReport);
    $('#follow-reset').on('click', $.resetRecording);
    // Overlay close button
    $.elementRunOverlayClose.on('click', $.closeOverlay);
    $('#user-agents-list').on('click', changeUserAgent);
    // close notifications by clicking on chosen
    document.querySelectorAll('.chosen-single').forEach(function (element) {
        element.onclick = function () {
            closeAllNotification();
        };
    });
    // attachResizeEvent();
    function compareVersions(first, second) {
        var firstArr = first.split('.');
        var secondArr = second.split('.');
        var count = Math.max(firstArr.length, secondArr.length);
        for (var i = 0; i < count; i++) {
            var v1 = Number(firstArr[i]) || 0;
            var v2 = Number(secondArr[i]) || 0;
            if (v1 === v2) {
                continue;
            }
            return v1 - v2 > 0;
        }
        return false;
    }
    // note: chrome runtime functions (requestUpdateCheck / onUpdateAvailable) work bad
    function getLatestVersion() {
        return __awaiter(this, void 0, void 0, function () {
            var response, document_1, _a, _b, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('https://guide.blazemeter.com/hc/en-us/articles/115004970329-Chrome-Extension-Changelog-Chrome-Extension-Changelog')];
                    case 1:
                        response = _c.sent();
                        _b = (_a = new DOMParser()).parseFromString;
                        return [4 /*yield*/, response.text()];
                    case 2:
                        document_1 = _b.apply(_a, [_c.sent(), 'text/html']);
                        // @ts-ignore
                        return [2 /*return*/, document_1.querySelector('.article-body.markdown > p > strong').innerText.match(/[0-9.]+/)[0]];
                    case 3:
                        e_1 = _c.sent();
                        throw new Error('Cannot get latest version: ' + e_1.message);
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    getLatestVersion().then(function (storeVersion) {
        var needsUpdate = compareVersions(storeVersion, manifest.version);
        if (needsUpdate) {
            document.getElementById('new-version-alert').classList.remove('hidden');
        }
    });
});
// @ts-ignore
chrome.extension.onMessage.addListener(function (request) {
    if (request.status) {
        if (request.link) {
            $.elementStatus.html(request.status + ' <a href="' + request.link + '">See more.</a>');
        }
        else {
            $.elementStatus.html(request.status);
        }
    }
    else if (request.waiting) {
        if (request.waiting === 'failed') {
            op = 'stopped';
            initFollowMeInterface();
            initRecordInterface();
            $('#follow-name').prop('disabled', false);
            $('#overlay').remove();
        }
        else {
            // Follow mode running
            $.disableBtn('follow-record');
            $.disableBtn('follow-reset');
            $.enableBtn('follow-pause');
            $.enableBtn('follow-stop');
            $.enableBtn('follow-report');
            // When the test is running, the load origin becomes read only.
            $('#load-origin').prop('disabled', true).trigger('chosen:updated');
            // When the test is running, the select script becomes read only.
            $('#follow-name').prop('disabled', true);
            $('#add-concurrency').hide();
            // $('#accounts, #projects, #workspaces').prop('disabled', true).trigger('chosen:updated');
            chrome.storage.local.get('test_name', function (name) {
                if (name.test_name) {
                    $('#follow-name').val(name.test_name);
                }
            });
        }
    }
    else if (request.op === 'progressbar') {
        if (request.progress) {
            if (request.follow) {
                if ($('#got-it:visible').length > 0) {
                    $('#got-it').hide();
                }
                $.elementRunOverlayClose.hide();
                $('.test-ended-body').hide();
                $.elementProgresBodyP.text('Launching servers in the cloud can take about 2 minutes.');
                $.elementProgresBodyH4.text('Please wait while cloud servers are being launched.');
            }
            else {
                $.elementRunOverlayClose.show();
                if ($('#update-settings').is(':checked')) {
                    $('.text p').text('');
                    $('.text h4').text('Uploading your data.');
                    $.elementRunOverlayClose.hide();
                }
                else {
                    $.elementProgresBodyP.text('Launching servers in the cloud can take about 2 minutes.');
                    $.elementProgresBodyH4.text('Please wait while cloud servers are being launched.');
                }
            }
            if (request.test_id != null) {
                $.elementProgressButton.on('click', $.dismissTest);
                $.elementProgressButton.show();
            }
            else {
                $.elementProgressButton.off('click');
                $.elementProgressButton.hide();
                $.elementRunOverlayClose.off('click');
                $.elementRunOverlayClose.on('click', $.cancelTest);
            }
            $.waitOverlay(request.progress);
        }
        else {
            $.elementRunOverlayProgress.hide();
            $.closeOverlay();
            if (request.followstopped) {
                // enable default values
                chrome.storage.local.get('real_max_follow_limit', function (item) {
                    $('#concurrency').slider('option', 'max', item.real_max_follow_limit);
                });
            }
        }
    }
    else if (request.op === 'domainoverlay') {
        $.elementStatus.html('');
        $.elementRunOverlayClose.off('click');
        $.elementDomainsButton.off('click');
        if (request.action === 'upload') {
            $.elementRunOverlayClose.on('click', $.closeOverlay);
            $.elementRunOverlayClose.on('click', $.cancelTest);
            $.elementDomainsButton.on('click', $.uploadSelectedDomains);
        }
        else if (request.action === 'export') {
            $.elementRunOverlayClose.on('click', $.closeOverlay);
            $.elementDomainsButton.on('click', $.exportSelectedDomains);
        }
        $.domainOverlay(JSON.parse(request.domains));
    }
    else if (request.op === 'testendedoverlay') {
        $.elementStatus.html('');
        $.testEndedOverlay();
    }
    else if (request.op === 'test_ended_on_backend') {
        $.elementStatus.html('');
        $('.test-ended-body .text p').text('Your FollowMe session has came to its end, please start new session');
        $.testEndedOverlay();
    }
    else if (request.op === 'stop_recording') {
        $.stopRecording();
        if (request.msg) {
            setTimeout(function () {
                $.elementStatus.html(request.msg);
            }, 1000);
        }
        if (request.action === 'filter_pattern_error') {
            $('#regex_include').addClass('text-error');
            background.mixpanelTrack('CE Filter Pattern Error', {
                Value: $('#regex_include').val(),
            });
        }
    }
    else if (request.op === 'network_error') {
        $.resetRecording();
    }
    else if (request.op === 'exportJMX') {
        if (request.exporting) {
            $.elementProgressButton.hide();
            $.elementProgresBodyP.text('');
            $.elementProgresBodyH4.text($.stringExporting);
            if (request.progress < 100) {
                $.waitOverlay(request.progress);
            }
        }
    }
    else if (request.op === 'closeOverlay' || request.op === 'exported_to_jmx') {
        $.closeOverlay();
    }
    else if (request.op === 'uploadDataFailed') {
        $.cancelTest();
        $.closeOverlay();
        setTimeout(function () {
            $.elementStatus.html('Sending data failed. Please try again.');
        }, 1500);
    }
    else if (request.op === 'testTerminated') {
        $.stopRecording();
    }
    else if (request.op === 'uploadJMXFailed') {
        $.closeOverlay();
        $.cancelTest();
        setTimeout(function () {
            $.elementStatus.html('Upload data failed.');
        }, 1500);
    }
});
//# sourceMappingURL=popup.js.map