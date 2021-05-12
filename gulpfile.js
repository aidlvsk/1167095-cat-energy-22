const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const del = require("del");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const svgstore = require("gulp-svgstore");

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
    ]))
    .pipe(sourcemap.write("."))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
};

exports.styles = styles;

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 1 }),
      imagemin.mozjpeg({ progressive: true }),
      imagemin.svgo(),
    ]))
    .pipe(gulp.dest("build/img"));
};

exports.images = images;

// WebP

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("build/img"));
};

exports.createWebp = createWebp;

// Sprite

const sprite = () => {
  return gulp.src("source/img/**/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
}

const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}", "source/*.ico", "source/*.ico",
  ], {
    base: "source",
  }).pipe(gulp.dest("build"));
  done();
};

exports.sprite = sprite;

// HTML

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

exports.html = html;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build",
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

// Build

const build = gulp.series(
  clean,
  copy,
  gulp.parallel(
    styles,
    html,
    images,
    sprite,
    createWebp
  ),
);

exports.build = build;

// Reload

const reload = (done) => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series(styles));
  gulp.watch("source/img/**/*.{jpg,png,svg}", gulp.series(images));
  gulp.watch("source/img/**/*.{jpg,png}", gulp.series(createWebp));
  gulp.watch("source/img/**/*.svg", gulp.series(sprite));
  gulp.watch("source/*.html", gulp.series(html, reload));
};

exports.default = gulp.series(
  build, server, watcher,
);
