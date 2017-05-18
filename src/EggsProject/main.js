/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router",//路由
    "ui.bootstrap",//样式
    "oc.lazyLoad",//懒加载
    "ngSanitize",//初始化
      'objectTable',//table表格
    'objPagination',//分页
    'angularFileUpload',//文件上传
    'abp', 'ngLocale'
]);

//懒加载
MetronicApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

//控制器全局设置
MetronicApp.config(['$controllerProvider', function ($controllerProvider) {
    // this option might be handy for migrating old apps, but please don't use it
    // in new ones!
    $controllerProvider.allowGlobals();
}]);
MetronicApp.factory('appSession', [
          function () {
              var _session = null;
              var cookie = $.cookie("metroResult");
              if (cookie!= ""&&cookie!=undefined) {
                  var temp = $.parseJSON(cookie);
                  _session = temp;
              }
              else {
                  window.location.href = "/index.html";
              }
              return _session;
          }
]);
//全局工厂设置
MetronicApp.factory('settings', ['$rootScope', function ($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: false, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: 'assets',
        globalPath: 'assets/global',
        layoutPath: 'assets/layouts/layout',
    };

    $rootScope.settings = settings;

    return settings;
}]);

//app控制器
MetronicApp.controller('AppController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function () {
        //App.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
    });
}]);
/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', "appSession", function ($scope, appSession) {
    if (!appSession) {
        window.location.href = "index.html";
    }
    $scope.$on('$includeContentLoaded', function () {
        Layout.initHeader(); // init header
    });
    vm = this;
    vm.user = appSession;
    vm.out = function () {
        $.cookie("metroResult", null, { path: "/" });
        location.href = "index.html";
    }
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$state', '$scope', function ($state, $scope) {
    var vm = this;

    $scope.$on('$includeContentLoaded', function () {
        Layout.initSidebar($state); // init sidebar
    });
    vm.list = [
     // 广告资源管理
      { url: "adsense", title: "广告资源管理", icon: "fa fa-clipboard" },
      { url: "adsensepack", title: "广告资源包", icon: "fa fa-suitcase" },
      { url: "advertising", title: "广告投放", icon: "fa fa-cogs" },
      { url: "advertisingrecord", title: "广告发放记录", icon: "fa fa-bar-chart" },
      {
          url: "", title: "分帐系统", icon: "fa fa-chain-broken", child: [
              { url: "fashionable", title: "分账管理", icon: "fa fa-industry" },
              { url: "transfer", title: "转账管理", icon: "fa fa-industry" },
              { url: "payment", title: "收款账户管理", icon: "fa fa-jpy" },
              { url: "cycle", title: "分账周期管理", icon: "fa fa-cc-visa" },
              { url: "scale", title: "分账比例管理", icon: "fa fa-gg-circle" },
          ]
      },
    ];

}]);
/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initFooter(); // init footer
    });
}]);

