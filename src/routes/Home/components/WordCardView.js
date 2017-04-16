import React from 'react'
import renderHTML from 'react-render-html';
import Card from 'components/Card'
import Loader from 'components/Loader'
import './WordCardView.scss'

const answerCard =  (props) => (
  <div key="answerCard" className="card-content collection white">
    <form className="choices">
      {
        props.choices.map((choice, i) => (
            <p key={choice.word} className="collection-item choice">
              <input className="with-gap" type="radio" id={"test" + i} onChange={props.selectIt.bind(null, choice.word)} checked={choice.word === props.selectedChoice} />
              <label htmlFor={"test" + i} className={props.error !== undefined ? (choice.word === props.word ? "correct" : choice.word === props.selectedChoice ? "error" : "") : ""}>{renderHTML(choice.def)}</label>
            </p>
        ))
      }
    </form>
  </div>
);

const sentenceCard = (props) => (
  <div key="sentenceContent" className="card-image card-content white-text sentences">
    {
      props.sentences.map((sen, i) => (
        <p className="sentence" key={i} style={i > 0 && !props.showMoreSentences ? {display: "none"} : {}}>{renderHTML(sen.s)}</p>
      ))
    }
    <span className="card-title word-name">{props.word}</span>
    {
      props.sentences.length > 1 && (<a onClick={props.toggleMore} className="btn-floating halfway-fab waves-effect waves-light red"><i className="material-icons">{props.showMoreSentences ? "expand_less" : "expand_more"}</i></a>)
    }
  </div>
)

const cardAction =  (props) => (
  <div className="card-action white">
    <a onClick={props.prevWord}>Previous</a>
    <a onClick={props.nextWord}>Next</a>
  </div>
);


const WordCardView = (props) => {
  if (props.loading) {
    props.loadInitial();
    return (
      <div className="row">
        <div className="col s2 offset-s5 m2 offset-m5">
          <Loader />
        </div>
      </div>
    );
  }
  let cardProps = {...props, contents: [ sentenceCard(props), answerCard(props)], action: cardAction(props)};
  return (
    <div className="row oneWord">
      <div className="col s12 m6">
        <Card  {...cardProps} />
      </div>
    </div>
  );
};

export default WordCardView
