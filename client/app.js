"use strict";
var angular = require("angular");
require("angular-route");

// stylesheets
require("bootstrap/dist/css/bootstrap.css");
require("./css/style.css");

// HTML templates
require("./views/home.html");
require("./views/transaction.html");

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
		.when("/transaction/:id", {
			templateUrl: "views/transaction.html",
			controller: "TransactionCtrl"
		})
		.otherwise("/");
}]);

app.service("db", ["$http", function($http) {
	this.Transaction = {};

	this.Transaction.query = function() {
		return $http.get("/api/transactions")
			.then(function(res) {
				return res.data;
			});
	};

	this.Transaction.get = function(id) {
		return $http.get("/api/transactions/" + id)
			.then(function(res) {
				return res.data;
			});
	};

	this.Transaction.save = function(transaction) {
		return $http.post("/api/transactions/" + transaction.id, transaction);
	};

	this.Transaction.remove = function(id) {
		return $http.delete("/api/transactions/" + id);
	};

	this.User = {};

	this.User.query = function() {
		return $http.get("/api/users")
			.then(function(res) {
				return res.data;
			});
	};
}]);

app.controller("HomeCtrl", ["$scope", "$route", "db", function($scope, $route, db) {
	$scope.transactions = [];
	$scope.users = [];

	var debt = function(debtor, creditor) {
		var debt = $scope.transactions
			.filter(function(t) {
				return (t.creditor_id === creditor.id && t.debtors.indexOf(debtor.id) !== -1);
			})
			.reduce(function(sum, t) {
				return sum + t.cost / t.debtors.length;
			}, 0);

		var credit = $scope.transactions
			.filter(function(t) {
				return (t.creditor_id === debtor.id && t.debtors.indexOf(creditor.id) !== -1);
			})
			.reduce(function(sum, t) {
				return sum + t.cost / t.debtors.length;
			}, 0);

		return debt - credit;
	};

	$scope.deleteTransaction = function(t) {
		if ( !confirm("Are you sure you want to delete \"" + t.description + "\"?") ) {
			return;
		}

		db.Transaction.remove(t.id)
			.then(function() {
				$route.reload();
			})
	};

	// initialize
	db.User.query()
		.then(function(users) {
			$scope.users = users;

			return db.Transaction.query();
		})
		.then(function(transactions) {
			$scope.transactions = transactions;

			$scope.users.forEach(function(u1) {
				u1.debts = $scope.users.map(function(u2) {
					return {
						id: u2.id,
						name: u2.name,
						amount: debt(u1, u2)
					};
				})
			});
		});
}]);

app.controller("TransactionCtrl", ["$scope", "$location", "$q", "$routeParams", "db", function($scope, $location, $q, $routeParams, db) {
	$scope.users = [];
	$scope.transaction = {};
	$scope.subTransactions = [];

	$scope.addSubTransaction = function() {
		$scope.subTransactions.push({});
	};

	$scope.save = function(transaction, subTransactions) {
		// subtract cost of sub-transactions from main transaction
		var sum = subTransactions.reduce(function(sum, t) {
			return sum + t.cost;
		}, 0);

		transaction.cost -= sum;

		// save transaction and sub-transactions
		db.Transaction.save(transaction)
			.then(function() {
				return subTransactions.reduce(function(prev, t) {
					return prev.then(function() {
						t.date = transaction.date;
						t.creditor_id = transaction.creditor_id;

						return db.Transaction.save(t);
					});
				}, $q.resolve());
			})
			.then(function() {
				$location.url("/");
			});
	};

	// initialize
	db.User.query()
		.then(function(users) {
			$scope.users = users;

			return ($routeParams.id !== "0")
				? db.Transaction.get($routeParams.id)
				: { id: "0" };
		})
		.then(function(transaction) {
			// temporary hack to fix date
			transaction.date = new Date(transaction.date);

			$scope.transaction = transaction;
		});
}]);
