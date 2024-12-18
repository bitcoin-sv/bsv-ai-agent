export type TransactionAction = 'swap' | 'transfer';

export interface TransactionStep {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

export interface BrianStep {
  approve?: TransactionStep;
  transactionData?: TransactionStep;
  contractAddress?: string;
  entrypoint?: string;
  calldata?: string[];
}

export interface BrianToken {
  address: string;
  symbol: string;
  decimals: number;
}

export interface NetworkConfig {
  chainId: string;
  name: string;
}

export interface BrianTransactionData {
  description: string;
  steps: BrianStep[];
  fromToken?: BrianToken;
  toToken?: BrianToken;
  fromAmount?: string;
  toAmount?: string;
  receiver?: string;
  amountToApprove?: string;
  gasCostUSD?: string;
  protocol?: string;
}

export interface BrianResponse {
  solver: string;
  action: 'swap' | 'transfer';
  type: 'write';
  data: BrianTransactionData;
  extractedParams?: {
    [x: string]: string | undefined;
    action: string;
    token1: string;
    token2: string;
    chain: string;
    amount: string;
    protocol: string;
    address: string;
    dest_chain?: string;
    destinationChain?: string;
    destinationAddress?: string;
  };
}

export interface ProcessedTransaction {
  success: boolean;
  description: string;
  transactions: TransactionStep[];
  action: string;
  solver: string;
  fromToken?: BrianToken;
  toToken?: BrianToken;
  fromAmount?: string;
  toAmount?: string;
  receiver?: string;
  estimatedGas: string;
  protocol?: string;
}
