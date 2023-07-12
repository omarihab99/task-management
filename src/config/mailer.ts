import { createTransport } from 'nodemailer';
import env from './env';

const mailer = createTransport({
  port: env().mailer.port,
  host: env().mailer.host,
  auth: {
    user: env().mailer.username,
    pass: env().mailer.password,
  },
});

export const sendMail = (
  emailTo: string,
  subject: string,
  htmlBody: string,
) => {
  mailer.sendMail(
    {
      from: 'task management system',
      to: emailTo,
      subject,
      html: htmlBody,
    },
    (err) => {
      console.log(err);
    },
  );
};
