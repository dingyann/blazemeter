"use strict";
function takeScreenshot(rect, margin, recordId) {
    var dpr = window.devicePixelRatio || 1;
    var cropRect = {
        left: (rect.left - margin) * dpr,
        top: (rect.top - margin) * dpr,
        width: (rect.width + margin * 2) * dpr,
        height: (rect.height + margin * 2) * dpr,
    };
    chrome.runtime.sendMessage({
        op: 'takeScreenshot',
        recordId: recordId,
        cropRect: cropRect,
    });
}
//# sourceMappingURL=screenshots.js.map