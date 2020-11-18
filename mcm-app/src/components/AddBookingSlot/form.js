import React from "react";
import DatePicker from "react-datepicker";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";

const AddBookingSlotForm = (props) => (
  <div className="mt">
    <h4>
      <i className="fa fa-angle-right"></i> Adding Booking Slot
    </h4>
    <div className="row">
      <div className="col-lg-12">
        <div className="form-panel">
          <BookingSlotForm unitoffering={props.unitoffering} />
        </div>
      </div>
    </div>
  </div>
);

const TIMES = [
  { time: "09:00", free: true },
  { time: "09:15", free: true },
  { time: "09:30", free: true },
  { time: "09:45", free: true },
  { time: "10:00", free: true },
  { time: "10:15", free: true },
  { time: "10:30", free: true },
  { time: "10:45", free: true },
  { time: "11:00", free: true },
  { time: "11:15", free: true },
  { time: "11:30", free: true },
  { time: "11:45", free: true },
  { time: "12:00", free: true },
  { time: "13:00", free: true },
  { time: "13:15", free: true },
  { time: "13:30", free: true },
  { time: "13:45", free: true },
  { time: "14:00", free: true },
  { time: "14:15", free: true },
  { time: "14:30", free: true },
  { time: "14:45", free: true },
  { time: "15:00", free: true },
  { time: "15:15", free: true },
  { time: "15:30", free: true },
  { time: "15:45", free: true },
  { time: "16:00", free: true },
  { time: "16:15", free: true },
  { time: "16:30", free: true },
  { time: "16:45", free: true },
  { time: "17:00", free: true },
];

const INITIAL_STATE = {
  bookingDate: new Date(new Date().setHours(0, 0, 0, 0)),
  clash: false,
  endTime: "",
  labGroups: [],
  location: "",
  noAllocation: null,
  offeringID: null,
  selectedLabGroup: "",
  startTime: "",
  taskID: null,
  times: TIMES,
  user: null,
  duplicate: false,
  success: false,
  error: false,
};

class BookingSlotFormBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this.setState({
      offeringID: this.props.match.params.offeringID,
      taskID: this.props.match.params.taskID,
    });

    this.props.firebase
      .getCurrentUser()
      .then((user) => {
        return user;
      })
      .then(async (user) => {
        await this.props.firebase.getTutor(user.uid).then((tutor) => {
          tutor["uid"] = user.uid;
          this.setState({ user: tutor });
        });
      })
      .then(async () => {
        console.log("TUTOR:", this.state.user);
        // Retrieve lab groups under the current unit offering
        await this.props.firebase
          .findLabsByTutor(
            this.props.match.params.offeringID,
            this.state.user.email
          )
          .then((labGroups) => {
            if (labGroups.length > 0) {
              this.setState({ noAllocation: false });
              // console.log("Lab Groups:", labGroups);
              this.setState({ labGroups });
            } else {
              this.setState({ noAllocation: true });
            }
          })
          .catch((err) => {
            console.error(err);
          });

        // Disable all the time periods that are unavailable.
        await this.filterOutTimes(this.state.user.uid, this.state.bookingDate);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  filterOutTimes = async (tutorUID, datetime) => {
    await this.props.firebase
      .getBookingSlotsByTutor(
        this.props.match.params.offeringID,
        this.props.match.params.taskID,
        tutorUID,
        datetime
      )
      .then((bookingSlots) => {
        console.log("Booking Slots in DB:", bookingSlots);
        if (bookingSlots.length > 0) {
          for (let i = 0; i < bookingSlots.length; i++) {
            for (let j = 0; j < this.state.times.length; j++) {
              if (
                this.state.times[j].time >= bookingSlots[i].startTime &&
                this.state.times[j].time < bookingSlots[i].endTime
              ) {
                this.state.times[j].free = false;
                this.setState({ times: this.state.times });
              }
            }
          }
        } else {
          for (let i = 0; i < this.state.times.length; i++) {
            this.state.times[i].free = true;
            this.setState({ times: this.state.times });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  resetTimesForNewDay = () => {
    for (let i = 0; i < this.state.times.length; i++) {
      this.state.times[i].free = true;
    }
  };

  // This function serves as a guard for date-time conflicts that may slip through the slot booking process.
  verifyDateTimeConflict = () => {
    for (let i = 0; i < this.state.times.length; i++) {
      if (
        (this.state.times[i].time == this.state.startTime &&
          this.state.times[i].free == false) ||
        (this.state.times[i].time == this.state.endTime &&
          this.state.times[i].free == false)
      ) {
        return true;
      }
    }
    return false; // No conflict was found in this last date-time conflict check.
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    // console.log(this.state.startTime, this.state.endTime);
  };

  onDateSet = async (dateValue) => {
    this.setState({ bookingDate: new Date(dateValue.setHours(0, 0, 0, 0)) });
    this.resetTimesForNewDay();
    // After resetting, proceed to disable invalid times.
    await this.filterOutTimes(
      this.state.user.uid,
      new Date(dateValue.setHours(0, 0, 0, 0))
    );
    // Clear the times
    this.setState({ startTime: "", endTime: "" });
    // console.log(this.state.bookingDate);
  };

  onSelect = (event) => {
    this.setState({ selectedLabGroup: event.target.value });
  };

  onSubmit = async (event) => {
    event.preventDefault();
    // console.log(this.state);

    // Check if the slot spans across invalid times
    for (let i = 0; i < this.state.times.length; i++) {
      if (
        this.state.times[i].time > this.state.startTime &&
        this.state.times[i].time < this.state.endTime
      )
        if (this.state.times[i].free == false) {
          this.setState({
            error:
              "Your booking slot cannot span across times that are already taken.",
            clash: true,
            success: false,
          });
          // console.log("Invalid");
          return;
        }
    }

    const midnightToday = new Date().setHours(0, 0, 0, 0);
    if (this.state.endTime <= this.state.startTime) {
      this.setState({
        error:
          "Your booking slot's end time must be greater than your start time.",
        clash: false,
        success: false,
      });
    } else if (this.state.bookingDate < midnightToday) {
      this.setState({
        error: "Your booking slot cannot be set to a past date.",
        clash: false,
        success: false,
      });
    } else {
      const conflict = this.verifyDateTimeConflict();
      if (conflict) {
        this.setState({
          error: "Invalid booking slot. Please verify your date or time again.",
          clash: true,
          success: false,
        });
      } else {
        this.setState({ error: false });
        const bookingSlotObj = {
          date: this.state.bookingDate,
          startTime: this.state.startTime,
          endTime: this.state.endTime,
          location: this.state.location,
          labGroupID: this.state.selectedLabGroup,
          slotStatus: "Available",
          taskID: this.state.taskID,
          tutorID: this.state.user.uid,
          tutor: {
            email: this.state.user.email,
            firstname: this.state.user.firstname,
            lastname: this.state.user.lastname,
          },
        };
        await this.props.firebase
          .addBookingSlot(
            this.state.offeringID,
            this.state.taskID,
            bookingSlotObj
          )
          .then(async (res) => {
            // console.log(res);
            // Revert date to current date, and make sure times get disabled if they are not free
            await this.filterOutTimes(
              this.state.user.uid,
              new Date(new Date().setHours(0, 0, 0, 0))
            );
            return true;
          })
          .then((res) => {
            this.setState({
              success: true,
              error: false,
              clash: false,
              bookingDate: new Date(new Date().setHours(0, 0, 0, 0)),
              location: "",
              startTime: "",
              endTime: "",
              selectedLabGroup: "",
            });
          })
          .catch((error) => {
            console.error(error);
            this.setState({ error });
          });
      }
    }
  };

  backToTask = (event) => {
    // console.log("Props:", this.props);
    event.preventDefault();
    this.props.history.push(
      `/unit-offerings/${this.state.offeringID}/tasks/${this.state.taskID}/`
    );
  };

  backToUnitOffering = (event) => {
    event.preventDefault();
    this.props.history.push(`/unit-offerings/${this.state.offeringID}`);
  };

  importLab = (event) => {
    event.preventDefault();
    this.props.history.push(
      `/unit-offerings/${this.state.offeringID}/add-lab-group`
    );
  };

  render() {
    const {
      bookingDate,
      endTime,
      error,
      labGroups,
      location,
      noAllocation,
      selectedLabGroup,
      startTime,
      success,
      times,
    } = this.state;
    const invalid =
      startTime == "" ||
      endTime == "" ||
      location == "" ||
      selectedLabGroup == "";
    return (
      <div className="row">
        <div className="col-sm-12 col-md-10">
          {noAllocation ? (
            <div className="row">
              <div className="col-sm-12">
                <div className="alert alert-warning mt">
                  <p>
                    <strong>Access denied.</strong>
                  </p>
                  <p>
                    You are currently not recognized as a Lab tutor under this
                    unit offering. Please import an excel file containing your
                    name as a staff for a Lab group, along with the list of
                    students in your Lab.
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12">
                  <button
                    className="btn btn-info ml-3 mb-3"
                    onClick={this.importLab}
                  >
                    Import Lab Data
                  </button>
                  <button
                    className="btn btn-danger ml-1 mb-3"
                    onClick={this.backToUnitOffering}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={this.onSubmit}
              className="form-horizontal style-form"
              autoComplete="false"
            >
              <div className="form-group">
                <label className="col-sm-2 control-label">Date</label>
                <div className="col-sm-10">
                  <DatePicker
                    selected={bookingDate}
                    name="bookingDate"
                    className="form-control"
                    onChange={this.onDateSet}
                    autoComplete="false"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="control-label col-sm-2">
                  Available Period
                </label>
                <div className="col-sm-10">
                  <div
                    className="input-group input-large"
                    data-date="01/01/2014"
                    data-date-format="mm/dd/yyyy"
                  >
                    {/* Cannot start after 16:45m hence the use of the slice() Array method. */}
                    <select
                      className="form-control dpd1"
                      name="startTime"
                      onChange={this.onChange}
                      value={startTime}
                    >
                      <option value="">Starting at</option>
                      {times.slice(0, times.length - 1).map((obj, idx) => (
                        <option
                          key={idx}
                          value={obj.time}
                          disabled={obj.free == false}
                          className={
                            obj.free == true ? "option-bold" : "option-fade"
                          }
                        >
                          {obj.time}
                        </option>
                      ))}
                    </select>
                    <span className="input-group-addon">To</span>
                    <select
                      className="form-control dpd2"
                      name="endTime"
                      onChange={this.onChange}
                      value={endTime}
                    >
                      <option value="">Ending at</option>
                      {times.slice(1, times.length).map((obj, idx) => (
                        <option
                          key={idx}
                          value={obj.time}
                          disabled={obj.free == false}
                          className={
                            obj.free == true ? "option-bold" : "option-fade"
                          }
                        >
                          {obj.time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="help-block">
                    <em>*Start time and end time for this booking</em>
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="col-sm-2 control-label">Location</label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    onChange={this.onChange}
                    value={location}
                    autoComplete="false"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="col-sm-2 control-label">Lab Group</label>
                <div className="col-sm-10">
                  <select
                    className="form-control"
                    name="labgroups"
                    value={selectedLabGroup}
                    onChange={this.onSelect}
                  >
                    <option value="">--</option>
                    {labGroups.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-theme"
                disabled={invalid}
                onClick={this.onSubmit}
              >
                Create Booking Slot
              </button>
              <button
                type="submit"
                className="btn btn-danger ml-1"
                onClick={this.backToTask}
              >
                Go Back
              </button>
            </form>
          )}
          {error && (
            <div className="alert alert-danger mt">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mt">
              <span>Booking slot created successfully.</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const BookingSlotForm = compose(withRouter, withFirebase)(BookingSlotFormBase);

export { BookingSlotForm };

export default withRouter(AddBookingSlotForm);
