/**
 * Calendar tools — STUB implementation.
 *
 * Proton Bridge does not currently expose CalDAV endpoints. Once Bridge
 * supports calendar, this module should be replaced with a real CalDAV
 * client using `tsdav` or similar (see spec specs/bridge-mcp/).
 *
 * For now, three tools are registered so MCP clients can discover them:
 * they always return `{ available: false }` with an explanatory message.
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { createLogger } from '../config.js'

type Logger = ReturnType<typeof createLogger>

export function registerCalendarTools(
  server: McpServer,
  deps: { log: Logger; enabled: boolean },
) {
  if (!deps.enabled) return

  deps.log.warn('Calendar tools are stubs — CalDAV not yet exposed by Proton Bridge.')

  const unavailable = JSON.stringify({
    available: false,
    reason: 'Calendar CalDAV not yet exposed by Proton Bridge.',
  })

  for (const t of [
    'proton_calendar_list_events',
    'proton_calendar_create_event',
    'proton_calendar_list_calendars',
  ]) {
    server.registerTool(
      t,
      {
        title: t,
        description: `[STUB] ${t}`,
        inputSchema: {},
        annotations: { readOnlyHint: true, openWorldHint: true },
      },
      () => ({ content: [{ type: 'text', text: unavailable }] }),
    )
  }
}
