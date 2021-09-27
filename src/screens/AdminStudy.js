import React from 'react';
import {Link} from "react-router-dom";
import '../App.css'
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import {ActiveStudyScreen} from "./ActiveStudyScreen";

class StudyPage extends ActiveStudyScreen {
    componentDidMount() {
        super.componentDidMount();
        console.log(this.props.match.params.studyID);
    };
    

    render() {
        return(Study())
    }
};
{/**The function below I should put into the class in some day after the midterm */}


function Study() {
    return (
    <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 bg-opacity-">
        {/**mx-auto means put the container in the middle */}
    <div className="container min-h-screen w-3/5 mx-auto bg-blue-50 pb-10 border-black border-l-2 border-r-2 border-solid border-opacity-50" >
        {/*The navigation bar */}
        <table className="h-10 max-h-20 min-h-10 border-collapse border-black border-t-2 border-b-2 border-solid pt-5 pb-5 pl-3 w-full bg-gray-100 border-opacity-75">
        <tr>
            <td className="w-9/10">
                <h2 className="font-black text-2xl pl-5">The Misinformation Game</h2>
            </td>
        
            {/*Gotta add an icon here and the link to the admin page*/}
            
            <Link to={"/admin" }>
                
                <div className="bg-gray-200 hover:bg-gray-300 float-right min-w-40 text-black text-center border-black border-opacity-75 border-l-2 border-solid pt-3 pb-3 pl-2 font-semibold cursor-pointer select-none">
                        Back to Dashboard
                        <CloseIcon className="mb-1" />
                </div>
            </Link>
        </tr>
        </table>
    
    <div className="box-border h-5/6 w-full pt-10 px-10 text-black">
        {/**This part should fetch data from database, will change it later */}
        <h1 className="font-semibold text-4xl">First Study</h1>
        <br/>
        <p><b>Author: </b>Assoc/Prof Ullrich Echer</p>
        <p><b>Description: </b>This is a sample Description of one study. <br/>
        Should fetch data from the database soon. <br/>
        As a result, the studies' pages will be different which is written by the researcher.<br/></p>
        <p><b>URL: </b><a href="https://google.com" className="text-blue-600 underline">https://google.com</a></p>
        <br/>
        <h2 className="font-semibold text-2xl">Participants</h2>
        <p>There have been 73 participants in this study</p>
        <br/>
    
        <div className="bg-blue-400 hover:bg-blue-500 w-1/5 min-w-50 text-white text-center border-black border border-opacity-50 pt-3 pb-3 border-solid font-semibold rounded-md cursor-pointer select-none"
                         onClick="">
                        {/**This onclick should download the results */}
                        <FileDownloadIcon className="mr-1" />
                        Download results
        </div>
        
    </div>
    </div>
    
    </div>
    
    );
}

export default StudyPage;
