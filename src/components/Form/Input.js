import React from 'react'

export const Input = (props) => (
  <div className="row">
    <div className="input-field col s12">
      <input type={props.type} id={props.id} onFocus={props.onFocus} onBlur={props.onBlur} value={props.value} onChange={props.onChange} className={props.valid}/>
      <label className={props.focus || props.value ? "active" : ""} htmlFor={props.id} data-error={props.error} data-success={props.success}>
        {props.name}
      </label>
    </div>
  </div>
)

export default Input
