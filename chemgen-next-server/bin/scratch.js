#!/usr/bin/env node
console.log("Hello!: " + JSON.stringify(process.env.HELLO));
//
// {
//   "where"
// :
//   {
//     "and"
//   :
//     [{"reagentTable": "RnaiLibraryStock"}, {"reagentId": {"neq": "null"}}]
//   }
var t = {
    "where": {
        "and": [{ "reagentTable": "RnaiLibraryStock" }, { "reagentId": { "neq": "null" } }]
    }
};
//# sourceMappingURL=scratch.js.map