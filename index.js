const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')

require('dotenv').config()

const typeDefs = require('./schemas.js')
const resolvers = require('./resolvers.js')
const { PatientAPI, EncounterAPI, PractitionerAPI, OrganizationAPI } = require('./resolver_methods.js')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    patientAPI: new PatientAPI(),
    encounterAPI: new EncounterAPI(),
    practitionerAPI: new PractitionerAPI(), 
    organizationAPI: new OrganizationAPI(),
  }),
});

const app = express();

server.applyMiddleware({ app });

const port = 4000;

app.listen({ port }, () => {
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
});