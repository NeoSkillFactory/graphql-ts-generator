/**
 * GraphQL TypeScript Generator - Type Generator
 * Core logic for transforming GraphQL schema to TypeScript types
 */
import { GraphQLSchema, GraphQLOutputType, GraphQLInputType } from 'graphql';
export interface GeneratorOptions {
    namespace?: string;
    prefix?: string;
    skipEnums?: boolean;
    skipUnions?: boolean;
    schemaName?: string;
}
export interface GeneratedFile {
    filename: string;
    content: string;
}
/**
 * Main generator class
 */
export declare class TypeGenerator {
    private schema;
    private options;
    private generatedTypes;
    private outputLines;
    constructor(schema: GraphQLSchema, options?: GeneratorOptions);
    /**
     * Generate all TypeScript types from schema
     */
    generate(): GeneratedFile[];
    /**
     * Add file header
     */
    private addHeader;
    /**
     * Generate enum types
     */
    private generateEnums;
    /**
     * Generate a single enum
     */
    private generateEnum;
    /**
     * Generate object and interface types (skipping Query/Mutation/Subscription root types
     * since they contain field arguments that don't map cleanly to interfaces)
     */
    private generateObjectTypes;
    /**
     * Generate a single object or interface type
     */
    private generateObjectType;
    /**
     * Convert GraphQL type to TypeScript type string.
     * Properly handles nested NonNull and List wrappers.
     *
     * GraphQL wrapping examples:
     *   String       → string | null
     *   String!      → string
     *   [String]     → (string | null)[] | null
     *   [String!]    → string[] | null
     *   [String!]!   → string[]
     *   [String]!    → (string | null)[]
     */
    typeToString(graphqlType: GraphQLOutputType | GraphQLInputType): string;
    private convertType;
    private convertInner;
    private namedTypeToString;
    /**
     * Generate input object types
     */
    private generateInputTypes;
    /**
     * Generate a single input type
     */
    private generateInputType;
    /**
     * Generate union types
     */
    private generateUnions;
    /**
     * Generate a single union type
     */
    private generateUnion;
    /**
     * Apply prefix to a type name
     */
    private prefixName;
    /**
     * Get output filename
     */
    private getOutputFilename;
}
/**
 * Get output directory for generated files
 */
export declare function getOutputDir(outputPath: string): string;
//# sourceMappingURL=generator.d.ts.map