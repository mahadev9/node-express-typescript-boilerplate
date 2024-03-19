import nodemailer from 'nodemailer';
import config from '../../common/config/config';
import logger from '../../common/config/logger';

const transport = nodemailer.createTransport(config.email.smtp);

if (config.env !== 'test') {
  transport
    .verify()
    .then(() => {
      logger.info('Connected to email server');
    })
    .catch(() => {
      logger.warn('Unable to connect to email server');
    });
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 * @returns {Promise}
 */
const sendEmail = async (to: string, subject: string, html: string) => {
  const msg = { from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to: string, token: string) => {
  const subject = 'Reset password';
  const html = `<p>You requested to reset your password. Click <a href="${config.url}/reset-password?token=${token}">here</a> to reset it.</p>`;
  await sendEmail(to, subject, html);
}

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to: string, token: string) => {
  const subject = 'Verify email';
  const html = `<p>Click <a href="${config.url}/verify-email?token=${token}">here</a> to verify your email.</p>`;
  await sendEmail(to, subject, html);
}

export default {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};

