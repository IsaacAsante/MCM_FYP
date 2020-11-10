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

const INITIAL_STATE = {
  offeringID: null,
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
  }

  onSubmit = (event) => {
    event.preventDefault();
  };

  backToTask = (event) => {
    // console.log("Props:", this.props);
    event.preventDefault();
    this.props.history.push(
      `/unit-offerings/${this.state.offeringID}/tasks/${this.state.taskID}/`
    );
  };

  render() {
    return (
      <div className="row">
        <div className="col-sm-12 col-md-10">
          <form onSubmit={this.onSubmit} className="form-horizontal style-form">
            <div className="form-group">
              <label className="col-sm-2 control-label">Date</label>
              <div className="col-sm-10">
                <DatePicker name="deadline" className="form-control" />
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
                  <input
                    type="text"
                    className="form-control dpd1"
                    name="from"
                  />
                  <span className="input-group-addon">To</span>
                  <input type="text" className="form-control dpd2" name="to" />
                </div>
                <span className="help-block">
                  <em>*Select times</em>
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="col-sm-2 control-label">
                Maximum Time Allowed
              </label>
              <div className="col-sm-10">
                <select className="form-control" name="maxtime">
                  <option value="0">--</option>
                  <option value="10">10min</option>
                  <option value="15">15min</option>
                  <option value="20">20min</option>
                  <option value="25">25min</option>
                  <option value="30">30min</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="col-sm-2 control-label">Location</label>
              <div className="col-sm-10">
                <input type="text" name="deadline" className="form-control" />
              </div>
            </div>

            <div className="form-group">
              <label className="col-sm-2 control-label">Lab Group</label>
              <div className="col-sm-10">
                <select className="form-control" name="labgroup">
                  <option value="0">--</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-theme">
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
