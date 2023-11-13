// db.js


const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://thiagoaciole7:NHg1ErJArHUQiWuY@blog.h6hsmfs.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});


module.exports = mongoose;