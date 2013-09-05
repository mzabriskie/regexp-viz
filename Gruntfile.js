/*global module:false*/
module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.initConfig({
		jshint: {
			all: ['Gruntfile.js', 'regexp.js']
		}
	});

	grunt.registerTask('default', ['jshint']);
};
