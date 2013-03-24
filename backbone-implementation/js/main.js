var TODOApp = {}; //global container for the app

//Defining the models

TODOApp.ListItem = Backbone.Model.extend({
	defaults : {
		isCompleted : false
	},
	initialize : function(initData){
		//_.bindAll(this, 'destroyItem', 'switchItemStatus', 'editItem', 'saveItem');
		this.text = initData.text;
		this.listNo = initData.listNo;
	},
	destroyItem : function(){

	},
	changeCompletionStatus : function(){

	},
	editItem : function(){

	}, 
	saveItem : function(){

	}

});

TODOApp.List = Backbone.Collection.extend({
	model : TODOApp.ListItem
});


//defining the views 

TODOApp.ListItemView = Backbone.View.extend({
	initialize : function(initData){
		_.bindAll(this, "render", "updateCompletionStatus");

		//TODO: this should be done only once, not at the time of initiazation each time. 
		var templateHtml = Backbone.$("#listItemTemplate").html();
		this.compiledTemplate = _.template(templateHtml);

		//bind to model events
		this.model.bind("change:isCompleted", this.updateCompletionStatus);
	},
	events : {
		'click .js-x' : 'handleRemoveToDo',
		'change .js-checkBox' : 'handleCheckBoxChange'
	},
	render : function(){
		var itemHtml = this.compiledTemplate({model : this.model});
		this.$el.html(itemHtml);
		return this;
	},
	updateCompletionStatus : function(){
		var isCompleted = this.model.get('isCompleted'); 
		var classToAttach = isCompleted ? 'completeToDo' : 'incompleteToDo';
		var classToRemove = isCompleted ? 'incompleteToDo' : 'completeToDo';
		this.$el.find('li').removeClass(classToRemove).addClass(classToAttach);
	},
	handleRemoveToDo : function(){
		this.model.destroy();
		this.remove();
	},
	handleCheckBoxChange : function(event){ 
		var targetElementId = '#' + event.target.id;
		var checkBoxValue = Backbone.$(targetElementId).is(':checked'); 
		this.model.set('isCompleted', checkBoxValue);
	}
});

TODOApp.ListView = Backbone.View.extend({
	initialize : function(initData){
		_.bindAll(this, "appendListItem");
		this.collection.on('add', this.appendListItem);
		this.render();
		this.$ul = this.$el.find("ul");
	},
	appendListItem : function(item){
		//console.log("appendListItem is called " + item.toSource());
		var newListItemView = new TODOApp.ListItemView({
			model : item
		});
		this.$ul.append(newListItemView.render().el);
	},
	render : function(){
		//TODO: this should be done only once, not at the time of initiazation each time. 
		var templateHtml = Backbone.$("#listTemplate").html();
		var compiledTemplate = _.template(templateHtml);
		this.$el.html(compiledTemplate({}));
	}
});

// where all controls like Add, showCompleted, showInCompleted et al are present.
//INITIALIZE : el,  
TODOApp.ControlsView = Backbone.View.extend({
	events : {
		"click .addButton" : "handleAddClick"
	},
	initialize : function(initData){
		_.bindAll(this, "handleAddClick");
		this.listNo = initData.listNo;
		this.listViewRef = initData.listViewRef;
		this.name = initData.name;
		this.$textArea = Backbone.$("#list"+ this.listNo +"TextArea");
	},
	handleAddClick : function(){
		console.log("addButton " + this.name + " clicked");
		var newListItemText = this.$textArea.val();
		var newListItem = new TODOApp.ListItem({
			text : newListItemText,
			listNo : this.listNo
		});
		this.collection.add(newListItem);

		this.$textArea.val(""); //clear text area
	}
});



// code for initialization

//for list 1 : work
(function(){
	var collectionInstance = new TODOApp.List({});
	var listViewInstance = new TODOApp.ListView({
		collection : collectionInstance,
		el : Backbone.$("#list1BodyArea")
	});
	TODOApp.list1ControlsView = new TODOApp.ControlsView({
		el : Backbone.$("#list1HeadArea"),
		collection : collectionInstance,
		listViewRef : listViewInstance,
		name : "work",
		listNo : 1
	});

})();

/*
//for list 2 : home
TODOApp.list1ControlsView = new TODOApp.ControlsView({
	el : Backbone.$("#list2HeadArea"),
	name : "home"
});*/

