import React from "react";
import { withFirebase } from "../Firebase";

import { withAuthorization } from "../Session";

const INITIAL_STATE = {
  authUser: null,
  unitOfferings: [],
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
                    semester: {},
                    unit: {},
                  };
                  // Get the semester data for every allocation instance
                  this.props.firebase
                    .findSemester(offeringDoc.semesterID)
                    .then((semesterData) => {
                      offeringDataObj.semester = semesterData;
                      return offeringDataObj;
                    })
                    .then((offeringDataObj) => {
                      // Get the semester data for every allocation instance
                      this.props.firebase
                        .findUnit(offeringDoc.unitID)
                        .then((unitData) => {
                          offeringDataObj.unit = unitData;
                          return offeringDataObj;
                        })
                        .then((offeringDataObj) => {
                          offerings = offerings.concat(offeringDataObj);
                          // console.log(offerings);
                          this.setState({ unitOfferings: offerings });
                        });
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                })
                .catch((err) => {
                  console.error(err);
                });
            });
          }
        }
      });
    });
  }

  componentDidUpdate() {
    console.log("Component update:", this.state);
  }

  render() {
    return (
      <div>
        <section id="main-content">
          <section className="wrapper site-min-height">
            <h3>
              <i className="fa fa-angle-right"></i> Dashboard - Allocated Unit
              Offerings
            </h3>
            <div className="row mt">
              {this.state.unitOfferings
                ? this.state.unitOfferings.map((doc) => (
                    <Card key={doc.id} offering={doc} />
                  ))
                : " "}
            </div>
          </section>
        </section>
      </div>
    );
  }
}

class Card extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="col-md-4 col-sm-4 mb">
        <div className="grey-panel">
          <div className="grey-header mb-0">
            <h5>{`Semester ${this.props.offering.semester.number} - ${this.props.offering.semester.year}`}</h5>
          </div>
        </div>
        <div className="weather pn">
          <i className="fa fa-graduation-cap fa-4x"></i>
          <h3>
            {`${this.props.offering.unit.unitCode} ${this.props.offering.unit.name}`}{" "}
          </h3>
          {/* <h4>Optional</h4> */}
        </div>
      </div>
    );
  }
}

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(DashboardPage);
