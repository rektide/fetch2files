#!/usr/bin/env node
"use strict"

var
  fs= require( "mz/fs"),
  fetch= require( "node-fetch"),
  mrwf= require( "main-routine-with-files")

function fileCheck( files){
	for( var i in files){
		var file= files[ i]
		if( file.indexOf( ".")== -1){
			throw new Error(`Refusing to fetch '${file}' because it has no extensino to remove`)
		}
	}
}

async function readUrl( filename){
	return fs.readFile( filename,{ encoding: "utf8"})
		.then( url=> ({filename, url}))
}

async function fetchUrl( input){
	return fetch( input.url)
		.then( res=> res.buffer())
		.then( buf=> (input.buffer= buf, input))
}

async function write( input){
	var start= 0
	if( !this|| !this.minimist|| !(this.minimist.fullpath|| this.minimist.p)){
		start= input.filename.lastIndexOf( "/")+ 1
	}
	var outFilename= input.filename.substring( start, input.filename.lastIndexOf( "."))
	return fs.writeFile( outFilename, input.buffer)
}

async function runFile( filename){
	return readUrl( filename)
		.then( module.exports.fetchUrl)
		.then( module.exports.write.bind( this))
}

async function main( opts){
	process.on("unhandledRejection", console.error)

	opts= opts|| {}
	opts.defaultGlob= opts.defaultGlob|| module.exports.defaultGlob
	opts.fileCheck= opts.fileCheck|| module.exports.fileCheck
	opts.runFile= opts.runFile|| module.exports.runFile.bind( opts)
	return mrwf( opts)
}


module.exports= main
module.exports.defaultGlob= "*url"
module.exports.fileCheck= fileCheck
module.exports.runFile= runFile
module.exports.readUrl= readUrl
module.exports.fetchUrl= fetchUrl
module.exports.write= write

if( require.main=== module){
	module.exports()
}
