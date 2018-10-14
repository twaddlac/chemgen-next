"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
var index_1 = require("./index");
var FireLoop = /** @class */ (function () {
    function FireLoop(socket, models) {
        this.socket = socket;
        this.models = models;
        this.references = {};
    }
    FireLoop.prototype.ref = function (model) {
        var name = model.getModelName();
        model.models = this.models;
        this.references[name] = new index_1.FireLoopRef(model, this.socket);
        return this.references[name];
    };
    return FireLoop;
}());
exports.FireLoop = FireLoop;
//# sourceMappingURL=FireLoop.js.map