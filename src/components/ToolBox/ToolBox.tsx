import React, { MouseEventHandler } from 'react';
import { TOOLS } from '../../utils';
import { BoardState } from '../Board/Board';
import Tool, { ToolProps } from './Tool';
import './ToolBox.scss';

interface ToolBoxProps {
	tools: ToolProps[];
}

export class ToolData implements ToolProps {
	type;
	icon;
	value;
	active;
	onClick;

	constructor(tool : string, state : BoardState, onClick? : MouseEventHandler) {
		this.type = tool;
		switch (tool) {
			case "shovel":
				this.icon = "⛏️";
				this.value = state.remaining[TOOLS.DIG];
				this.active = state.tool === TOOLS.DIG;
				this.onClick = onClick;
				break;
			case "flag":
			default:
				this.icon = "🚩";
				this.value = state.remaining[TOOLS.FLAG];
		}
	}
}

class ToolBox extends React.Component<ToolBoxProps> {
	componentDidMount() {
		// @ts-ignore
		window.twemoji.parse(document.querySelector(".toolbox"));
	}
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