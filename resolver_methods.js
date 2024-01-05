const axios = require('axios');
const { RESTDataSource } = require('apollo-datasource-rest');

class PatientAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://localhost:8080/hapi-fhir-jpaserver/fhir/';
  }
m
  async getPatients() {
    const response = await this.get('Patient');
    return Array.isArray(response.data.entry) ? response.data.entry.map(Patient => this.patientReducer(Patient.resource)) : [];
  }

  async getPatient(id) {
    try {
      const response = await this.get(`Patient/${id}`);
      //console.log('Response:', response.data);
      return this.patientReducer(response.data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  async get(path) {
    try {
      return await axios.get(`${this.baseURL}${path}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'UTF-8'
        }
      });
    } catch (error) {
      throw error;
    }
  }

  patientReducer(Patient) {
    return {
      resourceType: Patient.resourceType,
      id: Patient.id,
      name: Patient.name.map(name => ({
        family: name.family,
        given: name.given,
      })),
      telecom: Patient.telecom.map(telecom => ({
        system: telecom.system,
        value: telecom.value,
        use: telecom.use
      })),
      gender: Patient.gender,
      birthDate: Patient.birthDate,
      address: Patient.address.map(address => ({
        line: Array.isArray(address.line) ? address.line.join(' ') : address.line,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country
      })),
      maritalStatus: Patient.maritalStatus.text,
      multipleBirthBoolean: Patient.multipleBirthBoolean,
      communication: Patient.communication.map(comm => ({
        language: comm.language.text
      })),
      meta: Patient.meta,
      text: Patient.text,
      extension: Patient.extension,
      identifier: Patient.identifier
    };
  }
}

class EncounterAPI {
  constructor() {
    this.baseURL = 'http://localhost:8080/hapi-fhir-jpaserver/fhir/'
    this.patientAPI = new PatientAPI();
    this.practitionerAPI = new PractitionerAPI();
    this.organizationAPI = new OrganizationAPI();
  }

  async getEncounters() {
    const response = await this.get('Encounter');
    return Array.isArray(response.data.entry) ? response.data.entry.map(Encounter => this.encounterReducer(Encounter.resource)) : [];
  }

  async getEncounter(id) {
    try {
      const response = await this.get(`Encounter/${id}`);
      //console.log('Response:', response.data);
      return await this.encounterReducer(response.data);
    } catch (error) {
      console.error('Error fetching encounter:', error);
      throw error;
    }
  }

  async get(path) {
    try {
      return await axios.get(`${this.baseURL}${path}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'UTF-8'
        }
      });
    } catch (error) {
      throw error;
    }
  }
  /*   console.log('Encounter:', Encounter);  
    if (!loadedEncounter.subject.reference) {
      console.error('Encounter.subject or Encounter.subject.reference is undefined:', Encounter);
    } else {
      console.log('Encounter.subject:', loadedEncounter.subject.reference);
    }*/
  async encounterReducer(Encounter) {
    const loadedEncounter = await Encounter;    
    
    const patientId = loadedEncounter.subject.reference.split('/')[1];
    const reducedPatient = await this.patientAPI.getPatient(patientId);
    
    const participants = await Promise.all(
      loadedEncounter.participant.map(async participant => {
        const practitionerId = participant.individual.reference.split('/')[1];
        const reducedPractitioner = await this.practitionerAPI.getPractitioner(practitionerId);
        return { individual: reducedPractitioner };
      })
    );

    const organizationId = loadedEncounter.serviceProvider.reference.split('/')[1];
    const reducedOrganization = await this.organizationAPI.getOrganization(organizationId);


    return {
      resourceType: loadedEncounter.resourceType,
      id: loadedEncounter.id,
      meta: {
        versionId: loadedEncounter.meta.versionId,
        lastUpdated: loadedEncounter.meta.lastUpdated,
        source: loadedEncounter.meta.source,
        tag: loadedEncounter.meta.tag.map(tag => ({
          system: tag.system,
          code: tag.code
        })),
      },
      status: loadedEncounter.status,
      class: {
        system: loadedEncounter.class.system,
        code: loadedEncounter.class.code
      },
      type: loadedEncounter.type.map(type => ({
        coding: type.coding.map(coding => ({
          system: coding.system,
          code: coding.code,
          display: coding.display
        })),
        text: type.text
      })),
      subject: reducedPatient,
      participant: participants, 
      period: {
        start: loadedEncounter.period.start,
        end: loadedEncounter.period.end
      },
      serviceProvider: reducedOrganization
    };
  }
}

