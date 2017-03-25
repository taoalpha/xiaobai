import { injectReducer } from '../../store/reducers'
import auth from 'modules/auth'
import Home from './containers/HomeContainer'

export default (store) => ({
  onEnter: (nextState, replace) => {
    if (!auth.loggedIn()) replace({
      pathname: '/login',
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
      const Home = require('./containers/HomeContainer').default
      const reducer = require('./modules/home').default

      /*  Add the reducer to the store on key 'counter'  */
      injectReducer(store, { key: 'home', reducer })

      cb(null, Home)

      /* Webpack named bundle   */
    }, 'home')
  }
})
