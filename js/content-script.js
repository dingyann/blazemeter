var guid = "5c32565c-a0ba-42be-8060-34d2cf2285fa";
// ADDED FUNCTIONAL - New functions to show the transaction pop up for functional*

function injectDivPopup(iframeContainerId, controlsWrapperId, iframeWrapperId){ 
    if (document.getElementById(iframeContainerId) === null) {
        chrome.storage.local.get('position', function (itemsLocal) {
            var div = document.createElement('div');
            div.style.border = '1px solid #aeaeae';
            div.style.borderRadius = '5px';
            div.style.boxShadow = '0px 3px 10px #888888';
            div.style.position = 'fixed';
            div.style.width = '360px';
            div.style.height = '230px';
            div.style.margin = '0px';
            div.style.padding = '0px';
            if (!$.isEmptyObject(itemsLocal.position)) {
                //Restore iframe position from saved coordinates
                div.style.top = itemsLocal.position.top + "px";
                div.style.left = itemsLocal.position.left + "px";
            }
            else {
                div.style.top = '0px';
                div.style.left = window.innerWidth - 380 + "px";
            }

            div.style.zIndex = '9000000000000000000';
            div.style.backgroundColor = '#f8fbff'; //'white';
            div.frameBorder = 'none';
            //Updated id with GUID
            div.setAttribute('id', iframeContainerId);
            if (top === self) {
                $('html').append(div);
            } else {
                $(parent.document).append(div);
            }
        });
        
        chrome.storage.local.get('theme', function (item) {
            //Load logo for appropriate theme (BlazeMeter vs Dynatrace)
            var theme = item.theme;
            var logoName = 'bm_logo.svg';
            if (theme == 'dynatrace') {
                logoName = 'dt.svg';
            }
            var logoURL = chrome.extension.getURL('theme') + '/' + theme + '/images/' + logoName;
            $('#' + iframeContainerId).html('<div class="header-logo-wrapper" style="background: #494961; float: none; height: 45px;cursor: move;border-radius: 5px 5px 0 0;overflow:hidden; width: auto; padding: 0; margin: 0;">' +
                '<span class="header-logo-blazemeter" style="background-image: url(' + logoURL + '); background-repeat: no-repeat;height: 35px;background-size: 140px 22px;display: inline-block;width: 57%;background-position: 10px 10px;"></span><div id="' +
                controlsWrapperId + '" style="border-radius:0; top:3px; position: relative;border-top-right-radius: 5px;border-top-left-radius: 5px;display: inline-block;overflow: hidden;float: right; width: auto; padding: 0; margin: 0;"></div></div>' +
                '<div id="' + iframeWrapperId  + '" style="visibility:hidden; float: none; width: auto; padding: 0; margin: 0;"><span style="color: #494961 !important;font-family: Segoe UI, Tahoma, sans-serif !important;font-size: 18px !important;font-weight: 500 !important; margin-top: 70px !important;display: block !important;text-align: center !important;">Waiting for the content...</span></div>');
            $('#' + iframeContainerId).draggable({
                containment: "window",
                stop: function (event, ui) {
                    //Remember iframe position across tabs and across requests
                    var position = ui.position;
                    chrome.storage.local.set({"position": position});
                }
            }); //issue with iframe reloading
        });
        }
}

