/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */


function ChangeInsurance(changeInsurance) {
    if (!(changeInsurance.newInsurance.currentPatients.includes(changeInsurance.patient))) {
        changeInsurance.newInsurance.currentPatients.append(changeInsurance.patient);
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

function AddDoctorViewAccess(doctorView) {
    if (!(doctorView.patient.doctorAccess.includes(doctorView.doctor))) {
        doctorView.patient.doctorAccess.append(doctorView.doctor);
    }
    if (!(doctorView.doctor.patients.includes(doctorView.patient))) {
        doctorView.doctor.patients.append(doctorView.patient);
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

function PatientViewPatientData(patientData) {
    var currentTime = Date.now().toString();
    var newView = {
        timestamp: currentTime,
        usertype: "patient",
        ehr: patientData.patient.ehr,
        userid: patientData.patient
    };
    patientData.patient.ehr.views.push(newView);
    patientData.patient.views.push(newView);
    return getAssetRegistry('api.View')
        .then(function (viewRegistry) {
            return viewRegistry.put(newView);
        })
        .then(function () {
            return getAssetRegistry('api.EHR');
        })
        .then(function (ehrRegistry) {
            return ehrRegistry.update(patientData.patient.ehr);
        }).then(function () {
            return getParticipantRegistry('api.Patient');
        })
        .then(function (patientRegistry) {
            return patientRegistry.update(patientData.patient);
        }).then(function () {
            return getAssetRegistry('api.EHR');
        })
        .then(function (ehrRegistry) {
            return ehrRegistry.get(patientData.patient.ehr);
        });
}

function DoctorViewPatientData(doctorPatientData) {
    if (doctorPatientData.doctor.patients.includes(doctorPatientData.patient)) {
        var currentTime = Date.now().toString();
        var newView = {
            timestamp: currentTime,
            usertype: "doctor",
            ehr: doctorPatientData.patient.ehr,
            userid: doctorPatientData.doctor
        };
        doctorPatientData.patient.ehr.views.push(newView);
        doctorPatientData.doctor.views.push(newView);
        return getAssetRegistry('api.View')
            .then(function (viewRegistry) {
                return viewRegistry.put(newView);
            })
            .then(function () {
                return getAssetRegistry('api.EHR');
            })
            .then(function (ehrRegistry) {
                return ehrRegistry.update(doctorPatientData.patient.ehr);
            }).then(function () {
                return getParticipantRegistry('api.Doctor');
            })
            .then(function (doctorRegistry) {
                return doctorRegistry.update(doctorPatientData.doctor);
            }).then(function () {
                return getAssetRegistry('api.EHR');
            })
            .then(function (ehrRegistry) {
                return ehrRegistry.get(doctorPatientData.patient.ehr);
            });
    } else {
        throw new Error ("Access Denied");
    }
}

function InsuranceViewPatientData(insurancePatientData) {
    if (insurancePatientData.insurance.clients.includes(insurancePatientData.patient)) {
        var currentTime = Date.now().toString();
        var newView = {
            timestamp: currentTime,
            usertype: "doctor",
            ehr: doctorPatientData.patient.ehr,
            userid: doctorPatientData.doctor
        };
        insurancePatientData.patient.ehr.views.push(newView);
        insurancePatientData.insurance.views.push(newView);
        return getAssetRegistry('api.View')
            .then(function (viewRegistry) {
                return viewRegistry.put(newView);
            })
            .then(function () {
                return getAssetRegistry('api.EHR');
            })
            .then(function (ehrRegistry) {
                return ehrRegistry.update(insurancePatientData.patient.ehr);
            }).then(function () {
                return getParticipantRegistry('api.Doctor');
            })
            .then(function (insuranceRegistry) {
                return insuranceRegistry.update(insurancePatientData.insurance);
            }).then(function () {
                return getAssetRegistry('api.EHR');
            })
            .then(function (ehrRegistry) {
                return ehrRegistry.get(insurancePatientData.patient.ehr);
            });
    } else {
        throw new Error ("Access Denied");
    }
}

function DoctorUpdatePatientData(EHRData) {
    if (EHRData.doctor.patients.includes(patient)) {
        EHRData.patient.ehr = {
            age: EHRData.age,
            prescription: EHRData.prescription,
            diagnosis: EHRData.diagnosis,
            notes: EHRData.notes,
            otherdata: EHRData.otherdata,
            views: [],
            patient: EHRData.patient
        };
        doctorPatientData.patient.ehr.views.push(newView);
        doctorPatientData.doctor.views.push(newView);
        return getAssetRegistry('api.EHR')
            .then(function (ehrRegistry) {
                return ehrRegistry.update(EHRData.patient.ehr);
            });
    } else {
        throw new Error ("Access Denied");
    }
}