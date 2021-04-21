// Stores all recorded traffic
var traffic = {};
var trafficFollow = {};
var body = {};
var json = null;

var iconstate = true;
var op = 'stopped';
var theme = 'blazemeter';
var uid = '';
var options = {};
var retries = 5;
var debug = false;
var testEndedWithoutReportData = false;
var counter = 0;
var clearRunning = false;
var clearServiceWorkersRunning = false;
var modalIsOpened = false;
var cache = false;
var service_workers = false;
var cookie = false;
var incognito = chrome.extension.inIncognitoContext;
var manifest = chrome.runtime.getManifest(); // TODO: Maybe inline?
var dismissed = false;
var exportJMX = false;
var refreshIntervalId = null;

var uploadingData = false;
var pathoff = null;
var pathon = null;
var recTestId = null;
var currentIcon = 'on';

var mode;
var data;

var concurrency;
var concurrencyByDefault = 20;
var geolocationByDefault = 'us-central1-a';
var statusTest = 'Not ready';
var UploadTraffic;
var version = 'v4';
var configFile = '/config.json';
if (chrome.runtime.id != 'mbopgmdnpcbohhpnfglgohlbhfongabi') {
//load config_dev.json for non-production version
    configFile = '/config_dev.json';
}
var useragent = null;

var isLogged = false;

var activeTabId = 0;

var recStart = 0;
var recEnd = 0;

