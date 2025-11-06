import { useMemo } from "react";

interface TokenProperty {
  name: string;
  value: string | number;
}

interface TokenPropertiesProps {
  properties: TokenProperty[];
}
const formatterMap: Record<string, (val: string) => string> = {
  "Token ID": (val: string): string => BigInt(val).toString(10),
};
function formatValue(name: string, value: string): string {
  const formatter = formatterMap[name];
  if (formatter) {
    return formatter(value);
  }

  return value;
}

export function TokenProperties({ properties }: TokenPropertiesProps) {
  return (
    <div className="grid grid-cols-4 gap-px bg-background-100 rounded-xl overflow-hidden border border-background-100">
      {properties.map((property, index) => (
        <PropertyItem key={`${property.name}-${index}`} property={property} />
      ))}
    </div>
  );
}

function PropertyItem({ property }: { property: TokenProperty }) {
  const val = useMemo(
    () => formatValue(property.name, property.value.toString()),
    [property],
  );
  return (
    <div className="bg-background-200 p-3 flex flex-col gap-2">
      <p className="text-foreground-400 text-xs">{property.name}</p>
      <p className="text-foreground-100 text-sm font-medium">{val}</p>
    </div>
  );
}
