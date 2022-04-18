import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import {BrowserRouter} from "react-router-dom";
import {ApolloProvider} from "@apollo/client";
import {AppProvider} from "../store/AppProvider";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "typeface-roboto";
import Client from "./graph";

ReactDOM.render(
	<React.StrictMode>
		<AppProvider>
			<BrowserRouter>
				<ApolloProvider client={Client}>
					<App/>
				</ApolloProvider>
			</BrowserRouter>
		</AppProvider>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
