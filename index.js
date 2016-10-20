"use strict";

let childProcess = require("child_process"),
	path = require("path"),
	fs = require("fs");

// For some packages executable name is not the same as package name
// For example our package is called nativescript, but the executable name is called "tns".
let executableName = "mobile-cli-lib",
	packageName = "mobile-cli-lib",
	platform = process.platform;

if (platform === "win32") {
	// Solution 1:
	// Construct the path to the package.
	let whereResult = (childProcess.execSync(`where ${executableName}`) || '').toString(),
		pathToExecutable = whereResult.split('\n')[0].trim(),
		pathToLib = path.join(path.dirname(pathToExecutable), "node_modules", packageName);

	console.log(`Path to ${executableName} is ${pathToLib}`);
	console.log(require(pathToLib));

	// Solution 2:
	// Find where npm packages are installed globally, set the NODE_PATH directory to points there and this way require will work directly.
	let npmConfigPrefix = childProcess.execSync("npm.cmd config get prefix").toString().trim();
	let nodePath = path.join(npmConfigPrefix, "node_modules"),
		opts = { env: { NODE_PATH: nodePath }};

	// Require should be in a separate process after we set the NODE_PATH variable.
	let childProc = childProcess.spawn(process.execPath, ["node-path.js", packageName], opts);
	childProc.stdout.on("data", d => console.log(d.toString()));
	childProc.stderr.on("data", d => console.log(d.toString()));
	childProc.on("error", d => console.log(d.toString()));

} else if (platform === "linux") {
	// There are two ways to find where's the global directory for package installation:

	// First one is to get it from npm config:
	let npmConfigPrefix = childProcess.execSync("npm config get prefix").toString().trim();

	// On linux the path is:
	let globalNodeModulesDir = path.join(npmConfigPrefix, "lib", "node_modules");
	let pathToLib = path.join(globalNodeModulesDir, packageName);

	console.log(`Path to ${executableName} is ${pathToLib}`);
	console.log("Result when path is constructed via npm confg:", require(pathToLib));

	// Second way to find it is to use the result of which command
	// It will give path to the executable, which is a symlink in fact, so we can get the full path from it:

	let whichResult = childProcess.execSync("which mobile-cli-lib").toString().trim(),
		lsLResult = childProcess.execSync("ls -l `which mobile-cli-lib`").toString().trim();

	let regex = new RegExp(`${whichResult}\\s+\-\>\\s+(.*?)$`);

	let match = lsLResult.match(regex);
	if (match && match[1]) {
		let pathToRealExecutable = path.join(path.dirname(whichResult), match[1]),
			pathToGlobalNodeModulesDir = pathToRealExecutable.match(new RegExp(`(.*?${path.join("node_modules", packageName)}).*$`))[1];

		console.log("Result when path is constructed with which and ls command", require(pathToGlobalNodeModulesDir));
	}

	// No matter how we construct the path to global node_modules dir, we can use it to set NODE_PATH environment variable
	// After that we can start new process and we'll be able to require our module.
	let nodePath = globalNodeModulesDir,
		opts = { env: { NODE_PATH: nodePath }};

	let childProc = childProcess.spawn(process.execPath, ["node-path.js", packageName], opts);
	childProc.stdout.on("data", d => console.log(d.toString()));
	childProc.stderr.on("data", d => console.log(d.toString()));
	childProc.on("error", d => console.log(d.toString()));

} else if (platform === "darwin") {

} else {
	throw new Error(`Unknow platform: ${platform}`);
}

// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders

