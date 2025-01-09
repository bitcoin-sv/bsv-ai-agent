import { Transaction, P2PKH, ARC } from '@bsv/sdk';
import { BrianResponse } from './types';
export type TransactionAction = 'swap' | 'transfer';

export interface ExtractedParams {
  amount?: string;
  token1?: string;
  token2?: string;
  address?: string;
}

export interface BrianTransactionData {
  description: string;
  steps: TransactionStep[];
  fromAmount?: string;
  toAmount?: string;
  fromToken?: string;
  toToken?: string;
  receiver?: string;
}

export interface TransactionStep {
  type: string;
  data: Record<string, unknown>;
  status: 'pending' | 'completed' | 'failed';
}
export interface ProcessedTransaction {
  success: boolean;
  description: string;
  transactions: Transaction[];
  action: TransactionAction;
  solver?: string;
  fromToken?: string;
  toToken?: string;
  fromAmount?: string;
  toAmount?: string;
  receiver?: string;
  estimatedGas: string;
}

interface TransactionHandler {
  processSteps(
    data: BrianTransactionData,
    params: ExtractedParams
  ): Promise<Transaction[]>;
}

export class SwapHandler implements TransactionHandler {
  async processSteps(
    data: BrianTransactionData,
    params: ExtractedParams
  ): Promise<Transaction[]> {
    const tx = new Transaction();

    if (!params.token1 || !params.token2 || !params.amount) {
      throw new Error('Missing required parameters for swap');
    }

    // Implement swap logic here
    // You'll need to add your specific swap implementation
    // This is just a placeholder
    return [tx];
  }
}

export class TransferHandler implements TransactionHandler {
  async processSteps(
    data: BrianTransactionData,
    params: ExtractedParams
  ): Promise<Transaction[]> {
    const tx = new Transaction();

    if (!params.address || !params.amount) {
      throw new Error('Missing required parameters for transfer');
    }

    // Add standard P2PKH output for transfer
    tx.addOutput({
      lockingScript: new P2PKH().lock(params.address),
      satoshis: parseInt(params.amount),
    });

    return [tx];
  }
}

export class TransactionProcessor {
  private handlers: Record<TransactionAction, TransactionHandler>;
  private arc: ARC;

  constructor() {
    const apiKey = process.env.TAAL_API_KEY;
    if (!apiKey) {
      throw new Error('TAAL_API_KEY environment variable is required');
    }

    this.arc = new ARC('https://api.taal.com/arc', apiKey);

    this.handlers = {
      swap: new SwapHandler(),
      transfer: new TransferHandler(),
    };
  }

  private validateBrianResponse(response: BrianResponse): void {
    if (!response) {
      throw new Error('Invalid response: Response is null or undefined');
    }

    if (!response.action) {
      throw new Error('Invalid response: Missing action');
    }

    if (!['swap', 'transfer'].includes(response.action)) {
      throw new Error(`Unsupported action type: ${response.action}`);
    }

    if (!response.extractedParams) {
      throw new Error('Invalid response: Missing extractedParams');
    }
  }

  private generateDescription(response: BrianResponse): string {
    const params = response.extractedParams;

    switch (response.action) {
      case 'transfer':
        return `Transfer ${
          params?.amount
        } ${params?.token1?.toUpperCase()} to ${params?.address}`;
      case 'swap':
        return `Swap ${
          params?.amount
        } ${params?.token1?.toUpperCase()} for ${params?.token2?.toUpperCase()}`;
      default:
        return 'Unknown transaction type';
    }
  }

  private createTransactionData(response: BrianResponse): BrianTransactionData {
    return {
      description: this.generateDescription(response),
      steps: [],
      fromAmount: response.extractedParams?.amount,
      toAmount: response.extractedParams?.amount,
      fromToken: response.extractedParams?.token1,
      toToken: response.extractedParams?.token2,
      receiver: response.extractedParams?.address,
    };
  }

  async processTransaction(
    response: BrianResponse
  ): Promise<ProcessedTransaction> {
    try {
      this.validateBrianResponse(response);

      const handler = this.handlers[response.action];
      const extractedParams = response.extractedParams ?? {};
      const transactionData = this.createTransactionData(response);
      const transactions = await handler.processSteps(
        transactionData,
        extractedParams
      );

      // Sign and broadcast each transaction
      for (const tx of transactions) {
        await tx.fee();
        await tx.sign();
        await tx.broadcast(this.arc);
      }

      return {
        success: true,
        description: this.generateDescription(response),
        transactions,
        action: response.action,
        solver: response.solver,
        fromToken: transactionData.fromToken,
        toToken: transactionData.toToken,
        fromAmount: response.extractedParams?.amount,
        toAmount: response.extractedParams?.amount,
        receiver: response.extractedParams?.address,
        estimatedGas: '0',
      };
    } catch (error) {
      console.error('Error processing transaction:', error);
      throw error;
    }
  }
}

export const transactionProcessor = new TransactionProcessor();
