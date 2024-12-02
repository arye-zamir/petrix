# Petrix

Ultra-lightweight, extensible HTTP client. More details coming soon.

## Installation

```bash
npm install petrix
# or
pnpm add petrix
# or
yarn add petrix
```

## Quick Start

```typescript
import Petrix from "petrix";

const client = new Petrix();
const data = await client.get("https://api.example.com/data");
```
