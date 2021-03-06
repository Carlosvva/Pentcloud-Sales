app.controller('partnersController', function($scope, $rootScope, $state, $timeout, $http, api, localStorage, $mdToast, dialog, $mdDialog) {
    //Variables & defaults
    $scope.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    $scope.filterInitial = "";



    $scope.tableHeaders = [{
        title:'NAME'
    },{
        title:'EMAIL'
    },{
        title:'CONTRASEÑA'
    },{
        title:'PERFIL'
    }];


    //Methods definition

    $scope.filterLetter = function(letter){
        if(letter == $scope.filterInitial){
            $scope.filterInitial = "";
        }else{
            $scope.filterInitial = letter;
        }
    };

    $scope.gopartner = function(partner){
        $rootScope.inpartner = partner;
        $state.go('main.partner', { id : ''+partner.id } );
    }

    // Fetch data

    api.partner.getAll({
        success : function(data){
            console.log(data);
            $scope.partners = data;       
        },
        error : function(error){
            console.log(error);
        }
    })

    // Actions

    $scope.newPartner = {
        form : {
            fields : {
                name : '',
                email : '',
                password : '',
                confirm : '',
                profile : 0,
            },
            create  : function(){
                api.profile.getAll({
                    params : 'entity=1&id&name',
                    success : function(data){
                        console.log(data);
                        $scope.profiles = data;
                    },
                    error : function(error){
                        console.log(error);
                    }
                })
                dialog.create({
                  "title" : "Nuevo Partner",
                  "body": "<div layout='row' layout-wrap>"+
                    '<md-input-container flex="100">'+
                        '<label>Nombre</label>'+
                        '<input ng-model="newPartner.form.fields.name">'+
                    '</md-input-container>'+
                    '<md-input-container flex="100">'+
                        '<label>Email</label>'+
                        '<input ng-model="newPartner.form.fields.email">'+
                    '</md-input-container>'+
                    '<md-input-container flex="100">'+
                        '<label>Contraseña</label>'+
                        '<input ng-model="newPartner.form.fields.password">'+
                    '</md-input-container>'+
                    '<md-input-container flex="100">'+
                        '<label>Confirmar contraseña</label>'+
                        '<input ng-model="newPartner.form.fields.confirm">'+
                    '</md-input-container>'+
                    '<md-input-container flex="100" ng-show="profiles.length > 0">'+
                        '<md-select ng-model="newPartner.form.fields.profile" placeholder="Selecciona un perfil">'+
                            '<md-option ng-value="{{profile.id}}" ng-repeat="profile in profiles">{{profile.name}}</md-option>'+
                        '</md-select>'+
                    '</md-input-container>'+
                  "</div>",
                  "data": "",
                  "buttons": [
                    {
                      "text": "Crear",
                      "action" : "newPartner.create"
                    },
                    {
                      "text": "Cancelar"
                    }
                  ]
                })
            },
            validate : function(){
                
                
                var error = {
                    count : 0,
                    message : "<p>Debe llenar los siguientes campos:</p><p>",
                    check : false
                }

                var form = $scope.newPartner.form.fields;
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                if(form.name == ''){
                    error.count ++;
                    error.message = error.message + 'Nombre, ';
                }
                if(form.email == ''){
                    error.count ++;
                    error.message = error.message + 'Email, ';
                }
                if(form.password == ''){
                    error.count ++;
                    error.message = error.message + 'Contraseña, ';
                }
                if(form.confirm == ''){
                    error.count ++;
                    error.message = error.message + 'Confirmar contraseña, ';
                }

                // Trim string
                error.message = error.message.substring(0, error.message.length-2) + ' .</p> '

                var testMail = re.test(form.email);

                if(!testMail){
                    error.count ++;
                    error.message = error.message + '<p>Ingresa un Email válido.</p>';
                }

                if(form.password != form.confirm){
                    error.count ++;
                    error.message = error.message + '<p>Las contraseñas no coinciden.</p>';
                }

                if(error.count > 0){
                    error.check = false;
                }else{
                    error.check = true;
                }

                return error;
            }
        },
        create : function(){
            var error = $scope.newPartner.form.validate();
            if(error.check){
                $rootScope.coreDialog = null;
                api.partner.create({
                    partner : $scope.newPartner.form.fields,
                    success : function(data){
                        console.log('data');
                        console.log(data);
                        // $scope.customers.push(data);
                        $timeout(function(){
                            
                            $timeout(function(){
                                $mdToast.showSimple('¡Partner creado correctamente!');
                            }, 1000)
                        },1000)
                        $scope.gopartner(data);
                    },
                    error : function(error){
                        console.log(error);
                    }
                })
            }else{
                var confirm = $mdDialog.confirm()
                      .title('Formulario incompleto.')
                      .content(error.message)
                      .ok('Completar formulario')
                $mdDialog.show(confirm).then(function(){});
            }
        }
    }
    
//check if access
if(!$rootScope.profile.partners.module){
    var none = true;
    if($rootScope.profile.customers.module){
        $state.go('main.customers');
        none = false;
    }
    if($rootScope.profile.partners.module){
        $state.go('main.partners');
        none = false;
    }
    if($rootScope.profile.agents.module){
        $state.go('main.agents');
        none = false;
    }
    if($rootScope.profile.profiles.module){
        $state.go('main.profiles');
        none = false;
    }
    if(none){
        location.href="http://www.pentcloud.com"
    }
}

});