// istanbul ignore file

import { FlowEnv } from '@tmplr/core'

const EVENTS = [
  'beforeExit',
  'SIGINT',
  'SIGTERM',
  'SIGHUP',
  'SIGUSR1',
  'SIGUSR2',
  'uncaughtException',
  'unhandledRejection',
]

const handlers: (() => Promise<void>)[] = []

EVENTS.forEach(event => process.on(event, async () => {
  for (const handler of handlers) {
    await handler()
  }

  process.exit()
}))

export const NODE_ENV: FlowEnv = {
  onKill: (handler) => {
    handlers.push(handler)

    return () => handlers.splice(handlers.indexOf(handler), 1)
  }
}
