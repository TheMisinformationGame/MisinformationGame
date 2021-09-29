import "../App.css"
import {SimpleActiveStudyScreen} from "./ActiveStudyScreen";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export class GameDebrief extends SimpleActiveStudyScreen {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            hidden: true,
            completionCodeText: "****"
        }
    }
    renderWithStudy(study) {
        return (
            <div className="m-1 bg-white p-10 relative">
                <p className="leading-5 mb-4" dangerouslySetInnerHTML={{__html: study.debrief}} />
                <input type="checkbox" class="w-6 h-6 checked:bg-blue-600 checked:border-transparent" 
                       onClick={e => {
                           let toggle = this.state.hidden
                           this.setState({...this.state, 
                            completionCodeText: toggle ? "COMPLETION CODE :)" : "****", // TODO get completion code from other thing
                            hidden: !toggle
                            })
                
                       }}/>

                <br/>
                <div className="border border-black rounded-md
                                p-2 w-1/2 mt-4 
                                text-center font-mono tracking-widest
                                inline-block">
                    
                    {/* <p className="leading-5"></p> */}
                    <p className="leading-5" dangerouslySetInnerHTML={{__html: this.state.completionCodeText}} />
                </div>
                <button className="ml-4 p-2 rounded-lg active:bg-gray-200
                            
                                   hover:visible"
                        onClick={() => {navigator.clipboard.writeText(this.state.completionCodeText)}}
                        onMous
                >
                    <ContentCopyIcon /> 
                    {/* TODO include a tooltip when copy button is pressed */}
                </button>
            </div>
        );
    }
}
