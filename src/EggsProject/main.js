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
    'abp', 'ngLocale', "isteven-multi-select"
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
              var cookie = $.cookie("eggsResult");
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
        $.cookie("eggsResult", null, { path: "/" });
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
      { url: "coupon", title: "卡券管理", icon: "fa fa-clipboard" },
      {
          url: "", title: "方案管理", icon: "fa fa-suitcase", child: [
               { url: "plan", title: "方案列表", icon: "fa fa-sticky-note" },
               { url: "record", title: "领取记录", icon: "fa fa-bars" },
          ]
      },
      { url: "prompt", title: "未中奖提示", icon: "fa fa-cogs" },
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
    $urlRouterProvider.otherwise("/coupon.html");
    var abp = abp;
    $stateProvider
        //卡券管理
        .state("coupon", {
            url: "/coupon.html",
            templateUrl: "views/coupon/index.html",
            data: { pageTitle: '卡券管理' },
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
                                'views/coupon/modal.js'
                            ]
                        },
                        {
                            name: 'MetronicApp',
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                'views/coupon/index.js'
                            ]
                        }]

                        );
                }]
            }
        })
         //方案管理
        .state("plan", {
            url: "/plan.html",
            templateUrl: "views/plan/index.html",
            data: { pageTitle: '方案管理' },
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            'views/plan/index.js'
                        ]
                    });
                }]
            }
        })
        //添加方案
       .state("modifyplan", {
           url: "/modifyplan.html",
           params: { "id": null },
           templateUrl: "views/plan/modify.html",
           data: { pageTitle: '方案管理' },
           resolve: {
               deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                   return $ocLazyLoad.load({
                       name: 'MetronicApp',
                       insertBefore: '#ng_load_plugins_before',
                       files: [
                           'views/plan/modify.js',
                           'views/plan/modal.js',
                       ]
                   });
               }]
           }
       })
        //中奖提示
         .state("prompt", {
             url: "/prompt.html",
             params: { "id": null },
             templateUrl: "views/prompt/index.html",
             data: { pageTitle: '未中奖提示' },
             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'MetronicApp',
                         insertBefore: '#ng_load_plugins_before',
                         files: [
                             'views/prompt/index.js',
                             'views/prompt/modal.js'
                         ]
                     });
                 }]
             }
         })
      //领取记录
         .state("record", {
             url: "/record.html",
             templateUrl: "views/record/index.html",
             data: { pageTitle: '领取记录' },
             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'MetronicApp',
                         insertBefore: '#ng_load_plugins_before',
                         files: [
                             'views/record/index.js',
                         ]
                     });
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