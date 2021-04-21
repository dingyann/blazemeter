"use strict";
var Ard = /** @class */ (function () {
    function Ard(ardUrl) {
        this.ardUrl = ardUrl;
    }
    Ard.prototype.createTest = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: _this.ardUrl + '/api/v1/tests',
                dataType: 'json',
                data: JSON.stringify(data),
                success: function (response) { return resolve(response.result); },
                error: function () { return reject(); },
            });
        });
    };
    return Ard;
}());
//# sourceMappingURL=ard.js.map