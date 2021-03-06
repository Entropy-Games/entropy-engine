const { exec } = require('child_process');
const fs = require('fs');

const packageConf = JSON.parse(fs.readFileSync('./package.json').toString());
const version = packageConf['version'];

function run (cmd) {
	return new Promise(resolve => {
		exec(cmd, resolve);
	});
}

const WP_LOG_FILE = 'webpack-log.txt';

(async () => {
	const start = Date.now();

	await run (`touch ${WP_LOG_FILE}`);
	await run(`webpack > ${WP_LOG_FILE}`);

	await run(`cp build/${version}.js build/latest.js`);
	fs.writeFileSync('build/latest.js',
		fs.readFileSync('build/latest.js').toString().replace(`${version}.js.map`, 'latest.js.map'));
	await run(`cp build/${version}.js.map build/latest.js.map`);

	if (process.argv.includes('--stable')) {
		await run(`cp build/${version}.js build/stable.js`);
		fs.writeFileSync('build/stable.js',
			fs.readFileSync('build/stable.js').toString().replace(`${version}.js.map`, 'stable.js.map'));
		await run(`cp build/${version}.js.map build/stable.js.map`);
	}

	console.log(fs.readFileSync(WP_LOG_FILE).toString());

	await run (`rm ${WP_LOG_FILE}`);

	const licenseFile = `build/${version}.js.LICENSE.txt`;
	if (fs.existsSync(licenseFile)) {
		await run (`rm ./${licenseFile}`);
	}

	console.log(`Compiled and bundled in ${Date.now() - start}ms`);
})();