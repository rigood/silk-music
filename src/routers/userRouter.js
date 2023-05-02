import express from "express";
import {
  logout,
  getEdit,
  postEdit,
  postChangePw,
} from "../controllers/userController";
import { privateOnlyMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", privateOnlyMiddleware, logout);

userRouter
  .route("/edit")
  .all(privateOnlyMiddleware)
  .get(getEdit)
  .post(postEdit);

userRouter.post("/change-pw", privateOnlyMiddleware, postChangePw);

export default userRouter;
