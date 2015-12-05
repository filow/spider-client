"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spaceTrim = spaceTrim;

function spaceTrim(str) {
  if (str) {
    return str.trim().replace(/\s+/g, " ");
  } else {
    return "";
  }
}