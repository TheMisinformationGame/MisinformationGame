import {Component} from 'react';
import '../App.css';
import {getDataManager} from "../model/manager";
import {Link, Redirect} from "react-router-dom";
import StudyUpload from "../components/StudyUpload";
import {postStudy, uploadImageToStorage} from "../utils/postToDB";
import {ErrorLabel, ProgressLabel} from "../components/StatusLabel";
import UploadIcon from '@mui/icons-material/Upload';
import {isOfType} from "../utils/types";


class StudySummary extends Component {
    render() {
        const study = this.props.study;
        return (
            <div className="rounded-xl border-2 border-gray-400 p-3 bg-white shadow">
                
                <Link to={`/admin/${study.id}`}
                      className="text-blue-600 text-lg font-bold hover:text-blue-800 hover:underline">
                    {study.name}
                </Link>
                
                <p dangerouslySetInnerHTML={{__html: study.description}} />
            </div>
        );
    }
}

class AdminPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            studies: null,
            showUpload: false
        };
        this.hideStudyUploadCallback = (event) => {
            if (event.keyCode === 27) { // The escape key.
                this.hideStudyUpload();
            }
        };
    }

    componentDidMount() {
        getDataManager().getAllStudies().then((studies) => {
            this.setState({
                studies: studies,
                showUpload: this.state.showUpload
            });
        });
        document.addEventListener("keydown", this.hideStudyUploadCallback);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.hideStudyUploadCallback);
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

    uploadStudy(study) {
        console.log(study);

        //set a unique ID
        let guid = function () {
            return (Date.now().toString()); //use date and time of upload to get uniqueID
        };
        var studyID = guid();

        //get each post and their id and upload individually
        for (let i = 0; i < study.posts.length; i++) {
            const post = study.posts[i];
            if (!isOfType(post.content, "string")) {
                uploadImageToStorage(studyID, post.id, post.content);
            }
        }

        //get each avatar image and upload to storage for use
        for (let i = 0; i < study.sources.length; i++) {
            const source = study.sources[i];
            uploadImageToStorage(studyID, source.id, source.avatar);
        }
        postStudy(study.toJSON(), studyID);

        this.hideStudyUpload();
        getDataManager().readAllStudies().then((studies) => {
            this.setState({
                studies: studies,
                showUpload: this.state.showUpload
            });
        });
    }


    render() {
        const studies = this.state.studies || [];
        const readStudies = this.state.studies !== null;
        const noStudies = readStudies && studies.length === 0;

        const studyComponents = [];
        for (let index = 0; index < studies.length; ++index) {
            const study = studies[index];
            studyComponents.push((
                <StudySummary study={study} key={study.id} />
            ));
        }

        return (
            <div className="min-h-screen w-full bg-gray-300" >
                {/*The navigation bar. */}
                <div className="flex items-stretch justify-between w-full bg-white shadow">
                    <div className="font-bold text-xl p-3">
                        Misinformation Game
                    </div>
                    <div className="bg-blue-400 p-3 text-xl text-white font-medium
                                    hover:bg-blue-500 cursor-pointer select-none"
                         onClick={() => this.showStudyUpload()}>

                        <UploadIcon className="mr-1" />
                        Upload Study
                    </div>
                </div>

                {/* The studies. */}
                {readStudies && !noStudies &&
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10 m-10">
                        {studyComponents}
                    </div>}

                {/* Label saying that the studies are loading. */}
                {noStudies &&
                    <div className="m-10">
                        <ErrorLabel value={[
                            "No studies were found.",
                            "You can upload a study using the ",
                            <b>Upload Study</b>,
                            "button in the top-right of this page."
                        ]} />
                    </div>}

                {/* Label saying that the studies are loading. */}
                {!readStudies &&
                    <div className="m-10">
                        <ProgressLabel value="Loading studies..." />
                    </div>}

                {/* The study upload component. */}
                {this.state.showUpload &&
                    <StudyUpload onHide={() => this.hideStudyUpload()}
                                 onUpload={(study) => this.uploadStudy(study)} />}
            </div>
        );
    }
}

export default AdminPage;

