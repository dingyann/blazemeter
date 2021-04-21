"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validUrl(url) {
    return /^(http|https|ftp):\/\/[a-z0-9]+([\-.][a-z0-9]+)*(:[0-9]{1,5})?(\/.*)?$/i.test(url);
}
exports.validUrl = validUrl;
//# sourceMappingURL=url-utils.js.map