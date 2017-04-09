import axios from "axios";
import config from "../config";

// export
export let CURRENT_WORD = {};
export const LOCALWORD_STORAGE_KEY = "XIAOBAIYAOBEIDANCI"

const MAX_RETRY = 5;

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
const getWords = () => axios.get(config.api + "/words/");


// always return a promise
const Vocabulary = {
  init() {
    // fetch a bunch
    // return one word to start (words[0])
    const localWordData = localStorage.getItem(LOCALWORD_STORAGE_KEY);
    let p = Promise.resolve();
    return p.then(() => Vocabulary.generateList(JSON.parse(localWordData)))
            .catch(e => getWords())
            .then(words => Vocabulary.generateList(words.data))
            .catch(e => null)
  },

  cleanDef(defs) {
    let keys = Object.keys(defs);
    return `<i>${keys[0]}</i>;  ${defs[keys[0]][0]}`;
  },

  generateList(words) {
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
    return Promise.resolve(CURRENT_WORD);
  },
  
  curWord() {
    return Promise.resolve(CURRENT_WORD);
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

  next() {
    // return previous word object
    if (CURRENT_WORD.next) CURRENT_WORD = CURRENT_WORD.next;
    return Promise.resolve(CURRENT_WORD);
  },

  previous() {
    // return previous word object
    if (CURRENT_WORD.prev) CURRENT_WORD = CURRENT_WORD.prev;
    return Promise.resolve(CURRENT_WORD);
  }
};

export default Vocabulary