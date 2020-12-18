const workboxBuild = require("workbox-build");

const buildSW = () => {
  workboxBuild
    .injectManifest({
      swSrc: "src/sw-template.js",
      swDest: "build/service-worker.js",
      globDirectory: "build",
      globPatterns: [
        "index.html",
        "manifest.json",
        "static/css/**.css",
        "static/js/**.js",
        "static/media/**.*",
        "data/simfiles.tsv",
      ],
    })
    .then(({ count, size, warnings }) => {
      // Optionally, log any warnings and details.
      warnings.forEach(console.warn);
      console.log(`${count} files will be precached, totaling ${size} bytes.`);
    })
    .catch((err) => {
      console.log("Uh oh :|", err);
    });
};
buildSW();
