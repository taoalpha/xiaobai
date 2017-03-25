import WordCardView from './components/WordCardView'
import auth from 'modules/auth'

export default {
  onEnter: (nextState, replace) => {
    if (!auth.loggedIn()) replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname }
    })
  },
  component: WordCardView
}
