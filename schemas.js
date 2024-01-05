const { gql } = require('apollo-server-express')

const typeDefs = gql`
  type Patient {
    resourceType: String!
    id: ID!
    name: [Name!]
    gender: String,
    birthDate: String,
    telecom: [TelecomH!]!
    address: [Address!]
    encounter: [Encounter!]
  }

  type Name {
    family: String!
    given: [String!]!
    prefix: [String!]
  }

  type TelecomH {
    system: String!
    value: String!
    use: String!
  }

  type Address {
    line: String
    city: String
    state: String
    postalCode: String
    country: String
  }

  type Encounter {
    resourceType: String!
    id: ID!
    meta: Meta!
    status: String!
    class: Class!
    type: [Type!]!
    subject: Patient!
    participant: [Participant!]!
    period: Period!
    serviceProvider: Organization!
  }

  type Meta {
    versionId: ID!
    lastUpdated: String!
    source: String!
    tag: [Tag!]!
  }

  type Tag {
    system: String!
    code: String!
  }

  type Class {
    system: String!
    code: String!
  }

  type Type {
    coding: [Coding!]!
    text: String!
  }

  type Coding {
    system: String!
    code: String!
    display: String!
  }

  type Subject {
    reference: String!
  }

  type Participant {
    individual: Practitioner!
  }

  type Period {
    start: String!
    end: String!
  }

  type Practitioner {
    resourceType: String!
    id: ID!
    meta: Meta!
    identifier: [Identifier!]!
    active: Boolean!
    name: [Name!]!
    address: [Address!]!
    gender: String!
  }
  
  type Identifier {
    system: String!
    value: String!
  }

  type Organization {
    resourceType: String!
    id: ID!
    meta: Meta!
    identifier: [Identifier!]!
    active: Boolean!
    type: [Type!]!
    name: String!
    telecom: [Telecom!]!
    address: [Address!]!
  }
  
  type Telecom {
    system: String!
    value: String!
  }

  type Query {
    patients: [Patient]
    patient(id: ID!): Patient
    encounters: [Encounter]
    encounter(id: ID!): Encounter
    practitioners: [Practitioner]
    practitioner(id: ID!): Practitioner
    organizations: [Organization]
    organization(id: ID!): Organization
  }
`
  module.exports = typeDefs