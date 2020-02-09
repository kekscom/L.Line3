
const fs = require('fs');
const Terser = require('terser');


//*****************************************************************************

const src = 'src';
const dist = 'dist';

const code = [
  `${src}/Color.debug.js`,
  `${src}/index.js`,
  `${src}/FeatureLayer.js`,
  `${src}/ShadowLayer.js`
];


//*****************************************************************************

function joinFiles (files) {
  if (!files.push) {
    files = [files];
  }
  return files.map(file => fs.readFileSync(file)).join('\n');
}


//*****************************************************************************

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}

const js = joinFiles( code.filter(item => /\.js$/.test(item)) );

fs.writeFileSync(`${dist}/L.Line3.js`, Terser.minify(js).code);
fs.writeFileSync(`${dist}/L.Line3.debug.js`, js);

fs.writeFileSync(`${dist}/index.html`, fs.readFileSync(`${src}/index.html`));