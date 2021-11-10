import {Component} from "react";
import {ErrorLabel} from "./StatusLabel";
import {CircularProgress} from "@material-ui/core";
import {isOfType} from "../utils/types";
import {StudyImage} from "../model/images";

/**
 * An image that may still be loading.
 */
export class PromiseImage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    load(imagePromise) {
        if (isOfType(imagePromise, StudyImage)) {
            this.setState({
                promise: imagePromise,
                image: imagePromise
            });
            return;
        }

        this.setState({
            promise: imagePromise,
            image: null
        });

        imagePromise.then((image) => {
            // Image has been changed.
            if (imagePromise !== this.state.promise)
                return;

            // Image has loaded!
            this.setState({
                promise: imagePromise,
                image: image
            });
        }).catch((err) => {
            this.setState({
                promise: imagePromise,
                image: null,
                error: err.message
            });
        });
    }

    render() {
        const promise = this.props.image;
        if (this.state.error && this.state.promise === promise)
            return (<ErrorLabel value={this.state.error} />);

        const image = (isOfType(promise, StudyImage) ? promise : this.state.image);
        if (promise !== this.state.promise) {
            setTimeout(() => {
                this.load(promise);
            });
        }
        if (!promise)
            return null;

        if (!image) {
            // Image is still loading.
            return (<span className={"w-full flex justify-center " + this.props.className}>
                <CircularProgress size={this.props.loadingSpinner === "small" ? 32 : 48} />
            </span>);
        }

        return (
            <img src={image.createImageSrc()}
                 className={(this.props.imageClassName || "") + " " + (this.props.className || "")}
                 style={this.props.style}
                 alt="" />
        );
    }
}
