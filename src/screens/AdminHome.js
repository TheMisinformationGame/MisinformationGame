import {Component} from 'react';
import {getDataManager} from "../model/manager";
import {Link, Redirect} from "react-router-dom";
import StudyUpload from "../components/StudyUpload";
import {ErrorLabel, ProgressLabel} from "../components/StatusLabel";
import UploadIcon from '@mui/icons-material/Upload';
import {isOfType} from "../utils/types";
import {BrokenStudy} from "../model/study";
import {MountAwareComponent} from "../components/MountAwareComponent";
import {auth} from "../database/firebase";
import {setDefaultPageTitle} from "../index";


class StudySummary extends Component {
    render() {
        const study = this.props.study;
        // Handle broken studies specially.
        if (isOfType(study, BrokenStudy)) {
            return (
                <div className="rounded-xl border border-red-800 p-3 bg-white shadow">
                    <Link to={`/admin/${study.id}`}
                          className="text-red-500 text-lg font-bold hover:text-red-700 hover:underline">
                        {study.name}
                    </Link>

                    <p dangerouslySetInnerHTML={{__html: study.description}} />
                    <ErrorLabel className="mt-3" value={[<b>This study is broken:</b>, study.error]} />
                </div>
            );
        }

        return (
            <div className={"rounded-xl border p-3 bg-white shadow " +
                            (study.enabled ? "border-green-600" : "border-gray-400")}
                 style={{minHeight: "8rem"}}>

                {study.enabled &&
                    <span className="inline-block w-3.5 h-3.5 mr-2 bg-green-500 rounded-full"
                          title="Study is Enabled" />}

                <Link to={`/admin/${study.id}`}
                      className={"text-lg font-bold hover:underline " +
                                 (study.enabled ? "text-green-600 hover:text-green-700" :
                                                  "text-blue-600 hover:text-blue-700")}>

                    {study.name}
                </Link>
                
                <p dangerouslySetInnerHTML={{__html: study.description}} />
            </div>
        );
    }
}

class UploadStudyButton extends Component {
    render() {
        return (
            <div className="flex justify-around items-center rounded-xl
                            bg-gray-100 cursor-pointer hover:bg-blue-100 hover:shadow
                            border-2 border-dashed border-gray-800 overflow-hidden"
                 style={{minHeight: "8rem"}}
                 onClick={this.props.onClick}>

                <p className="text-xl font-semibold">
                    <UploadIcon className="mr-1" />
                    Upload New Study
                </p>
            </div>
        );
    }
}

class AdminPage extends MountAwareComponent {
    constructor(props) {
        super(props);
        setDefaultPageTitle();

        this.state = {
            isAdmin: null,
            studies: null,
            error: null,
            showUpload: false
        };
    }

    componentDidMount() {
        super.componentDidMount();

        const handleError = error => {
            this.setStateIfMounted({
                ...this.state,
                error: error.message
            });
        };

        const manager = getDataManager();
        manager.getIsAdmin().then(isAdmin => {
            this.setStateIfMounted({
                ...this.state,
                isAdmin: isAdmin
            });
            if (!isAdmin)
                return;

            manager.getAllStudies().then((studies) => {
                this.setStateIfMounted({
                    ...this.state,
                    studies: studies
                });
            }).catch(handleError);
        }).catch(handleError);
    }

    showStudyUpload() {
        this.setState({
            studies: this.state.studies,
            showUpload: true
        });
    }

    hideStudyUpload() {
        this.setState({
            studies: this.state.studies,
            showUpload: false
        });
    }

    afterStudyUpload(study) {
        // Refresh the list of all studies.
        const manager = getDataManager();
        manager.clearCachedStudies();
        manager.cacheStudy(study);

        // Move to the study page for the uploaded study.
        this.props.history.push("/admin/" + study.id);
    }

    render() {
        if (!auth.currentUser)
            return (<Redirect to="/sign-in" />);

        const isAdmin = this.state.isAdmin;
        const readIsAdmin = this.state.isAdmin !== null;
        const studies = this.state.studies || [];
        const readStudies = this.state.studies !== null;

        const studyComponents = [];
        for (let index = 0; index < studies.length; ++index) {
            const study = studies[index];
            studyComponents.push((
                <StudySummary study={study} key={study.id} />
            ));
        }

        return (
            <div className="min-h-screen w-full bg-gray-100" >
                {/* The navigation bar. */}
                <div className="flex items-center justify-between w-full bg-white shadow">
                    <Link to="/" className="font-bold text-xl p-3">
                        The Misinformation Game
                    </Link>

                    <div className="text-right px-2 py-1">
                        <span className="inline-block text-right text-lg">
                            {auth.currentUser.displayName}
                        </span>
                        <Link to="/sign-out" className="inline-block ml-2 text-base font-medium hover:text-blue-800
                                                        text-blue-600 cursor-pointer select-none">

                            (Sign Out)
                        </Link>
                        <span className="block text-right text-sm text-gray-600">
                            {auth.currentUser.uid}
                        </span>
                    </div>
                </div>

                <div className="w-full p-10">
                    {!isAdmin && readIsAdmin &&
                        <div>
                            <ErrorLabel value={[
                                <b>You are not registered as an admin.</b>,
                                <span>
                                    You will not able to access the admin dashboard until you are
                                    granted admin privileges.
                                </span>,
                                <span>
                                    Please contact your IT support to get them to configure your
                                    admin privileges. When you contact them, make sure you include
                                    your user ID, {auth.currentUser.uid}.
                                </span>
                            ]} />

                            <p className="pt-8">
                                Documentation on how to grant admin privileges can be found in the&nbsp;
                                <a href="https://themisinformationgame.github.io/Administrators"
                                   className="underline text-purple-600 hover:text-purple-900">

                                    Registering Administrators documentation
                                </a>.
                            </p>
                        </div>}

                    {/* The studies. */}
                    {isAdmin && readStudies &&
                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
                            {studyComponents}
                            <UploadStudyButton onClick={() => this.showStudyUpload()}/>
                        </div>}

                    {/* Label saying that the studies are loading. */}
                    {(!readIsAdmin || isAdmin) && !readStudies &&
                        <ProgressLabel value="Loading studies..." />}
                </div>

                {/* Allows new studies to be uploaded. */}
                <StudyUpload title="Upload Study"
                             visible={this.state.showUpload}
                             onHide={() => this.hideStudyUpload()}
                             onUpload={(study) => this.afterStudyUpload(study)} />
            </div>
        );
    }
}

export default AdminPage;
