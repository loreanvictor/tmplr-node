import { 
  NodeFS, createEnvProvider, createGitProvider, createTmpDirProvider
} from '../index'


test('all necessary stuff are exported.', () => {
  expect(NodeFS).not.toBe(undefined)
  expect(createEnvProvider).not.toBe(undefined)
  expect(createGitProvider).not.toBe(undefined)
  expect(createTmpDirProvider).not.toBe(undefined)
})
