// pages/api/mcp-proxy/[server]/sse.ts
import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})


// // Configure your MCP servers
// const MCP_SERVERS: Record<string, string> = {
//   'hackernews': 'https://mcp.composio.dev/hackernews/rapping-bitter-psychiatrist-DjGelP',
// };

// Store sessions globally for access across requests
declare global {
  var _mcpSessions: Record<string, string>;
}

global._mcpSessions = global._mcpSessions || {};

export async function GET(request: NextRequest) {
  const serverName = "hackernews";
  
  // Check if this is a message endpoint request with a sessionId
  const server = request.nextUrl.searchParams.get('server');
  if (!server) {
    console.log(`GET request with server ${server} - should be a POST request`);
    return NextResponse.json({ error: 'Messages should be sent using POST method' }, { status: 405 });
  }
  
  // if (!serverName || !MCP_SERVERS[serverName]) {
  //   return NextResponse.json({ error: `MCP server '${serverName}' not found` }, { status: 404 });
  // }

  // Generate a new session ID for this connection
  const newSessionId = randomUUID();
  
  // Store the session for later reference
  global._mcpSessions[newSessionId] = serverName;
  console.log(`Created session ${newSessionId} for server ${serverName}`);
  
  try {
    const targetUrl = `${server}`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...Object.fromEntries(request.headers),
        host: new URL(server).host,
      },
    });

    if (!response.body) {
      throw new Error('No response body from MCP server');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          delete global._mcpSessions[newSessionId];
          console.log(`Session ${newSessionId} closed normally`);
          return;
        }

        const chunkString = decoder.decode(value, { stream: true });
        const sessionId = chunkString.match(/sessionId=([^&]+)/)?.[1];
        if (sessionId) {
          console.log(`Setting session ${sessionId} for server ${serverName}`);
          await redis.set(`mcp:session:${sessionId}`, server);
        }
        controller.enqueue(value);
      },
      cancel() {
        reader.cancel();
        delete global._mcpSessions[newSessionId];
        console.log(`Session ${newSessionId} canceled`);
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error proxying SSE request:', error);
    delete global._mcpSessions[newSessionId];
    return NextResponse.json({ error: 'Failed to connect to MCP server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
        console.log("request", request);
        
  const server = request.nextUrl.searchParams.get('server');
  
  if (!server) {
    console.error('POST request - Missing server parameter');
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32602, message: "Missing server parameter" },
        id: null
      }, 
      { status: 400 }
    );
  }
  
  // Get the server name from the stored session
  const serverName = 'hackernews'

  console.log("serverName", serverName);
  
//   if (!serverName || !MCP_SERVERS[serverName]) {
//     console.error(`POST request - Invalid session ${sessionId} or server ${serverName}`);
//     return NextResponse.json(
//       {
//         jsonrpc: "2.0",
//         error: { code: -32602, message: "Invalid session" },
//         id: null
//       }, 
//       { status: 404 }
//     );
//   }

  const targetUrl = `${server}`;
  console.log(`Forwarding JSONRPC POST to: ${targetUrl}`);
  
  try {
    let jsonRpcRequest;
    try {
      const body = await request.text();
      jsonRpcRequest = JSON.parse(body);
      console.log(`JSONRPC Request:`, jsonRpcRequest);
      
      // Validate basic JSONRPC structure
      if (!jsonRpcRequest.jsonrpc || jsonRpcRequest.jsonrpc !== "2.0" || !jsonRpcRequest.method) {
        throw new Error("Invalid JSONRPC request");
      }
    } catch (err) {
      console.error("Error parsing JSONRPC request:", err);
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          error: { code: -32700, message: "Parse error" },
          id: null
        },
        { status: 400 }
      );
    }
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        host: new URL(server).host,
      },
      body: JSON.stringify(jsonRpcRequest),
    });

    const responseText = await response.text();
    console.log(`JSONRPC response status: ${response.status}, body: ${responseText}`);
    
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (err) {
      console.error("Error parsing JSONRPC response:", err);
      jsonResponse = {
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal error: Invalid JSON response from server" },
        id: jsonRpcRequest.id || null
      };
    }
    
    return NextResponse.json(jsonResponse, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error(`Error in POST handler:`, error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal error" },
        id: null
      }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
