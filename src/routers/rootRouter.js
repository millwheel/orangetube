import express from "express";
import { getJoin, postJoin, getLogin, postLogin } from "../controller/userController";
import { home, search, recordVideo } from "../controller/videoController";
import { publicOnlyMiddleware } from "../middleware";


const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);
rootRouter.route("/login").all(publicOnlyMiddleware).get(getLogin).post(postLogin);
rootRouter.get("/search", search);
rootRouter.get("/record", recordVideo);


export default rootRouter;