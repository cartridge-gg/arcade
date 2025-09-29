export enum CategoryType {
  None = "None",
  Buy = "Buy",
  Sell = "Sell",
}

export class Category {
  value: CategoryType;

  constructor(value: CategoryType) {
    this.value = value;
  }

  public into(): number {
    return Object.values(CategoryType).indexOf(this.value);
  }

  public static from(index: number): Category {
    const item = Object.values(CategoryType)[index];
    return new Category(item);
  }
}
