module.exports = function () {
    var client = './src/client/';
    var clientApp = './public/';
    var temp = './.tmp/';
    var server = './bin/';
    var config = {

        config: 'config/**/*.*',
        migrations: 'migrations/**/*.*',
        models: "models/**/*.*",
        repositories: 'repositories/**/*.*',
        routes: 'routes/**/*.*',
        views: 'views/**/*.*',

        alljs: ['*.js', './**/*.js'],
        client: client,
        build: './build/',
        fonts: './bower_components/font-awesome/fonts/**',
        images: client + 'images/**/*.*',
        htmlTemplates: clientApp + '**/*.html',
        index: client + 'index.html',
        js: [
            server + '**/*.*/',
            clientApp + '**/*.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],
        less: client + 'styles/styles.less',
        server: server,
        temp: temp,
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                standAlone: false,
                root: 'app/'
            }
        },
        browserReloadDelay: 0,
        css: temp + 'styles.css',
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../..'
        },
        defaultPort: 7203,
        nodeServer: './bin/www'
    };

    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorepath: config.bower.ignorePath
        };
        return options;


    };

    return config;
};

