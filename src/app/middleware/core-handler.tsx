import { UserAuth } from "./user-auth";
import { Action } from "./actions";

export const ExecuteCore = (action: Action) => {
  if (action.type === "LOGIN") {
    UserAuth.login();
  }
  if (action.type === "LOGOUT") {
    UserAuth.logout();
  }
  if (action.type === "REGISTER") {
    UserAuth.register(
      action.payload.email,
      action.payload.password,
      action.payload.username
    );
  }
};
