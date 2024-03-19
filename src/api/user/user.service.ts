import httpStatus from "http-status";
import User from "./user.model";
import ApiError from "../../common/utils/ApiError";
import { Types } from "mongoose";

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody: any) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter: any, options: any) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {Types.ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id: Types.ObjectId) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {Types.ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (id: Types.ObjectId, updateBody: any) => {
  const user = await getUserById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
}

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId: Types.ObjectId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await User.deleteOne({ _id: userId });
  return user;
}

export default {
  createUser,
  getUserById,
  getUserByEmail,
  updateUserById,
  queryUsers,
  deleteUserById,
};
