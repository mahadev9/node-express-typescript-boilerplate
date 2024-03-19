import httpStatus from "http-status";
import ApiError from "../../common/utils/ApiError";
import pick from "../../common/utils/pick";
import catchAsync from "../../common/utils/catchAsync";
import userService from "./user.service";
import { Request, Response } from "express";
import { Types } from "mongoose";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(new Types.ObjectId(req.params.userId));
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateUserById(new Types.ObjectId(req.params.userId), req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteUserById(new Types.ObjectId(req.params.userId));
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
};
