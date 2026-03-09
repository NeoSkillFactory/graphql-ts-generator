#!/usr/bin/env node
/**
 * GraphQL TypeScript Generator - CLI Entry Point
 * Converts GraphQL schemas to TypeScript types
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseArgs, validateConfig, loadSchemas, printHelp, printVersion } from './cli';
import { TypeGenerator, getOutputDir } from './generator';

async function main(): Promise<void> {
  const config = parseArgs();

  if (config.help) {
    printHelp();
    process.exit(0);
  }

  if (config.version) {
    printVersion();
    process.exit(0);
  }

  validateConfig(config);

  const schemas = loadSchemas(config.schemaPaths);

  if (schemas.length === 0) {
    console.error('Error: No valid schemas to process');
    process.exit(1);
  }

  const outputDir = getOutputDir(config.outputDir);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  for (const { schema, name } of schemas) {
    console.log(`Processing schema: ${name}`);

    const generator = new TypeGenerator(schema, {
      namespace: config.namespace,
      prefix: config.prefix,
      skipEnums: config.skipEnums,
      skipUnions: config.skipUnions,
      schemaName: name
    });

    const files = generator.generate();

    for (const file of files) {
      const outputPath = join(outputDir, file.filename);
      writeFileSync(outputPath, file.content, 'utf-8');
      console.log(`  Generated: ${outputPath}`);
    }
  }

  console.log(`\nDone. Generated ${schemas.length} schema(s) to ${outputDir}`);
}

main().catch((error: any) => {
  console.error('Error:', error.message);
  process.exit(1);
});

export { main };
