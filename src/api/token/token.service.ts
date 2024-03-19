import jwt from "jsonwebtoken";
import moment from "moment";
import httpStatus from "http-status";
import config from "../../common/config/config";
import Token from "./token.model";
import { tokenTypes } from "../../common/config/tokens";
import ApiError from "../../common/utils/ApiError";
import userService from "../user/user.service";

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {moment.Moment} expires
 * @param {string} [type]
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (
  userId: string,
  expires: moment.Moment,
  type = tokenTypes.ACCESS,
  secret = config.jwt.secret
) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Date} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (
  token: string,
  userId: string,
  expires: Date,
  type: string,
  blacklisted = false
) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires,
    type,
    blacklisted,
  });
  return tokenDoc;
}

/**
 * Verify token and return token doc (or throw an error if it is invalid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token: string, type: string) => {
  const payload = jwt.verify(token, config.jwt.secret) as any;
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Token not found");
  }
  return tokenDoc;
}

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user: any) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, "minutes");
  const accessToken = generateToken(user.id, accessTokenExpires);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, "days");
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);

  await saveToken(refreshToken, user.id, refreshTokenExpires.toDate(), tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
}

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email: string) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, "minutes");
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires.toDate(), tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
}

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user: any) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, "minutes");
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires.toDate(), tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
}

/**
 * Delete token
 * @param {ObjectId} id
 */
const deleteTokenById = async (id: string) => {
  const token = await Token.findById(id);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, "Token not found");
  }
  await token.deleteOne();
}

/**
 * Delete tokens
 * @param {ObjectId} userId
 * @param {string} type
 */
const deleteTokens = async (userId: string, type: string) => {
  await Token.deleteMany({ user: userId, type });
}

export default {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  deleteTokenById,
  deleteTokens,
};
