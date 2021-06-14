import React from "react";
import { withFirebase } from "../Firebase";
import { withAuthorization } from "../Session";

import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";

const INITIAL_STATE = {};
class ViolationPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    // Recognize current user
    this.props.firebase.onAuthUserListener((authUser) => {
      // console.log("Dashboard current user:", authUser);
      this.setState({ authUser });
    });
  }

  onClick = (offeringID) => {
    // console.log(offeringID);
    this.props.history.push(`/unit-offerings/${offeringID}`);
  };

  //   findUnitOffering = () => {
  //     this.props.history.push(ROUTES.FIND_UNIT_OFFERING);
  //   };

  render() {
    const { empty, warning } = this.state;
    return (
      <div>
        <section id="main-content">
          <section className="wrapper site-min-height">
            <h3>
              <i class="fa fa-bullhorn"></i> Latest Violations
            </h3>
            <div className="row mt">
              <div className="col-md-12">
                <table class="table table-striped table-advance table-hover">
                  <thead>
                    <tr>
                      <th>
                        <i class="fa fa-user"></i> User
                      </th>
                      <th class="hidden-phone">
                        <i class="fa fa-map"></i> From
                      </th>
                      <th>
                        <i class="fa fa-clock-o"></i> Time
                      </th>
                      <th>
                        <i class="fa fa-calendar"></i> Date
                      </th>
                      <th>
                        <i class=" fa fa-location-arrow"></i> Distance
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <a href="basic_table.html#">John Smith</a>
                      </td>
                      <td class="hidden-phone">Kuching, Sarawak</td>
                      <td>18:10:23</td>
                      <td>19/07/2021</td>
                      <td>
                        <span class="label label-danger label-mini">803m</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <a href="basic_table.html#">Zoe Stallone</a>
                      </td>
                      <td class="hidden-phone">Kuching, Sarawak</td>
                      <td>15:52:19</td>
                      <td>19/07/2021</td>
                      <td>
                        <span class="label label-warning label-mini">304m</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <a href="basic_table.html#">Mathilda Lee</a>
                      </td>
                      <td class="hidden-phone">Kuching, Sarawak</td>
                      <td>10:02:27</td>
                      <td>18/07/2021</td>
                      <td>
                        <span class="label label-danger label-mini">2340m</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <a href="basic_table.html#">Anthony Sim</a>
                      </td>
                      <td class="hidden-phone">Kuching, Sarawak</td>
                      <td>23:34:42</td>
                      <td>17/07/2021</td>
                      <td>
                        <span class="label label-warning label-mini">286m</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <a href="basic_table.html#">John Durant</a>
                      </td>
                      <td class="hidden-phone">Miri, Sarawak</td>
                      <td>13:04:19</td>
                      <td>17/07/2021</td>
                      <td>
                        <span class="label label-warning label-mini">185m</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* content-panel */}
              </div>
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

export default withAuthorization(condition)(ViolationPage);