//Google Analytics
(function (i, s, o, g, r, a, m) {
    i.GoogleAnalyticsObject = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments);
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

(function (e, a) {
    if (!a.__SV) {
        var b = window;
        try {
            var c, l, i, j = b.location, g = j.hash;
            c = function (a, b) {
                return (l = a.match(RegExp(b + "=([^&]*)"))) ? l[1] : null
            };
            g && c(g, "state") && (i = JSON.parse(decodeURIComponent(c(g, "state"))), "mpeditor" === i.action && (b.sessionStorage.setItem("_mpcehash", g), history.replaceState(i.desiredHash || "", e.title, j.pathname + j.search)))
        } catch (m) {
        }
        var k, h;
        window.mixpanel = a;
        a._i = [];
        a.init = function (b, c, f) {
            function e(b, a) {
                var c = a.split(".");
                2 == c.length && (b = b[c[0]], a = c[1]);
                b[a] = function () {
                    b.push([a].concat(Array.prototype.slice.call(arguments,
                        0)))
                }
            }

            var d = a;
            "undefined" !== typeof f ? d = a[f] = [] : f = "mixpanel";
            d.people = d.people || [];
            d.toString = function (b) {
                var a = "mixpanel";
                "mixpanel" !== f && (a += "." + f);
                b || (a += " (stub)");
                return a
            };
            d.people.toString = function () {
                return d.toString(1) + ".people (stub)"
            };
            k = "disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
            for (h = 0; h < k.length; h++) e(d, k[h]);
            a._i.push([b, c, f])
        };
        a.__SV = 1.2;
        b = e.createElement("script");
        b.type = "text/javascript";
        b.async = !0;
        b.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "file:" === e.location.protocol && "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//) ? "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js" : "https://cdn.mxpnl.com/libs/mixpanel-2.2.min.js";
        c = e.getElementsByTagName("script")[0];
        c.parentNode.insertBefore(b, c)
    }
})(document, window.mixpanel || []);

function googleAnalytics(a, b, d, e) {
    ga(a, b, d, e);
}

function stringIsEmpty(string) {
    return !/\S/.test(string);
}

function url_is_filepath(url) {
    var filetype = get_url_extension(url);
    if (filetype) {
        var web_extensions = web_extensions_library();
        if ($.inArray(filetype, web_extensions) !== -1) {
            return true;
        }
    }
    return false;
}

function get_url_extension(url) {
    var file_extension = url.split(/\#|\?/)[0].split('.').pop().trim();
    if (/^[a-zA-Z0-9]*$/.test(file_extension) == true) {
        return file_extension;
    }

    return null;
}

function web_extensions_library() {
    //Source: https://github.com/AdelMahjoub/mime-type-nodejs/blob/master/mime-to-ext.json
    return ["atom", "json", "map", "topojson", "jsonld", "rss", "geojson", "rdf", "xml", "js", "webmanifest", "webapp", "appcache", "mid", "midi", "kar", "aac", "f4a", "f4b", "m4a", "mp3", "oga", "ogg", "opus", "ra", "wav", "bmp", "gif", "jpeg", "jpg", "jxr", "hdp", "wdp", "png", "svg", "svgz", "tif", "tiff", "wbmp", "webp", "jng", "3gp", "3gpp", "f4p", "f4v", "m4v", "mp4", "mpeg", "mpg", "ogv", "mov", "webm", "flv", "mng", "asf", "asx", "wmv", "avi", "cur", "ico", "doc", "xls", "ppt", "docx", "xlsx", "pptx", "deb", "woff", "woff2", "eot", "ttc", "ttf", "otf", "ear", "jar", "war", "hqx", "bin", "deb", "dll", "dmg", "img", "iso", "msi", "msm", "msp", "safariextz", "pdf", "ai", "eps", "ps", "rtf", "kml", "kmz", "wmlc", "7z", "bbaw", "torrent", "crx", "cco", "jardiff", "jnlp", "run", "iso", "oex", "pl", "pm", "pdb", "prc", "rar", "rpm", "sea", "swf", "sit", "tcl", "tk", "crt", "der", "pem", "xpi", "exe", "xhtml", "xsl", "zip", "css", "csv", "htm", "html", "shtml", "md", "mml", "txt", "vcard", "vcf", "xloc", "jad", "wml", "vtt", "htc", "desktop", "md", "ts", "ico", "jar", "so"];
}

//@todo: now we always read from config.json, as currently we only have one GA account.Therefore GA code from config_dynatrace.json will be ignored.
$.getJSON(configFile, function (data) {
    googleAnalytics('create', data.GA_code, 'auto');
    googleAnalytics('set', 'checkProtocolTask', null);
    mixpanel.init(data.mixpanel_api_token, {api_host: "https://api.mixpanel.com"});
});

function localSave(params) {
    chrome.storage.local.set(params, function () {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
            googleAnalytics('send', 'exception', {
                'exDescription': 'notificationError():' + chrome.runtime.lastError.message,
                'exFatal': false
            });
        }
    });
}

function mixpanelTrack(param, props) {
    chrome.storage.local.get('account_info', function (info) {
        var accountInfo = info.account_info;
        if (accountInfo) {
            mixpanel.identify(accountInfo.id);
            //@todo: do we really need to set user properties? Those will already be set by BlazeMeter Web App?
            mixpanel.people.set({
                '$first_name': accountInfo.firstName,
                '$last_name': accountInfo.lastName,
                '$created': accountInfo.created,
                '$email': accountInfo.email
            });
            mixpanel.track(param, props);
        } else {
            mixpanel.track(param, props);
        }
    });
}

/**
 * @return {string}
 */
function ApiClientIdentification() {
    return '_clientId=BE_CHROME&_clientVersion=​' + manifest.version;
}

function drawBadgeDynamic() {

    let badgeText;
    if (incognito === false) {
        chrome.browserAction.setBadgeBackgroundColor({
            color: '#d90a16'
        });
        if (counter > 999) {
            badgeText = (counter / 1000).toFixed(1) + 'k';
        } else {
            badgeText = counter.toString();
        }
        chrome.browserAction.setBadgeText({
            text: badgeText
        });

    } else {
        chrome.tabs.query({}, function (tabs) {
            for (const prop in tabs) {
                if (tabs.hasOwnProperty(prop)) {
                    if (tabs[prop].id > 0) {
                        chrome.browserAction.setBadgeBackgroundColor({
                            color: '#d90a16',
                            tabId: tabs[prop].id
                        });
                        if (counter > 999) {
                            badgeText = (counter / 1000).toFixed(1) + 'k';
                        } else {
                            badgeText = counter.toString();
                        }
                        // chrome.browserAction.setBadgeText({
                        //     text: badgeText,
                        //     tabId: tabs[prop].id
                        // });
                    }
                }
            }
        });
    }
}

function setIcon(state, tabId) {
    if (state !== currentIcon) {
        currentIcon = state;
        let iconObj = {};
        switch (state) {
            case 'on':
                iconObj.path = pathon;
                if (tabId) iconObj.tabId = tabId;
                break;
            case 'off':
                iconObj.path = pathoff;
                if (tabId) iconObj.tabId = tabId;
                break;
        }
        chrome.browserAction.setIcon(iconObj);
    }
}

function recordBlink() {
    setInterval(function () {
        iconstate = !iconstate;
        if (incognito === false) {
            if (op == 'pause' || op == 'waiting' || functionalIconBlinkMode) {
                setIcon(iconstate ? 'on' : 'off');
            } else {
                if (op == 'record' || op == 'follow') {
                    setIcon('on');
                } else {
                    setIcon('off');
                    if (op != 'stopped') {
                        chrome.browserAction.setBadgeText({
                            text: ''
                        });
                    }
                }
            }
            //Add functional check to temporal variable
        } else {
            chrome.tabs.query({}, function (tabs) {
                for (const prop in tabs) {
                    if (tabs.hasOwnProperty(prop)) {
                        if (op == 'pause' || op == 'waiting' || functionalIconBlinkMode) {
                            setIcon(iconstate ? 'on' : 'off', tabs[prop].id);
                        } else {
                            if (op == 'record' || op == 'follow') {
                                setIcon('on', tabs[prop].id);
                                if (counter > 0) {
                                    drawBadgeDynamic();
                                }
                            } else {
                                setIcon('off', tabs[prop].id);
                                if (op != 'stopped') {
                                    chrome.browserAction.setBadgeText({
                                        text: ''
                                    });
                                } else {
                                    if (counter > 0) {
                                        drawBadgeDynamic();
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    }, 500);
}

function setPathOnOff(theme) {
    pathoff = {
        19: chrome.extension.getURL('theme') + '/' + theme + '/images/19x19.png',
        38: chrome.extension.getURL('theme') + '/' + theme + '/images/38x38.png'
    };
    pathon = {
        19: chrome.extension.getURL('theme') + '/' + theme + '/images/19x19_on.png',
        38: chrome.extension.getURL('theme') + '/' + theme + '/images/38x38_on.png'
    };
}

function defaultsLoad() {
    chrome.storage.local.get(null, function (items) {
        const serverJmxExists = items.serverJMX && !stringIsEmpty(items.serverJMX);
        const serverJmxRedirections = ['http://bzm-con-web.elasticbeanstalk.com', 'http://converter.blazemeter.com'];
        const shouldUseDefaultServer = !serverJmxExists || serverJmxRedirections.includes(items.serverJMX);
        if (shouldUseDefaultServer) {
            localSave({
                'serverJMX': 'https://converter.blazemeter.com'
            });
        }

        if ($.isEmptyObject(items.options)) {
            options.requests_to_record = 'top_level';
            options.record_ajax = true;
            options.functional_test = false;
            options.cookie = false;
            options.record_css = false;
            options.record_js = false;
            options.record_images = false;
            options.record_redirects = false;
            options.record_other = false;
            options.cache = true;
            options.service_workers = true;
            options.random_think_time = true;
            options.update_settings = false;
            options.regex_include = 'http://*/*, https://*/*';
            options.regex_follow_input = '';
            options.useragent = 'Current Browser';
            localSave({
                'options': options
            });
        }

        $.getJSON(chrome.extension.getURL('') + configFile, function (data) {
            localSave({
                'theme': data.theme
            });
            theme = data.theme;
            if (!items.server) {
                localSave({
                    'server': data.server_url
                });
            }

            if (!items.ard_url) {
                localSave({
                    'ard_url': data.ard_url
                })
            }
            setPathOnOff(theme);
            recordBlink();
        });
    });
}

function notificationError() {
    if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        googleAnalytics('send', 'exception', {
            'exDescription': 'notificationError():' + chrome.runtime.lastError.message,
            'exFatal': false
        });
    }
}

// displayNotifications(string, boolean, boolean, boolean);
function displayNotifications(msg, gcmDisplay, consoleDisplay, chromeDisplay, autocloseDelay = null) {
    if (gcmDisplay) {
        chrome.notifications.create('report', {
            type: 'basic',
            title: 'Blazemeter',
            iconUrl: chrome.extension.getURL('theme') + '/' + theme + '/images/48x48.png',
            message: msg,
            priority: 1,
            isClickable: true
        }, notificationError);

        if (autocloseDelay) {
            setTimeout(() => {
                chrome.notifications.clear('report');
            }, autocloseDelay);
        }
    }

    if (consoleDisplay) {
        console.log(msg);
    }

    if (chromeDisplay) {
        chrome.extension.sendMessage({
            status: msg
        });
    }
}

chrome.storage.local.get(['mode', 'disable_followme'], function (item) {
    if (item.disable_followme == 'TRUE') {
        mode = 'mode-record';
        localSave({
            'mode': mode
        });
    }
    if (item.mode) {
        mode = item.mode;
    } else {
        mode = 'mode-record';
    }
});

// var step = 1;
var testId = null;

var sessionId = null;

// Run test progress bar
var progressbar = 0;

var gPendingCallbacks = [];

var continueOldTest = false;
var continueOldTestState = 'none';

chrome.storage.local.get('debug', function (item) {
    if (item.debug == 'true') {
        console.log('Debug mode');
        debug = true;
    }
});

var mainFrameTabIds = [];

setTimeout(function(){
    localSave({
        'permissionsBlockFirstTimeShow': true
    });
},1000);

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == 'install') {
        localStorage.clear();
        chrome.storage.sync.clear();
        chrome.storage.local.clear();
        //Init default variables from config.json
        defaultsLoad(); //First run
    } else if (details.reason == 'update') {
        //On update open CHANGELOG
        var changelogURL = "https://guide.blazemeter.com/hc/en-us/articles/115004970329-Chrome-Extension-Changelog-Chrome-Extension-Changelog";
        chrome.tabs.create({url: changelogURL});
    }
});

defaultsLoad(); //Called here because extension could be updated while it was disabled. Chrome at the moment doesn't have API for detecing onEnabled event.

/**
 *
 * @param {chrome.webRequest.WebRequestHeadersDetails} info
 */
function onBeforeSendHeaders(info) {
    // If url is in black list not record requests
    checkForForbiddenDomain(info.initiator, info.url).then(isForbidden => {
        if(isForbidden) {
            return
        }

        if (info.requestHeaders) {
            if (useragent && useragent !== 'Current Browser') {
                // Replace the User-Agent header
                const headers = info.requestHeaders
                headers.forEach(function (header) {
                    if (header.name.toLowerCase() === 'user-agent') {
                        header.value = useragent;
                    }
                });
                return {
                    requestHeaders: headers
                };
            }
        } else {
            return {
                requestHeaders: []
            };
        }
    });

}

/**
 * @param {chrome.webRequest.WebResponseErrorDetails} details
 */
function onErrorOccurred(details) {
    if (details.error) {
        googleAnalytics('send', 'exception', {
            'exDescription': 'onErrorOccurred():' + details.error,
            'exFatal': false
        });
    }
}

/**
 * @param {chrome.webRequest.WebRequestBodyDetails} info
 */
function onBeforeRequest(info) {
    // If url is in black list not record requests
    checkForForbiddenDomain(info.initiator, info.url).then(isForbidden => {
        if(isForbidden) {
            return
        }
        if (info.requestBody) {
            var postData = '';
            if (!info.requestBody.error) {
                if (info.requestBody.formData) {
                    // If the request method is POST and the body is a sequence of key-value
                    // pairs encoded in UTF8,
                    // encoded as either multipart/form-data, or
                    // application/x-www-form-urlencoded
                    postData = info.requestBody.formData;
                    // switch array to string
                    for (var index in postData) {
                        postData[index] = postData[index].toString();
                    }
                } else {
                    // If the request method is PUT or POST, and the body is not already
                    // parsed in formData, then the
                    // unparsed request body elements are contained in this array.
                    postData = [];
                    if (info.requestBody.raw) {
                        info.requestBody.raw.forEach(function (raw) {
                            if (raw.bytes) {
                                var bodyString = '';
                                const bytes = new Uint8Array(raw.bytes);
                                const bodyLength = bytes.length;
                                for (var i = 0; i < bodyLength; i++) {
                                    bodyString += String.fromCharCode(bytes[i]);
                                }
                                postData.push(bodyString);
                            } else {
                                // @todo:support for file uploads
                            }
                        });
                    }
                    // Encoding and Parsing Request Query String to key => value
                    var dataString = '';
                    for (var i = 0; i < postData.length; i++) {
                        dataString += postData[i];
                    }
                    // Check if data is correct JSON string
                    try {
                        var jsonParsedString = JSON.parse(dataString);
                    } catch (e) {

                    }
                    // If data is not correct JSON string parse it on key => value parameters
                    if (!jsonParsedString) {
                        // Parsing Request Query String to key => value using URI.js library
                        // http://medialize.github.io/URI.js/docs.html#static-parseQuery
                        var parsedValue = URI.parseQuery(dataString);
                        if (!$.isEmptyObject(parsedValue)) {
                            // If query have not parsed not save it
                            var notParseFlag = false;
                            for (const prop in parsedValue) {
                                // if query not parsed URI.parseQuery method returns
                                // it like object with one property with null value
                                if (prop === dataString && parsedValue[prop] === null) {
                                    notParseFlag = true;
                                }
                            }
                            if (!notParseFlag) {
                                postData = parsedValue;
                            }
                        }
                    }
                }
            } else {
                if (info.requestBody.error !== "Unknown error.") {
                    // console.log(chrome.runtime.lastError);
                    googleAnalytics('send', 'exception', {
                        'exDescription': 'onBeforeRequest():' + chrome.runtime.lastError.message,
                        'exFatal': false
                    });
                }
            }
            let key = generateKey(info);
            if (options.record_redirects) {
                const ids = Object.keys(traffic).map(x => x.replace(/\D+/g, ''));
                const sameRequestsCount = ids.filter(x => x === info.requestId).length;
                key += 'r'.repeat(sameRequestsCount)
            }
            body[key] = postData;
        }
    });
}

function clearCache() {
    if (!clearRunning) {
        // If clear cache is enabled
        clearRunning = true;
        var oneWeekAgo = (new Date()).getTime() - 604800000;
        chrome.browsingData.removeCache({
            'since': oneWeekAgo
        }, function () {
            clearRunning = false;
        });
    }
}

function clearServiceWorkers() {
    if (!clearServiceWorkersRunning) {
        // If clear cache is enabled
        clearServiceWorkersRunning = true;
        var oneWeekAgo = (new Date()).getTime() - 604800000;
        chrome.browsingData.removeServiceWorkers({
            'since': oneWeekAgo
        }, function () {
            clearServiceWorkersRunning = false;
        });
    }
}

function isFromRoot(rootDomain, testURL) {
    if (typeof(testURL) === 'undefined') {
        return false;
    }
    var getDomainUrl = (new URL(testURL)).hostname;
    if (getDomainUrl === rootDomain) {
        return true;
    }

    var pattern = '([\\.]+' + rootDomain + ')(?![0-9a-zA-Z\\-\\.])';
    var expression = new RegExp(pattern, 'gi');
    return expression.test(getDomainUrl);
}

function setProperty(sessionId, request, concurrency, setServer, timeDistribution) {
    var urlParts = {};
    try {
        urlParts = new URL(request.url);
        var host = urlParts.hostname;
        var protocol = urlParts.protocol.replace(':', '');
        var port = (urlParts.port) ? urlParts.port : 80;
        var path = urlParts.pathname + urlParts.search + urlParts.hash;
        if (timeDistribution == '0' || timeDistribution == null) {
            chrome.storage.local.get('auto_time_distribution', function (item) {
                timeDistribution = item.auto_time_distribution;
                var createJson = [{
                    'concurrency': concurrency,
                    'time_distribution': timeDistribution,
                    'label': request.label,
                    'method': request.method,
                    'protocol': protocol,
                    'host': host,
                    // 'port': port,
                    'path': path,
                    'headers': request.headers,
                    'body': request.body
                }];
                const params = JSON.stringify(createJson);

                $.ajax({
                    type: 'POST',
                    contentType: 'application/json',
                    url: setServer + '/api/' + version + '/sessions/' + sessionId + '/follow-me?' + ApiClientIdentification(),
                    dataType: 'json',
                    data: params,
                    success: function (result) {
                        if (debug) {
                            console.log(result);
                        }
                    },
                    error: function (e) {
                        console.log(e);
                        googleAnalytics('send', {
                            hitType: 'event',
                            eventCategory: 'Ajax Error ' + e.status + ' ' + e.statusText,
                            eventAction: 'FollowMe',
                            eventLabel: 'URL: ' + this.url + uid
                        });
                    }
                });
            });
        } else {
            var createJson = [{
                'concurrency': concurrency,
                'time_distribution': timeDistribution,
                'label': request.label,
                'method': request.method,
                'protocol': protocol,
                'host': host,
                // 'port': port,
                'path': path,
                'headers': request.headers,
                'body': request.body
            }];
            const params = JSON.stringify(createJson);

            $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: setServer + '/api/' + version + '/sessions/' + sessionId + '/follow-me?' + ApiClientIdentification(),
                dataType: 'json',
                data: params,
                success: function (result) {
                    if (debug) {
                        console.log(result);
                    }
                },
                error: function (e) {
                    console.log(e);
                    googleAnalytics('send', {
                        hitType: 'event',
                        eventCategory: 'Ajax Error ' + e.status + ' ' + e.statusText,
                        eventAction: 'FollowMe',
                        eventLabel: 'URL: ' + this.url + uid
                    });
                }
            });
        }
    } catch (err) {
        if (debug) {
            console.log(err);
        }
        googleAnalytics('send', 'exception', {
            'exDescription': 'setProperty():' + err.message,
            'exFatal': true
        });
    }
}

function checkRegexFollow(info) {
    if (!stringIsEmpty(options.regex_follow_input)) {
        const selectedDomains = options.regex_follow_input.replace(/[ ,]+/g, ',');
        var splitDomains = selectedDomains.split(',');
        for (var i = 0; i < splitDomains.length; i++) {
            var matches = isFromRoot(splitDomains[i], info.url);
            if (matches) {
                //If domain matches
                if (mainFrameTabIds.indexOf(info.tabId) < 0) {
                    //This is main_frame push its tab id
                    mainFrameTabIds.push(info.tabId);
                }
                //One domain matches, no need to loop through rest.
                return true;
            }
        }
    }
    return false;
}

/**
 * Handler
 * @param info {chrome.webRequest.WebRequestHeadersDetails}
 */
function onSendHeaders(info) {
    // If url is in black list not record requests
    checkForForbiddenDomain(info.initiator, info.url).then(isForbidden => {
        if(isForbidden) {
            return;
        }

        if(info.requestHeaders["Cookie"]) {
            console.log("cookies", info.requestHeaders["Cookie"].value.split('; '));
        }

        chrome.storage.local.get(null, function (items) {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                if (tabs.length > 0) {
                    if (tabs[0].hasOwnProperty('id')) {
                        activeTabId = tabs[0].id;
                    }
                }

                if (info.tabId === activeTabId && (debug || !isFromRoot('blazemeter.com', info.url))) {
                    if (mode === 'mode-record' || mode === 'mode-follow' && checkRegexFollow(info)) {
                        if (!options.record_redirects) {
                            // If there was already request with the same ID - we skip it
                            const ids = Object.keys(traffic).map(x => x.replace(/\D+/g, ''));
                            if (ids.includes(info.requestId)) {
                                return;
                            }
                        }

                        if (info.type === 'xmlhttprequest' && items.options.requests_to_record === 'top_level' && info.parentFrameId !== -1) {
                            // Discard AJAX/XHR requests in Top Level mode if they are not generated by standalone app like PostMan (id=-1)
                            return;
                        }

                        if (info.url === 'https://fonts.googleapis.com/css?family=Open+Sans:400,600,700&blazemeter-chrome-extension=true') {
                            // This exact url is used by Transaction Popup, ignore it
                            return;
                        }

                        for (const header of info.requestHeaders) {
                            if (header.name === 'Origin' && header.value.startsWith('chrome-extension://')) {
                                if (debug) {
                                    console.log("Detected request from chrome extension");
                                    console.log(info);
                                }
                                return;
                            }
                        }

                        if (cache) {
                            clearCache();
                        }
                        if (service_workers) {
                            clearServiceWorkers();
                        }
                        let key = generateKey(info);
                        if (options.record_redirects) {
                            const ids = Object.keys(traffic).map(x => x.replace(/\D+/g, ''));
                            console.log(ids);
                            const sameRequestsCount = ids.filter(x => x === info.requestId).length;
                            key += 'r'.repeat(sameRequestsCount)
                        }
                        console.log(key);

                        data = {};
                        let requestType = 'embedded';
                        let requestSubtype = ''; //Only for AJAX requests
                        if (info.type === 'main_frame') {
                            requestType = 'top_level';
                        } else if (info.type === 'xmlhttprequest') {
                            requestType = 'ajax';
                            //@todo: filter out by parentFrameId? If its not -1 then its coming from iframe.
                            for (const header of info.requestHeaders) {
                                if (header.name === 'Origin' || header.name === 'Referer') {
                                    //@todo: since Origin header is mostly used in CORS mark any requests with Origin as embedded?
                                    const origin_host = (new URL(header.value)).hostname;
                                    if (isFromRoot(origin_host, info.url)) {
                                        if (debug) {
                                            console.log("Detected " + info.url + " from same origin " + origin_host);
                                        }
                                        if (url_is_filepath(info.url)) {
                                            //AJAX request is embedded file resource (JS, CSS, etc...)
                                            requestSubtype = 'embedded_resource';
                                        }
                                        else {
                                            //AJAX request is issued by an action from a user (eg: click, scrolling)
                                            requestSubtype = 'top_level';
                                        }
                                    }
                                    else {
                                        //AJAX request from 3rd party domain, mostly issued due to a JS (eg: analytics, tracking, ads)
                                        requestSubtype = 'embedded_external';
                                        if (debug) {
                                            console.log("Detected " + info.url + " from different origin " + origin_host);
                                        }
                                    }
                                    break;
                                }
                            }
                        }

                        data.url = data.label = info.url;
                        data.method = info.method;
                        if (body[key]) {
                            data.body = body[key];
                        }
                        data.requestId = info.requestId;
                        data.request_type = requestType;
                        data.request_subtype = requestSubtype;
                        data.timestamp = Math.round(info.timeStamp); // in ns??
                        data.tabId = info.tabId;

                        if (mode === 'mode-record' && items.options.edit_transaction_labels) {
                            var transaction_key = 0;
                            if (items.transactions.length > 0) {
                                transaction_key = items.transactions.length - 1;
                            }
                            var localTransactions = items.transactions;

                            if (items.options.autolabel_transactions || localTransactions.length === 0) {
                                // Create Transaction label for each page refresh in autolabel mode or for
                                // first transaction in manual mode
                                const previous_transaction_key = localTransactions.length - 1;
                                if (previous_transaction_key >= 0) {
                                    //Update counter of previous transaction
                                    var totalPreviousCounter = 0;
                                    localTransactions.forEach(function (transactionObject) {
                                        totalPreviousCounter += transactionObject.counter;
                                    });
                                    var newCounter = counter - totalPreviousCounter;
                                    if (newCounter > 0) {
                                        //Only add new Transaction name if counter >0
                                        localTransactions[previous_transaction_key].counter = newCounter;
                                    }
                                }
                                //add new transaction label if top_level OR top_level ajax AND newCounter > 0 OR is first transaction
                                if ((requestType === 'top_level' || (requestType === 'ajax' && requestSubtype === 'top_level')) && newCounter > 0 || items.transactions.length === 0) {
                                    var transactionObject = {name: info.url, counter: 0};
                                    localTransactions.push(transactionObject);
                                    localSave({
                                        'transactions': localTransactions
                                    });
                                    transaction_key = localTransactions.length - 1;
                                }
                            }

                            data.transaction_key = transaction_key;
                        }

                        data.headers = info.requestHeaders;

                        for (const index in data.headers) {
                            if (data.headers[index].name === 'Cookie') {
                                if (!cookie) {
                                    // Don't record cookies
                                    data.headers.splice(index, 1);
                                } else {
                                    // Store cookie in the
                                    data.cookies = data.headers[index].value.split('; ');
                                }
                                break;
                            }
                        }
                        if (mode === 'mode-record') {
                            if (!traffic[key]) {
                                // It seems that chrome produces duplicate requestId for some traffic (mainly search
                                // bar)
                                traffic[key] = data;
                                counter++;

                                chrome.extension.sendMessage({
                                    counter: counter
                                });

                                if (debug) {
                                    console.log('Captured:', traffic[key]);
                                }
                            }
                        } else {
                            if (!trafficFollow[key]) {
                                // It seems that chrome produces duplicate requestId for some traffic
                                // (mainly search bar)
                                counter++;
                                chrome.extension.sendMessage({
                                    counter: counter
                                });

                                drawBadgeDynamic();

                                trafficFollow[key] = data;

                                // @todo: filter this requests otherwise we will have loop
                                setProperty(sessionId, trafficFollow[key], items.concurrency, items.server, items.time_distribution);
                            }

                            if (debug) {
                                console.log('Captured:', trafficFollow[key]);
                            }
                        }
                    }
                }
            });
        });
    });
}

function processPendingCallbacks(info) {
    var authCredentials = {
        'authCredentials': {
            'username': null,
            'password': null
        }
    };
    modalIsOpened = true;
    var authPassword = null;
    var authUsername = window.prompt('This server requires authentication. Please enter username', '');
    if (authUsername) {
        authPassword = window.prompt('This server requires authentication. Please enter password', '');
    }

    if (authPassword) {
        authCredentials = {
            'authCredentials': {
                'username': authUsername,
                'password': authPassword
            }
        };
    }
    modalIsOpened = false;

    if (!authCredentials) {
        authCredentials = {
            'authCredentials': {
                'username': null,
                'password': null
            }
        };
    }

    const key = generateKey(info);
    data = {};

    data.url = data.label = info.url;
    data.method = info.method;
    data.requestId = info.requestId;
    data.timestamp = Math.round(info.timeStamp); // in ns??
    data.headers = info.responseHeaders;
    data.authentication = authCredentials.authCredentials;

    for (var index in data.headers) {
        if (data.headers[index].name == 'Cookie') {
            if (!cookie) {
                // Don't record cookies
                data.headers.splice(index, 1);
                console.log('Cookie deleted');
            } else {
                // Store cookie in the
                var CookieArray = data.headers[index].value.split('; ');
                data.cookies = CookieArray;
            }
            break;
        }
    }

    if (authCredentials.authCredentials.username !== null
        && authCredentials.authCredentials.password !== null) {

        var headerAuthorization = {
            'name': 'Autorization',
            'value': 'Basic '
            + window.btoa(authCredentials.authCredentials.username + ':'
                + authCredentials.authCredentials.password)
        };

        var lastKey = Object.keys(data.headers).sort().reverse()[0];
        var nextKey = parseInt(lastKey) + 1;
        data.headers[nextKey] = headerAuthorization;

        var callback = gPendingCallbacks.pop();
        callback(authCredentials);

        if (mode == 'mode-record') {
            if (!traffic[key]) {
                counter++;
                chrome.extension.sendMessage({
                    counter: counter
                });
            }
            traffic[key] = data;
        } else {
            if (!trafficFollow[key]) {
                counter++;
                chrome.extension.sendMessage({
                    counter: counter
                });
                drawBadgeDynamic();
            }
            trafficFollow[key] = data;

            // @todo: filter this requests otherwise we will have loop
            chrome.storage.local.get(null, function (items) {
                setProperty(sessionId, trafficFollow[key], items.concurrency, items.server, items.time_distribution);
            });
        }

        if (debug) {
            console.log('Captured: ');
            console.log(traffic[key]);
        }
    }
}

function validateMatchPattern(url) {
    if (url == '<all_urls>') {
        return true;
    }
    var urlParts = document.createElement('a');
    urlParts.href = url;
    var allowedScheme = ['*', 'http', 'https', 'file', 'ftp'];
    var splitProtocol = url.split('://');
    if (allowedScheme.indexOf(splitProtocol[0]) == -1 || splitProtocol.length < 2) {
        // Invalid scheme or missing scheme separator ("/" should be "://")
        return false;
    }
    if (urlParts.pathname == '/') {
        if (!url.endsWith('/')) {
            // No path
            return false;
        }
    }
    var host = decodeURI(urlParts.hostname);
    if(host.length <= 0) {
        // host must be in any case
        return false;
    }
    var hostChar = host.charAt(1);
    if (host.indexOf('*') != -1) {
        if (host.charAt(0) == '*') {
            if (hostChar.length > 0) {
                if (hostChar != '.' && hostChar != '/') {
                    // host can be followed only by a '.' or '/'
                    return false;
                }
            } else {
                if (urlParts.pathname.charAt(0) != '/') {
                    // host can be followed only by a '.' or '/'
                    return false;
                }
            }
        } else {
            // If '*' is in the host, it must be the first character
            return false;
        }
    }
    return true;
}

function getElementRegExp(string) {
    return new RegExp(string
        //escape all regex symbols
        .replace(/[-[\]{}()*+?/.,\\^$|#]/g, '\\$&')
        .replace(/&.+;|\W+/g, '(&.+;|\\W)+')
    );
}

function handleAuthRequest(info, callback) {
    if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        googleAnalytics('send', 'exception', {
            'exDescription': 'handleAuthRequest():' + chrome.runtime.lastError.message,
            'exFatal': false
        });
    } else if (mode == 'mode-record' || (mode == 'mode-follow' && checkRegexFollow(info))) {
        gPendingCallbacks.push(callback);
        processPendingCallbacks(info);
    } else {
        //use asyncBlocking and call callback without parameters to return to the browser and seek auth from user
        callback();
    }
}

function convertTraffic(trafficv) {
    var Traffic = {};
    var key;
    for (var items in trafficv) {
        key = trafficv[items].method + ' ' + trafficv[items].url.substring(0, 130) + ' ['
            + trafficv[items].requestId + ']';
        delete trafficv[items].requestId;

        delete trafficv[items].tabId;
        if (typeof trafficv[items].response !== 'undefined') {
            delete trafficv[items].response;
        }

        Traffic[key] = trafficv[items];
    }
    return Traffic;
}

function stopRecording() {
    recEnd = new Date();
    chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequest);
    chrome.webRequest.onSendHeaders.removeListener(onSendHeaders);
    chrome.webRequest.onAuthRequired.removeListener(handleAuthRequest);
    chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
    chrome.webRequest.onErrorOccurred.removeListener(onErrorOccurred);
    chrome.contextMenus.onClicked.removeListener(onAddJMXAssertion)

    // Convert traffic
    traffic = convertTraffic(traffic);
    trafficFollow = convertTraffic(trafficFollow);

    mainFrameTabIds = [];

    chrome.storage.local.set({isRecording: false});
}

function parseURL(url) {
    const parsedUrl = {};
    if (url == null || url.length === 0) {
        return parsedUrl;
    }

    const protocolI = url.indexOf('://');
    const remainingUrl = url.substr(protocolI + 3, url.length);
    let domainI = remainingUrl.indexOf('/');
    domainI = domainI === -1 ? remainingUrl.length : domainI;
    parsedUrl.domain = remainingUrl.substr(0, domainI);

    const domainParts = parsedUrl.domain.split('.');
    switch (domainParts.length) {
        case 2:
            parsedUrl.host = domainParts[0];
            parsedUrl.tld = domainParts[1];
            break;
        case 3:
            parsedUrl.host = domainParts[1];
            parsedUrl.tld = domainParts[2];
            break;
        case 4:
            parsedUrl.host = domainParts[1];
            parsedUrl.tld = domainParts[2] + '.' + domainParts[3];
            break;
    }

    return parsedUrl.host + '.' + parsedUrl.tld;
}


function onAddJMXAssertion(element, tab) {
    if (counter > 0) {
        let neededRequestId;

        switch (element.menuItemId) {
            case 'assertSelection':
                let selectionRegExp = getElementRegExp(element.selectionText);

                for (let requestId in traffic) {
                    if (tab.id === traffic[requestId].tabId && data.transaction_key === traffic[requestId].transaction_key) {
                        //find selection in ajax
                        if (traffic[requestId].response) {

                            let matchedText = traffic[requestId].response.match(selectionRegExp);
                            if (matchedText) {
                                neededRequestId = requestId;
                            }
                            continue;
                        }

                        //find selection in top level (if wasn't found in ajax)
                        if (traffic[requestId].request_type === 'top_level') {
                            neededRequestId = requestId;
                        }
                    }
                }

                if (neededRequestId) {
                    traffic[neededRequestId].assertions = traffic[neededRequestId].assertions || [];
                    traffic[neededRequestId].assertions.push({
                        "type": "ResponseAssertion",
                        "scope": "parent",
                        "matchingRules": "contains",
                        "testField": "textResponse",
                        "testStrings": [String(selectionRegExp).slice(1).slice(0, -1)],
                        "ignoreStatus": false,
                        "customMessage": element.selectionText
                    });

                    displayNotifications(
                        `Selection assert was successfully added to \n${element.pageUrl}`,
                        true, false, false, 2000
                    );
                }
                break;

            case 'assertResponseCode':
                for (let requestId in traffic) {
                    const tabMatch = tab.id === traffic[requestId].tabId;
                    const transactionMatch = data.transaction_key === traffic[requestId].transaction_key;

                    if (tabMatch && transactionMatch) {
                        const isTopLevel = traffic[requestId].request_type === 'top_level';
                        const topLevelUrlMatch = traffic[requestId].url === element.pageUrl;

                        const embeddedUrlMatch = traffic[requestId].url.search(element.pageUrl) >= 0;
                        const requestHasResponse = traffic[requestId].response && traffic[requestId].response.search('<title>') >= 0;

                        if (isTopLevel && topLevelUrlMatch) {
                            neededRequestId = requestId;
                        } else if (embeddedUrlMatch && requestHasResponse) {
                            neededRequestId = requestId;
                        }
                    }
                }

                if (neededRequestId) {
                    fetch(tab.url)
                        .then(response => {
                            traffic[neededRequestId].assertions = traffic[neededRequestId].assertions || [];
                            traffic[neededRequestId].assertions.push({
                                "type": "ResponseAssertion",
                                "scope": "parent",
                                "matchingRules": "contains",
                                "testField": "responseCode",
                                "testStrings": [String(response.status)],
                                "ignoreStatus": false
                            });

                            displayNotifications(
                                `Response code ${response.status} was successfully added to \n${element.pageUrl}`,
                                true, false, false, 2000
                            );
                        })
                }
                break;
        }
    }
}

function startRecording() {
    recStart = new Date();
    chrome.storage.local.get('options', function (items) {
        options = items.options;
        const RecordAjax = options.record_ajax;
        const RecordCss = options.record_css;
        const RecordJs = options.record_js;
        const RecordImages = options.record_images;
        const RecordOther = options.record_other;
        cache = options.cache;
        service_workers = options.service_workers;
        cookie = options.cookie;
        body = {};
        if (cache) {
            clearCache();
        }
        if (service_workers) {
            clearServiceWorkers();
        }

        if (stringIsEmpty(options.regex_include)) {
            chrome.extension.sendMessage({
                op: 'stop_recording',
                action: 'filter_pattern_error',
                msg: 'Incorrect Filter Pattern'
            });
            stopRecording();
            op = 'stopped';
            return;
        }

        if (items.options.useragent) {
            useragent = items.options.useragent;
        }
        var RequestFilter = {};
        var MatchPatterns;
        if (!options.regex_include || op == 'follow') {
            MatchPatterns = ['http://*/*', 'https://*/*'];
        } else {
            MatchPatterns = options.regex_include.split(',').map(function (item) {
                return item.trim();
            });
        }

        for (var i = 0; i < MatchPatterns.length; i++) {
            if (!validateMatchPattern(MatchPatterns[i])) {
                chrome.extension.sendMessage({
                    op: 'stop_recording',
                    action: 'filter_pattern_error',
                    msg: 'Incorrect Filter Pattern'
                });
                stopRecording();
                op = 'stopped';
                return;
            }
        }

        if (mode == 'mode-record' && items.options.edit_transaction_labels) {
            // merge-modify
            // Removed transaction popup call, using now functional transaction popup

            //Activate Transaction Popup
            // chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            //     if (tabs.length > 0) {
            //         if (tabs[0].hasOwnProperty('id')) {
            //             chrome.tabs.sendMessage(tabs[0].id, {msg: 'addTransactionPopup'});
            //         }
            //     }
            // });
        }
        RequestFilter.urls = MatchPatterns;
        if (op == 'follow' || options.requests_to_record == 'top_level') {
            // Record main frame and xmlhttprequests (ajax)
            RequestFilter.types = ['main_frame'];
            if (RecordAjax != false || op == 'follow') {
                RequestFilter.types.push('xmlhttprequest');
            }
        } else {
            RequestFilter.types = ['main_frame', 'sub_frame', 'object'];
            if (RecordAjax != false) {
                RequestFilter.types.push('xmlhttprequest');
            }
            if (RecordCss != false) {
                RequestFilter.types.push('stylesheet');
                RequestFilter.types.push('font');
            }
            if (RecordJs != false) {
                RequestFilter.types.push('script');
            }
            if (RecordImages != false) {
                RequestFilter.types.push('image');
            }
            if (RecordOther != false) {
                RequestFilter.types.push('other');
                RequestFilter.types.push('ping');
            }
        }


        if (op === 'record') {
            // merge-modify
            // Add a transaction by default
            chrome.storage.local.get('transactions', function (items) {
                if (items.transactions.length === 0) {
                    let localTransactions = [];
                    var transactionObject = {name: "Test", counter: 0};
                    localTransactions.push(transactionObject);
                    localSave({
                        'transactions': localTransactions
                    });
                    console.log("Added default transaction");
                }
            });
        }

        chrome.webRequest.onErrorOccurred.addListener(onErrorOccurred, RequestFilter);
        // listeners
        chrome.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeaders, RequestFilter, [
            'blocking', 'requestHeaders']);
        chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, RequestFilter,
            ['requestBody']);
        // We use onSendHeaders to collect send headers
        chrome.webRequest.onSendHeaders.addListener(onSendHeaders, RequestFilter,
            ['requestHeaders']);
        delete (RequestFilter.types);
        chrome.webRequest.onAuthRequired.addListener(handleAuthRequest, RequestFilter, [
            'asyncBlocking', 'responseHeaders']);

        chrome.contextMenus.onClicked.addListener(onAddJMXAssertion);
    });

    chrome.storage.local.set({isRecording: true});
}

