export interface Token {
  contract_address: string;
  token_id: string | undefined;
  name: string;
  symbol: string;
  decimals: number;
  metadata: string;
  total_supply: string | undefined;
}
