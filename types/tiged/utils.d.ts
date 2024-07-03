import { TigedErrorCode } from './index'

export const tigedConfigName: string

export class TigedError extends Error {
  code: TigedErrorCode
  original?: Error | undefined
  ref?: string | undefined
  url?: string | undefined
}

export function tryRequire(
  file: string,
  opts?: {
    clearCache?: true | undefined;
  },
): unknown;

export function exec(command: string): Promise<{ stdout: string; stderr: string }>;

export function mkdirp(dir: string): void;

export function fetch(url: string, dest: string, proxy: string): Promise<void>;

export function stashFiles(dir: string, dest: string): void;

export function unstashFiles(dir: string, dest: string): void;

export const base: string