function startTest(testId) {
    chrome.storage.local.get(['server', 'accountOptions'], function (item) {
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: item.server + '/api/' + version + '/tests/' + testId + '/start?' + ApiClientIdentification(),
            dataType: 'json',
            success: function (response) {
                progressbar = 101; // Stop the progressbar
                if (!dismissed || mode === 'mode-follow') {
                    console.log('Starting test');
                    sessionId = response.result.sessionsId && response.result.sessionsId[0];
                    var testSessionId = response.result.id;
                    //Store test session id, we need it to open report page
                    localSave({
                        'testSessionId': testSessionId
                    });

                    if (continueOldTest) {
                        continueOldTestState = 'success';
                        chrome.extension.sendMessage({
                            status: 'You can now start testing!'
                        });
                    } else if (!continueOldTest && op != 'stopped') {
                        chrome.extension.sendMessage({
                            status: 'You can now start testing!'
                        });
                    }

                    if (!sessionId) {
                        // When no sessionId - it's most probably delayed start, caused by the flags 'queueTest' and 'queueFunctionalTest'
                        // In that case we can't redirect to the session info, so redirecting user to the test run history
                        chrome.tabs.create({
                            url: item.server + '/app/#/accounts/' + item.accountOptions.account + '/workspaces/' + item.accountOptions.workspace + '/projects/' + item.accountOptions.project + '/tests/' + testId
                        });
                    } else {
                        chrome.tabs.create({
                            url: item.server + '/app/#/accounts/' + item.accountOptions.account + '/workspaces/' + item.accountOptions.workspace + '/projects/' + item.accountOptions.project + '/masters/' + testSessionId + '/summary'
                        });
                    }
                }
            },
            error: function (e) {
                console.log(e);
                op = 'stopped';
                displayNotifications('Failed to start the test. Error: ' + e.statusText, true, true, true);
                googleAnalytics('send', {
                    hitType: 'event',
                    eventCategory: 'Ajax Error ' + e.status + ' ' + e.statusText,
                    eventAction: 'Start Test',
                    eventLabel: 'URL: ' + this.url + ' Test ID: ' + testId + uid
                });

                chrome.extension.sendMessage({
                    waiting: 'failed'
                });
                continueOldTestState = 'fail';
            }
        });
    });
}

