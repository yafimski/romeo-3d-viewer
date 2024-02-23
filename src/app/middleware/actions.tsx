export type ActionType = "LOGIN" | "LOGOUT" | "UPDATE_USER" | "REGISTER";

export interface Action {
  type: ActionType;
  payload?: any;
}
