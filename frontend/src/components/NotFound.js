import React, { Fragment } from "react";
import Navbar from './navigation/Navbar'

export default function NotFound() {
  document.body.classList.remove('stripe-from-right');
  document.body.classList.add('stripe-from-left');
  return (
    <Fragment>
      <Navbar />
      <div className="w-5/7 justify-center my-10 m-auto px-8 py-4 flex flex-grow flex-wrap-reverse rounded shadow-lg bg-white inline-block">
        <h3 className="flex justify-center items-center">Sorry, page not found!</h3>
      </div>
    </Fragment>
  );
}
