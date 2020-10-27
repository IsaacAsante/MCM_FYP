import React from "react";
import { withFirebase } from "../Firebase";

import { withAuthorization } from "../Session";

class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { unitCode } = this.props.match.params;
    console.log(unitCode);

    this.props.firebase
      .getUnit(unitCode)
      .then((result) => {
        console.log("Result:", result);
      })
      .catch((err) => console.error(err));
  }

  render() {
    return (
      <div>
        <section id="main-content">
          <section className="wrapper">
            <h1>Dashboard component</h1>
          </section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(DashboardPage);
