// gulp task manager
require('dotenv-extended').load({
    errorOnMissing: true
});

var gulp = require('gulp'),
  http = require('http'),
  taskListing = require('gulp-task-listing'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  sourcemaps = require('gulp-sourcemaps'),
  rename = require('gulp-rename'),
  order = require('gulp-order'),
  exit = require('gulp-exit'),
  clean_css = require('gulp-clean-css'),
  plumber = require('gulp-plumber'),
  app = require("./app.js"),
  nodemon = require('gulp-nodemon'),
  watch = require('gulp-watch'),
  sass = require('gulp-sass'),
  batch = require('gulp-batch'),
  autoprefixer = require('gulp-autoprefixer'),
  config = require('./gulp.config.js')();

gulp.task('default', ['serve-dev', 'watch']);

gulp.task('serve-dev', ['build-js', 'build-css'], function () {
  nodemon({
    script: 'bin/www',
    ext: 'html js',
    ignore: ['public/**/*']
  })
  .on('restart', function () {
    console.log('Server restarted!')
  })
});

gulp.task('watch', ['watch-css', 'watch-js']);

gulp.task('watch-css', function () {
  watch(['public/js/**/*.scss', 'public/scss/**/*.scss', 'public/css/**/*.css', '!public/css/compiled/**/*.css', '!public/css/main.css'], batch(function (events, done) {
    gulp.start('build-css', done);
  }));
});

gulp.task('watch-js', function () {
  watch(['public/js/**/*.js', "!public/js/compiled/**/*.js"], batch(function (events, done) {
    gulp.start('build-js', done);
  }));
});

gulp.task('help', taskListing);
var server = require('gulp-server-livereload');

gulp.task('webserver', function() {
  gulp.src('app')
    .pipe(server({
      livereload: true,
      directoryListing: true,
      open: true
    }));
});


// Asset serving

var frontendScripts = [
  "public/js/vendors/jQuery/jquery-2.1.4.min.js",
  "public/js/vendors/jQuery/jquery-ui.js",
  "public/js/vendors/angular/1.4.8/angular.min.js",
  "public/js/vendors/angular/1.4.8/angular-animate.min.js",
  "public/js/vendors/angular/1.4.8/angular-aria.min.js",
  "public/js/vendors/angular/1.4.8/angular-cookies.min.js",
  "public/js/vendors/angular/1.4.8/angular-loader.min.js",
  "public/js/vendors/angular/1.4.8/angular-message-format.min.js",
  "public/js/vendors/angular/1.4.8/angular-messages.min.js",
  "public/js/vendors/angular/1.4.8/angular-resource.min.js",
  "public/js/vendors/angular/1.4.8/angular-route.min.js",
  "public/js/vendors/angular/1.4.8/angular-sanitize.min.js",
  "public/js/vendors/angular/1.4.8/angular-touch.min.js",

  "public/js/vendors/angular-ui-sortable/sortable.js",
  "public/js/vendors/jquery-ui/*.js",

  "public/js/vendors/angular-material/**/*.min.js",
  "public/js/vendors/moment/moment.js",
  "public/js/vendors/bootstrap/bootstrap.js",
  "public/js/vendors/bootstrap/bootstrap-show-password.js",
  "public/js/vendors/international-phone-number/**/*.js",
  "public/js/vendors/intl-tel-input/**/*.js",
  "public/js/vendors/jwysiwyg/jquery.wysiwyg.js",
  "public/js/vendors/jwysiwyg/controls/wysiwyg.image.js",
  "public/js/vendors/ng-file-upload/ng-file-upload.js",
  "public/js/vendors/ngDraggable/ngDraggable.js",
  "public/js/vendors/ngProgress/ngprogress.min.js",
  "public/js/vendors/ui-bootstrap/**/*.min.js",
  "public/js/vendors/ui-router/**/*.js",
  "public/js/ngApp/modules/**/*.js",
  "public/js/ngApp/app.js",
  "public/js/ngApp/settings/appGlobalSettings.js",
  "public/js/ngApp/directives/**/*.js",
  "public/js/ngApp/appRouter.js",
  "public/js/ngApp/components/**/*.js",
  "public/js/ngApp/filters/**/*.js",
  "public/js/ngApp/factories/**/*.js"
]

var frontendStyles = [
  "public/css/bootstrap-social.css",
  "public/css/awesome-bootstrap-checkbox.css",
  "public/css/bootstrap.css",
  "public/css/bootstrap-theme.css",
  "public/css/font-awesome.css",
  "public/css/main.css",
  "public/css/animate/animate.css",
  "public/css/colorpicker/colorpicker.min.css",
  "public/js/vendors/intl-tel-input/src/intlTelInput.css",
  "public/js/vendors/ngProgress/ngProgress.css",
  "public/js/vendors/jwysiwyg/jquery.wysiwyg.css",
  "public/js/vendors/angular-material/1.0.1/angular-material.min.css",
  "public/js/vendors/jquery-ui/*.css",
]

gulp.task('build-css', ['build-sass'], function(){
  return gulp.src(frontendStyles)
  .pipe(sourcemaps.init())
  .pipe(clean_css())
  .pipe(concat('concat.css'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('public/css/compiled'))
});

gulp.task('build-css-prod', ['build-sass'], function(){
  return gulp.src(frontendStyles)
  .pipe(clean_css())
  .pipe(concat('concat.css'))
  .pipe(gulp.dest('public/css/compiled'))
});

gulp.task('build-js', function(){
  return gulp.src(frontendScripts)
  .pipe(sourcemaps.init())
  .pipe(concat('concat.js'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('public/js/compiled'))
});

gulp.task('build-js-prod', function(){
  return gulp.src(frontendScripts)
  .pipe(concat('concat.js'))
  .pipe(gulp.dest('public/js/compiled'))
  .pipe(uglify({mangle: false}))
  .pipe(rename('concat.js'))
  .pipe(gulp.dest('public/js/compiled'))
});

gulp.task('minify-css', function() {
  return gulp.src(frontendStyles)
    .pipe(clean_css({compatibility: 'ie8'}))
    .pipe(gulp.dest('public/js/compiled'));
});

gulp.task('build-sass', function () {
  return gulp
    .src(config.sass)
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({browsers: ['last 2 version', '> 5%']}))
    .pipe(gulp.dest(config.css));
});

gulp.task('build-prod', ['build-css-prod', 'build-js-prod'], function(){
  return gulp.src("").pipe(exit())
});
