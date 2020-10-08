import React from "react";

import { PasswordResetForm } from "../PasswordReset";
import { PasswordUpdateForm } from "../PasswordUpdate";
import { withAuthorization, AuthUserContext } from "../Session";

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {(authUser) => (
      <div>
        <section id="main-content">
          <section className="wrapper">
            <h1>
              <i className="fa fa-angle-right"></i> Your Account
            </h1>
            <div className="row mt">
              <div className="col-lg-12">
                <div className="form-panel">
                  <h3>Update Password</h3>
                  <hr />
                  <PasswordUpdateForm />
                  <h3>Reset Password</h3>
                  <hr />
                  <PasswordResetForm />
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(AccountPage);
