#!/usr/bin/env node

import * as path from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";
import inquirer from "inquirer";
import * as fs from "fs";
import figlet from "figlet";
import chalk from "chalk";
import { execSync } from "child_process";
import ora from "ora";
import logger from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.clear();
console.log(
  chalk.green(figlet.textSync("ChainKitUI", { horizontalLayout: "full" }))
);

const program = new Command();

program
  .version("0.0.3")
  .description("CLI tool to copy React components for Web3");

async function mainMenu() {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "Build new project from templates",
        "Add components to existing projects",
        "Exit",
      ],
    },
  ]);

  switch (answers.action) {
    case "Build new project from templates":
      console.log("Coming soon...");
      break;
    case "Add components to existing projects":
      await addComponentsMenu();
      break;
    case "Exit":
      console.log("Goodbye!");
      process.exit(0);
  }
}
async function addComponentsMenu() {
  // Assume your components are distributed in a similar structure
  const distComponentsPath = path.join(__dirname, "..", "components");

  try {
    // Attempt to read the components.json to find the components directory
    const projectRoot = process.cwd();
    const componentJsonPath = path.join(projectRoot, "components.json");
    if (!fs.existsSync(componentJsonPath)) {
      logger.error(
        "components.json file not found. Ensure it exists in the root of your project."
      );
      return;
    }

    const componentJson = JSON.parse(
      fs.readFileSync(componentJsonPath, "utf-8")
    );
    let componentsDirPath = ""; // This will store the actual path of the components directory

    if (componentJson.aliases && componentJson.aliases.components) {
      // Convert the alias to an actual path
      componentsDirPath = path.join(
        projectRoot,
        componentJson.aliases.components.replace("@/", "src/")
      );
    } else {
      logger.error(
        "The components directory alias is not defined in components.json."
      );
      return;
    }

    // Define the path for the web3Components directory within the components directory
    const web3ComponentsDirPath = path.join(
      componentsDirPath,
      "web3Components"
    );

    // Ensure the web3Components directory exists
    if (!fs.existsSync(web3ComponentsDirPath)) {
      fs.mkdirSync(web3ComponentsDirPath, { recursive: true });
      logger.info(
        `Created web3Components directory at ${web3ComponentsDirPath}.`
      );
    }

    // Get a list of available components to add
    const components = fs
      .readdirSync(distComponentsPath)
      .filter((file) => file.endsWith(".tsx"));
    if (components.length === 0) {
      logger.warn(
        "No components found in the distribution's components directory."
      );
      return;
    }

    // Prompt the user to select which component(s) to add
    const answers = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedComponents",
        message: "Which component(s) would you like to add?",
        choices: components,
      },
    ]);

    if (answers.selectedComponents.length === 0) {
      logger.warn("No components selected. Exiting.");
      return;
    }

    // Copy the selected component(s) to the web3Components directory
    answers.selectedComponents.forEach((componentName: string) => {
      const componentToCopyPath = path.join(distComponentsPath, componentName);
      const destinationPath = path.join(web3ComponentsDirPath, componentName);

      fs.copyFileSync(componentToCopyPath, destinationPath);
      logger.success(
        `Component ${componentName} successfully added to your project under web3Components.`
      );
    });

    // Check if TxnButton.tsx was among the selected components to add
    if (answers.selectedComponents.includes("TxnButton.tsx")) {
      logger.info(
        `Please update the import path for the 'Button' component in TxnButton.tsx according to the shadcn Button location to reflect its new location.`
      );
    }
  } catch (error) {
    logger.error(`Error processing components: ${error}`);
  }
}

function ensureEthersDependency() {
  const endUserPackageJsonPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(endUserPackageJsonPath)) {
    logger.warn(
      "No package.json found. Please ensure you are in the root of your project."
    );
    return;
  }

  const packageJson = JSON.parse(
    fs.readFileSync(endUserPackageJsonPath, "utf-8")
  );
  const ethersVersion =
    packageJson.dependencies.ethers || packageJson.devDependencies.ethers;

  if (ethersVersion !== "5.7.2") {
    const spinner = ora("Installing dependency: ethers@5.7.2...").start();
    try {
      execSync("npm install ethers@5.7.2", { stdio: "pipe" });
      spinner.succeed("ethers@5.7.2 installed successfully.");
    } catch (error) {
      spinner.fail(
        "Failed to install ethers@5.7.2. Please install it manually."
      );
      logger.error("Installation error:", error);
    }
  } else {
    logger.info("ethers@5.7.2 is already installed.");
  }
}

mainMenu();
