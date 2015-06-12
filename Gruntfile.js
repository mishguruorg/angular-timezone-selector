'use strict'

var loader = require('csv-load-sync')

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    'string-replace': {
      inline: {
        files: {
          'build/': '<%= pkg.name %>.js'
        }
      },
      options: {
        replacements: [
          {
            pattern: 'var zones = []',
            replacement: 'var zones = ' + JSON.stringify(loader('./data/zone.csv'))
          },
          {
            pattern: 'var codes = []',
            replacement: 'var codes = ' + JSON.stringify(loader('./data/cca2_to_country_name.csv'))
          }
        ]
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': 'build/<%= pkg.name %>.js'
        }
      }
    },
    copy: {
      dist: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-string-replace')
  grunt.registerTask('default', ['string-replace:inline', 'uglify:dist', 'copy:dist'])
}
