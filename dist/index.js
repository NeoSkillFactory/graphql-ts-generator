#!/usr/bin/env node
"use strict";
/**
 * GraphQL TypeScript Generator - CLI Entry Point
 * Converts GraphQL schemas to TypeScript types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const fs_1 = require("fs");
const path_1 = require("path");
const cli_1 = require("./cli");
const generator_1 = require("./generator");
async function main() {
    const config = (0, cli_1.parseArgs)();
    if (config.help) {
        (0, cli_1.printHelp)();
        process.exit(0);
    }
    if (config.version) {
        (0, cli_1.printVersion)();
        process.exit(0);
    }
    (0, cli_1.validateConfig)(config);
    const schemas = (0, cli_1.loadSchemas)(config.schemaPaths);
    if (schemas.length === 0) {
        console.error('Error: No valid schemas to process');
        process.exit(1);
    }
    const outputDir = (0, generator_1.getOutputDir)(config.outputDir);
    if (!(0, fs_1.existsSync)(outputDir)) {
        (0, fs_1.mkdirSync)(outputDir, { recursive: true });
    }
    for (const { schema, name } of schemas) {
        console.log(`Processing schema: ${name}`);
        const generator = new generator_1.TypeGenerator(schema, {
            namespace: config.namespace,
            prefix: config.prefix,
            skipEnums: config.skipEnums,
            skipUnions: config.skipUnions,
            schemaName: name
        });
        const files = generator.generate();
        for (const file of files) {
            const outputPath = (0, path_1.join)(outputDir, file.filename);
            (0, fs_1.writeFileSync)(outputPath, file.content, 'utf-8');
            console.log(`  Generated: ${outputPath}`);
        }
    }
    console.log(`\nDone. Generated ${schemas.length} schema(s) to ${outputDir}`);
}
main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
});
//# sourceMappingURL=index.js.map