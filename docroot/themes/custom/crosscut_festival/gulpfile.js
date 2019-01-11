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
const sourcemaps = require('gulp-sourcemaps');
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

function styles() {
    return gulp.src(['scss/style.scss'])
        // .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer( 'last 2 versions' ))
        .pipe(rename({suffix: '.min'}))
        .pipe(cleanCSS())
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest('css'))
        .pipe(server.stream());
}

// Move minified vendor scripts to js folder
gulp.task('vendorScripts', function() {
  return gulp.src([
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/owl.carousel/dist/owl.carousel.min.js'
  ])
      .pipe(gulp.dest('js'));
});

// Set up Vendor Store (vendor_components)
// Bootstrap scss
gulp.task('vendorStore:bootstrapScss', function() {
    return gulp.src([
        'node_modules/bootstrap/scss/**/*'
    ])
        .pipe(gulp.dest('vendor_components/scss/bootstrap'));
});

// Owl carousel scss
gulp.task('vendorStore:owlScss', function() {
  return gulp.src([
    'node_modules/owl.carousel/src/scss/*',
  ])
      .pipe( gulp.dest( 'vendor_components/scss/owl' ) );
});

// Copy vendor JS from node_modules to js
gulp.task('vendorJS', function() {
  return gulp.src('node_modules/owl.carousel/dist/owl.carousel.min.js')
      .pipe(gulp.dest('js'));
});


// Concat and minify custom JS files
function scripts() {
  return gulp.src(['src/custom/*.js'])
      .pipe(plumber())
      .pipe(gulp.dest('js'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest('js'))
      .pipe(server.stream());
}

// Set up vendorStore (SCSS:vendor_components and JS:src/vendor)
gulp.task('buildStore', gulp.parallel('vendorStore:bootstrapScss', 'vendorStore:owlScss', 'vendorJS'));

gulp.task('watchFiles', function() {
    gulp.watch('scss/**/*.scss', styles);
    gulp.watch('src/custom/*.js', scripts);
});

gulp.task('bs-watch', gulp.parallel('watchFiles', serve));

gulp.task('watch', gulp.series( 'buildStore', styles, scripts, 'bs-watch'));
