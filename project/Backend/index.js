import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/database.js';
import lostFoundRoute from './routes/lostfoundRoute.js';
import userRoute from './routes/userRoute.js';
import adminRoute from './routes/adminRoute.js';
import postRoute from './routes/postRoute.js';
import eventRoute from './routes/eventRoute.js'; // ✅ import events route
import activityRoute from './routes/activityRoute.js'; // ✅ import activities route
import noticeRoute from "./routes/noticeRoute.js";
import placementRoute from "./routes/placementRoute.js";
import messageRoute from "./routes/messageRoute.js";
dotenv.config({ path: '.env' });
const app = express();
const PORT = process.env.PORT || 8080;

connectDB();

app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Routes
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/posts', postRoute);
app.use('/api/events', eventRoute); // ✅ add events route
app.use('/api/activities', activityRoute); // ✅ add activities route
app.use('/api/lostfound', lostFoundRoute);
app.use("/api/notices", noticeRoute);
app.use("/api/placements", placementRoute);
app.use("/api/messages", messageRoute);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
