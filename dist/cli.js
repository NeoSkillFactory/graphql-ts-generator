"use strict";
/**
 * GraphQL TypeScript Generator - CLI Parser
 * Handles command-line argument parsing and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSchema = void 0;
exports.parseArgs = parseArgs;
exports.validateConfig = validateConfig;
exports.loadSchemas = loadSchemas;
exports.printHelp = printHelp;
exports.printVersion = printVersion;
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = require("./utils");
Object.defineProperty(exports, "loadSchema", { enumerable: true, get: function () { return utils_1.loadSchema; } });
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
function parseArgs(args) {
    const argv = args ?? process.argv.slice(2);
    const config = {
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
function validateConfig(config) {
    if (config.help || config.version) {
        return;
    }
    if (config.schemaPaths.length === 0) {
        throw new Error('No schema files specified. Use -h for help.');
    }
    for (const schemaPath of config.schemaPaths) {
        if (!(0, fs_1.existsSync)(schemaPath)) {
            throw new Error(`Schema file not found: ${schemaPath}`);
        }
        const stat = (0, fs_1.lstatSync)(schemaPath);
        if (!stat.isFile()) {
            throw new Error(`Schema path is not a file: ${schemaPath}`);
        }
    }
    const outputDir = (0, path_1.resolve)(config.outputDir);
    try {
        (0, path_1.dirname)(outputDir);
    }
    catch {
        throw new Error(`Invalid output directory: ${config.outputDir}`);
    }
}
/**
 * Load and validate all schemas
 */
function loadSchemas(schemaPaths) {
    const schemas = [];
    for (const schemaPath of schemaPaths) {
        try {
            const schema = (0, utils_1.loadSchema)(schemaPath);
            schemas.push({
                schema,
                path: schemaPath,
                name: getSchemaName(schemaPath)
            });
        }
        catch (error) {
            throw new Error(`Failed to load schema ${schemaPath}: ${error.message}`);
        }
    }
    return schemas;
}
/**
 * Extract schema name from file path
 */
function getSchemaName(filePath) {
    const base = filePath.split('/').pop() || filePath.split('\\').pop() || 'schema';
    const name = base.replace(/\.[^/.]+$/, '');
    return name.replace(/[^a-zA-Z0-9]/g, '_');
}
/**
 * Print help message
 */
function printHelp() {
    console.log(HELP_TEXT);
}
/**
 * Print version
 */
function printVersion() {
    console.log(`graphql-ts-generator v${VERSION}`);
}
//# sourceMappingURL=cli.js.map