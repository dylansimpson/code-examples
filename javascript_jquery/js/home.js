(function(Module){
  
  // Search Module - controls search bar on home page
  Module.register("search", "ideaList" , function(Sandbox){
    var Public = {},
        Private = {};

    Public.init = function(templates) {
      Sandbox.docReady(function(){
        Sandbox.$("#search-form").on('submit', function(e) {
          var term = Sandbox.$('#search-field').val(),
              merged;

          e.preventDefault();

            Sandbox.request({
              url: '/ideabox/ideas/search/{"title":"' + term + '"}',
              success: function(data){
                
                var i, len = data.length, merged,
                ideasList = Sandbox.$("#ideasList"),
                ideaData= {ideaList:[]},
                postDate, fullName, firstName, lastName, 
                commentCount = data.commentCount;
                
                //Catching the null return from the API
                if(!commentCount){
                  commentCount = 0;
                }
                //Delete all the html that loaded
                ideasList.html('');

                //Limit to 10 results
                if(len > 10){len=10}
                //Building out the idea list
                for (i=0; i < len; i++){
                  postDate = data[i].created.substring(0, data[i].created.length - 11);
                  fullName = data[i].user.fullName.split(" ");
                  firstName = fullName[0];
                  lastName = fullName[1].charAt(0);
                  ideaData.ideaList =({
                    'idea': data[i].text,
                    'ideaID': data[i].id,
                    'createdDate': postDate,
                    'commentCount': commentCount || '0',
                    'userName': firstName + " " + lastName || 'user',
                    'gravatar' : data[i].user.gravatar,
                    'voteCount' : data[i].score,
                    'title' : data[i].title,
                    'status': data[i].status
                  });

                  //Rendering out the info to the page
                  merged = Sandbox.mergeTemplate(templates.ideaList, ideaData);
                  //Write new data to page
                  ideasList.append(merged);
                  //Limiting the text displayed on the page

                }
                Sandbox.$('#ideasList .idea').fadeOut(0).fadeIn(500);
                Sandbox.$('p.ideaList-txt').css("height", "39");

                //Render the total amount of ideas
                Sandbox.$('.total-ideas').text('Results - ' + len + ' Ideas')

                Sandbox.request({
                  url: "/ideabox/users/whoami",
                  success: function(data){
                    var userId = data.id,
                        voteCount = data.voteCount;
                     
                    Sandbox.$(".vote-btn").on('click', function(e){
                      //Find the idea id 
                       var voteIdString = Sandbox.$(e.target).parent().parent().find('a').attr('href');
                           id = voteIdString.split('#');
                           console.log(id);
                        if(voteCount > 0){
                          Sandbox.request({
                            url : '/ideabox/votes/',
                            type : 'post',
                            data : { 
                                      'ideaId' : id[1]         
                                    },                      
                            success: function(data){
                              var voteCurrentCount, userVotes;
                              //Find the current vote total and increase it by one
                              voteCurrentCount = Sandbox.$(e.target).prev().prev().text();
                              voteCurrentCount++;
                              //Write the new value to DOM
                              Sandbox.$(e.target).prev().prev().text(voteCurrentCount);
                              
                              //Updating the User Vote Count
                              userVotes = Sandbox.$('.label strong').text();
                              userVotes--;
                              Sandbox.$('.label strong').text(userVotes);
                            }
                          });
                        }
                    });
                  }
                }); 
              }
            });
        });
      });
    };

    Public.destroy = function(){};

    return Public;

  });
  
  // IdeaList Module - controls ideas display on home page
  Module.register("ideaList", ["ideaList","adminPanel"], function(Sandbox){
    var Public = {},
        Private = {};

    Public.init = function(templates) {
      Private.renderIdeas(templates);
      Sandbox.listen("categoryChange", function(data){
        Private.updateIdeas(templates.ideaList, data);
      });
    };

    Private.renderIdeas = function(templates, response) {
      Sandbox.docReady(function(){

        var onSuccess = function(data) {
          var i, len = data.length, merged,
          ideasList = Sandbox.$("#ideasList"),
          ideaData= {ideaList:[]},
          postDate, fullName, firstName, lastName;

          //Limit to 10 results
          if(len > 10){len=10}
          //Build list
          for (i=0; i < len; i++){
            postDate = data[i].created.substring(0, data[i].created.length - 9);
            fullName = data[i].user.fullName.split(" ");
            firstName = fullName[0];
            lastName = fullName[1].charAt(0);
            ideaData.ideaList =({
              'title' : data[i].title,  
              'ideaID': data[i].id,
              'idea': data[i].text,
              'createdDate': postDate,
              'commentCount': data[i].commentCount || '0',
              'userName': firstName + " " + lastName || 'user',
              'gravatar' : data[i].user.gravatar,
              'voteCount' : data[i].score,
              'userId': data[i].userId,
              'status': data[i].status
             });

            merged = Sandbox.mergeTemplate(templates.ideaList, ideaData);
            ideasList.append(merged);
          }

          //Render the total amount of ideas
          Sandbox.$('.total-ideas').text('All - ' + len + ' Ideas')

          Sandbox.$('#ideasList .idea').fadeOut(0).fadeIn(500);
          Sandbox.$('p.ideaList-txt').css("height", "39");
        
          Sandbox.notify({
                name: 'signedIn'
             });
          
          // Requesting the current user's info and storing it in a cookie
          Sandbox.request({
            url: "/ideabox/users/whoami",
            success: function(data){
              var email = data.email,
                  fullName = data.fullName.split(' '),
                  firstName = fullName[0],
                  lastName = fullName[1],
                  gravatar = data.gravatar,
                  id = data.id,
                  voteCount = data.voteCount,
                  admin, permissions= [],
                  permissionsData = {permissionList: []},
                  mergedPermissions;

                  if(data.permissions.length > 1){
                    admin = 1
                  }else{
                    admin = 0
                  }
                  
                  for (i=0; i<data.permissions.length; i++){
                    permissions.push(data.permissions[i].tag)
                  }

              //Show the admin feature for admins
              if(admin){
                Sandbox.$('#adminPanel').show();
                for(i=0; i<data.permissions.length; i++){
                  permissionsData.permissionList = ({
                    'adminPermissions' : permissions[i]
                  })
                  Sandbox.mergeTemplate(templates.adminPanel, permissionsData);
                  mergedPermissions = Sandbox.mergeTemplate(templates.adminPanel, permissionsData);
                  Sandbox.$('#adminPanel').append(mergedPermissions)
                }                 
              }
              
              $.cookie('ideabox', "email&"+email+"&fullName&"+fullName+"&id&"+id+"&voteCount&"+voteCount+"&gravatar&"+gravatar+"&admin&"+admin+"&permissions&"+permissions, {expires: 7, path: '/'});

              if($.cookie('ideabox') !== null){
                Sandbox.$('#user-login').html('<p class="label">Hi ' + firstName + ', you have <strong>' + voteCount + '</strong> votes left</p><span id="logout">Log out</span>');//
              }

              Sandbox.$(".vote-btn").on('click', function(e){
                // Find the idea id 
                var voteIdString = Sandbox.$(e.target).parent().parent().find('a').attr('href'),
                    id = voteIdString.split('#');
                  if(voteCount > 0){
                    Sandbox.request({
                      url : '/ideabox/votes/',
                      type : 'post',
                      data : { 
                                'ideaId' : id[1]         
                              },                      
                          success: function(data){
                            var voteCurrentCount, userVotes;
                            //Find the current vote total and increase it by one
                            voteCurrentCount = Sandbox.$(e.target).prev().prev().text();
                            voteCurrentCount++;
                            //Write the new value to DOM
                            Sandbox.$(e.target).prev().prev().text(voteCurrentCount);
                            
                            //Updating the User Vote Count
                            userVotes = Sandbox.$('.label strong').text();
                            userVotes--;
                            Sandbox.$('.label strong').text(userVotes);
                          }
                    });
                  }
              });

              // log out
              Sandbox.$('#logout').on('click',function(e){
                //Our cookies & sessions
                $.cookie('ideabox', null, {path: "/"});
                $.cookie('JSESSIONID', null,{path: "/ideabox"});
                window.location.href="/ideabox/j_spring_security_logout"

              });
            }
          }); 
        }
        // Why we need the following functions:
        // Instead of manually hitting the API link, 
        // we load it in the hidden iframe
        // which is like we went to the page.
        // Then for that request, 
        // we parse the JSON returned in the iframe
        // and send it to the function that puts it on the page.
        // We only take that step when the ajax request fails
        // which is only the first time after auth

       var onFailure = function () {
          if($.cookie('ideabox') != null && Sandbox.getUserInfo().permissions.length > 1) {

          }  
          $('body').append('<iframe id="dave" style="display:none;" src="http://'+location.host+'/ideabox/users/whoami"></iframe>');
          var iframe = document.getElementById('dave');
          iframe.onload = function () {
            var that = $(this); 
            var jsonText = that.contents().find('pre').text();
            var obj = $.parseJSON(jsonText);
            // obj == user info
            var queryUrl = 'ideabox/ideas/',
                queryTerms = '';
            if (obj.permissions.length > 1) {
                var perms = [];
               for (var i =0; i<obj.permissions.length; i++){
                perms.push(obj.permissions[i].tag);
               }
               queryTerms=JSON.stringify(perms);

               queryUrl += 'search/' + encodeURIComponent('{"status":"=1","category":' + queryTerms + '}');

            }
            $('body').append('<iframe id="dylan" style="display:none;" src="http://'+location.host+'/'+queryUrl+'"></iframe>');
            var iframe = document.getElementById('dylan');
            iframe.onload = function () { 
              var that = $(this); 
              var jsonText = that.contents().find('pre').text();
              onSuccess($.parseJSON(jsonText)); 
            };
          };
        };
          
          var queryUrl = '/ideabox/ideas/';
          if($.cookie('ideabox') != null && Sandbox.getUserInfo().permissions.length > 1)
            {
           var queryTerms = JSON.stringify(Sandbox.getUserInfo().permissions.split(","));
               queryUrl += 'search/{"status":"=1","category":' + queryTerms + '}';
            }
        
        Sandbox.request({
          url: queryUrl,
          beforeSend: function(){ Sandbox.$('#loading').show(); },
          complete: function (){},
          success: function(data){
                
             Sandbox.$('#loading').hide();
             onSuccess(data);
           },
           error: function(err){
            Sandbox.$('#loading').hide();
             var redirect = window.location.href.indexOf('TARGET') === -1;
             if (redirect) {
               window.location.href = ''+ location.host;
             } else {
              onFailure();
             }
           }
        });
      });
    };

    Private.updateIdeas = function(template, data) {
      Sandbox.docReady(function(){
        var requestUrl = data.response.url,
            category = data.response.category;

             Sandbox.request({
              url: requestUrl,
              beforeSend: function(){ Sandbox.$('#loading').show(); },
              complete: function (){},
              success: function(data){
                
                Sandbox.$('#loading').hide();

                var i, len = data.length, merged,
                ideasList = Sandbox.$("#ideasList"),
                ideaData= {ideaList:[]},
                postDate, fullName, firstName, lastName, 
                commentCount = data.commentCount;
               
                //Catching the null return from the API
                if(!commentCount){
                  commentCount = 0;
                }

                //Count the number of ideas & update the index.html page
                Sandbox.$('.total-ideas').text(category + ' - ' + len + ' Ideas')

                //Delete all the html that loaded
                ideasList.html('');

                //Limit to 10 results
                if(len > 10){len=10}
                //Building out the idea list
                for (i=0; i < len; i++){    
                  postDate = data[i].created.substring(0, data[i].created.length - 9);
                  fullName = data[i].user.fullName.split(" ");
                  firstName = fullName[0];
                  lastName = fullName[1].charAt(0);
                  ideaData.ideaList =({
                    'title' : data[i].title,
                    'ideaID': data[i].id,  
                    'idea': data[i].text,
                    'createdDate': postDate,
                    'commentCount': commentCount || '0',
                    'userName': firstName + " " + lastName || 'user',
                    'gravatar' : data[i].user.gravatar,
                    'voteCount' : data[i].score,
                    'userId': data[i].userId,
                    'status': data[i].status
                  });

                  //Rendering out the info to the page
                  merged = Sandbox.mergeTemplate(template, ideaData);
                  //Write new data to page
                  ideasList.append(merged);
                
                }

                Sandbox.$('#ideaList .idea').fadeOut(0).fadeIn(500);
                Sandbox.$('p.ideaList-txt').css("height", "39");

                Sandbox.request({
                  url: "/ideabox/users/whoami",
                  success: function(data){
                    var id = data.id,
                        voteCount = data.voteCount;
                    
                    Sandbox.$(".vote-btn").on('click', function(e){
                      // Find the idea id 
                      var voteIdString = Sandbox.$(e.target).parent().parent().find('a').attr('href'),
                          id = voteIdString.split('#');
                        if(voteCount > 0){
                          Sandbox.request({
                            url : '/ideabox/votes/',
                            type : 'post',
                            data : { 
                                      'ideaId' : id[1]         
                                    },                      
                            success: function(data){
                              var voteCurrentCount, userVotes;
                              
                              //Find the current vote total and increase it by one
                              voteCurrentCount = Sandbox.$(e.target).prev().prev().text();
                              voteCurrentCount++;
                              
                              //Write the new value to DOM
                              Sandbox.$(e.target).prev().prev().text(voteCurrentCount);
                              
                              //Updating the User Vote Count
                              userVotes = Sandbox.$('.label strong').text();
                              userVotes--;
                              Sandbox.$('.label strong').text(userVotes);
                            }
                          });
                        }
                    });
                  }
                }); 
              }
            });
      });
    };
    Public.destroy = function(){};

    return Public;
  });

  Module.register("updateCategories", null, function(Sandbox){
    var Public = {},
        Private = {};

    Public.init = function(template) {
          Sandbox.docReady(function(){
            var categoriesArray =[];
            Sandbox.$("#category-container").on('click', function(e){

              var category, requestUrl,
                  target = e.target;

              if (Sandbox.$(e.target).is('a') && Sandbox.$(e.target).parent().parent().hasClass('categories') ){
                e.preventDefault();
                Sandbox.$('.categories').children().children().removeClass("active");
                target.className ='active';
                category = Sandbox.$(e.target).attr('href');
                  
                requestUrl = '/ideabox/ideas/category/' + category

                  Sandbox.notify({
                    name: 'categoryChange', 
                    response:{
                      'url': requestUrl,
                      'category': category
                    } 
                  });
                  
                  Sandbox.$('#sort').val("Oldest");
                }
            });   
          });
    };

    Public.destroy = function(){};

    return Public;
  });

  Module.register("sortIdeas", null, function(Sandbox){
      var Public = {},
          Private = {};

      Public.init = function(templates) {
        Sandbox.docReady(function(){
          Sandbox.$('#sort').on('change', function(e){
            
            var queryString, categoryString,
                sortValue = Sandbox.$('#sort').val(),
                category = Sandbox.$('.active').attr('href');

                if(category == 'All'){
                  categoryString = ''
                }else{
                  categoryString = '"category":"' + category + '",' ;
                }

              switch(sortValue)
                {
                case 'Most Votes':
                  queryString = 'ideabox/ideas/search/{' + categoryString + '"order":"score desc"}';
                  Sandbox.notify({
                    name: 'categoryChange', 
                    response:{
                      'url': queryString,
                      'category': category
                    } 
                  });
                  break;
                case 'Least Votes':
                  queryString = 'ideabox/ideas/search/{' + categoryString + '"order":"score"}';
                  Sandbox.notify({
                    name: 'categoryChange', 
                    response:{
                      'url': queryString,
                      'category': category
                    } 
                  });
                  break;
                case 'Newest':
                  queryString = 'ideabox/ideas/search/{' + categoryString + '"order":"id desc"}';
                  Sandbox.notify({
                    name: 'categoryChange', 
                    response:{
                      'url': queryString,
                      'category': category
                    } 
                  });
                  break;
                case 'Oldest':
                  queryString = 'ideabox/ideas/search/{' + categoryString + '"order":"id"}';
                  Sandbox.notify({
                    name: 'categoryChange', 
                    response:{
                      'url': queryString,
                      'category': category
                    } 
                  });
                  break;
                default:
                  //Never should get here;
                }
          });
        });
      };

      Public.destroy = function(){};

      return Public;
  });
}(hb.Core));
