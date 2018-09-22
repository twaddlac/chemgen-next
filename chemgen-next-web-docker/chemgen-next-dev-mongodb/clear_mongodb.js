#!/usr/bin/env mongo

// WIP - figure out how to reinitialize the mongo instance each time

var db = new Mongo('chemgen_next_mongodb').getDB("chemgen");
db.dropDatabase();

db = new Mongo().getDB("agenda");
db.dropDatabase();
