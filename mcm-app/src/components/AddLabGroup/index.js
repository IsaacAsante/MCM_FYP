import { auth } from "firebase";
import React from "react";
import fs from "fs";
// import XLSX from "xlsx";
import { withFirebase } from "../Firebase";
import { withAuthentication, withAuthorization } from "../Session";
import { compose } from "recompose";
import axios from "axios";
import * as ROUTES from "../../constants/routes";

const INITIAL_STATE = {
  accountsCreated: false,
  accountCreationStarted: false,
  byPassAuthRule: false,
  docsCreated: false,
  docsCreationStarted: false,
  enrolmentStarted: false,
  error: null,
  finish: false,
  labsCreated: false,
  labCreationStarted: false,
  labData: null,
  sheets: [],
  studentsEnrolled: false,
  studentsToAdd: [],
  success: false,
  dbStudentObjects: [],
  numOfStudents: 0,
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

  onSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("file", this.state.workbook);
    await axios
      .post("/reader", data, {})
      .then(async (res) => {
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
          await this.props.firebase
            .findTutor(tutorFirstName, tutorLastName)
            .then((res) => {
              // console.log("FindTutor():", res);
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
                      console.log("Group:", group);
                    }
                    // console.log(`${k1}: ${v1.w}, C${row}: ${v[`C${row}`].w}`);
                  }
                }
              }
              // console.log("Group:", group);
              studentsToAddArray.push(group);
              importData[k]["students"] = student_IDs; // Maintain the lab names from the imported file
            })
            .catch((error) => {
              console.log(error);
              this.setState({
                success: false,
              });
            });
        }
        // Error will be null if no error was thrown during the tutor verification process.
        if (!this.state.error) {
          return [importData, studentsToAddArray];
        }
      })
      .then((data) => {
        // If there is data to add to Firebase, continue.
        if (Array.isArray(data)) {
          if (Object.keys(data[0]).length > 0 && data[1].length > 0) {
            this.setState({ ...INITIAL_STATE });
            this.setState({
              success: true,
              labData: data[0],
              studentsToAdd: data[1],
            });
          }
        }
        return true;
      })
      .then(() => {
        for (let i = 0; i < this.state.studentsToAdd.length; i++) {
          const studentGroup = this.state.studentsToAdd[i];
          this.setState({
            numOfStudents: this.state.numOfStudents + studentGroup.length,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          success: false,
        });
      });
  };

  confirmImport = (event) => {
    event.preventDefault();
    this.createAccounts();
  };

  completeImport = (event) => {
    event.preventDefault();
    this.createAccountDocs();
  };

  createLabs = (event) => {
    event.preventDefault();
    this.addNewLab();
  };

  processEnrolments = (event) => {
    event.preventDefault();
    this.enrolStudents();
  };

  finish = (event) => {
    event.preventDefault();
    this.props.firebase.signOutUser();
  };

  appendAuthUID = async (student) => {
    // Use the reverse of a student's ID as their default account password
    const password = student.studentID.split("").reverse().join("");
    await this.props.firebase
      .createUser(student.email, password)
      .then((authUser) => {
        // console.log("AuthUser:", authUser.user.email, authUser.user.uid);
        let studentObj = { ...student };
        studentObj["id"] = authUser.user.uid;
        // console.log("Checking ID:", studentObj);
        const joined = this.state.dbStudentObjects.concat(studentObj);
        this.setState({ dbStudentObjects: joined });
        // console.log(this.state.dbStudentObjects);
      })
      .catch((error) => {
        console.log(error);
        this.setState({ error, byPassAuthRule: true });
      });
  };

  createAccounts = async () => {
    this.setState({ accountCreationStarted: true });
    if (this.state.studentsToAdd.length > 0) {
      for (let i = 0; i < this.state.studentsToAdd.length; i++) {
        const studentGroup = this.state.studentsToAdd[i];
        for (let j = 0; j < studentGroup.length; j++) {
          const student = studentGroup[j];
          await this.appendAuthUID(student); // This method creates the accounts
          // console.log(
          //   "NumOfStudents and dbStudentObjects:",
          //   this.state.numOfStudents,
          //   this.state.dbStudentObjects.length
          // );
          // Signal when the docs can be created
          // Rule 1: If all the student objects have been created (this.state.dbStudentObjects)
          // Rule 2: If the last element in the loop has been reached, and this.state.byPassAuthRule is TRUE because some student accounts were skipped.
          if (
            this.state.dbStudentObjects.length == this.state.numOfStudents ||
            (i == this.state.studentsToAdd.length - 1 &&
              j == this.state.studentsToAdd[i].length - 1 &&
              this.state.byPassAuthRule)
          ) {
            // console.log(
            //   "Objects ready:",
            //   this.state.studentsToAdd.length,
            //   this.state.dbStudentObjects.length
            // );
            this.setState({
              accountsCreated: true,
              error: false,
              success: true,
            });
          }
        }
      }
    }
  };

  createAccountDocs = async () => {
    this.setState({ docsCreationStarted: true });
    for (let i = 0; i < this.state.dbStudentObjects.length; i++) {
      const student = this.state.dbStudentObjects[i];
      // console.log("Student to add:", student);
      await this.props.firebase.setStudentBatch(student, student.id);
    }
    await this.props.firebase.commitBatch();
    this.setState({
      docsCreated: true,
      error: false,
      success: true,
    });
  };

  addNewLab = async () => {
    this.setState({ labCreationStarted: true });
    // console.log("Lab Data:", this.state.labData);
    for (const [name, obj] of Object.entries(this.state.labData)) {
      // console.log("Query for", name, obj);
      await this.props.firebase
        .findLab(this.props.match.params.offeringID, name)
        .then(async (res) => {
          // console.log("Lab found:", res);
          if (!res) {
            const labID =
              obj.name.split("-").join("") + this.props.match.params.offeringID;
            this.props.firebase.setLabBatch(
              this.props.match.params.offeringID,
              obj,
              labID
            );
          }
          await this.props.firebase.commitBatch();
          return true;
        })
        .then((res) => {
          this.setState({ labsCreated: true, error: false, success: true });
        })
        .catch((error) => {
          console.log(error);
          this.setState({ error });
        });
    }
  };

  enrolStudents = async () => {
    this.setState({ enrolmentStarted: true });
    console.log("Enrol students.");
    for (const [labName, labObj] of Object.entries(this.state.labData)) {
      const studentIDArray = labObj.students;
      const labID =
        labName.split("-").join("") + this.props.match.params.offeringID;
      for (let i = 0; i < studentIDArray.length; i++) {
        const studentID = studentIDArray[i];
        await this.props.firebase
          .findEnrolment(studentID)
          .then(async (enrolment) => {
            if (enrolment === undefined) {
              const enrolmentToAdd = {
                studentID: studentID,
                labGroups: [labID],
                unitOfferings: [this.props.match.params.offeringID],
              };
              console.log("Enrolment data:", enrolmentToAdd);
              this.props.firebase
                .addData("enrolments", enrolmentToAdd)
                .then((res) => {
                  console.log(res);
                })
                .catch((error) => {
                  console.log(error);
                  this.setState({ error });
                });
            } else {
              if (!enrolment.labGroups.includes(labID)) {
                enrolment.labGroups.push(labID);
                await this.props.firebase.updateData(
                  "enrolments",
                  enrolment.id,
                  { labGroups: enrolment.labGroups }
                );
              }
              if (
                !enrolment.unitOfferings.includes(
                  this.props.match.params.offeringID
                )
              ) {
                enrolment.unitOfferings.push(
                  this.props.match.params.offeringID
                );
                await this.props.firebase.updateData(
                  "enrolments",
                  enrolment.id,
                  { unitOfferings: enrolment.unitOfferings }
                );
              }
            }
          })
          .catch((error) => {
            console.log(error);
            this.setState({ error });
          });
      }
    }
    this.setState({ studentsEnrolled: true, finish: true, success: true });
  };

  render() {
    const {
      accountsCreated,
      accountCreationStarted,
      enrolmentStarted,
      docsCreationStarted,
      docsCreated,
      finish,
      labsCreated,
      labCreationStarted,
      studentsEnrolled,
      error,
      success,
    } = this.state;
    return (
      <div>
        <section id="main-content">
          <section className="wrapper">
            <div className="mt">
              <h3>
                <i className="fa fa-angle-right"></i> Import Lab Data
              </h3>
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-panel">
                    <form
                      onSubmit={this.onSubmit}
                      className="form-horizontal style-form mt"
                      encType="multipart/form-data"
                    >
                      <div className="form-group">
                        <label className="col-sm-2 col-sm-2 control-label">
                          File to import
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

                      {/* The Import button should only show before the start of the process. */}
                      {!accountCreationStarted && (
                        <button
                          type="submit"
                          className="btn btn-info"
                          onSubmit={this.onSubmit}
                        >
                          Begin Process
                        </button>
                      )}

                      {!success ? (
                        error ? (
                          <div className="alert alert-danger mt">
                            <span>{error}</span>
                          </div>
                        ) : (
                          ""
                        )
                      ) : (
                        <div>
                          <div className="alert alert-info mt">
                            <span>File parsed successfully.</span>
                          </div>
                          {/* Hide this button once accounts started getting created. */}
                          {accountCreationStarted ? (
                            <div className="alert alert-info mt">
                              <span>
                                Processing student accounts. Please wait...
                              </span>
                            </div>
                          ) : (
                            <button
                              className="btn btn-info"
                              onClick={this.confirmImport}
                            >
                              Register Students
                            </button>
                          )}
                        </div>
                      )}
                      {accountsCreated && success ? (
                        <div>
                          <div className="alert alert-warning mt">
                            <span>
                              Student accounts processed successfully. Please
                              click the button below to sync the data in the
                              system. <b>Do not skip this step!</b>
                            </span>
                          </div>
                          {docsCreationStarted ? (
                            <div className="alert alert-info mt">
                              <span>
                                Sync'ing student documents in the database.
                                Please wait...
                              </span>
                            </div>
                          ) : (
                            <button
                              className="btn btn-info"
                              onClick={this.completeImport}
                            >
                              Sync Student Data
                            </button>
                          )}
                        </div>
                      ) : (
                        " "
                      )}
                      {/* Lab creation */}
                      {docsCreated && success ? (
                        <div>
                          <div className="alert alert-warning mt">
                            <span>
                              Click on the button below to automatically create
                              lab entries for the labs found in the file. If
                              they already exist, they will be ignored.{" "}
                              <b>Do not skip this step!</b>
                            </span>
                          </div>
                          {labCreationStarted ? (
                            <div className="alert alert-info mt">
                              <span>
                                Processing lab entries. Please wait...
                              </span>
                            </div>
                          ) : (
                            <button
                              className="btn btn-info"
                              onClick={this.createLabs}
                            >
                              Create Lab Groups
                            </button>
                          )}
                        </div>
                      ) : (
                        " "
                      )}
                      {/* Student Enrolments */}
                      {labsCreated && success ? (
                        <div>
                          <div className="alert alert-warning mt">
                            <span>
                              Begin the automatic student enrolment process.
                              Students will be assigned to their relevant lab
                              groups after getting enrolled in this unit
                              offering. <b>Do not skip this step!</b>
                            </span>
                          </div>
                          {enrolmentStarted ? (
                            <div className="alert alert-info mt">
                              <span>Enrolling students. Please wait...</span>
                            </div>
                          ) : (
                            <button
                              className="btn btn-info"
                              onClick={this.processEnrolments}
                            >
                              Process Enrolments
                            </button>
                          )}
                        </div>
                      ) : (
                        " "
                      )}

                      {accountsCreated &&
                      success &&
                      docsCreationStarted &&
                      labsCreated &&
                      studentsEnrolled ? (
                        <div>
                          <div className="alert alert-info mt">
                            <span>
                              Click the button below to finalize the process.
                              You will logged out from the system and required
                              to log into your tutor account again.
                            </span>
                          </div>
                          <button
                            className="btn btn-danger"
                            onClick={this.finish}
                          >
                            Finish {`&`} Log Out
                          </button>
                        </div>
                      ) : (
                        ""
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => authUser;

export default compose(
  withAuthentication,
  withAuthorization(condition)
)(AddLabGroupPage);
