"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_decorators_1 = require("lodash-decorators");
// import {memoize} from 'lodash';
var Animal = /** @class */ (function () {
    function Animal(theName) {
        this.name = theName;
    }
    Animal.prototype.move = function (distanceInMeters) {
        if (distanceInMeters === void 0) { distanceInMeters = 0; }
        console.log(this.name + " moved " + distanceInMeters + "m.");
    };
    // @ts-ignore
    Animal.prototype.distance = function (distanceInMeters) {
        return distanceInMeters * 5;
    };
    // @ts-ignore
    Animal.prototype.fn = function (things) {
        return things.value;
    };
    Animal.prototype.callsOtherfn = function (things) {
        return this.fn(things);
    };
    __decorate([
        lodash_decorators_1.Memoize()
        // @ts-ignore
    ], Animal.prototype, "distance", null);
    __decorate([
        lodash_decorators_1.Memoize()
        // @ts-ignore
    ], Animal.prototype, "fn", null);
    return Animal;
}());
var myAnimal = new Animal('tiger');
myAnimal.distance(5);
myAnimal.distance(4);
myAnimal.distance(5);
console.log(myAnimal.fn({ key: 'hello', value: 'world' }));
console.log(myAnimal.fn({ key: 'hello', value: 'heeeeelo' }));
console.log(myAnimal.fn({ key: 'hello', value: 'wheee' }));
console.log(myAnimal.callsOtherfn({ key: 'hello', value: 'world' }));
console.log(myAnimal.callsOtherfn({ key: 'hello', value: 'heeeeelo' }));
console.log(myAnimal.callsOtherfn({ key: 'hello', value: 'wheee' }));
//# sourceMappingURL=scratch.js.map