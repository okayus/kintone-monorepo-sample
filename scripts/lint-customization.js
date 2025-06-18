#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const fixMode = args.includes('--fix');
const filteredArgs = args.filter(arg => arg !== '--fix');

if (filteredArgs.length < 2) {
  console.error('Usage: npm run lint <app-id> <project-name> [--fix]');
  console.error('Example: npm run lint 2222 new-feature');
  console.error('Example: npm run lint 2222 new-feature --fix');
  process.exit(1);
}

const [appId, projectName] = filteredArgs;

// Validate inputs
if (!/^\d+$/.test(appId)) {
  console.error('Error: App ID must be a number');
  process.exit(1);
}

// Define paths
const projectRoot = path.resolve(__dirname, '..');
const targetDir = path.join(projectRoot, 'kintone', appId, projectName);

// Check if target directory exists
if (!fs.existsSync(targetDir)) {
  console.error(`Error: Project ${appId}/${projectName} does not exist`);
  console.error(`Run 'npm run create-customization ${appId} ${projectName}' to create it first`);
  process.exit(1);
}

// Check if package.json exists
const packageJsonPath = path.join(targetDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error(`Error: No package.json found in ${targetDir}`);
  process.exit(1);
}

// Get package name from package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageName = packageJson.name;

const lintCommand = fixMode ? 'lint:fix' : 'lint';
console.log(`Running ${lintCommand} for ${appId}/${projectName}...`);
console.log('');

try {
  // Run lint command using npm workspaces
  execSync(`npm run ${lintCommand} -w ${packageName}`, { 
    stdio: 'inherit',
    cwd: projectRoot
  });
  
  console.log(`\n✅ Lint completed for ${appId}/${projectName}`);
} catch (error) {
  console.error(`\n❌ Lint failed for ${appId}/${projectName}`);
  console.error(error.message);
  process.exit(1);
}