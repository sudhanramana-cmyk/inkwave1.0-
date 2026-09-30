import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './src/server/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createExpressApp();

  // Resolve port
  let port = 3000;
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    port = parseInt(process.argv[portArgIndex + 1], 10);
  } else {
    const inlinePortArg = process.argv.find(a => a.startsWith('--port='));
    if (inlinePortArg) {
      port = parseInt(inlinePortArg.split('=')[1], 10);
    } else if (process.env.PORT && process.env.PORT !== '8080') {
      port = parseInt(process.env.PORT, 10);
    }
  }

  const isProd = process.env.NODE_ENV === 'production';

  // Vite middleware in dev or static serving in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`INKWAVE server running on http://0.0.0.0:${port} [mode: ${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
