const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll("#deleteBtn");

const addComment = (text, newCommentId, newCommentUser, newCommentAvatar) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = newCommentId;
    newComment.className = "video__comment";
    const div1 = document.createElement("div");
    div1.className = "comment__user-info";
    const img1 = document.createElement("img");
    img1.src = `/${newCommentAvatar}`;
    const span1 = document.createElement("span");
    span1.innerText = ` ${newCommentUser}:`;
    div1.appendChild(img1);
    div1.appendChild(span1);
    const div2 = document.createElement("div");
    div2.className = "comment__content";
    const span2 = document.createElement("span");
    span2.innerText = ` ${text} `;
    const span3 = document.createElement("span");
    span3.innerHTML = "&#x274C";
    span3.id = "deleteNewBtn";
    div2.appendChild(span2);
    div2.appendChild(span3);
    newComment.appendChild(div1);
    newComment.appendChild(div2);
    videoComments.prepend(newComment);
};


const handleSubmit = async (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    let text = textarea.value;
    text = text.replace(/\n/g, "");
    const videoId = videoContainer.dataset.id;
    if (text === "") return;
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });
    textarea.value = "";
    if (response.status === 201) {
        const { newCommentId, newCommentUser, newCommentAvatar } = await response.json();
        addComment(text, newCommentId, newCommentUser, newCommentAvatar);
        const deleteBtn = document.getElementById("deleteNewBtn");
        deleteBtn.addEventListener("click", handleDelete);
    };
};


const handleDelete = async(event) => {
    const li = event.currentTarget.parentElement.parentElement;
    const commentId = li.dataset.id;
    const response = await fetch(`/api/comments/${commentId}/delete`,{
        method: "DELETE",
    });
    if (response.status === 403){
        alert("You are not a user who wrote this.");
    }
    li.remove();
};


if (form) {
    form.addEventListener("submit", handleSubmit);
}

if (deleteBtns){
    deleteBtns.forEach((deleteBtn) => {
        deleteBtn.addEventListener("click", handleDelete);
    });
};