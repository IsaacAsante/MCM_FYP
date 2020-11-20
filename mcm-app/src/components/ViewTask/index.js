import React from "react";
import { withAuthorization } from "../Session";

import * as ROLES from "../../constants/roles";

const INITIAL_STATE = {
  allocated: false,
  allocateMessage: "Allocate Yourself",
  authUser: null,
  bookingslots: null,
  bookingSlotsFound: false,
  loadTask: false,
  offeringID: null,
  semester: null,
  semesterError: null,
  task: null,
  taskError: false,
  taskID: null,
  unit: null,
  unitError: null,
  userRole: null,
};

const DAYS = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

class TaskPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this.setState({ loadTask: true });
    const offeringID = this.props.match.params.offeringID;
    const taskID = this.props.match.params.taskID;
    this.setState({ offeringID, taskID });
    // console.log(taskID);

    console.log("Task ID:", taskID);
    if (taskID !== "add") {
      // Recognize current user
      this.props.firebase.onAuthUserListener((authUser) => {
        this.setState({ authUser });
        // Determine if a Tutor is already allocated to the unit offering currently being viewed, or not.
        this.props.firebase.findAllocation(authUser.uid).then((res) => {
          if (res) {
            //   console.log("Response to debug:", res);
            if (res.unitOfferings.includes(offeringID)) {
              this.setState({ allocated: true, allocateMessage: "Allocated" });
            }
          }
        });
        // Verify the privileges of the currently logged-in user
        if (authUser.email.search("students") == -1) {
          this.setState({ userRole: ROLES.TUTOR });
        } else {
          this.setState({ userRole: ROLES.STUDENT });
        }
      });

      // Get the offering's unit
      this.props.firebase
        .getUnitOffering(offeringID)
        .then(async (result) => {
          if (result !== undefined) {
            // console.log("Result:", result);
            // console.log(result.unitID, result.semesterID);

            // Get the unit offering's details
            await this.props.firebase
              .findUnit(result.unitID)
              .then((unit) => {
                //   console.log("Unit loaded:", unit);
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
            await this.props.firebase
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

            // Get the task's info
            await this.props.firebase
              .findTask(this.state.offeringID, this.state.taskID)
              .then(async (task) => {
                if (!task) {
                  this.setState({ taskError: true });
                  console.log("Task was not found");
                } else {
                  this.setState({ task });
                  console.log("Task found:", task);

                  // Load all booking slots available
                  await this.props.firebase
                    .getBookingSlots(this.state.offeringID, this.state.taskID)
                    .then((slots) => {
                      if (slots.length > 0) {
                        console.log("Booking slots on task page:", slots);
                        // Sort the booking slots by dates, then by time
                        slots.sort((a, b) => {
                          return (
                            a.date - b.date ||
                            a.startTime.localeCompare(b.startTime)
                          );
                        });

                        this.setState({
                          bookingSlotsFound: true,
                          bookingslots: slots,
                        });
                      } else {
                        console.log("The task does not have booking slots.");
                        this.setState({ bookingSlotsFound: false });
                      }
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                }
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
    } else {
      console.log("Will be false.");
      this.setState({ loadTask: false });
    }
  }

  addSlot = (event) => {
    event.preventDefault();
    this.props.history.push(
      `/unit-offerings/${this.state.offeringID}/tasks/${this.state.taskID}/add-booking-slots`
    );
  };

  backToOffering = (event) => {
    event.preventDefault();
    this.props.history.push(`/unit-offerings/${this.state.offeringID}`);
  };

  goToBookingSlot = (slotID) => {
    // event.preventDefault();
    this.props.history.push(
      `/unit-offerings/${this.state.offeringID}/tasks/${this.state.taskID}/booking-slots/${slotID}`
    );
  };

  convertDate = (dateValue) => {
    let date = new Date(dateValue * 1000); // Firestore will return the seconds instead of milliseconds
    return `${DAYS[date.getDay()]}, ${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
  };

  render() {
    const {
      allocated,
      allocateMessage,
      authUser,
      bookingslots,
      bookingSlotsFound,
      loadTask,
      semester,
      semesterError,
      task,
      taskError,
      unit,
      unitError,
      userRole,
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
        {loadTask ? (
          <section id="main-content">
            <section className="wrapper">
              <div className="row">
                <div className="col-sm-12">
                  {/* If valid - Show headings */}
                  <h2>
                    {invalid ? " " : <i className="fa fa-angle-right"></i>}
                    {unit && ` ${unit.unitCode} ${unit.name}`}
                  </h2>{" "}
                  <h3>
                    {invalid ? " " : <i className="fa fa-angle-right"></i>}
                    {semester &&
                      ` Semester ${semester.number} - ${semester.year} (${semester.type})`}
                  </h3>
                  {invalid ? (
                    ""
                  ) : (
                    <span className="label label-danger">
                      {allocated && allocateMessage}
                    </span>
                  )}
                  <hr />
                  <h4 className="taskname">
                    {invalid ? " " : <i className="fa fa-angle-right"></i>}
                    {task && ` Task: ${task.name}`}
                  </h4>
                  {/* If invalid - Show the error messages*/}
                  {invalid ? (
                    <h2>{invalid && "Invalid Unit Offering"}</h2>
                  ) : (
                    " "
                  )}
                  {invalid ? <hr /> : " "}
                  <h3 className="text-danger">{semesterError}</h3>
                  <h3 className="text-danger">{unitError}</h3>
                  {invalid ? <hr /> : " "}
                  {invalid ? (
                    <p>
                      <strong>
                        Please ensure this unit offering is available in the
                        database.
                      </strong>
                    </p>
                  ) : (
                    " "
                  )}
                </div>
              </div>

              {userRole === ROLES.TUTOR && (
                <div className="row">
                  <div className="col-sm-12">
                    <button className="btn btn-theme" onClick={this.addSlot}>
                      Add Booking Slot
                    </button>
                  </div>
                </div>
              )}

              <div className="row mt">
                <div className="col-sm-12">
                  {semester && task && unit ? (
                    bookingslots && bookingSlotsFound ? (
                      <table className="table table-bordered table-striped table-condensed slots-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Status</th>
                            <th>Tutor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingslots.map((slot) => (
                            <tr
                              key={slot.id}
                              className={
                                slot.slotStatus == "Available"
                                  ? "row-bold"
                                  : "row-fade"
                              }
                              onClick={() => this.goToBookingSlot(slot.id)}
                            >
                              <td>{this.convertDate(slot.date.seconds)}</td>
                              <td>{slot.startTime}</td>
                              <td>{slot.endTime}</td>
                              <td>{slot.slotStatus}</td>
                              <td>
                                {slot.tutor.firstname} {slot.tutor.lastname}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="alert alert-warning">
                        <p>No booking slot found.</p>
                      </div>
                    )
                  ) : taskError ? (
                    <div className="alert alert-danger">
                      <strong>Invalid task.</strong> The task ID from this
                      page's URL does not exist in the system.
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              <div className="row mt">
                <div className="col-sm-12">
                  <button
                    className="btn btn-danger"
                    onClick={this.backToOffering}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </section>
          </section>
        ) : (
          ""
        )}
      </div>
    );
  }
}

const condition = (authUser) => authUser;

export default withAuthorization(condition)(TaskPage);
