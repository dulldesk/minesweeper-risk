import React, { MouseEventHandler } from 'react';
import { Direction } from '../../types';
import './Clue.scss';

interface ClueProps {
	dir: Direction,
	value: number,
	total: number,
	onClick?: MouseEventHandler
}
export type ClueArray = JSX.Element[];

class Clue extends React.Component<ClueProps> {
	static ARROWS : {[key: string] : string} = {
		'N': '↑',
		'NE': '↗',
		'E': '→',
		'SE': '↘',
		'S': '↓',
		'SW': '↙',
		'W': '←',
		'NW': '↖'
	} as const;
	arrow: string;
	value: number;
	percent: string = "";

	constructor(props : ClueProps) {
		super(props);
	// 	this.status = props.status
	// 	this.type = props.type;
		this.arrow = Clue.ARROWS[props.dir];
		this.value = this.props.value;
		this.set_percentage_value();
		this.handleMouseOver = this.handleMouseOver.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
	}
	set_percentage_value() {
		this.percent = this.as_percentage(this.props.value, this.props.total);
	}
	as_percentage(n : number, t : number) : string {
		return (t === 0 ? 0 : Number((n / t * 100).toFixed(1))) + "%";
	}
	handleMouseOver(e: React.MouseEvent) {
		(e.target as Element).textContent = this.percent;
	}
	handleMouseLeave(e: React.MouseEvent) {
		(e.target as Element).textContent = this.value as unknown as string;
	};
	componentDidUpdate(prevProps : ClueProps) {
		if (prevProps.total !== this.props.total) {
			this.set_percentage_value();
		}
	}
	render() {
	  return (
		<div className={"clue " + this.props.dir} onAuxClick={this.props.onClick}>
			<span className="clue__value" onMouseEnter={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>{this.value}</span>
			<span className="clue__direction">{this.arrow}</span>
		</div>
	  );
	}
}

export default Clue;
