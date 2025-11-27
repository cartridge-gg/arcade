export type ResultStatus = "success" | "error" | "pending";

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
