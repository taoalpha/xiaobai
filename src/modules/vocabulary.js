import axios from "axios";
import config from "../config";

// export
export let CURRENT_WORD = {};
export const LOCALWORD_STORAGE_KEY = "XIAOBAIYAOBEIDANCI"

// define word node used in WordList
class WordNode {
  constructor(word) {
    /**
     * @class WordNode
     * @param {Object} word
     * @property {String} word.word - the actual word
     * @property {Array} word.sentences - examples for this word
     * @property {Array} word.choices - choices generated for this word(contains the actual word), length = 4
     */
    Object.assign(this, word);
    
    // pointers
    this.next = this.prev = null;

    // status -> fallback to "new"
    this.status = this.status || "new";
  }
}

/**
 * dataStore structure:
 *  1. use DoubleLinkedList - similar with LRU cache to mimick forgetting curve
 *  2. for single node: {word: word_def, next: node, prev: node, status: [new, fail, raw, rare, medium, done]}
 *  3. word_def: {word, sentences, choices}
 * 
 * data work flow:
 *  1. init:
 *    - fetch a batch (50) from server
 *    - re-organize to a DoubleLinkedList
 *  2. mark:
 *    - if true: level up its status, mark current timestamp
 *    - if false: level down its status, move 
 */

const Vocabulary = {
  init(cb) {
    // fetch a bunch
    // return one word to start (words[0])
    const localWordData = localStorage.getItem(LOCALWORD_STORAGE_KEY);
    try {
      Vocabulary.generateList(JSON.parse(localWordData), cb);
    } catch (e) {
      getWords(words => {
        Vocabulary.generateList(words.data, cb);
      });
    }
  },

  cleanDef(defs) {
    let keys = Object.keys(defs);
    return `<i>${keys[0]}</i>  ${defs[keys[0]][0]}`;
  },

  generateList(words, cb) {
    // generate an
    const emptyRoot = new WordNode();
    let node = emptyRoot;
    words.forEach((word, i) => {
      let choices = [];
      let pickedIds = [];
      while (choices.length < 3) {
        let randIdx = Math.floor(Math.random() * words.length);
        if (!~pickedIds.indexOf(randIdx) && randIdx !== i) {
          pickedIds.push(randIdx);
          choices.push({word: words[randIdx].word, def: Vocabulary.cleanDef(words[randIdx].definitions)});
        }
      }
      choices.push({word: word.word, def: Vocabulary.cleanDef(word.definitions)});
      let wordNode = new WordNode({
        word: word.word,
        sentences: word.sentences,
        choices
      });
      wordNode.prev = node;
      node.next = wordNode;
      node = wordNode;
    })

    CURRENT_WORD = emptyRoot.next;
    console.log(CURRENT_WORD);
    if (cb) cb(CURRENT_WORD)
  },
  
  curWord() {
    return CURRENT_WORD;
  },

  mark(word, right) {
    // mark word as wrong or correct
    if (right) {

    } else {

    }
  },
  
  markLearned(word) {
    // mark word as learned
  },

  query(word) {
    // return word def/sentences... everything
  },

  next(cb) {
    // return previous word object
    if (CURRENT_WORD.next) {
      CURRENT_WORD = CURRENT_WORD.next;
      cb(CURRENT_WORD)
    } else {
      cb(CURRENT_WORD);
    }
  },

  previous(cb) {
    // return previous word object
    if (CURRENT_WORD.prev) {
      CURRENT_WORD = CURRENT_WORD.prev;
      cb(CURRENT_WORD)
    } else {
      cb(CURRENT_WORD);
    }
  },

  finish() {
    // finish this time
  }
}

function getWords(cb) {
  axios.get(config.api + "/words/")
    .then(cb)
    .catch(err => {
      console.log(err);
    });
}


function pretendRequest(word, cb) {
  setTimeout(() => {
    cb([
      {
        word: "pejorative",
        def: "expressing disapproval",
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
    ])
  }, 3000)
}

export default Vocabulary