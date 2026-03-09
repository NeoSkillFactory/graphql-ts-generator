# graphql-ts-generator

![Audit](https://img.shields.io/badge/audit%3A%20PASS-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![OpenClaw](https://img.shields.io/badge/OpenClaw-skill-orange)

> Automatically generates TypeScript types from GraphQL schema files with CLI integration for developers and AI agents.

## Features

- Convert GraphQL schema (.graphql, .gql) files to TypeScript interfaces and types
- Generate TypeScript enums, union types, and input types from GraphQL schemas
- Provide command-line interface for direct file processing
- Handle complex GraphQL types including unions, interfaces, enums, and input objects
- Validate GraphQL schemas before TypeScript generation
- Support batch processing of multiple schema files
- Proper nullability mapping for all GraphQL type combinations

## Configuration

- `-o, --output <dir>`: Output directory for generated TypeScript files (default: `dist`)
- `-p, --prefix <prefix>`: Prefix for generated type names
- `-n, --namespace <name>`: Wrap types in a namespace
- `--skip-enums`: Skip enum generation
- `--skip-unions`: Skip union type generation
- `-h, --help`: Show help message
- `-v, --version`: Show version number

## Quick Start
## Installation

```bash
npm install -g graphql-ts-generator
```

## GitHub

Source code: [github.com/NeoSkillFactory/graphql-ts-generator](https://github.com/NeoSkillFactory/graphql-ts-generator)

**Price suggestion:** $29 USD

## License

MIT © NeoSkillFactory
