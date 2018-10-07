'use strict';

/**
* Sample transaction
* @param {api.ChangeInsurance} ChangeInsurance
* @transaction
*/
function ChangeInsurance(changeInsurance) {
    if (!(changeInsurance.newInsurance.clients.includes(changeInsurance.patient))) {
        changeInsurance.newInsurance.clients.push(changeInsurance.patient);
    }
    changeInsurance.patient.insurance = changeInsurance.newInsurance;
    return getParticipantRegistry('api.Patient')
        .then(function (patientRegistry) {
            return patientRegistry.update(changeInsurance.patient);
        })
        .then(function () {
            return getParticipantRegistry('api.Insurance');
        })
        .then(function (insuranceRegistry) {
            return insuranceRegistry.update(changeInsurance.newInsurance);
        });
}

/**
* Sample transaction
* @param {api.RemoveDoctorViewAccess} RemoveDoctorViewAccess
* @transaction
*/
function RemoveDoctorViewAccess(doctorView) {
    var doctorAccessIndex = doctorView.patient.doctorAccess.indexOf(doctorView.doctor);
    if (doctorAccessIndex > -1) {
        doctorView.patient.doctorAccess.splice(doctorAccessIndex, 1);
    }
    var doctorPatientsIndex = doctorView.doctor.patients.indexOf(doctorView.patient);
    if (doctorPatientsIndex > -1) {
        doctorView.doctor.patients.splice(doctorAccessIndex, 1);
    }
    return getParticipantRegistry('api.Patient')
        .then(function (patientRegistry) {
            return patientRegistry.update(doctorView.patient);
        })
        .then(function () {
            return getParticipantRegistry('api.Doctor');
        })
        .then(function (doctorRegistry) {
            return doctorRegistry.update(doctorView.doctor);
        });
}

/**
* Sample transaction
* @param {api.AddDoctorViewAccess} AddDoctorViewAccess
* @transaction
*/
function AddDoctorViewAccess(doctorView) {
    if (!(doctorView.patient.doctorAccess.includes(doctorView.doctor))) {
        doctorView.patient.doctorAccess.push(doctorView.doctor);
    }
    if (!(doctorView.doctor.patients.includes(doctorView.patient))) {
        doctorView.doctor.patients.push(doctorView.patient);
    }
    return getParticipantRegistry('api.Patient')
        .then(function (patientRegistry) {
            return patientRegistry.update(doctorView.patient);
        })
        .then(function () {
            return getParticipantRegistry('api.Doctor');
        })
        .then(function (doctorRegistry) {
            return doctorRegistry.update(doctorView.doctor);
        });
}

/**
* Sample transaction
* @param {api.PatientViewPatientData} PatientViewPatientData
* @transaction
*/
function PatientViewPatientData(patientData) {
    return getAssetRegistry('api.EHR')
        .then(function (ehrRegistry) {
            return ehrRegistry.get(patientData.patient.ehr);
        });
}

/**
* Sample transaction
* @param {api.DoctorViewPatientData} DoctorViewPatientData
* @transaction
*/
function DoctorViewPatientData(doctorPatientData) {
    if (doctorPatientData.doctor.patients.includes(doctorPatientData.patient)) {
        return getAssetRegistry('api.EHR')
            .then(function (ehrRegistry) {
                return ehrRegistry.get(doctorPatientData.patient.ehr);
            });
    } else {
        throw new Error("Access Denied");
    }
}

/**
* Sample transaction
* @param {api.InsuranceViewPatientData} InsuranceViewPatientData
* @transaction
*/
function InsuranceViewPatientData(insurancePatientData) {
    if (insurancePatientData.insurance.clients.includes(insurancePatientData.patient)) {
        return getAssetRegistry('api.EHR')
            .then(function (ehrRegistry) {
                return ehrRegistry.get(insurancePatientData.patient.ehr);
            });
    } else {
        throw new Error("Access Denied");
    }
}

/**
* Sample transaction
* @param {api.DoctorUpdatePatientData} DoctorUpdatePatientData
* @transaction
*/
function DoctorUpdatePatientData(EHRData) {
    if (EHRData.doctor.patients.includes(patient)) {
        EHRData.patient.ehr.ehrID = EHRData.patient.ehr.ehrID;
        EHRData.patient.ehr.patientId = EHRData.patient.patientId;
        EHRData.patient.ehr.age = EHRData.age;
        EHRData.patient.ehr.diagnosis = EHRData.diagnosis;
        EHRData.patient.ehr.notes = EHRData.notes;
        EHRData.patient.ehr.otherdata = EHRData.otherdata;
        return getAssetRegistry('api.EHR')
            .then(function (ehrRegistry) {
                return ehrRegistry.update(EHRData.patient.ehr);
            });
    } else {
        throw new Error("Access Denied");
    }
}