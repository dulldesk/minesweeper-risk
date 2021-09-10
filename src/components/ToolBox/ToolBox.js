import React from 'react';
import './ToolBox.scss';

class Tool extends React.Component {
	// constructor(props) {
	// 	super(props);

		// switch (this.props.type) {
		// 	case "shovel":
		// 		this.toolicon = "⛏️";
		// 		break;
		// 	case "flag":
		// 	default:
		// 		this.toolicon = "🚩";
		// 		break;
		// }
		// this.status = props.status
		// this.type = props.type;
		// this.revealSquare = this.revealSquare.bind(this);
	// }
	render() {
	  return (
		<div className={"tool" + (this.props.active ? " selected" : "")} onClick={this.props.onClick}>
			<span className="icon">{this.props.icon}</span>
			<span className="count">{this.props.value}</span>
		</div>
	  );
	}
}

class ToolBox extends React.Component {
	// constructor(props) {
		// super(props);
		// this.status = props.status
		// this.type = props.type;
		// this.revealSquare = this.revealSquare.bind(this);
	// }
	render() {
	  return (
		  <div className="toolbox">
			{this.props.tools.map(tool => (
				<Tool {...tool} key={tool.type} />
			))}
		</div>
	  );
	}
}

export default ToolBox;
export {Tool};
