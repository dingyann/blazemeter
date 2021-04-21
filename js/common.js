/*eslint no-unused-vars: [2, {"vars": "all", "args": "all"}]*/
var background = chrome.extension.getBackgroundPage();
$.enableBtn = function enableBtn(btnid) {
    $('#' + btnid).css('display', 'inline-block');
    $('#' + btnid + '-off').hide();
};

$.disableBtn = function disableBtn(btnid) {
    $('#' + btnid).hide();
    $('#' + btnid + '-off').css('display', 'inline-block');
};

$.enableDropdownBtn = function enableBtn(btnid) {
    $('#' + btnid).css('display', 'block');
    $('#' + btnid + '-off').hide();
};

$.disableDropdownBtn = function disableBtn(btnid) {
    $('#' + btnid).hide();
    $('#' + btnid + '-off').css('display', 'block');
};


$.enableOverlay = function enableOverlay() {
    $('#run-overlay').show();
    //merge-modify
    //On open, change window heigth
    let newHeigth = $('#run-overlay').height();
    window.parent.postMessage({'height': newHeigth}, '*');
};

$.waitOverlay = function waitOverlay(progressBar) {
    $.enableOverlay();
    $.elementRunOverlayProgress.show();
    // merge-modify
    // Added download selector
    $('#run-overlay .download-body').hide();
    $('#run-overlay .domains-body').hide();
    $('#run-overlay .progressbar').progressbar({
        value: progressBar
    });
};

$.domainOverlay = function domainOverlay(domains) {
    $.elementRunOverlayClose.show();
    $.enableOverlay();
    $('#run-overlay .domains-body').show();
    var domainChoice = '';
    for (var index in domains) {
        domainChoice += '<div class="checkbox-wrapper">' +
            '<input type="checkbox" name="domains" id="domain-' + index + '" value="' + domains[index] + '"/>' +
            '<label for="domain-' + index + '"><span></span>' + domains[index] + '</label></div>';
    }
    $('#run-overlay > .domains-body .include-domains').html(domainChoice);
    $('#run-overlay .download-body .domains-body .include-domains').html("");
};

$.domainDownloadOverlay = function domainDownloadOverlay(domains) {
    $.elementRunOverlayClose.show();
    $.enableOverlay();
    // merge-modify
    // Added download selector
    $('#run-overlay .download-body').show();
    if (!jQuery.isEmptyObject(domains)) {
        var domainChoice = '';
        var oneDomainCheckedFlag = false;
        if((Object.keys(domains)).length < 2) {
            oneDomainCheckedFlag = true;
        }
        for (var index in domains) {
            // if only one domain - checkbox is checked by default
            if(oneDomainCheckedFlag) {
                domainChoice += '<div class="checkbox-wrapper">' +
                    '<input type="checkbox" checked name="domains" id="domain-' + index + '" value="' + domains[index] + '"/>' +
                    '<label for="domain-' + index + '"><span></span>' + domains[index] + '</label></div>';
            } else {
                domainChoice += '<div class="checkbox-wrapper">' +
                    '<input type="checkbox" name="domains" id="domain-' + index + '" value="' + domains[index] + '"/>' +
                    '<label for="domain-' + index + '"><span></span>' + domains[index] + '</label></div>';
            }
        }
        $('#run-overlay .download-body .domains-body .include-domains').html(domainChoice);
        $('#run-overlay > .domains-body .include-domains').html("");
    }
};

$.closeOverlay = function closeOverlay() {
    if ($('#advanced-options-fieldset').length) {
        $('#advanced-options-fieldset').removeClass('opened');
        $('#advanced-options').hide();
    }
    if ($.elementRunOverlayProgress.is(':visible')) {
        $('#run-overlay').hide();
        $.elementRunOverlayProgress.hide();
    } else {
        $('#run-overlay').hide();
        $('#run-overlay .download-body').hide();
        $('#run-overlay .domains-body').hide();
    }
    //merge-modify
    //On close, change window heigth
    let newHeigth = $('.swiper-slide-active').height();
    window.parent.postMessage({'height': newHeigth}, '*');
    //Clean title on close
    $('#run-overlay .top-overlay-title').html('');

    chrome.extension.sendRequest({
        type: 'close_overlay'
    });
};

