/* eslint consistent-this: off */
/* eslint consistent-return: off */
/* eslint max-params: off */
/* eslint no-invalid-this: off */

'use strict';

/**
 * module dependencies
 */
var createError = require( 'http-errors' );
var fs = require( 'fs' );
var path = require( 'path' );
var mime_types = require( '../models/mime-types' );

/**
 * @param {ServerResponse} res
 * @param {Function} res.end
 *
 * @param {Function} next
 * @param {string} filename
 * @param {string} path_filename
 *
 * @returns {undefined}
 */
function serveFile( res, next, filename, path_filename ) {
  var readStream;
  var mime_type;
  var ext;
  var Server = this;

  if ( Server.debug ) {
    console.log( '[debug]', new Date(), 'serveFile()' );
  }

  ext = path.extname( filename )
    .split( '.' )
    .slice( -1 )
    .toString();

  if ( typeof ext !== 'string' || ext.length < 1 ) {
    return next( createError( 404 ) );
  }

  mime_type = mime_types[ ext ];

  if ( !mime_type ) {
    return next( createError( 415 ) );
  }

  res.statusCode = 200;
  res.setHeader( 'Content-Type', mime_type );
  readStream = fs.createReadStream( path_filename );

  readStream.on( 'open',
    /**
     * @returns {undefined}
     */
    function () {
      if ( Server.debug ) {
        console.log( '[debug]', new Date(), 'serveFile() open' );
      }

      readStream.pipe( res );
    }
  );

  readStream.on( 'close',
    /**
     * at this point readStream.end has been called,
     * which will end the response, so no res.end() is needed
     *
     * @returns {undefined}
     */
    function () {
      if ( Server.debug ) {
        console.log( '[debug]', new Date(), 'serveFile() close' );
      }

      return next();
    }
  );

  readStream.on( 'error',
    /**
     * @param {Error} err
     *
     * @returns {undefined}
     */
    function ( err ) {
      if ( Server.debug ) {
        console.log( '[debug]', new Date(), 'serveFile() error' );
      }

      return next( err );
    }
  );
}

module.exports = serveFile;
