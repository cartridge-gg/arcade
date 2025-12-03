export type ResultStatus = "success" | "error" | "pending";

export type CollectionStatus =
  | "idle"
  | "loading"
  | "initialCommit"
  | "ready"
  | "error"
  | "cleaned-up"
  | "success";

type ResultLike<T> =
  | { _tag: "Initial" }
  | { _tag: "Success"; value: T }
  | { _tag: "Failure" };

export function unwrapOr<T, D>(result: ResultLike<T>, defaultValue: D): T | D {
  return result._tag === "Success" ? result.value : defaultValue;
}

export function toStatus(result: ResultLike<unknown>): ResultStatus {
  return result._tag === "Success"
    ? "success"
    : result._tag === "Failure"
      ? "error"
      : "pending";
}

export function toCollectionStatus(
  result: ResultLike<unknown>,
): CollectionStatus {
  return result._tag === "Success"
    ? "ready"
    : result._tag === "Failure"
      ? "error"
      : "loading";
}

export function unwrap<T, D>(
  result: ResultLike<T>,
  defaultValue: D,
): { value: T | D; status: ResultStatus } {
  return {
    value: unwrapOr(result, defaultValue),
    status: toStatus(result),
  };
}

export function isLoading(result: ResultLike<unknown>): boolean {
  return result._tag === "Initial";
}

export function mapResult<T, U>(
  result: ResultLike<T>,
  fn: (value: T) => U,
): ResultLike<U> {
  if (result._tag === "Success") {
    return { _tag: "Success", value: fn(result.value) };
  }
  return result as ResultLike<U>;
}
