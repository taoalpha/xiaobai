import React from 'react'
import Card from 'components/Card'
import './WordCardView.scss'

const PROPS = {
  sentence: [
    "After Reagan, the word “liberal” became a pejorative.",
    "Elsewhere, it seems elitist; exclusive in its most pejorative sense.",
    "He views the term as pejorative, and he is notably skeptical about the value of psychiatric diagnosis in voice-hearing cases:"
  ],
  color: "blue",
  answers: [
    {word: "opacity", checked: true},
    {word: "controversal"},
    {word: "tofu"},
    {word: "world"}
  ],
  answerCheck: (answer) => {
    if (answer.word === "tofu") return true;
    return false;
  },
  sentenceStatus: "expand_more",
  toggleSentence: (props) => {
    props.sentenceStatus = "expand_less"
  }
};

const answerCard =  (props) => (
  <div key="answerCard" className="card-content collection white">
    <form action="#">
      {
        props.answers.map((an, i) => {
          return (
            <p key={an.word} className="collection-item">
              <input className="with-gap" type="radio" id={"test" + i} onChange={props.answerCheck.bind(null, an)} checked={!!an.checked} />
              <label htmlFor={"test" + i}>{an.word}</label>
            </p>
          )
        })
      }
    </form>
  </div>
);

const sentenceCard = (props) => (
  <div key="sentenceContent" className="card-image card-content white-text">
    {
      props.sentence.map((sen, i) => {
        return <p key={i} style={i > 0 ? {display: "none"} : {}}>{sen}</p>
      })
    }
    <a onClick={props.toggleSentence} className="btn-floating halfway-fab waves-effect waves-light red"><i className="material-icons">{props.sentenceStatus}</i></a>
  </div>
)

const cardAction =  (props) => (
  <div className="card-action white">
    <a href="#">Previous</a>
    <a href="#">Next</a>
  </div>
);


const WordCardView = (props) => {
  let cardProps = {};
  ["answers", "color", "sentence", "content", "action", "toggleSentence", "answerCheck", "sentenceStatus"].forEach(k => cardProps[k] = props[k] || PROPS[k]);
  cardProps.contents = [ sentenceCard(cardProps), answerCard(cardProps)];
  cardProps.action = cardAction(props);
  return (
    <div className="row">
      <div className="col s12 m6">
        <Card  {...cardProps} />
      </div>
    </div>
  );
};

export default WordCardView
