import { type ByteArray, byteArray, hash } from "starknet";

export * from "./trophy";
export * from "./progress";

const byteArrayHashCache = new Map<string, string>();

export function computeByteArrayHash(str: string): string {
  const cached = byteArrayHashCache.get(str);
  if (cached) return cached;

  const bytes = byteArray.byteArrayFromString(str);
  const result = hash.computePoseidonHashOnElements(serializeByteArray(bytes));
  byteArrayHashCache.set(str, result);
  return result;
}

const selectorCache = new Map<string, string>();

export function getSelectorFromTag(namespace: string, event: string): string {
  const key = `${namespace}:${event}`;
  const cached = selectorCache.get(key);
  if (cached) return cached;

  const result = hash.computePoseidonHashOnElements([
    computeByteArrayHash(namespace),
    computeByteArrayHash(event),
  ]);
  selectorCache.set(key, result);
  return result;
}

// Serializes a ByteArray to a bigint array
export function serializeByteArray(byteArray: ByteArray): bigint[] {
  const result: bigint[] = [
    BigInt(byteArray.data.length),
    ...byteArray.data.map((word) => BigInt(word.toString())),
    BigInt(byteArray.pending_word),
    BigInt(byteArray.pending_word_len),
  ];
  return result;
}
