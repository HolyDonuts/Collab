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
    "At the edge of the universe, where the stars are born...",
    "They called her the Night Weaver, but she preferred the name her mother gave her: Grace.",
    "The sound of the broken clock echoed louder than time itself.",
    "He always thought the world would end in fire; he never expected it to end in song.",
    "Ivy pulled the thread from her sleeve, unraveling not just her sweater but her past.",
    "When the rain stopped mid-air, people looked to the sky, but Mia looked to the ground.",
    "The footprints in the snow started at her front door and ended at the lake.",
    "'Don’t move,' the shadow said. 'It can’t see us if we stay still.'",
    "What do you do when the dreams of yesterday start stealing your tomorrows?",
    "He flipped the coin into the air. It landed on its edge, refusing to choose sides.",
    "The boat floated downriver, empty except for a single red rose.",
    "Maeve’s breath fogged the mirror, and in that haze, words began to form.",
    "No one had seen Henry in years, but his voice still played on the old radio.",
    "The wind carried the scent of salt and secrets, ushering him toward the shore.",
    "It wasn’t that the stars were gone; they were simply hiding from humanity.",
    "The forest felt alive, breathing softly as he stepped into its embrace.",
    "'You’re not supposed to be here,' the painting said, frowning.",
    "Magic had a price, and she was fresh out of pocket change.",
    "The candle never burned out, but the room stayed colder than ice.",
    "Their shadows danced on the walls, though no one moved.",
    "The train arrived on time, but no one ever got off.",
    "The clock struck thirteen, and Ella realized today would not follow the rules.",
    "The last star flickered out, leaving Jonas in a darkness he couldn’t explain.",
    "A soft, ghostly whisper woke Lily from a dream she couldn’t remember.",
    "The map’s lines shifted as Leo stared, the destination changing before his eyes.",
    "'You’ve been dead for three days,' the stranger said, 'but you still owe me a favor.'",
    "Behind the old oak tree, Sophie found a door to a world she never imagined.",
    "The cat spoke for the first time, and its words were nothing short of a threat.",
    "Jack knew the house was haunted, but the ghosts seemed oddly polite.",
    "'Congratulations,' the letter read, 'you’ve inherited a dragon.'",
    "The sky turned green on the day of her wedding, an omen no one dared to mention.",
    "In the depths of the forest, Sam stumbled upon a glowing, beating heart.",
    "The photograph on the mantle shifted every night, and no one knew why.",
    "'The stars are falling again,' she whispered, tightening her coat.",
    "The old watchmaker vanished, leaving behind clocks that counted backward.",
    "The seashell hummed a tune he hadn’t heard since childhood.",
    "Emma’s reflection winked at her, and that was when the real trouble began.",
    "The shadow that followed him belonged to no human he’d ever seen.",
    "At exactly midnight, the letterbox began to speak.",
    "The village had one rule: never open the window after dusk.",
    "Deep beneath the city, Aria discovered the Library of Forgotten Worlds."
];


function getRandomPrompt() {
    return prompts[Math.floor(Math.random() * prompts.length)];
}

function updateCurrentPrompt(newPrompt) {
    currentPromptElement.textContent = newPrompt;
    if (!promptLocked) {
        savePromptToServer(newPrompt);
    }
}