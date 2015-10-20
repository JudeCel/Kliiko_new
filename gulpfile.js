// Gulp.js configuration

// include gulp and plugins
var
	gulp = require('gulp'),
	newer = require('gulp-newer'),
	concat = require('gulp-concat'),
	preprocess = require('gulp-preprocess'),
	htmlclean = require('gulp-htmlclean'),
	imagemin = require('gulp-imagemin'),
	imageResize = require('gulp-image-resize'),
	imacss = require('gulp-imacss'),
	sass = require('gulp-sass'),
	pleeease = require('gulp-pleeease'),
	jshint = require('gulp-jshint'),
	deporder = require('gulp-deporder'),
	stripdebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	size = require('gulp-size'),
	minifyCSS = require('gulp-minify-css'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	del = require('del'),
	fileinclude = require('gulp-file-include'),
	browsersync = require('browser-sync'),
    gutil = require('gulp-util'),
	pkg = require('./package.json'),

nodemon = require('gulp-nodemon'),
notify = require('gulp-notify'),
livereload = require('gulp-livereload');

// Task
gulp.task('alex', function() {
	// listen for changes
	livereload.listen();
	// configure nodemon
	nodemon({
		// the script to run the app
		script: 'build/bin/www',
		ext: 'js'
	}).on('restart', function(){
		// when the app has restarted, run livereload.
		gulp.src('build/bin/www')
			.pipe(livereload())
			.pipe(notify('Reloading page, please wait...'));
	})
})




// file locations
var
	devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production'),

	source = 'source/',
	dest = 'build/',

	config = {
		in: 'config/**/*.*',
		out: dest + 'config/'
	},
	models = {
		in: source + 'models/**/*.*',
		out: dest + 'models/'
	},

	package1 = {
		in:  'package.json',
		out: dest
	},

	bin1 = {
		in: source + 'bin/*.*',
		out: dest + 'bin/'
	},

	test = {
		in: source + 'test/**/*.*',
		out: dest + 'test/'
	},

	files = {
		in: source + '*.*',
		out: dest
	},

	ejs = {
		in: source + 'views/*.ejs',
		watch: [source + 'views/*.ejs'],
		out: dest + 'views/',
		context: {
			devBuild: devBuild,
			author: pkg.author,
			version: pkg.version
		}
	},

	images = {
		in: source + 'static/images/*.*',
		out: dest + 'static/images/'
	},

	imguri = {
		in: source + 'static/images/inline/*',
		out: source + 'static/scss/images/',
		filename: '_datauri.scss',
		namespace: 'img'
	},

	css = {
		in: source + 'static/scss/main.scss',
		watch: [source + 'static/scss/**/*', '!' + imguri.out + imguri.filename],
		out: dest + 'static/css/',
		sassOpts: {
			outputStyle: 'nested',
			imagePath: '../images',
			precision: 3,
			errLogToConsole: true
		},
		pleeeaseOpts: {
			autoprefixer: { browsers: ['last 2 versions', '> 2%'] },
			rem: ['16px'],
			pseudoElements: true,
			mqpacker: true,
			minifier: !devBuild
		}
	},

	fonts = {
		in: source + 'static/fonts/**/*.*',
		out: dest + 'static/fonts/'
	},

	js = {
		in: source + 'static/js/**/*',
		out: dest + 'static/js/',
		filename: 'main.js'
	},
	routes = {
		in: source + 'routes/**/*',
		out: dest + 'routes/'

	},


	syncOpts = {
		server: {
			baseDir: dest,
			index: 'index.html'
		},
		open: false,
		notify: true
	};

// show build type
console.log(pkg.name + ' ' + pkg.version + ', ' + (devBuild ? 'development' : 'production') + ' build');

// clean the build folder
gulp.task('clean', function() {
	del([
		dest + '*'
	]);
});

// build HTML files
gulp.task('ejs', function() {
	var page = gulp.src(ejs.in).pipe(preprocess({ context: ejs.context }));
	if (!devBuild) {
		page = page
			.pipe(fileinclude({
				prefix: '@@',
				basepath: '@file'}))
			.pipe(size({ title: 'HTML in' }))
			.pipe(htmlclean())
			.pipe(size({ title: 'HTML out' }))

	}
	return page .pipe(fileinclude({
		prefix: '@@',
		basepath: '@file'
	}))

		.pipe(gulp.dest(ejs.out));
});

// manage images
gulp.task('images', function() {
	return gulp.src(images.in)

		.pipe(newer(images.out))
		.pipe(imagemin())
		.pipe(gulp.dest(images.out));
});

gulp.task('config', function() {
	return gulp.src(config.in)

		.pipe(newer(config.out))

		.pipe(gulp.dest(config.out));
});

gulp.task('bin1', function() {
	return gulp.src(bin1.in)

		.pipe(newer(bin1.out))

		.pipe(gulp.dest(bin1.out));
});

gulp.task('package1', function() {
	return gulp.src(package1.in)

		.pipe(newer(package1.out))

		.pipe(gulp.dest(package1.out));
});

gulp.task('files', function() {
	return gulp.src(files.in)

		.pipe(newer(files.out))

		.pipe(gulp.dest(files.out));
});

gulp.task('test', function() {
	return gulp.src(test.in)

		.pipe(newer(test.out))

		.pipe(gulp.dest(test.out));
});


gulp.task('models', function() {
	return gulp.src(models.in)

		.pipe(newer(models.out))

		.pipe(gulp.dest(models.out));
});



// convert inline images to dataURIs in SCSS source
gulp.task('imguri', function() {
	return gulp.src(imguri.in)
		.pipe(imagemin())
		.pipe(imacss(imguri.filename, imguri.namespace))
		.pipe(gulp.dest(imguri.out));
});

// copy fonts
gulp.task('fonts', function() {
	return gulp.src(fonts.in)
		.pipe(newer(fonts.out))
		.pipe(gulp.dest(fonts.out));
});

// compile Sass
gulp.task('sass', ['imguri'], function() {
	return gulp.src(css.in)
		.pipe(sass(css.sassOpts))
		.pipe(size({title: 'CSS in '}))
		.pipe(pleeease(css.pleeeaseOpts))
		.pipe(size({title: 'CSS out '}))
		.pipe(gulp.dest(css.out))
		.pipe(browsersync.reload({ stream: true }));
});

gulp.task('css1', function(){
	gulp.src(source +'static/css/*.css')
		.pipe(minifyCSS())
		.pipe(rename('bootstrap.min.css'))
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
		.pipe(gulp.dest(dest + 'static/css/'))
		.pipe(browsersync.reload({ stream: true }));
});
gulp.task('routes', function() {

		return gulp.src(routes.in)
			.pipe(newer(routes.out))
			//	.pipe(jshint())
			//.pipe(jshint.reporter('default'))
			//.pipe(jshint.reporter('fail'))
			.pipe(gulp.dest(routes.out));
	});

gulp.task('js', function() {
	if (devBuild) {
		return gulp.src(js.in)
			.pipe(newer(js.out))
		//	.pipe(jshint())
			//.pipe(jshint.reporter('default'))
			//.pipe(jshint.reporter('fail'))
			.pipe(gulp.dest(js.out));
	}
	else {
		del([
			dest + 'js/*'
		]);
		return gulp.src(js.in)
			.pipe(deporder())
			.pipe(concat(js.filename))
			.pipe(size({ title: 'JS in '}))
			.pipe(stripdebug())
			.pipe(uglify())
			.pipe(size({ title: 'JS out '}))
			.pipe(gulp.dest(js.out));
	}
});





// browser sync
gulp.task('browsersync', function() {
	browsersync(syncOpts);
});

// default task
gulp.task('default', ['ejs', 'bin1', 'package1', 'config', 'files', 'test', 'models', 'routes', 'images', 'fonts', 'sass', 'css1', 'js', 'browsersync', 'alex'], function() {

	// html changes
	gulp.watch(ejs.watch, ['ejs', browsersync.reload]);

	// image changes
	gulp.watch(images.in, ['images']);

	gulp.watch(config.in, ['config']);
	gulp.watch(models.in, ['models']);
	gulp.watch(bin1.in, ['bin1']);
	gulp.watch(test.in, ['test']);
	gulp.watch(files.in, ['files']);
	gulp.watch(package1.in, ['package1']);


	// font changes
	gulp.watch(fonts.in, ['fonts']);

	// sass changes
	gulp.watch([css.watch, imguri.in], ['sass']);

	gulp.watch(source + 'css/*.css', function () {
		gulp.run('css1');
	});

	// javascript changes
	gulp.watch(js.in, ['js', browsersync.reload]);
	gulp.watch(routes.in, ['routes', browsersync.reload]);

});
