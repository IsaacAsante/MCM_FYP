import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { withFirebase } from "../Firebase";
import { compose } from "recompose";

import * as ROUTES from "../../constants/routes";

const AddUnitPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h1>
          <i className="fa fa-angle-right"></i> Add Unit
        </h1>
        <div className="row mt">
          <div className="col-lg-12">
            <div className="form-panel">
              <AddUnitForm />
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
);

const INITIAL_STATE = {
  unitCode: "",
  unitName: "",
  error: null,
};

class AddUnitFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    event.preventDefault();
    const unitData = {
      unitCode: this.state.unitCode,
      name: this.state.unitName,
    };

    this.props.firebase
      .addData("units", unitData)
      .then((res) => {
        console.log("Response from Units:", res);
        this.setState({ ...INITIAL_STATE });
        // this.props.history.push(ROUTES.DASHBOARD);
      })
      .catch((error) => {
        this.setState({ error });
      });
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { unitCode, unitName, error } = this.state;

    // Both unit code and unit name fields must be filled
    const isInvalid = unitCode === "" || unitName === "";

    return (
      <form onSubmit={this.onSubmit} className="form-horizontal style-form">
        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">Unit Code</label>
          <div className="col-sm-10">
            <input
              name="unitCode"
              value={unitCode}
              onChange={this.onChange}
              type="text"
              placeholder="E.g. ICT30001"
              className="form-control"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">Unit name</label>
          <div className="col-sm-10">
            <input
              name="unitName"
              value={unitName}
              onChange={this.onChange}
              type="text"
              placeholder="E.g. IT Project"
              className="form-control"
            />
          </div>
        </div>
        <button disabled={isInvalid} type="submit" className="btn btn-theme">
          Add Unit
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

export default AddUnitPage;

const AddUnitForm = compose(withRouter, withFirebase)(AddUnitFormBase);

export { AddUnitForm };
