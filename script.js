const prompts = [
    "It was a dark and stormy night...",
    "A long time ago in a faraway galaxy...",
    "In a small village, deep within the forest...",
    "Once upon a time, in a land filled with magic...",
    "The sun had just dipped below the horizon when...",
    "On a quiet street, in the middle of the night...",
    "In the heart of the bustling city, there was a secret...",
    "Deep beneath the ocean waves, an ancient city lay hidden...",
    "High in the mountains, where the air is thin and crisp...",
    "At the edge of the universe, where the stars are born..."
];

const currentPromptElement = document.getElementById("currentPrompt");
const randomiseButton = document.getElementById("randomiseButton");
const userInput = document.getElementById("userInput");
const printButton = document.getElementById("printButton");
const usernameInput = document.getElementById("username");
const submitNameButton = document.getElementById("submitNameButton");
const usernameContainer = document.getElementById("usernameContainer");
const displayNameElement = document.getElementById("displayName");
const userCounterElement = document.getElementById("userCounter");
const activeUserElement = document.getElementById("activeUser");
const purgeButton = document.getElementById("purgeButton");
const startNewStoryButton = document.getElementById("startNewStoryButton");
const showFullStoryButton = document.getElementById("showFullStoryButton");
const storyContainerElement = document.getElementById("storyContainer");
const storyContentElement = document.getElementById("storyContent");

let story = [];
let users = [];
let activeUserIndex = 0;
let currentUser = localStorage.getItem('username');
let showFullStory = false;
let promptLocked = false;

function getRandomPrompt() {
    return prompts[Math.floor(Math.random() * prompts.length)];
}

// Display the current prompt
function updateCurrentPrompt(newPrompt) {
    currentPromptElement.textContent = newPrompt;
    if (!promptLocked) {
        savePromptToServer(newPrompt);
    }
}

function savePromptToServer(prompt) {
    fetch('http://192.168.1.47/collab/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `set_prompt=true&prompt=${encodeURIComponent(prompt)}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message);
    })
    .catch(error => console.error('Error setting prompt:', error));
}

// Display the entire story content
function updateStoryContent() {
    if (!storyContainerElement) {
        console.error("Story content element not found");
        return;
    }

    const isUserInputFocused = document.activeElement === userInput;

    storyContentElement.innerHTML = ""; // Clear existing content
    story.forEach((entry) => {
        const storyRow = document.createElement("p");
        storyRow.className = "story-row";

        const usernameBlock = document.createElement("span");
        usernameBlock.className = "username-block";
        usernameBlock.style.backgroundColor = getUsernameColor(entry.user);
        usernameBlock.textContent = entry.user;

        const storyText = document.createElement("span");
        storyText.className = "story-text";

        if (showFullStory || entry.user === currentUser) {
            storyText.textContent = entry.text;
        } else {
            const sentences = entry.text.split('.').filter(sentence => sentence.trim() !== '');
            const lastSentence = sentences.pop();
            const blurredText = sentences.join('.') + '.';
            const visiblePart = document.createElement("span");
            visiblePart.className = "unblurred-text";
            visiblePart.textContent = lastSentence;

            const blurredPart = document.createElement("span");
            blurredPart.className = "blurred-text";
            blurredPart.textContent = blurredText;

            storyText.appendChild(blurredPart);
            storyText.appendChild(visiblePart);
        }

        storyRow.appendChild(usernameBlock);
        storyRow.appendChild(storyText);
        storyContentElement.appendChild(storyRow);
    });

    // Ensure the user input textarea is always at the bottom
    storyContainerElement.appendChild(userInput);

    if (isUserInputFocused) {
        userInput.focus();
    }
}

// Generate a color for the username block
function getUsernameColor(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 70%)`;
    return color;
}

// Fetch story entries from the server
function fetchStoryEntries() {
    fetch('http://192.168.1.47/collab/api.php?fetch_story=true')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            story = data.story;
            updateStoryContent();
        })
        .catch(error => {
            console.error('Error fetching story entries:', error);
            fetch('http://192.168.1.47/collab/api.php?fetch_story=true')
                .then(response => response.text())
                .then(text => console.log('Raw response:', text));
        });
}

// Fetch the current prompt from the server
function fetchCurrentPrompt() {
    fetch('http://192.168.1.47/collab/api.php?fetch_prompt=true')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateCurrentPrompt(data.prompt);
        })
        .catch(error => {
            console.error('Error fetching current prompt:', error);
        });
}

// Fetch the show full story state from the server
function fetchShowFullStoryState() {
    fetch('http://192.168.1.47/collab/api.php?fetch_show_full_story=true')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Only update the state if it has changed
            if (showFullStory !== data.show_full_story) {
                showFullStory = data.show_full_story;
                updateShowFullStoryButton();
                updateStoryContent();
            }
        })
        .catch(error => {
            console.error('Error fetching show full story state:', error);
        });
}

// Update the show full story button text
function updateShowFullStoryButton() {
    showFullStoryButton.textContent = showFullStory ? "Hide Full Story" : "Show Full Story";
}

// Update user count and active user display
function updateUserCount() {
    userCounterElement.textContent = users.length;
    if (users.length > 0) {
        activeUserElement.textContent = users[activeUserIndex].name;
    } else {
        activeUserElement.textContent = "None";
    }
}

// Enable/disable the input fields and button based on the active user's turn
function updateTurn() {
    fetch('http://192.168.1.47/collab/api.php?online_users=true')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched online users:', data.online_users);
            users = data.online_users;
            const identifiedUser = users.find(user => user.is_active === '1' || user.is_active === 1);
            if (identifiedUser) {
                activeUserIndex = users.findIndex(user => user.is_active === '1' || user.is_active === 1);
                console.log('Current active user:', identifiedUser.name);
            } else {
                console.log('No active user found.');
            }
            updateUserCount();
            updateUI();
            updateStoryContent();
        })
        .catch(error => console.error('Error fetching online users:', error));
}

// Update the UI based on the active user
function updateUI() {
    const identifiedUser = users.find(user => user.is_active === '1' || user.is_active === 1);
    console.log('Identified current active user object for UI update:', identifiedUser);
    if (identifiedUser && identifiedUser.name === currentUser) {
        console.log('Enabling input for user:', currentUser);
        userInput.disabled = false;
        printButton.disabled = false;
    } else {
        console.log('Disabling input for user:', currentUser);
        userInput.disabled = true;
        printButton.disabled = true;
    }
    // Hide randomise button for non-initial users
    if (identifiedUser && identifiedUser.name !== currentUser) {
        randomiseButton.style.display = "none";
    }
}

// Function to check if the username exists in the database
function checkUsernameExists(username) {
    return fetch(`http://192.168.1.47/collab/api.php?username=${encodeURIComponent(username)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => data.exists)
        .catch(error => {
            console.error('Error checking username existence:', error);
            return false;
        });
}

