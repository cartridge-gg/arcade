export enum RoleType {
  None = "None",
  Member = "Member",
  Admin = "Admin",
  Owner = "Owner",
}

export class Role {
  value: RoleType;

  constructor(value: RoleType) {
    this.value = value;
  }

  public into(): number {
    return Object.values(RoleType).indexOf(this.value);
  }

  public static from(index: number): Role {
    const item = Object.values(RoleType)[index];
    return new Role(item);
  }
}