$.closeTestEndedOverlay = function closeTestEndedOverlay() {
    //Acknowledge that test was stopped
    background.localSave({
        'stopped_test': false
    });
    $.closeOverlay();
};

$.testEndedOverlay = function testEndedOverlay() {
    $.elementRunOverlayClose.hide();
    $.elementTestEndedButton.click($.closeTestEndedOverlay);
    $.enableOverlay();
    $('#run-overlay .body').hide();
    $('#run-overlay .test-ended-body').show();
};

$.setDomains = function setDomains() {
    var domains = {};
    $('input:checkbox[name=domains]:checked').each(function () {
        domains[$(this).val()] = $(this).val();
    });

    chrome.storage.local.set({'selected_domains': domains});
};

$.uploadSelectedDomains = function uploadSelectedDomains() {
    if (!$('.include-domains input:checked').val()) {
        $('.select-domains-error').remove();
        $('.domains-body .text').append('<p class="select-domains-error">Please select domains first</p>');
        $.elementRunOverlayProgress.hide();
    } else {
        $.setDomains();
        chrome.extension.sendRequest({
            type: 'upload_traffic'
        }, function () {
            $('#run-overlay .domains-body').hide();
            $.closeOverlay();
        });
    }
};

$.exportSelectedDomains = function exportSelectedDomains() {
    if (!$('.include-domains input:checked').val()) {
        $('.select-domains-error').remove();
        $('.domains-body .text').append('<p class="select-domains-error">Please select domains first</p>');
        $.elementRunOverlayProgress.hide();
    } else {
        $.setDomains();
        chrome.storage.local.get('mode', function (data) {
            if (data.mode == 'mode-follow') {
                chrome.extension.sendRequest({
                    type: 'export_jmeter_follow'
                }, function () {
                    $.elementProgressButton.hide();
                    $.elementProgresBodyP.text('');
                    $.elementProgresBodyH4.text($.stringExporting);
                    $.waitOverlay(1);
                });
            } else {
                chrome.extension.sendRequest({
                    type: 'export_jmeter'
                }, function () {
                    $.elementProgressButton.hide();
                    $.elementProgresBodyP.text('');
                    $.elementProgresBodyH4.text($.stringExporting);
                    $.waitOverlay(1);
                });
            }
        });
    }
};

$.dismissTest = function dismissTest() {
    $.elementProgressButton.unbind('click');
    chrome.extension.sendRequest({
        type: 'dismiss_test'
    }, function () {
        chrome.storage.local.set({
            'start_recording_mode': ''
        });
        $.elementRunOverlayProgress.hide();
        $.closeOverlay();
    });
};

$.cancelTest = function cancelTest() {
    $.elementRunOverlayClose.unbind('click');
    chrome.extension.sendRequest({
        type: 'cancel_test'
    }, function () {
        $.elementRunOverlayProgress.hide();
    });
};

$.selectTheme = function selectTheme(data) {
    var theme = data.theme;
    background.localSave({
        'theme': theme
    });
    $('.help a').attr('href', data.help_link);

    var pathoff = {
        19: chrome.extension.getURL('theme') + '/' + theme + '/images/19x19.png',
        38: chrome.extension.getURL('theme') + '/' + theme + '/images/38x38.png'
    };
    chrome.browserAction.setIcon({
        path: pathoff
    });
    $('#favicon').attr('href', chrome.extension.getURL('theme') + '/' + theme + '/images/48x48.png');
    setTimeout(function() {
        if ($('body').hasClass('popup')) {
            $('head').append('<link rel="stylesheet" href="' + chrome.extension.getURL('theme') + '/' + theme + '/css/popup.css" type="text/css" />');
            if (data.disable_signup != 'FALSE') {
                $('#signup').hide();
            } else {
                $('#signup').show();
            }
            if (data.disable_followme != 'FALSE') {
                $('#switch').hide();
            } else {
                $('#switch').show();
            }
            chrome.storage.local.set({
                'disable_followme': data.disable_followme
            });
            $('.version').text(data.version);
            $('.popup').show();
        } else if ($('body').hasClass('editor')) {
            $('head').append('<link rel="stylesheet" href="' + chrome.extension.getURL('theme') + '/' + theme + '/css/editor.css" type="text/css" />');
        }
    },0);
};

