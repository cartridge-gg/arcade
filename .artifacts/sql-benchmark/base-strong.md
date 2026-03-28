## SQL Benchmark Report

- Project: `arcade-main`
- Collection: `0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4`
- Generated: `2026-02-22T22:54:59.805Z`
- Warmup: `3`
- Iterations: `20`

| Operation | p50 (ms) | p95 (ms) | mean (ms) |
| --- | ---: | ---: | ---: |
| listCollectionTokens:first-page | 1511 | 2131.37 | 1664.16 |
| listCollectionTokens:next-page | 2063.57 | 4353.14 | 2490.77 |
| listCollectionTokens:attribute-filters | 256.68 | 280.82 | 256.39 |
| getCollectionOrders | 306.36 | 377.74 | 322.6 |
| listCollectionListings:verifyOwnership=false | 303.77 | 366.62 | 308.77 |
| fetchTraitValues:beast id | 248.23 | 304.83 | 256.03 |