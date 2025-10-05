#!/usr/bin/env tsx
/**
 * Script 3: Replace Common Color Defaults in Function Parameters
 * 
 * Handles default parameter colors like:
 * - color = "#3b82f6" → color = colorTokens.blue[500]
 * - fill = "#111827" → fill = colorTokens.gray[900]
 * 
 * MEDIUM CONFIDENCE - Checks function/component parameter defaults
 */

import { Project, SyntaxKind } from 'ts-morph';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HEX_TO_TOKEN: Record<string, string> = {
  '#3b82f6': 'colorTokens.blue[500]',
  '#2563eb': 'colorTokens.blue[600]',
  '#1e3a8a': 'colorTokens.blue[900]',
  '#111827': 'colorTokens.gray[900]',
  '#1f2937': 'colorTokens.gray[800]',
  '#6b7280': 'colorTokens.gray[500]',
  '#fbbf24': 'colorTokens.amber[400]',
  '#f59e0b': 'colorTokens.amber[500]',
  '#047857': 'colorTokens.emerald[700]',
  '#10b981': 'colorTokens.emerald[500]',
  '#dc2626': 'colorTokens.red[600]',
  '#ef4444': 'colorTokens.red[500]',
};

interface Replacement {
  file: string;
  line: number;
  parameterName: string;
  original: string;
  replacement: string;
  functionName: string;
}

function findColorDefaults(filePath: string, project: Project): Replacement[] {
  const sourceFile = project.getSourceFile(filePath);
  if (!sourceFile) return [];

  const replacements: Replacement[] = [];

  // Find all function declarations and arrow functions
  sourceFile.forEachDescendant((node) => {
    if (
      node.isKind(SyntaxKind.FunctionDeclaration) ||
      node.isKind(SyntaxKind.ArrowFunction) ||
      node.isKind(SyntaxKind.FunctionExpression)
    ) {
      const parameters = node.getParameters();

      parameters.forEach((param) => {
        const initializer = param.getInitializer();
        if (initializer && initializer.isKind(SyntaxKind.StringLiteral)) {
          const value = initializer.getLiteralText();
          const normalized = value.toLowerCase();

          if (HEX_TO_TOKEN[normalized]) {
            const paramName = param.getName();
            const functionNode = param.getParent();
            let functionName = 'anonymous';

            if (functionNode) {
              if (functionNode.isKind(SyntaxKind.FunctionDeclaration)) {
                functionName = functionNode.getName() || 'anonymous';
              } else if (functionNode.isKind(SyntaxKind.ArrowFunction)) {
                const parent = functionNode.getParent();
                if (parent && parent.isKind(SyntaxKind.VariableDeclaration)) {
                  functionName = parent.getName();
                }
              }
            }

            replacements.push({
              file: filePath,
              line: param.getStartLineNumber(),
              parameterName: paramName,
              original: value,
              replacement: HEX_TO_TOKEN[normalized],
              functionName,
            });
          }
        }
      });
    }
  });

  return replacements;
}

function calculateImportPath(filePath: string): string {
  const parts = filePath.split('/');
  const srcIndex = parts.indexOf('src');
  if (srcIndex === -1) return '../../design-system/tokens';
  
  const depth = parts.length - srcIndex - 2;
  return '../'.repeat(depth) + 'design-system/tokens';
}

function hasColorTokensImport(sourceFile: any): boolean {
  const imports = sourceFile.getImportDeclarations();
  return imports.some((imp: any) => {
    const moduleSpecifier = imp.getModuleSpecifierValue();
    return moduleSpecifier.includes('design-system/tokens');
  });
}

function addColorTokensImport(sourceFile: any, importPath: string): void {
  if (hasColorTokensImport(sourceFile)) return;

  const lastImport = sourceFile.getImportDeclarations().slice(-1)[0];
  const importStatement = `import { colorTokens } from "${importPath}";`;

  if (lastImport) {
    sourceFile.insertText(lastImport.getEnd(), '\n' + importStatement);
  } else {
    sourceFile.insertText(0, importStatement + '\n');
  }
}

async function main() {
  const projectRoot = resolve(__dirname, '../..');
  const project = new Project({
    tsConfigFilePath: resolve(projectRoot, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false,
  });

  project.addSourceFilesAtPaths('src/**/*.{ts,tsx}');

  const sourceFiles = project.getSourceFiles()
    .filter(sf => {
      const path = sf.getFilePath();
      return (path.endsWith('.tsx') || path.endsWith('.ts')) &&
             !path.includes('.test.') &&
             !path.includes('node_modules');
    });

  console.log(`🔍 Scanning ${sourceFiles.length} files for color parameter defaults...\n`);

  const allReplacements: Replacement[] = [];
  const fileReplacements = new Map<string, Replacement[]>();

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    const replacements = findColorDefaults(filePath, project);

    if (replacements.length > 0) {
      allReplacements.push(...replacements);
      fileReplacements.set(filePath, replacements);
    }
  }

  console.log(`📊 Found ${allReplacements.length} color defaults across ${fileReplacements.size} files\n`);

  fileReplacements.forEach((replacements, filePath) => {
    const shortPath = filePath.replace(projectRoot, '');
    console.log(`\n📁 ${shortPath} (${replacements.length} matches)`);
    replacements.forEach(r => {
      console.log(`   Line ${r.line}: ${r.functionName}(${r.parameterName} = ${r.original})`);
      console.log(`   → ${r.parameterName} = ${r.replacement}`);
    });
  });

  console.log(`\n\n💡 DRY RUN COMPLETE`);
  console.log(`\nTo apply these changes, run with --apply flag\n`);

  if (process.argv.includes('--apply')) {
    console.log(`\n🚀 APPLYING CHANGES...\n`);

    for (const [filePath, replacements] of fileReplacements) {
      const sourceFile = project.getSourceFile(filePath);
      if (!sourceFile) continue;

      // Add import
      const importPath = calculateImportPath(filePath);
      addColorTokensImport(sourceFile, importPath);

      // Replace defaults
      replacements.forEach(r => {
        const parameters = sourceFile.getDescendantsOfKind(SyntaxKind.Parameter);
        parameters.forEach(param => {
          if (param.getName() === r.parameterName && param.getStartLineNumber() === r.line) {
            const initializer = param.getInitializer();
            if (initializer) {
              initializer.replaceWithText(r.replacement);
            }
          }
        });
      });

      await sourceFile.save();
      console.log(`   ✅ ${filePath.replace(projectRoot, '')}`);
    }

    console.log(`\n✨ Applied ${allReplacements.length} replacements\n`);
  }
}

main().catch(console.error);
