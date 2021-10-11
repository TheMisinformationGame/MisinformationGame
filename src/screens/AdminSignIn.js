import {MountAwareComponent} from "../components/MountAwareComponent";
import {auth, authProvider} from "../database/firebase";
import StatusLabel, {Status} from "../components/StatusLabel";
import {Redirect} from "react-router-dom";
import {Button} from "../components/Button";


export class AdminSignIn extends MountAwareComponent {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            signingIn: false,
            signedIn: false,
            status: null
        };
    };

    signIn() {
        this.setStateIfMounted({
            signingIn: true,
            signedIn: false,
            status: Status.progress("Opening a popup for you to sign in...")
        });

        auth.signInWithPopup(authProvider).then(result => {
            this.setStateIfMounted({
                signingIn: false,
                signedIn: true,
                status: Status.success("Successfully signed in.")
            });
        }).catch(error => {
            this.setStateIfMounted({
                signingIn: false,
                signedIn: false,
                status: Status.error([
                    <b>You could not be signed in:</b>,
                    error.message
                ])
            });
        });
    }

    render() {
        if (this.state.signedIn)
            return (<Redirect to="/admin" />);

        return (
            <div className="w-full bg-gray-100" style={{minHeight: "100vh"}}>
                <div className="w-full max-w-md bg-white rounded-xl shadow-xl
                                border border-gray-400 grid p-4
                                fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

                    <h2 className="font-medium text-xl">
                        The Misinformation Game Sign-In
                    </h2>
                    <hr className="mt-1 mb-4" />

                    <StatusLabel status={this.state.status}/>

                    {!this.state.signingIn &&
                        <Button onClick={() => this.signIn()} enabled={true}
                                className={this.state.status ? "mt-4" : ""}>

                            Sign In with Google
                        </Button>}
                </div>
            </div>
        )
    }
}
