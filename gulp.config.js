var source = './src/',
    moduleName = 'orderCloud',
    assets = 'assets/',
    build = './build/',
    bowerFiles = './bower_components/',
    npmFiles = './node_modules',
    compile = './compile/',
    index = 'index.html',
    root = __dirname,
    gulp_dir = './gulp/',
    fs = require('fs');
    


try {
    var saasConfig = require(source + 'app/saas/gulp.config');
} catch(ex) {
    var saasConfig = {};
}

module.exports = {
    moduleName: moduleName,
    saas: saasConfig,
    bowerFiles: bowerFiles,
    npmFiles: npmFiles,
    src: source,
    build: build,
    compile: compile,
    assets: assets,
    appCss: assets + 'styles/',
    appFonts: assets + 'fonts/',
    appImages: assets + 'images/',
    root: root,
    gulp: gulp_dir,
    index: source + index,
    styles: [
        source + '**/*.css',
        source + '**/*.less'
    ],
    templates: [
        '!' + source + index,
        source + 'app/**/*.html'
    ],
    scripts: [
        source + 'app/**/*.js',
        '!' + source + '**/saas/gulp.config.js',
        '!' + source + '**/*.spec.js',
        '!' + source + '**/*.test.js'
    ],
    appFiles: [
        build + '**/saas.module.js',
        build + '**/saas/**/*.js',
        '!' + build + '**/saas/gulp.config.js',
        build + '**/app.module.js',
        build + '**/common/config/**/routing.js',
        build + '**/common/config/**/*.js',
        build + '**/*s.config.js',
        build + '**/*.config.js',
        build + '**/app.run.js',
        build + '**/app.controller.js',
        build + '**/*.js',
        build + '**/*.css',
        source + '**/*.css'
    ],
    wrapper: {
        header: '(function() {\n"use strict";\n',
        footer: '}());'
    },
    templateCacheSettings: {
        standalone: false,
        moduleSystem: 'IIFE',
        module: moduleName
    },
    ngConstantSettings: {
        name: moduleName,
        deps: false,
        constants: saasConfig.getConstants ? saasConfig.getConstants() : getConstants()
    },
    babelSettings: {
        'presets': [
            [ 'env', {
                'targets': {
                    'browsers': [ 'last 2 versions' ]
                }
            } ]
        ]
    },
    jsCache: 'jsscripts',
    indentSize: 4,
    checkBootswatchTheme: _checkBootswatchTheme
};

function getConstants() {
    var result = {};
    var constants = JSON.parse(fs.readFileSync(source + 'app/app.constants.json'));
    var environment = process.env.environment || constants.environment;
    switch (environment) {
        case 'prod':
            result.imagestorageurl = 'https://archwayppg.blob.core.windows.net/webimages/';
            result.authurl = 'https://auth.ordercloud.io';
            result.apiurl = 'https://api.ordercloud.io';
            result.devapiurl = 'https://archway-ppg.azurewebsites.net/api';
            result.hostedsiteurl = 'https://ppg-admin.herokuapp.com';
            result.ppgbuyerurl = 'https://ppgadstock.archwayconnect.com';
            result.clientid = '3629A4FF-B049-4B4F-90F8-5734289F1C10';
            result.impersonationClientId = 'fa7f75bc-f89f-4c88-8bd7-06e4bfdca938';
            break;
        case 'test':
            result.imagestorageurl = 'https://archwayppgtest.blob.core.windows.net/webimages/';
            result.authurl = 'https://auth.ordercloud.io'; 
            result.apiurl = 'https://api.ordercloud.io'; 
            result.devapiurl = 'https://archway-ppg-test.azurewebsites.net/api';
            result.hostedsiteurl = 'https://ppg-admin-test.herokuapp.com';    
            result.ppgbuyerurl = 'https://archway-ppg-test.azurewebsites.net'; 
            result.clientid = '2493C95E-537A-4066-929E-9D15E7DF613B';
            result.impersonationClientId = '68C34D8F-801F-47F5-9E3B-E8CB7339F209';       
            break;
        case 'staging':
            result.imagestorageurl = 'https://archwayppgtest.blob.core.windows.net/webimages/';
            result.authurl = 'https://stagingauth.ordercloud.io';
            result.apiurl = 'https://stagingapi.ordercloud.io';
            result.devapiurl = 'https://archway-ppg-test.azurewebsites.net/api';
            result.hostedsiteurl = 'https://ppg-admin-test.herokuapp.com';   
            result.ppgbuyerurl = 'https://archway-ppg-test.azurewebsites.net';         
            result.clientid = '2493C95E-537A-4066-929E-9D15E7DF613B';
            result.impersonationClientId = '68C34D8F-801F-47F5-9E3B-E8CB7339F209';
            break;
        default:
            result.imagestorageurl = 'https://archwayppgtest.blob.core.windows.net/webimages/';
            result.authurl = 'https://auth.ordercloud.io';
            result.apiurl = 'https://api.ordercloud.io';
            result.devapiurl = 'https://archway-ppg-test.azurewebsites.net/api';
            result.hostedsiteurl = 'https://ppg-admin-test.herokuapp.com'; 
            result.ppgbuyerurl = 'https://archway-ppg-test.azurewebsites.net';
            result.clientid = '2493C95E-537A-4066-929E-9D15E7DF613B';
            result.impersonationClientId = '68C34D8F-801F-47F5-9E3B-E8CB7339F209';            
            break;
    }
    if (process.env.apiurl && process.env.authurl) {
        result.authurl = process.env.authurl;
        result.apiurl = process.env.apiurl;
    }
    else if (!environment && !process.env.apiurl && !process.env.authurl) {
        result.authurl = 'https://auth.ordercloud.io/oauth/token';
        result.apiurl = 'https://api.ordercloud.io';
    }
    if (process.env.clientid) result.clientid = process.env.clientid;
    if (process.env.appname) result.appname = process.env.appname;
    if (process.env.scope) result.scope = process.env.scope;
    if (process.env.ocscope) result.ocscope = process.env.ocscope;
    if (process.env.html5mode) result.html5mode = process.env.html5mode;
    if (process.env.bootswatchtheme) result.bootswatchtheme = process.env.bootswatchtheme;
    if (process.env.awsaccesskeyid) result.awsaccesskeyid = process.env.awsaccesskeyid;
    if (process.env.awssecretaccesskey) result.awssecretaccesskey = process.env.awssecretaccesskey;
    if (process.env.awsregion) result.awsregion = process.env.awsregion;
    if (process.env.awsbucket) result.awsbucket = process.env.awsbucket;
    return result;
}

function _checkBootswatchTheme() {
    var bootswatchBower = {};
    var constants = JSON.parse(fs.readFileSync(source + 'app/app.constants.json'));

    var theme = process.env.bootswatchtheme || constants.bootswatchtheme;

    if (theme) {
        bootswatchBower.main = [
            './' + theme + '/bootswatch.less',
            './' + theme + '/variables.less'
        ];
    }

    return bootswatchBower;
}