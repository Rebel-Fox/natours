// build.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['frontend/main.js'],
  bundle: true,
  outfile: 'public/assets/bundle.js',
  sourcemap: true,
  minify: false
}).then(() => {
  console.log('✅ esbuild finished!');
}).catch(() => process.exit(1));
