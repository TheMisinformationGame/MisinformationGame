import React from 'react';
import {Link} from "react-router-dom";
import '../App.css'
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import {ActiveStudyScreen} from "./ActiveStudyScreen";
import {getDataManager} from "../model/manager";
import {ProgressLabel} from "../components/StatusLabel";

export class AdminStudy extends ActiveStudyScreen {
    constructor(props) {
        super(props);
        this.state = {study: null};
    }

    componentDidMount() {
        super.componentDidMount();
        getDataManager().getActiveStudy().then((study) => {
            this.setState({study: study});
        });
    }

    render() {
        return (
            <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 bg-opacity-">
                <div className="container min-h-screen w-3/5 mx-auto bg-blue-50 pb-10 border-black
                                border-l-2 border-r-2 border-solid border-opacity-50" >

                    {/*The navigation bar */}
                    <table className="h-10 max-h-20 min-h-10 border-collapse border-black
                                      border-t-2 border-b-2 border-solid pt-5 pb-5 pl-3
                                      w-full bg-gray-100 border-opacity-75">
                        <tr>
                            <td className="w-9/10">
                                <h2 className="font-black text-2xl pl-5">The Misinformation Game</h2>
                            </td>

                            <Link to={"/admin" }>
                                <div className="bg-gray-200 hover:bg-gray-300 float-right min-w-40 text-black
                                                text-center border-black border-opacity-75 border-l-2 border-solid
                                                pt-3 pb-3 pl-2 font-semibold cursor-pointer select-none">

                                        Back to Dashboard
                                        <CloseIcon className="mb-1" />
                                </div>
                            </Link>
                        </tr>
                    </table>

                    {this.state.study && <div className="box-border h-5/6 w-full pt-10 px-10 text-black">
                        {/**This part should fetch data from database, will change it later */}
                        <h1 className="font-semibold text-4xl">{this.state.study.name}</h1>
                        <p className="mt-2">
                            <b>URL:&nbsp;</b>
                            <Link to={"/game/" + this.state.study.id + "/id"}
                                  className="text-blue-500 hover:text-blue-700 underline">
                                {window.location.host + "/game/" + this.state.study.id + "/id"}
                            </Link>
                        </p>
                        <p dangerouslySetInnerHTML={{__html: this.state.study.description}}
                           className="my-4" />

                        <div className="bg-blue-400 hover:bg-blue-500 w-48 text-white
                                        text-center border-black border border-opacity-50 pt-3
                                        pb-3 border-solid font-semibold rounded-md cursor-pointer
                                        select-none">

                            <FileDownloadIcon className="mr-1" />
                            Download results
                        </div>
                    </div>}

                    {!this.state.study && <ProgressLabel className="text-2xl m-2" value="The study is loading..." /> }
                </div>
            </div>
        );
    }
}
