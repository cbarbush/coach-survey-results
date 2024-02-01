var logoutBtn = document.querySelector(".logout-btn");
const access1 = document.querySelector(".access1")
const access2 = document.querySelectorAll(".access2")
const access3 = document.querySelector(".access3")
const assistantLI = document.querySelector(".assistant")
const headcoachLI = document.querySelector(".headCoach")

function handleLogout() {
    console.log("clicked")
    sessionStorage.clear(); // clear session storage
    window.location.href = 'index.html'; // return to landing page
}

// get access level and adjust navbar accordingly
function addAccess() {
    if (sessionStorage.getItem("accessLevel") === "3") {
        access1.classList.remove("disabled");
        access2.forEach(element => {
            element.classList.remove("disabled");
        });
        access3.classList.remove("disabled");
    }
    else if (sessionStorage.getItem("accessLevel") === "2") {
        console.log("Access Level 2");
        headcoachLI.innerHTML = "My Info"
        access1.classList.remove("disabled");
        access2.forEach(element => {
            element.classList.remove("disabled");
        });
    }
    else {
        assistantLI.innerHTML = "My Info"
        access1.classList.remove("disabled");
    }
}
// run add access on page load and create event listener for logout button
document.addEventListener('DOMContentLoaded', function () {
    addAccess();
    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        handleLogout();
    });
});