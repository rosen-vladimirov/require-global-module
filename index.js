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
	let globalModulesDir = childProcess.execSync("npm.cmd config get prefix").toString().trim();
	let nodePath = path.join(globalModulesDir, "node_modules"),
		opts = { env: { NODE_PATH: nodePath }};

	// Require should be in a separate process after we set the NODE_PATH variable.
	let childProc = childProcess.spawn(process.execPath, ["node-path.js", packageName], opts);
	childProc.stdout.on("data", d => console.log(d.toString()));
	childProc.stderr.on("data", d => console.log(d.toString()));
	childProc.on("error", d => console.log(d.toString()));

} else if (platform === "linux") {
	

} else if (platform === "darwin") {

} else {
	throw new Error(`Unknow platform: ${platform}`);
}

// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders

