import axios from "axios";
import config from "../config";

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

    // status -> fallback to 5
    //  0 --- new
    //  1 --- stage 1
    //  2 --- stage 2
    //  3 --- candidate
    //  4 --- finished
    this.status = this.status || 0;
    this.sync = false;  // already sync with server or not
  }

  toJSON() {
    return {
      word: this.word,
      sentences: this.sentences,
      choices: this.choices,
      status: this.status,
      sync: this.sync
    }
  }

  toString() {
    JSON.stringify({
      word: this.word,
      sentences: this.sentences,
      choices: this.choices,
      status: this.status,
      sync: this.sync
    })
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
class Vocabulary {
  constructor(options = {}) {
    // merge in options and default options
    Object.assign(this, {
      CURRENT_WORD: {}, // always pointing to current word node
      LOCALWORD_STORAGE_KEY: "XIAOBAIYAOBEIDANCI", // storage key
      WORD_NODE_MAP: Object.create(null),  // data store for our word nodes
      BATCH_NUMBE: 50,  // regular number of words should be contained in one batch
      SYNC_DEBOUNCE: 20 * 1000,   // Sync debounce
      LOCAL_DEBOUNCE: 5 * 1000,   // local storage sync debounce
    }, options);

    this.sync = this._sync();
    this.record = this._record();
  }

  _record(immediate) {
    return this.debounce(() => {
      localStorage.setItem("CURRENT_WORD", this.CURRENT_WORD.word);
      let data = {};
      Object.keys(this.WORD_NODE_MAP).forEach(word => {
        data[word] = this.WORD_NODE_MAP[word].toJSON();
      })
      localStorage.setItem(this.LOCALWORD_STORAGE_KEY, JSON.stringify(data));
    }, this.LOCAL_DEBOUNCE, immediate);
  }

  debounce(func, wait, immediate) {
    let timeout;
    return function() {
      let context = this, args = arguments;
      let later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      let callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
	  };
  }

  _sync(immediate) {
    return this.debounce(() => {
      let updates = [];
      Object.keys(this.WORD_NODE_MAP).forEach(wn => {
        if (wn.staus >= 4) updates.push(wn.word);
      })

      // update remembered field for the user
      axios.patch(`${config.api}/user/${config.username}`, {remembered: updates}).then(() => this.remove(updates));
    }, this.SYNC_DEBOUNCE, immediate);
  }

  remove(words) {
    // remove from wordlist
    words.forEach(word => {
      let wn = this.WORD_NODE_MAP[word];
      if (wn) {
        let temp = wn.prev;
        if (wn.prev) wn.prev.next = wn.next;
        if (wn.next) wn.next.prev = temp;
      }
    })
  }

  // http request (axios should forward to fetch if browser supported)
  getWords(batch) {
    return axios.get(config.api + "/words/?batch=" + batch);
  }

  init() {
    // fetch a bunch
    // return one word to start (words[0])
    return new Promise((resolve, reject) => {
          try {
            let local = JSON.parse(localStorage.getItem(this.LOCALWORD_STORAGE_KEY));
            if (local) resolve(this.recoverFromLocal(local));
            reject("Null Data");
          } catch(e) {
            reject(e);
          }
        })
        .catch(e => this.getWords(Math.max((this.BATCH_NUMBER * 0.5) | 0, 10)).then(words => this.generateList(words.data)))
        .catch(e => {
          return this.CURRENT_WORD;
        });
  }

  loadMore() {
    return Promise.resolve()
      .thne(() => getWords(this.BATCH_NUMBER).then(words => this.generateList(words.data)))
      .catch(e => {
        return this.CURRENT_WORD;
      })
  }

  cleanDef(defs) {
    let keys = Object.keys(defs);
    return `<i>${keys[0]}</i>;  ${defs[keys[0]][0]}`;
  }

  generateList(words) {
    const emptyRoot = new WordNode();
    let node = [emptyRoot];
    words.forEach((word, i) => {
      let choices = [];
      let pickedIds = [];
      while (choices.length < 3) {
        let randIdx = Math.floor(Math.random() * words.length);
        if (!~pickedIds.indexOf(randIdx) && randIdx !== i) {
          pickedIds.push(randIdx);
          choices.push({word: words[randIdx].word, def: this.cleanDef(words[randIdx].definitions)});
        }
      }
      choices.push({word: word.word, def: this.cleanDef(word.definitions)});
      this.constructList({
        word: word.word,
        sentences: word.sentences,
        choices
      }, node);
    })

    this.CURRENT_WORD = emptyRoot.next;
    this._record(true)(); // sync local immediately

    return Promise.resolve(this.CURRENT_WORD);
  }

  recoverFromLocal(localData) {
    const emptyRoot = new WordNode();
    let node = [emptyRoot];
    Object.keys(localData).forEach(word => {
      this.constructList(localData[word], node);
    });

    this.CURRENT_WORD = emptyRoot.next;
    this._record(true)(); // sync local immediately
    
    return Promise.resolve(this.CURRENT_WORD);
  }

  constructList(word, node) {
    let wordNode = new WordNode(word);
    wordNode.prev = node[0];
    node[0].next = wordNode;
    node[0] = wordNode;

    // store into our map
    this.WORD_NODE_MAP[word.word] = wordNode;
  }

  curWord() {
    return Promise.resolve(this.CURRENT_WORD);
  }

  next() {
      // return previous word object
    if (this.URRENT_WORD.next) this.CURRENT_WORD = this.CURRENT_WORD.next;
    this.record();
    return Promise.resolve(this.CURRENT_WORD);
  }

  previous() {
    // return previous word object
    if (this.CURRENT_WORD.prev && this.CURRENT_WORD.prev.word) this.CURRENT_WORD = this.CURRENT_WORD.prev;
    this.record();
    return Promise.resolve(this.CURRENT_WORD);
  }
  mark(word, right) {
    // mark word as wrong or correct
    if (right) WORD_NODE_MAP[word].status++;
    if (wrong) WORD_NODE_MAP[word].status--;
    WORD_NODE_MAP[word].status = Math.max(WORD_NODE_MAP[word].status, 0);
    this.sync();
  }
}
export default Vocabulary