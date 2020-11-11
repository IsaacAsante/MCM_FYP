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
  offeringID: null,
  selectedLabGroup: null,
  startTime: times[0],
  taskID: null,
  duplicate: false,
  success: false,
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

    // Retrieve lab groups under the current unit offering
    this.props.firebase
      .getLabGroups(this.props.match.params.offeringID)
      .then((labGroups) => {
        if (labGroups.length > 0) {
          console.log("Lab Groups:", labGroups);
          this.setState({ labGroups });
        }
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

  onSubmit = (event) => {
    event.preventDefault();
    console.log(this.state);
  };

  backToTask = (event) => {
    // console.log("Props:", this.props);
    event.preventDefault();
    this.props.history.push(
      `/unit-offerings/${this.state.offeringID}/tasks/${this.state.taskID}/`
    );
  };

  render() {
    const { bookingDate, endTime, labGroups, startTime } = this.state;
    return (
      <div className="row">
        <div className="col-sm-12 col-md-10">
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
              <label className="control-label col-sm-2">Available Period</label>
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
                  <option value="0">--</option>
                  {labGroups.map((doc) => (
                    <option key={doc.name} value={doc.name}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-theme"
              onClick={this.onSubmit}
            >
              Save
            </button>
            <button
              type="submit"
              className="btn btn-danger ml-1"
              onClick={this.backToTask}
            >
              Go Back
            </button>
          </form>
          {/* <div className="alert alert-danger mt">
            <span>
              A task with the same name already exists for this unit offering.
            </span>
          </div>
          <div className="alert alert-success mt">
            <span>Task created successfully.</span>
          </div> */}
        </div>
      </div>
    );
  }
}

const BookingSlotForm = compose(withRouter, withFirebase)(BookingSlotFormBase);

export { BookingSlotForm };

export default withRouter(AddBookingSlotForm);
