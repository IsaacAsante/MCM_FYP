import React from "react";
import { withAuthorization } from "../Session";

const INITIAL_STATE = {
  allocated: false,
  allocateMessage: "Allocate Yourself",
  authUser: null,
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
      authUser,
      loadTask,
      semester,
      semesterError,
      slot,
      slotError,
      slotID,
      task,
      taskError,
      unit,
      unitError,
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
                  <span className="label label-danger">
                    {allocated && allocateMessage}
                  </span>
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
              <hr />

              <div className="row">
                <div className="col-sm-12">
                  <button
                    className="btn btn-theme"
                    onClick={this.createBooking}
                  >
                    Create Booking
                  </button>
                </div>
              </div>

              <div className="row mt">
                <div className="col-sm-12">
                  {semester && task && unit ? (
                    slot ? (
                      <div className="row">
                        <div className="col-sm-12">
                          <div className="alert alert-info">
                            <p>
                              This consultation booking slot was created for{" "}
                              <strong>
                                {this.convertDate(slot.date.seconds)},{" "}
                                {slot.startTime} - {slot.endTime}.
                              </strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      slotError && (
                        <div className="alert alert-danger">
                          <p>Something went wrong with that booking slot.</p>
                        </div>
                      )
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

export default withAuthorization(condition)(BookingSlotPage);
