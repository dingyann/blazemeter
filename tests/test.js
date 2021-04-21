var test = require('tape');
var report = require('browserify-tape-spec');

test( 'User is logged in', function( assert ) {
    chrome.storage.local.set({
        'logged': true
    });

    chrome.storage.local.get('logged', function (item) {
        console.log(item.logged);
        assert.true(item.logged, 'User is logged in');
        //assert.end();  //need to put assert.end here for each async item
    });


    chrome.storage.local.set({
        'logged': false
    });

    chrome.storage.local.get('logged', function (item) {
        console.log(item.logged);
        assert.false(item.logged, 'User is not logged in');
        assert.end();  //need to put assert.end here for each async item
    });
} );

test( 'Init interface', function( assert ) {
    defaultsLoad();

    setTimeout(function () {
        chrome.storage.local.get(null, function (items) {
            //console.log(items);
            assert.equal(items.theme, 'blazemeter', 'BlazeMeter theme used.');
            assert.equal(items.serverJMX, 'http://converter.blazemeter.com', 'BlazeMeter Converter URL initialized.');
            assert.equal(items.server, 'https://a.blazemeter.com', 'BlazeMeter Server URL initialized.');
            console.log(pathon);
            assert.doesNotThrow(function(){
                chrome.browserAction.setIcon({
                    path: pathon
                });
            },'Pathon icon');

            assert.doesNotThrow(function(){
                chrome.browserAction.setIcon({
                    path: pathoff
                });
            },'Pathoff icon');

            assert.end();  //need to put assert.end here for each async item
        });
    }, 2000);
} );

test( 'URL matches root domain', function( assert ) {

    var rootDomains = ['blazemeter.com', 'dynatrace.com', 'google.co.uk', 'blazemeter.agency'];
    var url;

    var goodUrlTemplates = ['http://a.$_DOMAIN', 'https://a.$_DOMAIN', 'http://a.b.c.d.$_DOMAIN', 'http://www.$_DOMAIN', 'http://$_DOMAIN', 'http://$_DOMAIN/google.co.uk'];
    rootDomains.forEach(function(domain) {
        goodUrlTemplates.forEach(function(template) {
        url = template.split("$_DOMAIN").join(domain);
        assert.true( isFromRoot(domain, url), url + ' matches root domain ' + domain);
    });
    });

    var badUrlTemplates = ['http://a.$_DOMAIN.com', 'https://a.$_DOMAIN.hr', 'http://$_DOMAIN.a.b.c.d', 'http://www.test.com/$_DOMAIN'];
    rootDomains.forEach(function(domain) {
        badUrlTemplates.forEach(function(template) {
            url = template.split("$_DOMAIN").join(domain);
            assert.false( isFromRoot(domain, url), url + ' doesnt match root domain ' + domain);
        });
    });
    assert.end();
} );


test( 'MatchPattern regex validator', function( assert ) {
  //Validates MatchPatterns per https://developer.chrome.com/extensions/match_patterns
    var goodPatterns = ['http://*/*	', 'https://*/*	', 'http://*/foo*', 'https://*.google.com/foo*bar', 'http://example.org/foo/bar.html', 'http://127.0.0.1/*', '*://mail.google.com/*', '<all_urls>'];
    var badPatterns = ['http://www.google.com', 'http://*foo/bar', 'http://foo.*.bar/baz', 'http:/bar', 'foo://*'];

    goodPatterns.forEach(function(pattern) {
        assert.true( validateMatchPattern(pattern), pattern + ' is valid pattern.');
    });

    badPatterns.forEach(function(pattern) {
        assert.false( validateMatchPattern(pattern), pattern + ' is invalid pattern.');
    });

    assert.end();
} );
/*
test( 'User-Agent header', function( assert ) {

    chrome.storage.local.get(null, function (items) {
        var numOfStoredUserAgents = Object.keys(items.useragentlist).length;
        var numOfUserAgents = 0;
        jQuery.getJSON(chrome.extension.getURL('') + '/js/useragentslist.json', function (data) {
            jQuery.each(data.UserAgentList, function (key, value) {
                jQuery.each(value.UserAgents, function (key1, value1) {
                    numOfUserAgents++;
                });
            });

            assert.equal(numOfStoredUserAgents, numOfUserAgents, numOfStoredUserAgents + "/" + numOfUserAgents + ' UserAgents imported from JSON.');
        });
    });

    jQuery.getJSON(chrome.extension.getURL('') + '/js/useragentslist.json', function (data) {
        jQuery.each(data.UserAgentList, function (key, value) {
            jQuery.each(value.UserAgents, function (key1, value1) {
                options.useragent = value1.Id;
                chrome.storage.local.set({
                    'options': options
                });
                chrome.storage.local.get('options', function (items) {
                    useragent = items.options.useragent;
                    //console.log(useragent);
                    var info = {};
                    info.requestHeaders.name = 'User-Agent';
                    info.requestHeaders.value = 'Tape';

                    console.log(onBeforeSendHeaders(info));
                });
            });
        });

        //assert.equal(numOfStoredUserAgents, numOfUserAgents, numOfStoredUserAgents + "/" + numOfUserAgents + ' UserAgents imported from JSON.');
    });

} );
*/
if (typeof console  != "undefined")
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function() {};

console.log = function(message) {
    console.olog(message);
    $('#out').append('<p>' + message + '</p>');
};
console.error = console.debug = console.info =  console.log;

//@todo: stream doesn't show test #2. Probably because of setTimeout. Switched to custom console.js for displaying output in HTML div.
//test.createStream().pipe(report('out'));