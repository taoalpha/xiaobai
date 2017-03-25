import React from 'react'
import { Input } from 'components/Form'
import './LogIn.scss'

const constants = {
  name: "Your Secret Key",
  id: "secretKey",
  error: "Wrong Key",
  success: "Happy Learning!"
};

export const LogIn = (props) => (
  <form className="col s12 loginForm" onSubmit={props.login}>
    <Input {...constants} valid={props.valid} type={props.type} focus={props.focus} onChange={props.handleChange} onBlur={props.onBlur} onFocus={props.onFocus} value={props.value} />
  </form>
)

LogIn.propTypes = {
  handleChange: React.PropTypes.func.isRequired,
  login: React.PropTypes.func.isRequired,
  onFocus: React.PropTypes.func.isRequired,
  onBlur: React.PropTypes.func.isRequired,
  valid: React.PropTypes.string,
  focus: React.PropTypes.bool,
  type: React.PropTypes.string,
  value: React.PropTypes.string
}

export default LogIn
