"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = __importStar(require("node:assert"));
const graphql_1 = require("graphql");
const generator_1 = require("./generator");
const utils_1 = require("./utils");
const cli_1 = require("./cli");
const path_1 = require("path");
function buildSchema(sdl) {
    return (0, graphql_1.buildASTSchema)((0, graphql_1.parse)(sdl));
}
function generate(sdl, options = {}) {
    const schema = buildSchema(sdl);
    const gen = new generator_1.TypeGenerator(schema, options);
    const files = gen.generate();
    return files[0].content;
}
// ── Utils ──
(0, node_test_1.describe)('isBuiltInScalar', () => {
    (0, node_test_1.it)('recognizes built-in scalars', () => {
        assert.ok((0, utils_1.isBuiltInScalar)('Int'));
        assert.ok((0, utils_1.isBuiltInScalar)('Float'));
        assert.ok((0, utils_1.isBuiltInScalar)('String'));
        assert.ok((0, utils_1.isBuiltInScalar)('Boolean'));
        assert.ok((0, utils_1.isBuiltInScalar)('ID'));
    });
    (0, node_test_1.it)('rejects custom types', () => {
        assert.ok(!(0, utils_1.isBuiltInScalar)('DateTime'));
        assert.ok(!(0, utils_1.isBuiltInScalar)('User'));
        assert.ok(!(0, utils_1.isBuiltInScalar)('JSON'));
    });
});
(0, node_test_1.describe)('formatDescription', () => {
    (0, node_test_1.it)('returns empty string for null/undefined', () => {
        assert.strictEqual((0, utils_1.formatDescription)(null), '');
        assert.strictEqual((0, utils_1.formatDescription)(undefined), '');
        assert.strictEqual((0, utils_1.formatDescription)(''), '');
    });
    (0, node_test_1.it)('formats single-line description', () => {
        assert.strictEqual((0, utils_1.formatDescription)('Hello'), '/** Hello */');
    });
    (0, node_test_1.it)('formats multi-line description', () => {
        const result = (0, utils_1.formatDescription)('Line 1\nLine 2');
        assert.ok(result.includes('/**'));
        assert.ok(result.includes(' * Line 1'));
        assert.ok(result.includes(' * Line 2'));
        assert.ok(result.includes(' */'));
    });
});
// ── CLI ──
(0, node_test_1.describe)('parseArgs', () => {
    (0, node_test_1.it)('parses schema file path', () => {
        const config = (0, cli_1.parseArgs)(['schema.graphql']);
        assert.deepStrictEqual(config.schemaPaths, ['schema.graphql']);
        assert.strictEqual(config.outputDir, 'dist');
    });
    (0, node_test_1.it)('parses output flag', () => {
        const config = (0, cli_1.parseArgs)(['-o', 'types', 'schema.graphql']);
        assert.strictEqual(config.outputDir, 'types');
    });
    (0, node_test_1.it)('parses prefix flag', () => {
        const config = (0, cli_1.parseArgs)(['-p', 'Api', 'schema.graphql']);
        assert.strictEqual(config.prefix, 'Api');
    });
    (0, node_test_1.it)('parses skip flags', () => {
        const config = (0, cli_1.parseArgs)(['--skip-enums', '--skip-unions', 'schema.graphql']);
        assert.ok(config.skipEnums);
        assert.ok(config.skipUnions);
    });
    (0, node_test_1.it)('parses help flag', () => {
        const config = (0, cli_1.parseArgs)(['--help']);
        assert.ok(config.help);
    });
    (0, node_test_1.it)('parses version flag', () => {
        const config = (0, cli_1.parseArgs)(['-v']);
        assert.ok(config.version);
    });
    (0, node_test_1.it)('throws on unknown option', () => {
        assert.throws(() => (0, cli_1.parseArgs)(['--unknown']), /Unknown option/);
    });
    (0, node_test_1.it)('throws on missing output arg', () => {
        assert.throws(() => (0, cli_1.parseArgs)(['-o']), /Missing output directory/);
    });
    (0, node_test_1.it)('parses multiple schema files', () => {
        const config = (0, cli_1.parseArgs)(['a.graphql', 'b.graphql']);
        assert.deepStrictEqual(config.schemaPaths, ['a.graphql', 'b.graphql']);
    });
});
(0, node_test_1.describe)('validateConfig', () => {
    (0, node_test_1.it)('throws when no schema files specified', () => {
        const config = (0, cli_1.parseArgs)([]);
        assert.throws(() => (0, cli_1.validateConfig)(config), /No schema files/);
    });
    (0, node_test_1.it)('throws when schema file does not exist', () => {
        const config = (0, cli_1.parseArgs)(['/nonexistent/schema.graphql']);
        assert.throws(() => (0, cli_1.validateConfig)(config), /not found/);
    });
    (0, node_test_1.it)('skips validation for help', () => {
        const config = (0, cli_1.parseArgs)(['--help']);
        assert.doesNotThrow(() => (0, cli_1.validateConfig)(config));
    });
});
// ── Generator: Scalar types ──
(0, node_test_1.describe)('TypeGenerator scalars', () => {
    (0, node_test_1.it)('maps GraphQL scalars to TypeScript primitives', () => {
        const output = generate(`
      type Query {
        intField: Int
        floatField: Float
        stringField: String
        boolField: Boolean
        idField: ID
      }
    `);
        assert.ok(output.includes('intField: number | null'));
        assert.ok(output.includes('floatField: number | null'));
        assert.ok(output.includes('stringField: string | null'));
        assert.ok(output.includes('boolField: boolean | null'));
        assert.ok(output.includes('idField: string | null'));
    });
    (0, node_test_1.it)('handles non-null scalars', () => {
        const output = generate(`
      type Query {
        name: String!
        count: Int!
      }
    `);
        assert.ok(output.includes('name: string;'));
        assert.ok(output.includes('count: number;'));
        assert.ok(!output.includes('name: string | null'));
    });
    (0, node_test_1.it)('handles custom scalars as named types', () => {
        const output = generate(`
      scalar DateTime
      type Query {
        createdAt: DateTime!
      }
    `);
        assert.ok(output.includes('createdAt: DateTime;'));
    });
});
// ── Generator: Lists and nullability ──
(0, node_test_1.describe)('TypeGenerator lists', () => {
    (0, node_test_1.it)('handles [String!]! (non-null list of non-null strings)', () => {
        const output = generate(`
      type Query { tags: [String!]! }
    `);
        assert.ok(output.includes('tags: string[];'));
    });
    (0, node_test_1.it)('handles [String] (nullable list of nullable strings)', () => {
        const output = generate(`
      type Query { tags: [String] }
    `);
        assert.ok(output.includes('tags: (string | null)[] | null'));
    });
    (0, node_test_1.it)('handles [String!] (nullable list of non-null strings)', () => {
        const output = generate(`
      type Query { tags: [String!] }
    `);
        assert.ok(output.includes('tags: string[] | null'));
    });
    (0, node_test_1.it)('handles [String]! (non-null list of nullable strings)', () => {
        const output = generate(`
      type Query { tags: [String]! }
    `);
        assert.ok(output.includes('tags: (string | null)[];'));
    });
});
// ── Generator: Enums ──
(0, node_test_1.describe)('TypeGenerator enums', () => {
    (0, node_test_1.it)('generates enum declarations', () => {
        const output = generate(`
      enum Status { ACTIVE INACTIVE }
      type Query { status: Status }
    `);
        assert.ok(output.includes('export enum Status {'));
        assert.ok(output.includes('ACTIVE = "ACTIVE"'));
        assert.ok(output.includes('INACTIVE = "INACTIVE"'));
    });
    (0, node_test_1.it)('skips enums when skipEnums is true', () => {
        const output = generate(`
      enum Status { ACTIVE INACTIVE }
      type Query { status: Status }
    `, { skipEnums: true });
        assert.ok(!output.includes('export enum Status'));
    });
});
// ── Generator: Object types and interfaces ──
(0, node_test_1.describe)('TypeGenerator object types', () => {
    (0, node_test_1.it)('generates interfaces for object types', () => {
        const output = generate(`
      type User {
        id: ID!
        name: String!
        email: String
      }
      type Query { user: User }
    `);
        assert.ok(output.includes('export interface User {'));
        assert.ok(output.includes('id: string;'));
        assert.ok(output.includes('name: string;'));
        assert.ok(output.includes('email: string | null;'));
    });
    (0, node_test_1.it)('generates interfaces for GraphQL interfaces', () => {
        const output = generate(`
      interface Node { id: ID! }
      type User implements Node { id: ID!, name: String! }
      type Query { user: User }
    `);
        assert.ok(output.includes('export interface Node {'));
        assert.ok(output.includes('export interface User {'));
    });
});
// ── Generator: Input types ──
(0, node_test_1.describe)('TypeGenerator input types', () => {
    (0, node_test_1.it)('generates input type interfaces', () => {
        const output = generate(`
      input CreateUserInput {
        name: String!
        email: String!
        bio: String
      }
      type Query { ok: Boolean }
    `);
        assert.ok(output.includes('export interface CreateUserInput {'));
        assert.ok(output.includes('name: string;'));
        assert.ok(output.includes('bio: string | null;'));
    });
    (0, node_test_1.it)('marks fields with defaults as optional', () => {
        const output = generate(`
      input SearchInput {
        query: String!
        limit: Int = 20
      }
      type Query { ok: Boolean }
    `);
        assert.ok(output.includes('limit?: number | null'));
    });
});
// ── Generator: Unions ──
(0, node_test_1.describe)('TypeGenerator unions', () => {
    (0, node_test_1.it)('generates union types', () => {
        const output = generate(`
      type User { id: ID! }
      type Post { id: ID! }
      union SearchResult = User | Post
      type Query { search: SearchResult }
    `);
        assert.ok(output.includes('export type SearchResult = User | Post;'));
    });
    (0, node_test_1.it)('skips unions when skipUnions is true', () => {
        const output = generate(`
      type User { id: ID! }
      type Post { id: ID! }
      union SearchResult = User | Post
      type Query { search: SearchResult }
    `, { skipUnions: true });
        assert.ok(!output.includes('export type SearchResult'));
    });
});
// ── Generator: Prefix option ──
(0, node_test_1.describe)('TypeGenerator prefix', () => {
    (0, node_test_1.it)('applies prefix to all type names', () => {
        const output = generate(`
      enum Status { ACTIVE }
      type User { id: ID!, status: Status! }
      type Query { user: User }
    `, { prefix: 'Api' });
        assert.ok(output.includes('export enum ApiStatus'));
        assert.ok(output.includes('export interface ApiUser'));
        assert.ok(output.includes('status: ApiStatus;'));
    });
});
// ── Generator: Output filename ──
(0, node_test_1.describe)('TypeGenerator output', () => {
    (0, node_test_1.it)('uses schema name in output filename', () => {
        const schema = buildSchema('type Query { ok: Boolean }');
        const gen = new generator_1.TypeGenerator(schema, { schemaName: 'myApi' });
        const files = gen.generate();
        assert.strictEqual(files[0].filename, 'myApi.generated.ts');
    });
    (0, node_test_1.it)('defaults to types.generated.ts', () => {
        const schema = buildSchema('type Query { ok: Boolean }');
        const gen = new generator_1.TypeGenerator(schema);
        const files = gen.generate();
        assert.strictEqual(files[0].filename, 'types.generated.ts');
    });
    (0, node_test_1.it)('includes prefix in filename', () => {
        const schema = buildSchema('type Query { ok: Boolean }');
        const gen = new generator_1.TypeGenerator(schema, { prefix: 'Api', schemaName: 'test' });
        const files = gen.generate();
        assert.strictEqual(files[0].filename, 'Api_test.generated.ts');
    });
});
// ── Generator: Header ──
(0, node_test_1.describe)('TypeGenerator header', () => {
    (0, node_test_1.it)('includes auto-generated header', () => {
        const output = generate('type Query { ok: Boolean }');
        assert.ok(output.includes('Auto-generated TypeScript types'));
        assert.ok(output.includes('graphql-ts-generator'));
    });
});
// ── getOutputDir ──
(0, node_test_1.describe)('getOutputDir', () => {
    (0, node_test_1.it)('resolves relative paths to cwd', () => {
        const result = (0, generator_1.getOutputDir)('dist');
        assert.strictEqual(result, (0, path_1.join)(process.cwd(), 'dist'));
    });
    (0, node_test_1.it)('preserves absolute paths', () => {
        const result = (0, generator_1.getOutputDir)('/tmp/output');
        assert.strictEqual(result, '/tmp/output');
    });
});
// ── Integration: real schema files ──
(0, node_test_1.describe)('loadSchemas integration', () => {
    (0, node_test_1.it)('loads sample.graphql successfully', () => {
        const schemas = (0, cli_1.loadSchemas)(['references/sample.graphql']);
        assert.strictEqual(schemas.length, 1);
        assert.strictEqual(schemas[0].name, 'sample');
    });
    (0, node_test_1.it)('loads test-schema.graphql successfully', () => {
        const schemas = (0, cli_1.loadSchemas)(['references/test-schema.graphql']);
        assert.strictEqual(schemas.length, 1);
    });
    (0, node_test_1.it)('throws on non-existent file', () => {
        assert.throws(() => (0, cli_1.loadSchemas)(['nonexistent.graphql']), /not found/);
    });
});
(0, node_test_1.describe)('end-to-end generation', () => {
    (0, node_test_1.it)('generates valid output for sample.graphql', () => {
        const schemas = (0, cli_1.loadSchemas)(['references/sample.graphql']);
        const gen = new generator_1.TypeGenerator(schemas[0].schema, { schemaName: 'sample' });
        const files = gen.generate();
        assert.strictEqual(files.length, 1);
        const content = files[0].content;
        // Should have enums
        assert.ok(content.includes('export enum UserRole'));
        assert.ok(content.includes('export enum PostStatus'));
        // Should have object types
        assert.ok(content.includes('export interface User'));
        assert.ok(content.includes('export interface Post'));
        assert.ok(content.includes('export interface Query'));
        assert.ok(content.includes('export interface Mutation'));
    });
    (0, node_test_1.it)('generates valid output for test-schema.graphql', () => {
        const schemas = (0, cli_1.loadSchemas)(['references/test-schema.graphql']);
        const gen = new generator_1.TypeGenerator(schemas[0].schema, { schemaName: 'test_schema' });
        const files = gen.generate();
        const content = files[0].content;
        // Should have enums
        assert.ok(content.includes('export enum AccountStatus'));
        assert.ok(content.includes('export enum PostCategory'));
        assert.ok(content.includes('export enum SearchType'));
        // Should have interfaces
        assert.ok(content.includes('export interface Node'));
        assert.ok(content.includes('export interface User'));
        assert.ok(content.includes('export interface Comment'));
        assert.ok(content.includes('export interface Page'));
        assert.ok(content.includes('export interface PostMetadata'));
        // Should have input types
        assert.ok(content.includes('export interface CreateUserInput'));
        assert.ok(content.includes('export interface UpdateUserInput'));
        assert.ok(content.includes('export interface SearchInput'));
        // Should have union
        assert.ok(content.includes('export type SearchResult = User | Post | Comment | Page'));
    });
});
//# sourceMappingURL=generator.test.js.map