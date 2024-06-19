import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

import Components from "unplugin-vue-components/vite";
// 如果使用模板方式进行开发，可以使用 unplugin-vue-components 插件来按需自动加载组件
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";

import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), "");
  console.log("mode：", mode, "VITE_DROP_CONSOLE：", env.VITE_DROP_CONSOLE);
  return {
    plugins: [
      vue(),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons/svg")],
        // 指定symbolId格式
        symbolId: "icon-[name]",
      }),
      Components({
        resolvers: [NaiveUiResolver()],
      }),
      visualizer({
        emitFile: false,
        file: "stats.html", //分析图生成的文件名
      }),
      viteCompression({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /.js$|.css$|.html$/,
        threshold: 10240, // 对超过10k的数据压缩
        minRatio: 0.8, // 压缩率小于0.8才会压缩
      }),
      ViteImageOptimizer({
        png: { quality: 80 },
        jpeg: { quality: 80 },
        jpg: { quality: 80 },
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
      hmr: true,
      proxy: {
        "/api": {
          target: "http://localhost:8181",
          ws: false, // 这里把ws代理给关闭
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    esbuild: {
      pure: env.VITE_DROP_CONSOLE ? ["console.log", "debugger"] : [],
    },
    build: {
      // 禁用 gzip 压缩大小报告，可略微减少打包时间
      reportCompressedSize: false,
      sourcemap: false,
      rollupOptions: {
        treeshake: true,
        output: {
          chunkFileNames: "js/[name]-[hash].js", // 用于命名代码拆分时创建的共享块的输出命名
          entryFileNames: "js/[name]-[hash].js", // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
          // 根据不同的js库 拆分包，减少index.js包体积 ; 
          manualChunks(id) {
            if (id.startsWith("virtual:svg-icons-")) {
              return "sprite";
            }
            if (id.includes("node_modules")) {
              // 最小化拆分包
              const basic = id.toString().split("node_modules/")[1];
              const sub1 = basic.split("/")[0];
              return sub1.toString();
            }
          },
        },
      },
    },
  };
});
