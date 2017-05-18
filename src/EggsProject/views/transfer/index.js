(function () {
    angular.module('MetronicApp').controller('views.transfer.index', ['$scope', 'settings', '$uibModal', "dataFactory",
        function ($scope, settings, $uibModal, dataFactory) {
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
                vm.filter.pageNum = vm.table.pageConfig.currentPage;
                vm.filter.pageSize = vm.table.pageConfig.itemsPerPage;

                dataFactory.action("api/orgsetting/selectAccountTypeList", "", null, vm.filter)
                    .then(function (res) {
                        if (res.result == "1") {
                            vm.table.pageConfig.totalItems = res.total;
                            vm.table.data = res.list;
                            vm.table.pageConfig.onChange = function () {
                                vm.init();
                            }
                        }
                    });
            };
            vm.init();
            vm.auto = function (type) {
                var ids = Object.getOwnPropertyNames(vm.table.checkModel);
                if (ids.length <= 0) {
                    abp.notify.warn("请选择要绑定的对象");
                    return;
                }
                var model = { list: ids, transferType: type };
                dataFactory.action('api/orgsetting/setAccountTransferType', "", null, model).then(function (res) {
                    if (res.result == "1") {
                        abp.notify.success("设置成功");
                        vm.init();
                    } else {
                        abp.notify.error("保存失败,请重试");
                    }
                });
            }
        }])
})();

