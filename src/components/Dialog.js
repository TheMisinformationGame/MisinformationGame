import CloseIcon from '@mui/icons-material/Close';
import {MountAwareComponent} from "./MountAwareComponent";

/**
 * Used for dialogs that should pop up over the other content on the page.
 */
export class Dialog extends MountAwareComponent {
    constructor(props) {
        super(props);
        this.hideCallback = (event) => {
            const escapeKey = 27;
            if (this.props.visible && event.keyCode === escapeKey) {
                this.props.onHide();
            }
        };
    }

    componentDidMount() {
        super.componentDidMount();
        document.addEventListener("keydown", this.hideCallback);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        document.removeEventListener("keydown", this.hideCallback);
    }

    render() {
        if (!this.props.visible)
            return null;

        const size = this.props.size;
        return (
            <div>
                {/* Gray-out content beneath dialog. */}
                <div className="fixed left-0 top-0 w-full h-full z-40 bg-black opacity-60"
                     onClick={this.props.onHide} />

                {/* Place dialog above grayed-out background. */}
                <div className="fixed left-0 top-0 w-full h-full overflow-y-scroll z-50
                                flex flex-row justify-center items-start"
                     onClick={this.props.onHide}>

                    {/* The dialog itself. */}
                    <div className="relative flex flex-col m-8 px-4 py-4 shadow
                                    w-full max-w-xl rounded-md bg-white w-xl"
                         onClick={(event) => event.stopPropagation()}>

                        {/* Title in top-left. */}
                        <h2 className={"absolute left-6 top-4 font-medium " +
                                       (size === "small" ? "text-2xl" : "text-4xl")}>

                            {this.props.title}
                        </h2>

                        {/* Close button in top-right. */}
                        <CloseIcon className={"absolute right-2 cursor-pointer " +
                                              "text-gray-600 hover:text-gray-800 " +
                                              (size === "small" ? "top-3" : "top-4")}
                                   fontSize="large"
                                   onClick={this.props.onHide} />

                        {/* Reserve whitespace for title and close button. */}
                        <div className={size === "small" ? "h-10" : "h-12"} />
                        <hr/>

                        <div className="px-4">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
