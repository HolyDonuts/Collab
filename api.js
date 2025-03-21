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

function updateShowFullStoryState() {
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
}