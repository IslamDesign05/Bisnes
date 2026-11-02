import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure database folder & file exist
function ensureDatabaseFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      _notice: "ВНУТРЕННЯЯ БАЗА ДАННЫХ: Все изменения автоматически сохраняются и синхронизируются через приложение на http://localhost:3000. Не перезаписывать искусственными данными.",
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      counter: 1006,
      orders: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

function readDatabase() {
  ensureDatabaseFile();
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file:', err);
    return {
      _notice: "ВНУТРЕННЯЯ БАЗА ДАННЫХ: Все изменения автоматически сохраняются и синхронизируются через приложение на http://localhost:3000. Не перезаписывать искусственными данными.",
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      counter: 1000,
      orders: []
    };
  }
}

function writeDatabase(data: any) {
  ensureDatabaseFile();
  data.lastUpdated = new Date().toISOString();
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

async function startServer() {
  const app = express();

  // Parse JSON payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS / Local headers for convenience
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // --- API ENDPOINTS (MUST BE BEFORE VITE MIDDLEWARE) ---

  // Health check & DB status
  app.get('/api/health', (req, res) => {
    const db = readDatabase();
    res.json({
      status: 'ok',
      dbConnected: true,
      totalOrders: db.orders?.length || 0,
      lastUpdated: db.lastUpdated || null,
      counter: db.counter || 1000
    });
  });

  // Get all orders and database meta
  app.get('/api/orders', (req, res) => {
    try {
      const db = readDatabase();
      res.json({
        success: true,
        orders: db.orders || [],
        counter: db.counter || 1000,
        lastUpdated: db.lastUpdated,
        version: db.version
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create or Update single order
  app.post('/api/orders', (req, res) => {
    try {
      const order = req.body;
      if (!order || !order.id) {
        res.status(400).json({ success: false, error: 'Order ID is required' });
        return;
      }

      const db = readDatabase();
      const orders = db.orders || [];
      const index = orders.findIndex((o: any) => o.id === order.id);

      if (index >= 0) {
        orders[index] = { ...orders[index], ...order };
      } else {
        orders.unshift(order);
      }

      // Update max counter if needed
      const maxNum = Math.max(...orders.map((o: any) => o.orderNumber || 0), db.counter || 1000);
      db.counter = maxNum;
      db.orders = orders;

      writeDatabase(db);
      res.json({ success: true, order, totalOrders: orders.length, lastUpdated: db.lastUpdated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Bulk sync full orders list from live client (e.g. after multiple edits, deletes, status changes)
  app.post('/api/orders/sync', (req, res) => {
    try {
      const { orders, counter } = req.body;
      if (!Array.isArray(orders)) {
        res.status(400).json({ success: false, error: 'orders array is required' });
        return;
      }

      const db = readDatabase();
      db.orders = orders;
      if (counter && typeof counter === 'number') {
        db.counter = Math.max(db.counter || 1000, counter);
      } else {
        const maxNum = Math.max(...orders.map((o: any) => o.orderNumber || 0), 1000);
        db.counter = maxNum;
      }

      writeDatabase(db);
      res.json({
        success: true,
        message: 'База данных успешно сохранена и синхронизирована',
        totalOrders: orders.length,
        lastUpdated: db.lastUpdated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete an order by ID
  app.delete('/api/orders/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();
      const orders = db.orders || [];
      const initialCount = orders.length;
      db.orders = orders.filter((o: any) => o.id !== id);

      writeDatabase(db);
      res.json({
        success: true,
        deleted: initialCount !== db.orders.length,
        totalOrders: db.orders.length,
        lastUpdated: db.lastUpdated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Restore full backup to internal database
  app.post('/api/orders/backup/restore', (req, res) => {
    try {
      const backup = req.body;
      let newOrders = [];
      if (Array.isArray(backup.orders)) {
        newOrders = backup.orders;
      } else if (Array.isArray(backup)) {
        newOrders = backup;
      } else {
        res.status(400).json({ success: false, error: 'Invalid backup JSON payload' });
        return;
      }

      const db = readDatabase();
      db.orders = newOrders;
      const maxNum = Math.max(...newOrders.map((o: any) => o.orderNumber || 0), 1000);
      db.counter = maxNum;

      writeDatabase(db);
      res.json({
        success: true,
        message: 'Резервная копия успешно восстановлена в базе данных',
        totalOrders: newOrders.length,
        lastUpdated: db.lastUpdated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- VITE MIDDLEWARE (DEV) & STATIC FILES (PROD) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Database Server] Сервер учета заказов запущен: http://localhost:${PORT}`);
    console.log(`[Database Server] Внутренняя БД: ${DB_FILE}`);
  });
}

startServer();
