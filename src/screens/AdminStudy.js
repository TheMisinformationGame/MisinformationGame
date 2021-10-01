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
import {ErrorLabel, Status} from "../components/StatusLabel";
import {ConfirmationDialog} from "../components/ConfirmationDialog";
import {ProgressDialog} from "../components/ProgressDialog";
import {uploadStudyConfiguration} from "../database/postToDB";
import {MountAwareComponent} from "../components/MountAwareComponent";
import {getDataManager} from "../model/manager";
import StudyUpload from "../components/StudyUpload";


class AdminStudyActionButton extends Component {
    render() {
        return (
            <div className={"w-52 pt-3 pb-3 mb-4 " + (this.props.className || "") + " " +
                            "text-center select-none border-black border border-opacity-50 " +
                            "border-solid font-semibold rounded-md cursor-pointer "}
                 onClick={this.props.onClick}>

                {this.props.children}
            </div>
        );
    }
}

class AdminStudy extends MountAwareComponent {
    constructor(props) {
        super(props);
        this.defaultState = {
            confirmation: null,

            progressTitle: null,
            progress: null,

            showStudyUpdate: false
        };
        this.state = this.defaultState;
    }

    hideConfirmation() {
        this.setState({...this.state, confirmation: null});
    }

    hideProgress() {
        this.setState({...this.state, progressTitle: null});
    }

    hideStudyUpdate() {
        this.setState({...this.state, showStudyUpdate: false});
    }

    showError(errorTitle, errorMessage) {
        this.setState({...this.state, progressTitle: errorTitle, progress: Status.error(errorMessage)});
    }

    downloadResults(study) {
        // TODO
        console.log("Download Results Clicked");
    }

    updateStudy(study) {
        if (study.enabled) {
            this.showError(
                "Cannot Update Study", [
                    <b>Enabled studies cannot be updated.</b>,
                    <span className="block mt-2">Disable the study to update it.</span>
                ]
            );
            return;
        }

        this.setState({
            ...this.defaultState,
            showStudyUpdate: true
        });
    }

    afterStudyUpdate(study) {
        getDataManager().cacheStudy(study);
        this.hideStudyUpdate();
    }

    updateStudyEnabled(study, enabled, title, message, completeTitle) {
        this.setState({
            ...this.defaultState,
            progressTitle: title,
            progress: Status.progress(message)
        });
        setTimeout(() => {
            study.enabled = enabled;
            study.updateLastModifiedTime();
            uploadStudyConfiguration(study).then(() => {
                getDataManager().clearCachedStudies();
                this.setStateIfMounted({
                    ...this.defaultState,
                    progressTitle: completeTitle,
                    progress: Status.success("Success")
                });
            }).catch((error) => {
                this.setStateIfMounted({
                    ...this.defaultState,
                    progressTitle: completeTitle,
                    progress: Status.error([
                        <b>There was an error:</b>,
                        error.message
                    ])
                });
            });
        }, 50);
    }

    enableStudy(study) {
        this.setState({...this.defaultState, confirmation: "enable-study"});
    }

    disableStudy(study) {
        this.setState({...this.defaultState, confirmation: "disable-study"});
    }

    confirmEnableStudy(study) {
        this.updateStudyEnabled(study, true, "Enabling Study...", "Enabling the study...", "Enabled Study");
    }

    confirmDisableStudy(study) {
        this.updateStudyEnabled(study, false, "Disabling Study...", "Disabling the study...", "Disabled Study");
    }

    deleteStudy(study) {
        this.setState({...this.defaultState, confirmation: "delete-study"});
    }

    confirmDeleteStudy(study) {
        // TODO
        console.log("Confirm Delete Study");
        this.hideConfirmation();
    }

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
                <h1 className="block font-semibold text-4xl mb-4">
                    {study.enabled &&
                    <span className="inline-block w-4 h-4 mb-1 mr-2 bg-green-500 rounded-full"
                          title="Study is Enabled" />}

                    {study.name}
                </h1>

                {/* If not broken, the game URL for this study. */}
                {!isBroken && <>
                    <p className="mt-2">
                        <b>URL:&nbsp;</b>
                        <Link to={target}
                              className="text-blue-500 hover:text-blue-700 underline">
                            {window.location.host + "/game/" + study.id + "/id"}
                        </Link>
                    </p>
                    <p className="mt-2">
                        <b>Enabled:&nbsp;</b>
                        {study.enabled ? "Yes, the study is enabled." : "No, the study is disabled."}
                    </p>
                </>}

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

