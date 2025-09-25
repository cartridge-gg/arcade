export enum StatusType {
  None = "None",
  Placed = "Placed",
  Canceled = "Canceled",
  Executed = "Executed",
}

export class Status {
  value: StatusType;

  constructor(value: StatusType) {
    this.value = value;
  }

  public into(): number {
    return Object.values(StatusType).indexOf(this.value);
  }

  public static from(index: number): Status {
    const item = Object.values(StatusType)[index];
    return new Status(item);
  }
}
