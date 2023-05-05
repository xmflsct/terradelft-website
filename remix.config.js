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
  future: {
    v2_errorBoundary: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true
  }
}