                {!isBroken && <>
                    {/* Disable Study Button. */}
                    {study.enabled && <>
                        <AdminStudyActionButton className="bg-yellow-300 hover:bg-yellow-400"
                                                onClick={() => this.disableStudy(study)}>

                            <BlockIcon className="mr-2 mb-0.5" />
                            Disable Study
                        </AdminStudyActionButton>

                        <ConfirmationDialog title="Disable the Study"
                                            actionName={<><BlockIcon className="mr-2 mb-0.5" />Disable Study</>}
                                            visible={this.state.confirmation === "disable-study"}
                                            onConfirm={() => this.confirmDisableStudy(study)}
                                            onCancel={() => this.hideConfirmation()}>

                            <p className="mb-2">
                                <b>Are you sure you wish to disable this study?</b>
                            </p>
                            <p className="mb-2">
                                Once disabled, no more users will be able to participate in the study.
                            </p>
                        </ConfirmationDialog>
                    </>}

                    {/* Enable Study Button. */}
                    {!study.enabled && <>
                        <AdminStudyActionButton className="bg-green-400 hover:bg-green-500"
                                                onClick={() => this.enableStudy(study)}>

                            <ControlPointIcon className="mr-2 mb-0.5" />
                            Enable Study
                        </AdminStudyActionButton>

                        <ConfirmationDialog title="Enable the Study"
                                            actionName={<><ControlPointIcon className="mr-2 mb-0.5" />Enable Study</>}
                                            visible={this.state.confirmation === "enable-study"}
                                            onConfirm={() => this.confirmEnableStudy(study)}
                                            onCancel={() => this.hideConfirmation()}>

                            <p className="mb-2">
                                <b>Are you sure you wish to enable this study?</b>
                            </p>
                            <p className="mb-2">
                                Once enabled, anyone with the URL to this study will be able
                                to access the game and participate in the study.
                            </p>
                        </ConfirmationDialog>
                    </>}
                </>}

                {/* Download Results Button. */}
                <AdminStudyActionButton className="bg-purple-400 hover:bg-purple-500"
                                        onClick={() => this.downloadResults(study)}>

                <FileDownloadIcon className="mr-1" />
                    Download Results
                </AdminStudyActionButton>

                {/* Update Study Button. */}
                <AdminStudyActionButton className="bg-blue-400 hover:bg-blue-500"
                                        onClick={() => this.updateStudy(study)}>

                <UploadIcon className="mr-1" />
                    Update Study
                </AdminStudyActionButton>

                {/* Delete Study Button. */}
                <AdminStudyActionButton className="bg-red-400 hover:bg-red-500"
                                        onClick={() => this.deleteStudy(study)}>

                    <DeleteForeverIcon className="mr-1 mb-1" />
                    Delete Study
                </AdminStudyActionButton>

                <ConfirmationDialog title="Delete the Study"
                                    actionName={<><DeleteForeverIcon className="mr-1 mb-1" />Delete Study</>}
                                    visible={this.state.confirmation === "delete-study"}
                                    onConfirm={() => this.confirmDeleteStudy(study)}
                                    onCancel={() => this.hideConfirmation()}>

                    <p className="mb-2">
                        <b>Are you sure you wish to delete this study?</b>
                    </p>
                    <p className="mb-2">
                        Once deleted, the study and its results cannot be recovered.
                    </p>
                </ConfirmationDialog>

                {/* Progress Dialog */}
                <ProgressDialog title={this.state.progressTitle}
                                visible={this.state.progressTitle !== null}
                                status={this.state.progress}
                                onHide={() => this.hideProgress()} />

                {/* Allows new studies to be uploaded. */}
                <StudyUpload title="Update Study"
                             previousStudy={study}
                             visible={this.state.showStudyUpdate}
                             onHide={() => this.hideStudyUpdate()}
                             onUpload={(study) => this.afterStudyUpdate(study)} />
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
                        <tbody><tr>
                            <td className="w-9/10">
                                <h2 className="font-black text-2xl pl-5">The Misinformation Game</h2>
                            </td>

                            <td className="p-0">
                                <Link to={"/admin" }>
                                    <div className="bg-gray-200 hover:bg-gray-300 float-right min-w-40 text-black
                                                text-center border-black border-opacity-75 border-l-2 border-solid
                                                pt-3 pb-3 pl-2 font-semibold cursor-pointer select-none">

                                        Back to Dashboard
                                        <CloseIcon className="mb-1" />
                                    </div>
                                </Link>
                            </td>
                        </tr></tbody>
                    </table>

                    <AdminStudy study={study} />
                </div>
            </div>
        );
    }
}
