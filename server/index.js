import express from 'express';
import apiRouter from './api.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Mount API routes
app.use(apiRouter);

app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📡 Proxying Gemini API requests (API key secured)`);
});
