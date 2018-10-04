#!/usr/bin/env node
console.log(`Hello!: ${JSON.stringify(process.env.HELLO)}`);
//
// {
//   "where"
// :
//   {
//     "and"
//   :
//     [{"reagentTable": "RnaiLibraryStock"}, {"reagentId": {"neq": "null"}}]
//   }


let t = {
  "where": {
    "and": [{"reagentTable": "RnaiLibraryStock"}, {"reagentId": {"neq": "null"}}]
  }
}