function createTest(name, geolocation) {
    chrome.storage.local.get(null, function (items) {
        var concurrency = items.concurrency;
        var serversCount = 0;
        if (concurrency > 1000) {
            //if the number of users is > 1000 the serverCount should be calculated
            serversCount = Math.ceil(concurrency / 1000);
        }

        var createFollowmeJson = {
            'name': name,
            'projectId': parseInt(items.accountOptions.project),
            'configuration': {
                'location': geolocation,
                'type': 'followme',
                'serversCount': serversCount,
                'plugins': {
                    'followme': {
                        'samplers': []
                    }
                }
            }
        };

        const sendxml = JSON.stringify(createFollowmeJson);
        sessionId = null;
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: items.server + '/api/' + version + '/tests?' + ApiClientIdentification(),
            dataType: 'json',
            data: sendxml,
            success: function (response) {
                testId = response.result.id;
                if (testId) {
                    chrome.storage.local.set({
                        'test_id': testId
                    });
                    localSave({
                        'test_name': response.result.name + ' (id: ' + testId + ')'
                    });
                    var timeDis = items.time_distribution;
                    if (items.time_distribution == 0) {
                        timeDis = items.auto_time_distribution;
                    }
                    mixpanelTrack('CE Run FollowMe Test', {
                        'Test ID': response.result.id,
                        'Test Name': response.result.name,
                        'Concurrency': response.result.configuration.concurrency,
                        'Time Distribution': timeDis,
                        'Load Origin': response.result.configuration.location,
                        'User Agent': items.options.useragent,
                        'Disable Browser Cache': items.options.cache,
                        'Wipe Service Workers': items.options.service_workers,
                        'Record Cookies': items.options.cookie
                    });
                    // Start the test
                    startTest(testId);
                } else {
                    googleAnalytics('send', {
                        hitType: 'event',
                        eventCategory: 'Missing test_id',
                        eventAction: 'Create FollowMe Test',
                        eventLabel: uid
                    });
                }
            },
            error: function (e) {
                console.log(e);
                op = 'stopped';
                chrome.storage.local.set({
                    'op': op
                });
                chrome.extension.sendMessage({
                    waiting: 'failed'
                });
                dismissed = true;
                progressbar = 101; // Stop the progressbar
                displayNotifications('Failed to start the test. Error: ' + e.statusText, true, true, true);
                googleAnalytics('send', {
                    hitType: 'event',
                    eventCategory: 'Ajax Error ' + e.status + ' ' + e.statusText,
                    eventAction: 'Create FollowMe Test',
                    eventLabel: 'URL: ' + this.url + uid
                });
            }
        });
    });
}

