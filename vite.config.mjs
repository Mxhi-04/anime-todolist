import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyAssetsPlugin() {
  return {
    name: 'copy-assets-plugin',
    closeBundle() {
      const srcDir = path.resolve(__dirname, 'assets');
      const destDir = path.resolve(__dirname, 'dist/assets');
      if (fs.existsSync(srcDir)) {
        fs.cpSync(srcDir, destDir, { recursive: true, force: true });
      }
    }
  };
}

export default defineConfig({
  plugins: [copyAssetsPlugin()],
  build: {
    outDir: 'dist'
  }
});
