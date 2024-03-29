import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";

export const home = async (req, res) => {
    const videos = await Video.find({}).sort({ createdAt: "desc" }).populate("owner");
    return res.render("home", { pageTitle: "Home", videos });
}
export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner").populate("comments");
    console.log(video.owner);
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found" });
    };
    return res.render("watch", { pageTitle: video.title, video });
};
export const recordVideo = (req, res) => {
    return res.render("record"), { pageTitle: "Record video" };
};
export const getEdit = async (req, res) => {
    const { id } = req.params;
    const { user: { _id } } = req.session;
    const video = await Video.findById(id);
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found" });
    };
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    return res.render("edit-video", { pageTitle: `Edit:${video.title}`, video });
};
export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { title, description, hashtags } = req.body;
    const video = await Video.exists({ _id: id });
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found" });
    };
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags),
    })
    return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: `Upload Video` });
}
export const postUpload = async (req, res) => {
    const { user: { _id } } = req.session;
    const { video, thumb } = req.files;
    console.log(video, thumb);
    const { title, description, hashtags } = req.body;
    const prod = 1;
    try {
        const newVideo = await Video.create({
            title,
            description,
            fileUrl: prod ? video[0].location : video[0].path,
            thumbUrl: prod ? Video.changePathFormula(thumb[0].location) : Video.changePathFormula(thumb[0].path),
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    } catch (error) {
        return res.status(400).render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message
        });
    }
}

export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const { user: { _id } } = req.session;
    const video = await Video.findById(id);
    const user = await User.findById(_id);
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found" });
    };
    if (String(video.owner) !== String(_id)) {
        req.flash("error", "Not authorized");
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    user.videos.splice(user.videos.indexOf(id), 1);
    user.save();
    return res.redirect("/");
}

export const search = async (req, res) => {
    const { keyword } = req.query;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, "i"),
            },
        }).populate("owner");
    }
    return res.render("search", { pageTitle: "Search", videos });
}

export const registerView = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
}

export const createComment = async (req, res) => {
    const {
        session: { user },
        body: { text },
        params: { id },
    } = req;
    const video = await Video.findById(id);
    console.log(video);
    if (!video) {
        return res.sendStatus(404);
    }
    const comment = await Comment.create({
        text: text,
        owner: user._id,
        video: id,
        name: user.name,
        userAvatar: user.avatarUrl,
    });
    video.comments.push(comment._id);
    video.save();
    return res.status(201).json({ 
        newCommentId: comment._id,
        newCommentUser: comment.name,
        newCommentAvatar:comment.userAvatar,
    });
}

export const deleteComment = async (req, res) => {
    const {
        session: { user },
        params: { id }
    } = req;
    const comment = await Comment.findById(id).populate("video");
    if (String(comment.owner._id) != String(user._id)) {
        return res.sendStatus(403);
    }
    const video = comment.video;
    video.comments = video.comments.filter((e) => String(e) !== String(id));

    comment.remove();
    video.save();

    return res.sendStatus(200);
};