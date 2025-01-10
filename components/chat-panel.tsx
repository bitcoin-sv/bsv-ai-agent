/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useRef, ReactNode } from 'react';
import type { AI, UIState } from '@/app/actions';
import { useUIState } from 'ai/rsc';
import { cn } from '@/lib/utils';
import { UserMessage } from './user-message';
import { Button } from './ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { EmptyScreen } from './empty-screen';
import Textarea from 'react-textarea-autosize';
import { generateId } from 'ai';
import { ModelSelector } from './model-selector';
import { models } from '@/lib/types/models';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { getDefaultModelId } from '@/lib/utils';
import BsvButton from './bsv/BsvButton';

interface ChatPanelProps {
  messages: UIState;
  query?: string;
  onModelChange?: (id: string) => void;
}

type Message = {
  component: ReactNode;
  id: string;
  role: string;
  content: string;
  timestamp: string;
  user: string;
  transaction?: {
    data: {
      transactions: Array<{
        contractAddress: string;
        entrypoint: string;
        calldata: string[];
      }>;
      fromToken?: any;
      toToken?: any;
      fromAmount?: string;
      toAmount?: string;
      receiver?: string;
      gasCostUSD?: string;
      solver?: string;
    };
    type: string;
  };
};

export function ChatPanel({ messages, query, onModelChange }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);
  const [, setMessages] = useUIState<typeof AI>();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [textMessages, setTextMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedModelId, setSelectedModelId] = useLocalStorage<string>(
    'selectedModel',
    getDefaultModelId(models)
  );

  const [isComposing, setIsComposing] = useState(false);
  const [enterDisabled, setEnterDisabled] = useState(false);

  const handleCompositionStart = () => setIsComposing(true);

  const handleCompositionEnd = () => {
    setIsComposing(false);
    setEnterDisabled(true);
    setTimeout(() => {
      setEnterDisabled(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      component: <UserMessage message={input} />,
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
      user: 'User',
    };

    setTextMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          // address: address,
          chainId: '4012',
          messages: textMessages.concat(userMessage).map((msg) => ({
            sender: msg.role === 'user' ? 'user' : 'brian',
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();
      let agentMessage: Message;

      if (
        data.error &&
        typeof data.error === 'string' &&
        !data.error.includes('not recognized')
      ) {
        agentMessage = {
          component: 'error',
          id: generateId(),
          role: 'agent',
          content: data.error,
          timestamp: new Date().toLocaleTimeString(),
          user: 'Agent',
        };
      } else if (response.ok && data.result?.[0]?.data) {
        const { description, transaction } = data.result[0].data;
        agentMessage = {
          component: 'transaction',
          id: generateId(),
          role: 'agent',
          content: description,
          timestamp: new Date().toLocaleTimeString(),
          user: 'Agent',
          transaction: transaction,
        };
      } else {
        agentMessage = {
          component: 'empty',
          id: generateId(),
          role: 'agent',
          content:
            "I'm sorry, I couldn't understand that. Could you try rephrasing your request? For example, you can say 'swap', 'transfer', 'deposit', or 'bridge'.",
          timestamp: new Date().toLocaleTimeString(),
          user: 'Agent',
        };
      }

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        component: 'error',
        id: generateId(),
        role: 'agent',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
        user: 'Agent',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={
        'fixed bottom-8 left-0 right-0 top-10 mx-auto h-screen flex flex-col items-center justify-center'
      }
    >
      <form onSubmit={handleSubmit} className="max-w-2xl w-full px-6">
        <div className="relative flex items-center w-full">
          <ModelSelector
            selectedModelId={selectedModelId}
            onModelChange={(id) => {
              setSelectedModelId(id);
              onModelChange?.(id);
            }}
          />
          <Textarea
            ref={inputRef}
            name="input"
            rows={1}
            maxRows={5}
            tabIndex={0}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="Ask a question..."
            spellCheck={false}
            value={input}
            className="resize-none w-full min-h-12 rounded-fill bg-muted border border-input pl-4 pr-10 pt-3 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => {
              setInput(e.target.value);
              setShowEmptyScreen(e.target.value.length === 0);
            }}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !isComposing &&
                !enterDisabled
              ) {
                if (input.trim().length === 0) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                const textarea = e.target as HTMLTextAreaElement;
                textarea.form?.requestSubmit();
              }
            }}
            onHeightChange={(height) => {
              if (!inputRef.current) return;
              const initialHeight = 70;
              const initialBorder = 32;
              const multiple = (height - initialHeight) / 20;
              const newBorder = initialBorder - 4 * multiple;
              inputRef.current.style.borderRadius = `${Math.max(
                8,
                newBorder
              )}px`;
            }}
            onFocus={() => setShowEmptyScreen(true)}
            onBlur={() => setShowEmptyScreen(false)}
          />
          <Button
            type="submit"
            size={'icon'}
            variant={'ghost'}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={input.length === 0}
          >
            <ArrowRight size={20} />
          </Button>
        </div>
        <EmptyScreen
          submitMessage={(message) => {
            setInput(message);
          }}
          className={cn(showEmptyScreen ? 'visible' : 'invisible')}
        />
      </form>
      <BsvButton />
    </div>
  );
}
