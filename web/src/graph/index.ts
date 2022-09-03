/*
 *    Copyright 2022 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

import {ApolloClient, InMemoryCache} from "@apollo/client";
import {GraphQLWsLink} from "@apollo/client/link/subscriptions";
import {createClient} from "graphql-ws";
import {API_URL} from "../config";

const Client = new ApolloClient({
	link: new GraphQLWsLink(createClient({
		url: `${API_URL.replace("http", "ws")}/api/query`,
		lazyCloseTimeout: 60_000,
	})),
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			fetchPolicy: "no-cache",
		},
		query: {
			fetchPolicy: "no-cache"
		}
	}
});
export default Client;
