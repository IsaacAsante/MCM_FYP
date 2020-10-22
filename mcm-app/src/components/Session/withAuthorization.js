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
            this.props.firebase
              .getStudent(authUser.uid)
              .then((res) => {
                if (res) {
                  const student = res;
                  authUser = {
                    uid: authUser.uid,
                    email: authUser.email,
                    ...student,
                  };
                  console.log("Current Student:", authUser);
                } else {
                  this.props.firebase
                    .getTutor(authUser.uid)
                    .then((ans) => {
                      if (ans) {
                        const tutor = ans;
                        authUser = {
                          uid: authUser.uid,
                          email: authUser.email,
                          ...tutor,
                        };
                        console.log("Current Tutor:", authUser);
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                }
              })
              .catch((error) => console.error(error));
          } else {
            this.props.history.push(ROUTES.SIGN_IN);
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
