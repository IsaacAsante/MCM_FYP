import { auth } from "firebase";
import React from "react";
import { withFirebase } from "../Firebase";

import { withAuthorization } from "../Session";

const INITIAL_STATE = {
  unitOfferings: [],
  error: null,
};

class FindOfferingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  // Function to sort the list of unit offerings by unit code
  compare = (a, b) => {
    if (a.unit.unitCode < b.unit.unitCode) {
      return -1;
    }
    if (a.unitCode > b.unitCode) {
      return 1;
    }
    return 0;
  };

  componentDidMount() {
    // Get all offerings
    this.props.firebase
      .getAllDocsInCollection("unitofferings")
      .then((offerings) => {
        let offeringsArray = [];
        if (offerings.length > 0) {
          offerings.forEach((doc) => {
            console.log("Unit Offering doc:", doc);
            let unitObj = {
              unit: null,
              semester: null,
            };
            // Get the corresponding semesters
            this.props.firebase
              .findSemester(doc.semesterID)
              .then((semester) => {
                unitObj.semester = semester;
                return unitObj;
              })
              .then((unitObj) => {
                this.props.firebase
                  .findUnit(doc.unitID)
                  .then((unit) => {
                    unitObj.unit = unit;
                    return unitObj;
                  })
                  .then((unitObj) => {
                    offeringsArray = offeringsArray.concat(unitObj);
                    // Sort the array
                    offeringsArray.sort(this.compare);
                    this.setState({ unitOfferings: offeringsArray });
                    console.log("Updated state:", this.state.unitOfferings);
                  });
              })
              .catch((err) => console.error(err));
          });
        }
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  }

  render() {
    return (
      <div>
        <section id="main-content">
          <section className="wrapper">
            <div class="row">
              <div class="col-md-12">
                <h3>
                  <i class="fa fa-angle-right" aria-hidden="true"></i> Active
                  Unit Offerings
                </h3>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <section class="task-panel tasks-widget">
                  <div class="panel-heading">
                    <div class="pull-left">
                      <p class="mt">
                        Allocate yourself to any of the unit offerings listed
                        below.
                      </p>
                    </div>
                    <br />
                  </div>
                  <div class="panel-body mt">
                    <div class="task-content">
                      <ul class="task-list">
                        {this.state.unitOfferings.length > 0
                          ? this.state.unitOfferings.map((doc) => (
                              <li>
                                <i class="fa fa-graduation-cap icon"></i>
                                <div class="task-title">
                                  <span class="task-title-sp">
                                    <strong>{doc.unit.unitCode}</strong>{" "}
                                    {doc.unit.name} - Semester{" "}
                                    {doc.semester.number}, {doc.semester.year} (
                                    {doc.semester.type})
                                  </span>
                                  {/* <span class="badge bg-important">Allocated</span> */}
                                </div>
                              </li>
                            ))
                          : " "}
                      </ul>
                    </div>
                    {/* <div class=" add-task-row mb">
                      <a
                        class="btn btn-success btn-sm pull-left"
                        href="todo_list.html#"
                      >
                        Add New Tasks
                      </a>
                      <a
                        class="btn btn-default btn-sm pull-right"
                        href="todo_list.html#"
                      >
                        See All Tasks
                      </a>
                    </div> */}
                  </div>
                </section>
              </div>
            </div>
          </section>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(FindOfferingPage);
