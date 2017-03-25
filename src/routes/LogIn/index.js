import { injectReducer } from '../../store/reducers'
import auth from "modules/auth"

export default (store) => ({
  path : 'login',
  onEnter: (nextState, replace) => {
    if (auth.loggedIn()) replace({
      pathname: '/',
      state: { nextPathname: nextState.location.pathname }
    })
  },
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
          dependencies for bundling   */
      const LogIn = require('./containers/LogInContainer').default
      const reducer = require('./modules/login').default

      /*  Add the reducer to the store on key 'counter'  */
      injectReducer(store, { key: 'loginfo', reducer })

      /*  Return getComponent   */
      cb(null, LogIn)

      /* Webpack named bundle   */
    }, 'login')
  }
})
