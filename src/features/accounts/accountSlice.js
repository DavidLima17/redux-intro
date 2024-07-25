import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

const HOST = "api.frankfurter.app";

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    deposit(state, action) {
      // state.balance = state.balance + action.payload;
      state.balance += action.payload;
      state.isLoading = false;
    },
    withdraw(state, action) {
      // state.balance = state.balance - action.payload;
      state.balance -= action.payload;
    },
    requestLoan: {
      // needed if you want to recieve more than one argument
      prepare(amount, purpose) {
        return {
          payload: {
            amount,
            purpose,
          },
        };
      },
      reducer(state, action) {
        if (state.loan > 0) return;
        state.loan = action.payload.amount;
        state.loanPurpose = action.payload.purp;
        state.balance = state.balance + action.payload.amount;
      },
      payLoan(state) {
        // bugged code since we mutated the loan prematurely
        // state.loan = 0;
        // state.loanPurpose = "";
        // state.balance -= state.loan;

        // order of code matters since we are mutating
        state.balance -= state.loan;
        state.loan = 0;
        state.loanPurpose = "";
      },
      convertingCurrency(state) {
        state.isLoading = true;
      },
    },
  },
});

console.log(accountSlice);

export const { withdraw, requestLoan, payLoan } = accountSlice.actions;

// not the react toolkit way but using a custom way
export function deposit(amount, currency) {
  if (currency === "USD") {
    return { type: "account/deposit", payload: amount };
  }
  return async function (dispatch, getState) {
    // API call
    dispatch({ type: "account/convertingCurrency" });
    const res = await fetch(
      `https://${HOST}/latest?amount=${amount}&from=${currency}&to=USD`
    );
    const data = await res.json();
    const converted = data.rates.USD;
    dispatch({ type: "account/deposit", payload: converted });

    //return action
  };
}
export default accountSlice.reducer;
// export default function accountReducer(state = initialState, action) {
//   switch (action.type) {
//     case "account/deposit":
//       return {
//         ...state,
//         balance: state.balance + action.payload,
//         isLoading: false,
//       };
//     case "account/withdraw":
//       return {
//         ...state,
//         balance: state.balance - action.payload,
//       };
//     case "account/requestLoan":
//       if (state.loan > 0) return state;
//       return {
//         ...state,
//         // LATER
//         loan: action.payload.amount,
//         loanPurpose: action.payload.purpose,
//         balance: state.balance + action.payload.amount,
//       };
//     case "account/payLoan":
//       return {
//         ...state,
//         loan: 0,
//         loanPurpose: "",
//         balance: state.balance - state.loan,
//       };
//     case "account/convertingCurrency":
//       return {
//         ...state,
//         isLoading: true,
//       };
//     default:
//       return state;
//   }
// }

// export function deposit(amount, currency) {
//   if (currency === "USD") {
//     return { type: "account/deposit", payload: amount };
//   }
//   return async function (dispatch, getState) {
//     // API call
//     dispatch({ type: "account/convertingCurrency" });
//     const res = await fetch(
//       `https://${HOST}/latest?amount=${amount}&from=${currency}&to=USD`
//     );
//     const data = await res.json();
//     const converted = data.rates.USD;
//     dispatch({ type: "account/deposit", payload: converted });

//     //return action
//   };
// }
// export function withdraw(amount) {
//   return { type: "account/withdraw", payload: amount };
// }
// export function requestLoan(amount, purpose) {
//   return {
//     type: "account/requestLoan",
//     payload: { amount, purpose },
//   };
// }
// export function payLoan() {
//   return { type: "account/payLoan" };
// }
