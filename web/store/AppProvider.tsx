import React, {createContext, Dispatch, useReducer} from "react";
import {ApolloError} from "@apollo/client";
import {StoredUser} from "../src/generated/graphql";
import {SET_USER, SET_USER_ERROR, UserActionType} from "./actions/user";

interface State {
	user: StoredUser | null;
	userError: ApolloError | null;
}

const initialState: State = {
	user: null,
	userError: null
};

type RootActionType = UserActionType;

const AppContext = createContext<{state: State, dispatch: Dispatch<RootActionType>}>({
	state: initialState,
	dispatch: () => null
});

const AppProvider: React.FC = ({children}): JSX.Element => {
	const {Provider} = AppContext;
	
	const [state, dispatch] = useReducer((state: State, action: RootActionType): State => {
		switch (action.type) {
			case SET_USER:
				return {...state, user: action.payload, userError: null};
			case SET_USER_ERROR:
				return {...state, userError: action.payload};
			default:
				return state;
		}
	}, initialState);
	
	return <Provider value={{state, dispatch}}>
		{children}
	</Provider>
}
export {
	AppContext,
	AppProvider
};
