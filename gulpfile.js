"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var rename = require('gulp-rename');
var svgstore = require('gulp-svgstore');
var server = require("browser-sync").create();
var del = require("del");
var run = require("run-sequence");
var uglify = require('gulp-uglify');
var pump = require('pump');
var htmlmin = require('gulp-htmlmin');

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("vendor", function () {
  return gulp.src([
    "node_modules/jquery/dist/jquery.js",
    "node_modules/slick-carousel/slick/slick.js",
    "node_modules/slick-carousel/slick/fonts/**",
    "node_modules/slick-carousel/slick/ajax-loader.gif"
  ], {
    base: "node_modules"
  })
  .pipe(gulp.dest("build/vendor"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("style", function() {
  gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"));
});

gulp.task("sprite", function () {
  return gulp
  .src("source/img/sprite-*.svg")
  .pipe(svgstore({ inlineSvg: true }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task('minify', function() {
  return gulp.src('source/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('compress', function () {
  return gulp.src('source/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function () {
  return gulp.src("build/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

gulp.task("serve", function() {
  server.init({
    server: "build/"
  });

  gulp.watch("source/less/**/*.less", ["style"]);
  gulp.watch("source/*.html",["html"]);
});

gulp.task("build", function (done) {
  run(
    "clean",
    "copy",
    "vendor",
    "style",
    "sprite",
    "html",
    // "minify",
    // "compress",
    done
  );
})
