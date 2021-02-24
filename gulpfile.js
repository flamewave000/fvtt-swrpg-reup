const gulp = require('gulp');
var fs = require('fs')
const del = require('del');
const ts = require('gulp-typescript');
const sm = require('gulp-sourcemaps');
const zip = require('gulp-zip');
const rename = require('gulp-rename');
const minify = require('gulp-minify');
const tabify = require('gulp-tabify');

const GLOB = '**/*';
const DIST = 'dist/';
const BUNDLE = 'bundle/';
const SOURCE = 'module/';
const LANG = 'lang/';
const TEMPLATES = 'templates/';
const CSS = 'css/';

var PACKAGE = JSON.parse(fs.readFileSync('./package.json'));
var DEV_DIR = fs.readFileSync('dev').toString().trim();
function reloadPackage(cb) { PACKAGE = JSON.parse(fs.readFileSync('./package.json')); cb(); }
function DEV_DIST() { return DEV_DIR + PACKAGE.name + '/'; }
console.log(DEV_DIST());

String.prototype.replaceAll = function (pattern, replace) { return this.split(pattern).join(replace); }
function pdel(patterns, options) { return () => { return del(patterns, options); }; }
function plog(message) { return (cb) => { console.log(message); cb() }; }


/**
 * Compile the source code into the distribution directory
 * @param {Boolean} keepSources Include the TypeScript SourceMaps
 */
function buildSource(keepSources, minifySources = false, output = null) {
	return () => {
		var stream = gulp.src(SOURCE + GLOB);
		if (keepSources) stream = stream.pipe(sm.init())
		stream = stream.pipe(ts.createProject("tsconfig.json")())
		if (keepSources) stream = stream.pipe(sm.write())
		if (minifySources) stream = stream.pipe(minify({
			ext: { min: '.js' },
			mangle: false,
			noSource: true
		}));
		else stream = stream.pipe(tabify(4, false));
		return stream.pipe(gulp.dest((output || DIST) + SOURCE));
	}
}
exports.step_buildSourceDev = buildSource(true, false, DEV_DIST());
exports.step_buildSource = buildSource(false);
exports.step_buildSourceMin = buildSource(false, true);

function outputLanguages(output = null) { return () => gulp.src(LANG + GLOB).pipe(gulp.dest((output || DIST) + LANG)); }
function outputTemplates(output = null) { return () => gulp.src(TEMPLATES + GLOB).pipe(gulp.dest((output || DIST) + TEMPLATES)); }
function outputStylesCSS(output = null) { return () => gulp.src(CSS + GLOB).pipe(gulp.dest((output || DIST) + CSS)); }
function outputMetaFiles(output = null) { return () => gulp.src(['LICENSE', 'README.md', 'CHANGELOG.md', 'system.json', 'template.json']).pipe(gulp.dest((output || DIST))); }

/**
 * Copy files to module named directory and then compress that folder into a zip
 */
function compressDistribution() {
	return gulp.series(
		// Copy files to folder with module's name
		() => gulp.src(DIST + GLOB)
			.pipe(gulp.dest(DIST + `${PACKAGE.name}/${PACKAGE.name}`))
		// Compress the new folder into a ZIP and save it to the `bundle` folder
		, () => gulp.src(DIST + PACKAGE.name + '/' + GLOB)
			.pipe(zip(PACKAGE.name + '.zip'))
			.pipe(gulp.dest(BUNDLE))
		// Copy the system.json to the bundle directory
		, () => gulp.src(DIST + '/system.json')
			.pipe(gulp.dest(BUNDLE))
		// Cleanup by deleting the intermediate module named folder
		, pdel(DIST + PACKAGE.name)
	);
}
exports.step_buildManifest = compressDistribution();

/**
 * Outputs the current distribution folder to the Development Environment.
 */
function outputDistToDevEnvironment() {
	return gulp.src(DIST + GLOB).pipe(gulp.dest(PACKAGE.devDir + PACKAGE.name));
}
exports.step_outputDistToDevEnvironment = outputDistToDevEnvironment;

/**
 * Simple clean command
 */
exports.clean = pdel([DIST, BUNDLE]);
exports.devClean = pdel([DEV_DIST()]);
/**
 * Default Build operation
 */
exports.default = gulp.series(
	pdel([DIST])
	, gulp.parallel(
		buildSource(true, false)
		, outputLanguages()
		, outputTemplates()
		, outputStylesCSS()
		, outputMetaFiles()
	)
);
/**
 * Extends the default build task by copying the result to the Development Environment
 */
exports.dev = gulp.series(
	pdel([DEV_DIST() + GLOB], { force: true }),
	gulp.parallel(
		buildSource(true, false, DEV_DIST())
		, outputLanguages(DEV_DIST())
		, outputTemplates(DEV_DIST())
		, outputStylesCSS(DEV_DIST())
		, outputMetaFiles(DEV_DIST())
	)
	, outputDistToDevEnvironment
);
/**
 * Performs a default build and then zips the result into a bundle
 */
exports.zip = gulp.series(
	pdel([DIST])
	, gulp.parallel(
		buildSource(false, false)
		, outputLanguages()
		, outputTemplates()
		, outputStylesCSS()
		, outputMetaFiles()
	)
	, compressDistribution()
	, pdel([DIST])
);
/**
 * Sets up a file watch on the project to detect any file changes and automatically rebuild those components.
 */
exports.watch = function () {
	exports.default();
	gulp.watch(SOURCE + GLOB, gulp.series(pdel(DIST + SOURCE), buildSource(true, false)));
	gulp.watch(LANG + GLOB, gulp.series(pdel(DIST + LANG), outputLanguages()));
	gulp.watch(TEMPLATES + GLOB, gulp.series(pdel(DIST + TEMPLATES), outputTemplates()));
	gulp.watch(CSS + GLOB, gulp.series(pdel(DIST + CSS), outputStylesCSS()));
	gulp.watch(['../LICENSE', 'README.md', 'CHANGELOG.md', 'system.json', 'template.json'], outputMetaFiles());
}
/**
 * Sets up a file watch on the project to detect any file changes and automatically rebuild those components, and then copy them to the Development Environment.
 */
exports.devWatch = function () {
	const devDist = DEV_DIST();
	exports.dev();
	gulp.watch(SOURCE + GLOB, gulp.series(plog('deleting: ' + devDist + SOURCE + GLOB), pdel(devDist + SOURCE + GLOB, { force: true }), buildSource(true, false, devDist), plog('sources done.')));
	gulp.watch(LANG + GLOB, gulp.series(pdel(devDist + LANG + GLOB, { force: true }), outputLanguages(devDist), plog('langs done.')));
	gulp.watch(TEMPLATES + GLOB, gulp.series(pdel(devDist + TEMPLATES + GLOB, { force: true }), outputTemplates(devDist), plog('templates done.')));
	gulp.watch(CSS + GLOB, gulp.series(pdel(devDist + CSS + GLOB, { force: true }), outputStylesCSS(devDist), plog('css done.')));
	gulp.watch(['../LICENSE', 'README.md', 'CHANGELOG.md', 'system.json', 'template.json'], gulp.series(outputMetaFiles(devDist), plog('metas done.')));
}