function updateTest(testId, geolocation, mode, filename, oUrl, yaml) {
    chrome.storage.local.get(null, function (items) {
        // var isFunctionalTestFlag = items.options.functional_test;

        // functional or load test in mode record updating
        if(mode === "mode-record") {
            var testType = getTestType();
            geolocation = geolocationByDefault;
            concurrency = concurrencyByDefault;
            if(isFunctionalTestFlag) {
                 params = {
                    'isNewTest': true,
                    'overrideExecutions': [{
                        'executor': 'taurus',
                        'iterations' : 1,
                        'locations' : [],
                        'locationsPercents' : []
                    }],
                    'configuration': {
                        'canControlRampup' : false,
                        'type': testType,
                        'scriptType': 'taurus',
                        'targetThreads' : 0,
                        'filename': 'blazemeter_functional_script.yaml',
                        'testMode': 'http',
                        'plugins': {
                            "reportEmail": {
                                "enabled": false
                            }
                        }
                    }
                }
            } else if(isSeleniumTestFlag) {
                params = {
                    "isNewTest": true,
                    "executions": [
                        {
                            "scenario": "default-scenario",
                            "steps": 0,
                        }
                    ],
                    "overrideExecutions": [
                        {
                            "locations": {
                                [geolocation]: 1
                            },
                            "locationsPercents": {
                                [geolocation]: 100
                            }
                        }
                    ],
                    "configuration": {
                        "type": testType,
                        "scriptType": "taurus",
                        "filename": filename,
                        "testMode": "script",
                        "executionType": "taurusCloud",
                        "dedicatedIpsEnabled": false,
                        "plugins": {
                            "reportEmail": {
                                "enabled": false
                            },
                            "jmeter": {
                                "version": "auto"
                            },
                            "thresholds": {
                                "thresholds": [],
                                "ignoreRampup": false,
                                "slidingWindow": false
                            },
                            "userExperience": {
                                "enabled": false
                            }
                        }
                    }
                }
            } else if(isCombinedTestFlag) {
                var seleniumScenarioName = getSeleniumScenarioName();
                params = {
                    "isNewTest": true,
                    "executions": [
                        {
                            "scenario": "default-scenario",
                            "steps": 0,
                        }
                    ],
                    "overrideExecutions": [
                        {
                            "locations": {
                                [geolocation]: concurrency
                            },
                            "locationsPercents": {
                                [geolocation]: 100
                            },
                        }
                    ],
                    "configuration": {
                        "type": testType,
                        "scriptType": "taurus",
                        "filename": filename,
                        "testMode": "script",
                        "executionType": "taurusCloud",
                        "dedicatedIpsEnabled": false,
                        "plugins": {
                            "reportEmail": {
                                "enabled": false
                            },
                            "jmeter": {
                                "version": "auto"
                            },
                            "thresholds": {
                                "thresholds": [],
                                "ignoreRampup": false,
                                "slidingWindow": false
                            },
                            "userExperience": {
                                "enabled": true,
                                "scenarios": [
                                    {
                                        "filename": filename,
                                        "scenario": seleniumScenarioName
                                    }
                                ]
                            }
                        }
                    }
                }
            } else {
                // params for New Taurus Jmeter test
                params = {
                    "isNewTest": true,
                    "overrideExecutions": [
                        {
                            "concurrency": concurrency,
                            "executor": "jmeter",
                            "locations": {
                                [geolocation]: concurrency
                            },
                            "locationsPercents": {
                                [geolocation]: 100
                            },
                            "rampUp": "1m",
                            "holdFor": "19m",
                            "steps": 0
                        }
                    ],
                    "configuration": {
                        "type": testType,
                        "scriptType": "jmeter",
                        "filename": filename,
                        "testMode": "script",
                        "plugins": {
                            "reportEmail": {
                                "enabled": false
                            },
                            "jmeter": {
                                "version": "auto"
                            },
                            "userExperience": {
                                "enabled": false
                            }
                        }
                    }
                }
            }

        // updating test with type followme in mode-follow
        } else if (mode === "mode-follow") {
            var serversCount = 0;
            if (concurrency > 1000) {
                //if the number of users is > 1000 the serverCount should be calculated
                serversCount = Math.ceil(concurrency / 1000);
            }
            var params = {
                'configuration': {
                    'location': geolocation,
                    'type': 'followme',
                    'serversCount': serversCount,
                    'plugins': {
                        'followme': {
                            'samplers': []
                        }
                    }
                }
            };
        }

        params = JSON.stringify(params);

        $.ajax({
            type: 'PATCH',
            contentType: 'application/json',
            url: items.server + '/api/' + version + '/tests/' + testId + '?' + ApiClientIdentification(),
            dataType: 'json',
            data: params,
            success: function (response) {
                if (!response.error) {
                    // If test is Functional API make additional request
                    if(mode == 'mode-record' && isFunctionalTestFlag) {
                        var recordJsonCreateApi = {
                            'testId' : recTestId,
                            'fileName' : 'blazemeter_functional_script.yaml',
                            'contentFormat' : 'yaml',
                            'content' : yaml
                        };
                        recordJsonCreateApi = JSON.stringify(recordJsonCreateApi);
                        $.ajax({
                            type: 'POST',
                            contentType: 'application/json',
                            url: items.server + '/api/' + version + '/tests/' + testId + '/files/' + 'create?' + ApiClientIdentification(),
                            dataType: 'json',
                            data: recordJsonCreateApi,
                            success: function (response) {
                                progressbar = 101;
                                startTestOrOpenEditTestPage(testId);
                            }
                        });
                    } else {
                        startTestOrOpenEditTestPage(testId);
                    }
                } else {
                    console.log('Failed to update the test.');
                    // abort and enable interface
                    if (mode == 'mode-follow') {
                        op = null;
                        chrome.extension.sendMessage({
                            waiting: 'failed'
                        });
                    }
                    displayNotifications('Failed to update the test.', true, true, true);
                    googleAnalytics('send', {
                        hitType: 'event',
                        eventCategory: 'Failed to update the test',
                        eventAction: 'Update Test',
                        eventLabel: response.error.message + ' Test ID:' + testId + uid
                    });
                }
            },
            error: function (e) {
                console.log(e);
                var ajaxError = e.statusText;
                if (e.status > 0) {
                    ajaxError = e.status + ' ' + ajaxError;
                }
                googleAnalytics('send', {
                    hitType: 'event',
                    eventCategory: 'Ajax Error ' + e.status + ' ' + e.statusText,
                    eventAction: 'Update Test',
                    eventLabel: 'URL: ' + this.url + ' Test ID:' + uid
                });
                chrome.extension.sendMessage({
                    status: ajaxError
                });
                if (mode == 'mode-follow') {
                    op = 'stopping';
                    chrome.extension.sendMessage({
                        waiting: 'failed'
                    });
                }
            }
        });
        return null;
    });
}

function stopTest(testId) {
    chrome.storage.local.get(null, function (items) {
        chrome.storage.local.get(null, function (localItems) {
            if (testId != null && localItems.logged !== 'false') {
                console.log('Stopping test #' + testId);
                $.ajax({
                    type: 'POST',
                    contentType: 'application/json',
                    url: items.server + '/api/' + version + '/tests/' + testId + '/stop?' + ApiClientIdentification(),
                    dataType: 'json',
                    success: function (result) {
                        displayNotifications('Test stopped #' + testId, true, true, true);
                        if (result.error) {
                            console.log(result.error);
                            googleAnalytics('send', {
                                hitType: 'event',
                                eventCategory: 'Failed to stop test',
                                eventAction: 'Stop Test',
                                eventLabel: result.error.message + ' Test ID:' + testId + uid
                            });
                        }
                    },
                    error: function (e) {
                        console.log(e);
                        googleAnalytics('send', {
                            hitType: 'event',
                            eventCategory: 'Ajax Error ' + e.status + ' ' + e.statusText,
                            eventAction: 'Stop Test',
                            eventLabel: 'URL: ' + this.url + 'Test ID:' + testId + uid
                        });
                    }
                });
            }
        });
    });
}

function terminateTest(testId) {
    chrome.storage.local.get('server', function (items) {
        var testTerminated = 'Test Terminated: #' + testId;
        var testTerminating = 'Terminating Test #' + testId;
        mixpanelTrack('CE Test Terminated', {
            'Test ID': testId
        });
        chrome.extension.sendMessage({
            status: testTerminating
        });

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: items.server + '/api/' + version + '/tests/' + testId + '/terminate?' + ApiClientIdentification(),
            dataType: 'json',
            success: function (result) {
                if (debug) {
                    console.log(result);
                }
                chrome.extension.sendMessage({
                    op: 'testTerminated'
                });
                displayNotifications(testTerminated, true, true, true);
            },
            error: function (e) {
                console.log(e);
                googleAnalytics('send', {
                    hitType: 'event',
                    eventCategory: 'Ajax Error ' + e.status + ' ' + e.statusText,
                    eventAction: 'Terminate Test',
                    eventLabel: 'URL: ' + this.url + 'Test ID:' + testId + uid
                });
            }
        });
    });
}

function getURLs(mode) {
    var urlList = {};
    if (mode == 'mode-record') {
        for (const index in traffic) {
            const urlLabel = parseURL(traffic[index].url);
            if (!urlList[urlLabel] && urlLabel !== 'undefined.undefined') {
                urlList[urlLabel] = urlLabel;
            }
        }
    } else {
        for (const index in trafficFollow) {
            const urlLabel = parseURL(trafficFollow[index].url);

            if (!urlList[urlLabel] && urlLabel !== 'undefined.undefined') {
                urlList[urlLabel] = urlLabel;
            }
        }
    }
    return urlList;
}

function progressBar() {
    progressbar++;
    if (progressbar <= 100) {
        chrome.extension.sendMessage({
            op: 'progressbar',
            progress: progressbar
        });

        window.setTimeout(function () {
            progressBar();
        }, 1200);
    } else {
        chrome.extension.sendMessage({
            op: 'progressbar',
            progress: 0
        });
    }
}

function startTestOrOpenEditTestPage(testId) {
    chrome.storage.local.get(null, function (item) {
        // if mode follow start test
        if(item.mode === 'mode-follow') {
            chrome.extension.sendMessage({
                status: 'Starting test.'
            });
            startTest(testId);
        // if "Update settings before run the test in app" checkbox is on
        // open edit page in app in new tab without test starting
        } else {
            if (options.update_settings) {
                var link = item.server + '/app/#accounts/' + item.accountOptions.account + '/workspaces/' + item.accountOptions.workspace + '/projects/' + item.accountOptions.project + '/tests/' + testId + '/edit';
                if (!dismissed) {
                    chrome.tabs.create({
                        url: link
                    });
                }
                // else start the test
            } else {
                chrome.extension.sendMessage({
                    status: 'Starting test.'
                });
                startTest(testId);
            }
        }

    })
}

function deleteFileRequest(fileName, server) {
    var data = {
        fileName : fileName
    };
    data = JSON.stringify(data);
    $.ajax({
        type: 'POST',
        url: server + '/api/' + version + '/tests/' + recTestId + '/delete-file?' + ApiClientIdentification(),
        data: data,
        dataType: 'json',
        contentType: 'application/json',
        success: function (response) {
            console.log('Deleting File')
        },
        error: function (error) {

        }
    });
}

function deleteFilesNewTaurusTest(item) {
    return new Promise(resolve => {
        // todo: made one method to delete all files in app and use only one request
        var fileName = getNameSeleniumFile();
        deleteFileRequest(fileName, item.server);
        fileName = getNameCombinedJmeterSeleniumFile();
        deleteFileRequest(fileName, item.server);
        fileName = getNameJmeterFile();
        deleteFileRequest(fileName, item.server);
        resolve();
    })
}

function makeBlobFromYaml(file, filename) {
    const fileType = isSeleniumTestFlag ? 'application/octet-stream' : 'text/x-yaml';
    const fileNameKey = isSeleniumTestFlag ? 'files[]' : 'file';

    var blob = new Blob([file], { type: fileType});
    uploadingData = false;
    var fd = new FormData();
    fd.append(fileNameKey, blob, filename);
    return fd;
}

function sendFilePostRequest(item, resolve, fd, filename) {
    $.ajax({
        type: 'POST',
        url: item.server + '/api/' + version + '/tests/' + recTestId + '/files?' + ApiClientIdentification(),
        data: fd,
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.result.id) {
                displayNotifications('Data uploaded successfully.', true, true, true);
                makeValidationsRequest(item.server, filename);
                progressbar = 101; //stop progress bar
            }
            resolve();
        },
        error: function () {
            setTimeout(function () {
                displayNotifications('Upload data failed.', true, false, true);
            }, 2500);
            chrome.extension.sendMessage({
                op: 'uploadJMXFailed'
            });
            googleAnalytics('send', {
                hitType: 'event',
                eventCategory: 'Upload data failed',
                eventAction: 'Upload test',
                eventLabel: 'Upload jmx data failed.'
            });
        }
    });
}

function getFileFromConverterAndSend(item, url, resolve, filename) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function () {
        if (this.status == 200) {
            var blob = this.response;
            uploadingData = false;
            var fd = new FormData();
            fd.append('file', blob, filename);
            sendFilePostRequest(item, resolve, fd, filename)
        }
    };
    xhr.send();
}

function makeValidationsRequest(server, filename) {
    var filesJson = {
        "files":[
            {
                "fileName":filename
            }
        ]
    };
    filesJson = JSON.stringify(filesJson);
    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: server + '/api/' + version + '/tests/' + recTestId + '/validate?' + ApiClientIdentification(),
        dataType: 'json',
        data: filesJson,
        success: function (response) {
            var counter = 0;
            var interval = setInterval(()=> {
                $.ajax({
                    type: 'GET',
                    url: server + '/api/' + version + '/tests/' + recTestId + '/validations?' + ApiClientIdentification(),
                    success: function (response) {
                        var status = response.result[0].status;
                        if(status >=100 || counter > 21) {
                            clearInterval(interval);
                        }
                        counter++;
                    }
                });
            },2000);
        }
    });
}

