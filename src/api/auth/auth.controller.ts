import httpStatus from "http-status";
import catchAsync from "../../common/utils/catchAsync";
import authService from "./auth.service";
import userService from "../user/user.service";
import tokenService from "../token/token.service";
import emailService from "../email/email.service";
import { Request, Response } from "express";

const register = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.query.token === 'string') {
     await authService.resetPassword(req.query.token, req.body.password);
     res.status(httpStatus.NO_CONTENT).send();
   } else {
     res.status(httpStatus.BAD_REQUEST).send('Token is required');
   }
});

const sendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
     const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
     await emailService.sendVerificationEmail((req.user as any).email, verifyEmailToken);
     res.status(httpStatus.NO_CONTENT).send();
   } else {
     res.status(httpStatus.BAD_REQUEST).send('User is not logged in');
   }
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.query.token === 'string') {
    await authService.verifyEmail(req.query.token);
    res.status(httpStatus.NO_CONTENT).send();
  } else {
    res.status(httpStatus.BAD_REQUEST).send('Token is required');
  }
});

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
