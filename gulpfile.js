'use strict'

var childProcess = require('child_process'),
	electron = require('electron-prebuilt'),
	gulp = require('gulp'),
	sass = require('gulp-sass');

// gulp start
gulp.task('start', ['build-css', 'watch'], function (){
	childProcess.spawn(electron, ['.'], {
		stdio: 'inherit'
	})
	.on('close', function(){
		process.exit();
	});
});



// watcher
gulp.task('watch', function () {
	gulp.watch('css/**/*.scss', ['build-css']);
});



// build css
gulp.task('build-css', function(){
    return gulp.src('css/**/*.scss')
    	.pipe(sass())
        .pipe(gulp.dest('css'));
});