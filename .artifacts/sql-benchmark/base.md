## SQL Benchmark Report

- Project: `arcade-main`
- Collection: `0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4`
- Generated: `2026-02-22T22:11:34.845Z`
- Warmup: `1`
- Iterations: `5`

| Operation | p50 (ms) | p95 (ms) | mean (ms) |
| --- | ---: | ---: | ---: |
| listCollectionTokens:first-page | 1397.08 | 1825.89 | 1382.36 |
| listCollectionTokens:next-page | 900.35 | 1907.47 | 1267.8 |
| listCollectionTokens:attribute-filters | 226.51 | 229.62 | 225.88 |
| getCollectionOrders | 251.37 | 293.99 | 259.77 |
| listCollectionListings:verifyOwnership=false | 266.63 | 358.47 | 283.4 |
| fetchTraitValues:beast id | 232.37 | 250.3 | 233.41 |