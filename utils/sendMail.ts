import nodemailer from 'nodemailer';

const sendEmail = async (option : TOption) : Promise<void> => {

    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST as string,
        port: parseInt(process.env.SMTP_PORT || '587'),
        service : process.env.SMTP_SERVICE as string,
        auth: {
          user: process.env.SMTP_MAIL as string,
          pass: process.env.SMTP_PASSWORD as string
        }
    });

    const mailOption = {
        from : process.env.MAIL,
        to : option.email,
        subject : option.subject,
        html : option.html
    }

    await transport.sendMail(mailOption);
}

export default sendEmail;