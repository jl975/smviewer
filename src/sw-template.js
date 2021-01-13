if (typeof importScripts === "function") {
  importScripts("https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js");
  importScripts("https://cdnjs.cloudflare.com/ajax/libs/localforage/1.9.0/localforage.js");

  console.log("localforage", localforage);

  /* global workbox */
  if (workbox) {
    console.log("Workbox is loaded");
    workbox.core.skipWaiting();

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

    /* custom cache rules */
    cacheFonts();
    cacheJackets();
    cacheGraphics();
    cacheSimfiles();
    // cacheAudio();
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

// function getLocalDirectory(data) {
//   const { request, url } = data;

//   // only allow same-origin requests
//   if (request.referrer.indexOf(url.origin) === -1) {
//     return null;
//   }

//   const directory = /^\/([a-z]+)\//.exec(url.pathname);
//   if (directory) {
//     return directory[1];
//   }
//   return null;
// }

// function cacheAudio() {
//   const { registerRoute } = workbox.routing;

//   const matchCallback = (data) => {
//     console.log("matchCallback data", data);
//     return data.request.destination === "audio";
//   };

//   const handlerCallback = async (data) => {
//     console.log("handlerCallback data", data);

//     // loadAudio(data.request.url);

//     // const response = await fetch(data.request);
//     // console.log("handlerCallback response", response);

//     // const resBlob = await response.blob();
//     // console.log("resBlob", resBlob);

//     // return new Response(resBlob);

//     return new Response("lolol");
//   };

//   registerRoute(matchCallback, handlerCallback);
// }

function cacheSimfiles() {
  const { registerRoute } = workbox.routing;
  const { StaleWhileRevalidate } = workbox.strategies;
  const { CacheableResponsePlugin } = workbox.cacheableResponse;
  const { ExpirationPlugin } = workbox.expiration;

  const cacheName = "simfiles";

  // const matchCallback = (data) => {
  //   console.log("matchCallback data", data);
  //   return getLocalDirectory(data) === "simfiles";
  // };

  registerRoute(
    // matchCallback,
    new RegExp("/simfiles/.*\\.[sm|ssc]"),
    new StaleWhileRevalidate({
      cacheName,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 100,
        }),
      ],
    })
  );
}

function cacheJackets() {
  const { registerRoute } = workbox.routing;
  const { CacheFirst } = workbox.strategies;
  const { CacheableResponsePlugin } = workbox.cacheableResponse;
  const { ExpirationPlugin } = workbox.expiration;

  const cacheName = "jackets";

  // const matchCallback = (data) => {
  //   return getLocalDirectory(data) === "jackets" && data.request.destination === "image";
  // };

  registerRoute(
    // matchCallback,
    new RegExp("/jackets/.*\\.png"),
    new CacheFirst({
      cacheName,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );
}

function cacheGraphics() {
  const { registerRoute } = workbox.routing;
  const { CacheFirst } = workbox.strategies;
  const { CacheableResponsePlugin } = workbox.cacheableResponse;
  const { ExpirationPlugin } = workbox.expiration;

  const cacheName = "graphics";

  // const matchCallback = (data) => {
  //   return getLocalDirectory(data) === "assets" && data.request.destination === "image";
  // };

  registerRoute(
    // matchCallback,
    new RegExp("/assets/.*\\.png"),
    new CacheFirst({
      cacheName,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );
}

function cacheFonts() {
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
}
