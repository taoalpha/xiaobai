import { browserHistory } from 'react-router'
import Vocabulary from "modules/vocabulary"
import randomColor from 'random-material-color'

const voc = new Vocabulary();

// ------------------------------------
// Constants
// ------------------------------------
export const WORD_CHNAGE = 'WORD_CHNAGE'  // change word
export const TOGGLE_MORE_SENTENCE = 'TOGGLE_MORE_SENTENCE'
export const SELECT_CHOICE = 'SELECT_CHOICE'
export const RIGHT_OR_WRONG = 'RIGHT_OR_WRONG'

// ------------------------------------
// Actions
// ------------------------------------
export const loadInitial = () => {
  return (dispatch) => {
    return voc.init()
      .then(word => {
        dispatch({
          type    : WORD_CHNAGE,
          payload : word 
        })
      });
  }
}

export const nextWord = (e) => {
  e.preventDefault();
  return (dispatch) => {
    return voc.next()
      .then(word => {
        dispatch({
          type    : WORD_CHNAGE,
          payload : word 
        })
      });
  }
}

export const prevWord = (e) => {
  e.preventDefault();
  return (dispatch) => {
    return voc.previous()
      .then(word => {
        dispatch({
          type    : WORD_CHNAGE,
          payload : word 
        })
      });
  }
}

export const toggleMore = () => {
  return {
    type: TOGGLE_MORE_SENTENCE
  }
}

export const selectIt = (word) => {
  return (dispatch, getState) => {
    if (getState().home.selectedChoice) return; // can only select once

    // update selected
    dispatch({
      type    : SELECT_CHOICE,
      payload : word
    });

    return voc.curWord()
      .then(answer => {
        voc.mark(word, word === answer.word);
        dispatch({
          type    : RIGHT_OR_WRONG,
          payload : word === answer.word
        });
      });
  }
}


export const actions = {
  nextWord,
  prevWord,
  selectIt,
  toggleMore,
  loadInitial
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [WORD_CHNAGE]: (state, action) => ({
    ...state,
    ...action.payload,
    selectedChoice: "",
    showMoreSentences: false,
    error: undefined,
    color: (colorStore[action.payload.word] = colorStore[action.payload.word] ? colorStore[action.payload.word] : randomColor.getColor()),
    loading: false
  }),
  [TOGGLE_MORE_SENTENCE]: (state, action) => ({
    ...state,
    showMoreSentences: !state.showMoreSentences
  }),
  [SELECT_CHOICE]: (state, action) => ({
    ...state,
    selectedChoice: action.payload
  }),
  [RIGHT_OR_WRONG]: (state, action) => ({
    ...state,
    error: !action.payload
  })
}

// ------------------------------------
// Reducer
// ------------------------------------
const colorStore = {};  // store all colors for every card
const initialState = {loading: true, selectedChoice: "", showMoreSentences: false, error: undefined};
export default function logInReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
