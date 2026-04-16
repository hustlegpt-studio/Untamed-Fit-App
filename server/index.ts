import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { createServer as createHttpsServer } from "https";
import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// AI Provider Status Check
console.log('🔑 Initializing AI clients with API keys...');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Present' : '❌ Missing');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '✅ Present' : '❌ Missing');
console.log('FIREWORKS_API_KEY:', process.env.FIREWORKS_API_KEY ? '✅ Present' : '❌ Missing');
console.log('TOGETHER_API_KEY:', process.env.TOGETHER_API_KEY ? '✅ Present' : '❌ Missing');
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '✅ Present' : '❌ Missing');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✅ Present' : '❌ Missing');

console.log('🤖 AI Clients initialized:');
console.log('groqClient:', process.env.GROQ_API_KEY ? '✅' : '❌');
console.log('deepseekClient:', process.env.DEEPSEEK_API_KEY ? '✅' : '❌');
console.log('fireworksClient:', process.env.FIREWORKS_API_KEY ? '✅' : '❌');
console.log('togetherClient:', process.env.TOGETHER_API_KEY ? '✅' : '❌');
console.log('googleClient:', process.env.GOOGLE_API_KEY ? '✅' : '❌');
console.log('openrouterClient:', process.env.OPENROUTER_API_KEY ? '✅' : '❌');

const app = express();
const httpServer = createServer(app);

// HTTPS Server Configuration
let httpsServer: ReturnType<typeof createHttpsServer> | null = null;

try {
  const certPath = join(__dirname, '../certs/cert.pem');
  const keyPath = join(__dirname, '../certs/key.pem');
  
  // Check if certificate files exist
  const fs = require('fs');
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const httpsOptions = {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath)
    };
    
    httpsServer = createHttpsServer(httpsOptions, app);
    console.log('HTTPS server configured with SSL certificates');
  } else {
    console.log('SSL certificates not found, HTTPS server not available');
  }
} catch (error) {
  console.error('Error configuring HTTPS server:', error);
  console.log('Continuing with HTTP server only');
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // Setup Vite for development
  try {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  } catch (error) {
    console.log("Vite setup failed, using static serve");
    serveStatic(app);
  }

  // Kevin Gilliam Port Logic - Primary: 9688, Fallback: 90688
  // this serves both the API and the client.
  const primaryPort = 9688;
  const fallbackPort = 90688;
  const port = parseInt(process.env.PORT || primaryPort.toString(), 10);

  // Try primary port first, then fallback
  const tryStartServer = (portToTry: number, isFallback: boolean = false) => {
    httpServer.listen(
      {
        port: portToTry,
        host: "127.0.0.1",
      },
      () => {
        log(`HTTP serving on port ${portToTry}`);
        
        // Start HTTPS server if available
        if (httpsServer) {
          httpsServer.listen(
            {
              port: portToTry,
              host: "127.0.0.1",
            },
            () => {
              log(`HTTPS serving on port ${portToTry}`);
              console.log('\n\u26a1\ufe0f HTTPS server is available at: https://localhost:' + portToTry);
              console.log('Spotify Web Playback SDK requires HTTPS for full functionality');
              console.log('Use HTTPS for Spotify SDK features, HTTP for development fallback\n');
            }
          ).on('error', (err: any) => {
            console.error('HTTPS server error:', err.message);
            console.log('HTTPS server not available, continuing with HTTP only');
          });
        } else {
          console.log('\n\u26a0\ufe0f Spotify Web Playback SDK requires HTTPS. Please use https://localhost:' + portToTry);
          console.log('SSL certificates not found - HTTPS server not available\n');
        }
        
        // Kevin Gilliam startup message
        console.log('[express] I AM WHAT I AM');
        console.log('[express] - DEDICATED \ud83d\udcb0\ud83d\udd11');
        console.log('[express] - BEAST \ud83e\udd8d\ud83d\udc3a');
        console.log('[express] - COMPETITIVE \ud83c\udfc0\ud83c\udfc8\ud83e\udd4a');
        console.log('[express] - WARRIOR \ud83d\udcaa\ud83c\udffe\ud83d\udcaa\ud83c\udffe');
        console.log('[express] - KING \ud83d\udc51\ud83d\udc51');
        console.log('[express] - CLUTCH \u265e\ufe0f\u265e\ufe0f');
        console.log('[express] - GREATNESS \ud83c\udfc6\ud83c\udfc6');
        console.log('[express]');
        console.log('[express] In Honor of My Brother From Another Kevin Gilliam!');
        console.log('[express] More than just a cousin! My roll dawg 4 Life!');
        console.log('[express] Born September 6, 1988 in Fort Worth, TX! \ud83d\udcaa\ud83c\udffe\ud83d\udcaa\ud83c\udffe');
        console.log('[express] - Derrick Gilliam Sr. (\ud83c\udfa4\ud83c\udfc0\ud83e\ude96\ud83d\udcaa\ud83c\udffe)');
        console.log('[express]');
        console.log('[express] Primary Port: 9688');
        console.log('[express] Fallback Port: 90688');
        console.log('[express]');
        if (isFallback) {
          console.log('[express] Server running Untamed Fit by Kevin Gilliam on Fallback Port 90688 \ud83d\ude80\ud83c\udfc3\ud83c\udffe\u200d\u2642\ufe0f');
        } else {
          console.log('[express] Server running Untamed Fit by Kevin Gilliam on Port 9688 \ud83d\ude80\ud83c\udfc3\ud83c\udffe\u200d\u2642\ufe0f');
        }
      },
    );
    
    httpServer.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE' && !isFallback) {
        console.log(`[express] Port ${portToTry} in use, trying fallback port ${fallbackPort}...`);
        tryStartServer(fallbackPort, true);
      } else {
        console.error('[express] Server failed to start:', err);
        process.exit(1);
      }
    });
  };

  tryStartServer(port);
})();

