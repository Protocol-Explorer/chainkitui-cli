import fs from 'fs-extra';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = path.join(__dirname, 'components');
const destDir = path.join(__dirname, 'dist', 'components');

fs.copySync(srcDir, destDir);
