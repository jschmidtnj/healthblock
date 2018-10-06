var jQuery = require("jquery");
require('jquery-validation');
require("popper.js");
require("bootstrap");
window.$ = window.jQuery = jQuery;

var FileSaver = require('file-saver');
require("bootstrap-select");
require("bootstrap-select/dist/css/bootstrap-select.css");

var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
var config = require('../../../config/config.json');
firebase.initializeApp(config.firebase);

function handleError(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    //console.log(errorCode, errorMessage);
    var customMessage = "";
    if (errorCode == "auth/notsignedin") {
        customMessage = errorMessage;
    }
    if (error.code !== "" && error.message !== "") {
        if (customMessage !== "") {
            $('#error-info').text(customMessage);
        } else {
            $('#error-info').text("Error: " + errorMessage + " Code: " + errorCode);
        }
    } else {
        $('#error-info').text("No Error code found.");
    }
    $('#alertsignoutfailure').fadeIn();
    setTimeout(function () {
        $('#alertsignoutfailure').fadeOut();
    }, config.other.alerttimeout);
}

var createdDownloadButton = false;

$(document).ready(function () {

    $('#toslink').attr('href', config.other.tosUrl);
    $('#privacypolicylink').attr('href', config.other.privacyPolicyUrl);
    $('#helplink').attr('href', config.other.helpPageUrl);

    function createContactSubmitForm() {
        if ($("#addContactForm").valid()) {
            //console.log("form valid");
            var formData = $("#addContactForm").serializeArray();
            //console.log(formData);
            var contactId = firebase.database().ref().child('contacts').push().key;
            var firstname = formData[0].value.toString();
            var lastname = formData[1].value.toString();
            var email = formData[2].value.toString();
            var companyname = formData[3].value.toString();
            var homestreet = formData[4].value.toString();
            var homecity = formData[5].value.toString();
            var homestate = formData[6].value.toString();
            var homepostalcode = formData[7].value.toString();
            var homecountry = formData[8].value.toString();
            var notes = formData[9].value.toString();
            firebase.database().ref('contacts/' + contactId).set({
                "First Name": firstname,
                "Last Name": lastname,
                "E-mail Address": email,
                "Company": companyname,
                "Home Street": homestreet,
                "Home City": homecity,
                "Home State": homestate,
                "Home Postal Code": homepostalcode,
                "Home Country-Region": homecountry,
                "Notes": notes
            }).then(function () {
                firebase.database().ref('locations').once('value').then(function (locations) {
                    var numlocations = locations.numChildren();
                    var countlocations = 0;
                    locations.forEach(function (location) {
                        countlocations++;
                        var locationId = location.key;
                        //console.log(locationId);
                        var locationData = location.val();
                        var numcontacts = locationData.numcontacts;
                        var newcontactnum = numcontacts + 1;
                        firebase.database().ref('locations/' + locationId + '/contacts/' + numcontacts).update({
                            id: contactId
                        }).then(function () {
                            if (countlocations == numlocations) {
                                firebase.database().ref('locations/' + locationId).update({
                                    numcontacts: newcontactnum
                                }).then(function () {
                                    //console.log("successful update");
                                }).catch(function (error) {
                                    handleError(error);
                                });
                            }
                        }).catch(function (error) {
                            handleError(error);
                        });
                    });
                }).catch(function (error) {
                    handleError(error);
                });
                // Update successful.
                //console.log("update success");
                setTimeout(function () {
                    $('#alertcontactadded').fadeIn();
                    setTimeout(function () {
                        $('#alertcontactadded').fadeOut();
                    }, config.other.alerttimeout);
                    $('#addContactForm')[0].reset();
                }, config.other.datatimeout);
            }).catch(function (error) {
                // An error happened.
                handleError(error);
            });
        }
    }

    function createValidation() {
        $.validator.addMethod(
            "regex",
            function (value, element, regexp) {
                var re = new RegExp(regexp, 'i');
                return this.optional(element) || re.test(value);
            },
            ""
        );

        $("#addContactForm").validate({
            rules: {
                firstname: {
                    required: true
                },
                lastname: {
                    required: true
                },
                email: {
                    regex: config.regex.validemail
                }
            },
            messages: {
                firstname: "Please enter a first name",
                lastname: "Please enter a last name",
                email: "Please enter a valid email"
            },
            errorElement: "div",
            errorPlacement: function (error, element) {
                // Add the `invalid-feedback` class to the div element
                error.addClass("invalid-feedback");
                error.insertAfter(element);
            },
            highlight: function (element) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function (element) {
                $(element).addClass("is-valid").removeClass("is-invalid");
            }
        });
    }

    var signed_in_initially = false;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            //console.log("signed in");
            window.email = user.email;
            var testemail = new RegExp(config.regex.adminemailregex, 'g');
            $("#bodycollapse").removeClass("collapse");
            $("#patientDash").removeClass("collapse");
            createValidation();
            $("#addContactSubmit").on('click touchstart', function () {
                createContactSubmitForm();
            });
            if (!(testemail.test(window.email))) {
                //console.log("non-admin");
            } else {
                //console.log("admin");
                createlocationSelect();
            }
            signed_in_initially = true;
        } else {
            // No user is signed in. redirect to login page:
            if (signed_in_initially) {
                $('#alertsignoutsuccess').fadeIn();
                setTimeout(function () {
                    $('#alertsignoutsuccess').fadeOut();
                    //console.log("redirecting to login page");
                    setTimeout(function () {
                        window.location.href = 'login.html';
                    }, config.other.redirecttimeout);
                }, config.other.alerttimeout);
            } else {
                //slow redirect
                handleError({
                    code: "auth/notsignedin",
                    message: "Not Signed in. Redirecting."
                });
                //console.log("redirecting to login page");
                setTimeout(function () {
                    window.location.href = 'login.html';
                }, config.other.redirecttimeout);
                //fast redirect
                // window.location.href = 'login.html';
            }
        }
    });

    $("#logoutButton").on('click touchstart', function () {
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
        }).catch(function (error) {
            // An error happened.
            handleError(error);
        });
    });
});