chrome.storage.local.get('theme', function (items) {
    if (items.theme != 'blazemeter') {
        $.getJSON('/config_' + items.theme + '.json', function (dataDefault) {
            $.selectTheme(dataDefault);
        });
    } else {
        $.getJSON(background.configFile, function (dataDefault) {
            $.selectTheme(dataDefault);
        });
    }
});

$(document).ready(function () {

    $.elementName = $('#name');
    $.elementStatus = $('#status');
    $.elementUploadJmeter = $('#button-upload-jmeter');
    $.elementUploadSelenium = $('#button-upload-selenium');
    $.elementUploadJmx = $('#upload-jmx');

    $.elementDomainsButton = $('#run-overlay .domains-body .button');
    $.elementProgressButton = $('#run-overlay .progress-body .button');
    $.elementTestEndedButton = $('#run-overlay .test-ended-body .button');
    $.elementRunOverlayClose = $('#run-overlay .close');
    $.elementRunOverlayProgress = $('#run-overlay .progress-body');

    $.elementProgresBodyP = $('.progress-body .text p');
    $.elementProgresBodyH4 = $('.progress-body .text h4');

    $.stringExporting = 'Exporting to JMX...';


});

// Listener for dropdowns in Actions Block
function actionDropdownOpenerListener() {
    let allPanels = $('.action-dropdown-hiding');
    $('.action-dropdown').on('click', function(e) {
        // hide all previous opened dropdowns in case we open new one
        for(let i = 0; i < allPanels.length; i++) {
            let element = $(allPanels[i]);
            if(element.attr("data-id") !== $(this).attr("data-id")) {
                if(element.hasClass('opened')) {
                    element.hide();
                    element.removeClass('opened').addClass('closed');
                }
                let dropdownArrow = $(allPanels[i]).parent().find('i');
                if(dropdownArrow.hasClass('fa-caret-up')) {
                    dropdownArrow.removeClass('fa-caret-up').addClass('fa-caret-down');
                }
            }
        }
        // hide/show dropown if click on arrow button
        let actionDropdownHiding = $(this).find('.action-dropdown-hiding');
        actionDropdownHiding.toggle(
            "slide",
            {
                direction: 'up',
                duration: '200',
                easing: 'easeOutQuart'
            } , function () {
                actionDropdownHiding.toggleClass('closed opened');
            }
        );
        // change arrow when dropdown opened/closed
        $(this).find('i').toggleClass('fa-caret-down fa-caret-up');
        //close all notifications
        $('.close-open-button.close-button').trigger('click');
        // stop propagation so that the event is not identified by body listener
        e.stopPropagation();
    });
    function closeDropdowns(e) {
        if($(e.currentTarget).hasClass('action-dropdown')) {
            return;
        }
        for(let i = 0; i < allPanels.length; i++) {
            let element = $(allPanels[i]);
            if(element.hasClass('opened')) {
                element.hide();
                element.removeClass('opened').addClass('closed');
                let dropdownArrow = $(allPanels[i]).parent().find('i');
                if(dropdownArrow.hasClass('fa-caret-up')) {
                    dropdownArrow.removeClass('fa-caret-up').addClass('fa-caret-down');
                }
            }
        }
    }
    // close dropdowns if click in any another place of body
    $('body').on('click', closeDropdowns);
    // and click on #advanced-options-fieldset because of stopPropagation on this element
    $('#advanced-options-fieldset').on('click', closeDropdowns);
}

// END Listener for dropdowns in Actions Block
