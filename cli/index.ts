#!/usr/bin/env node

import * as path from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";
import inquirer from "inquirer";
import * as fs from "fs";
import figlet from "figlet";
import chalk from "chalk";
import { execSync, exec } from "child_process";
import ora from "ora";
import logger from "./utils/logger.js";
import { resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.clear();
console.log(
  chalk.green(figlet.textSync("ChainKitUI", { horizontalLayout: "full" }))
);

// ...

const program = new Command()
  .name("chainkit-ui")
  .description("add web3 components to your project");

program
  .version("0.0.3")
  .description("CLI tool to copy React components for Web3")
  .command("add <component>")
  .description("Add a specific component to your project")
  .action((component) => {
    addComponentsMenu(component);
  });

async function mainMenu() {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "Build a new Nextjs project using Shadcn template",
        "Add components to existing projects that uses Shadcn",
        "Exit",
      ],
    },
  ]);

  switch (answers.action) {
    case "Build a new Nextjs project using Shadcn template":
      await initializeProject();
      break;
    case "Add components to existing projects":
      await addComponentsMenu();
      break;
    case "Exit":
      console.log("Goodbye!");
      process.exit(0);
  }
}

async function initializeProject() {
  const projectName = "my-app"; // replace with your project name

  console.log("Creating a new Next.js project...");
  try {
    execSync(
      `npx create-next-app@latest ${projectName} --typescript --tailwind --eslint`,
      { stdio: "inherit" }
    );
  } catch (error) {
    console.error(`Error creating project: ${error}`);
    return;
  }

  console.log("Initializing shadcn-ui...");
  try {
    execSync(`npx shadcn-ui@latest init`, { stdio: "inherit" });
    await addComponentsMenu();
  } catch (error) {
    console.error(`Error initializing shadcn-ui: ${error}`);
    return;
  }

  console.log("Project initialized successfully.");
}

async function addComponentsMenu(componentName?: string) {
  const componentsPath = path.join(__dirname, "..", "..", "components");

  try {
    const components = fs
      .readdirSync(componentsPath)
      .filter((file) => file.endsWith(".tsx"));

    if (components.length === 0) {
      logger.warn("No components found in the components directory.");
      process.exit(0);
    }

    // Read and parse the component.json file
    const componentJson = JSON.parse(
      fs.readFileSync("component.json", "utf-8")
    );

    // Get the components alias and resolve it to an absolute path
    const userComponentsPath = resolve(
      process.cwd(),
      componentJson.aliases.components.replace("@/", "")
    );

    // Create the web3Components directory
    const userWeb3ComponentsPath = path.join(
      userComponentsPath,
      "web3Components"
    );
    if (!fs.existsSync(userWeb3ComponentsPath)) {
      fs.mkdirSync(userWeb3ComponentsPath);
      logger.info("Created web3Components directory in components.");
    }

    let componentsToCopy = componentName ? [componentName] : [];
    if (componentsToCopy.length === 0) {
      const answers = await inquirer.prompt([
        {
          type: "checkbox",
          name: "components",
          message: "Which components would you like to add?",
          choices: components,
        },
      ]);
      componentsToCopy = answers.components;
    }

    if (componentsToCopy.length === 0) {
      logger.warn("No components selected. Exiting.");
      process.exit(0);
    }

    componentsToCopy.forEach((componentToCopy) => {
      const componentPath = path.join(componentsPath, componentToCopy);
      const destinationPath = path.join(
        userWeb3ComponentsPath,
        componentToCopy
      );

      fs.copyFileSync(componentPath, destinationPath);
      logger.success(`Component ${componentToCopy} added to your project.`);
    });
  } catch (error) {
    //@ts-ignore
    logger.error("Error processing components:", error.message);
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
