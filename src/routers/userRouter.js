import express from "express";
import {
  logout,
  profile,
  points,
  getEdit,
  postEdit,
  postChangePw,
} from "../controllers/userController";
import { privateOnlyMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", privateOnlyMiddleware, logout);

userRouter.get("/:id([0-9a-f]{24})/points", points);

userRouter
  .route("/edit")
  .all(privateOnlyMiddleware)
  .get(getEdit)
  .post(postEdit);

userRouter.post("/change-pw", privateOnlyMiddleware, postChangePw);

export default userRouter;
