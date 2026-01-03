//app.js as the main entrance and switchboard of your backend application.

// required, otherwise CORS error in frontend: i.e, since both frontend and backend
// are on different ports, they are considered different origins by browsers.
const cors = require('cors');

require('dotenv').config();
require('./jobs/reminderJob');

// typical express app setup code:
const express = require('express');
const app = express();

// CANNOT ACCES APP WITHOUT INITIALISATION
app.use(cors());

app.use(express.json());

//u must require() and app.use() each route file for it to be accessible via HTTP requests.
//else 404
// What you MUST list: ✅ Route files (adminAuth, patients, schedules, etc.)
// What you DON'T list:
// // Middleware (like auth.js) - imported in route files
// // Services (like scheduleGenerator.js) - imported where needed
// // Database config (db.js) - imported in route files
// // Utility functions - imported where needed
// // Job schedulers - started separately

// Order Matters!
// // ❌ WRONG ORDER
// app.use('/api/admin/patients', patientRoutes);
// app.use('/api/admin', adminAuthRoutes);

// Routing refers to determining how an application responds to a client request to 
// a particular endpoint, which is a URI (or path) and a specific HTTP request method 
// (GET, POST, and so on).
// app.METHOD(PATH, HANDLER) ::format
//    Method	          Description 
// // res.download()    Prompt a file to be downloaded.
// // res.end()	        End the response process.
// // res.json()	      Send a JSON response.
// // res.redirect()    Redirect a request.
// // res.render()	    Render a view template.
// // res.send()	      Send a response of various types.
// // res.sendFile()    Send a file as an octet stream.
// // res.sendStatus()	Set the response status code and send its string representation as the response body.

// TO ACCESS WEBSITE/XYZ: THIS IS HOW
// to check if server (backend) is running:
app.get('/health', (req, res) => {
  // we are sending json response, though simple text, etc would also work
  res.json({ ok: true });
});

// Admin Auth Routes logic code:
const adminAuthRoutes = require('./routes/adminAuth');
app.use('/api/admin', adminAuthRoutes);

// Patients Routes logic code:
const patientRoutes = require('./routes/patients');
app.use('/api/admin/patients', patientRoutes);

// // Vaccines Routes logic code: TESTING WITHOUT WAITING TILL 2AM
// app.post('/internal/run-reminders', async (req, res) => {
//   const { runReminderJob } = require('./jobs/sendReminders');// modified to use sendReminders.js not reminderJob.js
//   // await runReminderJob();

//   res.json({ ok: true });
// });

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

// Upcoming Reminders for admin hospital:
app.use('/api/admin/upcoming-reminders', require('./routes/upcomingReminders'));


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on ${PORT}`);
});

// app.listen(4000, () => console.log('Backend running on 4000'));

// use the following code to serve images, CSS files, and JavaScript files in a directory named public:
// // app.use(express.static('public'))
// Now, you can load the files that are in the public directory:
// // http://localhost:3000/images/kitten.jpg
// generalsised form: express.static(root, [options])

// To create a virtual path prefix (where the path does not actually 
// exist in the file system) for files that are served by the express.static 
// function, specify a mount path for the static directory, as shown below:
// // app.use('/static', express.static('public'))
// eg: http://localhost:3000/static/images/kitten.jpg