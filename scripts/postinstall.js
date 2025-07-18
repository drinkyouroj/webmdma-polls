#!/usr/bin/env node

import { copyFileSync, existsSync } from 'fs';
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
};

console.log(`${colors.bright}${colors.blue}=== WebMDMA Polls Setup ===${colors.reset}\n`);

// Check if .env.local exists, if not create it from .env.example
const envExamplePath = join(process.cwd(), '.env.example');
const envLocalPath = join(process.cwd(), '.env.local');

if (!existsSync(envLocalPath) && existsSync(envExamplePath)) {
  console.log(`${colors.cyan}Creating .env.local from .env.example...${colors.reset}`);
  copyFileSync(envExamplePath, envLocalPath);
  console.log(`${colors.green}✓ Created .env.local${colors.reset}`);
  console.log(`${colors.yellow}⚠ Don't forget to update your Supabase credentials in .env.local${colors.reset}\n`);
}

console.log(`${colors.bright}Next steps:${colors.reset}`);
console.log(`${colors.cyan}1. Update your Supabase credentials in .env.local${colors.reset}`);
console.log(`${colors.cyan}2. Run the SQL migration in your Supabase project${colors.reset}`);
console.log(`${colors.cyan}3. Start the development server with: npm run dev${colors.reset}\n`);

console.log(`${colors.bright}${colors.green}Setup complete! Happy polling!${colors.reset}`);