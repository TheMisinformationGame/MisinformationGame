import {Component} from "react"
import {ErrorLabel} from '../components/StatusLabel';
import "../App.css"
import {ConditionalLink} from "../components/ConditionalLink";
import {getDataManager} from "../model/manager";


export class ContinueButton extends Component {
    render() {
        return (
            <ConditionalLink to={this.props.to} condition={this.props.condition} onClick={this.props.onClick}
                             className={
                                 "px-3 py-2 rounded-md text-white cursor-pointer " +
                                 "select-none bg-blue-500 hover:bg-blue-600 " +
                                 (this.props.className || "")
                             }>

                Continue
            </ConditionalLink>
        );
    }
}

export class GameIdentification extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    };

    render(){
        return(
            <div className="w-full bg-gray-100" style={{minHeight: "100vh"}}>
            <div className="bg-white rounded-xl shadow-xl border border-gray-400
                              grid space-y-2 px-10 py-4 max-w-full
                              fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

                <p className="font-bold">Enter your access ID:</p>
                <input className="px-3 py-2 border border-gray-400 rounded-md justify-self-center bg-gray-100"
                       placeholder="ID Number"
                       value={this.state.value}
                       onChange={e => this.setState({...this.state, value: e.target.value})}>
                </input>
                {this.state.clicked && (!this.state.value || this.state.value.trim() === "") &&
                    <ErrorLabel value="Please enter an ID" />}

                <ContinueButton to="game_intro"
                                condition={this.state.value && this.state.value.trim() !== ""}
                                onClick={() => this.setState({...this.state, clicked: true})} />
            </div>
        </div>
        )
    }
    
}
