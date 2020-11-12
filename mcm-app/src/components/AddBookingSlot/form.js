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

const times = [
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
  "10:45",
  "11:00",
  "11:15",
  "11:30",
  "11:45",
  "12:00",
  "13:00",
  "13:15",
  "13:30",
  "13:45",
  "14:00",
  "14:15",
  "14:30",
  "14:45",
  "15:00",
  "15:15",
  "15:30",
  "15:45",
  "16:00",
  "16:15",
  "16:30",
  "16:45",
  "17:00",
];

const INITIAL_STATE = {
  bookingDate: new Date(),
  endTime: times[1],
  labGroups: [],
  location: "",
  noAllocation: null,
  offeringID: null,
  selectedLabGroup: "",
  startTime: times[0],
  taskID: null,
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
        console.log("User:", user);
        this.setState({ user });
        return user;
      })
      .then(async (user) => {
        // Retrieve lab groups under the current unit offering
        await this.props.firebase
          .findLabsByTutor(this.props.match.params.offeringID, user.email)
          .then((labGroups) => {
            if (labGroups.length > 0) {
              this.setState({ noAllocation: false });
              console.log("Lab Groups:", labGroups);
              this.setState({ labGroups });
            } else {
              this.setState({ noAllocation: true });
            }
          })
          .catch((err) => {
            console.error(err);
          });

        await this.props.firebase
          .getBookingSlotsByTutor(
            this.props.match.params.offeringID,
            this.props.match.params.taskID,
            user.uid
          )
          .then((bookingSlots) => {
            console.log("Booking Slots in DB:", bookingSlots);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onDateSet = (dateValue) => {
    this.setState({ bookingDate: new Date(dateValue) });
  };

  onSelect = (event) => {
    this.setState({ selectedLabGroup: event.target.value });
  };

  onSubmit = async (event) => {
    event.preventDefault();
    console.log(this.state);

    const midnightToday = new Date().setHours(0, 0, 0, 0);
    if (this.state.endTime <= this.state.startTime) {
      this.setState({
        error:
          "Your booking slot's end time must be greater than your start time.",
      });
    } else if (this.state.bookingDate < midnightToday) {
      this.setState({
        error: "Your booking slot cannot be set to a past date.",
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
        tutorEmail: this.state.user.email,
        tutorID: this.state.user.uid,
      };
      await this.props.firebase
        .addBookingSlot(
          this.state.offeringID,
          this.state.taskID,
          bookingSlotObj
        )
        .then((res) => {
          console.log(res);
          this.setState({ success: true, error: false });
        })
        .catch((error) => {
          console.error(error);
          this.setState({ error });
        });
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
      `/unit-offerings/${this.state.offeringID}/lab-groups/add`
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
    } = this.state;
    const invalid = location == "" || selectedLabGroup == "";
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
                      {times.slice(0, times.length - 1).map((time, idx) => (
                        <option key={idx} value={time}>
                          {time}
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
                      {times.map((time, idx) => (
                        <option key={idx} value={time}>
                          {time}
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
