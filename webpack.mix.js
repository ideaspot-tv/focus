let mix = require('laravel-mix');

mix
    .js('src/js/focus.js', 'build')
    .less('src/less/style.less', 'style.css')
    .sourceMaps()
    .disableSuccessNotifications()
    .minify('build/focus.js')
    .minify('build/style.css')
    .setPublicPath('build')
;