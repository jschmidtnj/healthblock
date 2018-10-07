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
    return getAssetRegistry('api.View')
        .then(function (viewRegistry) {
            var factory = getFactory();
            var currentTime = Date.now().toString();
            var numViews = patientData.patient.views.length;
            var newviewID = "view" + (numViews + 1).toString();
            var newView = factory.newResource('api', 'View', newviewID);
            newView.viewID = newviewID;
            newView.timestamp = currentTime;
            newView.usertype = "patient";
            newView.ehr = patientData.patient.ehr;
            newView.userid = patientData.patient.patientId;
            patientData.patient.ehr.views.push(newView);
            patientData.patient.views.push(newView);
            return viewRegistry.add(newView);
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

/**
* Sample transaction
* @param {api.DoctorViewPatientData} DoctorViewPatientData
* @transaction
*/
function DoctorViewPatientData(doctorPatientData) {
    if (doctorPatientData.doctor.patients.includes(doctorPatientData.patient)) {
        return getAssetRegistry('api.View')
            .then(function (viewRegistry) {
                var factory = getFactory();
                var currentTime = Date.now().toString();
                var numViews = doctorPatientData.doctor.views.length;
                var newviewID = "view" + (numViews + 1).toString();
                var newView = factory.newResource('api', 'View', newviewID);
                newView.viewID = newviewID;
                newView.timestamp = currentTime;
                newView.usertype = "doctor";
                newView.ehr = doctorPatientData.patient.ehr;
                newView.userid = doctorPatientData.doctor.doctorId;
                doctorPatientData.patient.ehr.views.push(newView);
                doctorPatientData.doctor.views.push(newView);
                return viewRegistry.add(newView);
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
        return getAssetRegistry('api.View')
            .then(function (viewRegistry) {
                var factory = getFactory();
                var currentTime = Date.now().toString();
                var numViews = insurancePatientData.insurance.views.length;
                var newviewID = "view" + (numViews + 1).toString();
                var newView = factory.newResource('api', 'View', newviewID);
                newView.viewID = newviewID;
                newView.timestamp = currentTime;
                newView.usertype = "insurance";
                newView.ehr = insurancePatientData.patient.ehr;
                newView.userid = insurancePatientData.insurance.insuranceId;
                insurancePatientData.patient.ehr.views.push(newView);
                insurancePatientData.insurance.views.push(newView);
                return viewRegistry.add(newView);
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
        EHRData.patient.ehr = {
            ehrID: EHRData.patient.ehr.ehrID,
            patientId: EHRData.patient.patientId,
            age: EHRData.age,
            prescription: EHRData.prescription,
            diagnosis: EHRData.diagnosis,
            notes: EHRData.notes,
            otherdata: EHRData.otherdata,
            views: []
        };
        doctorPatientData.patient.ehr.views.push(newView);
        doctorPatientData.doctor.views.push(newView);
        return getAssetRegistry('api.EHR')
            .then(function (ehrRegistry) {
                return ehrRegistry.update(EHRData.patient.ehr);
            });
    } else {
        throw new Error("Access Denied");
    }
}