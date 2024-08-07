import { EventEmitter } from 'events'

declare class Tiged extends EventEmitter {
  constructor(src: string, opts?: tiged.Options);

  /**
   * @async
   */
  clone(dest: string): Promise<void>;
  /**
   * @async
   */
  remove(dir: string, dest: string, action: tiged.RemoveAction): Promise<void>;
  on(event: 'info' | 'warn', callback: (info: tiged.Info) => void): this;
}

declare function tiged(src: string, opts?: tiged.Options): Tiged;
declare namespace tiged {
  interface Options {
    /**
     * @default false
     */
    offlineMode?: boolean | undefined;
    /**
     * @default false
     */
    disableCache?: boolean | undefined;
    /**
     * @default false
     */
    subgroup?: boolean | undefined;
    /**
     * @default undefined
     */
    'sub-directory'?: string | undefined;
    /**
     * @default false
     */
    cache?: boolean | undefined;
    /**
     * @default false
     */
    force?: boolean | undefined;
    /**
     * @default undefined
     */
    mode?: ValidModes | undefined;
    /**
     * @default false
     */
    verbose?: boolean | undefined;

  }

  // varia
  type ValidModes = 'tar' | 'git';

  type InfoCode =
    | 'SUCCESS'
    | 'FILE_DOES_NOT_EXIST'
    | 'REMOVED'
    | 'DEST_NOT_EMPTY'
    | 'DEST_IS_EMPTY'
    | 'USING_CACHE'
    | 'FOUND_MATCH'
    | 'FILE_EXISTS'
    | 'PROXY'
    | 'DOWNLOADING'
    | 'EXTRACTING';

  type TigedErrorCode =
    | 'DEST_NOT_EMPTY'
    | 'MISSING_REF'
    | 'COULD_NOT_DOWNLOAD'
    | 'BAD_SRC'
    | 'UNSUPPORTED_HOST'
    | 'BAD_REF'
    | 'COULD_NOT_FETCH';

  interface Info {
    readonly code: string;
    readonly message: string;
    readonly repo: Tiged;
    readonly dest: string;
  }

  interface Action {
    action: string;
    cache?: boolean | undefined;
    verbose?: boolean | undefined;
  }

  interface TigedAction extends Action {
    action: 'clone';
    src: string;
  }

  interface RemoveAction extends Action {
    action: 'remove';
    files: string[];
  }
}

export = tiged;
