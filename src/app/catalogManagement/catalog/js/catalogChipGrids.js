angular.module('orderCloud')
    .controller('CatalogChipGridsCtrl', CatalogChipGridsController)
    .controller('CatalogChipGridCtrl', CatalogChipGridController);

function CatalogChipGridsController(Parameters, ChipGrids) {
    let vm = this;
    vm.grids = ChipGrids;
    vm.parameters = Parameters;
}

function CatalogChipGridController(OrderCloudSDK, $q, $timeout, toastr, Parameters, SelectedCategory, GridSections) {
    let vm = this;
    vm.parameters = Parameters;
    vm.chipGrid = SelectedCategory;
    vm.sections = GridSections;
    vm.rowData = {};

    setGrid(vm.sections[0]);

    vm.setSection = function(section) {
        vm.selectedSection = section;
        vm.initialPositions = _.map(vm.selectedSection.Assignments, 'ProductID');
        setGrid(vm.selectedSection);
    };

    function setGrid(section) {
        $timeout( () => {
            $('.gridly').gridly({
                columns: Number(section.xp.Columns) * 2,
                callbacks: {
                    reordered: function($elements) {
                        vm.updatedPositions = [];
                        angular.forEach($elements, function(elem) {
                            vm.updatedPositions.push(elem.innerText);  
                        });
                    }
                }
              });
            $('.gridly').gridly('draggable', 'on');
        }, 50);
    }

    vm.saveSection = function() {
        let updateQueue = [];
        vm.loading = {backdrop:false};
        _.each(vm.updatedPositions, function(productID, index) {
            if (vm.initialPositions.indexOf(productID) != index) updateQueue.push(productID);
        });
        if (updateQueue.length) {
            let saveAssignmentsQueue = [];
            _.each(updateQueue, function(productID, key) {
                let assignment = {
                    CategoryID: vm.selectedSection.ID,
                    ProductID: productID,
                    ListOrder: key + 1
                };
                saveAssignmentsQueue.push(OrderCloudSDK.Categories.SaveProductAssignment(vm.parameters.catalogid, assignment));
            });
            vm.loading.promise = $q.all(saveAssignmentsQueue).then( () => {
                toastr.success('Layout saved for ' + vm.selectedSection.Name);
            });
        }
    };
}