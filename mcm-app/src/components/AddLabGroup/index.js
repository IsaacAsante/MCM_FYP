import { auth } from "firebase";
import React from "react";
import fs from "fs";
// import XLSX from "xlsx";
import { withFirebase } from "../Firebase";
import { withAuthorization } from "../Session";
import { compose } from "recompose";

import * as ROUTES from "../../constants/routes";

const INITIAL_STATE = {
  workbook: null,
};

class AddLabGroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    // const offeringID = this.props.match.params.offeringID;
    // this.setState({ offeringID });
    // console.log(offeringID);
    // const workbook = XLSX.readFile("./COS20007_S1-classlist.xls");
    // console.log(workbook);
  }

  render() {
    return (
      <div>
        <section id="main-content">
          <section className="wrapper"></section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => authUser && authUser.role == "Tutor";

export default compose(withAuthorization(condition))(AddLabGroupPage);
