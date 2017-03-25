import { browserHistory } from 'react-router'
import vocabulary from "modules/vocabulary"

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
export const nextWord = (e) => {
  e.preventDefault();
  return (dispatch) => {
    return new Promise((resolve) => {
      vocabulary.next(word => {
        dispatch({
          type    : WORD_CHNAGE,
          payload : word 
        })
        resolve()
      })
    })
  }
}

export const prevWord = (e) => {
  e.preventDefault();
  return (dispatch) => {
    return new Promise((resolve) => {
      vocabulary.previous(word => {
        dispatch({
          type    : WORD_CHNAGE,
          payload : word 
        })
        resolve()
      })
    })
  }
}

export const toggleMore = () => {
  return {
    type: TOGGLE_MORE_SENTENCE
  }
}

export const selectIt = (word) => {
  return (dispatch) => {
    // update selected
    dispatch({
      type    : SELECT_CHOICE,
      payload : word 
    })
    
    let answer = vocabulary.curWord().word;

    dispatch({
      type    : RIGHT_OR_WRONG,
      payload : word === answer
    })

    // if chose wrong answer
    if (word !== answer) return;

    // else, ready to go to next word
    return new Promise((resolve) => {
      vocabulary.next(word => {
        dispatch({
          type    : WORD_CHNAGE,
          payload : word 
        })
        resolve()
      })
    })
  }
}


export const actions = {
  nextWord,
  prevWord,
  selectIt,
  toggleMore
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
    error: false
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
    error: !!action.payload
  })
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {...vocabulary.init(), selectedChoice: "", showMoreSentences: false, error: false};
export default function logInReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
