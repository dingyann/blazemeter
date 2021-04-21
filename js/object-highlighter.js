"use strict";
var ObjectHighlighter = /** @class */ (function () {
    function ObjectHighlighter() {
        var _this = this;
        this.browserBot = null;
        // @ts-ignore
        this.browserBot = BrowserBot.createForWindow(window);
        chrome.runtime.onMessage.addListener(function (request) {
            if (request.command === 'highlightObject' && request.arguments.highlight) {
                request.arguments.object.locators.forEach(function (selector) {
                    if (selector.name && selector.value) {
                        var element = null;
                        var name_1 = selector.name === 'LinkText' ? 'link' : selector.name;
                        try {
                            element = _this.browserBot.findElement(name_1 + "=" + selector.value);
                            _this.highlightElement(element);
                            return;
                        }
                        catch (e) {
                            return;
                        }
                    }
                });
            }
            else if (request.command === 'highlightObject' && !request.arguments.highlight) {
                _this.removeHighlighting();
                _this.cleanup();
            }
        });
        this.cleanup();
    }
    ObjectHighlighter.prototype.cleanup = function () {
        this.win = window;
        var doc = this.win.document;
        var div = doc.createElement('div');
        div.setAttribute('style', 'display: none;');
        doc.body.insertBefore(div, doc.body.firstChild);
        this.div = div;
        this.e = null;
        this.r = null;
    };
    ObjectHighlighter.prototype.removeHighlighting = function () {
        try {
            if (this.div) {
                if (this.div.parentNode) {
                    this.div.parentNode.removeChild(this.div);
                }
                this.div = null;
            }
        }
        catch (e) {
            if (e !== 'TypeError: can\'t access dead object') {
                throw e;
            }
        }
        this.win = null;
    };
    ObjectHighlighter.prototype.highlight = function (doc, x, y) {
        if (doc) {
            var e = doc.elementFromPoint(x, y);
            if (e && e !== this.e) {
                this.highlightElement(e);
            }
        }
    };
    ObjectHighlighter.prototype.highlightElement = function (element) {
        if (element && element !== this.e) {
            this.e = element;
        }
        else {
            return;
        }
        var r = element.getBoundingClientRect();
        var or = this.r;
        if (r.left >= 0 && r.top >= 0 && r.width > 0 && r.height > 0) {
            // @ts-ignore
            if (or && r.top === or.top && r.left === or.left && r.width === or.width && r.height === or.height) {
                return;
            }
            this.r = r;
            var style = 'pointer-events: none; position: absolute; box-shadow: 0 0 0 1px black; outline: 1px dashed white; outline-offset: -1px; background-color: rgba(250,250,128,0.4); z-index: 100;';
            var pos = 'top:' + (r.top + this.win.scrollY) + 'px; left:' + (r.left + this.win.scrollX) +
                'px; width:' + r.width + 'px; height:' + r.height + 'px;';
            this.div.setAttribute('style', style + pos);
        }
        else if (or) {
            this.div.setAttribute('style', 'display: none;');
        }
    };
    return ObjectHighlighter;
}());
var objectHighlighter = new ObjectHighlighter();
//# sourceMappingURL=object-highlighter.js.map