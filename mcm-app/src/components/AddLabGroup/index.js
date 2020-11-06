import { auth } from "firebase";
import React from "react";
import fs from "fs";
// import XLSX from "xlsx";
import { withFirebase } from "../Firebase";
import { withAuthorization } from "../Session";
import { compose } from "recompose";
import axios from "axios";
import * as ROUTES from "../../constants/routes";

const INITIAL_STATE = {
  workbook: null,
  sheets: [],
};

class AddLabGroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {}

  getFile = (event) => {
    this.setState({ workbook: event.target.files[0] });
  };

  onSubmit = (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("file", this.state.workbook);
    axios.post("/reader", data, {}).then((res) => {
      console.log(res.data);
      // Main array to check for dups
      let tracker = [];
      let importData = {};
      for (const [k, v] of Object.entries(res.data)) {
        let group = [];
        for (const [k1, v1] of Object.entries(v)) {
          if (k1 >= "B" && k1 < "C") {
            // Only process the student data if the type of data in that B cell is of type number
            // If the type is number, then it refers to a student ID.
            if (v1.t == "n") {
              let row = k1.substring(1);
              const student = {
                id: v1.w,
                name: v[`C${row}`].w,
              };
              // Look out for duplicate student entries (Lectures + Lab)
              if (!tracker.includes(student.id)) {
                group.push(student);
                tracker.push(student.id);
              }
              // console.log(`${k1}: ${v1.w}, C${row}: ${v[`C${row}`].w}`);
            }
          }
        }
        console.log(group);
        importData[k] = group;
      }
      console.log("Import Data:", importData);
    });
  };

  render() {
    return (
      <div>
        <section id="main-content">
          <section className="wrapper"></section>
          <form
            onSubmit={this.onSubmit}
            className="form-horizontal style-form"
            encType="multipart/form-data"
          >
            <div className="form-group">
              <label className="col-sm-2 col-sm-2 control-label">
                Import file
              </label>
              <div className="col-sm-10">
                <input
                  name="excelFile"
                  type="file"
                  onChange={this.getFile}
                  placeholder="e.g. Assessment 1 or Distinction Task 2"
                  className="form-control"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-theme"
              onSubmit={this.onSubmit}
            >
              Save
            </button>
          </form>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => authUser && authUser.role == "Tutor";

export default compose(withAuthorization(condition))(AddLabGroupPage);
