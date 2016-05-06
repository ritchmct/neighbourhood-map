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

// Use "build" comments in html to minify css and js
// Exclude views directory and process separately
gulp.task('useref', function() {
    return gulp.src(['src/**/*.html', '!src/views/*.html'])
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulpIf('*.html', htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('dist'));
});

// Use "build" comments in html to minify css and js under views directory
// useref didn't put the css and js files in the correct location
gulp.task('useref-views', function() {
    return gulp.src('src/views/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulpIf('*.html', htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('dist/views'));
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

// useref and useref-views should not be run in parallel
// inlinecss has to be run after useref as it acts on index.html in dist created by useref
gulp.task('build', function(callback) {
  runSequence('clean:dist', ['useref', 'fonts'], ['useref-views', 'inlinecss'], callback);
});