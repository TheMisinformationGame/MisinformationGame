import logo from "../logo.svg";
import {Component, useState} from "react"
import AccountBoxIcon from '@mui/icons-material/AccountBox';

import { ErrorLabel } from '../components/StatusLabel'

// Please use Tailwind CSS (https://tailwindcss.com/)
// instead of plain CSS where possible.
import "../App.css"


export class Game_ID extends Component{
    constructor(props) {
        super(props);
        this.state = {};
    };

    render(){
        return(
            <div className="w-full bg-gray-400" style={{minHeight: "100vh"}}>
            {/* <div className="border-2 bg-white border-black rounded-md p-4 grid space-y-2 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"> */}
            <div className="bg-gray-200 border-2 border-gray-700 shadow-2xl 
                              grid space-y-2 
                              fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                              px-10 py-4 max-w-full">
                <p className="font-bold text-center -mt-5 p-4">Enter your access ID</p>
                <input className="p-2 border border-black rounded-md justify-self-center mx-6 w-11/12 bg-purple-200" 
                    placeholder="Identification Number" 
                    value={this.state.value} 
                    onChange={e => this.setState({...this.state, value: e.target.value})}>
                </input>
                <button className="py-1 mx-4 border border-black rounded-md text-white bg-blue-500 hover:bg-blue-600" 
                        value={this.state.value} 
                        onClick={() => this.setState({...this.state, clicked: true})}>

                        Login
                </button>
                {this.state.clicked && (!this.state.value || this.state.value.trim() === "") && <ErrorLabel value="Please enter an ID" />}
            </div>
        </div>
        )
    }
    
};


/*function GameIdentification() {
    //const [input, setInput] = useState('');
    //const [clicked, setClicked] = useState(false);

    const fullHeightStyle = {minHeight: "100vh"};

    return (
        <div className="w-full bg-gray-400" style={fullHeightStyle}>
            {/* <div className="border-2 bg-white border-black rounded-md p-4 grid space-y-2 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"> }
            <div className="bg-gray-200 border-2 border-gray-700 shadow-2xl 
                              grid space-y-2 
                              fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                              px-10 py-4 max-w-full">
                <p className="font-bold text-center -mt-5 p-4">Enter your access ID</p>
                <input className="p-2 border border-black rounded-md justify-self-center mx-6 w-11/12 bg-purple-200" 
                    placeholder="Identification Number" 
                    value={this.state.value} 
                    onChange={e => this.setState({...this.state, value: e.target.value})}>
                </input>
                <button className="py-1 mx-4 border border-black rounded-md text-white bg-blue-500 hover:bg-blue-600" 
                        value={input} 
                        onClick={() => this.setState({...this.state, clicked: true})}>

                        Login
                </button>
                {this.state.clicked && (!this.state.value || this.state.value.trim() === "") && <ErrorLabel value="Please enter an ID" />}
            </div>
        </div>
    );
}


*/