import React, { MouseEventHandler } from 'react';

export interface ToolProps {
	type: string;
	icon: string;
	value: number;
	active?: boolean;
	onClick?: MouseEventHandler;
}

class Tool extends React.Component<ToolProps> {
	render() {
		return (
			<div className={"tool" + (this.props.active ? " selected" : "")} onClick={this.props.onClick}>
				<span className="icon">{this.props.icon}</span>
				<span className="count">{this.props.value}</span>
			</div>
		);
	}
}

export default Tool;