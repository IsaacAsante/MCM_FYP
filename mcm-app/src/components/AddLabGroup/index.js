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
  error: null,
  sheets: [],
  studentsToAdd: [],
  success: false,
  workbook: null,
};

const DAY = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

class AddLabGroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    console.log(this.props.match.params.offeringID);
  }

  getFile = (event) => {
    this.setState({ workbook: event.target.files[0] });
  };

  onSubmit = (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("file", this.state.workbook);
    axios
      .post("/reader", data, {})
      .then((res) => {
        // console.log(res.data);
        // Main array to check for dups
        let tracker = [];
        let importData = {};
        let studentsToAddArray = [];
        for (const [k, v] of Object.entries(res.data)) {
          let staff = v["C5"].w;
          const tutorName = staff.substring(7).split(" ");
          const tutorFirstName = tutorName.shift();
          const tutorLastName = tutorName.join(" ");
          // WARNING: Only Lab sheets must be read.
          if (k.substring(0, 2) !== "LA") continue;
          importData[k] = {};
          this.props.firebase
            .findTutor(tutorFirstName, tutorLastName)
            .then((res) => {
              if (!res) {
                this.setState({
                  error: `Operation aborted. The tutor ${tutorFirstName} ${tutorLastName} was not found in the database. Please make sure they have an account in the system first before importing this file.`,
                });
                throw false;
              }
              importData[k]["name"] = k;
              importData[k]["tutorEmail"] = res.email;
              return importData;
            })
            .then((importData) => {
              // Get Lab data
              let group = [];
              const lab_time_details = v["C3"].w.split(/[\s,]/);
              const lab_day = DAY[lab_time_details[0]];
              const lab_time = lab_time_details[2];
              importData[k]["time"] = lab_time;
              importData[k]["weekDay"] = lab_day;
              importData[k]["offeringID"] = this.props.match.params.offeringID;
              // console.log("Lab detail:", importData);
              let student_IDs = [];
              for (const [k1, v1] of Object.entries(v)) {
                if (k1 >= "B" && k1 < "C") {
                  // Only process the student data if the type of data in that B cell is of type number
                  // If the type is number, then it refers to a student ID.
                  if (v1.t == "n") {
                    let row = k1.substring(1);
                    const studentFullName = v[`C${row}`].w.split(" ");
                    const student = {
                      studentID: v1.w,
                      firstname: studentFullName.shift(),
                      lastname: studentFullName.join(" "),
                      role: "Student",
                      email: `${v1.w}@students.swinburne.edu.my`,
                      // reverse_password: v1.w.split("").reverse().join(""),
                    };
                    // Look out for duplicate student entries
                    if (!tracker.includes(student.studentID)) {
                      student_IDs.push(student.studentID);
                      group.push(student);
                      tracker.push(student.studentID);
                    }
                    // console.log(`${k1}: ${v1.w}, C${row}: ${v[`C${row}`].w}`);
                  }
                }
              }
              // console.log("Group:", group);
              studentsToAddArray.push(group);
              importData[k]["students"] = student_IDs; // Maintain the lab names from the imported file
            });
        }
        return [importData, studentsToAddArray];
      })
      .then((data) => {
        this.setState({ ...INITIAL_STATE });
        this.setState({
          success: true,
          labData: data[0],
          studentsToAdd: data[1],
        });
        return;
      })
      .then(() => {
        console.log(this.state);
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          success: false,
        });
      });
  };

  render() {
    const { error, success } = this.state;
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
            {!success ? (
              error ? (
                <div className="alert alert-danger mt">
                  <span>{error}</span>
                </div>
              ) : (
                ""
              )
            ) : (
              <div className="alert alert-success mt">
                <span>File read successfully.</span>
              </div>
            )}
          </form>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => authUser && authUser.role == "Tutor";

export default compose(withAuthorization(condition))(AddLabGroupPage);
