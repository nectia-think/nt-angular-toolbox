'use strict';
/*global module:false*/
module.exports = function(grunt) {

  // These plugins provide necessary tasks.
  require('time-grunt')(grunt);

  require('jit-grunt')(grunt, {
    express: 'grunt-express-server'
  });

  // Time how long tasks take. Can help when optimizing build times
  //require('time-grunt')(grunt);

  var appConfig = {
    app: require('./bower.json'),
    dist: 'dist'
  };

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    config: appConfig,
    banner: '/*! <%= config.app.name %> - v<%= config.app.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= config.app.homepage ? "* " + config.app.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= config.app.authors %>;' +
      ' Licensed <%= config.app.license %> */\n(function(){\n',

    footer: '\n})();',

    //Se realiza limpieza del directorio dist
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/{,*/}*',
            '!dist/.git{,*/}*'
          ]
        }]
      }
    },

    // Concatena los diferentes scrips y css en uno solo
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true,
        footer: '<%= footer %>'
      },
      dist: {
        files:{
          'dist/scripts/<%= config.app.name %>.js':  ['src/*.js', 'src/**/*.js']
        }
      }
    },
    //Minifica los scrips
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        files: {
          'dist/scripts/<%= config.app.name %>.min.js': 'dist/scripts/<%= config.app.name %>.js'
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          'src/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },
    //Copia los templates
    copy: {
      main: {
        files: [
          {expand: true, src: ['src/templates/**'], dest: 'dist/templates/', flatten: true, filter: 'isFile'},
          {expand: true, src: ['src/styles/**'], dest: 'dist/styles/', flatten: true, filter: 'isFile'}
        ],
      },
    },

    cssmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/styles',
          src: ['*.css', '!*.min.css'],
          dest: 'dist/styles',
          ext: '.min.css'
        }]
      }
    },

    express: {
      options: {
        background: false,
        port: 3000
      },
      dev: {
        options: {
          script: 'example/server.js'
        }
      }
    }
  });

  
  grunt.registerTask('deploy', ['concat', 'copy', 'uglify', 'cssmin']);

  grunt.registerTask('build', ['clean:dist','jshint', 'deploy']);

  grunt.registerTask('serve', ['clean:dist', 'deploy', 'express']);
};