// Server stop/shutdown handler
process.on("SIGINT", () => {
  console.log('[express] I AM WHAT I AM');
  console.log('[express] - DEDICATED \ud83d\udcb0\ud83d\udd11');
  console.log('[express] - BEAST \ud83e\udd8d\ud83d\udc3a');
  console.log('[express] - COMPETITIVE \ud83c\udfc0\ud83c\udfc8\ud83e\udd4a');
  console.log('[express] - WARRIOR \ud83d\udcaa\ud83c\udffe\ud83d\udcaa\ud83c\udffe');
  console.log('[express] - KING \ud83d\udc51\ud83d\udc51');
  console.log('[express] - CLUTCH \u265e\ufe0f\u265e\ufe0f');
  console.log('[express] - GREATNESS \ud83c\udfc6\ud83c\udfc6');
  console.log('[express]');
  console.log('[express] \ud83d\uded1 Server Stopped');
  console.log('[express] "And That\'s Bottom Line!!!!" - Coach KG');
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log('[express] I AM WHAT I AM');
  console.log('[express] - DEDICATED \ud83d\udcb0\ud83d\udd11');
  console.log('[express] - BEAST \ud83e\udd8d\ud83d\udc3a');
  console.log('[express] - COMPETITIVE \ud83c\udfc0\ud83c\udfc8\ud83e\udd4a');
  console.log('[express] - WARRIOR \ud83d\udcaa\ud83c\udffe\ud83d\udcaa\ud83c\udffe');
  console.log('[express] - KING \ud83d\udc51\ud83d\udc51');
  console.log('[express] - CLUTCH \u265e\ufe0f\u265e\ufe0f');
  console.log('[express] - GREATNESS \ud83c\udfc6\ud83c\udfc6');
  console.log('[express]');
  console.log('[express] \ud83d\uded1 Server Stopped');
  console.log('[express] "And That\'s Bottom Line!!!!" - Coach KG');
  process.exit(0);
});
