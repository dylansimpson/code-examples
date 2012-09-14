(function(Module){

	Module.register('ideaView', 'ideaView', function(Sandbox){
		var Public = {},
			Private = {};

		Public.init = function(templates){
			Sandbox.docReady(function(){
				var id = window.location.hash.replace('#','');
          		Sandbox.request({
          			url: '/ideabox/ideas/'+ id,
          			success: function(data){
          				var merged,
          					postDate = data.created.substring(0, data.created.length - 9),
          					fullName = data.user.fullName.split(" "),
            				firstName = fullName[0],
            				lastName = fullName[1].charAt(0),
          					ideaData = {
	          					'idea': data.text,
	          					'createdDate': postDate,
	          					'userName': firstName + " " + lastName || 'user',
              					'gravatar' : data.user.gravatar,
              					'voteCount' : data.score,
              					'tags' : data.tags,
              					'title' : data.title,
              					'status': data.status,
              					'category' : data.category.tag
	          				};
	          				
	          			merged = Sandbox.mergeTemplate(templates.ideaView, ideaData);
	          			$('#idea-content').prepend(merged);

		          		Sandbox.request({
		                  url: "/ideabox/users/whoami",
		                  success: function(data){
		                    var userId = data.id,
		                        voteCount = data.voteCount;
		                     
		                    Sandbox.$(".ideaView-vote-btn").on('click', function(e){
		                      
		                        if(voteCount > 0){
		                          Sandbox.request({
		                            url : '/ideabox/votes/',
		                            type : 'post',
		                            data : { 
		                                      'ideaId' : id         
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
						if(Sandbox.getUserInfo().admin){
							var newStatus, newCategory, statusUpdate, categoryUpdate, newStatusName;
							Sandbox.$('#edit').html('<a href="#">Edit</a>');

							Sandbox.$('#edit').toggle(function(e){
								e.preventDefault();
								Sandbox.$('#edit a').text('Save');
								Sandbox.$('#edit-category').html(
									'<select class="recategorize"> /'+
										'<option value="CLT">CLT</option> /'+
										'<option value="Tech">Tech</option> /'+
										'<option value="Marketing">Marketing</option> /'+
										'<option value="Website">Website</option> /'+
										'<option value="Finance">Finance</option> /'+
										'<option value="Merch">Merch</option> /'+
										'<option value="Downtown">Downtown</option> /'+
										'<option value="Content">Content</option> /'+
										'<option value="Facilities">Facilities</option> /'+
										'<option value="HelpDesk">Help Desk</option> /'+
										'<option value="HR">Human Resources</option> /'+
										'<option value="InfoSec">Info Sec</option> /'+
										'<option value="Insights">Insights</option> /'+
										'<option value="Benefits">Benefits</option> /'+
										'<option value="Mobile">Mobile</option> /'+
										'<option value="Pipeline">Pipeline</option> /'+
										'<option value="Couture">Couture</option> /'+
										'<option value="SF">San Francisco</option> /'+
									'</select>'
								);
								Sandbox.$('#ideaView-status').html(
									'<select class="restatus"> /'+
										'<option value="1">Pending</option> /'+
										'<option value="3">Accepted</option> /'+
										'<option value="2">Declined</option> /'+
										'<option value="4">Flagged</option> /'+
									'</select>'
								);
								Sandbox.$('.status-icon').hide();
					
								newCategory = Sandbox.$('.recategorize').val(),
								newStatus = Sandbox.$('.restatus').val();

								Sandbox.$('.recategorize').change(function(){
									newCategory = Sandbox.$('.recategorize').val();
								});
								Sandbox.$('.restatus').change(function(){
									newStatus = Sandbox.$('.restatus').val();
								});
							}, function(e){	
								e.preventDefault();	
								Sandbox.request({
									url: "/ideabox/ideas/update",
									type: "post",
									data: {
										'id': id,
										'status': newStatus,
										'tag': newCategory
									},
									success: function(){
										statusUpdate = "success";
										categoryUpdate = "success";
										if(statusUpdate == "success" && categoryUpdate == "success"){
											if(newStatus == 1){newStatusName = "Pending"}
											if(newStatus == 2){newStatusName = "Declined"}
											if(newStatus == 3){newStatusName = "Accepted"}
											if(newStatus == 4){newStatusName = "Flagged"}

											Sandbox.$('#edit-category').html('<p class="ideaView-category">'+newCategory+'</p>');
											Sandbox.$('#ideaView-status').html(newStatusName);
											Sandbox.$('#edit a').text('Edit');
										}
									}
								});
							});
							
						}
          			}	
          		});
			});
		};
		Public.destroy = function(){};

		return Public;
	});

	// Comments Module - controls the comments functionality on the ideaView
	Module.register('comments', 'comments', function(Sandbox){
		var Public = {},
			Private = {};

		Public.init = function(templates){
			Private.renderComments(templates.comments);
		};

		Private.renderComments = function(template) {
	      Sandbox.docReady(function(){
	      	var submitBtn = Sandbox.$('#submit-commentBtn')
	      		commentFld = Sandbox.$('#comment-field'),
	      		id = window.location.hash.replace('#',''),
	      		commentCount = 0;

	        Sandbox.request({
	          url: '/ideabox/comments/idea/' + id,
	          success: function (data) {

	            var i, len = data.length, merged,
	              commentsDiv = Sandbox.$("#comments-container"),
	              commentData= {commentList:[]},
	              fullName, firstName, lastName,postDate;

	              commentCount = data.length;
	              Sandbox.$('#comment-count').html(commentCount);

	            for (i=len - 1; i >= 0; i--){
	              postDate = data[i].created.substring(0, data[i].created.length - 9);
	              fullName = data[i].user.fullName.split(" ");
            	  firstName = fullName[0];
            	  lastName = fullName[1].charAt(0);
	              commentData.commentList =({
	                'comment': data[i].text,
	                'createdDate': postDate,
	                'gravatar' : data[i].user.gravatar,
	                'userName': firstName + " " + lastName || 'user'

	              });
	              merged = Sandbox.mergeTemplate(template, commentData);
	              commentsDiv.prepend(merged);
	            }
	           }

	        });
	        submitBtn.on('click', function(e){
	        	var commentTxt = commentFld.val(),
	        		merged, commentData, commentData = {commentList:[]};
	        		e.preventDefault();



	        	Sandbox.request({
	        		url: '/ideabox/comments/',
	        		type: 'post',
	        		data : {
	        			'ideaId': id,
	        			'text': commentTxt 
	        		},
	        		success: function(data){

	        			commentData.commentList = {
	        				'comment': commentTxt,
	        				'gravatar': Sandbox.getUserInfo().gravatar,
	        				'createdDate': "Aug 16, 2012",
	        				'userName': Sandbox.getUserInfo().fullName
	        			};
	        			merged = Sandbox.mergeTemplate(template, commentData);
	        			Sandbox.$("#comments-container #comment-box").before(merged);	
	        			commentCount++; 
	        			Sandbox.$('#comment-count').html(commentCount);

	        		}	
	        	});
	        });
	      });
	  	};

		Public.destroy = function(){};

		return Public;
	});
}(hb.Core));
	



          // if(ideaTxt != ' '){
           
          //   Sandbox.$("#idea-submit").modal("show");
          //   merged = Sandbox.mergeTemplate(templates.submitIdeaModal,ideaTxt);
            
          //   // The hidden Div is a fix for the textarea to autosize
          //   Sandbox.$('#idea-submit').html(merged);
          //   Sandbox.$('#idea-text').html(Sandbox.$('#hiddenDiv').html());
          //   Sandbox.$('#idea-text').css('height', Sandbox.$('#hiddenDiv').height());
            
          //   Sandbox.$('#idea-text').on('keyup', function(){  
          //     Sandbox.$('#hiddenDiv').html(Sandbox.$('#idea-text').val());
          //     Sandbox.$('#idea-text').animate({'height': Sandbox.$('#hiddenDiv').height()},100);
          //   });

            

          //   });
          // }