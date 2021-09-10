import React from 'react';
import './Clue.scss';

class Clue extends React.Component {
	static ARROWS = {
		'N': '↑',
		'NE': '↗',
		'E': '→',
		'SE': '↘',
		'S': '↓',
		'SW': '↙',
		'W': '←',
		'NW': '↖'
	};
	constructor(props) {
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
	as_percentage(n, t) {
		return (t === 0 ? 0 : Number((n / t * 100).toFixed(1))) + "%";
	}
	handleMouseOver(e) {
		e.target.textContent = this.percent;
	}
	handleMouseLeave(e) {
		e.target.textContent = this.value;
	}
	componentDidUpdate(prevProps) {
		if (prevProps.total !== this.props.total) {
			this.set_percentage_value();
		}
	}
	render() {
	  return (
		<div className={"clue " + this.props.dir}>
			<span className="clue__value" onMouseEnter={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>{this.value}</span>
			<span className="clue__direction">{this.arrow}</span>
		</div>
	  );
	}
}

export default Clue;