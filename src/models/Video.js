import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxLength: 20 },
    fileUrl: { type: String, required: true },
    thumbUrl: { type: String, required: true },
    description: { type: String, required: true, trim: true, maxLength: 140 },
    createdAt: { type: Date, required: true, default: Date.now },
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