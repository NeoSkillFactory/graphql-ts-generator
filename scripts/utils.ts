/**
 * GraphQL TypeScript Generator - Utilities
 * Provides GraphQL schema parsing utilities
 */

import { parse, buildASTSchema, GraphQLSchema } from 'graphql';
import { readFileSync, existsSync } from 'fs';

/**
 * Read and parse a GraphQL schema file
 */
export function loadSchema(schemaPath: string): GraphQLSchema {
  if (!existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const schemaText = readFileSync(schemaPath, 'utf-8');
  return buildASTSchema(parse(schemaText));
}

/**
 * Check if a type is a built-in scalar
 */
export function isBuiltInScalar(typeName: string): boolean {
  const builtIns = ['Int', 'Float', 'String', 'Boolean', 'ID'];
  return builtIns.includes(typeName);
}

/**
 * Format document comment for TypeScript
 */
export function formatDescription(description?: string | null): string {
  if (!description) return '';
  const lines = description.trim().split('\n');
  if (lines.length === 1) {
    return `/** ${lines[0]} */`;
  }
  const comment = lines.map(line => ` * ${line}`).join('\n');
  return `/**\n${comment}\n */`;
}