function addTransactionPopupUi() {
    //Added guid to be able to filter out the commands from the popup
    var iframeId = "iframe-popup-ui-" + guid;
    var iframeContainerId = "transaction-popup-ui-" + guid;
    var controlsWrapperId = "controls-wrapper-" + guid;
    var controlsId = "controls-" + guid;
    var iframeWrapperId = "iframe-wrapper-" + guid;

    var popup_injected = false;
    var inject_iframe = false;
    var wait_intervals = -1;
    var interval = setInterval(function() {
        wait_intervals += 1;
        if (document.readyState === 'interactive'){
            
            if (!popup_injected){
                injectDivPopup(iframeContainerId, controlsWrapperId, iframeWrapperId);
                popup_injected = true;
            } else {
                if (wait_intervals > 100) { // Only show the waiting when the wait is greater than 1 second
                    setTimeout(function(){ document.getElementById(iframeWrapperId).style.visibility = "visible"; }, 100);
                    if (wait_intervals < 200) { // Display the window for 1 second, an extra delay for better experience
                        return;
                    }
                }
            }
            if ((wait_intervals % 10) == 0) { // Check iframes every 100ms
                var iframes = document.getElementsByTagName("iframe");
                if (typeof iframes == 'undefined'){
                    inject_iframe = true;
                }
            }
        }
        if(inject_iframe || document.readyState === 'complete') {
            
            if (!popup_injected){
                injectDivPopup(iframeContainerId, controlsWrapperId, iframeWrapperId);
                popup_injected = true;
            } else {
                
                if (document.getElementById(iframeId) === null) {
                    var iframe = document.createElement('iframe');
                    iframe.src = chrome.extension.getURL('html/transaction-ui.html');
                    //Updated id with GUID
                    iframe.setAttribute('id', iframeId);
                    iframe.setAttribute('name', iframeId);

                    iframe.style.height = '180px';
                    iframe.style.width = '358px';
                    iframe.style.margin = '0';
                    iframe.style.padding = '0';
                    iframe.style.overflow = 'hidden';
                    iframe.style.border = 'none';
                    iframe.style.position = 'static';

                    var controlsIframe = document.createElement('iframe');
                    controlsIframe.src = chrome.extension.getURL('dist/transaction-controls.html');
                    //Updated id with GUID
                    controlsIframe.setAttribute('id', controlsId);
                    controlsIframe.style.height = '43px';
                    controlsIframe.style.width = '104px';
                    controlsIframe.style.margin = '0';
                    controlsIframe.style.padding = '0';
                    controlsIframe.style.overflow = 'hidden';
                    controlsIframe.style.border = 'none';
                    controlsIframe.style.cssFloat = 'right';
                    controlsIframe.style.position = 'static';

                    iframewrapperNode = document.getElementById(iframeWrapperId);
                    if (iframewrapperNode !== null) {
                        while (iframewrapperNode.firstChild) {
                            iframewrapperNode.removeChild(iframewrapperNode.firstChild);
                        }
                                        
                        iframecontrolsWrapperNone = document.getElementById(controlsWrapperId);
                        if (iframecontrolsWrapperNone !== null) {
                            while (iframecontrolsWrapperNone.firstChild) {
                                iframecontrolsWrapperNone.removeChild(iframecontrolsWrapperNone.firstChild);
                            }

                            iframewrapperNode.appendChild(iframe);
                            iframecontrolsWrapperNone.appendChild(controlsIframe);

                            setTimeout(function(){ document.getElementById(iframeWrapperId).style.visibility = "visible"; }, 100);
                            clearInterval(interval);
                            
                        }
                                                    
                    }
                }
            }
        }
        
    }, 10);
}

function removeTransactionPopupUi() {
    let iframeContainerId = "transaction-popup-ui-" + guid;
    if ($('#' + iframeContainerId).length > 0) {
        $('#' + iframeContainerId).remove();
    }
}

// FINISH ADDED FUNCTIONAL
// Listen for messages from the popup
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.msg == 'addTransactionPopupUi') {
            removeTransactionPopupUi(); //this fixes refresh issue but causes flickering bug
            addTransactionPopupUi();
        } else if (request.msg == 'removeTransactionPopupUi') {
            removeTransactionPopupUi();
        }
    }
);

// $(document).ready(function () {
    chrome.runtime.sendMessage({command: "check_status"}, function (response) {
        if ((response.recording === "record" || response.recording === "pause") && response.isThisTabRecording) {
            addTransactionPopupUi();
            injectPromptScript();
        }
        else if(response.replayStatus == 'replaying'){
            injectPromptScript();
        }
    });
// });
