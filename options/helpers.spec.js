"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var getFn = jest.fn().mockImplementation(function (x) { return Promise.resolve({ debug: true }); });
var setFn = jest.fn();
jest.mock('webextension-polyfill-ts', function () { return ({
    browser: {
        storage: {
            local: {
                get: getFn,
                set: setFn,
            },
        },
    },
}); });
var cfg = __importStar(require("../config.json"));
var helpers_1 = require("./helpers");
var helpers = __importStar(require("./helpers"));
test('Load settings', function (done) {
    helpers.loadSettings().then(function (x) {
        expect(getFn).toHaveBeenCalled();
        expect(x.debug).toBe(true);
        done();
    });
});
test('Save settings', function (done) {
    var settings = {
        debug: true,
        custom_ard: false,
        custom_server: false,
    };
    helpers.saveSettings(settings).then(function (savedSettings) {
        expect(settings.ard_url).toBe(cfg.ard_url);
        expect(settings.serverJMX).toBe(cfg.server_jmx);
        expect(settings.server).toBe(cfg.server_url);
        expect(setFn).toHaveBeenCalledWith(savedSettings);
        done();
    });
});
test('Reset settings', function (done) {
    jest.spyOn(helpers, 'loadSettings').mockImplementation(function () { return Promise.resolve({
        debug: true,
        custom_ard: true,
        ard_url: 'bad value',
        custom_server: true,
        server: 'bad value',
        serverJMX: 'bad value',
    }); });
    jest.spyOn(helpers, 'saveSettings');
    helpers_1.resetSettings().then(function (x) {
        expect(x.ard_url).toBe(cfg.ard_url);
        expect(x.serverJMX).toBe(cfg.server_jmx);
        expect(x.server).toBe(cfg.server_url);
        done();
    });
});
//# sourceMappingURL=helpers.spec.js.map