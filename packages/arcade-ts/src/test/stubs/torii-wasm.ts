export class ToriiClient {}
export class ToriiGrpcClient {}

export interface Token {
  contract_address: string;
  token_id: string;
  metadata?: unknown;
}

export interface TokenContract {
  contract_address: string;
  metadata?: unknown;
  total_supply?: string;
}
