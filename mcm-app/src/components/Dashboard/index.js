import React from "react";
import { withFirebase } from "../Firebase";
import { withAuthorization } from "../Session";

import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";

const INITIAL_STATE = {
  authUser: null,
  empty: false,
  unitOfferings: [],
  warning: false,
};
class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    // Recognize current user
    this.props.firebase.onAuthUserListener((authUser) => {
      console.log("Dashboard current user:", authUser);
      this.setState({ authUser });
      if (authUser.role === ROLES.TUTOR) {
        // Determine if a Tutor is already allocated to the unit offering currently being viewed, or not.
        this.props.firebase.findAllocation(authUser.uid).then((allocations) => {
          if (allocations) {
            this.setState({ warning: false });
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
            } else {
              this.setState({
                empty: true,
              });
            }
          } else {
            this.setState({
              empty: true,
              warning: true,
            });
          }
        });
      } else if (authUser.role === ROLES.STUDENT) {
        this.props.firebase
          .findEnrolment(authUser.studentID)
          .then((enrolment) => {
            if (enrolment) {
              this.setState({ warning: false });
              if (enrolment.unitOfferings.length > 0) {
                let offerings = [];
                enrolment.unitOfferings.forEach((offeringID) => {
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
              } else {
                this.setState({
                  empty: true,
                });
              }
              console.log("Student enrolment found:", enrolment);
            }
          });
      }
    });
  }

  onClick = (offeringID) => {
    console.log(offeringID);
    this.props.history.push(`/unit-offerings/${offeringID}`);
  };

  findUnitOffering = () => {
    this.props.history.push(ROUTES.FIND_UNIT_OFFERING);
  };

  render() {
    const { empty, warning } = this.state;
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
                    <Card key={doc.id} offering={doc} redirect={this.onClick} />
                  ))
                : " "}
            </div>
            {empty ? (
              <div>
                <div className="alert alert-warning">
                  {warning ? (
                    <span>
                      <b>You are not allocated to any active unit offering.</b>{" "}
                      To pick unit offerings in which you are a tutor, click on
                      the button below.
                    </span>
                  ) : (
                    <span>
                      <b>
                        Oops, your list of unit allocations in the system is
                        empty.
                      </b>{" "}
                      To pick unit offerings in which you are a tutor, click on
                      the button below.
                    </span>
                  )}
                </div>
                <p>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={this.findUnitOffering}
                  >
                    Allocate Yourself
                  </button>
                </p>
              </div>
            ) : (
              ""
            )}
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

  click = () => {
    this.props.redirect(this.props.offering.id);
  };

  render() {
    return (
      <div className="col-md-4 col-sm-4 mb" onClick={this.click}>
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
