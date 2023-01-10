import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const Sequencer = require('@jest/test-sequencer').default

export default class CustomSequencer extends Sequencer {
  sort(tests) {
    return super.sort(tests).sort((a, b) => (a.path > b.path ? 1 : -1))
  }
}
