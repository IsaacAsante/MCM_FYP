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
  allocated: false,
  allocateMessage: "Allocate Yourself",
  byPassAuthRule: false,
  docsCreated: false,
  docsCreationStarted: false,
  enrolmentStarted: false,
  error: null,
  finish: false,
  labsCreated: false,
  labCreationStarted: false,
  labData: null,
  semester: null,
  semesterError: null,
  sheets: [],
  studentsEnrolled: false,
  studentsToAdd: [],
  success: false,
  unit: null,
  unitError: null,
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
    const offeringID = this.props.match.params.offeringID;
    this.setState({ offeringID });

    // Recognize current user
    this.props.firebase.onAuthUserListener((authUser) => {
      this.setState({ authUser });
      // Determine if a Tutor is already allocated to the unit offering currently being viewed, or not.
      this.props.firebase.findAllocation(authUser.uid).then((res) => {
        if (res) {
          // console.log("Allocation:", res);
          if (res.unitOfferings.includes(offeringID)) {
            this.setState({ allocated: true, allocateMessage: "Allocated" });
          }
        }
      });
    });

    // Get the offering's unit
    this.props.firebase
      .getUnitOffering(offeringID)
      .then((result) => {
        if (result !== undefined) {
          // console.log("Result:", result);
          // console.log(result.unitID, result.semesterID);
          this.props.firebase
            .findUnit(result.unitID)
            .then((unit) => {
              // console.log("Unit loaded:", unit);
              this.setState({ unit });
              this.setState({ unitError: "" });
            })
            .catch((err) =>
              this.setState({
                unitError:
                  "There was an error fetching the unit data for this unit offering.",
              })
            );

          // Get the offering's semester
          this.props.firebase
            .findSemester(result.semesterID)
            .then((semester) => {
              // console.log("Semester loaded:", semester);
              this.setState({ semester });
              this.setState({ semesterError: "" });
            })
            .catch((err) => {
              this.setState({
                semesterError:
                  "There was an error fetching the semester data for this unit offering.",
              });
            });
          console.log(this.state);
        } else {
          this.setState({
            semesterError: "Invalid semester.",
            unitError: "Invalid unit.",
          });
        }
      })
      .catch((err) => console.error(err));
  }

  getFile = (event) => {
    // Only .xls files may be uploaded/imported.
    const splitName = event.target.files[0].name.split(".");
    const fileExt = splitName[splitName.length - 1];
    if (fileExt == "xls") {
      this.setState({ workbook: event.target.files[0] });
    } else {
      this.setState({ workbook: null });
    }
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
                      // console.log("Group:", group);
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

  backToUnitOffering = (event) => {
    event.preventDefault();
    this.props.history.push(
      `/unit-offerings/${this.props.match.params.offeringID}`
    );
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
            obj["id"] = labID;
            console.log("Lab to be added:", obj);
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
          return true;
        })
        .then(async (res) => {
          // Allocate unit offerings to every tutor
          await this.props.firebase
            .getTutorUID(obj.tutorEmail)
            .then(async (tutorUID) => {
              console.log("Tutor by email:", tutorUID);
              await this.props.firebase.findAllocation(tutorUID).then((res) => {
                if (res === undefined) {
                  const allocationData = {
                    tutorID: tutorUID,
                    unitOfferings: [this.props.match.params.offeringID],
                  };
                  // Create an allocation entry for the logged in Tutor
                  this.props.firebase
                    .addData("allocations", allocationData)
                    .then((res) => {
                      console.log(res);
                    });
                } else {
                  if (
                    !res.unitOfferings.includes(
                      this.props.match.params.offeringID
                    )
                  ) {
                    res.unitOfferings.push(this.props.match.params.offeringID);
                    // console.log("Allocation array:", res);
                    this.props.firebase.updateData("allocations", res.id, {
                      unitOfferings: res.unitOfferings,
                    });
                  }
                }
              });
            });
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
              // console.log("Enrolment data:", enrolmentToAdd);
              this.props.firebase
                .addData("enrolments", enrolmentToAdd)
                .then((res) => {
                  // console.log(res);
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
      allocated,
      allocateMessage,
      enrolmentStarted,
      docsCreationStarted,
      docsCreated,
      finish,
      labsCreated,
      labCreationStarted,
      semester,
      semesterError,
      studentsEnrolled,
      unit,
      unitError,
      workbook,
      error,
      success,
    } = this.state;

    const invalid =
      semesterError ==
        "There was an error fetching the unit data for this unit offering." ||
      semesterError == "Invalid semester." ||
      unitError ==
        "There was an error fetching the unit data for this unit offering." ||
      unitError == "Invalid unit.";
    return (
      <div>
        <section id="main-content">
          <section className="wrapper">
            {/* Avoid the unit offering's data from disappearing due to the authUser changing. */}
            {success ? (
              ""
            ) : (
              <div className="row">
                <div className="col-sm-12">
                  {/* If valid - Show headings */}
                  <h2>
                    {invalid ? " " : <i className="fa fa-angle-right"></i>}
                    {unit && ` ${unit.unitCode} ${unit.name}`}
                  </h2>
                  <h3>
                    {invalid ? " " : <i className="fa fa-angle-right"></i>}
                    {semester &&
                      ` Semester ${semester.number} - ${semester.year} (${semester.type})`}
                  </h3>
                </div>
              </div>
            )}

            {/* If invalid - Show the buttons */}
            {invalid ? (
              " "
            ) : (
              <div className="row mt">
                <div className="col-sm-12">
                  <span className="label label-danger">
                    {allocated && allocateMessage}
                  </span>
                </div>
              </div>
            )}

            <div className="mt">
              <h3>
                <i className="fa fa-angle-right"></i>{" "}
                {success ? (
                  <span>
                    Importing Lab Data <strong>(Do Not Quit!)</strong>
                  </span>
                ) : (
                  <span>Import Lab Data</span>
                )}
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
                      {!success && (
                        <div>
                          <button
                            type="submit"
                            className="btn btn-info"
                            onSubmit={this.onSubmit}
                            disabled={workbook == null}
                          >
                            Begin Process
                          </button>

                          <button
                            type="submit"
                            className="btn btn-danger ml-1"
                            onClick={this.backToUnitOffering}
                          >
                            Go Back
                          </button>
                        </div>
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
                              You will be logged out from the system and
                              required to log into your tutor account again.
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

              {!success ? (
                <div className="row mt">
                  <div className="col-sm-12">
                    <div className="alert alert-warning">
                      <h4>How to import Lab data</h4>
                      <hr />
                      <p className="mt">
                        <strong>
                          <strong>Step 1:</strong>{" "}
                        </strong>
                      </p>
                      <p>
                        <strong>
                          <a
                            target="_blank"
                            href="https://drive.google.com/file/d/1cgY1ZdYQJvvn6RQuFIW1ZYZKb8zvJNVN/view?usp=sharing"
                          >
                            Click to Download
                          </a>
                        </strong>{" "}
                        the Excel guide to follow along the steps below
                      </p>
                      <hr />
                      <p className="mt">
                        <strong>Step 2:</strong>
                      </p>
                      <p className="mt">
                        Edit the lab guide you have downloaded and create as
                        many sheets as you need. Every lab group in your unit
                        offering must have one sheet in the Excel file. The
                        format for your lab sheets should be as follow: LAX-XX,
                        where the first X indicates the semester number, and the
                        following two X’s denote the lab group number. To create
                        a lab group for Group 1 of a Lab in Semester 1, the
                        sheet’s name would have to be: LA1-01. You may also
                        create a sheet for Lecture groups with a similar naming
                        format (e.g. LE1-01); however, lecture sheets are purely
                        optional and are not used by the system’s parser.
                      </p>
                      <hr />
                      <p className="mt">
                        <strong>Step 3:</strong>
                      </p>
                      <p className="mt">For every lab sheet you create:</p>
                      <p className="mt">
                        a) Insert the unit code of the lab group, followed by an
                        S (for Semester), and the semester number. E.g.
                        COS20007_S1.
                      </p>
                      <p className="mt">
                        b) Enter the unit’s name in full, in uppercase letters.
                        E.g., OBJECT ORIENTED PROGRAMMING.
                      </p>
                      <p className="mt">
                        c) Enter the time at which the lab takes place. The day
                        must be written in 3-letter abbreviations, the time must
                        be in 24h format, and the duration must be in minutes.
                      </p>
                      <p className="mt">
                        d) Enter the location of your office in Swinburne as a
                        tutor.
                      </p>
                      <p className="mt">
                        e) Enter the name of the staff serving as a tutor for
                        the lab group in question. It could be your name or any
                        other tutor’s name. However, the staff must have an
                        account in the MCM system first for the import process
                        to go through later on.
                      </p>
                      <p className="mt">
                        f) In the column for STUDENT_CODE, enter the student IDs
                        of all the students registered in the lab group in
                        question.
                      </p>
                      <p className="mt">
                        g) Enter the students’ full names, in upper case letters
                        in the next column called STUDENT_FULLNAME.
                      </p>
                      <p className="mt">
                        h) Repeat the steps above for any other lab sheets you
                        created.
                      </p>
                      <hr />
                      <p className="mt">
                        <strong>Step 4:</strong>
                      </p>
                      <p className="mt">
                        Upload your file on this page and follow the steps. You
                        should not quit any part of the process before it is
                        complete, and you log out.
                      </p>
                      <p className="mt">
                        During the import process, any student who does not have
                        an account in the system will have one automatically
                        created for them. Their account’s default password will
                        be their student ID reversed.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
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
