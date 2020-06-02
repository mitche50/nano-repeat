import React from "react";
import { Route, Switch } from "react-router-dom"
import Splash from '../Splash'
import SignUp from "../SignUp"
import NotFound from '../NotFound'
import Login from '../Login'
import PrivacyPolicy from '../policies/PrivacyPolicy'
import TermsAndConditions from '../policies/TermsAndConditions'
import Dashboard from '../Dashboard'
import SignOut from '../util/SignOut'
import EmailConfirm from '../EmailConfirm'
import ChangePassword from "../ChangePassword"
import ForgotPassword from "../ForgotPassword"
import Subscriptions from "../Subscriptions"
import Payments from "../Payments"
import Account from "../Account"
import Docs from "../Docs"

export default function Routes() {
  return (
    <Switch>
        <Route exact path="/signup" component={SignUp} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/terms" component={TermsAndConditions} />
        <Route exact path="/privacy" component={PrivacyPolicy} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/signout" component={SignOut} />
        <Route exact path="/subscriptions" component={Subscriptions} />
        <Route exact path="/payments" component={Payments} />
        <Route exact path="/account" component={Account} />
        <Route path="/confirm/:token" component={EmailConfirm} />
        <Route exact path="/forgotpassword" component={ForgotPassword} />
        <Route path="/changepw/:token" component={ChangePassword} />
        <Route exact path="/docs" component={Docs} />
        <Route exact path="/" component={Splash} />
        <Route>
            <NotFound />
        </Route>
    </Switch>
  );
}
