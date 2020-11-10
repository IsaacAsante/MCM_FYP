import React from "react";
import DatePicker from "react-datepicker";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";

const AddBookingSlotForm = (props) => (
  <div className="mt">
    <h4>
      <i className="fa fa-angle-right"></i> Adding Task
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

const INITIAL_STATE = {
  name: "",
  deadline: new Date(),
  maxSubmissions: 0,
  submissions: [],
  duplicate: false,
  success: false,
};

class BookingSlotFormBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    event.preventDefault();
  };

  render() {
    return (
      <div className="row">
        <div className="col-sm-12 col-md-8">
          <form onSubmit={this.onSubmit} className="form-horizontal style-form">
            <div className="form-group">
              <label className="col-sm-2 col-sm-2 control-label">
                Task Name
              </label>
              <div className="col-sm-10">
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Assessment 1 or Distinction Task 2"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-sm-2 col-sm-2 control-label">
                Select Deadline
              </label>
              <div className="col-sm-10">
                <DatePicker name="deadline" className="form-control" />
              </div>
            </div>

            <div className="form-group">
              <label className="col-sm-2 control-label">
                Maximum Consultation
              </label>
              <div className="col-sm-2">
                <select className="form-control" name="role">
                  <option value="0">--</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-theme">
              Save
            </button>
            <button type="submit" className="btn btn-danger ml-1">
              Go Back
            </button>
          </form>
          <div className="alert alert-danger mt">
            <span>
              A task with the same name already exists for this unit offering.
            </span>
          </div>
          <div className="alert alert-success mt">
            <span>Task created successfully.</span>
          </div>
        </div>
      </div>
    );
  }
}

const BookingSlotForm = compose(withRouter, withFirebase)(BookingSlotFormBase);

export { BookingSlotForm };

export default withRouter(AddBookingSlotForm);
