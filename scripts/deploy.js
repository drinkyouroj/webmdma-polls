#!/usr/bin/env node

import { execSync } from 'child_process';
import { createInterface } from 'readline';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`${colors.bright}${colors.blue}=== WebMDMA Polls Deployment Helper ===${colors.reset}\n`);

// Check if .env.local exists with Supabase credentials
const envLocalPath = join(process.cwd(), '.env.local');
if (!existsSync(envLocalPath)) {
  console.log(`${colors.red}Error: .env.local file not found!${colors.reset}`);
  console.log(`${colors.yellow}Please create a .env.local file with your Supabase credentials before deploying.${colors.reset}`);
  rl.close();
  process.exit(1);
}

// Check if the build directory exists, if not, run the build command
const distPath = join(process.cwd(), 'dist');
if (!existsSync(distPath)) {
  console.log(`${colors.cyan}Building the application...${colors.reset}`);
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Build completed successfully${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Error during build process. Please fix the errors and try again.${colors.reset}`);
    rl.close();
    process.exit(1);
  }
}

// Ask which platform to deploy to
console.log(`\n${colors.bright}Select a deployment platform:${colors.reset}`);
console.log(`${colors.cyan}1. Netlify${colors.reset}`);
console.log(`${colors.cyan}2. Vercel${colors.reset}`);
console.log(`${colors.cyan}3. GitHub Pages${colors.reset}`);
console.log(`${colors.cyan}4. Custom (Manual deployment)${colors.reset}`);

rl.question(`\n${colors.yellow}Enter your choice (1-4): ${colors.reset}`, (answer) => {
  switch (answer) {
    case '1':
      deployToNetlify();
      break;
    case '2':
      deployToVercel();
      break;
    case '3':
      deployToGitHubPages();
      break;
    case '4':
      manualDeployment();
      break;
    default:
      console.log(`${colors.red}Invalid choice. Exiting.${colors.reset}`);
      rl.close();
  }
});

function deployToNetlify() {
  console.log(`\n${colors.bright}${colors.blue}Deploying to Netlify...${colors.reset}`);
  
  // Check if Netlify CLI is installed
  try {
    execSync('netlify --version', { stdio: 'ignore' });
  } catch (error) {
    console.log(`${colors.yellow}Netlify CLI not found. Installing...${colors.reset}`);
    try {
      execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    } catch (error) {
      console.log(`${colors.red}Failed to install Netlify CLI. Please install it manually with 'npm install -g netlify-cli'${colors.reset}`);
      rl.close();
      return;
    }
  }
  
  console.log(`${colors.cyan}Running Netlify deploy command...${colors.reset}`);
  try {
    execSync('netlify deploy', { stdio: 'inherit' });
    console.log(`\n${colors.green}✓ Deployment initiated through Netlify CLI${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Error during Netlify deployment.${colors.reset}`);
  }
  
  rl.close();
}

function deployToVercel() {
  console.log(`\n${colors.bright}${colors.blue}Deploying to Vercel...${colors.reset}`);
  
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch (error) {
    console.log(`${colors.yellow}Vercel CLI not found. Installing...${colors.reset}`);
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
    } catch (error) {
      console.log(`${colors.red}Failed to install Vercel CLI. Please install it manually with 'npm install -g vercel'${colors.reset}`);
      rl.close();
      return;
    }
  }
  
  console.log(`${colors.cyan}Running Vercel deploy command...${colors.reset}`);
  try {
    execSync('vercel', { stdio: 'inherit' });
    console.log(`\n${colors.green}✓ Deployment initiated through Vercel CLI${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Error during Vercel deployment.${colors.reset}`);
  }
  
  rl.close();
}

function deployToGitHubPages() {
  console.log(`\n${colors.bright}${colors.blue}Deploying to GitHub Pages...${colors.reset}`);
  
  // Check if gh-pages package is installed
  const packageJsonPath = join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.devDependencies || !packageJson.devDependencies['gh-pages']) {
    console.log(`${colors.yellow}gh-pages package not found. Installing...${colors.reset}`);
    try {
      execSync('npm install --save-dev gh-pages', { stdio: 'inherit' });
      
      // Update package.json with gh-pages scripts
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.predeploy = "npm run build";
      packageJson.scripts.deploy = "gh-pages -d dist";
      
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`${colors.green}✓ Added gh-pages scripts to package.json${colors.reset}`);
    } catch (error) {
      console.log(`${colors.red}Failed to install gh-pages. Please install it manually with 'npm install --save-dev gh-pages'${colors.reset}`);
      rl.close();
      return;
    }
  }
  
  console.log(`${colors.cyan}Running GitHub Pages deploy command...${colors.reset}`);
  try {
    execSync('npm run deploy', { stdio: 'inherit' });
    console.log(`\n${colors.green}✓ Successfully deployed to GitHub Pages${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Error during GitHub Pages deployment.${colors.reset}`);
  }
  
  rl.close();
}

function manualDeployment() {
  console.log(`\n${colors.bright}${colors.blue}Manual Deployment Instructions:${colors.reset}`);
  console.log(`${colors.cyan}1. The built files are in the 'dist' directory${colors.reset}`);
  console.log(`${colors.cyan}2. Upload all files from the 'dist' directory to your web server${colors.reset}`);
  console.log(`${colors.cyan}3. Ensure your web server is configured to handle client-side routing${colors.reset}`);
  console.log(`${colors.cyan}   - For Apache: Use the .htaccess file in the dist directory${colors.reset}`);
  console.log(`${colors.cyan}   - For Nginx: Configure try_files to redirect to index.html${colors.reset}`);
  console.log(`\n${colors.yellow}Note: Remember to set up your environment variables on your hosting provider!${colors.reset}`);
  
  rl.close();
}