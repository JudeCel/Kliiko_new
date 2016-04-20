// gulp task manager
var gulp = require('gulp'),
  jscs = require('gulp-jscs'),
  util = require('gulp-util'),
  gulpPrint = require('gulp-print'),
  gulpif = require('gulp-if'),
  args = require('yargs').argv,
  config = require('./gulp.config')(),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  del = require('del'),
  inject = require('gulp-inject'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  browserSync = require('browser-sync'),
  taskListing = require('gulp-task-listing'),
  newer = require('gulp-newer'),
  templateCache = require('gulp-angular-templatecache'),
  imagemin = require('gulp-imagemin'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  sourcemaps = require('gulp-sourcemaps'),
  rename = require('gulp-rename'),
  order = require('gulp-order'),
  exit = require('gulp-exit'),
  useref = require('gulp-useref'),
  minifyHtml = require('gulp-minify-html'),
  nodeInspector = require('gulp-node-inspector'),
  args = require('yargs').argv,
  port = process.env.PORT || config.defaultPort;

gulp.task('help', taskListing);
gulp.task('default', ['help']);

gulp.task('templatecache', function (){
  log('Creating AngularJS $templateCache');

  return gulp
    .src(config.htmlTemplates)
    .pipe(minifyHtml({empty: true}))
    .pipe(templateCache(config.templateCache.file,
      config.templateCache.options))
    .pipe(gulp.dest(config.temp));

});

gulp.task('optimize', ['inject'], function(){
  log('Optimizing the javascript, css, html');
  var templateCache = config.temp + config.templateCache.file;
  var assets = useref.assets({searchPath: './'});
  return gulp
    .src(config.index)
    .pipe(plumber())
    .pipe(inject(gulp.src(templateCache,{read: false}), {starttag: '<!--inject:templates:js-->'}))
    .pipe(assets)
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest(config.build));
} );

gulp.task('clean-code', function(done){
  var files = [].concat(
    config.temp + '**/*.js',
    config.build + '**/*.html,',
    config.build + 'js/**/*.js'

  );
  clean(files,done);
});

gulp.task('bootstrap', function () {
  log('Compiling Bootstrap SASS --> CSS');
  return gulp
    .src(config.bootstrap)
    .pipe(plumber())

    .pipe(sass())
    //   .on('error', errorLoger)
    .pipe(autoprefixer({browsers: ['last 2 version', '> 5%']}))
    .pipe(gulp.dest(config.css))
});
gulp.task('sass', function () {
  log('Compiling SASS --> CSS');
  return gulp
    .src(config.sass)
    .pipe(plumber())
    .pipe(sass())
    //   .on('error', errorLoger)
    .pipe(autoprefixer({browsers: ['last 2 version', '> 5%']}))
    .pipe(gulp.dest(config.css));
});

  gulp.watch(config.clientApp, ['sass']);

gulp.task('images', function(){
  log('Copying and compressing the images');
  return gulp
    .src(config.images)
    .pipe(newer(config.build + 'images'))
    .pipe(imagemin({optimization: 4}))
    .pipe(gulp.dest(config.build + 'images'))
});
gulp.task('fonts', function(){
  return gulp
    .src(config.fonts)
    .pipe(gulp.dest(config.build + 'fonts'));
});

gulp.task('inject', ['bootstrap', 'sass', 'templatecache'], function () {
  log('Wire up the app css into html and call wiredep');

  return gulp
    .src(config.index)
    .pipe(inject(gulp.src(config.css)))
    .pipe(gulp.dest(config.layout))

});

gulp.task('inspect', function () {
  var debugPort = 5858;
  var webPort = 8085;

    gulp.src([]).pipe(nodeInspector({
        debugPort: debugPort,
        webHost: '0.0.0.0',
        webPort: webPort,
        preload: false
    }));
});

gulp.task('serve-dev', (args.debug) ? ['inject', 'inspect'] : ['inject'], function () {
  var isDev = true;
  var nodeOptions = {
    nodeArgs: [],
    script: config.nodeServer,
    delayTime: 0,
    env: {
      'PORT': port,
      'NOE_ENV': isDev ? 'dev' : 'build'
    },
    watch: [config.server]
  };

  // Debug using node inspect
  if (args.debug) {
        nodeOptions.nodeArgs.push('--debug');
    }

  return nodemon(nodeOptions)
    .on('restart', ['vet'], function (ev) {
      log("*** nodemon restarted");
      log('*** files changed on restart:\n' + ev);
      setTimeout(function() {
        browserSync.notify('reloading now ...');
        browserSync.reload({stream: false});
      }, config.browserReloadDelay)
    })

    .on('start', function () {
      log("*** nodemon started");
      startBrowserSync();
    })
    .on('crash', function () {
      log("*** nodemon crashed");
    })
    .on('exit', function () {
      log("*** nodemon exited cleanly");
    });

});

function startBrowserSync() {
  if (browserSync.active) {
    return;
  }

  function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File' + event.path.replace(srcPattern, '') + ' ' + event.type);
  }

  log('Starting browser-sync on port ' + port);

  gulp.watch([config.sass], ['bootstrap'])
    .on('change', function (event) {
      changeEvent(event);
    });

  var options = {
    proxy: config.dns + port,
    open: false,
    port: 3000,
    files: [
      config.migrations,
      config.services,
      config.middleware,
      config.htmlTemplates,
      config.jsFiles,
      config.config,
      config.clientApp,
      config.repositories,
      config.models,
      config.routes,
      config.views,
      '!' + config.sass
    ],
    ghostNode: {
      clicks: true,
      location: false,
      forms: true,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    loglevel: 'debug',
    logPrefix: 'gulp-pattern',
    notify: true,
    reloadDelay: 0
  };
  browserSync(options);
}
gulp.task('clean', function (done) {
  var files = config.temp + '**/*.css';
  clean(files, done)
});

var frontendScripts = [
  "public/js/vendors/jQuery/jquery-2.1.4.min.js",
  "public/js/vendors/angular/1.4.8/angular.js",
  "public/js/vendors/angular/**/*.min.js",
  "public/js/vendors/angular-material/**/*.min.js",
  "public/js/vendors/moment/moment.js",
  "public/js/vendors/moment/moment.js",
  "public/js/vendors/bootstrap/bootstrap.js",
  "public/js/vendors/bootstrap/bootstrap-show-password.js",
  "public/js/vendors/international-phone-number/**/*.js",
  "public/js/vendors/intl-tel-input/**/*.js",
  "public/js/vendors/jwysiwyg/jquery.wysiwyg.js",
  "public/js/vendors/jwysiwyg/controls/wysiwyg.image.js",
  "public/js/vendors/ng-file-upload/ng-file-upload.js",
  "public/js/vendors/ngDraggable/ngDraggable.js",
  "public/js/vendors/ngProgress/ngProgress.min.js",
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


gulp.task('build', function(){
  return gulp.src(frontendScripts)
  .pipe(sourcemaps.init())
  .pipe(concat('concat.js'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('public/js/compiled'))
});

gulp.task('build-prod', function(){
  return gulp.src(frontendScripts)
  .pipe(concat('concat.js'))
  .pipe(gulp.dest('public/js/compiled'))
  .pipe(rename('concat.js'))
  .pipe(uglify({mangle: false}))
  .pipe(gulp.dest('public/js/compiled'))
  .pipe(exit());
});

gulp.task('default', ['build', 'serve-dev']);

function clean(path, done) {
  log('Cleanening:' + util.colors.blue(path));
  del(path, done);
}

function log(msg) {
  if (typeof (msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        util.log(util.colors.blue(msg[item]));
      }
    }
  }
  else {
    util.log(util.colors.blue(msg));
  }
}
