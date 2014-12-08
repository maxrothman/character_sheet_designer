var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    header  = require('gulp-header'),
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-minify-css'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    flatten = require('gulp-flatten'),
    jade = require('gulp-jade'),
    fs = require('fs'),
    path = require('path'),
    merge = require('merge-stream'),
    imageResize = require('gulp-image-resize'),
    jison = require('gulp-jison'),
    package = require('./package.json');

var bases = {
 app: 'app/',
 src: 'src/'
};

var builds = {
  html: "app/*.html",
  js: "app/assets/*.js",
  css: "app/assets/*.css",
  mincss: "app/assets/*.min.css",
  img: "app/assets/img/*",
  jison: "app/assets/jison/*"
}

var paths = {
  html: 'pages/**/*.html',
  jade: 'src/jade/'
}

var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

gulp.task('clean-js', function() {
 return gulp.src(builds.js)
 .pipe(clean());
});

gulp.task('clean-css', ['clean-min-css'], function() {
 return gulp.src(builds.css)
 .pipe(clean());
});

gulp.task('clean-min-css',function(){
  return gulp.src(builds.mincss)
  .pipe(clean());
})

gulp.task('clean-img', function(){
  return gulp.src(builds.img)
  .pipe(clean());
})

gulp.task('clean-html', function() {
 return gulp.src(builds.html)
 .pipe(clean());
});

gulp.task('clean-jison', function(){
  return gulp.src(builds.jison)
  .pipe(clean());
})

gulp.task('compile-jade', ['clean-html'], function() {
   var folders = getFolders(paths.jade);

   var tasks = folders.map(function(folder) {
      return gulp.src(['src/jade/header.jade', path.join(paths.jade, folder, '/*.jade'), 'src/jade/footer.jade'])
        .pipe(concat(folder + '.html'))
        .pipe(jade())
        .pipe(flatten())
        .pipe(gulp.dest(bases.app))
        .pipe(browserSync.reload({stream:true, once: true}));
   });

   return merge(tasks);
});

gulp.task('css', ['clean-css'],function () {
    return gulp.src('src/scss/style.scss')
    .pipe(sass({errLogToConsole: true}))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(minifyCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('js', ['clean-js'], function(){
  gulp.src('src/js/*.js')
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('app/assets/js'))
    .pipe(uglify())
    .pipe(header(banner, { package : package }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('app/assets/js'))
    .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('img', function(){
  gulp.src('src/img/*.png')
    .pipe(gulp.dest('app/assets/img'))
});

gulp.task('jison', ['clean-jison'], function(){
  gulp.src('src/jison/*.jison')
    .pipe(jison({ moduleType: 'commonjs' }))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('app/assets/jison'))
    .pipe(uglify())
    .pipe(header(banner, { package : package }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('app/assets/jison'))
})

gulp.task('browser-sync', ['img', 'css', 'js', 'jison', 'compile-jade'], function() {
    browserSync.init(null, {
        server: {
            baseDir: "app" 
        }
    });
});

gulp.task('bs-reload', ['compile-jade'], function () {
    browserSync.reload();
});

gulp.task('default', ['browser-sync'], function () {
    gulp.watch("src/scss/*/*.scss", ['css']);
    gulp.watch("src/js/*.js", ['js']);
    gulp.watch("src/**/*.jade", ['compile-jade']);
    gulp.watch("src/scss/*.scss", ['css']);
    gulp.watch("src/jison/*", ['jison']);
    gulp.watch("src/img/*", ['img']);
});