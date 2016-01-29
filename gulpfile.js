var strip = require('gulp-strip-comments');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gulp = require('gulp');

gulp.task('default', function () {
  gulp.src('src/isschema-tools.js')
    .pipe(strip())
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename('isschema-tools.min.js'))
    .pipe(gulp.dest('dist'));
});