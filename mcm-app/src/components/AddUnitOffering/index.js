import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { withFirebase } from "../Firebase";
import { compose } from "recompose";

import * as ROUTES from "../../constants/routes";

const AddUnitOfferingPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h1>
          <i className="fa fa-angle-right"></i> Add Unit Offering
        </h1>
        <div className="row mt">
          <div className="col-lg-12">
            <div className="form-panel">
              <AddUnitOfferingForm />
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
);

const INITIAL_STATE = {
  unit: "None",
  semester: "None",
  error: null,
};

class AddUnitOfferingFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    event.preventDefault();
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { unit, semester, error } = this.state;

    // Both unit code and unit name fields must be filled
    const isInvalid = unit === "None" || semester === "";

    return (
      <form onSubmit={this.onSubmit} className="form-horizontal style-form">
        <div className="form-group">
          <label className="col-sm-2 control-label">Select Unit</label>
          <div className="col-sm-10 col-md-4">
            <select
              className="form-control"
              name="unit"
              onChange={this.updateValue}
              value={this.state.role}
            >
              <option value="None">Select Unit</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="col-sm-2 control-label">Select Semester</label>
          <div className="col-sm-10 col-md-4">
            <select
              className="form-control"
              name="semester"
              onChange={this.updateValue}
              value={this.state.role}
            >
              <option value="None">Select Semester</option>
            </select>
          </div>
        </div>
        <button disabled={isInvalid} type="submit" className="btn btn-theme">
          Add Unit Offering
        </button>
        <div className="form-group has-error">
          <div className="col-lg-10">
            <p className="help-block">{error}</p>
          </div>
        </div>
      </form>
    );
  }
}

export default AddUnitOfferingPage;

const AddUnitOfferingForm = compose(
  withRouter,
  withFirebase
)(AddUnitOfferingFormBase);

export { AddUnitOfferingForm };
