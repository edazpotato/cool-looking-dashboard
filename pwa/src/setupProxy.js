const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
	app.use((_, res, next) => {
		res.header("Cross-Origin-Opener-Policy", "same-origin");
		res.header("Cross-Origin-Embedder-Policy", "require-corp");
		next();
	});
	app.use(
		"/",
		createProxyMiddleware({
			target: "http://localhost:8000",
			changeOrigin: true,
		})
	);
};
