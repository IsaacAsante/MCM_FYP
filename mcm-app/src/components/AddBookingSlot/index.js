import { auth } from "firebase";
import React from "react";
import { withFirebase } from "../Firebase";
import { withAuthorization } from "../Session";

import * as ROUTES from "../../constants/routes";
import AddBookingSlotForm from "../AddBookingSlot/form";

const INITIAL_STATE = {
  allocated: false,
  allocateMessage: "Allocate Yourself",
  authUser: null,
  offeringID: null,
  semester: null,
  semesterError: null,
  unit: null,
  unitError: null,
};

class AddNewBookingSlotPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    const offeringID = this.props.match.params.offeringID;
    this.setState({ offeringID });
    console.log(offeringID);

    // Recognize current user
    this.props.firebase.onAuthUserListener((authUser) => {
      this.setState({ authUser });
      // Determine if a Tutor is already allocated to the unit offering currently being viewed, or not.
      this.props.firebase.findAllocation(authUser.uid).then((res) => {
        if (res) {
          console.log("Response to debug:", res);
          if (res.unitOfferings.includes(offeringID)) {
            this.setState({ allocated: true, allocateMessage: "Allocated" });
          }
        }
      });
    });

    // Get the offering's unit
    this.props.firebase
      .getUnitOffering(offeringID)
      .then((result) => {
        if (result !== undefined) {
          // console.log("Result:", result);
          // console.log(result.unitID, result.semesterID);
          this.props.firebase
            .findUnit(result.unitID)
            .then((unit) => {
              console.log("Unit loaded:", unit);
              this.setState({ unit });
              this.setState({ unitError: "" });
            })
            .catch((err) =>
              this.setState({
                unitError:
                  "There was an error fetching the unit data for this unit offering.",
              })
            );

          // Get the offering's semester
          this.props.firebase
            .findSemester(result.semesterID)
            .then((semester) => {
              // console.log("Semester loaded:", semester);
              this.setState({ semester });
              this.setState({ semesterError: "" });
            })
            .catch((err) => {
              this.setState({
                semesterError:
                  "There was an error fetching the semester data for this unit offering.",
              });
            });
          console.log(this.state);
        } else {
          this.setState({
            semesterError: "Invalid semester.",
            unitError: "Invalid unit.",
          });
        }
      })
      .catch((err) => console.error(err));
  }

  render() {
    const {
      allocated,
      allocateMessage,
      authUser,
      semester,
      semesterError,
      unit,
      unitError,
    } = this.state;
    const invalid =
      semesterError ==
        "There was an error fetching the unit data for this unit offering." ||
      semesterError == "Invalid semester." ||
      unitError ==
        "There was an error fetching the unit data for this unit offering." ||
      unitError == "Invalid unit.";
    return (
      <div>
        <section id="main-content">
          <section className="wrapper">
            <div className="row">
              <div className="col-sm-12">
                {/* If valid - Show headings */}
                <h2>
                  {invalid ? " " : <i className="fa fa-angle-right"></i>}
                  {unit && ` ${unit.unitCode} ${unit.name}`}
                </h2>{" "}
                <h3>
                  {invalid ? " " : <i className="fa fa-angle-right"></i>}
                  {semester &&
                    ` Semester ${semester.number} - ${semester.year} (${semester.type})`}
                </h3>
                <span className="label label-danger">
                  {allocated && allocateMessage}
                </span>
                {/* If invalid - Show the error messages*/}
                {invalid ? <h2>{invalid && "Invalid Unit Offering"}</h2> : " "}
                {invalid ? <hr /> : " "}
                <h3 className="text-danger">{semesterError}</h3>
                <h3 className="text-danger">{unitError}</h3>
                {invalid ? <hr /> : " "}
                {invalid ? (
                  <p>
                    <strong>
                      Please ensure this unit offering is available in the
                      database.
                    </strong>
                  </p>
                ) : (
                  " "
                )}
              </div>
            </div>
            <AddBookingSlotForm unitoffering={this.state.offeringID} />
          </section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => authUser && authUser.role == "Tutor";

export default withAuthorization(condition)(AddNewBookingSlotPage);
