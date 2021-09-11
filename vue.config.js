module.exports = {
  assetsDir: "static",
  filenameHashing: false,
  // delete HTML related webpack plugins
  chainWebpack: (config) => {
    config.plugins.delete("html");
    config.plugins.delete("preload");
    config.plugins.delete("prefetch");
  },
  pages: {
    index: {
      entry: "src/pages/index/main.ts",
      template: "public/index.html",
      filename: "index.html",
      title: "Index Page",
      //   chunks: ["chunk-vendors", "chunk-common", "index"],
    },
    hello: {
      entry: "src/pages/hello/main.ts",
      template: "public/hello.html",
      filename: "hello.html",
      title: "Hello Page",
      //   chunks: ["chunk-vendors", "chunk-common", "hello"],
    },
  },
};
