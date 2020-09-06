const path = require("path");
const nodeExternals = require("../app/hello-world/node_modules/webpack-node-externals");
const WebpackShellPlugin = require("../app/hello-world/node_modules/webpack-shell-plugin");
const TsconfigPathsPlugin = require("../app/hello-world/node_modules/tsconfig-paths-webpack-plugin");

const { NODE_ENV = "production" } = process.env;

module.exports = env => {
    const plugins =
        env && env.run === "true"
            ? [
                  new WebpackShellPlugin({
                      onBuildEnd: ["yarn run:dev"]
                  })
              ]
            : [];

    return {
        entry: "./src/index.ts",
        mode: NODE_ENV,
        target: "node",
        devtool: "source-map",

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: ["ts-loader"]
                }
            ]
        },

        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "index.js"
        },

        resolve: {
            extensions: [".ts", ".js"],
            plugins: [new TsconfigPathsPlugin()]
        },

        plugins,

        externals: [nodeExternals({ modulesDir: "../../node_modules" })],
        watch: NODE_ENV === "development"
    };
};
