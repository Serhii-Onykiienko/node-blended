import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import fs from 'node:fs/promises';
import path from 'node:path';

import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';
import { sendMail } from '../utils/sendMail.js';

export const registrationUser = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.findOne({
    email,
  });

  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const newSession = await createSession(newUser._id);
  setSessionCookies(res, newSession);

  res.status(201).json(newUser);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteOne({ userId: user._id });

  const newSession = await createSession(user._id);

  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).send();
};

export const refreshUser = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  if (!sessionId || !refreshToken) {
    throw createHttpError(401, 'Missing session credentials');
  }
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired = session.refreshTokenValidUntil < new Date();

  if (isSessionTokenExpired) {
    await session.deleteOne();
    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');

    throw createHttpError(401, 'Session token expired');
  }

  await session.deleteOne();

  const newSession = await createSession(session.userId);

  setSessionCookies(res, newSession);

  res.status(200).json({ message: 'Successfully refreshed a session!' });
};

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '20m' },
  );

  const templatePath = path.resolve('src/templates/reset-password-email.html');

  const templateSource = await fs.readFile(templatePath, 'utf-8');

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  try {
    await sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(500, 'Failed to send the email');
  }

  res.status(200).json({ message: 'Password reset email sent successfully' });
};

export const resetPassword = async (req, res) => {
  const { password, token } = req.body;

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findOne({ _id: payload.sub, email: payload.email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    {
      _id: user._id,
    },
    { password: hashedPassword },
  );

  res.status(200).json({ message: 'Password reset successfully' });
};
