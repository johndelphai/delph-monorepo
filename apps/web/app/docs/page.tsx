import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'API Docs – llmchat',
    description: 'llmchat API reference for developers',
};

const CODE_CURL = `curl -X POST https://delph.tech/api/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gemini-flash-2.5",
    "messages": [
      { "role": "user", "content": "Explain quantum entanglement simply." }
    ],
    "web_search": false
  }'`;

const CODE_JS = `const response = await fetch('https://delph.tech/api/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gemini-flash-2.5',
    messages: [
      { role: 'user', content: 'Explain quantum entanglement simply.' }
    ],
  }),
});

// Response is a Server-Sent Events stream
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Parse SSE events from chunk
  console.log(chunk);
}`;

const MODELS = [
    { id: 'gemini-flash-2.5', name: 'Gemini 2.5 Flash', credits: 1, notes: 'Fast, free tier' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', credits: 3, notes: '1M context' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', credits: 1, notes: 'Good balance' },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', credits: 1, notes: 'Lightweight' },
    { id: 'llama-4-scout', name: 'Llama 4 Scout', credits: 1, notes: 'Open source' },
    { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', credits: 1, notes: 'Open source' },
    { id: 'claude-haiku-4.5', name: 'Haiku 4.5', credits: 10, notes: 'Fast Claude' },
    { id: 'claude-sonnet-4.6', name: 'Sonnet 4.6', credits: 10, notes: 'High quality' },
    { id: 'claude-opus-4.6', name: 'Opus 4.6', credits: 10, notes: 'Most capable' },
    { id: 'gpt-4.1', name: 'GPT-4.1', credits: 5, notes: 'High quality' },
    { id: 'deepseek-r1', name: 'DeepSeek R1', credits: 5, notes: 'Reasoning model' },
];

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-6 py-16">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold tracking-tight">API Reference</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Use llmchat as a backend for your own apps. Generate your API key from the{' '}
                        <strong>API</strong> tab in the app sidebar.
                    </p>
                </div>

                {/* Authentication */}
                <section className="mb-12">
                    <h2 className="mb-3 text-xl font-semibold">Authentication</h2>
                    <p className="text-muted-foreground mb-4 text-sm">
                        All requests require a Bearer token in the{' '}
                        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                            Authorization
                        </code>{' '}
                        header.
                    </p>
                    <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                        {`Authorization: Bearer llmchat-YOUR_API_KEY`}
                    </pre>
                </section>

                {/* Endpoint */}
                <section className="mb-12">
                    <h2 className="mb-3 text-xl font-semibold">Chat</h2>
                    <div className="bg-muted mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2">
                        <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-600">
                            POST
                        </span>
                        <code className="text-sm">/api/v1/chat</code>
                    </div>

                    <h3 className="mb-2 mt-6 font-medium">Request body</h3>
                    <div className="border-border overflow-hidden rounded-lg border text-sm">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Field</th>
                                    <th className="px-4 py-2 text-left font-medium">Type</th>
                                    <th className="px-4 py-2 text-left font-medium">Required</th>
                                    <th className="px-4 py-2 text-left font-medium">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {[
                                    ['messages', 'array', 'Yes', 'Array of {role, content} objects. Roles: user, assistant, system'],
                                    ['model', 'string', 'No', 'Model ID (default: gemini-flash-2.5)'],
                                    ['web_search', 'boolean', 'No', 'Enable web search (default: false)'],
                                    ['custom_instructions', 'string', 'No', 'Extra system instructions'],
                                    ['thread_id', 'string', 'No', 'Optional ID to group messages'],
                                ].map(([field, type, req, desc]) => (
                                    <tr key={field}>
                                        <td className="px-4 py-2.5">
                                            <code className="text-xs">{field}</code>
                                        </td>
                                        <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                            {type}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs">{req}</td>
                                        <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                            {desc}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Examples */}
                <section className="mb-12">
                    <h2 className="mb-4 text-xl font-semibold">Examples</h2>

                    <h3 className="mb-2 font-medium">cURL</h3>
                    <pre className="bg-muted mb-6 overflow-x-auto rounded-lg p-4 text-xs">
                        {CODE_CURL}
                    </pre>

                    <h3 className="mb-2 font-medium">JavaScript</h3>
                    <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">{CODE_JS}</pre>
                </section>

                {/* Models */}
                <section className="mb-12">
                    <h2 className="mb-3 text-xl font-semibold">Available Models</h2>
                    <p className="text-muted-foreground mb-4 text-sm">
                        Credits are deducted per request based on the model used. Credits reset
                        daily.
                    </p>
                    <div className="border-border overflow-hidden rounded-lg border text-sm">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Model ID</th>
                                    <th className="px-4 py-2 text-left font-medium">Name</th>
                                    <th className="px-4 py-2 text-left font-medium">Credits</th>
                                    <th className="px-4 py-2 text-left font-medium">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {MODELS.map(m => (
                                    <tr key={m.id}>
                                        <td className="px-4 py-2.5">
                                            <code className="text-xs">{m.id}</code>
                                        </td>
                                        <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                            {m.name}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs">{m.credits}</td>
                                        <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                            {m.notes}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Errors */}
                <section className="mb-12">
                    <h2 className="mb-3 text-xl font-semibold">Error Codes</h2>
                    <div className="border-border overflow-hidden rounded-lg border text-sm">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Status</th>
                                    <th className="px-4 py-2 text-left font-medium">Meaning</th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {[
                                    ['401', 'Invalid or missing API key'],
                                    ['400', 'Invalid request body'],
                                    ['429', 'Daily credit limit reached'],
                                    ['500', 'Internal server error'],
                                ].map(([code, meaning]) => (
                                    <tr key={code}>
                                        <td className="px-4 py-2.5">
                                            <code className="text-xs">{code}</code>
                                        </td>
                                        <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                            {meaning}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <p className="text-muted-foreground text-xs">
                    Need help?{' '}
                    <a
                        href="https://github.com/trendy-design/llmchat/issues"
                        className="text-primary hover:underline"
                    >
                        Open an issue on GitHub
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
