const nodemailer = require('nodemailer');

// Configura il trasporto email con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',  
  auth: {
    user: process.env.EMAIL_USER,   // Email (
    pass: process.env.EMAIL_PASS,   // Password 
  },
});

// Funzione per inviare email
const sendTaskNotification = (recipientEmail, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,   // Mittente
    to: recipientEmail,             // Destinatario
    subject: subject,               // Oggetto dell'email
    text: message,                  // Testo dell'email
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Errore durante l\'invio della mail: ', error);
    } else {
      console.log('Email inviata: ' + info.response);
    }
  });
};

module.exports = { sendTaskNotification };
