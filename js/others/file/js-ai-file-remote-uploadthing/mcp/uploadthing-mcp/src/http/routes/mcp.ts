// MCP routes for Hono
// Simplified provider-agnostic version from Spotify MCP

import { randomUUID } from 'node:crypto';
import type { HttpBindings } from '@hono/node-server';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { toFetchResponse, toReqRes } from 'fetch-to-node';
import { Hono } from 'hono';
import { contextRegistry } from '../../core/context.js';
import { logger } from '../../shared/utils/logger.js';
import type { AuthContext } from '../middlewares/auth.js';

/**
 * Hono context with auth middleware extension.
 */
interface HonoContextWithAuth {
  authContext?: AuthContext;
}

export function buildMcpRoutes(params: {
  serverFactory: () => McpServer;
  transports: Map<string, StreamableHTTPServerTransport>;
}) {
  const { serverFactory, transports } = params;
  const app = new Hono<{ Bindings: HttpBindings }>();

  // Per-session server instances (one McpServer per transport)
  const servers = new Map<string, McpServer>();
  // Track which transports have been connected
  const connectedTransports = new WeakSet<StreamableHTTPServerTransport>();

  const MCP_SESSION_HEADER = 'Mcp-Session-Id';

  /**
   * Connect transport to its own server instance only if not already connected.
   * McpServer.connect() should be called once per transport lifecycle.
   */
  async function ensureConnected(
    sessionId: string,
    transport: StreamableHTTPServerTransport,
  ): Promise<void> {
    if (!connectedTransports.has(transport)) {
      let server = servers.get(sessionId);
      if (!server) {
        server = serverFactory();
        servers.set(sessionId, server);
      }
      await server.connect(transport);
      connectedTransports.add(transport);
    }
  }

  app.post('/', async (c) => {
    const { req, res } = toReqRes(c.req.raw.clone());

    try {
      const sessionIdHeader = c.req.header(MCP_SESSION_HEADER) ?? undefined;
      let body: unknown;
      try {
        body = await c.req.json();
      } catch {
        body = undefined;
      }

      const isInitialize = Boolean(
        body && (body as { method?: string }).method === 'initialize',
      );

      const plannedSid = isInitialize ? sessionIdHeader || randomUUID() : undefined;

      void logger.info('mcp_request', {
        message: 'Processing MCP request',
        sessionId: plannedSid || sessionIdHeader,
        isInitialize,
        hasSessionIdHeader: !!sessionIdHeader,
        hasAuthorizationHeader: !!req.headers.authorization,
        requestMethod: req.method,
        bodyMethod: (body as { method?: string })?.method,
      });

      let transport = sessionIdHeader ? transports.get(sessionIdHeader) : undefined;
      if (!transport) {
        const created = new StreamableHTTPServerTransport({
          sessionIdGenerator: isInitialize ? () => plannedSid as string : undefined,
          onsessioninitialized: isInitialize
            ? (sid: string) => {
                transports.set(sid, created);
                void logger.info('mcp', {
                  message: 'Session initialized',
                  sessionId: sid,
                });
              }
            : undefined,
        });
        transport = created;
      }

      transport.onerror = (error) => {
        void logger.error('transport', {
          message: 'Transport error',
          error: error.message,
        });
      };

      // Create request context if body has an ID
      if (body && typeof body === 'object' && 'id' in body && body.id) {
        const authContext = (c as unknown as HonoContextWithAuth).authContext;

        contextRegistry.create(body.id as string | number, plannedSid, {
          authStrategy: authContext?.strategy,
          authHeaders: authContext?.authHeaders,
          resolvedHeaders: authContext?.resolvedHeaders,
          providerToken: authContext?.providerToken,
          provider: authContext?.provider,
          rsToken: authContext?.rsToken,
        });
      }

      await ensureConnected(plannedSid ?? sessionIdHeader ?? '', transport);

      // SDK passes requestId to tool handlers, which look up auth context from registry
      await transport.handleRequest(req, res, body);

      res.on('close', () => {
        void logger.debug('mcp', { message: 'Request closed' });
      });

      return toFetchResponse(res);
    } catch (error) {
      void logger.error('mcp', {
        message: 'Error handling POST request',
        error: (error as Error).message,
      });
      return c.json(
        {
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        },
        500,
      );
    }
  });

  app.get('/', async (c) => {
    const { req, res } = toReqRes(c.req.raw.clone());
    const sessionIdHeader = c.req.header(MCP_SESSION_HEADER);
    if (!sessionIdHeader) {
      return c.json(
        {
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Method not allowed - no session' },
          id: null,
        },
        405,
      );
    }
    try {
      const transport = transports.get(sessionIdHeader);
      if (!transport) {
        return c.text('Invalid session', 404);
      }
      await ensureConnected(sessionIdHeader, transport);
      await transport.handleRequest(req, res);
      return toFetchResponse(res);
    } catch (error) {
      void logger.error('mcp', {
        message: 'Error handling GET request',
        error: (error as Error).message,
      });
      return c.json(
        {
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        },
        500,
      );
    }
  });

  app.delete('/', async (c) => {
    const { req, res } = toReqRes(c.req.raw.clone());
    const sessionIdHeader = c.req.header(MCP_SESSION_HEADER);
    if (!sessionIdHeader) {
      return c.json(
        {
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Method not allowed - no session' },
          id: null,
        },
        405,
      );
    }
    try {
      const transport = transports.get(sessionIdHeader);
      if (!transport) {
        return c.text('Invalid session', 404);
      }
      await ensureConnected(sessionIdHeader, transport);
      await transport.handleRequest(req, res);
      transports.delete(sessionIdHeader);
      servers.delete(sessionIdHeader);
      transport.close();
      return toFetchResponse(res);
    } catch (error) {
      void logger.error('mcp', {
        message: 'Error handling DELETE request',
        error: (error as Error).message,
      });
      return c.json(
        {
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        },
        500,
      );
    }
  });

  return app;
}
