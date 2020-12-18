if (typeof importScripts === "function") {
  importScripts("https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js");

  /* global workbox */
  if (workbox) {
    console.log("Workbox is loaded");
    workbox.core.skipWaiting();

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

    // /* custom cache rules */
    const { registerRoute } = workbox.routing;
    const { StaleWhileRevalidate, CacheFirst } = workbox.strategies;
    const { ExpirationPlugin } = workbox.expiration;

    registerRoute(
      ({ url }) => url.origin === "https://fonts.googleapis.com",
      new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
      })
    );

    registerRoute(
      ({ url }) => url.origin === "https://fonts.gstatic.com",
      new CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new workbox.cacheableResponse.CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxAgeSeconds: 60 * 60 * 24 * 365,
            maxEntries: 30,
          }),
        ],
      })
    );
    // googleFontsCache();
    //  workbox.routing.registerRoute(
    //   new workbox.routing.NavigationRoute(
    //     new workbox.strategies.NetworkFirst({
    //       cacheName: 'PRODUCTION',
    //     })
    //   )
    // );
  } else {
    console.log("Workbox could not be loaded. No Offline support");
  }
}
