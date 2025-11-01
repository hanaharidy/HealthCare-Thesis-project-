require('dotenv').config();
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

// Database connection
const dbUri = process.env.DB_URI; // e.g., MongoDB connection string
const dbName = 'yourDatabaseName';
let db;

async function connectToDB() {
  const client = new MongoClient(dbUri);
  await client.connect();
  db = client.db(dbName);
  console.log('Connected to database');
}

// Fetch appointments for today or tomorrow
async function fetchAppointments() {
  const collection = db.collection('appointments');
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await collection.find({
    date: {
      $gte: new Date(now.toISOString().split('T')[0]),
      $lt: new Date(tomorrow.toISOString().split('T')[0]),
    },
  }).toArray();

  return appointments;
}

// Send reminder emails
async function sendReminderEmail(email, appointmentDate) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Appointment Reminder',
    text: `Hello! This is a reminder for your appointment on ${appointmentDate}.`,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Reminder sent to ${email}`);
}

// Scheduled job
schedule.scheduleJob('0 8 * * *', async () => { // Runs daily at 8 AM
  console.log('Running scheduled job...');
  try {
    const appointments = await fetchAppointments();
    for (const appointment of appointments) {
      await sendReminderEmail(appointment.email, appointment.date);
    }
  } catch (error) {
    console.error('Error during job execution:', error);
  }
});

// Start the app
(async () => {
  await connectToDB();
  console.log('Job scheduler started.');
})();
