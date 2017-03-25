const tokenName = "woaixiaobai1314";
module.exports = {
  /*
  login(email, pass, cb) {
    cb = arguments[arguments.length - 1]
    if (localStorage.token) {
      if (cb) cb(true)
      this.onChange(true)
      return
    }
    pretendRequest(email, pass, (res) => {
      if (res.authenticated) {
        localStorage.token = res.token
        if (cb) cb(true)
        this.onChange(true)
      } else {
        if (cb) cb(false)
        this.onChange(false)
      }
    })
  },
  */
  login(secretKey, cb) {
    cb = arguments[arguments.length - 1]
    if (localStorage.getItem(tokenName)) {
      if (cb) cb(true)
      return
    }
    pretendRequest(secretKey, (res) => {
      if (res.authenticated) {
        localStorage.setItem(tokenName, res.token)
        if (cb) cb(true)
      } else {
        if (cb) cb(false)
      }
    })
  },


  getToken() {
    return localStorage.getItem(tokenName)
  },

  logout(cb) {
    localStorage.removeItem(tokenName)
    if (cb) cb()
  },

  loggedIn() {
    return !!localStorage.getItem(tokenName)
  },

  onChange() {}
}

function pretendRequest(secretKey, cb) {
  setTimeout(() => {
    if (secretKey === 'xiaobao') {
      cb({
        authenticated: true,
        token: Math.random().toString(36).substring(7)
      })
    } else {
      cb({ authenticated: false })
    }
  }, 0)
}
