# Petrix

Ultra-lightweight (1.5k gzipped, 64.3 kB unpacked), 0 dependencies, extensible HTTP client. More details coming soon.

## Installation

```bash
npm install petrix
# or
pnpm add petrix
# or
yarn add petrix
```

## CDN

You can include Petrix via a CDN:

#### jsDelivr

```html
<script src="https://cdn.jsdelivr.net/npm/petrix/dist/petrix.umd.min.js" />
```

#### unpkg

```html
<script src="https://unpkg.com/petrix/dist/petrix.umd.min.js" />
```

#### usage with CDN

```html
<script>
  const petrix = new Petrix.createClient()
  petrix.get('https://...').then((res) => {
    // use res.data
  })
</script>
```

## Quick Start

```typescript
import { createClient } from 'petrix' // 3.8k (gzipped: 1.5k)

const petrix = createClient()
const { data } = await petrix.get<ResponseData>('https://...')
```
