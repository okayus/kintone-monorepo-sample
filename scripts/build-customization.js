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
  console.error('Usage: npm run build <app-id> <project-name>');
  console.error('Example: npm run build 2222 new-feature');
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

console.log(`Building ${appId}/${projectName}...`);

try {
  // Run build command using npm workspaces
  execSync(`npm run build -w ${packageName}`, { 
    stdio: 'inherit',
    cwd: projectRoot
  });
  
  // Check if build output exists
  const distDir = path.join(targetDir, 'dist');
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    console.log(`\n✅ Build completed successfully!`);
    console.log(`📁 Output files in ${distDir}:`);
    files.forEach(file => {
      const stats = fs.statSync(path.join(distDir, file));
      const size = (stats.size / 1024).toFixed(2);
      console.log(`   - ${file} (${size} KB)`);
    });
  }
} catch (error) {
  console.error(`\n❌ Build failed for ${appId}/${projectName}`);
  console.error(error.message);
  process.exit(1);
}