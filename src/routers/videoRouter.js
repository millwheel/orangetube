import express from "express";
import { watch, getEdit, postEdit, getUpload, postUpload, deleteVideo} from "../controller/videoController";
import { protectorMiddleware, videoUpload } from "../middleware";

const videoRouter = express.Router();


videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
videoRouter.route("/:id([0-9a-f]{24})/delete").all(protectorMiddleware).get(deleteVideo);
videoRouter.route("/upload").all(protectorMiddleware).all(crossOrigin).get(getUpload).post(videoUpload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumb", maxCount: 1 },
]), postUpload);

const crossOrigin = (req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
}


export default videoRouter;