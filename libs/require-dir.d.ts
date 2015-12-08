declare module "require-dir" {
  module m {
    interface Opts {
      recurse?: boolean,
      camelcase?: boolean,
      duplicates?: boolean
    }
    function requireDir(path:string, opt:Opts)
  }
  export = m
}