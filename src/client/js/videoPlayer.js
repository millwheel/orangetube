const video = document.querySelector("video"); //HTML inherent element
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
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

let controlsTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = () => {
    if(video.paused){
        video.play();
    }else{
        video.pause();
    }
    playBtnIcon.className = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = () => {
    if(video.muted){
        video.muted = false;
    }else{
        video.muted = true;
    }
    muteBtnIcon.className = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
    const { target:{ value }} = event;
    if(video.muted){
        video.muted = false;
        muteBtn.innerText = "Mute";
    }
    volumeValue = value;
    video.volume = value;
    if(video.volume == 0){
        video.muted = true;
        muteBtn.innerText = "Unmute";
    }
};

const formatTime = (seconds) => new Date(seconds*1000).toISOString().substring(14,19);

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) =>{
    const {
        target: {value}
    } = event;
    video.currentTime = value;
}

const handleFullScreen = () => {
    const fullScreen = document.fullscreenElement;
    if(fullScreen){
        document.exitFullscreen();
        fullScreenIcon.className = "fas fa-expand";
    }else{
        videoContainer.requestFullscreen();
        fullScreenIcon.className = "fas fa-compress";
    }
}

const handleMouseMove = () => {
    if(controlsTimeout){
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
        method:"POST",
    });
}

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
