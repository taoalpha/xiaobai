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
    this.synced = false;  // already sync with server or not
  }

  isEmpty() {
    return !this.word;
  }

  // this is used when we need a 
  toJSON() {
    return {
      word: this.word,
      sentences: this.sentences,
      choices: this.choices,
      status: this.status,
      synced: this.synced
    }
  }

  toString() {
    JSON.stringify({
      word: this.word,
      sentences: this.sentences,
      choices: this.choices,
      status: this.status,
      synced: this.synced
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
      CURRENT_WORD: new WordNode(), // always pointing to current word node
      LAST_WORD: new WordNode(),
      LOCALWORD_STORAGE_KEY: "XIAOBAIYAOBEIDANCI", // storage key
      WORD_NODE_MAP: Object.create(null),  // data store for our word nodes
      BATCH_NUMBER: 10,  // regular number of words should be contained in one batch
      SYNC_DEBOUNCE: 20 * 1000,   // Sync debounce
      LOCAL_DEBOUNCE: 5 * 1000,   // local storage sync debounce
      GROWTH_FACTOR: 0.75,  // load more when reach the threshold
    }, options);

    // debounced methods
    this.sync = this._sync();
    this.record = this._record();

    // start index: 0
    this.index = 0;
    this.total = 0;
  }

  _record(immediate) {
    return this.debounce(() => {
      localStorage.setItem("CURRENT_WORD", this.CURRENT_WORD.word);
      let data = Object.keys(this.WORD_NODE_MAP).map(word => {
        return this.WORD_NODE_MAP[word].toJSON();
      });
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
      Object.keys(this.WORD_NODE_MAP).forEach(w => {
        let wn = this.WORD_NODE_MAP[w];
        if (wn.status >= 1) updates.push(wn.word);
      })

      // update remembered field for the user
      axios.patch(`${config.api}/users/${config.username}`, {remembered: updates}).then(() => this.remove(updates));
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
        wn.synced = true;
      }
    })
    this.record();
  }

  // http request (axios should forward to fetch if browser supported)
  getWords(batch) {
    // probably need a retry, just in case the server does not return the words back(it happens several time, not sure why)
    // TODO: figure out why server sometimes return empty words list back
    return axios.get(config.api + "/words/?batch=" + batch);
  }

  init() {
    // fetch a bunch
    // return one word to start (words[0])
    return new Promise((resolve, reject) => {
          try {
            let local = JSON.parse(localStorage.getItem(this.LOCALWORD_STORAGE_KEY));
            if (local) {
              resolve(this.addToList(local));
            } else {
              reject("Null Data");
            }
          } catch(e) {
            reject(e);
          }
        })
        .catch(e => this.getWords(Math.max((this.BATCH_NUMBER * 0.5) | 0, 10)).then(words => this.generateList(words.data)))
        .catch(e => {
          return this.CURRENT_WORD;
        });
  }

  // call to get more, use regular BATCH_NUMBER directly
  // when load more, need to add words returned to current WordNode list
  // handle error inside, no need to return anything, maybe indicate if there is error
  loadMore() {
    return Promise.resolve()
      .then(() => this.getWords(this.BATCH_NUMBER).then(words => this.generateList(words.data)));
  }

  cleanDef(defs) {
    let keys = Object.keys(defs);
    return `<strong><i>${keys[0]}</i></strong>;  ${defs[keys[0]][0]}`;
  }

  generateList(words) {
    let data = words.map((word, i) => {
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
      return {
        word: word.word,
        sentences: word.sentences,
        choices
      };
    });

    return this.addToList(data);
  }

  // build and add node to our list
  //   - from init
  //   - from load more
  addToList(data) {
    let node = this.LAST_WORD;
    data.forEach(word => {
      if (word.synced) return;
      let wordNode = new WordNode(word);
      wordNode.prev = node;
      node.next = wordNode;
      node = wordNode;

      // store into our map
      this.WORD_NODE_MAP[word.word] = wordNode;
      this.total++; // update total number of words we need to remember
    });

    // if first load, or no current word, use first word of this batch
    if (this.LAST_WORD.isEmpty() || this.CURRENT_WORD.isEmpty()) {
      this.CURRENT_WORD = this.LAST_WORD.next;
    }

    // update last node pointer
    this.LAST_WORD = node;
    this._record(true)(); // sync local immediatel

    return Promise.resolve(this.CURRENT_WORD);
  }

  // always return current word node
  // will be auto updated for every call on previous / next
  curWord() {
    return Promise.resolve(this.CURRENT_WORD);
  }

  // return a promise resolve with next word node on the list, if no next one, no change
  // if curIndex is greater than 0.75 * total, load more to the node list
  // update current word node
  // TODO: if no next node, reject with the message: "No More Words."
  next() {
      // return previous word object
    if (this.CURRENT_WORD.next) {
      this.CURRENT_WORD = this.CURRENT_WORD.next;
      this.index++;

      // load more if reach the threshold
      if ((this.index / this.total) >= this.GROWTH_FACTOR) this.loadMore();
    }
    this.record();

    return Promise.resolve(this.CURRENT_WORD);
  }

  // return a promise resolve with previous word node on the list
  // the root node is an empty node, check it before update
  // TODO: if no next node, reject with the message: "Already the first word."
  previous() {
    // return previous word object
    if (this.CURRENT_WORD.prev && this.CURRENT_WORD.prev.word) {
      this.CURRENT_WORD = this.CURRENT_WORD.prev;
      this.index--;
    }
    this.record();
    
    return Promise.resolve(this.CURRENT_WORD);
  }

  // mark word as wrong or correct
  // if word not exists, report to server the error(should not happen unless it is removed since remembered but still somehow is the current word node)
  mark(word, right) {
    if (right) this.WORD_NODE_MAP[word].status++;
    else this.WORD_NODE_MAP[word].status--;
    this.WORD_NODE_MAP[word].status = Math.max(this.WORD_NODE_MAP[word].status, 0);
    this.sync();
  }
}
export default Vocabulary