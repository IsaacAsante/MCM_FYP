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
  selectedUnit: "None",
  semesters: [],
  selectedSemester: "None",
  error: null,
  success: null,
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
      .verifyUnitOffering(unitOfferingData.unitID, unitOfferingData.semesterID)
      .then((res) => {
        if (!res.empty) {
          console.log("This unit already exists.", res);
          this.setState({
            error: "This unit offering already exists in the database.",
            success: null,
          });
        } else {
          this.props.firebase
            .addData("unitofferings", unitOfferingData)
            .then((res) => {
              this.setState({
                selectedSemester: "None",
                selectedUnit: "None",
                error: null,
                success: "United Offering created successfully",
              });
            })
            .catch((error) => {
              console.log(error);
              this.setState({ error, success: null });
            });
        }
      })
      .catch((err) => {
        this.setState({ error: "Something went wrong. Please retry." });
      });
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    console.log(this.state.selectedUnit);
  };

  render() {
    const {
      units,
      semesters,
      selectedUnit,
      selectedSemester,
      error,
      success,
    } = this.state;

    // Both unit code and unit name fields must be filled
    const isInvalid = selectedUnit === "None" || selectedSemester === "None";

    return (
      <form onSubmit={this.onSubmit} className="form-horizontal style-form">
        <div className="form-group">
          <label className="col-sm-2 control-label">Select Unit</label>
          <div className="col-sm-10 col-md-4">
            <select
              className="form-control"
              name="selectedUnit"
              onChange={this.onChange}
              value={selectedUnit}
            >
              <option key="1" value="None">
                --
              </option>
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
              value={selectedSemester}
            >
              <option key="1" value="None">
                --
              </option>
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
            <p className="text-success">{success}</p>
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