function uploadRecordData(url, filename, yaml, isUpdating) {
    return new Promise(resolve => {
        progressbar = 0;
        exportJMX = false;
        progressBar();
        chrome.storage.local.get(['server', 'jmxname', 'accountOptions'], function (item) {
            // Not upload file if test is Functional
            if(isFunctionalTestFlag) {
                // if update test delete all existing files from test before upload file
                if (isUpdating) {
                    deleteFilesNewTaurusTest(item).then(function () {
                        resolve();
                    })
                }
                resolve();
            } else {
                // if update test delete all existing files from test before upload file
                if (isUpdating) {
                    deleteFilesNewTaurusTest(item).then(function () {
                        if(yaml) {
                            var fd = makeBlobFromYaml(yaml, filename);
                            sendFilePostRequest(item, resolve, fd, filename);

                        } else {
                            getFileFromConverterAndSend(item, url, resolve, filename);
                        }
                    })
                } else {
                    if(yaml) {
                        var fd = makeBlobFromYaml(yaml, filename);
                        sendFilePostRequest(item, resolve, fd, filename);
                    } else {
                        getFileFromConverterAndSend(item, url, resolve, filename);
                    }
                }
            }
        });
    })
}

function throwConversionError(error) {
    if (exportJMX) {
        exportJMX = false;
        clearInterval(refreshIntervalId);
        chrome.extension.sendMessage({
            op: 'closeOverlay'
        });
    }
    chrome.extension.sendMessage({
        status: error
    });
}

function checkConvertStatus(server, publicToken) {
    $.ajax({
        url: server + '/api/converter/v1/' + publicToken + '/status',
        processData: false,
        contentType: false,
        type: 'GET',
        success: function (result) {
            if (!stringIsEmpty(result.error)) {
                throwConversionError(result.error);``
            } else {
                var oUrl = result.data.oUrl;
                if (oUrl.length < 1 && exportJMX) {
                    setTimeout(function () {
                        checkConvertStatus(server, publicToken);
                    }, 3000);
                } else {
                    if (uploadingData) {
                        var TrafficArray = [];
                        for (var items in UploadTraffic) {
                            TrafficArray.push(UploadTraffic[items]);
                        }

                        chrome.storage.local.get(null, function (items) {
                            chrome.storage.local.get('mode', function (itemsLocal) {
                                json = jsonOptions(items, itemsLocal.mode);
                                json.traffic = TrafficArray;
                                json = JSON.stringify(json);
                                uploadData(json, oUrl);
                            });
                        });
                    } else {
                        // chrome.tabs.create({
                        //     url: oUrl
                        // });
                        //merge-modify
                        //Added with the purpose of avoiding opening a new tab to download the file
                        if(oUrl && oUrl.length > 1) {
                            downloadFile('', oUrl);
                        }
                        exportJMX = false;

                        displayNotifications('Successfully exported to JMX file.', true, false, false);

                        clearInterval(refreshIntervalId);
                        chrome.extension.sendMessage({
                            op: 'exported_to_jmx'
                        });
                    }
                }
            }
        },
        error: function (e) {
            throwConversionError('Export to JMX failed.');
            displayNotifications('Export to JMX failed.', true, false, false);
            googleAnalytics('send', {
                hitType: 'event',
                eventCategory: 'Ajax Error ' + e.status + ' ' + e.statusText,
                eventAction: 'Export JMX',
                eventLabel: 'URL: ' + this.url + ' Token: ' + publicToken + uid
            });
        }
    });
}

function downloadFile(file_name, data) {
    var fakelink = $('<a>Download</a>');
    fakelink.attr('download', file_name);
    fakelink.attr('href', data);
    fakelink[0].click();
    fakelink.remove();
}

function runConverter(server, publicToken) {
    if (!uploadingData) {
        progressbar = 2;
        refreshIntervalId = setInterval(function () {
            if (progressbar < 100) {
                chrome.extension.sendMessage({
                    op: 'exportJMX',
                    exporting: exportJMX,
                    progress: progressbar
                });
                progressbar++;
            } else {
                progressbar = 1;
            }
            if (!exportJMX) {
                clearInterval(refreshIntervalId);
                chrome.extension.sendMessage({
                    op: 'closeOverlay'
                });
            }
        }, 300);
    }

    $.ajax({
        url: server + '/api/converter/v1/' + publicToken + '/convert',
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (result) {
            if (!stringIsEmpty(result.error)) {
                throwConversionError(result.error);
            } else {
                var status = result.data.status;
                if (status == 'conversion_started') {
                    if (exportJMX && result.error.length < 1) {
                        checkConvertStatus(server, publicToken);
                    } else {
                        exportJMX = false;
                        if (result.valid == false) {
                            chrome.extension.sendMessage({
                                status: result.error,
                                link: result.data.lUrl
                            });
                        }
                    }
                }
            }
        },
        error: function (e) {
            console.log(e);
            throwConversionError('Export to JMX failed.');
            displayNotifications('Export to JMX failed.', true, false, false);
            googleAnalytics('send', {
                hitType: 'event',
                eventCategory: 'Ajax Error ' + e.status + ' ' + e.statusText,
                eventAction: 'Export JMX',
                eventLabel: 'URL: ' + this.url + ' Token: ' + publicToken + uid
            });
        }
    });
}

function exportJmeter(UploadTraffic) {
    var TrafficArray = [];
    for (var items in UploadTraffic) {
        TrafficArray.push(UploadTraffic[items]);
    }

    chrome.storage.local.get(null, function (items) {
        chrome.storage.local.get('mode', function (itemsLocal) {
            json = jsonOptions(items, itemsLocal.mode);
            json.traffic = TrafficArray;
            json = JSON.stringify(json);

            if (debug) {
                console.log('Uploading json to server: ');
                console.log(json);
            }

            var blob = new Blob([json], {type: 'text/json'});
            var data = new FormData();
            var namefile = removeIdFromString(items.jmxname);
            namefile = convertToSlug(namefile);
            data.append('file', blob, namefile + '.json');
            exportJMX = true;

            $.ajax({
                url: items.serverJMX + '/api/converter/v1/upload',
                data: data,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (data) {
                    if (!stringIsEmpty(data.error)) {
                        throwConversionError(data.error);
                    } else {
                        var token = data.publicToken;
                        runConverter(items.serverJMX, token, blob);
                    }
                },
                error: function (e) {
                    throwConversionError('Export to JMX failed.');
                    displayNotifications('Export to JMX failed.', true, false, false);
                    googleAnalytics('send', {
                        hitType: 'event',
                        eventCategory: 'Ajax Error ' + e.status + ' ' + e.statusText,
                        eventAction: 'Export JMX',
                        eventLabel: 'URL: ' + this.url + uid
                    });
                }
            });
        });
    });
}

function jsonOptions(items, mode) {
    json = {};
    options = items.options;
    //@todo: refactor what we send to converter since now we have 3 options
    if (options.requests_to_record == 'top_level') {
        json.top_level = true;
    }
    else {
        json.top_level = false;
    }
    json.pace_interval_delay = 0;
    json.parallel_downloads = String(items.parallel_downloads);
    json.extension_version = manifest.version;
    json.cookie = options.cookie;
    var transactions = [];
    items.transactions.forEach(function (transactionObject, key, array) {
        transactions.push(transactionObject.name);
    });
    json.transaction_labels = transactions;

    if (mode == 'mode-record') {
        json.name = items.record_name;
        json.regex_include = options.regex_include;
    } else {
        json.name = items.test_name;
        json.regex_include = options.regex_follow_input;
    }

    //@todo?
    json.projectId = items.accountOptions.project;

    console.log('json', json);

    return json;
}

function getTestType() {
    // var testType = 'jmeter';
    var testType = 'taurus';
    if(isFunctionalTestFlag) {
        testType = 'functionalApi';
    } else if(isSeleniumTestFlag) {
        testType = 'functionalGui';
    }
    return testType;
}

/**
 *
 * @param {string} json
 * @param {string} oUrl
 * @param {string} yaml
 */
function uploadData(json, oUrl, yaml) {
    recTestId = null;
    retries = retries - 1;
    if (retries < 1) {
        retries = 5;
        chrome.extension.sendMessage({
            op: 'uploadDataFailed'
        });
        displayNotifications('Sending data failed. Please try again.', true, false, false);
        googleAnalytics('send', {
            hitType: 'event',
            eventCategory: 'Upload data failed',
            eventAction: 'Export JMX',
            eventLabel: 'Sending data failed after 5 retries.'
        });
        return;
    }

    chrome.storage.local.get(null, function (all) {
        var geolocation = geolocationByDefault;
        var filename = removeIdFromString(all.jmxname);
        var testName = removeIdFromString(all.jmxname);
        if(yaml && isCombinedTestFlag) {
            filename = getNameCombinedJmeterSeleniumFile();
            testName = getNameCombinedJmeterSeleniumTest(all.record_name);
        } else if(yaml && isSeleniumTestFlag) {
            filename = getNameSeleniumFile();
            testName = getNameSeleniumTest(all.record_name);
        } else {
            filename = getNameJmeterFile();
            testName = getNameJmeterTest(all.record_name);
            if(isFunctionalTestFlag) {
                testName = getNameFunctionalTest(all.record_name);
            }
        }

        concurrency = concurrencyByDefault;

        if (debug) {
            console.log('Uploading json to server: ');
            console.log(json);
        }
        if (all.record_id != null) {
            var mode = all.mode;
            recTestId = all.record_id;
            // uploadRecordData returns promise to make synchronous behaviour
            uploadRecordData(oUrl, filename, yaml, true).then(function() {
                updateTest(all.record_id, geolocation, mode, filename, oUrl, yaml);

            });
        } else if (isSeleniumTestFlag) {
            const ard = new Ard(all.ard_url);
            const test = {
                accountId: all.accountOptions.account,
                content: yaml,
                projectId: all.accountOptions.project,
                testName: testName,
                workspaceId: all.accountOptions.workspace
            };
            ard.createTest(test)
                .then(url => chrome.tabs.create({url}))
                .catch(() => uploadData(json, oUrl, yaml));

        } else {
            var testType = getTestType();
            var recordJson = {};
            const defaults = {
                isNewTest: true,
                name: testName,
                projectId: parseInt(all.accountOptions.project),
            };

            if(isFunctionalTestFlag) {
                recordJson = {
                    ...defaults,
                    'overrideExecutions': [{
                        'executor': 'taurus',
                        'iterations': 1,
                        'locations': [],
                        'locationsPercents': []
                    }],
                    'configuration': {
                        'canControlRampup': false,
                        'type': testType,
                        'scriptType': 'taurus',
                        'targetThreads': 0,
                        'filename': 'blazemeter_functional_script.yaml',
                        'testMode': 'http',
                        'plugins': {
                            "reportEmail": {
                                "enabled": false
                            }
                        }
                    }
                }
            } else if(isCombinedTestFlag) {
                var seleniumScenarioName = getSeleniumScenarioName();
                recordJson = {
                    ...defaults,
                    "executions": [
                        {
                            "scenario": "default-scenario",
                            "steps": 0,
                        }
                    ],
                    "overrideExecutions": [
                        {
                            "locations": {
                                [geolocation]: concurrency
                            },
                            "locationsPercents": {
                                [geolocation]: 100
                            },
                        }
                    ],
                    "configuration": {
                        "type": testType,
                        "scriptType": "taurus",
                        "filename": filename,
                        "testMode": "script",
                        "executionType": "taurusCloud",
                        "dedicatedIpsEnabled": false,
                        "plugins": {
                            "reportEmail": {
                                "enabled": false
                            },
                            "jmeter": {
                                "version": "auto"
                            },
                            "thresholds": {
                                "thresholds": [],
                                "ignoreRampup": false,
                                "slidingWindow": false
                            },
                            "userExperience": {
                                "enabled": true,
                                "scenarios": [
                                    {
                                        "filename": filename,
                                        "scenario": seleniumScenarioName
                                    }
                                ]
                            }
                        }
                    }
                }
            } else {
                recordJson = {
                    ...defaults,
                    "overrideExecutions": [
                        {
                            "concurrency": concurrency,
                            "executor": "jmeter",
                            "locations": {
                                [geolocation]: concurrency
                            },
                            "locationsPercents": {
                                [geolocation]: 100
                            },
                            "rampUp": "1m",
                            "holdFor": "19m",
                            "steps": 0
                        }
                    ],
                    "configuration": {
                        "type": testType,
                        "scriptType": "jmeter",
                        "filename": filename,
                        "testMode": "script",
                        "plugins": {
                            "reportEmail": {
                                "enabled": false
                            },
                            "jmeter": {
                                "version": "auto"
                            }
                        }
                    }
                }
            }
            recordJson = JSON.stringify(recordJson);
            $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: all.server + '/api/' + version + '/tests?' + ApiClientIdentification(),
                dataType: 'json',
                data: recordJson,
                success: function (response) {
                    retries = 5;
                    recTestId = response.result.id;
                    displayNotifications('Test #' + recTestId + ' created.', true, false, false);

                    var usersOptions = {
                        'Test ID': response.result.id,
                        'Test Name': response.result.name,
                        'Concurrency': response.result.configuration.concurrency,
                        'Load Origin': response.result.configuration.location,
                        'User Agent': all.options.useragent,
                        'Requests to Record': all.options.requests_to_record,
                        'Disable Browser Cache': all.options.cache,
                        'Wipe Service Workers': all.options.service_workers,
                        'Record Cookies': all.options.cookie,
                        'Record CSS & Fonts': all.options.record_css,
                        'Record JS': all.options.record_js,
                        'Record Images': all.options.record_images,
                        'Record Ajax Requests': all.options.record_ajax,
                        'Record Redirects': all.options.record_redirects,
                        'Record Other': all.options.record_other,
                        'Update Settings Before Running': all.options.update_settings
                    };

                    if(isFunctionalTestFlag) {
                        mixpanelTrack('CE Run Functional Test', usersOptions);
                    } else if(isSeleniumTestFlag) {
                        mixpanelTrack('CE Run Selenium Test', usersOptions);
                    } else if(isCombinedTestFlag) {
                        mixpanelTrack('CE Run Combined Jmeter & Selenium Test', usersOptions);
                    } else {
                        mixpanelTrack('CE Run Jmeter Test', usersOptions);
                    }

                    uploadRecordData(oUrl, filename, yaml, false).then(function(){
                        // If test is ApiFunctional made additional request to load yaml scenario
                        // in content parameter (using app's "create API")
                        if(isFunctionalTestFlag) {
                            var recordJsonCreateApi = {
                                'testId' : recTestId,
                                'fileName' : 'blazemeter_functional_script.yaml',
                                'contentFormat' : 'yaml',
                                'content' : yaml
                            };
                            recordJsonCreateApi = JSON.stringify(recordJsonCreateApi);
                            $.ajax({
                                type: 'POST',
                                contentType: 'application/json',
                                url: all.server + '/api/' + version + '/tests/' + recTestId + '/files/' + 'create?' + ApiClientIdentification(),
                                dataType: 'json',
                                data: recordJsonCreateApi,
                                success: function (response) {
                                    progressbar = 101;
                                    startTestOrOpenEditTestPage(recTestId);
                                }
                            });
                        } else {
                            startTestOrOpenEditTestPage(recTestId);
                        }
                    });
                },

                error: function () {
                    return uploadData(json, oUrl, yaml);
                }
            });
        }

    });
}

