## SQL Benchmark Report

- Project: `arcade-main`
- Collection: `0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4`
- Generated: `2026-02-23T00:27:59.247Z`
- Warmup: `1`
- Iterations: `5`

| Operation | p50 (ms) | p95 (ms) | mean (ms) |
| --- | ---: | ---: | ---: |
| getCollection | 253.98 | 413.37 | 283.07 |
| listCollectionTokens:first-page:eager | 1823.13 | 1980.78 | 1816.33 |
| listCollectionTokens:next-page:eager | 1825.4 | 1918.12 | 1731.14 |
| listCollectionTokens:attribute-filters:eager | 248.14 | 275.03 | 250.02 |
| listCollectionTokens:first-page:deferred | 269.44 | 292.5 | 271.49 |
| listCollectionTokens:next-page:deferred | 260.31 | 297.95 | 268.15 |
| listCollectionTokens:attribute-filters:deferred | 243.81 | 246.28 | 241.3 |
| getCollectionOrders | 274.84 | 283.34 | 273.81 |
| listCollectionListings:verifyOwnership=false | 279.5 | 415.67 | 310.4 |
| listCollectionListings:verifyOwnership=true | 529.26 | 601.69 | 539.55 |
| fetchCollectionTraitMetadata | 272.62 | 275.31 | 269.97 |
| fetchTraitValues:beast id | 244.28 | 251.52 | 243.69 |