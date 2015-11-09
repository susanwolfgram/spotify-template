var data;
var baseUrl = 'https://api.spotify.com/v1/search?type=track&query=';

// Create application with dependency 'firebase'
var myApp = angular.module('myApp', ['firebase']);

// Bind controller, passing in $scope, $firebaseAuth, $firebaseArray, $firebaseObject
myApp.controller('myCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $http){

  var ref = new Firebase("https://crowd-play.firebaseio.com");
  
  var dataLists = ref.child('lists');
  var dataUsers = ref.child('users'); 

  // Create a firebaseArray of your playlists, and store this as part of $scope

  // Create a firebaseObject of your users, and store this as part of $scope
  $scope.lists = $firebaseArray(dataLists);
  $scope.users = $firebaseObject(dataUsers);

  $scope.listClicked = false; 
  $scope.clicked = function(list) {
    $scope.track = ""; 
    $scope.tracks = ""; 
  }
  $scope.authObj = $firebaseAuth(ref);

  // Test if already logged in
  var authData = $scope.authObj.$getAuth();
  if (authData) {
    $scope.userId = authData.uid;
  } 

  // SignUp function
  $scope.signUp = function() {
    // Create user
    $scope.authObj.$createUser({
      email: $scope.email,
      password: $scope.password,      
    })

    // Once the user is created, call the logIn function
    .then($scope.logIn)

    // Once logged in, set and save the user data
    .then(function(authData) {
      $scope.userId = authData.uid;
      $scope.users[authData.uid] ={
        handle:$scope.handle, 
        userImage:$scope.userImage
      }
      $scope.users.$save()
    })

  // Catch any errors
    .catch(function(error) {
      console.error("Error: ", error);
    });
  }

  // SignIn function
  $scope.signIn = function() {
    $scope.logIn().then(function(authData){
      $scope.userId = authData.uid;
    })
  }

  // LogIn function
  $scope.logIn = function() {
    return $scope.authObj.$authWithPassword({
      email: $scope.email,
      password: $scope.password
    })
  }

  // LogOut function
  $scope.logOut = function() {
    $scope.authObj.$unauth()
    $scope.userId = false
  }

  $scope.create = function() {
    $scope.lists.$add({
      title: $scope.listName, 
      desc: $scope.listDesc,
      image: $scope.listImage, 
      userId: $scope.userId,
      likes: 0,
      time: Firebase.ServerValue.TIMESTAMP
    }).then(function() {
      $scope.listName = ""; 
      $scope.listDesc = ""; 
      $scope.listImage = ""; 
      $scope.lists.$save(); 
    })
  }

  $scope.like = function(list) {
    list.likes++; 
    $scope.lists.$save(list);
  }

  $scope.audioObject = {};
  $scope.getSongs = function() {
    $http.get(baseUrl + $scope.track).success(function(response){
      data = $scope.tracks = response.tracks.items;
      console.log($scope.track);
      console.log(data);
    })
  }

  $scope.play = function(song) {
    if($scope.currentSong == song) {
      $scope.audioObject.pause();
      $scope.currentSong = false;
      return
    }
    else {
      if($scope.audioObject.pause != undefined) $scope.audioObject.pause()
      $scope.audioObject = new Audio(song);
      $scope.audioObject.play();
      $scope.currentSong = song;
    }
  }

  var key = ""; 
  var arr = [];
  $scope.firstSong = true; 
  $scope.addToList = function(list, track) {
    
    var foo = new Firebase("https://crowd-play.firebaseio.com/lists/" + list.$id + "/");
    var newChildRef = foo.push();
      
    key = newChildRef.key();

    console.log(key); 
    // var songs = $firebaseArray(new Firebase("https://crowd-play.firebaseio.com/lists/" + list.$id + "/" + key));
    // console.log(songs);
    arr.push(angular.copy(track));

    var baz = new Firebase("https://crowd-play.firebaseio.com/lists/" + list.$id + "/" + key);
    baz.set({'songs' : arr});
    
    // $scope.songs = $firebaseArray(new Firebase("https://crowd-play.firebaseio.com/lists/" + list.$id + "/" + key));
    
  }
})

