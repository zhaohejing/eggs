(function () {
    angular.module('MetronicApp').controller('views.plan.modify',
        ['$scope', 'settings', '$uibModal', '$state', '$stateParams', 'dataFactory',
        function ($scope, settings, $uibModal, $state, $stateParams, dataFactory) {
            $scope.$on('$viewContentLoaded', function () {
                // initialize core components
                App.initAjax();
            });
            var vm = this;
            vm.planId = $stateParams.id;
            //场景
            vm.scenes = [{ scene_type: 1, scene_name: "购买之后" }, { scene_type: 2, scene_name: "每日游戏" }];
            //代金券类型
            vm.type = [{ id: 1, name: "代金券" }, { id: 2, name: "折扣券" }, { id: 3, name: "礼品券" }];
            //游戏类型
            vm.games = [{ id: 1, name: "砸蛋" }, { id: 2, name: "飞镖" }];
            vm.temp = {};
            vm.plan = {};
            vm.cardtable = [];
            vm.sence = { scene_type: 1 };
            vm.cards = [];
            if (vm.planId) {
                dataFactory.action("api/plan/getPlan?id=" + vm.planId, "GET", null, {})
                  .then(function (res) {
                      if (res.result == "1") {
                          vm.plan = res.data;
                          for (var i = 0; i < vm.plan.resources.length; i++) {
                              vm.plan.resources[i].order = i;
                          }
                          vm.cardlist = vm.plan.resources;
                      }
                  });
            }
            //选择分类
            vm.selectcate = function () {
                if (!vm.tempcate) {
                    return;
                }
                var arr = [];
                if (vm.cardtable.length > 0) {
                    angular.forEach(vm.cardtable, function (v, i) {
                        arr.push(v.card_id);
                    });
                }
                dataFactory.action("api/plan/getCardList", "", null, { card_type: vm.tempcate.id, card_ids: arr })
                .then(function (res) {
                    if (res.result == "1") {
                        vm.cards = res.data;

                    }
                });
            }
            //选择卡片
            vm.selectcard = function () {
                vm.temp.card_type = vm.tempcate.id;
                vm.temp.card_id = vm.tempcard.card_id;
                vm.temp.title = vm.tempcard.title;
                vm.temp.quantity = vm.tempcard.quantity;
                vm.temp.winning_rate = 0;
            }
            vm.t = {
                list: [], select: [], init: function () {
                    dataFactory.action("api/tips/getTipsList", "", null, { pageNum: 1, pageSize: 999 })
              .then(function (res) {
                  if (res.result == "1") {
                      angular.forEach(res.list, function (v, i) {
                          v.ticked = false;
                          vm.t.list.push(v);
                      })
                  }
              });
                }
            };
            vm.t.init();
            vm.o = {
                coll: [],
                final: {},
                org: {}, point: {}, device: {},
                orgs: [],
                points: [],
                devices: [],
                getorgs: function () {
                    dataFactory.action("api/plan/selectOrgList", "GET", null, {})
                .then(function (res) {
                    if (res.result == "1") {
                        vm.o.orgs = res.data;
                    }
                });
                },
                getpoints: function () {
                    if (!vm.o.org) {
                        return;
                    }
                    dataFactory.action("api/plan/selectSpotList?org_id=" + vm.o.org.org_id, "GET", null, {})
                 .then(function (res) {
                     if (res.result == "1") {
                         vm.o.points = res.data;
                     }
                 });
                },
                getdevices: function () {
                    if (!vm.o.point) {
                        return;
                    }
                    dataFactory.action("api/plan/selectMachineList?spot_id=" + vm.o.point.spot_id, "GET", null, {})
                 .then(function (res) {
                     if (res.result == "1") {
                         vm.o.devices = res.data;
                     }
                 });
                },
                selectOrg: function () {
                    vm.o.getpoints();
                },
                selectPoint: function () {
                    vm.o.getdevices();
                },
                selectDevice: function () {
                    vm.o.final.machine_code = vm.o.device.machine_code;
                },
                add: function () {
                    if (vm.o.org.org_id) {
                        vm.o.final.org_id = vm.o.org.org_id;
                        vm.o.final.org_name = vm.o.org.org_name;
                    }
                    if (vm.o.device.machine_code) {
                        vm.o.final.machine_name = vm.o.device.machine_name;
                        vm.o.final.machine_code = vm.o.device.machine_code;
                    }
                    if (vm.o.point.spot_id) {
                        vm.o.final.spot_id = vm.o.point.spot_id;
                        vm.o.final.spot_name = vm.o.point.spot_name;
                    }

                    vm.o.coll.push(vm.o.final);
                    vm.o.final = {};
                    vm.o.org = {};
                    vm.o.point = {};
                    vm.o.device = {};
                },
                remove: function (row) {
                    vm.o.coll.splice($.inArray(row, vm.o.coll), 1);
                }
            }
          
           




            vm.cancel = function () {
                $state.go("plan");
            }
            vm.add = function () {
                if (!vm.temp.card_id) {
                    abp.notify.warn("请选则卡片再添加"); return;
                }
                else if (vm.temp.winning_rate > 70) {
                    abp.notify.warn("单个中奖概率最好为70%"); return;
                }
                vm.cardtable.push(vm.temp);
                vm.tempcate = {};
                vm.tempcard = {};
                vm.temp = {};
            }
            vm.o.getorgs();
            //保存
            vm.save = function () {
                if (vm.checktable.length <= 0) {
                    abp.notify.warn("请选择资源");
                    return;
                }
                vm.plan.resourceIds = _.map(vm.checktable, function (item) {
                    return item.id
                });
                var url = vm.plan.id && vm.plan.id > 0 ? "api/package/update" : "api/package/add";
                vm.plan.state = vm.plan.state ? 1 : 0;
                dataFactory.action(url, "", null, vm.plan).then(function (res) {
                    if (res.result == "1") {
                        abp.notify.success("成功");
                        $state.go("adsensepack");
                    } else {
                        abp.notify.error(res.errorMsg);
                    }
                })
            }
            vm.remove = function (row) {
                vm.cardtable.splice($.inArray(row, vm.cardtable), 1);
            }
        }]);
})();

