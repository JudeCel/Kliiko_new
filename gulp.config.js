module.exports = function () {
    var client = './src/client/';
    var clientApp = './public/';
    var temp = './.tmp/';
    var server = './bin/';
    var views = './views/';

    var config = {

        config: 'config/**/*.*',
        dns: 'insider.focus.com:',
        migrations: 'migrations/**/*.*',
        middleware: 'middleware/**/*.*',
        services: 'services/**/*.*',
        models: "models/**/*.*",
        repositories: 'repositories/**/*.*',
        routes: 'routes/**/*.*',
        views: 'views/**/*.*',
        temp: temp,
        alljs: ['*.js', './**/*.js'],
        client: client,
        build: './build/',
        fonts: './bower_components/font-awesome/fonts/**',
        images: client + 'images/**/*.*',
        htmlTemplates: clientApp + '**/*.html',
        jsFiles: clientApp + '**/*.js',
        index: views + 'layout.ejs' ,
        clientApp: [clientApp + 'scss/**/*.scss', clientApp + 'js/ngApp/**/*.scss'],
        layout: views,
        js: [
            server + '**/*.*/',
            clientApp + '**/*.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],
        sass: clientApp + 'scss/main.scss',
        bootstrap: clientApp + 'scss/**/bootstrap.scss',
        server: server,
       // temp: clientApp + './css/*.css',
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.core',
                standAlone: false,
                root: 'app/'
            }
        },
        browserReloadDelay: 0,
        css: clientApp + 'css/',

        defaultPort: 8080,
        nodeServer: './bin/www'
    };


    return config;
};
