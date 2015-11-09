/**
 * Created by ShrimpTang on 2015/11/9.
 */
(function () {
    var app = angular.module('myApp', []);
    app.constant('API_URL', 'http://localhost:3000');
    app.controller('MainCtrl', function (RandomUserFactory, UserFactory, AuthTokenFactory) {
        var vm = this;
        UserFactory.getUser().then(function (res) {
            vm.user=res.data;
        });
        vm.getRandomUser = function () {
            RandomUserFactory.getUser().then(function (res) {
                vm.randomUser = res.data;
            });
        };
        vm.login = function (username, password) {
            UserFactory.login(username, password).then(function success(res) {
                vm.user = res.data.user;
                //   console.info(res.data.token);
            }, handleError);

        }
        vm.logout = function () {
            AuthTokenFactory.setToken();
            vm.user = null;
        }
        function handleError(res) {
            alert('Error' + res.data);
        }
    });
    app.factory('RandomUserFactory', function RandomUserFactory($http, API_URL) {
        return {getUser: getUser,}
        function getUser() {
            return $http.get(API_URL + '/random-user');
        }
    });
    app.factory('UserFactory', function UserFactory($q,$http, API_URL, AuthTokenFactory) {
        return {
            login: login,
            getUser: getUser
        }
        function login(username, password) {
            return $http.post(API_URL + "/login", {
                username: username,
                password: password
            }).then(function (res) {
                AuthTokenFactory.setToken(res.data.token);
                return res;
            })
        }
        function getUser(){
            if(AuthTokenFactory.getToken()){
                return $http.get(API_URL+"/me");
            }else{
                return $q.reject({data:'no token'});
            }
        }
    });
    app.factory('AuthTokenFactory', function AuthTokenFactory($window) {
        var storage = $window.localStorage;
        var key = 'auth-token';

        function getToken() {
            return storage.getItem(key);
        }

        function setToken(token) {
            if (token) {
                storage.setItem(key, token)
            } else {
                storage.removeItem(key);
            }
        }

        return {
            getToken: getToken,
            setToken: setToken
        }
    });

    app.config(["$httpProvider", function ($httpProvider) {
        $httpProvider.interceptors.push(function (AuthTokenFactory) {
            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    if (AuthTokenFactory.getToken()) {
                        config.headers.Authorization = 'Bearer ' + AuthTokenFactory.getToken();
                    }
                    return config;
                }
            }
        })
    }]);

})();