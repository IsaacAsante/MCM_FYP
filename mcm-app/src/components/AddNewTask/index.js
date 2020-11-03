import React from "react";

const AddNewTaskPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h1>Add New Task component</h1>
        <div className="row mt">
          <div className="col-lg-12">
            <div className="form-panel">
              <AddNewTaskForm />
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
);

const INITIAL_STATE = {
  taskname: "",
  deadline: "",
  maxSubmissions: 0,
  error: "",
};

class AddNewTaskForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onSubmit = (event) => {
    event.preventDefault();
    console.log(this.state);
  };

  updateSubmissions = (event) => {
    this.setState({ maxSubmissions: event.target.value });
    // console.log(event.target.value);
  };

  render() {
    const { taskname, deadline, maxSubmissions, error } = this.state;
    const isInvalid = taskname == "" || deadline == "" || maxSubmissions == 0;
    return (
      <form onSubmit={this.onSubmit} className="form-horizontal style-form">
        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">Task Name</label>
          <div className="col-sm-10">
            <input
              name="taskname"
              value={taskname}
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
            <input
              name="deadline"
              value={deadline}
              onChange={this.onChange}
              type="text"
              placeholder="e.g. 19/03/2021"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="col-sm-2 control-label">Maximum Consultation</label>
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
        <button disabled={isInvalid} type="submit" className="btn btn-theme">
          Save
        </button>
        <button type="submit" className="btn btn-danger ml-1">
          Cancel
        </button>
        <div className="form-group has-error">
          <div className="col-lg-10">
            <p className="help-block">{error && error.message}</p>
          </div>
        </div>
      </form>
    );
  }
}

export default AddNewTaskPage;
