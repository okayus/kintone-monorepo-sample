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
  console.error('Usage: npm run create-customization <app-id> <project-name>');
  console.error('Example: npm run create-customization 2222 new-feature');
  process.exit(1);
}

const [appId, projectName] = args;

// Validate inputs
if (!/^\d+$/.test(appId)) {
  console.error('Error: App ID must be a number');
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(projectName)) {
  console.error('Error: Project name must contain only lowercase letters, numbers, and hyphens');
  process.exit(1);
}

// Convert project name to camelCase for variable names
const projectNameCamel = projectName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  .replace(/^[a-z]/, letter => letter.toUpperCase());

// Define paths
const projectRoot = path.resolve(__dirname, '..');
const targetDir = path.join(projectRoot, 'kintone', appId, projectName);
const templatesDir = path.join(projectRoot, 'templates', 'new-customization');
const kintoneCommonDir = path.join(projectRoot, 'kintone', 'kintone-common');

// Check if target directory already exists
if (fs.existsSync(targetDir)) {
  console.error(`Error: Directory ${targetDir} already exists`);
  process.exit(1);
}

// Ensure app ID directory exists (for workspaces)
const appDir = path.join(projectRoot, 'kintone', appId);
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

console.log(`Creating new customization project: ${appId}/${projectName}`);

// Create target directory
fs.mkdirSync(targetDir, { recursive: true });

// Copy and process template files
const templateFiles = ['package.json', 'vite.config.js', '.eslintignore.js', '.eslintrc.cjs.js', '.prettierrc.js'];

templateFiles.forEach(file => {
  const templatePath = path.join(templatesDir, file);
  let targetPath = path.join(targetDir, file);
  
  // Remove .js extension from config files
  if (file.endsWith('.js') && file !== 'vite.config.js') {
    targetPath = targetPath.replace('.js', '');
  }
  
  let content = fs.readFileSync(templatePath, 'utf8');
  
  // Replace placeholders
  content = content.replace(/{{APP_ID}}/g, appId);
  content = content.replace(/{{PROJECT_NAME}}/g, projectName);
  content = content.replace(/{{PROJECT_NAME_CAMEL}}/g, projectNameCamel);
  
  fs.writeFileSync(targetPath, content);
});

// Create directory structure
const dirs = ['src', 'src/modules', 'dist'];
dirs.forEach(dir => {
  fs.mkdirSync(path.join(targetDir, dir), { recursive: true });
});

// Create sample files
const sampleIndex = `import { KintoneSdk } from '@kintone-sample/common';
import { KintoneRestAPIClient } from '@kintone/rest-api-client';
import { getRecords } from './modules/sampleModule.js';

(() => {
  'use strict';

  kintone.events.on('app.record.detail.show', async (event) => {
    // Example: Using kintone global object directly
    const appId = kintone.app.getId();
    const recordId = kintone.app.record.getId();
    
    console.log('App ID:', appId, 'Record ID:', recordId);

    // Initialize KintoneRestAPIClient
    const client = new KintoneRestAPIClient();
    
    // Create KintoneSdk instance
    const sdk = new KintoneSdk(client);
    
    // Example: Using custom module with dependency injection
    try {
      await getRecords(event, sdk);
    } catch (error) {
      console.error('Failed to get records:', error);
    }
    
    return event;
  });
})();
`;

const sampleModule = `/**
 * Get records from kintone app using KintoneSdk
 * @param {object} event - kintone event object
 * @param {KintoneSdk} sdk - KintoneSdk instance
 */
export async function getRecords(event, sdk) {
  const result = await sdk.getRecords({ app: event.appId });
  console.log('Records retrieved:', result);
  
  return result;
}
`;

