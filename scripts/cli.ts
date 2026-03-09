/**
 * GraphQL TypeScript Generator - CLI Parser
 * Handles command-line argument parsing and validation
 */

import { existsSync, lstatSync } from 'fs';
import { dirname, resolve } from 'path';
import { loadSchema } from './utils';
import { GraphQLSchema } from 'graphql';

export interface CLIConfig {
  schemaPaths: string[];
  outputDir: string;
  namespace?: string;
  prefix?: string;
  skipEnums?: boolean;
  skipUnions?: boolean;
  help: boolean;
  version: boolean;
}

export interface LoadedSchema {
  schema: GraphQLSchema;
  path: string;
  name: string;
}

const DEFAULT_OUTPUT_DIR = 'dist';
const HELP_TEXT = `
Usage: graphql-ts-generator [options] <schema-file>

Generate TypeScript types from GraphQL schema files.

Arguments:
  <schema-file>               One or more GraphQL schema file paths

Options:
  -o, --output <dir>         Output directory for generated files (default: dist)
  -n, --namespace <name>     Wrap types in a namespace
  -p, --prefix <prefix>      Prefix for generated type names
  --skip-enums               Skip enum generation
  --skip-unions              Skip union generation
  -h, --help                 Show this help message
  -v, --version              Show version number

Examples:
  graphql-ts-generator schema.graphql
  graphql-ts-generator -o types -n API schema.graphql
  graphql-ts-generator schemas/*.graphql
`;

const VERSION = '1.0.0';

/**
 * Parse command line arguments
 */
export function parseArgs(args?: string[]): CLIConfig {
  const argv = args ?? process.argv.slice(2);
  const config: CLIConfig = {
    schemaPaths: [],
    outputDir: DEFAULT_OUTPUT_DIR,
    help: false,
    version: false,
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    switch (arg) {
      case '-h':
      case '--help':
        config.help = true;
        return config;

      case '-v':
      case '--version':
        config.version = true;
        return config;

      case '-o':
      case '--output':
        if (i + 1 >= argv.length) {
          throw new Error('Missing output directory argument');
        }
        config.outputDir = argv[++i];
        break;

      case '-n':
      case '--namespace':
        if (i + 1 >= argv.length) {
          throw new Error('Missing namespace argument');
        }
        config.namespace = argv[++i];
        break;

      case '-p':
      case '--prefix':
        if (i + 1 >= argv.length) {
          throw new Error('Missing prefix argument');
        }
        config.prefix = argv[++i];
        break;

      case '--skip-enums':
        config.skipEnums = true;
        break;

      case '--skip-unions':
        config.skipUnions = true;
        break;

      default:
        if (arg.startsWith('-')) {
          throw new Error(`Unknown option: ${arg}`);
        }
        config.schemaPaths.push(arg);
        break;
    }
    i++;
  }

  return config;
}

/**
 * Validate CLI configuration
 */
export function validateConfig(config: CLIConfig): void {
  if (config.help || config.version) {
    return;
  }

  if (config.schemaPaths.length === 0) {
    throw new Error('No schema files specified. Use -h for help.');
  }

  for (const schemaPath of config.schemaPaths) {
    if (!existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    const stat = lstatSync(schemaPath);
    if (!stat.isFile()) {
      throw new Error(`Schema path is not a file: ${schemaPath}`);
    }
  }

  const outputDir = resolve(config.outputDir);
  try {
    dirname(outputDir);
  } catch {
    throw new Error(`Invalid output directory: ${config.outputDir}`);
  }
}

/**
 * Load and validate all schemas
 */
export function loadSchemas(schemaPaths: string[]): LoadedSchema[] {
  const schemas: LoadedSchema[] = [];

  for (const schemaPath of schemaPaths) {
    try {
      const schema = loadSchema(schemaPath);
      schemas.push({
        schema,
        path: schemaPath,
        name: getSchemaName(schemaPath)
      });
    } catch (error: any) {
      throw new Error(`Failed to load schema ${schemaPath}: ${error.message}`);
    }
  }

  return schemas;
}

/**
 * Extract schema name from file path
 */
function getSchemaName(filePath: string): string {
  const base = filePath.split('/').pop() || filePath.split('\\').pop() || 'schema';
  const name = base.replace(/\.[^/.]+$/, '');
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Print help message
 */
export function printHelp(): void {
  console.log(HELP_TEXT);
}

/**
 * Print version
 */
export function printVersion(): void {
  console.log(`graphql-ts-generator v${VERSION}`);
}

export { loadSchema };
