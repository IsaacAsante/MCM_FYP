import React from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";

import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";

// Higher-order component for authorization
const withAuthorization = (condition) => (Component) => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      this.listener = this.props.firebase.auth.onAuthStateChanged(
        (authUser) => {
          if (authUser) {
            console.log("Auth User:", authUser);
            this.props.firebase.getStudent(authUser.uid).then((res) => {
              if (res != undefined || res != "undefined") {
                console.log("Current user:", res);
                const dbUser = res;
                authUser = {
                  uid: authUser.uid,
                  email: authUser.email,
                  ...dbUser,
                };
              } else {
                console.log("User not retrieve");
              }
            });
          }
        }
      );
    }

    componentWillUnmount() {
      this.listener();
    }
    render() {
      return (
        <AuthUserContext.Consumer>
          {(authUser) =>
            condition(authUser) ? <Component {...this.props} /> : null
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return compose(withRouter, withFirebase)(WithAuthorization);
};

export default withAuthorization;
