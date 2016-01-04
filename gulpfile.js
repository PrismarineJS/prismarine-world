var gulp = require('gulp');

var babel = require('gulp-babel');
var options = {
    stage: 0, // Dat ES7 goodness
    optional: ["runtime"]
};

gulp.task('transpile', function() {
    gulp.src('src/*.js')
        .pipe(babel(options))
        .pipe(gulp.dest('dist/'));
});

gulp.task('transpile_test', function() {
  gulp.src('test/*.js')
    .pipe(babel(options))
    .pipe(gulp.dest('distTest/'));
});

gulp.task('watch', function() {
    gulp.run('transpile');
    gulp.watch('src/*.js', ['transpile']);
});

gulp.task('default', ['transpile','transpile_test']);
