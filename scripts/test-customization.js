#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: npm run test <app-id> <project-name>');
  console.error('Example: npm run test 2222 new-feature');
  process.exit(1);
}

const [appId, projectName] = args;

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

console.log(`Running tests for ${appId}/${projectName}...`);
console.log('');

// Check if running in CI mode or with --run flag
const runOnce = process.argv.includes('--run') || process.env.CI;
const testCommand = runOnce ? 'npm test -- --run' : 'npm test';

try {
  // Run test command using npm workspaces
  execSync(`${testCommand} -w ${packageName}`, { 
    stdio: 'inherit',
    cwd: projectRoot
  });
  
  if (runOnce) {
    console.log(`\n✅ Tests completed for ${appId}/${projectName}`);
  }
} catch (error) {
  console.error(`\n❌ Tests failed for ${appId}/${projectName}`);
  console.error(error.message);
  process.exit(1);
}