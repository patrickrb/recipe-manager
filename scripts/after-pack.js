const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.default = async function(context) {
  const appOutDir = context.appOutDir;
  const appName = context.packager.appInfo.productFilename;

  // Determine the resources path based on platform
  let resourcesPath;
  if (context.electronPlatformName === 'darwin') {
    resourcesPath = path.join(appOutDir, `${appName}.app`, 'Contents', 'Resources', 'app');
  } else if (context.electronPlatformName === 'win32') {
    resourcesPath = path.join(appOutDir, 'resources', 'app');
  } else {
    resourcesPath = path.join(appOutDir, 'resources', 'app');
  }

  console.log('Installing production dependencies in:', resourcesPath);

  // Copy package.json and package-lock.json if they don't exist
  const packageJsonPath = path.join(resourcesPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    fs.copyFileSync(
      path.join(context.packager.projectDir, 'package.json'),
      packageJsonPath
    );
  }

  const packageLockPath = path.join(resourcesPath, 'package-lock.json');
  if (fs.existsSync(path.join(context.packager.projectDir, 'package-lock.json'))) {
    fs.copyFileSync(
      path.join(context.packager.projectDir, 'package-lock.json'),
      packageLockPath
    );
  }

  try {
    // Install production dependencies
    execSync('npm install --production --no-optional', {
      cwd: resourcesPath,
      stdio: 'inherit'
    });

    console.log('Dependencies installed successfully');
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    throw error;
  }
};