class PractitionerAPI {
  constructor() {
    this.baseURL = 'http://localhost:8080/hapi-fhir-jpaserver/fhir/';
  }

  async getPractitioners() {
    const response = await this.get('Practitioner');
    return Array.isArray(response.data.entry) ? response.data.entry.map(Practitioner => this.practitionerReducer(Practitioner.resource)) : [];
  }

  async getPractitioner(id) {
    try {
      const response = await this.get(`Practitioner/${id}`);
      return await this.practitionerReducer(response.data);
    } catch (error) {
      console.error('Error fetching practitioner:', error);
      throw error;
    }
  }

  async get(path) {
    try {
      return await axios.get(`${this.baseURL}${path}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'UTF-8'
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async practitionerReducer(Practitioner) {
    return {
      resourceType: Practitioner.resourceType,
      id: Practitioner.id,
      meta: {
        versionId: Practitioner.meta.versionId,
        lastUpdated: Practitioner.meta.lastUpdated,
        source: Practitioner.meta.source,
        tag: Practitioner.meta.tag.map(tag => ({
          system: tag.system,
          code: tag.code
        })),
      },
      identifier: Practitioner.identifier.map(identifier => ({
        system: identifier.system,
        value: identifier.value
      })),
      active: Practitioner.active,
      name: Practitioner.name.map(name => ({
        family: name.family,
        given: name.given,
        prefix: name.prefix
      })),
      address: Practitioner.address.map(address => ({
        line: address.line,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country
      })),
      gender: Practitioner.gender
    };
  }
}

class OrganizationAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://localhost:8080/hapi-fhir-jpaserver/fhir/';
  }

  async getOrganizations() {
    const response = await this.get('Organization');
    return Array.isArray(response.data.entry)
      ? response.data.entry.map(Organization => this.organizationReducer(Organization.resource))
      : [];
  }

  async getOrganization(id) {
    try {
      const response = await this.get(`Organization/${id}`);
      //console.log('Response from API:', response);
      return this.organizationReducer(response.data); // pass response.data instead of response
    } catch (error) {
      console.error('Error fetching Organization:', error);
      throw error;
    }
  }

  async get(path) {
    try {
      return await axios.get(`${this.baseURL}${path}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'UTF-8'
        }
      });
    } catch (error) {
      throw error;
    }
  }

  organizationReducer(Organization) {
    if (!Organization || !Organization.meta || !Organization.meta.versionId) {
      throw new Error('Organization is undefined or does not have a versionId property');
    }
    return {
      resourceType: Organization.resourceType,
      id: Organization.id,
      meta: {
        versionId: Organization.meta.versionId,
        lastUpdated: Organization.meta.lastUpdated,
        source: Organization.meta.source,
        tag: Organization.meta.tag.map(tag => ({
          system: tag.system,
          code: tag.code
        })),
      },
      identifier: Organization.identifier.map(identifier => ({
        system: identifier.system,
        value: identifier.value
      })),
      active: Organization.active,
      type: Organization.type.map(type => ({
        coding: type.coding.map(coding => ({
          system: coding.system,
          code: coding.code,
          display: coding.display
        })),
        text: type.text
      })),
      name: Organization.name,
      telecom: Organization.telecom.map(telecom => ({
        system: telecom.system,
        value: telecom.value
      })),
      address: Organization.address.map(address => ({
        line: address.line,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country
      })),
    };
  }
}

module.exports = { PatientAPI, EncounterAPI, PractitionerAPI, OrganizationAPI };