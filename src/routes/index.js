// We only need to import the modules necessary for initial render
import CoreLayout from '../layouts/CoreLayout'
import LogIn from './LogIn'
import Home from './Home'
import App from './App'
import CounterRoute from './Counter'

/*  Note: Instead of using JSX, we recommend using react-router
    PlainRoute objects to build route definitions.   */

const HomeView = Home.component;

export const createRoutes = (store) => ({
  path        : '/',
  component   : CoreLayout,
  indexRoute  : App,
  childRoutes : [
    LogIn(store),
    CounterRoute(store),
    App
  ]
})

/*  Note: childRoutes can be chunked or otherwise loaded programmatically
    using getChildRoutes with the following signature:

    getChildRoutes (location, cb) {
      require.ensure([], (require) => {
        cb(null, [
          // Remove imports!
          require('./Counter').default(store)
        ])
      })
    }

    However, this is not necessary for code-splitting! It simply provides
    an API for async route definitions. Your code splitting should occur
    inside the route `getComponent` function, since it is only invoked
    when the route exists and matches.
*/

export default createRoutes
