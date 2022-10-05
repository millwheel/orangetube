const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll("#deleteBtn");

const addComment = (text, newCommentId) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = newCommentId;
    newComment.className = "video__comment";
    const span = document.createElement("span");
    span.innerText = ` ${text} `;
    const span2 = document.createElement("span");
    span2.innerHTML = "&#x274C";
    span2.id = "deleteNewBtn";
    newComment.appendChild(span);
    newComment.appendChild(span2);
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
        const { newCommentId } = await response.json();
        addComment(text, newCommentId);
        const deleteBtn = document.getElementById("deleteNewBtn");
        deleteBtn.addEventListener("click", handleDelete);
    };
};


const handleDelete = async(event) => {
    const li = event.currentTarget.parentElement;
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