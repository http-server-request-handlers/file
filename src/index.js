/* eslint no-invalid-this: off */
/* eslint consistent-this: off */
/* eslint consistent-return: off */

'use strict';

/**
 * module dependencies
 */
var fs = require( 'fs' );
var path = require( 'path' );
var createError = require( 'http-errors' );
var serveFile = require( './helpers/serve-file' );
var url = require( 'url' );

/**
 * a net.Server request handler that serves files
 *
 * @param {IncomingMessage} req
 * @param {string} req.url
 *
 * @param {ServerResponse} res
 * @param {Function} next
 *
 * @returns {undefined}
 */
function fileRequestHandler( req, res, next ) {
  var filename;
  var path_filename;
  var pathname = url.parse( req.url ).pathname;

  /**
   * @type {Object}
   *
   * @property {string} directory_index
   * @property {string} document_root
   * @property {Object} request_listeners
   */
  var Server = this;

  if ( Server.debug ) {
    console.log( '[debug]', new Date(), 'fileRequestHandler()' );
  }

  if ( res.headersSent ) {
    return next();
  }

  filename = pathname;

  if ( filename.slice( -1 ) === '/' ) {
    filename += Server.directory_index;
  }

  path_filename = path.join( process.cwd(), Server.document_root, filename );

  fs.exists(
    path_filename,

    /**
     * @param {boolean} exists
     *
     * @returns {undefined|*}
     */
    function ( exists ) {
      if ( !exists ) {
        return next( createError( 404 ) );
      }

      serveFile.call( Server, res, next, filename, path_filename );
    }
  );
}

module.exports = fileRequestHandler;
