import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';

const PORT = 3000;
const JWT_SECRET = 'elevate-secret-key-12345';
const DATA_FILE = path.resolve('users.json');
const CONFIG_FILE = path.resolve('config.json');

// Ensure config file exists
const initializeConfigFile = () => {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }, null, 2));
  }
};

initializeConfigFile();

const readConfig = () => {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch (err) {
    return { googleClientId: '', googleClientSecret: '' };
  }
};

const writeConfig = (config: any) => {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};

const config = readConfig();
const googleClient = new OAuth2Client(
  config.googleClientId || process.env.GOOGLE_CLIENT_ID,
  config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET
);

// Ensure data file exists and is valid
const initializeDataFile = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
      return;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8').trim();
    if (!content) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
      return;
    }
    JSON.parse(content); // Test if valid JSON
  } catch (err) {
    console.error('Data file corrupted, resetting to empty:', err);
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
  }
};

initializeDataFile();

const readData = () => {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8').trim();
    if (!content) return { users: [] };
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading data file:', err);
    return { users: [] };
  }
};
const writeData = (data: any) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing data file:', err);
  }
};

const app = express();
export default app;

async function startServer() {
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  // API routes go here
  app.get('/api/health', (req, res) => {
    try {
      const data = readData();
      const stats = fs.statSync(DATA_FILE);
      res.json({ 
        status: 'ok', 
        userCount: data.users.length,
        fileSize: stats.size,
        env: process.env.NODE_ENV
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Failed to read data file' });
    }
  });

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.userId = decoded.userId;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- Auth Routes ---
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const data = readData();
      if (data.users.find((u: any) => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: uuidv4(),
        email,
        password: hashedPassword,
        name,
        messageCount: 0,
        habits: [],
        tasks: [],
        aiMemory: [],
        aiSettings: {
          apiKey: '',
          name: 'Elevate AI',
          persona: 'Coach',
          behavior: 'Motivating and strict.',
          model: 'gemini-3-flash-preview',
          voice: 'Zephyr',
          avatar: '',
          mode: 'chat',
        },
        userProfile: {
          name: name,
          dob: '',
          about: '',
          goals: '',
          instagram: '',
          avatar: '',
          offDays: [],
          notifications: [{
            id: uuidv4(),
            title: 'Account Created',
            message: `Welcome ${name}! Your Elevate account has been successfully created.`,
            date: new Date().toISOString(),
            read: false
          }]
        },
        theme: 'light',
      };

      data.users.push(newUser);
      writeData(data);

      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });
      const isLocal = req.get('host')?.includes('localhost');
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: !isLocal, 
        sameSite: isLocal ? 'lax' : 'none', 
        maxAge: 30 * 24 * 60 * 60 * 1000 
      });
      res.json({ user: newUser });
    } catch (err: any) {
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Internal server error during signup' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
      }

      const data = readData();
      const user = data.users.find((u: any) => u.email === email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
      const isLocal = req.get('host')?.includes('localhost');
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: !isLocal, 
        sameSite: isLocal ? 'lax' : 'none', 
        maxAge: 30 * 24 * 60 * 60 * 1000 
      });
      res.json({ user });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    const isLocal = req.get('host')?.includes('localhost');
    res.clearCookie('token', { 
      httpOnly: true, 
      secure: !isLocal, 
      sameSite: isLocal ? 'lax' : 'none' 
    });
    res.json({ success: true });
  });

  // --- Google OAuth Routes ---
  app.get('/api/auth/google/url', (req, res) => {
    const config = readConfig();
    const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      return res.status(400).json({ error: 'Google Client ID is not configured. Please set it in the Admin panel or environment variables.' });
    }

    const host = req.get('host') || '';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = isLocal ? req.protocol : 'https';
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
    const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/auth/google/callback`;
    
    // Re-initialize client if config changed
    const currentClient = new OAuth2Client(
      clientId,
      config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET
    );

    const url = currentClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      redirect_uri: redirectUri,
    });
    res.json({ url });
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code } = req.query;
      const config = readConfig();
      const clientId = config.googleClientId || process.env.GOOGLE_CLIENT_ID;
      const clientSecret = config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId) {
        throw new Error('Google Client ID not configured');
      }

      const host = req.get('host') || '';
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      const protocol = isLocal ? req.protocol : 'https';
      const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
      const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/auth/google/callback`;
      
      const currentClient = new OAuth2Client(clientId, clientSecret);

      const { tokens } = await currentClient.getToken({
        code: code as string,
        redirect_uri: redirectUri,
      });
      currentClient.setCredentials(tokens);

      const ticket = await currentClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Google auth failed');

      const { email, name, sub: googleId, picture } = payload;
      const data = readData();
      let user = data.users.find((u: any) => u.email === email || u.googleId === googleId);

      if (!user) {
        user = {
          id: uuidv4(),
          googleId,
          email,
          name,
          messageCount: 0,
          habits: [],
          tasks: [],
          aiMemory: [],
          aiSettings: {
            apiKey: '',
            name: 'Elevate AI',
            persona: 'Coach',
            behavior: 'Motivating and strict.',
            model: 'gemini-3-flash-preview',
            voice: 'Zephyr',
            avatar: '',
            mode: 'chat',
          },
          userProfile: {
            name: name,
            dob: '',
            about: '',
            goals: '',
            instagram: '',
            avatar: picture || '',
            offDays: [],
            notifications: [{
              id: uuidv4(),
              title: 'Welcome to Elevate!',
              message: 'Your personal operating system is ready. Start by setting your goals.',
              date: new Date().toISOString(),
              read: false
            }]
          },
          theme: 'light',
        };
        data.users.push(user);
        writeData(data);
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: !isLocal, 
        sameSite: isLocal ? 'lax' : 'none', 
        maxAge: 30 * 24 * 60 * 60 * 1000 
      });
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. Closing window...</p>
          </body>
        </html>
      `);
    } catch (err) {
      console.error('Google callback error:', err);
      res.status(500).send('Authentication failed');
    }
  });

  app.get('/api/auth/me', authenticate, (req: any, res) => {
    const data = readData();
    const user = data.users.find((u: any) => u.id === req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });

  // --- Data Routes ---
  app.post('/api/user/sync', authenticate, (req: any, res) => {
    const { habits, tasks, aiMemory, aiSettings, userProfile, chatHistory, theme, messageCount } = req.body;
    const data = readData();
    const userIndex = data.users.findIndex((u: any) => u.id === req.userId);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    data.users[userIndex] = {
      ...data.users[userIndex],
      habits,
      tasks,
      aiMemory,
      aiSettings,
      userProfile,
      chatHistory,
      theme,
      messageCount: messageCount ?? data.users[userIndex].messageCount,
    };

    writeData(data);
    res.json({ success: true });
  });

  // --- Config Routes ---
  app.get('/api/admin/config', authenticate, (req: any, res) => {
    const data = readData();
    const currentUser = data.users.find((u: any) => u.id === req.userId);
    if (currentUser.email !== 'prantorahman6900@gmail.com') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(readConfig());
  });

  app.post('/api/admin/config', authenticate, (req: any, res) => {
    const data = readData();
    const currentUser = data.users.find((u: any) => u.id === req.userId);
    if (currentUser.email !== 'prantorahman6900@gmail.com') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { googleClientId, googleClientSecret } = req.body;
    writeConfig({ googleClientId, googleClientSecret });
    res.json({ success: true });
  });

  // --- Admin Routes ---
  app.get('/api/admin/users', authenticate, (req: any, res) => {
    const data = readData();
    const currentUser = data.users.find((u: any) => u.id === req.userId);
    // Simple admin check: first user or specific email
    if (currentUser.email !== 'prantorahman6900@gmail.com') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({ users: data.users.map((u: any) => ({ 
      id: u.id, 
      email: u.email, 
      name: u.name, 
      messageCount: u.messageCount 
    })) });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error('Vite middleware error:', err);
    }
  } else {
    const distPath = path.resolve('dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  // Always listen in development or if not on Vercel
  const isVercel = !!process.env.VERCEL;
  if (!isVercel || process.env.NODE_ENV !== 'production') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
