/**
 * GraphQL TypeScript Generator - Utilities
 * Provides GraphQL schema parsing utilities
 */
import { GraphQLSchema } from 'graphql';
/**
 * Read and parse a GraphQL schema file
 */
export declare function loadSchema(schemaPath: string): GraphQLSchema;
/**
 * Check if a type is a built-in scalar
 */
export declare function isBuiltInScalar(typeName: string): boolean;
/**
 * Format document comment for TypeScript
 */
export declare function formatDescription(description?: string | null): string;
//# sourceMappingURL=utils.d.ts.map