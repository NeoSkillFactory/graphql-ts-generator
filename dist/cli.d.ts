/**
 * GraphQL TypeScript Generator - CLI Parser
 * Handles command-line argument parsing and validation
 */
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
/**
 * Parse command line arguments
 */
export declare function parseArgs(args?: string[]): CLIConfig;
/**
 * Validate CLI configuration
 */
export declare function validateConfig(config: CLIConfig): void;
/**
 * Load and validate all schemas
 */
export declare function loadSchemas(schemaPaths: string[]): LoadedSchema[];
/**
 * Print help message
 */
export declare function printHelp(): void;
/**
 * Print version
 */
export declare function printVersion(): void;
export { loadSchema };
//# sourceMappingURL=cli.d.ts.map