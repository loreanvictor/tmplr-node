// istanbul ignore file

import { FlowEnv } from '@tmplr/core'

const EVENTS = [
  'exit',
  'SIGINT',
  'SIGTERM',
  'SIGHUP',
  'SIGUSR1',
  'SIGUSR2',
  'uncaughtException',
  'unhandledRejection',
]

const onkill = handler => EVENTS.forEach(event => process.on(event, handler))
const offkill = handler => EVENTS.forEach(event => process.off(event, handler))

const finalise = () => process.exit()
onkill(finalise)

export const NODE_ENV: FlowEnv = {
  onKill: (handler) => {
    // FIXME: Why do we need this?
    //       the issue stems from the fact that `offkill(wrapper)`
    //       for some reason will remove all handlers (or something like that).
    let skipped = false

    const wrapper = async () => {
      offkill(wrapper)

      if (!skipped) {
        await handler()
      }
    }

    offkill(finalise)
    onkill(wrapper)
    onkill(finalise)

    return () => skipped = true
  }
}
