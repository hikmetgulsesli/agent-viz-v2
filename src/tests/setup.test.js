import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..', '..');

describe('Project Setup Tests', () => {
  describe('File Structure', () => {
    it('should have index.html with Google Fonts', () => {
      const indexPath = path.join(rootDir, 'index.html');
      assert.ok(fs.existsSync(indexPath), 'index.html should exist');
      
      const content = fs.readFileSync(indexPath, 'utf-8');
      assert.ok(content.includes('Space+Grotesk'), 'Should include Space Grotesk font');
      assert.ok(content.includes('DM+Sans'), 'Should include DM Sans font');
      assert.ok(content.includes('data-theme="dark"'), 'Should have dark theme by default');
    });

    it('should have .env.example with VITE_OPENCLAW_WS_URL', () => {
      const envPath = path.join(rootDir, '.env.example');
      assert.ok(fs.existsSync(envPath), '.env.example should exist');
      
      const content = fs.readFileSync(envPath, 'utf-8');
      assert.ok(content.includes('VITE_OPENCLAW_WS_URL'), 'Should have VITE_OPENCLAW_WS_URL placeholder');
    });

    it('should have .gitignore with required entries', () => {
      const gitignorePath = path.join(rootDir, '.gitignore');
      assert.ok(fs.existsSync(gitignorePath), '.gitignore should exist');
      
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      assert.ok(content.includes('.env'), 'Should ignore .env files');
      assert.ok(content.includes('node_modules'), 'Should ignore node_modules');
      assert.ok(content.includes('dist'), 'Should ignore dist folder');
    });

    it('should have design tokens CSS file', () => {
      const tokensPath = path.join(rootDir, 'src', 'styles', 'tokens.css');
      assert.ok(fs.existsSync(tokensPath), 'tokens.css should exist');
      
      const content = fs.readFileSync(tokensPath, 'utf-8');
      assert.ok(content.includes('--primary:'), 'Should have primary color token');
      assert.ok(content.includes('--surface:'), 'Should have surface color token');
      assert.ok(content.includes('--font-heading:'), 'Should have font-heading token');
      assert.ok(content.includes('--font-body:'), 'Should have font-body token');
    });
  });

  describe('Package.json', () => {
    it('should have required scripts', async () => {
      const pkgPath = path.join(rootDir, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      
      assert.ok(pkg.scripts.build, 'Should have build script');
      assert.ok(pkg.scripts.dev, 'Should have dev script');
      assert.ok(pkg.scripts.test, 'Should have test script');
      assert.ok(pkg.scripts.typecheck, 'Should have typecheck script');
    });

    it('should have lucide-react dependency', () => {
      const pkgPath = path.join(rootDir, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      
      assert.ok(pkg.dependencies['lucide-react'], 'Should have lucide-react dependency');
    });
  });

  describe('TypeScript Configuration', () => {
    it('should have tsconfig files', () => {
      const tsconfigPath = path.join(rootDir, 'tsconfig.json');
      const tsconfigAppPath = path.join(rootDir, 'tsconfig.app.json');
      
      assert.ok(fs.existsSync(tsconfigPath), 'tsconfig.json should exist');
      assert.ok(fs.existsSync(tsconfigAppPath), 'tsconfig.app.json should exist');
    });
  });
});
