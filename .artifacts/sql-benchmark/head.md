## SQL Benchmark Report

- Project: `arcade-main`
- Collection: `0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4`
- Generated: `2026-02-22T22:08:19.338Z`
- Warmup: `1`
- Iterations: `5`

| Operation | p50 (ms) | p95 (ms) | mean (ms) |
| --- | ---: | ---: | ---: |
| listCollectionTokens:first-page | 2305.36 | 3123.66 | 2435.99 |
| listCollectionTokens:next-page | 1082.47 | 1826.39 | 1276.49 |
| listCollectionTokens:attribute-filters | 237.76 | 283.47 | 243.15 |
| getCollectionOrders | 283.2 | 329.6 | 286.87 |
| listCollectionListings:verifyOwnership=false | 275.41 | 349.91 | 292.25 |
| fetchTraitValues:beast id | 228.59 | 264.28 | 236.25 |