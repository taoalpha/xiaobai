import React from 'react'
import ReactDOM from 'react-dom'
import createStore from './store/createStore'
import AppContainer from './containers/AppContainer'

// import 'materialize-css/bin/materialize.js'
import 'materialize-css/bin/materialize.css'

window.jQuery = require('jquery');
require('materialize-css/js/initial');
require('materialize-css/js/jquery.easing.1.3');
require('materialize-css/js/animation');
window.Vel = require('materialize-css/js/velocity.min');
require('materialize-css/js/hammer.min');
require('materialize-css/js/jquery.hammer');
require('materialize-css/js/global');

require('materialize-css/js/toasts');

// ========================================================
// Store Instantiation
// ========================================================
const initialState = window.___INITIAL_STATE__
const store = createStore(initialState)

// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root')

const App = () => {
  const routes = require('./routes/index').default(store)
  return (
    <AppContainer store={store} routes={routes} />
  );
};

let render = () => {

  ReactDOM.render(
    <App />,
    MOUNT_NODE
  )
}

// This code is excluded from production bundle
if (__DEV__) {
  if (module.hot) {
    // Development render functions
    const renderApp = render
    const renderError = (error) => {
      const RedBox = require('redbox-react').default

      ReactDOM.render(<RedBox error={error} />, MOUNT_NODE)
    }

    // Wrap render in try/catch
    render = () => {
      try {
        renderApp()
      } catch (error) {
        console.error(error)
        renderError(error)
      }
    }

    // Setup hot module replacement
    module.hot.accept('./routes/index', () =>
      setImmediate(() => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE)
        render()
      })
    )
  }
}

// ========================================================
// Go!
// ========================================================
render()
