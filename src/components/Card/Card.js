import React from 'react'
import './Card.scss'

export const Card = (props) => (
  <div className={"card " + props.color}>
    {props.contents}
    {props.action}
  </div>
);

export default Card
