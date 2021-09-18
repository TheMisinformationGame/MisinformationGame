import React from 'react';
import ReactDOM from 'react-dom';
import '../App.css';
import { getDataManager } from '../model/manager';
import { db, storage } from '../utils/initFirestore';
import { getStudiesIDs } from "../utils/getFromDB"

class AdminPage extends React.Component{
    
    componentDidMount() {
        const STUDIES_LIST = getStudiesIDs(db);
    };
    
    render() {
        return(Admin())
    }
};

function Admin() {
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
        
            {/*Gotta add an icon here and the link to the upload page*/}
            <a href="https://google.com">
                <button className="h-full bg-blue-400 w-1/10 float-right text-white text-center border-black border-l-2 border-solid">Upload Study</button>
            </a>
        </tr>
        </table>
    
    <div className="box-border h-5/6 w-full pt-10 px-20">
        <div className="grid grid-cols-2 gap-7">
            <div className="rounded-xl border-2 border-gray-400 p-5">
                <a href="https://google.com" className="text-blue-600 text-lg font-bold">First Study</a>
                <p><b>Author: </b>Assoc/Prof<br/></p>
                <p><b>Participants: </b>98<br/></p>
            </div>

            <div className="rounded-xl border-2 border-gray-400 p-5">
                <a href="https://google.com" className="text-blue-600 text-lg font-bold">Second Study</a>
                <p><b>Author: </b>Ben/Prof<br/></p>
                <p><b>Participants: </b>56<br/></p>
            </div>

            <div className="rounded-xl border-2 border-gray-400 p-5">
                <a href="https://google.com" className="text-blue-600 text-lg font-bold">Third Study</a>
                <p><b>Author: </b>Chist/Prof<br/></p>
                <p><b>Participants: </b>78<br/></p>
            </div>

            <div className="rounded-xl border-2 border-gray-400 p-5">
                <a href="https://google.com" className="text-blue-600 text-lg font-bold">Forth Study</a>
                <p><b>Author: </b>Danny/Prof<br/></p>
                <p><b>Participants: </b>98<br/></p>
            </div>

            <div className="rounded-xl border-2 border-gray-400 p-5">
                <a href="https://google.com" className="text-blue-600 text-lg font-bold">Fifth Study</a>
                <p><b>Author: </b>Emma/Prof<br/></p>
                <p><b>Participants: </b>58<br/></p>
            </div>
            
        </div>
    </div>
    
    </div>
    </div>
    );
}

export default AdminPage;

