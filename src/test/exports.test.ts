import {
  NodeFS, createEnvProvider, createGitProvider, createTmpDirProvider, NODE_ENV,
} from '../index'


test('all necessary stuff are exported.', () => {
  expect(NodeFS).not.toBe(undefined)
  expect(createEnvProvider).not.toBe(undefined)
  expect(createGitProvider).not.toBe(undefined)
  expect(createTmpDirProvider).not.toBe(undefined)
  expect(NODE_ENV).not.toBe(undefined)
})
