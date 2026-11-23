import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/*
  Local helper: when you run "npm run dev", requests to /api/mochi are handled
  by the same code Netlify runs (netlify/functions/mochi-chat.mjs), using the
  key from your .env file. On Netlify itself this isn't used.
*/
function mochiApiDev(env) {
  return {
    name: "mochi-api-dev",
    configureServer(server) {
      server.middlewares.use("/api/mochi", async (req, res) => {
        try {
          for (const k of ["GROQ_API_KEY", "GROQ_MODEL", "GROQ_API_URL", "ANTHROPIC_API_KEY", "ANTHROPIC_WORKSPACE_ID", "MOCHI_MODEL", "MOCHI_API_URL"]) {
            if (env[k]) process.env[k] = env[k];
          }
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const { default: handler } = await server.ssrLoadModule("/netlify/functions/mochi-chat.mjs");
          const request = new Request("http://localhost/api/mochi", {
            method: req.method,
            headers: { "content-type": "application/json" },
            body: req.method === "POST" ? Buffer.concat(chunks) : undefined
          });
          const response = await handler(request, { ip: "local" });
          res.statusCode = response.status;
          res.setHeader("content-type", "application/json");
          res.end(await response.text());
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "dev_error", detail: String(err) }));
        }
      });
    }
  };
}

// base: "./" lets the built site work from any folder
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return { plugins: [react(), mochiApiDev(env)], base: "./" };
});
