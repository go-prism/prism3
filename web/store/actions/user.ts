import {ApolloError} from "@apollo/client";
import {StoredUser} from "../../src/generated/graphql";

export const SET_USER = "SET_USER";
export const SET_USER_ERROR = "SET_USER_ERROR";

export interface SetCurrentUserActionType {
	type: typeof SET_USER;
	payload: StoredUser;
}

export interface SetUserErrorActionType {
	type: typeof SET_USER_ERROR;
	payload: ApolloError | null;
}



export const setCurrentUser = (user: StoredUser): SetCurrentUserActionType => {
	return {
		type: SET_USER,
		payload: user
	}
}

export const setUserError = (error: ApolloError | null): SetUserErrorActionType => {
	return {
		type: SET_USER_ERROR,
		payload: error
	}
}

export type UserActionType =
	SetCurrentUserActionType |
	SetUserErrorActionType;
