/**
 *
 * This script is for testing the node environment.
 * I couldn't get it to run via the test runner, as it would
 * yield errors in a non-deterministic way. However it can be run
 * by hand, and that's why I'm keeping it.
 *
 * To run it, you need [bun](https://bun.sh/)
 * Run the following command: `npm run test:env`
 *
 * - If you wait for 5-6 seconds, the script should be killed, with 'Alice' printed.
 * - If you wait for 2-3 seconds and then kill the process, it should print `Alice`.
 * - If you cancel it fast, it should print `Bob` and `Alice`.
 */

import { NODE_ENV } from '../index.ts'


const i = setInterval(() => {}, 1000)
NODE_ENV.onKill(() => new Promise(resolve => {
  setTimeout(() => {
    console.log('Alice')
    resolve()
  }, 100)
}))
const r = NODE_ENV.onKill(async () => console.log('Bob'))

setTimeout(() => r(), 2000)
setTimeout(() => clearInterval(i), 5000)
