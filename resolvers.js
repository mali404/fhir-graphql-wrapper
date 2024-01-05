const { ApolloError } = require('apollo-server-express')
const resolvers = {
    Query: {
        patients: (_, __, { dataSources }) => {
        return dataSources.patientAPI.getPatients();
        },

        patient: async (_, { id }, { dataSources }) => {
        try {
            const patient = await dataSources.patientAPI.getPatient(id);
            return dataSources.patientAPI.patientReducer(patient);
        } catch (error) {
            console.error(error);
            throw new ApolloError("Failed to fetch patient");
        }
        },

        encounters: (_, __, { dataSources }) => {
            return dataSources.encounterAPI.getEncounters();
            },

        encounter: async (_, { id }, { dataSources }) => {
            try {
                const encounter = await dataSources.encounterAPI.getEncounter(id);
                return encounter;
                //console.log(encounter);
                //return dataSources.encounterAPI.encounterReducer(encounter);
            } catch (error) {
                console.error(error);
                throw new ApolloError("Failed to fetch encounter");
            }
            },
            
        practitioners: (_, __, { dataSources }) => {
            return dataSources.practitionerAPI.getPractitioners();
            },
        
        practitioner: async (_, { id }, { dataSources }) => {
            try {
                const practitioner = await dataSources.practitionerAPI.getPractitioner(id);
                return practitioner;
            } catch (error) {
                console.error(error);
                throw new ApolloError("Failed to fetch practitioner");
            }
            },

        organizations: (_, __, { dataSources }) => {
            return dataSources.organizationAPI.getOrganizations();
            
        },
            
        organization: async (_, { id }, { dataSources }) => {
            try {
                const organization = await dataSources.organizationAPI.getOrganization(id);
                return organization;
            } catch (error) {
                console.error(error);
                throw new ApolloError("Failed to fetch organization");
            }
        },
    },

    Patient: {
      name: (patient) => patient.name,
      telecom: (patient) => patient.telecom,
    },

    Encounter: {
        resourceType: (parent) => parent.resourceType,
        id: (parent) => parent.id,
        meta: (parent) => parent.meta,
        status: (parent) => parent.status,
        class: (parent) => parent.class,
        type: (parent) => parent.type,
        subject: (parent) => parent.subject,
        period: (parent) => parent.period,
        participant: (parent) => parent.participant,
        serviceProvider: (parent) => parent.serviceProvider,
    },
    
    Practitioner: {
        resourceType: (parent) => parent.resourceType,
        id: (parent) => parent.id,
        meta: (parent) => parent.meta,
        identifier: (parent) => parent.identifier,
        active: (parent) => parent.active,
        name: (parent) => parent.name,
        address: (parent) => parent.address,
        gender: (parent) => parent.gender,
    },

    Organization: {
        resourceType: (parent) => parent.resourceType,
        id: (parent) => parent.id,
        meta: (parent) => parent.meta,
        identifier: (parent) => parent.identifier,
        active: (parent) => parent.active,
        type: (parent) => parent.type,
        name: (parent) => parent.name,
        telecom: (parent) => parent.telecom,
        address: (parent) => parent.address,
      },
};

module.exports = resolvers;