const gulp = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const concat = require("gulp-concat");
const minifyCss = require("gulp-minify-css");
const uglify = require("gulp-uglify");
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const rename = require('gulp-rename');
// const crass = require('gulp-crass');
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');
const render = require('gulp-nunjucks-render');
const data = require('gulp-data');

sass.compiler = require('node-sass');

const server = browserSync.create();
function serve(done) {
    server.init({
      proxy: "http://crosscut-festival.dd:8083",
    });
    done();
}

// Compile sass into CSS & auto-inject into browsers
// gulp.task('sass', function() {
//     return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'scss/style.scss'])
//         .pipe(sass().on('error', sass.logError))
//         .pipe(gulp.dest("css"))
//         .pipe(sass({ outputStyle: 'compressed' }))
//         // .pipe(minifyCss())
//         .pipe(browserSync.stream());
// });

function styles() {
    return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'scss/style.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer( 'last 2 versions' ))
        .pipe(gulp.dest("css"))
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(minifyCss())
        .pipe(browserSync.stream());
}

gulp.task('vendorStore:scss', function() {
    return gulp.src([
        'node_modules/bootstrap/scss/**/*'
    ])
        .pipe(gulp.dest('vendor_components/scss/bootstrap'));
});

gulp.task('vendorStore:js', function() {
  return gulp.src([
    'node_modules/bootstrap/js/dist/*'
  ])
      .pipe(gulp.dest('vendor_components/js/bootstrap'));
});


// Set up vendorStore
gulp.task('buildStore', gulp.parallel('vendorStore:scss', 'vendorStore:js'));

// // Move the javascript files into our js folder
// gulp.task('js', function() {
//     return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/popper.js/dist/umd/popper.min.js'])
//         .pipe(gulp.dest("js"))
//         .pipe(browserSync.stream());
// });
//
// // Static Server + watching scss/html files
// gulp.task('serve', ['sass'], function() {
//
//     browserSync.init({
//         proxy: "http://127.0.0.1:8888",
//     });
//
//     gulp.watch(['node_modules/bootstrap/scss/bootstrap.scss', 'scss/*.scss'], ['sass']);
//     //    gulp.watch("src/*.html").on('change', browserSync.reload);
// });
//
// gulp.task('default', ['js', 'serve']);

gulp.task('watch', function() {
    gulp.watch('scss/*.scss', styles)
});

gulp.task('bs-watch', gulp.parallel('watch', serve));

gulp.task('watchSass', gulp.series( 'buildStore', styles, 'bs-watch'));
