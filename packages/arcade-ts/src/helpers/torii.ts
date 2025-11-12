const TORII_SLOT_BASE = "https://api.cartridge.gg";

export function getToriiUrl(project: string): string {
  try {
    const clientEnv = (import.meta as any).env?.VITE_LOCAL_TORII;
    if (clientEnv) return clientEnv;
  } catch {}

  const serverEnv =
    typeof process !== "undefined" ? process.env?.VITE_LOCAL_TORII : undefined;
  if (serverEnv) return serverEnv;

  // Default URL pattern
  return `${TORII_SLOT_BASE}/x/${project}/torii`;
}

export function getToriiSqlUrl(project: string): string {
  return `${getToriiUrl(project)}/sql`;
}

export function getToriiGraphqlUrl(project: string): string {
  return `${getToriiUrl(project)}/graphql`;
}

export function getToriiAssetUrl(
  project: string,
  contractAddress: string,
  tokenId?: string,
): string {
  const base = `${getToriiUrl(project)}/static/${contractAddress}`;
  return tokenId ? `${base}/${tokenId}/image` : `${base}/image`;
}
