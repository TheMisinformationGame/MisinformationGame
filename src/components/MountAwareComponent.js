import {Component} from "react";

export class MountAwareComponent extends Component {
    constructor(props) {
        super(props);
        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    setStateIfMounted(updater) {
        if (!this.mounted)
            return;
        super.setState(updater);
    }
}
