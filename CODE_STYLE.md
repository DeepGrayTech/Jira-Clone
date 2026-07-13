# Code Style Guide

## Comment Rules

### External Code Exemption
**Rule**: Third-party imported code (external libraries, packages, or SDKs) does NOT require comments.

**Examples of exempt code**:
- Import statements from external packages: `import { useState } from 'react'`
- Third-party library functions: `import { v4 as uuidv4 } from 'uuid'`
- SDK initialization code
- Configuration code for external services

**Rationale**: External code is maintained by third parties and typically has its own documentation. Adding redundant comments to external code imports would add noise without providing value.

### Internal Code Requirement
**Rule**: All internally written code MUST be properly documented with JSDoc-style comments.

**Required documentation**:
- Module-level comments at the top of each file
- Interface/type definitions
- Function declarations with `@param`, `@returns`, and `@throws` tags where applicable
- Complex logic with inline comments
- State variables in React components

### Comment Format
Use JSDoc-style comments for all internal code:

```typescript
/**
 * Description of the function's purpose.
 * @param paramName - Description of parameter
 * @returns Description of return value
 */
function myFunction(paramName: string): boolean {
  // Implementation
}
```