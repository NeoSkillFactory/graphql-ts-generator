---
name: graphql-ts-generator
description: Automatically generates TypeScript types from GraphQL schema files with CLI integration for developers and AI agents.
---

# GraphQL TypeScript Generator Skill

## Product Plan

### One-Sentence Description
Automatically generates TypeScript types from GraphQL schema files with CLI integration for developers and AI agents.

### Core Capabilities
- Convert GraphQL schema (.graphql, .gql) files to TypeScript interfaces and types
- Generate TypeScript enums, union types, and input types from GraphQL schemas
- Provide command-line interface for direct file processing
- Handle complex GraphQL types including unions, interfaces, enums, and input objects
- Validate GraphQL schemas before TypeScript generation
- Support batch processing of multiple schema files
- Proper nullability mapping for all GraphQL type combinations

### Out of Scope
- GraphQL server implementation
- Database schema management
- Runtime GraphQL client code generation
- Documentation generation beyond type definitions
- Custom code formatting beyond TypeScript standards
- Integration with specific frameworks (React, Angular, etc.)

### Trigger Scenarios
- "Generate TypeScript types from this GraphQL schema"
- "Create TypeScript interfaces from GraphQL schema file"
- "Convert .graphql file to TypeScript types"
- "Auto-generate types for my GraphQL API"
- "Generate client types from GraphQL schema"
- "Transform GraphQL schema to TypeScript"

### Required Resources
- **scripts/**: Contains the main TypeScript generation logic and CLI entry point
- **references/**: GraphQL schema examples and test cases
- **assets/**: CLI help text and TypeScript configuration

### Key Files
- **scripts/index.ts**: Main CLI entry point
- **scripts/generator.ts**: Core type generation logic (TypeGenerator class)
- **scripts/cli.ts**: Command-line argument parsing and validation
- **scripts/utils.ts**: Utility functions for GraphQL schema loading and formatting
- **scripts/generator.test.ts**: Comprehensive test suite
- **references/sample.graphql**: Example GraphQL schema for testing
- **references/test-schema.graphql**: Complex test case with unions, interfaces, input types
- **assets/tsconfig.json**: TypeScript configuration
- **assets/cli-help.txt**: CLI help text and usage examples

### Acceptance Criteria
- Skill correctly processes simple GraphQL schemas and generates valid TypeScript types
- Skill handles complex GraphQL features (unions, interfaces, enums, input types)
- CLI interface accepts schema file paths and outputs TypeScript files
- Error handling for invalid GraphQL schemas with non-zero exit codes
- All 44 tests pass covering scalars, lists, enums, unions, input types, and CLI parsing
- Generated TypeScript types are immediately usable in TypeScript projects

## Architecture Overview

### Directory Layout
```
├── scripts/
│   ├── index.ts             # CLI entry point
│   ├── generator.ts         # Type generation logic (TypeGenerator class)
│   ├── cli.ts               # Command-line argument parsing
│   ├── utils.ts             # GraphQL parsing utilities
│   └── generator.test.ts    # Test suite (44 tests)
├── references/
│   ├── sample.graphql       # Basic schema example
│   └── test-schema.graphql  # Complex test cases
├── assets/
│   ├── tsconfig.json        # TypeScript config
│   └── cli-help.txt         # CLI usage examples
├── package.json
└── tsconfig.json
```

### Scripts Design

#### `scripts/index.ts`
- Language: TypeScript
- Inputs: CLI arguments (schema file paths, options)
- Outputs: Generated TypeScript files in output directory
- Core Logic: Parses CLI args -> Loads schemas -> Calls TypeGenerator -> Writes output files

#### `scripts/generator.ts`
- Language: TypeScript
- Inputs: GraphQL schema (parsed via `graphql` library)
- Outputs: TypeScript source code as GeneratedFile[]
- Core Logic: TypeGenerator class with type transformation rules:
  - Scalar types -> TS primitives (Int->number, String->string, etc.)
  - Object types -> TS interfaces
  - Union types -> TS union type aliases
  - Enum types -> TS enums with string values
  - Input types -> TS interfaces with optional fields for defaults
  - Proper nullability: NonNull, List, and nested combinations

#### `scripts/cli.ts`
- Language: TypeScript
- Inputs: Raw command-line arguments
- Outputs: Parsed CLIConfig object and loaded schemas
- Core Logic: Argument parsing, file validation, schema loading

#### `scripts/utils.ts`
- Language: TypeScript
- Inputs: GraphQL schema file path or text
- Outputs: Parsed GraphQLSchema, formatting helpers
- Core Logic: Schema file loading, built-in scalar detection, JSDoc formatting

### Data Flow
1. CLI receives schema path(s) and options via arguments
2. `cli.ts` parses arguments and validates schema file paths exist
3. `utils.ts` reads and parses each schema file to a GraphQLSchema object
4. `generator.ts` TypeGenerator processes the schema type map
5. Generated TypeScript source is written to the output directory

### Integration Points

#### Agent Workflow Example:
1. User requests: "Generate types from schema at /docs/api.graphql"
2. Agent triggers CLI: `graphql-ts-generator /docs/api.graphql -o src/types`
3. CLI processes schema, writes generated .ts files
4. Agent presents generated files to user

#### CI/CD Integration:
```json
{
  "scripts": {
    "generate:types": "graphql-ts-generator schemas/api.graphql -o src/types"
  }
}
```

## Usage Instructions

### Installation
```bash
npm install -g graphql-ts-generator
```

### Basic Usage
```bash
# Generate types from a single schema file
graphql-ts-generator schema.graphql

# Specify output directory
graphql-ts-generator schema.graphql -o src/types

# Process multiple schema files
graphql-ts-generator schemas/users.graphql schemas/posts.graphql

# Add type name prefix
graphql-ts-generator schema.graphql -p Api
```

### Options
- `-o, --output <dir>`: Output directory for generated TypeScript files (default: `dist`)
- `-p, --prefix <prefix>`: Prefix for generated type names
- `-n, --namespace <name>`: Wrap types in a namespace
- `--skip-enums`: Skip enum generation
- `--skip-unions`: Skip union type generation
- `-h, --help`: Show help message
- `-v, --version`: Show version number

### Output
The generator produces TypeScript files containing:
- Interfaces for GraphQL object types and input types
- Type aliases for GraphQL unions
- Enums with string values for GraphQL enums
- Proper nullability handling (non-null fields, nullable fields with `| null`)

### Testing
```bash
npm test
```

Runs 44 tests covering CLI parsing, type generation for all GraphQL type kinds, nullability handling, prefix support, and end-to-end integration with real schema files.
