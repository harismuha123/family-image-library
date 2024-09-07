const { createProxyMiddleware } = require('http-proxy-middleware');
const oauth2Client = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
};

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://photoslibrary.googleapis.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/v1',
      },
      onProxyReq: async (proxyReq, req, res) => {
        const tokenConfig = {
          code: "4/0AQlEd8zZ4-W7jHk_DZM9vXU1x7Ef9vpHVh2CpKeSfas6FCHwxXWQ-ykCoES-CZGAUDy7mg",
          redirect_uri: 'http://localhost:3000/callback',
          scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
        };
        const tokenResponse = await fetch(oauth2Client.tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code: "4/0AQlEd8zZ4-W7jHk_DZM9vXU1x7Ef9vpHVh2CpKeSfas6FCHwxXWQ-ykCoES-CZGAUDy7mg",
            client_id: oauth2Client.clientId,
            client_secret: oauth2Client.clientSecret,
            redirect_uri: 'http://localhost:3000/callback',
            grant_type: 'authorization_code',
          }),
        });
        const tokens = await tokenResponse.json();
        proxyReq.setHeader('Authorization', `Bearer ${tokens.token}`);
      },
      onProxyRes: function (proxyRes, req, res) {
        if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
          proxyRes.destroy();
        }
      },
    })
  );
};
