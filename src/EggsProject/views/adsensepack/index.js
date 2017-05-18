(function () {
    angular.module('MetronicApp').controller('views.adsensepack.index', ['$scope', 'settings', '$state', 'dataFactory',
        function ($scope, settings, $state, dataFactory) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        var vm = this;
        vm.filter = {};
        vm.date = {
            leftopen: false,
            rightopen: false,

            inlineOptions: {
                showWeeks: false
            },
            dateOptions: {
                //dateDisabled: disabled,
                formatYear: 'yyyy',
                maxDate: new Date(5000, 1, 1),
                minDate: new Date(1900, 1, 1),
                startingDay: 1
            },
            openleft: function () {
                vm.date.leftopen = !vm.date.leftopen;
            },
            openright: function () {
                vm.date.rightopen = !vm.date.rightopen;
            }
        }
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
            dataFactory.action("api/package/selectAll", "", null, vm.filter)
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

        vm.add = function () {
            $state.go("adsensepackmodify");
        }
        vm.edit = function () {
            var id = Object.getOwnPropertyNames(vm.table.checkModel);
            if (id.length != 1) {
                abp.notify.warn("请选择单个要操作的对象");
                return;
            }
            for (var i in vm.table.checkModel) {
                if (vm.table.checkModel[i].state == 1) {
                    abp.notify.warn("已发布对象不允许操作");
                    return;
                }
            }
            $state.go("adsensepackmodify", { id: id[0] });
        }
        vm.delete = function () {
            var ids = Object.getOwnPropertyNames(vm.table.checkModel);
            if (ids.length <= 0) {
                abp.notify.warn("请选择要删除的对象");
                return;
            }
            for (var i in vm.table.checkModel) {
                if (vm.table.checkModel[i].state == 1) {
                    abp.notify.warn("已发布对象不允许操作");
                    return;
                }
            }
            abp.message.confirm(
           '删除将导致数据无法显示', //确认提示
           '确定要删除么?',//确认提示（可选参数）
           function (isConfirmed) {
               if (isConfirmed) {
                   //...delete user 点击确认后执行
                   //api/resource/delete
                   dataFactory.action("api/package/delete", "", null, { list: ids }).then(function (res) {
                       abp.notify.success("删除成功");
                       vm.init();
                   });
               }
           });
          
        }
        vm.public = function () {
            var ids = Object.getOwnPropertyNames(vm.table.checkModel);
            if (ids.length <= 0) {
                abp.notify.warn("请选择单个要操作的对象");
                return;
            }
            for (var i in vm.table.checkModel) {
                if (vm.table.checkModel[i].state == 1) {
                    abp.notify.warn("已发布对象不允许操作");
                    return;
                }
            }
            dataFactory.action("api/package/updateState", "", null, { list: ids, state: 1 }).then(function (res) {
                abp.notify.success("发布成功");
                vm.init();
            });
        }

    }]);
})();