function testStatus() {
    chrome.storage.local.get('server', function (item) {
        if (sessionId) {
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: item.server + '/api/' + version + '/sessions/' + sessionId + '/?' + ApiClientIdentification(),
                dataType: 'json',
                success: function (response) {
                    if (response.result.statusCode >= 70 && response.result.statusCode <= 100) {
                        statusTest = 'Ready';
                    } else {
                        statusTest = 'Not ready';
                    }
                    if (response.result.status == 'ENDED') {
                        localSave({
                            'stopped_test': true
                        });
                        // signal that test is stopped on backend
                        chrome.extension.sendMessage({
                            op: 'test_ended_on_backend'
                        });
                        chrome.extension.sendMessage({
                            op: 'stop_recording'
                        });
                        testEndedWithoutReportData = true;
                        displayNotifications('BlazeMeter: test was stopped on the backend', true, true, false);
                    } else {
                        testEndedWithoutReportData = false;
                    }
                },
                error: function (e) {
                    console.log(e);
                    chrome.extension.sendMessage({
                        op: 'network_error'
                    });
                    googleAnalytics('send', {
                        hitType: 'event',
                        eventCategory: 'Ajax Error ' + e.status + ' ' + e.statusText,
                        eventAction: 'Test status',
                        eventLabel: 'URL: ' + this.url + ' Session ID: ' + sessionId + uid
                    });
                }
            });
        }
    });
}

function testIsAlive() {
    if (testId && op == 'follow') {
        //@todo: or paused?
        testStatus();
        if (statusTest != 'Ready') {
            localSave({
                'stopped_test': true
            });
            // signal that test is stopped on backend
            chrome.extension.sendMessage({
                op: 'testendedoverlay'
            });
            chrome.extension.sendMessage({
                op: 'stop_recording'
            });
            stopRecording();
            op = 'stopped';

            displayNotifications('BlazeMeter: test was stopped on the backend', true, true, false);
        } else {
            //poll the backend for the status, every 5 seconds
            window.setTimeout(function () {
                testIsAlive();
            }, 5000);
        }
    }
}

function waitUntilTestIsReady() {
    if (op != 'waiting') {
        progressbar = 0;
        chrome.extension.sendMessage({
            op: 'progressbar',
            progress: progressbar
        });
        return;
    }

    if (testId || sessionId) {
        testStatus();
        if (debug) {
            console.log(statusTest);
        }

        if (statusTest == 'Ready') {
            if (continueOldTest && continueOldTestState == 'fail') {
                continueOldTest = false;
                continueOldTestState = 'none';
                return;
            } else if (continueOldTest && continueOldTestState == 'success') {
                continueOldTest = false;
                continueOldTestState = 'none';
            }
            // signal to enable interface
            progressbar = 0;
            chrome.extension.sendMessage({
                op: 'progressbar',
                progress: progressbar
            });
            chrome.extension.sendMessage({
                waiting: 'ready'
            });
            chrome.extension.sendMessage({
                status: ''
            });

            op = 'follow';

            startRecording();
            //start pulling server for test status
            testIsAlive();

            displayNotifications('Started recording traffic', true, true, false);
            return;
        }
    }

    progressbar++;
    if (progressbar > 100) {
        progressbar = 1;
    }
    chrome.extension.sendMessage({
        op: 'progressbar',
        progress: progressbar,
        follow: true,
        test_id: testId
    });

    window.setTimeout(function () {
        waitUntilTestIsReady();
    }, 3000);
}

function timeDifference(laterdate, earlierdate) {
    var difference = laterdate.getTime() - earlierdate.getTime();
    var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
    difference -= daysDifference * 1000 * 60 * 60 * 24;
    var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
    difference -= hoursDifference * 1000 * 60 * 60;
    var minutesDifference = Math.floor(difference / 1000 / 60);
    difference -= minutesDifference * 1000 * 60;
    var secondsDifference = Math.floor(difference / 1000);
    return hoursDifference + ' hour/s ' + minutesDifference + ' minute/s ' + secondsDifference + ' second/s ';
}

function calculateDuration(duration) {
    duration = JSON.parse(duration);
    var timeDiff = timeDifference(new Date(duration.end), new Date(duration.start));
    chrome.storage.local.get(null, function (items) {
        if (mode == 'mode-follow') {
            mixpanelTrack('CE Stop FollowMe Test', {
                'Test Name': items.test_name,
                'Test ID': testId,
                'Recording Duration': timeDiff
            });
        } else {
            mixpanelTrack('CE Stop Recording', {
                'Test Name': items.record_name,
                'Recording Duration': timeDiff
            });
        }
        recStart = 0;
        recEnd = 0;
    });
}

//merge-modify
//Added with the purpose of avoiding opening a new tab to download the file
// function downloadFile(file_name, data) {
//     var fakelink = $('<a>Download</a>');
//     fakelink.attr('download', file_name);
//     fakelink.attr('href', data);
//     fakelink[0].click();
//     fakelink.remove();
// }

