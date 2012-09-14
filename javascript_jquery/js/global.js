(function(Module){
 
   Module.register("ideaTicker", "newIdeas", function(Sandbox){
    var Public = {},
        Private = {};

    Public.init = function(templates) {
      Sandbox.listen("signedIn", function(data){
        Private.renderIdeas(templates.newIdeas);
      });
      Sandbox.listen("ideaSubmitted", function(data){
        Private.updateIdeas(templates.newIdeas, data);
      });
    };

    Private.renderIdeas = function(template, response) {
      Sandbox.docReady(function(){
       getNewIdeas();
       Sandbox.$('#new-ideas').fadeOut(0).fadeIn(500);
        setInterval(getNewIdeas, 5000);

        function getNewIdeas (){
          var count = 0;
          count++;
          if (count === 1 || count > 2){

          Sandbox.request({
              url: '/ideabox/ideas/',
              success: function (data) {
                 var i, len = data.length, merged,
                  ideasList = Sandbox.$("#new-ideas"),
                  ideaData= {ideaList:[]},
                  postDate, fullName, firstName, lastName;

                ideasList.html(' ');

                for (i=len - 1; i > (len - 16); i--){
                  postDate = data[i].created.substring(0, data[i].created.length - 9);
                  fullName = data[i].user.fullName.split(" ");
                  firstName = fullName[0];
                  lastName = fullName[1].charAt(0);
                  ideaData.ideaList =({
                    'ideaID': data[i].id,
                    'ideaTitle': data[i].title,
                    'createdDate': postDate,
                    'userName': firstName + " " + lastName || 'user',
                    'gravatar' : data[i].user.gravatar,
                    'category' : data[i].category.tag
                  });
                      
                    merged = Sandbox.mergeTemplate(template, ideaData);
                      
                    ideasList.append(merged);
                      
                    Sandbox.$('p.idea-txt').css("height", "39");
                }
               }
          });
        }

        };       
      });

    };

    Private.updateIdeas = function(template, data) {
      Sandbox.docReady(function(){
        var ideaTxt = data.response.ideaTxt,
            ideaData = {ideaList:[]}, merged,
            ideasList = Sandbox.$("#new-ideas");

            ideaData.ideaList =({
                'idea': data.response.ideaTxt,
                'gravatar': data.response.gravatar
             });

        merged = Sandbox.mergeTemplate(template, ideaData);
              
        ideasList.prepend(merged).children(':first-child').hide().show(1000);
        ideasList.children().last().hide('slow', function(){ Sandbox.$(this).remove()});

      });
    };
    Public.destroy = function(){};

    return Public;
  });

}(hb.Core));