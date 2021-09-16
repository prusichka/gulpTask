//*-------------------------------------------Variable--------------------------------------------------------//

let preprocessor = 'sass'

const { src, dest, series, parallel, watch, task } = require('gulp')


const browserSync = require('browser-sync').create()

const concat = require('gulp-concat')

const uglify = require('gulp-uglify-es').default

const sass = require('gulp-sass')(require('sass'))

const autoprefixer = require('gulp-autoprefixer')

const cleancss = require('gulp-clean-css')

const imagecomp = require('compress-images')

const del = require('del')

const ghPages = require('gulp-gh-pages')

//*-------------------------------------------Variable--------------------------------------------------------//

//*-------------------------------------------Function--------------------------------------------------------//

function browsersync() {
  browserSync.init({
    // Инициализация Browsersync
    server: { baseDir: 'app/' }, // Указываем папку сервера
    notify: false, // Отключаем уведомления
    online: true, // Режим работы: true или false
  })
}

function styles() {
  return src('app/' + preprocessor + '/main.' + preprocessor + '')
    .pipe(eval(preprocessor)())
    .pipe(concat('app.min.css'))
    .pipe(
      autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }),
    )
    .pipe(
      cleancss({
        level: { 1: { specialComments: 0 } }
      }),
    ) 
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src(['app/js/script.js'])
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream())
}

async function images() {
  imagecomp(
    'app/img/**/*',
    'app/img/',
    { compress_force: false, statistic: true, autoupdate: true },
    false,
    { jpg: { engine: 'mozjpeg', command: ['-quality', '75'] } },
    { png: { engine: 'pngquant', command: ['--quality=75-100', '-o'] } },
    { svg: { engine: 'svgo', command: '--multipass' } },
    {
      gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] },
    },
    function (err, completed) {
      if (completed === true) {
        browserSync.reload()
      }
    },
  )
}

task('deploy', () => src('./dist/**/*').pipe(ghPages()));

function cleanimg() {
  return del('app/img/**/*', { force: true })
}

function startWatch() {
  watch('app/**/' + preprocessor + '/**/*', styles)
  watch('app/**/*.html').on('change', browserSync.reload)
  watch('app/img/**/*', images)
}

function buildcopy() {
  return src(
    [
      // Выбираем нужные файлы
      'app/css/**/*.min.css',
      'app/js/**/*.min.js',
      'app/img/**/*',
      'app/**/*.html',
    ],
    { base: 'app' },
  )
    .pipe(dest('dist'))
}
function cleandist() {
  return del('dist/**/*', { force: true }) //
}

//*-------------------------------------------Function--------------------------------------------------------//

//*-------------------------------------------Exports--------------------------------------------------------//

exports.default = parallel(styles, browsersync, startWatch)

exports.browsersync = browsersync
exports.styles = styles
exports.images = images
exports.cleanimg = cleanimg

exports.build = series(cleandist, styles, images, buildcopy)
//*-------------------------------------------Exports--------------------------------------------------------//
