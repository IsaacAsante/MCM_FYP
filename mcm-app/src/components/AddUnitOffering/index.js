import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";
import { compose } from "recompose";

import * as ROUTES from "../../constants/routes";

const AddUnitOfferingPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h3>
          <i className="fa fa-angle-right"></i> Add Unit Offering
        </h3>
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
        // console.log("Units:", units);
        // Sort the units by unit code.
        function compare(a, b) {
          if (a.unitCode < b.unitCode) {
            return -1;
          }
          if (a.unitCode > b.unitCode) {
            return 1;
          }
          return 0;
        }

        units.sort(compare);
        this.setState({ units });
      })
      .catch((err) => console.error(err));

    this.props.firebase
      .getValidSemesters()
      .then((semesters) => {
        // console.log("Semesters:", semesters);
        // Sort the semesters by year, then by number.
        semesters.sort((a, b) => {
          return a.year - b.year || a.number - b.number;
        });
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
    // console.log(unitOfferingData);

    this.props.firebase
      .verifyUnitOffering(unitOfferingData.unitID, unitOfferingData.semesterID)
      .then((res) => {
        if (!res.empty) {
          // console.log("This unit already exists.", res);
          this.setState({
            error: "This unit offering already exists in the database.",
            success: null,
          });
        } else {
          this.props.firebase
            .addData("unitofferings", unitOfferingData)
            .then((res) => {
              // Successful operation
              this.setState({
                selectedSemester: "None",
                selectedUnit: "None",
                error: null,
                success: "Unit Offering created successfully",
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
    // console.log(this.state.selectedUnit);
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

    const isInvalid = selectedUnit === "None" || selectedSemester === "None";

    return (
      <div>
        <form
          onSubmit={this.onSubmit}
          className="form-horizontal style-form"
          autoComplete="off"
        >
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
      </div>
    );
  }
}

const condition = (authUser) => authUser && authUser.role == "Tutor";

export default compose(withAuthorization(condition))(AddUnitOfferingPage);

const AddUnitOfferingForm = compose(
  withRouter,
  withFirebase
)(AddUnitOfferingFormBase);

export { AddUnitOfferingForm };
