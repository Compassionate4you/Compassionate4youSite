// Express app config.
const express = require('express');
const cors = require('cors');

const chatbotRoutes = require('./routes/chatbotRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/chatbot', chatbotRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/portal', portalRoutes);
// app.use('/api/services', serviceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
