import React from 'react';
import './Square.scss';
import {SQUARE_STATUS, SQUARE_TYPES, GAME_STATUS} from "../../utils";


class Square extends React.Component {
	constructor(props) {
		super(props);
		this.type = props.type;
		this.row = props.row;
		this.col = props.col;
		// this.revealSquare = this.revealSquare.bind(this);
	}
	square_content() {
		if (this.props.game_state === GAME_STATUS.LOSS && this.props.status === SQUARE_STATUS.FLAGGED && this.type !== SQUARE_TYPES.BOMB) return "❌";
		if (this.props.status === SQUARE_STATUS.FLAGGED) return "🚩";
		if (this.props.status >= SQUARE_STATUS.REVEALED_BOMB) return "💣";
		if (this.props.game_state === GAME_STATUS.LOSS && this.type === SQUARE_TYPES.BOMB) return "🟠";
		if (this.props.game_state === GAME_STATUS.WIN && this.type === SQUARE_TYPES.BOMB) return "⚪";
		return "";
	}
	render() {
	  return (
		<div className="wrapper">
			<div className={"square" + (this.props.status >= SQUARE_STATUS.REVEALED ? " revealed" : "")} 
				// key={this.props.row + "," + this.props.col} 
				data-row={this.row} data-col={this.col} 
				onClick={this.props.onClick} 
				>
				<span>{this.square_content()}</span>
			</div>
			{this.props.clues}
		</div>
	  );
	}
}

export default Square;
