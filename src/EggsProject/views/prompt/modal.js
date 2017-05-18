angular.module('MetronicApp').controller('views.adsense.modal',
    ['$scope', 'settings', '$uibModalInstance', 'model', 'FileUploader', 'dataFactory', '$qupload',
        function ($scope, settings, $uibModalInstance, model, fileUploader, dataFactory, $qupload) {
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();

            });
            var vm = this;
            vm.type = [{ id: 1, name: '图片' }, { id: 2, name: '视频' }]
            vm.model = {};
            vm.url = "api/resource/add";
            if (model.id && model.id > 0) {
                vm.url = "api/resource/update";
                dataFactory.action("api/resource/detail", "", null, { id: model.id }).then(function (res) {
                    if (res.result == "1") {
                        vm.model = res.data;
                        if (vm.model.title) {
                            vm.selectFiles = [{ file: { name: vm.model.title }, progress: { p: 100 } }];
                        }
                    }
                })
            }
            dataFactory.action("api/qiniu/token", "", null, { }).then(function (res) {
                    if (res.result == "1") {
                        vm.token = res.data;
                    }
                })
            var url = 'http://up-z1.qiniu.com/';
            vm.uploadresult = false;
            vm.save = function () {
                if (!vm.model.id && (!vm.model.address || vm.model.address == undefined || vm.model.address == null)) {
                    abp.notify.warn("请先上传资源");
                    return;
                }
                vm.model.state = vm.model.state ? 1 : 0;
                dataFactory.action(vm.url, "", null, vm.model).then(function (res) {
                    if (res.result == "1") {
                        $uibModalInstance.close();
                    } else {
                        abp.notify.error("保存失败,请重试");
                    }
                });
            };
            vm.cancel = function () {
                $uibModalInstance.dismiss();
            };
            vm.selectFiles = [];
            vm.start = function (index) {
                vm.selectFiles[index].progress = {
                    p: 0
                };
                vm.selectFiles[index].upload = $qupload.upload({
                    key: '',
                    file: vm.selectFiles[index].file,
                    token:vm.token
                });
                vm.selectFiles[index].upload.then(function (response) {
                    //  vm.model.address = response.address;
                    vm.model.address = "http://7niu.efanyun.com/" + response.key;
                    vm.model.title = vm.selectFiles[index].file.name;
                    vm.uploadresult = true;
                }, function (response) {
                    abp.notify.error("上传失败,请重试");
                }, function (evt) {
                    // progress
                    vm.selectFiles[index].progress.p = Math.floor(100 * evt.loaded / evt.totalSize);
                });
            };

            vm.abort = function () {
                //  vm.model.address = response.address;
                vm.model.address = null;
                vm.model.title = null;
                vm.selectFiles=[];
            };
            vm.onFileSelect = function ($files) {
                vm.selectFiles = [];
                var offsetx = vm.selectFiles.length;
                for (var i = 0; i < $files.length; i++) {
                    vm.selectFiles[i + offsetx] = {
                        file: $files[i]
                    };
                    vm.start(i + offsetx);
                }
            };
        }]);
