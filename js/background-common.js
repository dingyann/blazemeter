let selenium_context_ids = ['assertText', 'assertTitle', 'assertValue', 'storeText', 'storeTitle', 'storeValue'];
let jmx_context_ids = ['assertSelection', 'assertResponseCode'];

function createMenus() {
    let context_applied = ['page', 'frame', 'selection', 'link', 'editable'];

    let errorCallback = () => {
        if (browser.runtime.lastError) {
            console.log('ERROR: ' + browser.runtime.lastError.message);
        }
    };

    //selenium buttons
    browser.contextMenus.create({
        title: "Selenium Asserts",
        enabled: false,
        contexts: context_applied
    }, errorCallback);

    for (let ctx_id in selenium_context_ids) {
        browser.contextMenus.create({
            id: selenium_context_ids[ctx_id],
            title: selenium_context_ids[ctx_id],
            documentUrlPatterns: ['<all_urls>'],
            contexts: context_applied
        }, errorCallback);
    }

    //jmx buttons
    browser.contextMenus.create({
        type: "separator",
        contexts: context_applied
    }, errorCallback);
    browser.contextMenus.create({
        title: "JMX Asserts",
        enabled: false,
        contexts: context_applied
    }, errorCallback);

    for (let ctx_id in jmx_context_ids) {
        browser.contextMenus.create({
            id: jmx_context_ids[ctx_id],
            title: jmx_context_ids[ctx_id],
            documentUrlPatterns: ['<all_urls>'],
            contexts: context_applied
        }, errorCallback);
    }
}

function removeMenus() {
    browser.contextMenus.removeAll().catch(reason => {
        console.log('ERROR: ' + JSON.stringify(reason));
    });
}