const sampleTest = `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecords } from './sampleModule.js';

// Mock KintoneRestAPIClient
vi.mock('@kintone/rest-api-client', () => ({
  KintoneRestAPIClient: vi.fn().mockImplementation(() => ({}))
}));

// Mock KintoneSdk
const mockGetRecords = vi.fn().mockResolvedValue({ records: [{ id: '1', record: { title: { value: 'Test' } } }] });

vi.mock('@kintone-sample/common', () => ({
  KintoneSdk: vi.fn().mockImplementation(() => ({
    getRecords: mockGetRecords
  })),
  setupKintoneMocks: vi.fn()
}));

describe('sampleModule', () => {
  beforeEach(() => {
    // テスト前にモックをリセット
    vi.clearAllMocks();
    
    // グローバルkintoneオブジェクトのモック
    global.kintone = {
      app: {
        getId: () => 1234,
        record: {
          getId: () => 5678
        }
      }
    };
  });

  it('should get records from kintone app', async () => {
    const mockEvent = { appId: 1234 };
    const mockSdk = {
      getRecords: mockGetRecords
    };
    
    const result = await getRecords(mockEvent, mockSdk);
    
    expect(mockSdk.getRecords).toHaveBeenCalledWith({ app: 1234 });
    expect(result).toEqual({ records: [{ id: '1', record: { title: { value: 'Test' } } }] });
  });
});
`;

const testSetup = `// Test setup file
// kintoneオブジェクトのモックは @kintone-sample/common/test-utils から使用してください
// setupKintoneMocks() を各テストファイルで呼び出してください
`;

// Write sample files
fs.writeFileSync(path.join(targetDir, 'src', 'index.js'), sampleIndex);
fs.writeFileSync(path.join(targetDir, 'src', 'modules', 'sampleModule.js'), sampleModule);
fs.writeFileSync(path.join(targetDir, 'src', 'modules', 'sampleModule.test.js'), sampleTest);
fs.writeFileSync(path.join(targetDir, 'vitest.setup.js'), testSetup);

// Create .gitignore
const gitignore = `node_modules/
dist/
*.log
.DS_Store
`;
fs.writeFileSync(path.join(targetDir, '.gitignore'), gitignore);

console.log('Building kintone-common...');

// Build kintone-common if needed
try {
  process.chdir(kintoneCommonDir);
  
  // Check if kintone-common has been built
  if (!fs.existsSync(path.join(kintoneCommonDir, 'dist'))) {
    console.log('Installing kintone-common dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('Building kintone-common...');
    execSync('npm run build', { stdio: 'inherit' });
  } else {
    console.log('kintone-common is already built');
  }
} catch (error) {
  console.error('Failed to build kintone-common:', error.message);
  process.exit(1);
}

// Return to project root and run npm install
process.chdir(projectRoot);
console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  
  // Install dependencies for the new project
  console.log(`Installing dependencies for ${appId}/${projectName}...`);
  process.chdir(targetDir);
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to install dependencies:', error.message);
  process.exit(1);
}

// Add the new project to workspaces
console.log('Adding project to workspaces...');
const rootPackageJsonPath = path.join(projectRoot, 'package.json');
const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
const workspacePath = `kintone/${appId}/${projectName}`;

if (!rootPackageJson.workspaces.includes(workspacePath)) {
  rootPackageJson.workspaces.push(workspacePath);
  // Sort workspaces for consistency
  rootPackageJson.workspaces.sort();
  fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2) + '\n');
  console.log('✅ Added to workspaces');
}

console.log(`
✅ Successfully created new customization project!

📁 Location: ${targetDir}

🚀 Next steps:
   cd kintone/${appId}/${projectName}
   npm run dev    # Start development with watch mode
   npm run build  # Build for production
   npm test       # Run tests

📝 Files created:
   - src/index.js (entry point)
   - src/modules/sampleModule.js (sample module)
   - src/modules/sampleModule.test.js (sample test)
   - package.json, vite.config.js (configuration)
   - .eslintrc.cjs, .eslintignore, .prettierrc (linting & formatting)
   - vitest.setup.js (test setup)

📦 The project is configured to use @kintone-sample/common
✅ Automatically added to npm workspaces
`);