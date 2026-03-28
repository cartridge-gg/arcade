## SQL Benchmark Report

- Project: `arcade-main`
- Collection: `0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4`
- Generated: `2026-02-22T22:12:00.569Z`
- Warmup: `1`
- Iterations: `5`

| Operation | p50 (ms) | p95 (ms) | mean (ms) |
| --- | ---: | ---: | ---: |
| listCollectionTokens:first-page | 1811.09 | 2000.73 | 1570.88 |
| listCollectionTokens:next-page | 1837.51 | 2094.58 | 1519.15 |
| listCollectionTokens:attribute-filters | 221.56 | 225.41 | 221.14 |
| getCollectionOrders | 264.79 | 410.91 | 301.62 |
| listCollectionListings:verifyOwnership=false | 268.87 | 407.04 | 302.12 |
| fetchTraitValues:beast id | 219.41 | 239.19 | 222.73 |

### Base vs Head

| Operation | base p50 | head p50 | delta p50 | base p95 | head p95 | delta p95 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| listCollectionTokens:first-page | 1397.08 | 1811.09 | +29.63% | 1825.89 | 2000.73 | +9.58% |
| listCollectionTokens:next-page | 900.35 | 1837.51 | +104.09% | 1907.47 | 2094.58 | +9.81% |
| listCollectionTokens:attribute-filters | 226.51 | 221.56 | -2.19% | 229.62 | 225.41 | -1.83% |
| getCollectionOrders | 251.37 | 264.79 | +5.34% | 293.99 | 410.91 | +39.77% |
| listCollectionListings:verifyOwnership=false | 266.63 | 268.87 | +0.84% | 358.47 | 407.04 | +13.55% |
| fetchTraitValues:beast id | 232.37 | 219.41 | -5.58% | 250.3 | 239.19 | -4.44% |