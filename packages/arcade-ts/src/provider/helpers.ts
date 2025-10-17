/**
 * Gets a contract address from the manifest by name
 *
 * @param manifest - The manifest containing contract information
 * @param name - The name/tag of the contract to find
 * @returns The contract address
 * @throws Error if contract not found
 */
export const getContractByName = (manifest: any, name: string) => {
  const contract = manifest.contracts.find(
    (contract: any) => contract.tag === name,
  );
  if (!contract) {
    throw new Error(`Contract ${name} not found in manifest`);
  }
  return contract.address;
};
