import React, {Component} from 'react';
import {Link, Redirect} from "react-router-dom";
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
import {deleteStudy} from "../database/deleteFromDB";
import {downloadResults} from "../model/resultsExcelWriter";
import {createDateFromUnixEpochTimeSeconds} from "../utils/time";
import {auth} from "../database/firebase";
import {setDefaultPageTitle} from "../index";


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
            deletingStudy: false,

            progressTitle: null,
            progress: null,

            showStudyUpdate: false
        };
        this.state = this.defaultState;
    }

    hideConfirmation() {
        this.setStateIfMounted({...this.defaultState});
    }

    hideProgress() {
        if (this.state.deletingStudy) {
            this.setStateIfMounted({
                ...this.defaultState,
                progressTitle: "Study Deletion Cancelled",
                progress: Status.success("The deletion of this study has been cancelled.")
            });
        } else {
            this.setStateIfMounted({...this.defaultState});
        }
    }

    hideStudyUpdate() {
        this.setStateIfMounted({...this.defaultState});
    }

    showError(errorTitle, errorMessage) {
        this.setState({
            ...this.defaultState,
            progressTitle: errorTitle,
            progress: Status.error(errorMessage)
        });
    }

    downloadResults(study) {
        this.setState({
            ...this.defaultState,
            progressTitle: "Downloading results...",
            progress: Status.progress("The results of this study are downloading...")
        });
        setTimeout(() => {
            downloadResults(study).then(() => {
                // Successfully downloaded!
                this.setStateIfMounted({
                    ...this.defaultState,
                    progressTitle: "Results downloaded",
                    progress: Status.success([
                        "Results downloaded!",
                        <p className="mt-4 text-lg">
                            There should be a dialog open where you can select where
                            you wish to save the results spreadsheet.
                        </p>
                    ])
                });
            }).catch((error) => {
                // There was an error downloading the results...
                console.error(error);
                this.setStateIfMounted({
                    ...this.defaultState,
                    progressTitle: "Error downloading results",
                    progress: Status.error([
                        <b>There was an error:</b>,
                        error.message
                    ])
                });
            });
        }, 50);
    }

    updateStudy(study) {
        if (study.enabled) {
            this.showError(
                "Cannot Update Study", [
                    <b>Enabled studies cannot be updated.</b>,
                    <span className="block mt-2 text-lg">
                        Updating a study while people are playing
                        through the game may break their game.
                    </span>,
                    <span className="block mt-2 text-2xl">
                        Disable the study to update it.
                    </span>,
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
        this.setState({
            ...this.defaultState,
            deletingStudy: true,
            progressTitle: "Deleting Study...",
            progress: Status.progress("The study and its results are being deleted...")
        });

        // We give users 2 seconds to cancel the deletion by closing the dialog.
        setTimeout(() => {
            // The user cancelled.
            if (!this.state.deletingStudy)
                return;

            deleteStudy(study).then((study) => {
                getDataManager().clearCachedStudies();
                this.setStateIfMounted({
                    ...this.defaultState,
                    progressTitle: "Study Deleted",
                    progress: Status.success("Success. You will be redirected shortly.")
                });
                setTimeout(() => {
                    this.props.history.push("/admin");
                }, 500);
            }).catch((error) => {
                console.error(error);
                this.setStateIfMounted({
                    ...this.defaultState,
                    progressTitle: "Error Deleting Study",
                    progress: Status.error([
                        <b>There was an error deleting the study:</b>,
                        <span>{error.message}</span>
                    ])
                });
            });
        }, 2000);
    }

    render() {
        if (!auth.currentUser)
            return (<Redirect to="/sign-in" />);

        const study = this.props.study;
        const modifiedTime = createDateFromUnixEpochTimeSeconds(study.lastModifiedTime);

        const isBroken = isOfType(study, BrokenStudy);
        let target = null;
        if (!isBroken) {
            target = "/study/" + study.id;
        }

        return (
            <div className="box-border w-full pt-6 px-10">
                {/* Name of the study. */}
                <h1 className="block font-semibold text-4xl mb-6">
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
                            {window.location.host + target}
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
                    {/* Disable Study Button.js. */}
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
                            <p>
                               <b>Warning:&nbsp;</b>
                                The games of anyone who is currently participating in this study will
                                be lost. This will happen due to their access to the game being suddenly
                                revoked while they are playing.
                            </p>
                        </ConfirmationDialog>
                    </>}

                    {/* Enable Study Button.js. */}
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

                {/* Download Results Button.js. */}
                <AdminStudyActionButton className="bg-purple-400 hover:bg-purple-500"
                                        onClick={() => this.downloadResults(study)}>

                <FileDownloadIcon className="mr-1" />
                    Download Results
                </AdminStudyActionButton>

                {/* Update Study Button.js. */}
                <AdminStudyActionButton className="bg-blue-400 hover:bg-blue-500"
                                        onClick={() => this.updateStudy(study)}>

                <UploadIcon className="mr-1" />
                    Update Study
                </AdminStudyActionButton>

                {/* Delete Study Button.js. */}
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
        setDefaultPageTitle();
    }

    renderWithStudy(study) {
        return (
            <div className="min-h-screen w-full bg-gray-100" >
                {/* The navigation bar. */}
                <div className="flex items-stretch justify-between w-full bg-white shadow">
                    <Link to="/" className="font-bold text-xl p-3">
                        The Misinformation Game
                    </Link>
                </div>

                {/* The study information itself */}
                <div className="relative mt-3 w-full md:max-w-2xl mx-auto
                                rounded-xl border bg-white shadow-xl border-gray-400" >

                    <AdminStudy study={study} history={this.props.history} />

                    {/* Close button in top-right. */}
                    <Link to="/admin" className="absolute right-2 top-3 cursor-pointer">
                        <CloseIcon className="text-gray-600 hover:text-gray-800" fontSize="large"/>
                    </Link>
                </div>

                {/* A margin on the div above doesn't make the height of the enclosing div increase,
                    but we can just fake it with a div with a height of the margin we want. */}
                <div className="h-3" />
            </div>
        );
    }
}
