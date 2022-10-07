import mongoose from "mongoose";

const getClock = () => {
    const date = new Date();
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    const time = `${year}.${month}.${day}`;
    return time;
}

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxLength: 40 },
    fileUrl: { type: String, required: true },
    thumbUrl: { type: String, required: true },
    description: { type: String, required: true, trim: true, maxLength: 400 },
    createdAt: { type: String, required: true, default: getClock},
    hashtags: [{ type: String }],
    meta: {
        views: { type: Number, default: 0 },
        rating: { type: Number, defult: 0 },
    },
    comments: [{ type:mongoose.Schema.Types.ObjectId, required:true, ref:"Comment" }],
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

videoSchema.static("formatHashtags", function (hashtags) {
    return hashtags
        .split(",")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));
})

videoSchema.static("changePathFormula", (urlPath) => {
    return urlPath.replace(/\\/g, "/");
});

//videoSchma.pre("save", async function(){ this.hashtangs = this.hashtags[0].split(",").map((word) => (word.startsWith("#") ? word: `#${word}`))});

const movieModel = mongoose.model("Video", videoSchema);
export default movieModel;