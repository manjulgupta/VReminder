// required, otherwise CORS error in frontend: i.e, since both frontend and backend
// are on different ports, they are considered different origins by browsers.
const cors = require('cors');

require('dotenv').config();
require('./jobs/reminderJob');

const express = require('express');
const app = express();

// CANNOT ACCES APP WITHOUT INITIALISATION
app.use(cors());
app.use(express.json());

// to check if server (backend) is running:
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Admin Auth Routes logic code:
const adminAuthRoutes = require('./routes/adminAuth');
app.use('/api/admin', adminAuthRoutes);

// Patients Routes logic code:
const patientRoutes = require('./routes/patients');
app.use('/api/admin/patients', patientRoutes);

// Vaccines Routes logic code: TESTING WITHOUT WAITING TILL 2AM
app.post('/internal/run-reminders', async (req, res) => {
  const { runReminderJob } = require('./jobs/reminderJob');
  await runReminderJob();
  res.json({ ok: true });
});

// schedule for admin hospital:
const scheduleRoutes = require('./routes/schedules');
app.use('/api/admin/schedules', scheduleRoutes);


// SMS Logs for admin hospital:
const smsLogRoutes = require('./routes/smsLogs');
app.use('/api/admin/sms-logs', smsLogRoutes);




app.listen(4000, () => console.log('Backend running on 4000'));