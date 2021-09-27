import "../App.css"
import {ContinueButton} from "./GameIdentification";
import {getDataManager} from "../model/manager";
import {Component} from "react";


export class GamePrompt extends Component {
    constructor(props) {
        super(props);
        this.state = {study: null};
    }

    componentDidMount() {
        getDataManager().getActiveStudy().then((study) => {
            this.setState({study: study});
        });
    }

    render() {
        const study = this.state.study;
        return (
            <div className="fixed left-0 top-0 w-full flex flex-col z-50
                            justify-center items-center bg-white bg-opacity-80"
                 style={{minHeight: "100vh"}}>

                {study &&
                <div className="m-4 max-w-2xl">
                    <p className="text-center text-4xl" dangerouslySetInnerHTML={{__html: study.prompt}} />

                    {/* Used for reserving space below the continue button. */}
                    <div className="h-16" />
                </div>}

                <div className="bg-gray-100 py-1 border-t-2 border-gray-400 shadow-2xl
                                fixed bottom-0 left-0 w-full h-16
                                flex justify-center items-center">
                    <ContinueButton className="text-xl px-4 py-2"
                                    to={this.props.to} condition={this.props.to}
                                    onClick={this.props.onClick} />
                </div>
            </div>
        );
     }
}

