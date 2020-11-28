import React from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";
import axios from "axios";

const AddNewBookingForm = (props) => (
  <div className="mt">
    <div className="row">
      <div className="col-lg-12">
        <div className="form-panel">
          <h4>
            <i className="fa fa-angle-right"></i> Add Booking Details
          </h4>
          <BookingForm
            unitoffering={props.unitoffering}
            task={props.task}
            slot={props.slot}
            user={props.user}
          />
        </div>
      </div>
    </div>
  </div>
);

const INITIAL_STATE = {
  comments: "",
  conflict: null,
  subject: "",
  error: false,
  success: false,
};

class BookingFormBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidUpdate(prevProps) {
    // Capture the role of the user viewing the page.
    // Tutors cannot add bookings. Only students can.
    if (this.props.user !== prevProps.user) {
      // console.log(this.props.user.role);
      this.setState({ userRole: this.props.user.role });
    }
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onSubmit = async (event) => {
    event.preventDefault();
    const bookingObj = {
      location: this.props.slot.location,
      subject: this.state.subject,
      taskID: this.props.slot.taskID,
      comments: this.state.comments,
      bookingStatus: "In Review", // Any new booking should be reviewed.
      bookingSlot: this.props.slot,
      student: this.props.user,
      offeringID: this.props.unitoffering,
    };
    // console.log(bookingObj);
    this.setState({ success: true, error: false });
    // Add the booking to the DB
    await this.props.firebase
      .addBookingToDB(
        this.props.unitoffering,
        this.props.slot.taskID,
        this.props.slot.id,
        bookingObj
      )
      .then((successfullAdding) => {
        if (successfullAdding !== false) {
          const tutorEmail = bookingObj.bookingSlot.tutor.email;
          const studentFirstname = bookingObj.student.firstname;
          const studentLastname = bookingObj.student.lastname;
          const offeringID = bookingObj.offeringID;
          const taskID = bookingObj.taskID;
          const slotID = bookingObj.bookingSlot.id;
          // Send an email notification
          axios
            .post(
              "/notifications/send",
              {
                tutorEmail,
                studentFirstname,
                studentLastname,
                offeringID,
                taskID,
                slotID,
              },
              {
                method: "POST",
                headers: {
                  "Content-type": "application/json",
                },
              }
            )
            .then((res) => {
              // console.log("Backend res: ", res);
              this.setState({ success: true, error: false, conflict: false });
            })
            .catch((err) => {
              console.error("Error from backend: ", err);
            });
        } else {
          this.setState({ conflict: true, success: false, error: false });
        }
      })
      .catch((err) => {
        console.error(err);
        this.setState({ conflict: false, error: true, success: false });
      });
    // // TODO: Update the count for maxSubmissions in the Task document.
  };

  backToTask = (event) => {
    event.preventDefault();
    this.props.history.push(
      `/unit-offerings/${this.props.unitoffering}/tasks/${this.props.task}/`
    );
  };

  render() {
    const {
      comments,
      conflict,
      subject,
      error,
      success,
      userRole,
    } = this.state;
    const isInvalid = subject == "" || comments == "";
    return (
      <div className="row mt">
        <div className="col-sm-12 col-md-8">
          {success || conflict ? (
            ""
          ) : (
            <form
              onSubmit={this.onSubmit}
              className="form-horizontal style-form"
              autoComplete="off"
            >
              <div className="form-group">
                <label className="col-sm-4 control-label">Subject</label>
                <div className="col-sm-8">
                  <input
                    name="subject"
                    value={subject}
                    onChange={this.onChange}
                    maxLength="50"
                    type="text"
                    placeholder="e.g. Meeting for draft review"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="col-sm-4 control-label">
                  Extra Comments (Optional):
                </label>
                <div className="col-sm-8">
                  <textarea
                    name="comments"
                    value={comments}
                    onChange={this.onChange}
                    maxLength="300"
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
          )}
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
          ) : conflict ? (
            ""
          ) : (
            <div className="alert alert-success mt">
              <span>Booking created successfully.</span>
            </div>
          )}

          {/* Show this if the booking slot has already been reserved by a student */}
          {conflict && (
            <div className="alert alert-danger mt">
              <span>
                Sorry, your booking could not be saved. Please go back and try
                again.
              </span>
            </div>
          )}
          {(success || conflict) && (
            <div className="row mt">
              <div className="col-sm-12">
                <button
                  className="btn btn-danger ml-1"
                  onClick={this.backToTask}
                >
                  Go Back
                </button>
              </div>
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
