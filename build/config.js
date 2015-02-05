
var srcPath = '../src';
var dstPath = '../dist';

exports.COPYRIGHT = '/**\n' +
                    ' * Copyright (C) 2015 Jan Marsch\n' +
                    ' * @kekscom\n' +
                    ' */\n';

exports.VERSION = '0.1.0';

exports.srcFiles = [
  srcPath + '/prefix.js',
  srcPath + '/shortcuts.js',
  srcPath + '/../node_modules/color/dist/Color.debug.js',
  srcPath + '/variables.js',
  srcPath + '/geometry.js',
  srcPath + '/functions.js',
  srcPath + '/GeoJSON.js',
  srcPath + '/Data.js',
  srcPath + '/geometry/Line3.js',
  srcPath + '/layers/Features.js',
  srcPath + '/layers/Shadows.js',
  srcPath + '/layers/Debug.js',
  srcPath + '/Layers.js',
  srcPath + '/adapter.js',
  srcPath + '/engines/{engine}.js',
  srcPath + '/public.js',
  srcPath + '/suffix.js'
];

exports.dstFiles = {
  debug:    dstPath + '/L.Lines3.debug.js',
  minified: dstPath + '/L.Lines3.js',
  gzipped:  dstPath + '/L.Lines3.js.gz'
};

exports.engines = ['Leaflet'];

exports.jshint = {
	"browser": true,
	"node": true,
	"predef": ["L"],
//"unused": true,

	"debug": false,
	"devel": false,

	"es5": false,
	"strict": false,
	"globalstrict": false,

	"asi": false,
	"laxbreak": false,
	"bitwise": false,
	"boss": false,
	"curly": false,
	"eqnull": false,
	"evil": false,
	"expr": false,
	"forin": true,
	"immed": true,
	"latedef": true,
	"loopfunc": false,
	"noarg": true,
	"regexp": true,
	"regexdash": false,
	"scripturl": false,
	"shadow": false,
	"supernew": false,
	"undef": true,
	"funcscope": false,

	"newcap": true,
	"noempty": true,
	"nonew": true,
	"nomen": false,
	"onevar": false,
	"plusplus": false,
	"sub": false,
//"indent": 4,

	"eqeqeq": true,
//"trailing": true,
//"white": false,
	"smarttabs": true
};

exports.closure = {
  compilation_level: 'SIMPLE_OPTIMIZATIONS'	// WHITESPACE_ONLY, ADVANCED_OPTIMIZATIONS, SIMPLE_OPTIMIZATIONS
};
