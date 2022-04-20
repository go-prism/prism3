import {ApolloClient, InMemoryCache} from "@apollo/client";
import {GraphQLWsLink} from "@apollo/client/link/subscriptions";
import {createClient} from "graphql-ws";
import {API_URL} from "../config";

const Client = new ApolloClient({
	link: new GraphQLWsLink(createClient({
		url: `${API_URL.replace("http", "ws")}/api/query`,
		lazyCloseTimeout: 60_000,
	})),
	cache: new InMemoryCache()
});
export default Client;
