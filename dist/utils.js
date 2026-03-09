"use strict";
/**
 * GraphQL TypeScript Generator - Utilities
 * Provides GraphQL schema parsing utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSchema = loadSchema;
exports.isBuiltInScalar = isBuiltInScalar;
exports.formatDescription = formatDescription;
const graphql_1 = require("graphql");
const fs_1 = require("fs");
/**
 * Read and parse a GraphQL schema file
 */
function loadSchema(schemaPath) {
    if (!(0, fs_1.existsSync)(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
    }
    const schemaText = (0, fs_1.readFileSync)(schemaPath, 'utf-8');
    return (0, graphql_1.buildASTSchema)((0, graphql_1.parse)(schemaText));
}
/**
 * Check if a type is a built-in scalar
 */
function isBuiltInScalar(typeName) {
    const builtIns = ['Int', 'Float', 'String', 'Boolean', 'ID'];
    return builtIns.includes(typeName);
}
/**
 * Format document comment for TypeScript
 */
function formatDescription(description) {
    if (!description)
        return '';
    const lines = description.trim().split('\n');
    if (lines.length === 1) {
        return `/** ${lines[0]} */`;
    }
    const comment = lines.map(line => ` * ${line}`).join('\n');
    return `/**\n${comment}\n */`;
}
//# sourceMappingURL=utils.js.map