import React from "react";
import DatePicker from "react-datepicker";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";

const AddNewBookingForm = (props) => (
  <div className="mt">
    <div className="row">
      <div className="col-lg-12">
        <div className="form-panel">
          <h4>
            <i className="fa fa-angle-right"></i> Add Booking Details
          </h4>
          <BookingForm unitoffering={props.unitoffering} task={props.task} />
        </div>
      </div>
    </div>
  </div>
);

const INITIAL_STATE = {
  subject: "",
  error: false,
  success: false,
};

class BookingFormBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onSubmit = (event) => {
    event.preventDefault();
    // Remember: Update the count for maxSubmissions in the Task document.
  };

  backToTask = (event) => {
    event.preventDefault();
    this.props.history.push(
      `/unit-offerings/${this.props.unitoffering}/tasks/${this.props.task}/`
    );
  };

  render() {
    const { subject, error, success } = this.state;
    const isInvalid = subject == "";
    return (
      <div className="row mt">
        <div className="col-sm-12 col-md-8">
          <form onSubmit={this.onSubmit} className="form-horizontal style-form">
            <div className="form-group">
              <label className="col-sm-4 control-label">Subject</label>
              <div className="col-sm-8">
                <input
                  name="subject"
                  value={subject}
                  onChange={this.onChange}
                  type="text"
                  placeholder="e.g. Meeting for draft review"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-sm-4 control-label">Extra Comments:</label>
              <div className="col-sm-8">
                <textarea
                  name="subject"
                  value={subject}
                  onChange={this.onChange}
                  className="form-control"
                ></textarea>
              </div>
            </div>

            <button
              disabled={isInvalid}
              type="submit"
              className="btn btn-theme"
            >
              Submit Booking
            </button>
            <button className="btn btn-danger ml-1" onClick={this.backToTask}>
              Cancel
            </button>
          </form>
          {!success ? (
            error ? (
              <div className="alert alert-danger mt">
                <span>
                  Something went wrong during the submission of your booking.
                </span>
              </div>
            ) : (
              ""
            )
          ) : (
            <div className="alert alert-success mt">
              <span>Booking created successfully.</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const BookingForm = compose(withRouter, withFirebase)(BookingFormBase);

export { BookingForm };

export default withRouter(AddNewBookingForm);
