export const ColumnLabels = () => {
  return (
    <div className="w-full px-2 flex gap-1 self-stretch">
      <div className="flex items-center py-1 flex-1">
        <h1 className="text-xs font-medium text-foreground-300">Market</h1>
      </div>
      <div className="flex items-center w-[120px]">
        <h1 className="text-xs font-medium text-foreground-300">Balance</h1>
      </div>
      <div className="flex items-center w-[120px]">
        <h1 className="text-xs font-medium text-foreground-300">TVL</h1>
      </div>
    </div>
  );
};
