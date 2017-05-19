#!/usr/bin/env node
"use strict"

var
  fs= require( "mz/fs"),
  fetch= require( "node-fetch"),
  glob= require( "./glob"),
  pmap= require( "p-map")

async function resolveGlobs( globs){
	if( !globs){
		return
	}
	var files= await pmap( globs, g=> glob( g))
	files= Array.prototype.concat.apply([], files)
	return files
}

function checkFilenames( files){
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
	var outFilename= input.filename.substring( 0, input.filename.lastIndexOf( "."))
	return fs.writeFile( outFilename, input.buffer)
}

async function executeFile( filename){
	return readUrl( filename)
		.then( module.exports.fetchUrl)
		.then( module.exports.write)
}


async function main( opts){
	opts= opts|| {}
	opts.files= opts.files|| []
	opts.globs= opts.globs!== undefined? opts.globs: process.argv.slice(2)
	if( !opts.globs.length){
		opts.globs= ["*url"]
	}
	if( opts.globs){
		var globs= await module.exports.resolveGlobs( opts.globs)
		if( globs){
			opts.files= opts.files.concat( globs)
		}
	}
	module.exports.checkFilenames( opts.files)

	opts.concurrency= opts.concurrency=== undefined? 5: opts.concurrency
	return pmap( opts.files, module.exports.executeFile,{ concurrency: opts.concurrency})
}

module.exports= main
module.exports.resolveGlobs= resolveGlobs
module.exports.checkFilenames= checkFilenames
module.exports.readUrl= readUrl
module.exports.fetchUrl= fetchUrl
module.exports.write= write
module.exports.executeFile= executeFile

if( require.main=== module){
	main()
}
