import {
  BrianSDK,
  TransactionResult as BrianTransactionResult,
} from '@brian-ai/sdk';
import { generateId } from 'ai';

type TransactionResult = BrianTransactionResult & {
  extractedParams: Record<string, string>;
  conversationHistory: {
    sender: 'user' | 'brian';
    content: string;
  }[];
};

const brian = new BrianSDK({ apiKey: process.env.BRIAN_API_KEY });

export const brianTransact = async (prompt: string) => {
  const requestRaw = await brian.transact({
    prompt,
    address: 'vitalik.eth',
  });
  const request = requestRaw as TransactionResult[];
  const firstTransactionResult = request[0];
  if (!firstTransactionResult) {
    return { text: 'ERROR', toolResults: [] };
  }
  const brianAnswer = firstTransactionResult.conversationHistory.find(
    ({ sender }) => sender === 'brian'
  );
  if (!brianAnswer) {
    return { text: 'ERROR', toolResults: [] };
  }
  return {
    text: brianAnswer.content,
    toolResults: [
      {
        id: generateId(),
        role: 'tool',
        content: JSON.stringify(firstTransactionResult.data),
        name: 'transaction',
        type: 'tool',
      },
      {
        id: generateId(),
        role: 'tool',
        content: JSON.stringify(firstTransactionResult.extractedParams),
        name: 'transaction_extracted_params',
        type: 'tool',
      },
    ],
  };
};
