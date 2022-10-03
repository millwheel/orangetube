import express from "express";
import { getEdit, postEdit, logout, startGithubLogin, finishGithubLogin, getChangePassword, postChangePassword, seeUser } from "../controller/userController";
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload } from "../middleware";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"), postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

userRouter.get("/:id", seeUser);

export default userRouter;