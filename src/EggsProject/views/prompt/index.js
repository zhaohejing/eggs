(function () {
    angular.module('MetronicApp').controller('views.prompt.index', ['$scope', 'settings', '$uibModal', "dataFactory",'appSession',
        function ($scope, settings, $uibModal, dataFactory, appSession) {
            // ajax初始化
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();
            });
            var vm = this;
            vm.filter = {};
      
            //页面属性
            vm.table = {
                data: [],               //数据集
                checkModel: {},         //选择的集合
                filter: "",//条件搜索
                pageConfig: {           //分页配置
                    currentPage: 1,//当前页
                    itemsPerPage: 10,//页容量
                    totalItems: 0//总数据
                }
            }
            //获取用户数据集，并且添加配置项
            vm.init = function () {
                vm.table.checkModel = {};
                vm.filter.pageNum = vm.table.pageConfig.currentPage;
                vm.filter.pageSize = vm.table.pageConfig.itemsPerPage;
                vm.filter.org_id = appSession.orgid;
                dataFactory.action("api/tips/getTipsList", "", null, vm.filter)
                    .then(function (res) {
                        if (res.result == "1") {
                            vm.table.pageConfig.totalItems = res.total;
                            vm.table.checkModel = {};
                            vm.table.data = res.list;
                            vm.table.pageConfig.onChange = function () {
                                vm.init();
                            }
                        }
                    });
            };
            vm.init();
            vm.add = function () {
                var modal = $uibModal.open({
                    templateUrl: 'views/prompt/modal.html',
                    controller: 'views.prompt.modal as vm',
                    backdrop: 'static',
                   // size: 'sm',//模态框的大小尺寸
                    resolve: {
                        model: function () { return {} },
                    }
                });
                modal.result.then(function (response) {
                    vm.init();
                })
            }
            vm.edit = function () {
                var id = Object.getOwnPropertyNames(vm.table.checkModel);
                if (id.length != 1) {
                    abp.notify.warn("请选择一个操作对象");
                    return;
                }
              
                var modal = $uibModal.open({
                    templateUrl: 'views/prompt/modal.html',
                    controller: 'views.prompt.modal as vm',
                    backdrop: 'static',
                  //  size: 'sm',//模态框的大小尺寸
                    resolve: {
                        model: function () { return { id: id[0] } },
                    }
                });
                modal.result.then(function (response) {
                    vm.init();
                })
            }
            vm.delete = function () {
                var ids = Object.getOwnPropertyNames(vm.table.checkModel);
                if (ids.length <= 0) {
                    abp.notify.warn("请选择要删除的对象");
                    return;
                }
                abp.message.confirm(
               '删除将导致数据无法显示', //确认提示
               '确定要删除么?',//确认提示（可选参数）
               function (isConfirmed) {
                   if (isConfirmed) {
                       //...delete user 点击确认后执行
                       //api/resource/delete
                       dataFactory.action("api/resource/delete", "", null, { list: ids }).then(function (res) {
                           abp.notify.success("删除成功");
                           vm.init();
                       });
                   }
                   });

            }
          
        }])
})();

