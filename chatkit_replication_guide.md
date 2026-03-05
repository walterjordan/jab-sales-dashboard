# Chatkit Integration Guide for Next.js

This guide outlines the steps to replicate the "Chatkit" integration (powered by OpenAI's Agent Builder) into a Next.js project.

## Prerequisites

1.  **OpenAI Account**: You need an active OpenAI account with API access.
2.  **OpenAI Agent**: You must have created an agent using the **OpenAI Agent Builder**.
3.  **Next.js Project**: A Next.js project (App Router recommended) with Tailwind CSS configured.

## Step 1: Obtain Credentials

You will need the following information:

1.  **OpenAI API Key**: Create one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2.  **Workflow ID**: This is the ID of your agent/workflow. You can usually find this in the URL when editing your agent or in the integration settings. It typically starts with `wf_`.

## Step 2: Environment Configuration

Create or update your `.env.local` file in the root of your project:

```env
# OpenAI API Key for backend session creation
OPENAI_API_KEY=sk-...

# The Workflow ID for your specific Agent
CHATKIT_WORKFLOW_ID=wf_...

# Optional: Public Key if required by your specific setup (often not needed for server-side auth)
NEXT_PUBLIC_CHATKIT_PUBLIC_KEY=
```

## Step 3: Install Dependencies

Install the required packages. We need `openai` for the API client and `lucide-react` for the icons in the widget.

```bash
npm install openai lucide-react
```

## Step 4: Add the Chatkit Script

Modify your Root Layout (`src/app/layout.tsx`) to include the Chatkit script. This script defines the `openai-chatkit` custom element.

```tsx
// src/app/layout.tsx
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* ... other scripts ... */}
        
        {/* Add this script */}
        <Script 
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" 
          strategy="lazyOnload" 
        />
        
        {children}
      </body>
    </html>
  );
}
```

## Step 5: Create the API Route

Create a backend API route to handle session creation securely. This prevents exposing your OpenAI API key to the client.

**File:** `src/app/api/chatkit/session/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // In production, replace this with your actual user authentication logic
    const userId = body.user || 'anonymous-user-' + Math.random().toString(36).substring(7);
    
    const workflowId = process.env.CHATKIT_WORKFLOW_ID;
    if (!workflowId) {
        throw new Error("CHATKIT_WORKFLOW_ID is not defined in environment variables");
    }

    // Create a ChatKit session
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'chatkit_beta=v1' // Crucial for beta features
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: userId
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create session');
    }

    const session = await response.json();
    return NextResponse.json({ client_secret: session.client_secret });
  } catch (error: any) {
    console.error('Error creating ChatKit session:', error);
    return NextResponse.json(
      { error: 'Failed to create session', details: error.message },
      { status: 500 }
    );
  }
}
```

## Step 6: Create the Chat Components

### 6.1. Wrapper Component

This component handles the initialization of the `openai-chatkit` custom element.

**File:** `src/components/chat/ChatKitWrapper.tsx`

```tsx
'use client';

import { useEffect, useRef } from 'react';

// Declare custom element to satisfy TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'openai-chatkit': any;
    }
  }
}

export default function ChatKitWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    const container = containerRef.current;
    if (!container) return;

    const initChat = async () => {
      try {
        // Wait for script to register the element
        await customElements.whenDefined('openai-chatkit');
        
        if (!isMounted.current || !container) return;

        const chatkit = document.createElement('openai-chatkit') as any;
        
        // Add public key if available
        if (process.env.NEXT_PUBLIC_CHATKIT_PUBLIC_KEY) {
          chatkit.setAttribute('public-key', process.env.NEXT_PUBLIC_CHATKIT_PUBLIC_KEY);
        }

        // Function to fetch the client secret from our API
        const getClientSecret = async () => {
          const res = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: 'web-visitor-' + Date.now() })
          });
          
          if (!res.ok) throw new Error('Failed session');
          const data = await res.json();
          return data.client_secret;
        };

        // Configure the element
        if (typeof chatkit.setOptions === 'function') {
          chatkit.setOptions({
            api: { getClientSecret }
          });
        } else {
          // Fallback property assignment
          chatkit.api = { getClientSecret };
        }

        // Mount safely
        container.innerHTML = '';
        container.appendChild(chatkit);
      } catch (err) {
        console.error("ChatKit initialization failed:", err);
      }
    };

    initChat();

    return () => {
      isMounted.current = false;
      if (container) container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
```

### 6.2. Widget Component (Floating Button)

This component creates the floating button that opens the chat window.

**File:** `src/components/chat/ChatWidget.tsx`

```tsx
'use client';

import { useState } from 'react';
import ChatKitWrapper from './ChatKitWrapper';
import { MessageCircle, X } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 ease-in-out">
          <div className="bg-[#010e63] p-4 flex justify-between items-center text-white shrink-0">
            <div>
              <h3 className="font-bold">AI Assistant</h3>
              <p className="text-xs text-gray-300">Powered by OpenAI</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 relative bg-white">
            <ChatKitWrapper />
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center w-14 h-14 bg-[#7fff41] text-[#010e63] rounded-full shadow-lg hover:bg-[#a4ff82] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7fff41] focus:ring-offset-2"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <MessageCircle size={28} className="fill-current" />
        )}
      </button>
    </div>
  );
}
```

*Note: You may want to adjust the colors (bg-[#010e63], bg-[#7fff41]) to match your project's branding.*

## Step 7: Integrate the Widget

Finally, import and use the `ChatWidget` in your application. A common place is `src/app/layout.tsx` so it appears on all pages.

```tsx
// src/app/layout.tsx
import ChatWidget from "@/components/chat/ChatWidget";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* ... script tag ... */}
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
```

Or, if you prefer a standalone page:

**File:** `src/app/chat/page.tsx`

```tsx
import ChatKitWrapper from '@/components/chat/ChatKitWrapper';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto h-[80vh] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <ChatKitWrapper />
      </div>
    </div>
  );
}
```

## Summary

1.  Set `OPENAI_API_KEY` and `CHATKIT_WORKFLOW_ID` in `.env.local`.
2.  Install `openai` and `lucide-react`.
3.  Add the Chatkit script to `layout.tsx`.
4.  Create the backend route at `api/chatkit/session`.
5.  Create the `ChatKitWrapper` and `ChatWidget` components.
6.  Add `<ChatWidget />` to your app.
