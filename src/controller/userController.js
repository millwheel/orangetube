import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
    console.log(req.body);
    const { name, username, email, password, password2, location } = req.body;
    if (password2 !== password) {
        return res.render("join", {
            pageTitle: "Join",
            errorMessage: "Password confirmation does not match."
        });
    }
    const exists = await User.exists({ $or: [{ username }, { email }] });
    if (exists) {
        return res.status(400).render("join", {
            pageTitle: "Join",
            errorMessage: "This username/email is already taken."
        });
    }
    try {
        await User.create({
            name, username, email, password, location,
        });
        res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle: "Join",
            errorMessage: error._message
        });
    }

}
export const getLogin = (req, res) => res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, socialOnly: false });
    if (!user) {
        return res.status(400).render("login", { pageTitle: "Login", errorMessage: "An account with this username doesn't exist." });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).render("login", { pageTitle: "Login", errorMessage: "Wrong password" });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })
    ).json();
    if ("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if (!emailObj) {
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if (!user) {
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
};

export const getEdit = (req, res) => {
    const {
        session:{
            user:{ avatarUrl },
        },
    } = req;
    res.render("edit-profile", { pageTitle: "Edit Profile" })
};
export const postEdit = async (req, res) => {
    const {
        session: {
            user: { _id, avatarUrl },
        },
        body: { name, email, username, location },
        file,
    } = req;
    const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
            avatarUrl: file.path ? file : avatarUrl,
            name: name,
            email: email,
            username: username,
            location: location,
        },
        { new: true }
    );
    return res.redirect("/users/edit");
}

export const getChangePassword = (req, res) => {
    if (req.session.user.socialOnly === true) {
        req.flash("error", "You don't have a password");
        return res.redirect("/");
    }
    return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
        body: { oldPassword, newPassword, newPasswordConfirm },
    } = req;
    const user = await User.findById(_id);
    const oldCheck = await bcrypt.compare(oldPassword, user.password);
    if (!oldCheck) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "Old password is incorrect."
        });
    }
    if (newPassword !== newPasswordConfirm) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "New password does not match the confirmation."
        });
    }
    user.password = newPassword;
    await user.save(); //this method is to let bcrypt.hash work again
    //send notification
    req.flash("error", "Password Updated");
    return res.redirect("/users/logout");
};

export const logout = (req, res) => {
    req.session.destroy();
    // req.flash("error", "Bye Bye");
    return res.redirect("/");
}

export const seeUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("videos");
    const videos = user.videos;
    console.log(user.videos.thumbUrl);
    if (!user) {
        return res.status(404).render("404", { pageTitle: "User not found." });
    }
    return res.render("users/profile", { pageTitle: user.name, user, videos });
}