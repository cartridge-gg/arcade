## SQL Benchmark Report

- Project: `arcade-main`
- Collection: `0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4`
- Generated: `2026-02-22T22:19:31.489Z`
- Warmup: `3`
- Iterations: `20`

| Operation | p50 (ms) | p95 (ms) | mean (ms) |
| --- | ---: | ---: | ---: |
| listCollectionTokens:first-page | 1161.59 | 1805.74 | 1213.35 |
| listCollectionTokens:next-page | 708.74 | 1746.92 | 921.41 |
| listCollectionTokens:attribute-filters | 218.48 | 243.64 | 222.7 |
| getCollectionOrders | 247.74 | 294.53 | 257.96 |
| listCollectionListings:verifyOwnership=false | 241.12 | 397.08 | 268.4 |
| fetchTraitValues:beast id | 218.07 | 224.44 | 219.1 |