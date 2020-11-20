import React from "react";
import { withAuthorization } from "../Session";

import * as ROLES from "../../constants/roles";

const INITIAL_STATE = {
  allocated: false,
  allocateMessage: "Allocate Yourself",
  authUser: null,
  booking: null,
  bookingError: false,
  loadTask: false,
  offeringID: null,
  semester: null,
  semesterError: null,
  slot: null,
  slotError: null,
  slotID: null,
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

class BookingSlotPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this.setState({ loadTask: true });
    const offeringID = this.props.match.params.offeringID;
    const taskID = this.props.match.params.taskID;
    const slotID = this.props.match.params.slotID;
    this.setState({ offeringID, taskID, slotID });
    // console.log(taskID);

    console.log("Task ID:", taskID, "Slot ID:", slotID);
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
        // Verify the privileges of the currently logged-in user to hide the 'Create Booking Slot' button
        // Easy trick is to verify if the email address contains 'students'.
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
                  //   console.log("Task was not found");
                } else {
                  this.setState({ task });
                  //   console.log("Task found:", task);

                  // Load data for the booking slot
                  await this.props.firebase
                    .findBookingSlot(
                      this.state.offeringID,
                      this.state.taskID,
                      this.state.slotID
                    )
                    .then((slot) => {
                      if (slot !== undefined) {
                        console.log(slot);
                        this.setState({ slotError: false, slot });
                      } else {
                        console.log("Wrong booking slot.");
                        this.setState({ slotError: true, slot: null });
                      }
                    });
                }
              });

            await this.props.firebase
              .getBooking(
                this.state.offeringID,
                this.state.taskID,
                this.state.slotID
              )
              .then((doc) => {
                if (doc !== undefined) {
                  this.setState({ bookingError: null, booking: doc });
                  console.log("Booking found:", doc);
                } else {
                  this.setState({ bookingError: false, booking: undefined });
                }
              })
              .catch((err) => {
                this.setState({ bookingError: true, booking: null });
                console.error(err);
              });
            // console.log(this.state);
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

  backToOffering = (event) => {
    event.preventDefault();
    this.props.history.push(`/unit-offerings/${this.state.offeringID}`);
  };

  convertDate = (dateValue) => {
    let date = new Date(dateValue * 1000); // Firestore will return the seconds instead of milliseconds
    return `${DAYS[date.getDay()]}, ${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
  };

  createBooking = (event) => {
    event.preventDefault();
    this.props.history.push(
      `/unit-offerings/${this.state.offeringID}/tasks/${this.state.taskID}/booking-slots/${this.state.slotID}/add-booking`
    );
  };

  render() {
    const {
      allocated,
      allocateMessage,
      booking,
      bookingError,
      loadTask,
      semester,
      semesterError,
      slot,
      slotError,
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

              <div className="row">
                <div className="col-sm-12 col-md-8">
                  {semester && task && unit ? (
                    slot ? (
                      <div className="row">
                        <div className="col-sm-12">
                          <table className="table table-bordered table-condensed booking-slot-table">
                            <caption>Booking Slot Details</caption>
                            <tbody>
                              <tr>
                                <th>Date/Time:</th>
                                <td>{this.convertDate(slot.date.seconds)}</td>
                              </tr>
                              <tr>
                                <th>Start:</th>
                                <td>{slot.startTime}</td>
                              </tr>
                              <tr>
                                <th>End:</th>
                                <td>{slot.endTime}</td>
                              </tr>
                              <tr>
                                <th>Location:</th>
                                <td>{slot.location}</td>
                              </tr>
                              <tr>
                                <th>Tutor:</th>
                                <td>
                                  {slot.tutor.firstname} {slot.tutor.lastname}
                                </td>
                              </tr>
                              <tr>
                                <th>Status:</th>
                                <td>{slot.slotStatus}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      slotError && (
                        <div className="alert alert-danger">
                          <p>
                            <i className="fa fa-exclamation-circle mr-2"></i>
                            Something went wrong with that booking slot.
                          </p>
                        </div>
                      )
                    )
                  ) : taskError ? (
                    <div className="alert alert-danger">
                      <i className="fa fa-exclamation-circle mr-2"></i>
                      <strong>Invalid task.</strong> The task ID from this
                      page's URL does not exist in the system.
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              <div className="row mt">
                <div className="col-sm-12 col-md-8">
                  {booking === undefined && (
                    <div className="alert alert-warning">
                      <p>
                        <i className="fa fa-exclamation-triangle mr-2"></i>This
                        slot does not have any booking yet.
                      </p>
                    </div>
                  )}
                  {booking && (
                    <div className="row">
                      <div className="col-sm-12">
                        <table className="table table-bordered table-condensed booking-slot-table">
                          <caption>Submitted Booking Details</caption>
                          <tbody>
                            <tr>
                              <th>Subject:</th>
                              <td>{booking.subject}</td>
                            </tr>
                            <tr>
                              <th>Comment:</th>
                              <td>{booking.comments}</td>
                            </tr>
                            <tr>
                              <th>Student name:</th>
                              <td>
                                {booking.student.firstname}{" "}
                                {booking.student.lastname}
                              </td>
                            </tr>
                            <tr>
                              <th>Student ID</th>
                              <td>{booking.student.studentID}</td>
                            </tr>
                            <tr>
                              <th>Status:</th>
                              <td>{booking.bookingStatus}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {booking && (
                    <div className="row booking-actions mt">
                      <div className="col-sm-6 col-md-4">
                        <p className="action">
                          <i class="fa fa-check mr-2"></i>
                          Approve Booking
                        </p>
                      </div>
                      <div className="col-sm-6 col-md-4">
                        <p className="action">
                          <i class="fa fa-times mr-2"></i> Reject Booking
                        </p>
                      </div>
                    </div>
                  )}
                  {/* If the retrieval of bookings was unsuccessful */}
                  {bookingError && (
                    <div className="alert alert-error">
                      <p>
                        Something went wrong with retrieving the booking for
                        this slot. Please retry later.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="row mt">
                <div className="col-sm-12">
                  {/* Give students the option to create bookings if there isn't any for the task in question */}
                  {userRole == ROLES.STUDENT && booking === undefined ? (
                    <button
                      className="btn btn-theme"
                      onClick={this.createBooking}
                    >
                      Create Booking
                    </button>
                  ) : (
                    ""
                  )}

                  <button
                    className="btn btn-danger ml-1"
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

export default withAuthorization(condition)(BookingSlotPage);
