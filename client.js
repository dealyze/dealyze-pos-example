import io from "socket.io-client";
import readline from "readline";

// clear the screen
readline.cursorTo(process.stdout, 0, 0);
readline.clearScreenDown(process.stdout);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// initialize the socket
console.log("searching for dealyze...");
const socket = io("ws://localhost:3100/");

/**
 * employee is the current employee logged in in the register
 */
let employee = {
  id: 1234212321,
  username: "username"
};

// connect occurs when we successfully esablish a connection to dealyze
socket.on("connect", () => {
  console.log("connected");
});

socket.on("ready", () => {
  console.log("read received. sending employee");
  socket.emit("employee", { employee });
});

// disconnect occurs when dealyze shuts down or restarts
socket.on("disconnect", reason => {
  console.log("disconnected", reason);

  // the disconnection was initiated by the server, you need to reconnect manually
  if (reason === "io server disconnect") {
    socket.connect();
  }
});

// customer occurs when a cusomer has signed in or when there's an error
socket.on("customer", ({ customer, error }) => {
  if (error) {
    console.log("customer: ", error);
    return;
  }
  console.log(`customer signed in with number ${customer.phoneNumber}`);
  payBill(customer);
});

// order occurs when a redemption or a reward is taking place
// in the future order may also be called during the redemption of a promotion
socket.on("order", ({ order, error }) => {
  if (error) {
    console.log("order: ", error);
    return;
  }
  if (order.discounts.length > 0) {
    console.log(`order received with ${order.discounts[0].name}`);
    redeemReward(order);
  }
});

/**
 * confirmRedemption prompts the user to confirm the reward redemption
 */
const redeemReward = order =>
  !order
    ? console.log("customer did not ask to redeem a reward")
    : rl.question(
        `approve the redeemption of ${
          order.discounts[0].name
        }? [yes/no/cancel]: `,
        answer => {
          answer = answer.toLowerCase ? answer.toLowerCase() : answer;

          // return to the menu
          if (answer === "cancel") {
            return;
          }

          // to redeem the reward, add the relevant line items
          // and send it back to Dealyze
          if (answer === "yes") {
            order.items = [
              {
                name: order.discounts[0].name,
                skus: order.discounts[0].skus,
                price: 123456
              }
            ];
            order.total = 0;
            socket.emit("order", {
              order,
              employee
            });
            return console.log("approved redemption");
          }

          // to cancel the redemption remove the discount from the order
          // and send it back to Dealyze
          if (answer === "no") {
            delete order.discounts[0];
            socket.emit("order", {
              order,
              employee
            });
            return console.log("redemption canceled");
          }

          // bad input
          console.log("you must enter 'yes' or 'no'");
        }
      );

/**
 *payBill prompts the employee for a bill payment
 */
const payBill = async () =>
  rl.question("how many bills did the customer pay?: ", response => {
    if (response === "cancel") {
      return console.log(`bill payment cancelled`);
    }

    const count = parseInt(response);

    // bad input
    if (count < 1 || count === NaN) {
      console.log(`you must enter a number > 0`);
      return;
    }

    // send the bill payment order with the current employee information
    socket.emit("order", {
      employee,
      order: {
        items: [
          {
            name: "Bill Pay",
            skus: ["_BILLPAY_"], // TODO: get the real bill pay sku from RTPOS
            count
          }
        ]
      }
    });
    return console.log(`${count} bill${count > 1 ? "s" : ""} paid`);
  });
