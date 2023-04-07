const video = document.querySelector("video"); //HTML inherent element
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const centerBtn = document.getElementById("videoCenterButton");
const centerBtnIcon = centerBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const videoInfo = document.getElementById("videoInfo");
const showInfoBtn = document.getElementById("showInfo");

let controlsTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;
let fullScreen = document.fullscreenElement;
let screenFlag = false;

const handlePlayClick = () => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playBtnIcon.className = video.paused ? "fas fa-play" : "fas fa-pause";
    centerBtnIcon.className = video.paused ? "fas fa-pause" : "fas fa-play";
    centerBtnIcon.classList.add("showing");
    setTimeout(() => {
        centerBtnIcon.classList.remove("showing")
    }, 500);
};

const handleMuteClick = () => {
    if (video.muted) {
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtnIcon.className = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
    const { target: { value } } = event;
    if (video.muted) {
        video.muted = false;
        muteBtnIcon.className = "fas fa-volume-up";
    }
    volumeValue = value;
    video.volume = value;
    if (video.volume == 0) {
        video.muted = true;
        muteBtnIcon.className = "fas fa-volume-mute";
    }
};

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substring(14, 19);

const handleLoadedData = () => {
    if(!isNaN(video.duration)){
        totalTime.innerText = formatTime(Math.floor(video.duration));
        timeline.max = Math.floor(video.duration);
    }
};

const handleTimeUpdate = () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
    const {
        target: { value }
    } = event;
    video.currentTime = value;
}

const handleFullscreenBtn = () => {
    fullScreen = document.fullscreenElement;
    if (fullScreen) {
        document.exitFullscreen();
        fullScreenIcon.className = "fas fa-expand";
        centerBtn.classList.remove("video__center__full");
    } else {
        videoContainer.requestFullscreen();
        fullScreenIcon.className = "fas fa-compress";
        centerBtn.classList.add("video__center__full");
    }
};

const handleFullscreen = (event) => {
    if (screenFlag) {
        screenFlag = false;
        fullScreenIcon.className = "fas fa-expand";
        centerBtn.classList.remove("video__center__full");
    } else {
        screenFlag = true;
        fullScreenIcon.className = "fas fa-compress";
        centerBtn.classList.add("video__center__full");
    }
};

const handleMouseMove = () => {
    if (controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    videoControls.classList.add("showing");
    controlsTimeout = setTimeout(() => {
        videoControls.classList.remove("showing")
    }, 2000);
};

const handleEnded = () => {
    const { id } = videoContainer.dataset;
    fetch(`/api/videos/${id}/view`, {
        method: "POST",
    });
}

const handleShowInfo = () => {
    if (videoInfo.classList.contains("hidden")) {
        videoInfo.classList.remove("hidden");
        showInfoBtn.innerText = "Hide info";
    } else {
        videoInfo.classList.add("hidden");
        showInfoBtn.innerText = "Show info";
    }
}

const handleKeydown = (event) => {
    if (event.key == " "){
        if (document.fullscreenElement){
            handlePlayClick();
        }
    }
    if (event.key == "Escape"){
        console.log("hi");
    }
}

playBtnIcon.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("canplay", handleLoadedData);
handleLoadedData();
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
centerBtn.addEventListener("click", handlePlayClick);
timeline.addEventListener("input", handleTimelineChange);
fullScreenIcon.addEventListener("click", handleFullscreenBtn);
showInfoBtn.addEventListener("click", handleShowInfo);
document.addEventListener("keydown", handleKeydown);
document.addEventListener("fullscreenchange", handleFullscreen);
