import chalk from 'chalk';

const formatArgs = (args: unknown[]): string => args.map(arg => 
  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
).join(' ');

const logger = {
  error: (...args: unknown[]) => {
    console.log(chalk.red(formatArgs(args)));
  },
  warn: (...args: unknown[]) => {
    console.log(chalk.yellow(formatArgs(args)));
  },
  info: (...args: unknown[]) => {
    console.log(chalk.blue(formatArgs(args)));
  },
  success: (...args: unknown[]) => {
    console.log(chalk.green(formatArgs(args)));
  }
};

export default logger;
