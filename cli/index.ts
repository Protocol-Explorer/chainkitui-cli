#!/usr/bin/env node

import * as path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import inquirer from 'inquirer';
import * as fs from 'fs';
import figlet from 'figlet';
import chalk from 'chalk';
import { execSync } from 'child_process';
import ora from 'ora';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.clear();
console.log(chalk.green(figlet.textSync('ChainKitUI', { horizontalLayout: 'full' })));

const program = new Command();

program
  .version('0.0.3')
  .description('CLI tool to copy React components for Web3');

async function mainMenu() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'Build new project from templates',
        'Add components to existing projects',
        'Exit'
      ],
    },
  ]);

  switch (answers.action) {
    case 'Build new project from templates':
      console.log('Coming soon...');
      break;
    case 'Add components to existing projects':
      await addComponentsMenu();
      break;
    case 'Exit':
      console.log('Goodbye!');
      process.exit(0);
  }
}

async function addComponentsMenu() {
  const componentsDistPath = path.join(__dirname, '..', 'components');

  try {
    const projectRoot = process.cwd();
    const componentJsonPath = path.join(projectRoot, 'components.json');
    if (!fs.existsSync(componentJsonPath)) {
      logger.error('component.json file not found. Ensure it exists in the root of your project.');
      return;
    }

    let componentJson = JSON.parse(fs.readFileSync(componentJsonPath, 'utf-8'));
    let componentsDirPath;
    let web3ComponentsDirPath: any;

    // Check if the components directory is specified; use it to define web3Components path
    if (componentJson.aliases && componentJson.aliases.components) {
      componentsDirPath = path.join(projectRoot, componentJson.aliases.components.replace('@/', ''));
      web3ComponentsDirPath = path.join(componentsDirPath, 'web3Components');
    } else {
      logger.error('Components directory alias not found in component.json.');
      return;
    }

    // Ensure the web3Components directory exists
    if (!fs.existsSync(web3ComponentsDirPath)) {
      fs.mkdirSync(web3ComponentsDirPath, { recursive: true });
      logger.info(`Created web3Components directory at ${web3ComponentsDirPath}.`);
      
      // Update component.json with web3Components alias if not already specified
      if (!componentJson.aliases.web3Components) {
        componentJson.aliases.web3Components = "@/components/web3Components";
        fs.writeFileSync(componentJsonPath, JSON.stringify(componentJson, null, 2));
        logger.info('web3Components directory added to component.json.');
      }
    }

    const components = fs.readdirSync(componentsDistPath).filter(file => file.endsWith('.tsx'));
    if (components.length === 0) {
      logger.warn("No components found in the distribution's components directory.");
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedComponents',
        message: 'Which component(s) would you like to add?',
        choices: components
      }
    ]);

    if (answers.selectedComponents.length === 0) {
      logger.warn("No components selected. Exiting.");
      return;
    }

    answers.selectedComponents.forEach((componentName: string) => {
      const componentToCopyPath = path.join(componentsDistPath, componentName);
      const destinationPath = path.join(web3ComponentsDirPath, componentName);

      fs.copyFileSync(componentToCopyPath, destinationPath);
      logger.success(`Component ${componentName} successfully added to your project under web3Components.`);
    });
  } catch (error) {
    logger.error(`Error processing components: ${error}`);
  }
}




function ensureEthersDependency() {
  const endUserPackageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(endUserPackageJsonPath)) {
    logger.warn('No package.json found. Please ensure you are in the root of your project.');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(endUserPackageJsonPath, 'utf-8'));
  const ethersVersion = packageJson.dependencies.ethers || packageJson.devDependencies.ethers;

  if (ethersVersion !== '5.7.2') {
    const spinner = ora('Installing dependency: ethers@5.7.2...').start();
    try {
      execSync('npm install ethers@5.7.2', { stdio: 'pipe' });
      spinner.succeed('ethers@5.7.2 installed successfully.');
    } catch (error) {
      spinner.fail('Failed to install ethers@5.7.2. Please install it manually.');
      logger.error('Installation error:', error);
    }
  } else {
    logger.info('ethers@5.7.2 is already installed.');
  }
}

mainMenu();