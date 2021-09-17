import React from 'react';
import ReactDOM from 'react-dom';
import '../App.css'

class StudyPage extends React.Component{
    render() {
        return(Study())
    }
};

function Study() {
    return (
    <div style={{backgroundImage: 'url(https://www.toptal.com/designers/subtlepatterns/patterns/papyrus.png)'}}>
        {/**mx-auto means put the container in the middle */}
    <div className="container min-h-screen w-3/5 mx-auto bg-blue-300 bg-opacity-10 pb-10" >
        {/*The navigation bar */}
        <table className="h-10 max-h-20 min-h-10 border-collapse border-black border-2 border-solid pt-3 pb-3 pl-3 w-full bg-gray-100">
        <tr>
            <td className="w-9/10">
                <h2 className="font-black text-xl">The Misinformation Game</h2>
            </td>
        
            {/*Gotta add an icon here and the link to the admin page*/}
            <a href="https://google.com">
                <button className="h-full bg-gray-100 w-1/10 float-right text-black font-medium text-center border-black border-l-2 border-solid">Back to Dashboard</button>
            </a>
        </tr>
        </table>
    
    <div className="box-border h-5/6 w-full pt-10 px-10 text-black">
        <h1 className="font-semibold text-4xl">First Study</h1>
        <br/>
        <p><b>Author: </b>Assoc/Prof Ullrich Echer</p>
        <p><b>Description: </b>This is a sample Descrription of one study. hasdjfhs akdhflhsad fhsadjk 
        hfjksdhf jkhsdfjkhsdhf sdffj ksdhfjks hdfjhd sjhfjksdhfjk shdfjk</p>
        <p><b>URL: </b><a href="https://google.com" className="text-blue-600 underline">https://google.com</a></p>
        <br/>
        <h2 className="font-semibold text-2xl">Participants</h2>
        <p>There have been 73 participants in this study</p>
        <br/>
        <a href="https://google.com">
            <button className="bg-blue-400 w-1/10 text-white text-center border-black border border-opacity-50 pl-5 pr-5 pt-3 pb-3 border-solid font-semibold rounded-md">Download Results</button>
        </a>
    </div>
    </div>
    
    </div>
    
    );
}

ReactDOM.render(<StudyPage/>, document.getElementById('root'));
export default StudyPage;
