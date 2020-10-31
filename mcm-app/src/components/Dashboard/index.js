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
          <section class="wrapper site-min-height">
            <h3>
              <i class="fa fa-angle-right"></i> Dashboard - Allocated Unit
              Offerings
            </h3>
            <div class="row mt">
              <div class="col-md-4 col-sm-4 mb">
                <div class="grey-panel">
                  <div class="grey-header mb-0">
                    <h5>SERVER LOAD</h5>
                  </div>
                </div>
                <div class="weather pn">
                  <i class="fa fa-graduation-cap fa-4x"></i>
                  <h3>COS10009 Introduction to Programming </h3>
                  {/* <h4>Optional</h4> */}
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(DashboardPage);
