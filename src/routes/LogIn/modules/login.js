import auth from "modules/auth"
import { browserHistory } from 'react-router'

// ------------------------------------
// Constants
// ------------------------------------
export const SECRETKEY_CHANGE = 'SECRETKEY_CHANGE'
export const LOGSTATUS_CHANGE = 'LOGSTATUS_CHANGE'
export const INPUTFOCUS_CHANGE = 'INPUTFOCUS_CHANGE'

// ------------------------------------
// Actions
// ------------------------------------
export function updateSecretKey (value) {
  return {
    type    : SECRETKEY_CHANGE,
    payload : value
  }
}

export const login = (e) => {
  e.preventDefault();
  return (dispatch, getState) => {
    let key = getState().loginfo.key;
    return new Promise((resolve) => {
      auth.login(key, (pass) => {
        dispatch({
          type    : LOGSTATUS_CHANGE,
          payload : pass 
        })

        // jump to home page if pass
        if (pass) browserHistory.push("/");
        resolve()
      })
    })
  }
}

export const inputFocus = (value) => {
  return {
    type    : INPUTFOCUS_CHANGE,
    payload : value
  }
}


export const actions = {
  updateSecretKey,
  login,
  inputFocus
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [SECRETKEY_CHANGE]    : (state, action) => ({
    ...state,
    key: action.payload
  }),
  [LOGSTATUS_CHANGE]    : (state, action) => ({
    ...state,
    success: action.payload ? "valid" : "invalid"
  }),
  [INPUTFOCUS_CHANGE]   : (state, action) => ({
    ...state,
    focus: action.payload
  })
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {key: "", success: "", focus: false}
export default function logInReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
