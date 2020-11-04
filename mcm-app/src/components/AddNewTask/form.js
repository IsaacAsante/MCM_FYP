import React from "react";
import DatePicker from "react-datepicker";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";

const AddNewTaskForm = (props) => (
  <div className="mt">
    <h4>
      <i className="fa fa-angle-right"></i> Adding Task
    </h4>
    <div className="row">
      <div className="col-lg-12">
        <div className="form-panel">
          <TaskForm unitoffering={props.unitoffering} />
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

class TaskFormBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onDateSet = (dateValue) => {
    this.setState({ deadline: new Date(dateValue) });
  };

  onSubmit = (event) => {
    event.preventDefault();
    // Task to add
    const taskObj = {
      name: this.state.name,
      deadline: this.state.deadline,
      maxSubmissions: this.state.maxSubmissions,
      submissions: this.state.submissions,
    };

    // console.log(taskObj);

    // Verify if a task of the same name exists for the unit offering
    this.props.firebase
      .verifyTask(this.props.unitoffering, taskObj.name)
      .then((res) => {
        if (!res.empty) {
          this.setState({
            duplicate: true,
            success: false,
          });
        } else {
          this.setState({ ...INITIAL_STATE });
          this.setState({ success: true });
        }
      });
    // .addTask(this.props.unitoffering, taskObj)
    // .then((res) => {
    //   console.log(res);
    // })
    // .catch((error) => {
    //   console.log(error);
    //   this.setState({ error });
    // });
    // console.log(this.props.unitoffering);
  };

  updateSubmissions = (event) => {
    this.setState({ maxSubmissions: event.target.value });
    // console.log(event.target.value);
  };

  backToUnitOffering = () => {
    // console.log("Props:", this.props);
    this.props.history.push("/unit-offerings/" + this.props.unitoffering);
  };

  render() {
    const { name, deadline, maxSubmissions, duplicate, success } = this.state;
    const isInvalid = name == "" || deadline == "" || maxSubmissions == 0;
    return (
      <div class="row">
        <div class="col-sm-2">
          <form onSubmit={this.onSubmit} className="form-horizontal style-form">
            <div className="form-group">
              <label className="col-sm-2 col-sm-2 control-label">
                Task Name
              </label>
              <div className="col-sm-10">
                <input
                  name="name"
                  value={name}
                  onChange={this.onChange}
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
                <DatePicker
                  selected={deadline}
                  name="deadline"
                  className="form-control"
                  onChange={this.onDateSet}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="col-sm-2 control-label">
                Maximum Consultation
              </label>
              <div className="col-sm-2">
                <select
                  className="form-control"
                  name="role"
                  onChange={this.updateSubmissions}
                  value={this.state.maxSubmissions}
                >
                  <option value="0">--</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
            <button
              disabled={isInvalid}
              type="submit"
              className="btn btn-theme"
            >
              Save
            </button>
            <button
              type="submit"
              className="btn btn-danger ml-1"
              onClick={this.backToUnitOffering}
            >
              Cancel
            </button>
          </form>
          {!success ? (
            duplicate ? (
              <div className="alert alert-danger mt">
                <span>
                  A task with the same name already exists for this unit
                  offering.
                </span>
              </div>
            ) : (
              ""
            )
          ) : (
            <div className="alert alert-success mt">
              <span>Task created successfully.</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const TaskForm = compose(withRouter, withFirebase)(TaskFormBase);

export { TaskForm };

export default withRouter(AddNewTaskForm);
