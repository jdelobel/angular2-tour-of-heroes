const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const tsConfig = require('./tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');
const uglify = require('gulp-uglify');
const htmlreplace = require('gulp-html-replace');
const concat = require('gulp-concat');

// clean the contents of the distribution directory
gulp.task('clean', function() {
  return del('dist/**/*');
});

gulp.task('app-bundle', function() {
  const tsProject = typescript.createProject('tsconfig.json', {
    typescript: require('typescript'),
    outFile: 'app.js'
  });

  const tsResult = gulp.src('app/**/*.ts')
    .pipe(typescript(tsProject));

  return tsResult.js.pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy-css', function() {
  gulp.src('styles.css')
    .pipe(gulp.dest('./dist'));
  gulp.src('app/**/*.css')
    .pipe(gulp.dest('./dist/app'));
});

gulp.task('vendor-bundle', function() {
  gulp.src([
    'node_modules/es6-shim/es6-shim.min.js',
    'node_modules/systemjs/dist/system-polyfills.js',
    'node_modules/angular2/es6/dev/src/testing/shims_for_IE.js',
    'node_modules/angular2/bundles/angular2-polyfills.js',
    'node_modules/systemjs/dist/system.src.js',
    'node_modules/rxjs/bundles/Rx.js',
    'node_modules/angular2/bundles/angular2.dev.js',
    'node_modules/angular2/bundles/router.dev.js'
  ])
    .pipe(concat('vendors.min.js'))
    // TODO pb with router on uglify
    //.pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('boot-bundle', function() {
  gulp.src('systemjs.config.prod.js')
    .pipe(concat('boot.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy-html', ['vendor-bundle'], function() {
  gulp.src('app/**/*.html')
    .pipe(gulp.dest('./dist/app'));
  gulp.src('index.html')
    .pipe(htmlreplace({
      'vendor': 'vendors.min.js',
      'app': 'app.min.js',
      'boot': 'boot.min.js'
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('tslint', function() {
  return gulp.src('app/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report('verbose'));
});

gulp.task('dist', ['tslint', 'app-bundle', 'vendor-bundle', 'boot-bundle', 'copy-html', 'copy-css']);
gulp.task('default', ['dist']);