//路由设置
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/fashionable.html");
    var abp = abp;
    $stateProvider
        //广告资源管理
        .state("adsense", {
            url: "/adsense.html",
            templateUrl: "views/adsense/index.html",
            data: { pageTitle: '广告资源管理' },
        //    controller: "views.adsense.index",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(
                        [{
                            name: 'QiNiu',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'assets/global/plugins/plupload/angular-local-storage.js',
                                'assets/global/plugins/plupload/qupload.js',
                            ]
                        }, {
                            name: 'Modal',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'views/adsense/modal.js'
                            ]
                        },
                        {
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'views/adsense/index.js'
                            ]
                        }]

                        );
                }]
            }
        })
         //广告资源包管理
        .state("adsensepack", {
            url: "/adsensepack.html",
            templateUrl: "views/adsensepack/index.html",
            data: { pageTitle: '广告资源包管理' },
        //    controller: "views.adsensepack.index",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'views/adsensepack/index.js'
                        ]
                    });
                }]
            }
        })
         .state("adsensepackmodify", {
             url: "/modify.html",
             params: { "id": null },
             templateUrl: "views/adsensepack/modify.html",
             data: { pageTitle: '广告资源包操作' },
        //     controller: "views.adsensepack.modify",
             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'MetronicApp',
                         insertBefore: '#ng_load_plugins_before',
                         files: [
                             'views/adsensepack/modify.js',
                             'views/adsensepack/modal.js'
                         ]
                     });
                 }]
             }
         })
           //广告投放管理
        .state("advertising", {
            url: "/advertising.html",
            templateUrl: "views/advertising/index.html",
            data: { pageTitle: '广告投放管理' },
       //     controller: "views.advertising.index",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'views/advertising/index.js'
                        ]
                    });
                }]
            }
        })
         .state("putadsense", {
             url: "/putadsense.html",
             params:{"resourse":null },
             templateUrl: "views/advertising/putadsense.html",
             data: { pageTitle: '广告投放' },
         //    controller: "views.advertising.putadsense",
             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load([{
                         name: 'MetronicApp',
                         insertBefore: '#ng_load_plugins_before',
                         files: [

                             'views/advertising/putadsense.js',
                             'views/advertising/modal.js'
                         ]
                     }, {
                         name: 'jstreeneed',
                         insertBefore: '#ng_load_plugins_before',
                         files: [
                             'assets/global/plugins/jstree/dist/jstree.min.js',
                             'assets/global/plugins/jstree/dist/themes/default/style.min.css',
                         ]
                     }]);
                 }]
             }
         })
             //广告投放记录管理
        .state("advertisingrecord", {
            url: "/advertisingrecord.html",
            templateUrl: "views/advertisingrecord/index.html",
            data: { pageTitle: '广告投放记录管理' },
       //     controller: "views.advertisingrecord.index",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', 
                        files: [
                            'views/advertisingrecord/index.js'
                        ]
                    });
                }]
            }
        })

    $stateProvider
         .state("fashionable", {
             url: "/fashionable.html",
             templateUrl: "views/fashionable/index.html",
             data: { pageTitle: '收款账户管理' },
         //    controller: "views.fashionable.index",
             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load(
                         [{
                             name: 'MetronicApp',
                             insertBefore: '#ng_load_plugins_before',
                             files: [
                                 'views/fashionable/index.js',
                             ]
                         }]

                         );
                 }]
             }
         })
      .state("transfer", {
          url: "/transfer.html",
          templateUrl: "views/transfer/index.html",
          data: { pageTitle: '转账管理' },
          //    controller: "views.payment.index",
          resolve: {
              deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(
                      [{
                          name: 'MetronicApp',
                          insertBefore: '#ng_load_plugins_before',
                          files: [
                              'views/transfer/index.js',
                          ]
                      }]

                      );
              }]
          }
      })
    
        .state("payment", {
            url: "/payment.html",
            templateUrl: "views/payment/index.html",
            data: { pageTitle: '收款账户管理' },
        //    controller: "views.payment.index",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(
                        [{
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'views/payment/index.js',
                                'views/payment/payment.css',
                                'views/payment/modal.js'
                            ]
                        }]

                        );
                }]
            }
        })
        .state("scale", {
            url: "/scale.html",
            templateUrl: "views/scale/index.html",
            data: { pageTitle: '收款比例管理' },
        //    controller: "views.scale.index",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(
                        [{
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'views/scale/index.js',
                                'views/scale/modal.js'
                            ]
                        }]
                        );
                }]
            }
        })
        .state("cycle", {
            url: "/cycle.html",
            templateUrl: "views/cycle/index.html",
            data: { pageTitle: '收款周期管理' },
        //    controller: "views.cycle.index",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(
                        [{
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'views/cycle/index.js',
                                'views/cycle/modal.js'
                            ]
                        }]

                        );
                }]
            }
        })
}]);

//启动
MetronicApp.run(["$rootScope", "settings", "$state", function ($rootScope, settings, $state) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$settings = settings; // state to be accessed from view
    $rootScope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

}]);