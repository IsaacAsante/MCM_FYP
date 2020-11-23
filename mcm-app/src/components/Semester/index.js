import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import { withAuthorization } from "../Session";
import { compose } from "recompose";
import * as ROLES from "../../constants/roles";

const AddSemesterPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h3>
          <i className="fa fa-angle-right"></i> Add Semester
        </h3>
        <div className="row mt">
          <div className="col-lg-12">
            <div className="form-panel">
              <AddSemesterForm />
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
);

const INITIAL_STATE = {
  number: "",
  year: "",
  type: "",
  error: null,
  success: null,
};

class AddSemesterFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    event.preventDefault();
    // Test for valid semester number and year.
    if (this.state.number > 2 || this.state.number <= 0) {
      this.setState({ error: "Your semester number must be either 1 or 2." });
      return;
    } else if (this.state.year < new Date().getFullYear()) {
      this.setState({
        error: `You may only create semesters for ${new Date().getFullYear()} and beyond.`,
      });
      return;
    }
    const semesterData = {
      number: parseInt(this.state.number),
      year: parseInt(this.state.year),
      type: this.state.type.toUpperCase(),
    };

    console.log("Semester data:", semesterData);

    // Verify for potential duplicate before adding the entry to the database
    this.props.firebase
      .verifySemester(semesterData.number, semesterData.year, semesterData.type)
      .then((res) => {
        if (!res.empty) {
          console.log("This semester already exists.", res);
          this.setState({
            error: `Semester ${semesterData.number}, ${semesterData.year} (${semesterData.type}) already exists in the database.`,
            success: null,
          });
        } else {
          console.log("No duplicate:", res);
          this.props.firebase
            .addData("semesters", semesterData)
            .then((res) => {
              console.log("Response from Semester:", res);
              this.setState({
                number: "",
                year: "",
                type: "",
                error: null,
                success: true,
              });
              // this.props.history.push(ROUTES.DASHBOARD);
            })
            .catch((err) => {
              this.setState({ error: "Something went wrong. Please retry." });
            });
        }
      })
      .catch((error) => {
        this.setState({ error });
      });
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  updateType = (event) => {
    this.setState({ type: event.target.value });
    // console.log(event.target.value);
  };

  render() {
    const { number, year, type, error, success } = this.state;

    const isInvalid = number === "" || year === "" || type === "";

    return (
      <form
        onSubmit={this.onSubmit}
        className="form-horizontal style-form"
        autoComplete="off"
      >
        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">
            Semester Number
          </label>
          <div className="col-sm-10">
            <input
              name="number"
              value={number}
              onChange={this.onChange}
              type="number"
              max="2"
              placeholder="E.g. 1 or 2"
              className="form-control"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">
            Semester Year
          </label>
          <div className="col-sm-10">
            <input
              name="year"
              value={year}
              onChange={this.onChange}
              type="number"
              min="2019"
              placeholder="E.g. 2021"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">
            Semester Type
          </label>
          <div className="col-sm-10">
            <select
              className="form-control"
              name="role"
              onChange={this.updateType}
              value={this.state.type}
            >
              <option value="">Select a type</option>
              <option value="Regular">Regular</option>
              <option value="Summer">Summer Term</option>
              <option value="Winter">Winter Term</option>
            </select>
          </div>
        </div>
        <button disabled={isInvalid} type="submit" className="btn btn-theme">
          Add Semester
        </button>
        <div className="form-group has-error">
          <div className="col-lg-10">
            {error && <div className="alert alert-danger mt">{error}</div>}
            {success && (
              <div className="alert alert-success mt">
                <span>Semester created successfully.</span>
              </div>
            )}
          </div>
        </div>
      </form>
    );
  }
}

// console.log("Semester component: ", authUser.role);

const condition = (authUser) => authUser && authUser.role == "Tutor";

export default compose(withAuthorization(condition))(AddSemesterPage);

const AddSemesterForm = compose(withFirebase)(AddSemesterFormBase);

export { AddSemesterForm };
