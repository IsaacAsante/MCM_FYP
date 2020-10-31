import React from "react";
import { withFirebase } from "../Firebase";

import { withAuthorization } from "../Session";

const INITIAL_STATE = {
  authUser: null,
  unitOfferings: null,
};
class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    // Recognize current user
    this.props.firebase.onAuthUserListener((authUser) => {
      this.setState({ authUser });
      // Determine if a Tutor is already allocated to the unit offering currently being viewed, or not.
      this.props.firebase.findAllocation(authUser.uid).then((allocations) => {
        if (allocations) {
          if (allocations.unitOfferings.length > 0) {
            let offerings = [];
            allocations.unitOfferings.forEach((offeringID) => {
              this.props.firebase
                .getUnitOffering(offeringID)
                .then((offeringDoc) => {
                  let offeringDataObj = {
                    id: offeringDoc.id,
                    semester: null,
                    unit: null,
                  };
                  // Get the semester data for every allocation instance
                  this.props.firebase
                    .findSemester(offeringDoc.semesterID)
                    .then((semesterData) => {
                      offeringDataObj.semester = semesterData;
                    })
                    .catch((err) => {
                      console.error(err);
                    });

                  // Get the semester data for every allocation instance
                  this.props.firebase
                    .findUnit(offeringDoc.unitID)
                    .then((unitData) => {
                      offeringDataObj.unit = unitData;
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                  offerings.push(offeringDataObj);
                })
                .catch((err) => {
                  console.error(err);
                });
            });
            this.setState({ unitOfferings: offerings });
            console.log(this.state);
          }
        }
      });
    });
  }

  render() {
    return (
      <div>
        <section id="main-content">
          <section className="wrapper">
            <h1>Dashboard component</h1>
          </section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(DashboardPage);
