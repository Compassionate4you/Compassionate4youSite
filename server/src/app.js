// Express app config.
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const chatbotRoutes = require('./routes/chatbotRoutes');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const { attachUser } = require('./middleware/authMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// credentials:true so the browser sends the session cookie on API calls.
app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/chatbot', chatbotRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
// app.use('/api/portal', portalRoutes);
// app.use('/api/services', serviceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
