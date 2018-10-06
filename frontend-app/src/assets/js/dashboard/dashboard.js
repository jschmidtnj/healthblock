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


    function createValidation() {
        $.validator.addMethod(
            "regex",
            function (value, element, regexp) {
                var re = new RegExp(regexp, 'i');
                return this.optional(element) || re.test(value);
            },
            ""
        );


    var signed_in_initially = false;
    firebase.auth().onAuthStateChanged(function (user) {
      firebase.database.ref('users/' + user.uid).once('value').then(function(snapshot) {
        var usertype = snapshot.usertype;
        console.log(usertype);

        if (usertype == "patient") {
          console.log("Patient signed in");
            // User is signed in.
            //console.log("signed in");
            window.email = user.email;
            var testemail = new RegExp(config.regex.adminemailregex, 'g');
            $("#bodycollapse").removeClass("collapse");
            $("#patientDash").removeClass("collapse");
            $("#addContactSubmit").on('click touchstart', function () {
            });
            signed_in_initially = true;
        } else if (usertype == "doctor"){ //user.usertype == "doctor"
          window.email = user.email;
          var testemail = new RegExp(config.regex.adminemailregex, 'g');
          $("#bodycollapse").removeClass("collapse");
          $("#doctorDash").removeClass("collapse");
          $("#addContactSubmit").on('click touchstart', function () {
          });
          signed_in_initially = true;
        } else {
          /*
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
            */
        }
      });
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
