/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BrianTransactionData, TransactionStep } from '../types';

export abstract class BaseTransactionHandler {
  abstract processSteps(
    data: BrianTransactionData,
    params?: TransactionStep
  ): Promise<TransactionStep[]>;
}
