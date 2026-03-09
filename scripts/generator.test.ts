import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { buildASTSchema, parse } from 'graphql';
import { TypeGenerator, getOutputDir } from './generator';
import { loadSchema, isBuiltInScalar, formatDescription } from './utils';
import { parseArgs, validateConfig, loadSchemas } from './cli';
import { join } from 'path';

function buildSchema(sdl: string) {
  return buildASTSchema(parse(sdl));
}

function generate(sdl: string, options = {}) {
  const schema = buildSchema(sdl);
  const gen = new TypeGenerator(schema, options);
  const files = gen.generate();
  return files[0].content;
}

// ── Utils ──

describe('isBuiltInScalar', () => {
  it('recognizes built-in scalars', () => {
    assert.ok(isBuiltInScalar('Int'));
    assert.ok(isBuiltInScalar('Float'));
    assert.ok(isBuiltInScalar('String'));
    assert.ok(isBuiltInScalar('Boolean'));
    assert.ok(isBuiltInScalar('ID'));
  });

  it('rejects custom types', () => {
    assert.ok(!isBuiltInScalar('DateTime'));
    assert.ok(!isBuiltInScalar('User'));
    assert.ok(!isBuiltInScalar('JSON'));
  });
});

describe('formatDescription', () => {
  it('returns empty string for null/undefined', () => {
    assert.strictEqual(formatDescription(null), '');
    assert.strictEqual(formatDescription(undefined), '');
    assert.strictEqual(formatDescription(''), '');
  });

  it('formats single-line description', () => {
    assert.strictEqual(formatDescription('Hello'), '/** Hello */');
  });

  it('formats multi-line description', () => {
    const result = formatDescription('Line 1\nLine 2');
    assert.ok(result.includes('/**'));
    assert.ok(result.includes(' * Line 1'));
    assert.ok(result.includes(' * Line 2'));
    assert.ok(result.includes(' */'));
  });
});

// ── CLI ──

describe('parseArgs', () => {
  it('parses schema file path', () => {
    const config = parseArgs(['schema.graphql']);
    assert.deepStrictEqual(config.schemaPaths, ['schema.graphql']);
    assert.strictEqual(config.outputDir, 'dist');
  });

  it('parses output flag', () => {
    const config = parseArgs(['-o', 'types', 'schema.graphql']);
    assert.strictEqual(config.outputDir, 'types');
  });

  it('parses prefix flag', () => {
    const config = parseArgs(['-p', 'Api', 'schema.graphql']);
    assert.strictEqual(config.prefix, 'Api');
  });

  it('parses skip flags', () => {
    const config = parseArgs(['--skip-enums', '--skip-unions', 'schema.graphql']);
    assert.ok(config.skipEnums);
    assert.ok(config.skipUnions);
  });

  it('parses help flag', () => {
    const config = parseArgs(['--help']);
    assert.ok(config.help);
  });

  it('parses version flag', () => {
    const config = parseArgs(['-v']);
    assert.ok(config.version);
  });

  it('throws on unknown option', () => {
    assert.throws(() => parseArgs(['--unknown']), /Unknown option/);
  });

  it('throws on missing output arg', () => {
    assert.throws(() => parseArgs(['-o']), /Missing output directory/);
  });

  it('parses multiple schema files', () => {
    const config = parseArgs(['a.graphql', 'b.graphql']);
    assert.deepStrictEqual(config.schemaPaths, ['a.graphql', 'b.graphql']);
  });
});

describe('validateConfig', () => {
  it('throws when no schema files specified', () => {
    const config = parseArgs([]);
    assert.throws(() => validateConfig(config), /No schema files/);
  });

  it('throws when schema file does not exist', () => {
    const config = parseArgs(['/nonexistent/schema.graphql']);
    assert.throws(() => validateConfig(config), /not found/);
  });

  it('skips validation for help', () => {
    const config = parseArgs(['--help']);
    assert.doesNotThrow(() => validateConfig(config));
  });
});

// ── Generator: Scalar types ──

