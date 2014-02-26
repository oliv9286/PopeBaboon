'use strict';

/* Controllers */
angular.module('myApp.controllers', [])
   .controller('LoginCtrl', ['$scope', 'loginService', '$location', function($scope, loginService, $location) {
    $scope.email = null;
    $scope.pass = null;
    $scope.confirm = null;

    /* Email and password login */
    $scope.login = function(cb) {
       $scope.err = null;
       if( !$scope.email ) {
          $scope.err = 'Please enter an email address';
       }
       else if( !$scope.pass ) {
          $scope.err = 'Please enter a password';
       }
       else {
          loginService.login($scope.email, $scope.pass, function(err, user) {
             $scope.err = err? err + '' : null;
             if( !err ) {
                cb && cb(user);
             }
          });
       }
    };

    /* send email for forget password */
    $scope.sendChangePasswordEmail = function(){
       // wait for v.0.7
       // loginService.sendChangePasswordEmail($scope.email);
    }

    // facebook login
    $scope.loginFB = function(cb) {

       loginService.loginProvider('facebook', 'email, read_friendlists',function(err, user) {
             $scope.err = err? err + '' : null;
             if( !err ) {
                cb && cb(user);
          }
       });
    }

    // github login
    $scope.loginGH = function(cb) {

       loginService.loginProvider('github', 'user:email', function(err, user) {
             $scope.err = err? err + '' : null;
             if( !err ) {
                cb && cb(user);
          }
       });
    }

    // register a new account with email and password
    $scope.createAccount = function() {
       $scope.err = null;
       if( assertValidLoginAttempt() ) {
          loginService.createAccount($scope.email, $scope.pass, function(err, user) {
             if( err ) {
                $scope.err = err.message;
             }
             else {
                // must be logged in before viewing my notes
                $scope.login(function() {
                   loginService.createProfile(user.uid, user.email);
                   $location.path('/notes');
                });
             }
          });
       }
    };

    function assertValidLoginAttempt() {
       if( !$scope.email ) {
          $scope.err = 'Please enter an email address';
       }
       else if( !$scope.pass ) {
          $scope.err = 'Please enter a password';
       }
       else if( $scope.pass !== $scope.confirm ) {
          $scope.err = 'Passwords do not match';
       }
       return !$scope.err;
    }
   }])

   .controller('NoteCtrl', ['$scope', 'loginService', 'changeEmailService', 'firebaseRef', 'syncData', '$location', 'FBURL', function($scope, loginService, changeEmailService, firebaseRef, syncData, $location, FBURL) {
   
    $scope.empty = false;
    $scope.update = false;

   /*Initialize rich text editor */
   $("#notecontent").jqte(
         {
            format: false,
            sub: false,
            sup: false,
            strike: false,
            outdent: false,
            indent: false,
            remove: false,
            source: false,
            color: false
         }
      );

   $scope.notes = syncData(['users', $scope.auth.user.uid, 'notes']);

   /* count the number of notes that the user owns, display empty message if zero */
   $scope.countNotes = function(){
     $scope.notes.$on('loaded', function() {
        if ($scope.notes.$getIndex().length == 0) {
          $scope.empty = true;
        }else {
          $scope.empty = false;
        };
      }); 
  }


  $scope.countNotes();

  $scope.tag = "blue";

  $scope.showControl = function(idx){
    $("#control" + idx).fadeIn();
  }

  $scope.hideControl = function(idx){
    $("#control" + idx).fadeOut();
  }

  $scope.addNote = function () {
    var content = $('#notecontent').val();
    var currentdate = new Date(); 
    var datetime = currentdate.getDate();  
    var prettyDate = currentdate.toLocaleDateString() + " " + currentdate.toLocaleTimeString();              
    $("#notecontent").jqteVal("");

    $scope.notes.$add({content:content, tag: $scope.tag, date:Date.parse(currentdate), prettyDate: prettyDate});
    $('#mainTab a[data-target="#notebook"]').tab('show');

    $scope.tag = "blue";
    $scope.countNotes();
    $scope.update = false;
  }

  $scope.removeNote = function (note) {

    var conf = confirm("You sure you wanna remove this note permanently?");
    if(conf){

     $scope.notes.$remove(note.$id);

     //reset to default tag color
     $scope.tag = "blue";
     $scope.countNotes();   
    }
  }


  $scope.updateNote = function(idx, note){
    var newContent = $("#note" + idx).children('p').html();
    var newDate = new Date();

    note.date = Date.parse(newDate);
    note.prettyDate = newDate.toLocaleDateString() + " " + newDate.toLocaleTimeString();  
    $scope.tag = "blue";
  
  }


  $scope.open = function(idx, note){

    $("#notecontent").jqteVal(note.content);
    $('#mainTab a[data-target="#newnote"]').tab('show');

   $scope.update = true;
   $scope.openId = note.$id;
  }

  $scope.openForUpdate = function(id){
       var newContent = $("#notecontent").val();
       var newDate = new Date();

       $scope.notes[id].content = newContent;
       $scope.notes[id].date = Date.parse(newDate);
       $scope.notes[id].prettyDate = newDate.toLocaleDateString() + " " + newDate.toLocaleTimeString();  
       $scope.notes[id].tag = $scope.tag; 
       $scope.notes.$save(id);

       $scope.update = false;
       $scope.tag = "blue";
       $('#mainTab a[data-target="#notebook"]').tab('show');
       $("#notecontent").jqteVal("");

       console.log(data);
  }

    $scope.bindNotes = function () {
      syncData(['users', $scope.auth.user.uid, 'notes']).$bind($scope, 'notes');
    }

    $scope.bindNotes();

    $scope.logout = function() {
       loginService.logout();
    };

    $scope.getKey = function(key){
      console.log(key);
    }

   }]);