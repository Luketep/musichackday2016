'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var path = require('path');

  /**
   * Resolve external project resource as file path
   */
  function resolvePath(project, file) {
    return path.join(path.dirname(require.resolve(project)), file);
  }

  // configures browsers to run test against
  // any of [ 'PhantomJS', 'Chrome', 'Firefox', 'IE']
  var TEST_BROWSERS = ((process.env.TEST_BROWSERS || '').replace(/^\s+|\s+$/, '') || 'PhantomJS').split(/\s*,\s*/g);

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      sources: 'app',
      dist: 'dist'
    },

    jshint: {
      src: [
        ['<%=config.sources %>']
      ],
      options: {
        jshintrc: true
      }
    },

    browserify: {
      options: {
        browserifyOptions: {
          debug: true,
          // strip unnecessary built-ins
          builtins: [ 'events' ],
          // make sure we do not include Node stubs unnecessarily
          insertGlobalVars: {
            process: function () {
                return 'undefined';
            },
            Buffer: function () {
                return 'undefined';
            }
          }
        },
        transform: [ [ 'stringify', { extensions: [ '.bpmn', '.xml', '.css' ] } ] ]
      },
      watch: {
        options: {
          watch: true
        },
        files: {
          '<%= config.dist %>/app.js': [ '<%= config.sources %>/app.js' ],
          '<%= config.dist %>/subscribe.js': [ '<%= config.sources %>/subscribe.js' ]
        }
      },
      app: {
        files: {
          '<%= config.dist %>/app.js': [ '<%= config.sources %>/app.js' ],
          '<%= config.dist %>/subscribe.js': [ '<%= config.sources %>/subscribe.js' ]
        }
      }
    },
    copy: {
      music: {
        files: [
          {
            expand: true,
            cwd: '<%=config.sources %>/lib/',
            src:[ '*.js' ],
            dest: '<%= config.dist %>/lib'
          }
        ]
      },
      diagram_js: {
        files: [
          {
            src: resolvePath('diagram-js', 'assets/diagram-js.css'),
            dest: '<%= config.dist %>/css/diagram-js.css'
          }
        ]
      },
      bpmn_js: {
        files: [
          {
            expand: true,
            cwd: resolvePath('bpmn-js', 'assets'),
            src: ['**/*.*', '!**/*.js'],
            dest: '<%= config.dist %>/vendor'
          }
        ]
      },
      app: {
        files: [
          {
            expand: true,
            cwd: '<%= config.sources %>/',
            src: ['**/*.*', '!**/*.js'],
            dest: '<%= config.dist %>'
          }
        ]
      }
    },
    watch: {
      samples: {
        files: [ '<%= config.sources %>/**/*.*' ],
        tasks: [ 'copy:app' ],
      }
    },
    connect: {
      options: {
        port: 9013,
        livereload: 9014,
        hostname: '0.0.0.0',
        protocol: 'https'
      },
      livereload: {
        options: {
          open: true,
          base: [
            '<%= config.dist %>'
          ]
        }
      }
    },
    karma: {
      options: {
        configFile: 'test/config/karma.unit.js'
      },
      single: {
        singleRun: true,
        autoWatch: false,

        browsers: TEST_BROWSERS
      },
      unit: {
        browsers: TEST_BROWSERS
      }
    },
    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          port : 3000,
          script: 'server/main.js'
        }
      }
    }
  });

  // tasks

  grunt.registerTask('build', [ 'copy', 'browserify:app' ]);

  grunt.registerTask('auto-build', [
    'copy',
    'browserify:watch',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('test', [ 'karma:single' ]);

  grunt.registerTask('auto-test', [ 'karma:unit' ]);

  grunt.registerTask('default', [ 'jshint', 'build' ]);

  grunt.registerTask('server', [ 'express:dev' ]);
};
