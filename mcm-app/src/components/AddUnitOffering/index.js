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
  units: [],
  selectedUnit: "none",
  semesters: [],
  selectedSemester: "none",
  error: null,
};

class AddUnitOfferingFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    this.props.firebase
      .getAllDocsInCollection("units")
      .then((units) => {
        console.log("Units:", units);
        this.setState({ units });
      })
      .catch((err) => console.error(err));

    this.props.firebase
      .getAllDocsInCollection("semesters")
      .then((semesters) => {
        console.log("Semesters:", semesters);
        this.setState({ semesters });
      })
      .catch((err) => console.error(err));
  }

  onSubmit = (event) => {
    event.preventDefault();
    const unitOfferingData = {
      unitID: this.state.selectedUnit,
      semesterID: this.state.selectedSemester,
    };
    console.log(unitOfferingData);

    this.props.firebase
      .addData("unitofferings", unitOfferingData)
      .then((res) => console.log(res))
      .catch((error) => {
        console.log(error);
        this.setState({ error });
      });
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    console.log(this.state.selectedUnit);
  };

  render() {
    const { units, semesters, error } = this.state;

    // Both unit code and unit name fields must be filled
    const isInvalid = units === "None" || semesters === "";

    return (
      <form onSubmit={this.onSubmit} className="form-horizontal style-form">
        <div className="form-group">
          <label className="col-sm-2 control-label">Select Unit</label>
          <div className="col-sm-10 col-md-4">
            <select
              className="form-control"
              name="selectedUnit"
              onChange={this.onChange}
            >
              {units.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.unitCode + " " + doc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="col-sm-2 control-label">Select Semester</label>
          <div className="col-sm-10 col-md-4">
            <select
              className="form-control"
              name="selectedSemester"
              onChange={this.onChange}
            >
              {semesters.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {"Semester " +
                    doc.number +
                    ", " +
                    doc.year +
                    " (" +
                    doc.type +
                    ")"}
                </option>
              ))}
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
