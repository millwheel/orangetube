import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET, 
    region:"ap-northeast-2"
});

const prod = 1;

export const localMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Orangetube";
    res.locals.loggedInUser = req.session.user;
    res.locals.prod = prod;
    next();
}

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "log in first");
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
}

export const avatarUpload = multer({
    storage: multerS3({
        s3: s3,
        ACL: 'public-read-write',
        bucket: "orangetube",
    })
});

export const videoUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "orangetube",
        ACL: 'public-read-write',
    })
});

export const crossOrigin = (req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
}
