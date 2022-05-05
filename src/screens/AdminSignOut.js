import {MountAwareComponent} from "../components/MountAwareComponent";
import {auth} from "../database/firebase";
import StatusLabel, {Status} from "../components/StatusLabel";
import {Button, LinkButton} from "../components/Button";
import {setDefaultPageTitle} from "../index";


export class AdminSignOut extends MountAwareComponent {
    constructor(props) {
        super(props);
        setDefaultPageTitle();

        this.state = {
            ...this.state,
            signingOut: false,
            signedOut: false,
            status: null
        };
    };

    signOut() {
        this.setStateIfMounted({
            signingOut: true,
            signedOut: false,
            status: Status.progress("Signing you out...")
        });

        auth.signOut().then(() => {
            this.setStateIfMounted({
                signingOut: false,
                signedOut: true,
                status: Status.success("Successfully signed out.")
            });
        }).catch(error => {
            this.setStateIfMounted({
                signingOut: false,
                signedOut: false,
                status: Status.error([
                    <b>You could not be signed out:</b>,
                    error.message
                ])
            });
        });
    }

    componentDidMount() {
        super.componentDidMount();
        this.signOut();
    }

    render() {
        return (
            <div className="w-full bg-gray-100" style={{minHeight: "100vh"}}>
                <div className="w-full max-w-md bg-white rounded-xl shadow-xl
                                border border-gray-400 grid p-4
                                fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

                    <h2 className="font-medium text-xl">
                        The Misinformation Game Sign-Out
                    </h2>
                    <hr className="mt-1 mb-4" />

                    <StatusLabel status={this.state.status} />

                    {!this.state.signingOut && !this.state.signedOut &&
                        <Button onClick={() => this.signOut()} enabled={true}
                                className={this.state.status ? "mt-4" : ""}>

                            {this.state.status ? "Try Again" : "Sign Out"}
                        </Button>}

                    {this.state.signedOut &&
                        <LinkButton to="/" enabled={true} className="mt-4">
                            Back to Home
                        </LinkButton>}
                </div>
            </div>
        )
    }
}
