import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET
    }
})

const isHeroku = process.env.NODE_ENV === "production";

const s3ImageUploader = multerS3({
    s3: s3,
    bucket: "orangetube/images",
    acl: "public-read",
});

const s3VideoUploader = multerS3({
    s3: s3,
    bucket: "orangetube/videos",
    acl: "public-read",
});


export const localMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Orangetube";
    res.locals.loggedInUser = req.session.user;
    res.locals.isHeroku = isHeroku;
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
    dest: "uploads/avatars/",
    limits: {
        fileSize: 3000000,
    },
    storage: isHeroku ? s3ImageUploader : undefined,
});
export const videoUpload = multer({
    dest: "uploads/videos/",
    limits: {
        fileSize: 10000000,
    },
    storage: isHeroku ? s3VideoUploader : undefined,
});

export const s3DeleteAvatarMiddleware = (req, res, next) => {
    if (!req.file) {
        return next();
    }
    s3.deleteObject(
        {
            Bucket: `orangetube`,
            Key: `images/${req.session.user.avatarURL.split('/')[4]}`,
        },
        (err, data) => {
            if (err) {
                throw err;
            }
            console.log(`s3 deleteObject`, data);
        }
    );
    next();
};


export const crossOrigin = (req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
}
