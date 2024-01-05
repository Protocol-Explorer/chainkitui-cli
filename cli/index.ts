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
  .version('0.0.2')
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
  const componentsPath = path.join(__dirname, '..', '..', 'components');

  try {
    const components = fs.readdirSync(componentsPath).filter(file => file.endsWith('.tsx'));

    if (components.length === 0) {
      logger.warn("No components found in the components directory.");
      return;
    }

    const userSrcPath = path.join(process.cwd(), 'src');
    if (!fs.existsSync(userSrcPath)) {
      logger.error('src directory not found. A src directory is required.');
      return;
    }

    const userComponentsPath = path.join(userSrcPath, 'components');
    if (!fs.existsSync(userComponentsPath)) {
      fs.mkdirSync(userComponentsPath);
      logger.info('Created components directory in src.');
    }

    const userWeb3UiPath = path.join(userComponentsPath, 'web3ui');
    if (!fs.existsSync(userWeb3UiPath)) {
      fs.mkdirSync(userWeb3UiPath);
      logger.info('Created web3ui directory in components.');
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'component',
        message: 'Which component would you like to add?',
        choices: components,
      },
    ]);

    const componentPath = path.join(componentsPath, answers.component);
    const destinationPath = path.join(userWeb3UiPath, answers.component);

    fs.copyFileSync(componentPath, destinationPath);
    logger.success(`Component ${answers.component} added to your project.`);
  } catch (error) {
    //@ts-ignore
    logger.error("Error processing components:", error.message);
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
