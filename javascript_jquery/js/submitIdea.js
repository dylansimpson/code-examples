(function(Module){

	Module.register("submitIdea", '', function(Sandbox){
		var Public = {},
			Private = {};

		Public.init = function(template){
			Sandbox.docReady(function(){
				var category = '';
				Sandbox.$(".select-category").on('click', function(e){
	      			
	              var target = e.target;

	              e.preventDefault();  

	              if (Sandbox.$(target).is('a')){
	              	Sandbox.$(this).find('a').removeClass('active');
	              	Sandbox.$(target).addClass('active');
	              	category = Sandbox.$(target).attr('href');

	              }
	            }); 
	            Sandbox.$('#submit-Btn').on('click', function(e){
	            	e.preventDefault();
	            	var ideaTitle = Sandbox.$('#idea-title').val(),
	            		ideaDesc = Sandbox.$('#idea-desc').val(),
	            		error = 1;

	            	Sandbox.$('#idea-title').css({'border': '1px solid #ccc'});
	            	Sandbox.$('#title-lbl .err').html(' ');
	            	Sandbox.$('#idea-desc').css('border', '1px solid #ccc');
	            	Sandbox.$('#desc-lbl .err').html(' ');
	            	Sandbox.$('.select-category').css('border', 'none');
					Sandbox.$('#cat-lbl .err').html(' ');

	            	if(ideaTitle.length < 1){
	            		error = 0;
	            		Sandbox.$('#idea-title').css({'border': '1px solid #cf4d4d'});
	            		Sandbox.$('#title-lbl .err').html(' *');
	            	}
	            	if(ideaDesc.length < 1){
	            		error = 0;
	            		Sandbox.$('#idea-desc').css('border', '1px solid #cf4d4d');
	            		Sandbox.$('#desc-lbl .err').html(' *');
	            	}
	            	if(category.length < 1){
	            		error = 0;
	            		Sandbox.$('.select-category').css('border', '1px solid #cf4d4d');
						Sandbox.$('#cat-lbl .err').html(' *');	
	            	}
	            	if(!error){
	            		Sandbox.$('#errorMsg').hide().html('Oops! You forgot something').show(100).css('background', '#cf4d4d');
	            		//Sandbox.$('#errorMsg').animate({ background: '#cf4d4d' }, 500);
	            	}else{
            			Sandbox.request({
			          	  url : '/ideabox/ideas/',
			              type : 'post',
			              data : { 
			             	'title': ideaTitle,
			             	'text': ideaDesc,
							'tag': category
			              },
			              success: function(){
			              	window.location = "/";
			                Sandbox.notify({
			                	name: "ideaSubmitted",
			                    response: {'title': ideaTitle,
			           		           		'gravatar':Sandbox.getUserInfo().gravatar

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

}(hb.Core));