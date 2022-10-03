import multer from "multer";
import app from "./server";

export const localMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Orangetube";
    res.locals.loggedInUser = req.session.user;
    next();
}

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn){
        return next();
    } else {
        req.flash("error", "log in first");
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn){
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
}

export const avatarUpload = multer({ dest:"uploads/avatars/", limits: {
    fileSize: 3000000,
} });
export const videoUpload = multer({ dest:"uploads/videos/", limits: {
    fileSize: 10000000,
} })

export const crossOrigin = (req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
}