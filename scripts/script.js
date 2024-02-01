var mainLoginButton = document.querySelector(".form-btn");
var passwordInput = document.querySelector(".password-input");
var usernameInput = document.querySelector(".username-input");
var btn = document.querySelector(".btn");

const assistantLI = document.querySelector(".assistant")
const headcoachLI = document.querySelector(".headCoach")
const loginButton = document.querySelector(".btn");
const wrapper = document.querySelector(".wrapper");
const iconClose = document.querySelector(".icon-close");
const page = document.querySelector(".page")
const access1 = document.querySelector(".access1")
const access2 = document.querySelectorAll(".access2")
const access3 = document.querySelector(".access3")

let coaches;

// add disabled class to navbar items
function removeAccess() {
    access1.classList.add("disabled");
    access2.forEach(element => {
        element.classList.add("disabled");
    });
    access3.classList.add("disabled");
    headcoachLI.innerHTML = "Head Coaches";
    assistantLI.innerHTML = "Assistant Coaches";
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

// add event listener for login button on page load
document.addEventListener('DOMContentLoaded', function () {
    loginButton.addEventListener('click', (event) => {
        if (sessionStorage.getItem("loggedin") !== "true") {
            event.preventDefault(); // prevent refresh on button click
            wrapper.classList.add('active-popup'); // make login form appear
            page.classList.add('no-scroll') // disable ability to scroll
        }
        else {
            sessionStorage.clear(); // clear session storage
            btn.innerHTML= "Login"
            console.log("Success")
            usernameInput.value = "";
            passwordInput.value = "";
            removeAccess()
        }
    
    });

    // event listener for the close icon on login form
    iconClose.addEventListener('click', ()=> {
        wrapper.classList.remove('active-popup')
        page.classList.remove('no-scroll')
    })
    if (sessionStorage.getItem("loggedin") === "true") {
        addAccess();
        btn.innerHTML = "Logout";
    }
    console.log(sessionStorage.getItem("accessLevel"));
});

// event listener for button on login form
mainLoginButton.addEventListener('click', function() {
    validateInput()
});













function validateInput() {
    // make sure inputs are not empty
    if (passwordInput.value !== "" && usernameInput.value !== "") {
        inputtedUsername = usernameInput.value;
        // compare input to coach data from database
        const foundCoach = coaches.find(coach => coach.userID === inputtedUsername);

        if (foundCoach) {
            handleLogin(foundCoach)
        }
        else {
            alert("Username not found.")
        }
    }
    else {
        console.log("no username or password")
    }
}




function handleLogin(foundCoach) {
    const accessLevel = foundCoach.AccessLevel;
    const coachID = foundCoach.coachID;
    const teamID = foundCoach.TeamId;
    const coachName = foundCoach.Name

    // set session variables
    sessionStorage.setItem('accessLevel', accessLevel);
    sessionStorage.setItem('loggedin', true);
    sessionStorage.setItem('coachID', coachID);
    sessionStorage.setItem('teamID', teamID);
    sessionStorage.setItem('coachName', coachName)

    wrapper.classList.remove('active-popup') // close login form
    page.classList.remove('no-scroll')

    addAccess()
    btn.innerHTML = "Logout";
}



const coachUrl = "http://football.cscprof.com/coaches"

async function getCoaches() {
    const response = await fetch(coachUrl); // fetch coach data
    coaches = await response.json();
    console.log(coaches)
}


getCoaches()