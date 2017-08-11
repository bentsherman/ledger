"use strict";
var angular = require("angular");
require("angular-route");

// stylesheets
require("bootstrap/dist/css/bootstrap.css");
require("./css/style.css");

// HTML templates
require("./views/home.html");

var app = angular.module("app", [
	"ngRoute"
]);

app.config(["$compileProvider", function($compileProvider) {
	$compileProvider.debugInfoEnabled(false);
}]);

app.config(["$routeProvider", function($routeProvider) {
	$routeProvider
		.when("/", {
			templateUrl: "views/home.html",
			controller: "HomeCtrl"
		})
		.otherwise("/");
}]);

app.service("db", ["$http", function($http) {
	this.getUsers = function() {
		return $http.get("/api/users")
			.then(function(res) {
				return res.data;
			});
	};
}]);

app.controller("HomeCtrl", ["$scope", "db", function($scope, db) {
	$scope.users = [];

	// initialize
	db.getUsers().then(function(users) {
		$scope.users = users;
	});
}]);
