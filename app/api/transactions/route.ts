import { NextRequest, NextResponse } from 'next/server';
import { transactionProcessor } from '@/lib/transactions/processor';
import type {
  BrianResponse,
  BrianTransactionData,
} from '@/lib/transactions/types';

const BRIAN_API_URL = 'https://api.brianknows.org/api/v0/agent';

async function getBrianTransactionData(
  prompt: string,
  address: string,
  messages: any[]
): Promise<BrianResponse> {
  try {
    const response = await fetch(`${BRIAN_API_URL}/transaction`, {
      method: 'POST',
      headers: {
        'X-Brian-Api-Key': process.env.BRIAN_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        address,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.result?.[0]) {
      throw new Error('Invalid response format from Brian API');
    }
    const brianResponse = data.result[0] as BrianResponse;

    if (brianResponse.extractedParams) {
      brianResponse.extractedParams.connectedAddress = address;
    }

    return brianResponse;
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, address, messages = [] } = body;

    if (!prompt || !address) {
      return NextResponse.json(
        { error: 'Missing required parameters (prompt or address)' },
        { status: 400 }
      );
    }

    try {
      const brianResponse = await getBrianTransactionData(
        prompt,
        address,
        messages
      );
      console.log(
        'Processed Brian Response:',
        JSON.stringify(brianResponse, null, 2)
      );

      if (brianResponse.extractedParams) {
        brianResponse.extractedParams.connectedAddress = address;
      }

      // Process the transaction
      const processedTx = await transactionProcessor.processTransaction(
        brianResponse
      );
      console.log(
        'Processed Transaction:',
        JSON.stringify(processedTx, null, 2)
      );

      return NextResponse.json({
        result: [
          {
            data: {
              description: processedTx.description,
              transaction: {
                type: processedTx.action,
                data: {
                  transactions: processedTx.transactions,
                  fromToken: processedTx.fromToken,
                  toToken: processedTx.toToken,
                  fromAmount: processedTx.fromAmount,
                  toAmount: processedTx.toAmount,
                  receiver: processedTx.receiver,
                  gasCostUSD: processedTx.estimatedGas,
                  solver: processedTx.solver,
                },
              },
            },
            conversationHistory: messages,
          },
        ],
      });
    } catch (error) {
      console.error('Transaction processing error:', error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Transaction processing failed',
          details: error instanceof Error ? error.stack : undefined,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
