"use strict"
var
  es6Promisify= require( "es6-promisify"),
  glob= require( "glob")

module.exports= es6Promisify( glob)
