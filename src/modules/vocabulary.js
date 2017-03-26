export let CURRENT_WORD = {};

export default {
  init() {
    // fetch a bunch
    // return one word to start (words[0])
    CURRENT_WORD = {
      word: "pejorative",
      sentences: [
        "After Reagan, the word “liberal” became a pejorative.",
        "Elsewhere, it seems elitist; exclusive in its most pejorative sense.",
        "He views the term as pejorative, and he is notably skeptical about the value of psychiatric diagnosis in voice-hearing cases:"
      ],
      choices: [
        {word: "opacity", def: "the quality of being opaque to a degree; the degree to which something reduces the passage of light"},
        {word: "notably", def: "especially; in particular"},
        {word: "tofu", def: "cheeselike food made of curdled soybean milk"},
        {word: "pejorative", def: "expressing disapproval"}
      ]
    }
    return CURRENT_WORD;
  },
  
  curWord() {
    return CURRENT_WORD;
  },

  markWrong(word) {
    // mark word as wrong
  },
  
  markCorrect(word) {
    // mark word as correct
  },

  markLearned(word) {
    // mark word as learned
  },

  query(word) {
    // return word def/sentences... everything
  },

  next(cb) {
    // return a new word object
    CURRENT_WORD = {
      word: "allegory",
      sentences: [
        "It’s hard to diagram the Kaweah story as an allegory of any contemporary ideology of good and evil, heroism and villainy.",
        "Like the easy allegory of the entire asylum-limbo story line, it’s a case of infatuation with form impeding function.",
        "It’s an environmental catastrophe, and at times an allegory for these rural lives and the modern world."
      ],
      choices: [
        {word: "allegory", def: "a short moral story (often with animal characters)"},
        {word: "environmental", def: "of or relating to the external conditions or surroundings"},
        {word: "diagram", def: "a drawing intended to explain how something works; a drawing showing the relation between the parts"},
        {word: "entire", def: "constituting the full quantity or extent; complete"}
      ]
    }
    cb(CURRENT_WORD);
  },

  previous(cb) {
    // return previous word object
    CURRENT_WORD = {
      word: "adjunct",
      sentences: [
        "Except for four full-time professors, the instructors are adjunct and are very active in the industry.",
        "She was hired Wednesday as an adjunct English professor at Widener University.",
        "Adjunct General David S. Baldwin said at a news conference late Sunday that the helicopters will also be available for search and rescue Monday."
      ],
      choices: [
        {word: "adjunct", def: "something added to another thing but not an essential part of it"},
        {word: "industry", def: "the organized action of making of goods and services for sale"},
        {word: "professor", def: "someone who is a member of the faculty at a college or university"},
        {word: "helicopter", def: "an aircraft without wings that obtains its lift from the rotation of overhead blades"}
      ]
    }
    cb(CURRENT_WORD);
  },

  finish() {
    // finish this time
  }
}

function pretendRequest(secretKey, cb) {
  setTimeout(() => {
    if (secretKey === 'xiaobao') {
      cb({
        authenticated: true,
        token: Math.random().toString(36).substring(7)
      })
    } else {
      cb({ authenticated: false })
    }
  }, 0)
}
