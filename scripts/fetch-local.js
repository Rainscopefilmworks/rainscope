#!/usr/bin/env node
/** Skip Sanity fetch and use committed _data/*.json (local dev). */
process.env.USE_LOCAL_DATA = "1";
require("./fetch-sanity.js");