describe('TypeGenerator scalars', () => {
  it('maps GraphQL scalars to TypeScript primitives', () => {
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

  it('handles non-null scalars', () => {
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

  it('handles custom scalars as named types', () => {
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

describe('TypeGenerator lists', () => {
  it('handles [String!]! (non-null list of non-null strings)', () => {
    const output = generate(`
      type Query { tags: [String!]! }
    `);
    assert.ok(output.includes('tags: string[];'));
  });

  it('handles [String] (nullable list of nullable strings)', () => {
    const output = generate(`
      type Query { tags: [String] }
    `);
    assert.ok(output.includes('tags: (string | null)[] | null'));
  });

  it('handles [String!] (nullable list of non-null strings)', () => {
    const output = generate(`
      type Query { tags: [String!] }
    `);
    assert.ok(output.includes('tags: string[] | null'));
  });

  it('handles [String]! (non-null list of nullable strings)', () => {
    const output = generate(`
      type Query { tags: [String]! }
    `);
    assert.ok(output.includes('tags: (string | null)[];'));
  });
});

// ── Generator: Enums ──

describe('TypeGenerator enums', () => {
  it('generates enum declarations', () => {
    const output = generate(`
      enum Status { ACTIVE INACTIVE }
      type Query { status: Status }
    `);
    assert.ok(output.includes('export enum Status {'));
    assert.ok(output.includes('ACTIVE = "ACTIVE"'));
    assert.ok(output.includes('INACTIVE = "INACTIVE"'));
  });

  it('skips enums when skipEnums is true', () => {
    const output = generate(`
      enum Status { ACTIVE INACTIVE }
      type Query { status: Status }
    `, { skipEnums: true });
    assert.ok(!output.includes('export enum Status'));
  });
});

// ── Generator: Object types and interfaces ──

describe('TypeGenerator object types', () => {
  it('generates interfaces for object types', () => {
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

  it('generates interfaces for GraphQL interfaces', () => {
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

describe('TypeGenerator input types', () => {
  it('generates input type interfaces', () => {
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

  it('marks fields with defaults as optional', () => {
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

describe('TypeGenerator unions', () => {
  it('generates union types', () => {
    const output = generate(`
      type User { id: ID! }
      type Post { id: ID! }
      union SearchResult = User | Post
      type Query { search: SearchResult }
    `);
    assert.ok(output.includes('export type SearchResult = User | Post;'));
  });

  it('skips unions when skipUnions is true', () => {
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

describe('TypeGenerator prefix', () => {
  it('applies prefix to all type names', () => {
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

describe('TypeGenerator output', () => {
  it('uses schema name in output filename', () => {
    const schema = buildSchema('type Query { ok: Boolean }');
    const gen = new TypeGenerator(schema, { schemaName: 'myApi' });
    const files = gen.generate();
    assert.strictEqual(files[0].filename, 'myApi.generated.ts');
  });

  it('defaults to types.generated.ts', () => {
    const schema = buildSchema('type Query { ok: Boolean }');
    const gen = new TypeGenerator(schema);
    const files = gen.generate();
    assert.strictEqual(files[0].filename, 'types.generated.ts');
  });

  it('includes prefix in filename', () => {
    const schema = buildSchema('type Query { ok: Boolean }');
    const gen = new TypeGenerator(schema, { prefix: 'Api', schemaName: 'test' });
    const files = gen.generate();
    assert.strictEqual(files[0].filename, 'Api_test.generated.ts');
  });
});

// ── Generator: Header ──

describe('TypeGenerator header', () => {
  it('includes auto-generated header', () => {
    const output = generate('type Query { ok: Boolean }');
    assert.ok(output.includes('Auto-generated TypeScript types'));
    assert.ok(output.includes('graphql-ts-generator'));
  });
});

// ── getOutputDir ──

describe('getOutputDir', () => {
  it('resolves relative paths to cwd', () => {
    const result = getOutputDir('dist');
    assert.strictEqual(result, join(process.cwd(), 'dist'));
  });

  it('preserves absolute paths', () => {
    const result = getOutputDir('/tmp/output');
    assert.strictEqual(result, '/tmp/output');
  });
});

// ── Integration: real schema files ──

describe('loadSchemas integration', () => {
  it('loads sample.graphql successfully', () => {
    const schemas = loadSchemas(['references/sample.graphql']);
    assert.strictEqual(schemas.length, 1);
    assert.strictEqual(schemas[0].name, 'sample');
  });

  it('loads test-schema.graphql successfully', () => {
    const schemas = loadSchemas(['references/test-schema.graphql']);
    assert.strictEqual(schemas.length, 1);
  });

  it('throws on non-existent file', () => {
    assert.throws(() => loadSchemas(['nonexistent.graphql']), /not found/);
  });
});

describe('end-to-end generation', () => {
  it('generates valid output for sample.graphql', () => {
    const schemas = loadSchemas(['references/sample.graphql']);
    const gen = new TypeGenerator(schemas[0].schema, { schemaName: 'sample' });
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

  it('generates valid output for test-schema.graphql', () => {
    const schemas = loadSchemas(['references/test-schema.graphql']);
    const gen = new TypeGenerator(schemas[0].schema, { schemaName: 'test_schema' });
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
