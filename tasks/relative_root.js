/*
 * grunt-relative-root
 * https://github.com/hurrymaplelad/grunt-relative-root
 *
 * Copyright (c) 2013 Adam Hull
 * Licensed under the MIT license.
 */

'use strict';

var pkg = require('../package.json'),
    path = require('path'),
    slash = require('slash');

module.exports = function(grunt) {

  grunt.registerMultiTask('relativeRoot', pkg.description, function() {
    var root = this.options({root: '.'}).root;

    function compute (from, to) {
      return (slash(path.relative(path.dirname(from), to)) || '.') + '/';
    }

    function relativizeCSS (source, relativeRoot) {
      return source.replace(/(url\(['"]?)\/(?!\/)/g, "$1"+relativeRoot);
    }

    function relativizeHTML (source, relativeRoot) {
      return source
        .replace(/(href=["'])\/(?!\/)/g, '$1'+relativeRoot)
        .replace(/(include="')\/(?!\/)/g, '$1'+relativeRoot)
        .replace(/(include='")\/(?!\/)/g, '$1'+relativeRoot)
        .replace(/(src=["'])\/(?!\/)/g, '$1'+relativeRoot);
    }

    function relativizeJS (source, relativeRoot) {
      return source
        .replace(/\/views\/(?!\/)/g, relativeRoot + 'views/')
    }

    this.files.forEach(function(file) {
      var src = file.src[0],
          relativeRoot = compute(src, root),
          extension = path.extname(src),
          filter, contents;

      // Quick patch for bower components animate.css
      if ("dist/bower_components/animate.css" == src) {
        extension = "";
        return
      }

      switch(extension) {
        case '.css': filter = relativizeCSS; break;
        case '.html': filter = relativizeHTML; break;
        case '.js': filter = relativizeJS; break;
        default: grunt.warn('Unsupported extension '+src); return;
      }

      contents = grunt.file.read(src);
      contents = filter(contents, relativeRoot);
      grunt.file.write(file.dest, contents);
      grunt.log.writeln('Relativized '+ file.dest);
    });
  });
};
