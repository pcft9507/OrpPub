const gulp = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const fileinclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const path = {
	dist: './dist/',
	src: './src/',
}
const scssOptions = {
	outputStyle: 'expanded', /* nested, expanded, compact, compressed */
	indentType: 'space',
	indentWidth: 2,
	souceComments: true
}
gulp.task('guide', () => {
	return gulp.src(path.src + '/guide/**')
    .pipe(gulp.dest(path.dist + 'guide'))
		.pipe(browserSync.reload({ stream: true }));
});
gulp.task('guideIndex', () => {
	return gulp.src(path.src + '/index.html')
    .pipe(gulp.dest(path.dist))
		.pipe(browserSync.reload({ stream: true }));
});
gulp.task('html',()=> {
  return gulp
    .src(path.src + '/html/**/*.html')
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: path.src + '/inc',
      }),
    )
    .pipe(gulp.dest(path.dist + '/html/'))
    .pipe(browserSync.reload({ stream: true }));
});
gulp.task('scss', () => {
  return gulp
    .src(path.src + 'assets/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(scss(scssOptions).on('error', scss.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(path.dist + 'assets/css'))
    .pipe(browserSync.reload({ stream: true }));
});
gulp.task('scss:prod', () => {
  return gulp
    .src(path.src + 'assets/scss/**/*.scss')
    .pipe(scss(scssOptions).on('error', scss.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(path.dist + 'assets/css'))
    .pipe(browserSync.reload({ stream: true }));
});
gulp.task('js', () => {
  return gulp
    .src(path.src + 'assets/js/**/*.js')
    .pipe(gulp.dest(path.dist + 'assets/js'))
    .pipe(browserSync.reload({ stream: true }));
});
gulp.task('images', () => {
  return gulp
    .src(path.src + 'assets/images/**')
    .pipe(gulp.dest(path.dist + 'assets/images'))
    .pipe(browserSync.reload({ stream: true }));
});
gulp.task('fonts', () => {
  return gulp
    .src(path.src + 'assets/fonts/**')
    .pipe(gulp.dest(path.dist + 'assets/fonts'))
    .pipe(browserSync.reload({ stream: true }));
});
gulp.task('browserSync', () => {
  return browserSync.init({
    port: 100,
    server: {
      baseDir: './dist'
    }
  })
});
gulp.task('watch', () => {
  gulp.watch(path.src + '/guide/', gulp.series('guide'));
  gulp.watch(path.src, gulp.series('guideIndex'));
  gulp.watch(path.src + '**/*.html', gulp.series('html'));
  gulp.watch(path.src + 'assets/**/*.scss', gulp.series('scss'));
  gulp.watch(path.src + 'assets/**/*.js', gulp.series('js'));
  gulp.watch(path.src + 'assets/images/', gulp.series('images'));
});
gulp.task('default', gulp.parallel('guide','guideIndex','html','scss','js','images','fonts','watch','browserSync'));
gulp.task('build', gulp.parallel('guide','guideIndex','html','scss:prod','js','images','fonts'));