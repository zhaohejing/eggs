angular.module('MetronicApp').controller('views.adsensepack.modal',
    ['$scope', 'settings', '$uibModalInstance','dataFactory','model',
        function ($scope, settings, $uibModalInstance, dataFactory, model) {
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();

            });
            var vm = this;
            vm.url = "api/resource/add";
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
                vm.filter.passIds = model;
                dataFactory.action("api/resource/selectPublish", "", null, vm.filter)
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
            vm.save = function () {
                var id = Object.getOwnPropertyNames(vm.table.checkModel);
                if (id.length <= 0) {
                    abp.notify.warn("请选择要添加的广告");
                    return;
                }
                $uibModalInstance.close(vm.table.checkModel);
            };

            vm.cancel = function () {
                $uibModalInstance.dismiss();
            };

        }]);
