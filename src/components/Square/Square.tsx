import React from 'react';
import './Square.scss';
import { SQUARE_STATUS, SQUARE_TYPES, GAME_STATUS } from "../../utils";
import { SquareType, SquareStatus, GameStatus } from "../../types";
import { ClueArray } from '../Clue/Clue';
import { MouseEventHandler } from 'react';

interface SquareInt {
	type: SquareType;
	row: number;
	col: number;
}
interface SquareProps extends SquareInt {
	status: SquareStatus;
	game_state: GameStatus;
	clues: ClueArray; 
	onClick: MouseEventHandler;
}

class Square extends React.Component<SquareProps> implements SquareInt {
	type;
	row;
	col;

	constructor(props : SquareProps) {
		super(props);
		this.type = props.type;
		this.row = props.row;
		this.col = props.col;
	}
	square_content() {
		if (this.props.game_state === GAME_STATUS.LOSS && this.props.status === SQUARE_STATUS.FLAGGED && this.type !== SQUARE_TYPES.BOMB) return "❌";
		if (this.props.status === SQUARE_STATUS.FLAGGED) return "🚩";
		if (this.props.status >= SQUARE_STATUS.REVEALED_BOMB) return "💣";
		if (this.props.game_state === GAME_STATUS.LOSS && this.type === SQUARE_TYPES.BOMB) return "🟠";
		if (this.props.game_state === GAME_STATUS.WIN && this.type === SQUARE_TYPES.BOMB) return "🟡";
		return "";
	}
	componentDidUpdate() {
		// @ts-ignore
		window.twemoji.parse(document.querySelector(`.square[data-row="${this.row}"][data-col="${this.col}"]`));
	}
	render() {
	  return (
		<div className="wrapper">
			<div className={"square" + (this.props.status >= SQUARE_STATUS.REVEALED ? " revealed" : "")} 
				// key={this.props.row + "," + this.props.col} 
				data-row={this.row} data-col={this.col} 
				onMouseDown={this.props.onClick} 
				>
				<span>{this.square_content()}</span>
			</div>
			{this.props.clues}
		</div>
	  );
	}
}

export default Square;
