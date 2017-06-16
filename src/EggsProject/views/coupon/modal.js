angular.module('MetronicApp').controller('views.coupon.modal',
    ['$scope', 'settings', '$uibModalInstance', 'model',  'dataFactory','appSession',
        function ($scope, settings, $uibModalInstance, model, dataFactory, appSession) {
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();

            });
            var vm = this;
            vm.url = "";
            vm.model = {};
            vm.gift;
            vm.tempTime = {};
            if (model.id) {
                vm.url = "api/card/update";
            } else {
                vm.url = "api/card/add";
            }
            vm.saving = false;
            vm.date = {
                leftopen: false,
                rightopen: false,
                inlineOptions: {
                    showWeeks: false
                },
                dateOptions: {
                    //dateDisabled: disabled,
                    formatYear: 'yyyy',
                    formatMonth: 'MM',
                    formatDay: 'dd',
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

            vm.gifts = [];
            vm.type = [{ id: 1, name: "代金券" }, { id: 2, name: "折扣券" }];
           
            vm.save = function () {
                if (vm.saving) {
                    return ;
                }
                vm.saving = true;
                vm.model.org_id = appSession.orgid;
                if (vm.model.date_info_type == 1) {
                    vm.model.fixed_begin_term = null;
                    vm.model.fixed_term = null;
                    vm.model.begin_timestamp = Math.round(vm.tempTime.left.valueOf() / 1000);
                    vm.model.end_timestamp = Math.round(vm.tempTime.right.valueOf() / 1000);
                } else if (vm.model.date_info_type == 2) {
                    vm.model.begin_timestamp = null;
                    vm.model.end_timestamp = null;
                    vm.model.fixed_term = null;
                } else {
                    vm.model.begin_timestamp = null;
                    vm.model.end_timestamp = null;
                    vm.model.fixed_begin_term = null;
                }
                if (vm.model.card_type==3) {
                    vm.model.gift_id = vm.gift.gift_id;
                    vm.model.gift_name = vm.gift.gift_name;
                }
             //   if (vm.model.least_cost <= vm.model.reduce_cost) {
             //       abp.notify.warn("减免金额要小于启用金额");
              //      return;
             //   }
                vm.model.least_cost = vm.model.least_cost * 100;
                vm.model.reduce_cost = vm.model.reduce_cost * 100;
             
                dataFactory.action(vm.url, "", null, vm.model).then(function (res) {
                    if (res.result == "1") {
                        $uibModalInstance.close();
                    } else {
  		vm.model.least_cost = vm.model.least_cost/ 100;
                vm.model.reduce_cost = vm.model.reduce_cost / 100;
		vm.saving=false;
                        abp.notify.error(res.errMsg);
                    }
                });
            };
            vm.cancel = function () {
                $uibModalInstance.dismiss();
            };


            vm.initgift = function () {
                dataFactory.action("api/card/getGiftList?org_id="+appSession.orgid, "GET", null, { }).then(function (res) {
                    if (res.result == "1") {
                        vm.gifts = res.data;
                    } else {
  
                        abp.notify.error(res.errMsg);
                    }
                });

            }
            vm.initgift();


            vm.init = function () {
                if (model.id) {
                    dataFactory.action("api/card/getCard?id=" + model.id, "GET", null, {}).then(function (res) {
                        if (res.result == "1") {
                            vm.model = res.data;
                            vm.model.least_cost = vm.model.least_cost /100;
                            vm.model.reduce_cost = vm.model.reduce_cost / 100;
                        } else {
                            abp.notify.error("获取失败,请重试");
                        }
                    });
                }
            }
            vm.init();
        }]);
