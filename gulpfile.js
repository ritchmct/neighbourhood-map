var del = require('del');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var gulpIf = require('gulp-if');
var inlineCss = require('gulp-inline-css');
var jshint = require('gulp-jshint');

// Initiate local server
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'dist'
        },
    });
});

// Cleaning
gulp.task('clean:dist', function() {
  return del.sync('dist');
});

//
gulp.task('lint', function() {
  return gulp.src('src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Use "build" comments in html to minify css and js
gulp.task('useref', function() {
    return gulp.src('src/**/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulpIf('*.html', htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('dist'));
});

// Inline css in index.html
gulp.task('inlinecss', function() {
    return gulp.src('dist/index.html')
        .pipe(inlineCss())
        .pipe(gulp.dest('dist'));
});

// Copy fonts
gulp.task('fonts', function() {
    return gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
});

// Watch for changes and reload
gulp.task('watch', function() {
    gulp.watch('src/**/*.html', browserSync.reload);
    gulp.watch('src/css/**/*.css', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);
});

gulp.task('default', function(callback) {
  runSequence(['browserSync', 'watch'], callback);
});

// inlinecss has to be run after useref as it acts on index.html in dist created by useref
gulp.task('build', function(callback) {
  // runSequence('clean:dist', ['useref', 'fonts'], 'inlinecss', callback);
  // inlinecss breaks formatting in InfoWindow. Remove it for now.
  runSequence('lint', 'clean:dist', ['useref', 'fonts'], callback);
});