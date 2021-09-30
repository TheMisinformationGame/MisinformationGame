import React, {Component} from 'react';
import {Link} from "react-router-dom";
import '../App.css'
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UploadIcon from "@mui/icons-material/Upload";
import BlockIcon from '@mui/icons-material/Block';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import {SimpleActiveStudyScreen} from "./ActiveStudyScreen";
import {isOfType} from "../utils/types";
import {BrokenStudy} from "../model/study";
import {ErrorLabel} from "../components/StatusLabel";


class AdminStudy extends Component {
    render() {
        const study = this.props.study;
        const modifiedTime = new Date(study.lastModifiedTime * 1000);

        const isBroken = isOfType(study, BrokenStudy);
        let target = null;
        if (!isBroken) {
            target = "/game/" + study.id + (study.requireIdentification ? "/id" : "/pre-intro");
        }

        return (
            <div className="box-border w-full pt-10 px-10">
                {/* Name of the study. */}
                <h1 className="font-semibold text-4xl">{study.name}</h1>

                {/* If not broken, the game URL for this study. */}
                {!isBroken && <p className="mt-2">
                    <b>URL:&nbsp;</b>
                    <Link to={target}
                          className="text-blue-500 hover:text-blue-700 underline">
                        {window.location.host + "/game/" + study.id + "/id"}
                    </Link>
                </p>}

                {/* Last Modified Time. */}
                <p className="mt-2">
                    <b>Last Modified:&nbsp;</b>
                    <span>{
                        modifiedTime.toLocaleString("en-US", {weekday: "long"}) +
                        ", " + modifiedTime.toLocaleString()
                    }</span>
                </p>

                {/* Error if Broken. */}
                {isBroken &&
                    <ErrorLabel className="my-6" value={[<b>This study is broken:</b>, study.error]} />}

                {/* Description. */}
                <p className="mt-2">
                    <b className="block">Description:&nbsp;</b>
                    <span dangerouslySetInnerHTML={{__html: study.description}} />
                </p>

                {/* Actions. */}
                <p className="mt-6 mb-2">
                    <b className="block">Actions:&nbsp;</b>
                </p>

                {/* Download Results Button. */}
                <div className="w-52 pt-3 pb-3 mb-4 bg-purple-400 hover:bg-purple-500
                                text-center select-none border-black border border-opacity-50
                                border-solid font-semibold rounded-md cursor-pointer">

                    <FileDownloadIcon className="mr-1" />
                    Download Results
                </div>

                {/* Update Study Button. */}
                <div className="w-52 pt-3 pb-3 mb-4 bg-blue-400 hover:bg-blue-500
                                text-center select-none border-black border border-opacity-50
                                border-solid font-semibold rounded-md cursor-pointer">

                    <UploadIcon className="mr-1" />
                    Update Study
                </div>

                {/* Disable/Enable Study Button. */}
                <div className="w-52 pt-3 pb-3 mb-4 bg-yellow-300 hover:bg-yellow-400
                                text-center select-none border-black border border-opacity-50
                                border-solid font-semibold rounded-md cursor-pointer">

                    <BlockIcon className="mr-2 mb-0.5" />
                    Disable Study
                </div>

                {/* Disable/Enable Study Button. */}
                <div className="w-52 pt-3 pb-3 mb-4 bg-green-400 hover:bg-green-500
                                text-center select-none border-black border border-opacity-50
                                border-solid font-semibold rounded-md cursor-pointer">

                    <ControlPointIcon className="mr-2" />
                    Enable Study
                </div>

                {/* Delete Study Button. */}
                <div className="w-52 pt-3 pb-3 mb-4 bg-red-400 hover:bg-red-500
                                text-center select-none border-black border border-opacity-50
                                border-solid font-semibold rounded-md cursor-pointer">

                    <DeleteForeverIcon className="mr-1 mb-1" />
                    Delete Study
                </div>
            </div>
        );
    }
}


export class AdminStudyPage extends SimpleActiveStudyScreen {
    constructor(props) {
        super(props, false);
    }

    renderWithStudy(study) {
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

                    <AdminStudy study={study} />
                </div>
            </div>
        );
    }
}
