import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";
import { compose } from "recompose";

import * as ROUTES from "../../constants/routes";

const AddUnitPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h3>
          <i className="fa fa-angle-right"></i> Add Unit
        </h3>
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
  success: null,
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
      unitCode: this.state.unitCode.toUpperCase(),
      name: this.state.unitName.toUpperCase(),
    };

    this.props.firebase
      // Query if the unit already exists first.
      .getUnit(unitData.unitCode)
      .then((resArray) => {
        if (resArray.length != 0) {
          this.setState({ error: "This unit already exists in the database." });
        } else {
          this.props.firebase.addData("units", unitData).then((res) => {
            this.setState({ ...INITIAL_STATE });
            this.setState({ error: false, success: true });
          });
        }
      })
      .catch((error) => {
        this.setState({ error, success: false });
      });
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { unitCode, unitName, error, success } = this.state;

    const isInvalid = unitCode === "" || unitName === "";

    return (
      <form
        onSubmit={this.onSubmit}
        className="form-horizontal style-form"
        autoComplete="off"
      >
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
        {success ? (
          <div className="alert alert-success mt">
            <span>Unit created successfully.</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger mt">
            <span>Something went wrong. Please retry later.</span>
          </div>
        ) : (
          ""
        )}
      </form>
    );
  }
}

const condition = (authUser) => authUser && authUser.role == "Tutor";

export default compose(withAuthorization(condition))(AddUnitPage);

const AddUnitForm = compose(withRouter, withFirebase)(AddUnitFormBase);

export { AddUnitForm };
