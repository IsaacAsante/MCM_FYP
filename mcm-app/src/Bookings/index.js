import React from "react";
import { withAuthorization } from "../Session";

import * as ROLES from "../../constants/roles";

const INITIAL_STATE = {
  authUser: null,
  booking: null,
  bookingType: "None",
  error: null,
  offeringID: null,
  slot: null,
  slotError: null,
  slotID: null,
  unit: null,
  unitError: null,
  userRole: null,
};

const DAYS = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

class BookingsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    // Recognize current user
    this.props.firebase.onAuthUserListener((authUser) => {
      this.setState({ authUser });

      // Verify the privileges of the currently logged-in user to hide the 'Create Booking Slot' button
      // Easy trick is to verify if the email address contains 'students'.
      if (authUser.email.search("students") == -1) {
        this.setState({ userRole: ROLES.TUTOR });
      } else {
        this.setState({ userRole: ROLES.STUDENT });
      }
    });
  }

  onSelect = (event) => {
    this.setState({ bookingType: event.target.value });
  };

  onSubmit = (event) => {
    event.preventDefault();
    console.log(this.state);
  };

  convertDate = (dateValue) => {
    let date = new Date(dateValue * 1000); // Firestore will return the seconds instead of milliseconds
    return `${DAYS[date.getDay()]}, ${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
  };

  render() {
    const { booking, bookingType, error, userRole } = this.state;
    const invalid = bookingType == "None";
    return (
      <div>
        <section id="main-content">
          <section className="wrapper"></section>
          <form
            onSubmit={this.onSubmit}
            className="form-horizontal style-form"
            autoComplete="false"
          >
            <div className="form-group">
              <label className="col-sm-2 col-sm-2 control-label">
                Booking Type:
              </label>
              <div className="col-sm-10">
                <select
                  className="form-control"
                  name="bookingType"
                  onChange={this.updateType}
                  value={this.state.bookingType}
                >
                  <option value="None">--</option>
                  <option value="Tutor">Approved</option>
                  <option value="Student">To Review</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-theme"
              disabled={invalid}
              onClick={this.onSubmit}
            >
              View Bookings
            </button>
          </form>
        </section>
      </div>
    );
  }
}

const condition = (authUser) => authUser;

export default withAuthorization(condition)(BookingsPage);
