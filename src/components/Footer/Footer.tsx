import React from 'react';
import {ReactComponent as Arrow} from "./rotate-cw.svg";
import "./Footer.scss";
import info from "../../data/instructions.txt";
import tips from "../../data/tips.txt";
import credit from "../../data/footer.txt";
import ReactMarkdown from 'react-markdown';

interface EndCardProps {
	result? : string;
	refresh? : any;
}

interface InfoProps {
	open? : boolean;
	toggleModal : any;
}

class GameEnd extends React.Component<EndCardProps> {
	render() {
		return (
			<>
				<span onClick={this.props.refresh} className="ptr"><Arrow /></span>
				<span>{this.props.result}</span>
			</>
		)
	}
}

class Instructions extends React.Component<InfoProps> {
	info : string;
	footer_text : string;
	tips : string[];
	constructor(props: InfoProps) {
		super(props);
		this.info = "";
		this.footer_text = "";
		this.tips = [];
	}
	componentDidMount() {
		fetch(info).then(i => i.text()).then(i => this.info = i);
		fetch(credit).then(i => i.text()).then(i => this.footer_text = i);
		fetch(tips).then(i => i.text()).then(i => this.tips = i.split("\n"));
	}
	getTip() {
		if (Math.random() < 0.7) return this.footer_text;
		return this.tips[Math.floor(Math.random() * this.tips.length)];
	}
	render() {
		const handleClick = {onClick: this.props.toggleModal};
		if (this.props.open === undefined) {
			return (
				<span className="ptr" {...handleClick}>?</span>
			)
		}
		return (
			<>
				<div className="scuffed-wrapper" style={!this.props.open ? {display: "none"} : {}}>
					<div className="overlay" {...handleClick}>
					</div>
						<div className="modal">
							<ReactMarkdown>{ this.info }</ReactMarkdown>
							<small><ReactMarkdown>{ this.getTip() }</ReactMarkdown></small>
							<span className="modal__x ptr" {...handleClick}>&times;</span>
						</div>
				</div>
			</>
		)
	}
}

class Footer extends React.Component<EndCardProps, {open_modal : boolean}> {
	constructor(props : EndCardProps) {
		super(props);
		this.state = {
			open_modal: false
		}
		this.handleEsc = this.handleEsc.bind(this);
		this.toggleModal = this.toggleModal.bind(this);
	}
	handleEsc(e : KeyboardEvent) {
		if (e.key === "Escape") {
			this.toggleModal();
		}
	}
	toggleModal() {
		let now_open = !this.state.open_modal;
		this.setState({
			open_modal: now_open
		});
		if (now_open) {
			document.addEventListener("keyup", this.handleEsc);
		} else {
			document.removeEventListener("keyup", this.handleEsc);
		}
	}
	render() {
		return (
			<>
				<div className="space"></div>
				<footer>
					{
						this.props.result	
						? <GameEnd {...this.props} />
						: <Instructions toggleModal={this.toggleModal.bind(this)} />
					}
				</footer>
				<Instructions open={this.state.open_modal} toggleModal={this.toggleModal.bind(this)} />
			</>
		)
	}
}

export default Footer;