// Handle name submission
submitNameButton.addEventListener('click', () => {
    const enteredName = usernameInput.value.trim();
    if (enteredName.length > 0 && !users.find(user => user.name === enteredName)) {
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
        alert('Please enter a unique name!');
    }
});

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

// Log story entry to the database
function logStoryEntry(user, text) {
    fetch('http://192.168.1.47/collab/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `add_story=true&user=${encodeURIComponent(user)}&text=${encodeURIComponent(text)}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message);
        fetchStoryEntries();
    })
    .catch(error => console.error('Error logging story entry:', error));
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

// Initialize the story view
fetchStoryEntries();
fetchCurrentPrompt();
fetchShowFullStoryState(); // Fetch the initial show full story state
updateUserCount();
updateTurn();

// Fetch story entries periodically
setInterval(fetchStoryEntries, 10000); // Update every 10 seconds

// Fetch current prompt periodically
setInterval(fetchCurrentPrompt, 10000); // Update every 10 seconds

// Fetch show full story state periodically
setInterval(fetchShowFullStoryState, 10000); // Update every 10 seconds

// Function to call the addUser API
function addUser(name) {
    fetch('http://192.168.1.47/collab/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `name=${encodeURIComponent(name)}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message);
    })
    .catch(error => console.error('Error adding user:', error));
}

// Function to update the last active timestamp
function updateLastActive(name) {
    fetch('http://192.168.1.47/collab/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `name=${encodeURIComponent(name)}&update_only=true`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    })
    .catch(error => console.error('Error updating last active:', error));
}

// Send heartbeat every 2 minutes
setInterval(() => {
    const username = localStorage.getItem('username');
    if (username) {
        updateLastActive(username);
    }
}, 120000);

// Fetch online users periodically
setInterval(updateTurn, 10000); // Update every 10 seconds

// Set the active user in the database
function setActiveUser(name) {
    console.log('Setting active user in database:', name);
    fetch('http://192.168.1.47/collab/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `set_active=${encodeURIComponent(name)}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Set active user:', name);
        console.log('API response:', data);
        if (data.error) {
            console.error('Error from API:', data.error);
        } else {
            console.log('Active user set successfully:', data.message);
        }
        updateTurn();
    })
    .catch(error => console.error('Error setting active user:', error));
}

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

function purgeUsers() {
    fetch('http://192.168.1.47/collab/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=purge_users'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('All users have been purged successfully.');
            location.reload();
        } else {
            alert('Error purging users: ' + data.error);
        }
    })
    .catch(error => console.error('Error purging users:', error));
}

// Handle start new story button click
startNewStoryButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to start a new story? This action will delete all current story entries.")) {
        startNewStory();
    }
});

function startNewStory() {
    fetch('http://192.168.1.47/collab/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=purge_story'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('A new story has been started successfully.');
            story = [];
            promptLocked = false;
            randomiseButton.style.display = "block";
            updateCurrentPrompt(getRandomPrompt());
            updateStoryContent();
        } else {
            alert('Error starting a new story: ' + data.error);
        }
    })
    .catch(error => console.error('Error starting a new story:', error));
}

// Handle show full story button click
showFullStoryButton.addEventListener("click", () => {
    showFullStory = !showFullStory;
    updateShowFullStoryButton();
    updateStoryContent();

    console.log("Show full story state:", showFullStory);

    // Update the show full story state on the server
    fetch('http://192.168.1.47/collab/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `show_full_story=${showFullStory ? 1 : 0}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Show full story state updated:', data.message);
    })
    .catch(error => {
        console.error('Error updating show full story state:', error);
        error.response && error.response.text().then(text => console.log('Raw response:', text));
    });
});