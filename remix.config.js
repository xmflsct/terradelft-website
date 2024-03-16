/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  server: './server.ts',
  devServerBroadcastDelay: 2000,
  ignoredRouteFiles: ['**/.*'],
  serverBuildPath: 'functions/[[path]].js',
  serverConditions: ['worker'],
  serverMainFields: ['browser', 'module', 'main'],
  serverModuleFormat: 'esm',
  serverPlatform: 'neutral',
  serverDependenciesToBundle: 'all',
  serverMinify: true,
  serverNodeBuiltinsPolyfill: {
    modules: {}
  }
}
