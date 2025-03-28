let users = []; // Define users array globally
let promptLocked = false; // Define promptLocked variable globally
let showFullStory = false; // Define showFullStory variable globally
let currentUser = localStorage.getItem('username'); // Define currentUser variable globally
let activeUserIndex = 0; // Define activeUserIndex variable globally
let story = []; // Define story variable globally

document.addEventListener("DOMContentLoaded", () => {
    fetchStoryEntries();
    fetchCurrentPrompt();
    fetchShowFullStoryState(); // Fetch the initial show full story state
    updateUserCount();
    updateTurn();
});

// Fetch story entries periodically
setInterval(fetchStoryEntries, 10000); // Update every 10 seconds

// Fetch current prompt periodically
setInterval(fetchCurrentPrompt, 10000); // Update every 10 seconds

// Fetch show full story state periodically
setInterval(fetchShowFullStoryState, 10000); // Update every 10 seconds

// Send heartbeat every 2 minutes
setInterval(() => {
    const username = localStorage.getItem('username');
    if (username) {
        updateLastActive(username);
    }
}, 120000);

// Fetch online users periodically
setInterval(updateTurn, 10000); // Update every 10 seconds

// Handle name submission
submitNameButton.addEventListener('click', () => {
    const enteredName = usernameInput.value.trim();
    if (enteredName.length > 0 && !users.find(user => user.name === enteredName)) {
        checkUsernameExists(enteredName).then(exists => {
            if (!exists) {
                users.push({ name: enteredName, is_active: '0' });
                if (users.length === 1) {
                    setActiveUser(enteredName);
                }
                usernameContainer.style.display = "none";
                displayNameElement.textContent = `${enteredName}`;
                displayNameElement.style.display = "block";
                localStorage.setItem('username', enteredName);
                currentUser = enteredName;
                addUser(enteredName);
                updateUserCount();
                if (users.length === 1) {
                    randomiseButton.style.display = "block";
                }
            } else {
                alert('Username already exists. Please choose a different name.');
            }
        });
    } else {
        alert('Please enter a unique name!');
    }
});

// Check if a username exists in the database
function checkUsernameExists(username) {
    return fetch(`api.php?username=${username}`)
        .then(response => response.json())
        .then(data => data.exists);
}

// Handle Enter key for name submission
usernameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const enteredName = usernameInput.value.trim();
        if (enteredName.length > 0) {
            submitNameButton.click();
        }
    }
});

// Add user's input to the story and rotate the turn
function addStoryEntry() {
    const userText = userInput.value.trim();
    const currentUser = users[activeUserIndex];

    if (userText.length > 0 && currentUser && currentUser.name === localStorage.getItem('username')) {
        story.push({ text: userText, user: currentUser.name });
        promptLocked = true;
        randomiseButton.style.display = "none";
        updateStoryContent();

        logStoryEntry(currentUser.name, userText);

        userInput.value = "";

        activeUserIndex = (activeUserIndex + 1) % users.length;
        console.log('Next active user index:', activeUserIndex);

        setActiveUser(users[activeUserIndex].name);
    } else {
        console.log('User is not allowed to add a story entry or text is empty');
    }
}

// Handle Enter key for story submission
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        addStoryEntry();
    }
});

printButton.addEventListener("click", addStoryEntry);

randomiseButton.addEventListener("click", () => {
    const newPrompt = getRandomPrompt();
    updateCurrentPrompt(newPrompt);
});

// Check if a username is stored in localStorage when the page loads
window.addEventListener('load', () => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        checkUsernameExists(storedUsername).then(exists => {
            if (exists) {
                usernameContainer.style.display = "none";
                displayNameElement.textContent = `${storedUsername}`;
                displayNameElement.style.display = "block";
                currentUser = storedUsername;
                updateTurn();
            } else {
                localStorage.removeItem('username');
                usernameContainer.style.display = "block";
                displayNameElement.style.display = "none";
            }
        });
    }
});

// Handle purge button click
purgeButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to purge all users? This action cannot be undone.")) {
        purgeUsers();
    }
});

// Handle start new story button click
startNewStoryButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to start a new story? This action will delete all current story entries.")) {
        startNewStory();
    }
});

// Handle show full story button click
showFullStoryButton.addEventListener("click", () => {
    showFullStory = !showFullStory;
    updateShowFullStoryButton();
    updateStoryContent();

    console.log("Show full story state:", showFullStory);

    // Update the show full story state on the server
    updateShowFullStoryState();
});