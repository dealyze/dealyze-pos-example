import io from "socket.io-client";

// Customer represents all of the customers data on the dealyze platform
interface Customer {
  firstName: String;
  lastName: String;
  phoneNumber: String;
  emailAddress: String;
  birthdayAt: String;
}

// Employee represents all of the employee data on the dealyze platform
interface Employee {
  firstName: String;
  lastName: String;
  emailAddress: String;
  code: String;
}

console.log("searching for dealyze...");

const socket = io("ws://localhost:3100");

// connect occurs when we successfully esablish a connection to dealyze
socket.on("connect", () => {
  console.log("connected");

  // simulate an employee and customer sync:
  // 1. if an employee with the passed in employee.code is not created yet,
  //    their account will be created. if their account is created they will
  //    be signed in
  // 2. if a customer with the passed in cusomter.phoneNumber is not signed
  //    up yet, they will be prompted to sign up, otherwise they will be
  //    signed in
  setTimeout(
    () =>
      socket.emit("customer", {
        employee: {
          code: "136590",
          firstName: "Mark",
          lastName: "Salpeter",
          emailAddress: "mark@dealyze.com"
        }
      }),
    100
  );
});

// disconnect occurs when dealyze shuts down or restarts
socket.on("disconnect", reason => {
  console.log("disconnected", reason);

  // the disconnection was initiated by the server, you need to reconnect manually
  if (reason === "io server disconnect") {
    socket.connect();
  }
});

// error occurs whenever there is a connection error or a problem with
// an emited event in the api
socket.on("error", error => {
  console.error("error:", error);
});

// customer occurs when a cusomer has signed in
socket.on("customer", (customer: Customer) => {
  console.log("customer:", customer);
});

// order occurs when a redemption or a reward is taking place
// in the future order may also be called during the redemption of a promotion
socket.on("order", order => {
  console.log("order:", order);
});