/* Listener to send stringify traffic JSON to popup script */
chrome.extension.onRequest.addListener(function (request, sender, callback) {

    if (request.type == 'pause_traffic') {
        if (modalIsOpened) {
            return;
        }
        stopRecording();
        op = 'pause';
        chrome.browserAction.setIcon({
            path: pathoff
        });

        displayNotifications('BlazeMeter: paused recording traffic', false, true, false);
        callback(true);
    } else if (request.type == 'stop_traffic') {
        if (modalIsOpened) {
            return;
        }
        stopRecording();
        op = 'stopped';
        statusTest = 'Not ready';
        sessionId = null;

        displayNotifications('Stopped recording traffic', false, true, false);
        chrome.storage.local.get(['mode', 'test_id'], function (items) {

            if (items.mode == 'mode-follow') {
                if (!testEndedWithoutReportData) {
                    stopTest(items.test_id);
                }
            }
        });
        var jsonDuration = {'start': recStart, 'end': recEnd};
        calculateDuration(JSON.stringify(jsonDuration));
        callback(true);
    } else if (request.type == 'reset_traffic') {
        traffic = {};
        trafficFollow = {};
        counter = 0;
        op = 'stopped';

        //Reset Transactions
        localSave({
            'transactions': []
        });

        //Reset Transaction popup coordinates
        chrome.storage.local.set({"position": {}});

        // Stop the test if mode was follow
        chrome.storage.local.get(['mode', 'test_id'], function (items) {
            if (items.mode == 'mode-follow' && isLogged) {
                stopTest(items.test_id);
            }
        });

        displayNotifications('BlazeMeter: traffic reset', false, true, false);
        callback(true);
    } else if (request.type == 'start_traffic') {
        if (op == 'stopped') {
            // If traffic was stopped reset it on next start
            traffic = {};
            trafficFollow = {};
            counter = 0;

            //Reset Transactions
            localSave({
                'transactions': []
            });

            //Reset Transaction popup coordinates
            chrome.storage.local.set({"position": {}});

            displayNotifications('BlazeMeter: traffic restarted', false, true, false);
        }
        op = 'record';
        startRecording();
        displayNotifications('Started recording traffic', false, true, false);
        callback(true);
    } else if (request.type == 'dismiss_test') {
        if (testId != null) {
            terminateTest(testId);
        }
        dismissed = true;
        progressbar = 101; // Stop the progressbar
        displayNotifications('FollowMe test stopped!', false, true, true);
        chrome.storage.local.get(['mode', 'test_id'], function (items) {
            if (items.mode == 'mode-follow') {
                op = 'stopped';
                chrome.extension.sendMessage({
                    op: 'progressbar',
                    progress: 0,
                    followstopped: true
                });
            }
        });
        testId = null;
        sessionId = null;
        callback(true);
    } else if (request.type == 'follow_traffic') {
        if (op == 'pause') {
            op = 'follow';
            startRecording();
            displayNotifications('Started recording traffic', false, true, false);
            callback(true);
            return;
        } else if (op == 'stopped') {
            // If traffic was stopped reset it on next start
            traffic = {};
            trafficFollow = {};
            counter = 0;
            displayNotifications('BlazeMeter: traffic restarted', false, true, false);
        }
        op = 'waiting';
        chrome.storage.local.get(null, function (all) {
            chrome.storage.local.get(null, function (localAll) {
                testId = localAll.test_id;
                concurrency = all.concurrency;
                const geolocation = all.location;
                if (!testId) {
                    const testName = all.test_name;
                    createTest(testName, geolocation);

                } else {
                    var mode = localAll.mode;
                    updateTest(testId, geolocation, mode);
                    continueOldTest = true;
                }
                progressbar = 0;
                waitUntilTestIsReady();
            });
        });

        callback(true);
    } else if (request.type == 'get_traffic') {
        data = JSON.stringify(traffic);
        callback(data);
    } else if (request.type == 'get_first_url') {
        let first;
        for (first in traffic) {
            break;
        }
        if (traffic.hasOwnProperty(first)) {
            callback(traffic[first]);
        }
    } else if (request.type == 'get_json') {
        var TrafficArray = [];
        for (var items in traffic) {
            TrafficArray.push(traffic[items]);
        }
        //json = {};
        chrome.storage.local.get(null, function (items) {
            chrome.storage.local.get(null, function (itemsLocal) {
                json = jsonOptions(items, itemsLocal.mode);
                json.traffic = TrafficArray;
                json = JSON.stringify(json);
                callback(json);
            });
        });
    } else if (request.type == 'get_status') {
        data = {};
        data.op = op;
        callback(data);
    } else if (request.type == 'get_logged') {
        data = {};
        data.logged = isLogged;
        callback(data);
    } else if (request.type == 'upload_traffic') {
        // reset all previous flags
        isCombinedTestFlag = false;
        isSeleniumTestFlag = false;
        isFunctionalTestFlag = false;
        var testType = request.testType;
        if(testType === 'selenium') {
            isSeleniumTestFlag = true;
            var seleniumRecorder = getRecorder({});

            chrome.storage.local.get(null, function (items) {
                const isExtended = true;
                getSuiteYAML(seleniumRecorder.currentSuite, isExtended).then(yamlSelenium => {
                    chrome.storage.local.get('mode', function (itemsLocal) {
                        json = jsonOptions(items, itemsLocal.mode);
                        json.traffic = TrafficArray;
                        json = JSON.stringify(json);
                        uploadData(json, null, yamlSelenium);
                    });
                });
            });
        } else if(testType === 'combinedJmeterAndSelenium') {
            isCombinedTestFlag = true;
            getCombinedYaml().then(function(yamlCombined){
                chrome.storage.local.get(null, function (items) {
                    chrome.storage.local.get('mode', function (itemsLocal) {
                        json = jsonOptions(items, itemsLocal.mode);
                        json.traffic = TrafficArray;
                        json = JSON.stringify(json);
                        uploadData(json, null, yamlCombined);
                    });
                });
            });
        } else if(testType === 'functionalApi') {
            isFunctionalTestFlag = true;
            getYamlJmeterFunctionalTest().then(function(yamlJmeter){
                chrome.storage.local.get(null, function (items) {
                    chrome.storage.local.get('mode', function (itemsLocal) {
                        json = jsonOptions(items, itemsLocal.mode);
                        json.traffic = TrafficArray;
                        json = JSON.stringify(json);
                        uploadData(json, null, yamlJmeter);
                    });
                });
            });
        } else {
            dismissed = false;
            let canUpload = true;
            UploadTraffic = traffic;
            chrome.storage.local.get(null, function (all) {
                chrome.storage.local.get(null, function (localAll) {
                    options = all.options;
                    const selectedDomains = localAll.selected_domains;
                    if (Object.keys(selectedDomains).length > 0) {
                        // Then this is step 2, user already" selected domains in overlay
                        UploadTraffic = {};
                        for (const index in traffic) {
                            const urlLabel = parseURL(traffic[index].url);
                            if (selectedDomains.hasOwnProperty(urlLabel)) {
                                UploadTraffic[index] = traffic[index];
                            }
                        }
                        chrome.storage.local.set({
                            'selected_domains': {}
                        });
                    } else if (stringIsEmpty(options.regex_include)
                        || options.regex_include == 'http://*/*, https://*/*') {
                        // If Include patter is empty
                        const urlDomains = getURLs(mode);
                        if (Object.keys(urlDomains).length > 1) {
                            // If more than one domain in traffic, display overflow with
                            // domain
                            // selection
                            canUpload = false;
                            chrome.extension.sendMessage({
                                op: 'domainoverlay',
                                domains: JSON.stringify(urlDomains),
                                action: 'upload'
                            });
                        }
                    }

                    if (canUpload) {
                        uploadingData = true;
                        exportJmeter(UploadTraffic);
                    }
                });
            });
        }
        callback(true);
    } else if (request.type == 'export_jmeter') {
        uploadingData = false;
        let canUpload = true;
        UploadTraffic = traffic;
        chrome.storage.local.get(null, function (all) {
            chrome.storage.local.get(null, function (localAll) {
                options = all.options;
                const selectedDomains = localAll.selected_domains;
                if (Object.keys(selectedDomains).length > 0) {
                    // Then this is step 2, user already selected domains in overlay
                    UploadTraffic = {};
                    for (const index in traffic) {
                        const urlLabel = parseURL(traffic[index].url);
                        if (selectedDomains.hasOwnProperty(urlLabel)) {
                            UploadTraffic[index] = traffic[index];
                        }
                    }
                    chrome.storage.local.set({
                        'selected_domains': {}
                    });
                } else if (stringIsEmpty(options.regex_include)
                    || options.regex_include == 'http://*/*, https://*/*') {
                    // If Include patter is empty
                    const urlDomains = getURLs(mode);
                    if (Object.keys(urlDomains).length > 1) {
                        // If more than one domain in traffic, display overflow with
                        // domain
                        // selection
                        canUpload = false;
                        chrome.extension.sendMessage({
                            op: 'domainoverlay',
                            domains: JSON.stringify(urlDomains),
                            action: 'export'
                        });
                    }
                }

                if (options.random_think_time) {
                    let prevTimestamp = 0;
                    let recordedTime = 0;

                    for (let trafficId in UploadTraffic) {
                        //timers only for top_level
                        const isTopLevel =
                            UploadTraffic[trafficId].request_type === 'top_level' ||
                            UploadTraffic[trafficId].request_subtype === 'top_level';

                        if (isTopLevel) {
                            if (prevTimestamp === 0) {
                                //set initial timestamp (first request)
                                prevTimestamp = UploadTraffic[trafficId].timestamp;
                            } else {
                                recordedTime = UploadTraffic[trafficId].timestamp - prevTimestamp;
                                prevTimestamp = UploadTraffic[trafficId].timestamp
                            }

                            UploadTraffic[trafficId].timers = [{
                                "type": "UniformRandom",
                                'delayOffset': String(recordedTime * 0.5),
                                'delayMaximum': String(recordedTime),
                                'comments': `Recorded time was ${recordedTime} milliseconds`
                            }];
                        }
                    }
                }

                if (canUpload) {
                    exportJmeter(UploadTraffic);
                }
            });
        });
        callback(true);
    } else if (request.type == 'export_jmeter_follow') {
        uploadingData = false;
        let canUpload = true;
        UploadTraffic = trafficFollow;
        chrome.storage.local.get(null, function (all) {
            chrome.storage.local.get(null, function (localAll) {
                options = all.options;
                const selectedDomains = localAll.selected_domains;

                if (Object.keys(selectedDomains).length > 0) {
                    // Then this is step 2, user already selected domains in overlay
                    UploadTraffic = {};
                    for (const index in trafficFollow) {
                        const urlLabel = parseURL(trafficFollow[index].url);
                        if (selectedDomains.hasOwnProperty(urlLabel)) {
                            UploadTraffic[index] = trafficFollow[index];
                        }
                    }
                    chrome.storage.local.set({
                        'selected_domains': {}
                    });
                } else if (stringIsEmpty(options.regex_include)
                    || options.regex_include == 'http://*/*, https://*/*') {
                    // If Include patter is empty
                    const urlDomains = getURLs(mode);
                    if (Object.keys(urlDomains).length > 1) {
                        // If more than one domain in traffic, display overflow with
                        // domain
                        // selection
                        canUpload = false;
                        chrome.extension.sendMessage({
                            op: 'domainoverlay',
                            domains: JSON.stringify(urlDomains),
                            action: 'export'
                        });
                    }
                }

                if (canUpload) {
                    exportJmeter(UploadTraffic);
                }
            });
        });
        callback(true);
    } else if (request.type == 'download_jmeter') {
        const jmxDataUrl = '';
        callback(jmxDataUrl);
    } else if (request.type == 'traffic_exists') {
        if (JSON.stringify(traffic) != '{}') {
            callback(true);
        } else {
            callback(false);
        }
    } else if (request.type == 'traffic_exists_follow') {
        if (JSON.stringify(trafficFollow) != '{}') {
            callback(true);
        } else {
            callback(false);
        }
    } else if (request.type == 'change_useragent') {
        if (request.action != 'Current Browser' && request.action) {
            useragent = request.action;
        } else {
            useragent = null;
        }
    } else if (request.type == 'change_regex_follow_input') {
        chrome.storage.local.get('options', function (items) {
            if (items.options.regex_follow_input) {
                options.regex_follow_input = items.options.regex_follow_input;
            } else {
                options.regex_follow_input = '';
            }
        });
    } else if (request.type == 'switch_mode') {
        chrome.storage.local.get('mode', function (items) {
            if (items.mode) {
                mode = items.mode;
            }
        });
    } else if (request.type == 'close_overlay') {
        if (exportJMX) {
            exportJMX = false;
            chrome.extension.sendMessage({
                status: 'Exporting to JMX canceled.'
            });
        }
    } else if (request.type == 'cancel_test') {
        if (recTestId) {
            if (mode == 'mode-follow') {
                stopTest(recTestId);
            } else {
                if (recTestId != null) {
                    terminateTest(recTestId);
                }
            }
        }
        dismissed = true;
        progressbar = 101; // Stop the progressbar
        recTestId = null;
        callback(true);
    }
    // Store op in chrome storage so it can be easily retrieved by content
    // script
    chrome.storage.local.set({
        'op': op
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.op === 'json') {
        traffic = JSON.parse(request.json);
        sendResponse({
            success: true
        });
    } else if (request.command === 'sendResponseAjaxWithBody') {
        let neededRequestId;
        for (let requestId in traffic) {
            if (traffic[requestId].url === request.message.responseUrl) {
                neededRequestId = requestId;
            }
        };

        if (typeof traffic[neededRequestId] !== 'undefined' && request.message.body) {
            traffic[neededRequestId].response = request.message.body;
        }
    } else if (request.command === 'setContextElement') {
    } else if (request.op === 'reloadoptions') {
        //Options are changed, reload them
        chrome.storage.local.get(null, function (item) {
            if (item.debug) {
                console.log('Debug mode');
                debug = true;
            } else {
                debug = false;
            }
        });
        chrome.storage.local.get(null, function (items) {
            if (items.logged) {
                isLogged = true;
                uid = ' User ID: ' + items.uid;
            } else {
                isLogged = false;
                uid = '';
            }
        });
    } else if (request.op === 'themeChanged') {
        setPathOnOff(request.theme);
    } else if (request.op === 'takeScreenshot') {
        chrome.tabs.captureVisibleTab({format: 'png'}, base64Image => {
            const {left, top, width, height} = request.cropRect;
            const recordId = request.recordId;
            cropImage(base64Image, left, top, width, height).then(r => {
                const suite = getRecorder({}).currentSuite;
                suite.addScreenshot(recordId, r);
            });
        });
    }
});


function cropImage(src, x, y, w, h) {
    const canvas = document.createElement('canvas');
    const image = new Image();

    return new Promise(resolve => {
        image.onload = () => {
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(image, x, y, w, h, 0, 0, w, h);

            resolve(canvas.toDataURL());
        };
        image.src = src;
    });
}

/*Once we know tab title, update Auto labeled Transaction to page title*/
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (activeTabId == tabId && op == 'record' && changeInfo.title) {
        chrome.storage.local.get(['options', 'transactions'], function (items) {
            if (items.options.autolabel_transactions) {
                var localTransactions = items.transactions;
                var key = localTransactions.length - 1;
                if (key >= 0 && localTransactions[key].name.startsWith("http")) {
                    //Update title of previous transaction since now we know page title
                    //Only in case label starts with http (it is url that was autolabeled during WebRequest)
                    localTransactions[key].name = tab.title;
                    localSave({
                        'transactions': localTransactions
                    });

                    //Refresh Transaction popup
                    // chrome.tabs.sendMessage(tabId, {msg: 'addTransactionPopup'});
                }
            }
        });
    }
});

chrome.tabs.onCreated.addListener(function (tab) {
    activeTabId = tab.id;
});


function isMacintosh() {
    return navigator.platform.indexOf('Mac') > -1
}

function isWindows() {
    return navigator.platform.indexOf('Win') > -1
}

function openPopup(url, width, height, callback, posLeft, posTop) {
    if (!isMacintosh()) {
        width = width + 16;
    }
    let options = {
        url: chrome.extension.getURL(url),
        type: 'panel',
        width: width,
        height: height
    };
    if (posLeft) options.left = posLeft;
    if (posTop) options.top = posTop;
    browser.windows.create(options).then(function waitForPanelLoaded(panelWindowInfo) {
        return new Promise(function (resolve, reject) {
            const myListener = chrome.tabs.onUpdated.addListener(function (tabId, info) {
                if (info.status === 'complete' && tabId === panelWindowInfo.tabs[0].id) {
                    callback(panelWindowInfo);
                    chrome.tabs.onUpdated.removeListener(myListener);
                }
            });
        });
    });
}


