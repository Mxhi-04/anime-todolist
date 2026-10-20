import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function copyAssetsPlugin() {
  return {
    name: 'copy-assets-plugin',
    closeBundle() {
      const baseDir = import.meta.dirname || process.cwd();
      const srcDir = path.resolve(baseDir, 'assets');
      const destDir = path.resolve(baseDir, 'dist/assets');
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
