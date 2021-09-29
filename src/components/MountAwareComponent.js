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

    setStateIfMounted(state) {
        if (!this.mounted)
            return;
        super.setState(state);
    }
}
