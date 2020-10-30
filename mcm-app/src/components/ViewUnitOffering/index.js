import React from "react";
import { withFirebase } from "../Firebase";

import { withAuthorization } from "../Session";

const INITIAL_STATE = {
  unit: null,
  semester: null,
  semesterError: null,
  unitError: null,
};

class UnitOfferingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    const { offeringID } = this.props.match.params;
    console.log(offeringID);

    // Get a single unit
    this.props.firebase
      .getUnitOffering(offeringID)
      .then((result) => {
        if (result !== undefined) {
          console.log("Result:", result);
          console.log(result.unitID, result.semesterID);
          this.props.firebase
            .findUnit(result.unitID)
            .then((unit) => {
              console.log("Unit loaded:", unit);
              this.setState({ unit });
            })
            .catch((err) =>
              this.setState({
                unitError:
                  "There was an error fetching the unit data for this unit offering.",
              })
            );

          this.props.firebase
            .findSemester(result.semesterID)
            .then((semester) => {
              console.log("Semester loaded:", semester);
              this.setState({ semester });
            })
            .catch((err) => {
              this.setState({
                semesterError:
                  "There was an error fetching the semester data for this unit offering.",
              });
            });
        }
      })
      .catch((err) => console.error(err));

    // Get a semester
    //   const { semester } = this.props.match.params;
    //   console.log(semester);
    //   this.props.firebase
    //     .getSemester(semester)
    //     .then((result) => {
    //       console.log("Result:", result);
    //     })
    //     .catch((err) => console.error(err));
  }

  render() {
    return (
      <div>
        <section id="main-content">
          <section className="wrapper">
            <h1>Unit Offering component</h1>
          </section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(UnitOfferingPage);
