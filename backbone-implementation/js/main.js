var TODOApp = {}; //global container for the app

//Defining the models

TODOApp.ListItem = Backbone.Model.extend({
	defaults : {
		isCompleted : false
	},
	initialize : function(initData){
		this.text = initData.text;
		this.listNo = initData.listNo;
	},
});

TODOApp.List = Backbone.Collection.extend({
	model : TODOApp.ListItem
});


//defining the views 

TODOApp.ListItemView = Backbone.View.extend({
	tagName : 'li',
	className : 'toDoItem',
	initialize : function(initData){
		_.bindAll(this, "render", "updateCompletionStatus", "saveItem");

		//TODO: this should be done only once, not at the time of initiazation each time. 
		var templateHtml = Backbone.$("#listItemTemplate").html();
		this.compiledTemplate = _.template(templateHtml);
		var editTemplateHtml = Backbone.$("#editItemTemplate").html();
		this.compiledEditTemplate = _.template(editTemplateHtml);

		this.filterType = initData.filterType;

		//bind to model events
		this.model.bind("change:isCompleted", this.updateCompletionStatus);
	},
	events : {
		'click .js-x' : 'handleRemoveToDo', //TODO: change names
		'change .js-checkBox' : 'handleCheckBoxChange',
		'dblclick' : 'editItem',
		'click .js-saveItem' : 'saveItem',
		'click .js-cancelEdit' : 'cancelEdit'
	},
	render : function(){ 
		var itemHtml = this.compiledTemplate({model : this.model});
		this.$el.html(itemHtml);
		this.updateCompletionStatus();
		this.applyFilter(this.filterType); //depending upon the current filter, it would/would NOT show itself.
		return this;
	},
	updateCompletionStatus : function(){
		var isCompleted = this.model.get('isCompleted'); 
		var classToAttach = isCompleted ? 'completeToDo' : 'incompleteToDo';
		var classToRemove = isCompleted ? 'incompleteToDo' : 'completeToDo';
		this.$el.removeClass(classToRemove).addClass(classToAttach);
	},
	handleRemoveToDo : function(){
		this.trigger('removed', this.model.cid);
		this.model.destroy();
		this.remove();
	},
	handleCheckBoxChange : function(event){ 
		var targetElementId = '#' + event.target.id; //TODO : correct this. 
		var checkBoxValue = Backbone.$(targetElementId).is(':checked'); 
		this.model.set('isCompleted', checkBoxValue);

		//depending on the current filter show/hide itself
		this.applyFilter(this.filterType);
	}, 
	editItem : function(event){
		var itemHtml = this.compiledEditTemplate({model : this.model});
		this.$el.html(itemHtml);
		return this;
	},
	saveItem : function(){
		var editedText = this.$el.find('.js-editTextBox').val(); 
		this.model.set('text', editedText); 
		this.render();
	},
	cancelEdit : function(){
		this.render();
	},
	applyFilter : function(filterType){
		this.filterType = filterType;
		switch(filterType){
			case "all" : 
				this.showItem();
				break;
			case "active" : 
				this.model.get('isCompleted') ? this.hideItem() : this.showItem();
				break;
			case "completed" : 
				this.model.get('isCompleted') ? this.showItem() : this.hideItem();
		};
	},
	showItem : function(){
		this.$el.removeClass('hiddenToDo');
	},
	hideItem : function(){
		this.$el.addClass('hiddenToDo');
	}
});

TODOApp.ListView = Backbone.View.extend({
	defaults : {
		filterType : "all"
	},
	initialize : function(initData){
		_.bindAll(this, "appendListItem");
		this.collection.on('add', this.appendListItem);
		this.subViews = {};
		this.render();
		this.$ul = this.$el.find("ul");
	},
	events : {
		'click .js-uArr' : 'handleUpArrowClick',
		'click .js-dArr' : 'handleDownArrowClick'
	},
	appendListItem : function(item){
		var newListItemView = new TODOApp.ListItemView({
			model : item,
			filterType : this.filterType
		});
		this.subViews[item.cid] = newListItemView;
		this.listenTo(newListItemView, 'removed', this.removeSubView);
		this.$ul.append(newListItemView.render().el);
	},
	removeSubView : function(cid){ 
		if(this.subViews.hasOwnProperty(cid)){
			delete this.subViews[cid];
		}
	},
	render : function(){
		//TODO: this should be done only once, not at the time of initiazation each time. 
		var templateHtml = Backbone.$("#listTemplate").html();
		var compiledTemplate = _.template(templateHtml);
		this.$el.html(compiledTemplate({}));
	},
	handleUpArrowClick : function(event){
		var $targetElement = Backbone.$(event.target);
		var $parentElement = $targetElement.parent();
		var $prevElement = $parentElement.prev("li.toDoItem"); 
		if($prevElement !== null){
			$parentElement.after($prevElement);
		}
	},
	handleDownArrowClick : function(event){
		var $targetElement = Backbone.$(event.target);
		var $parentElement = $targetElement.parent();
		var $prevElement = $parentElement.next("li.toDoItem"); 
		if($prevElement !== null){
			$parentElement.before($prevElement);
		}
	},
	applyFilter : function(filterType){
		if(this.filterType === filterType) return;

		this.filterType = filterType;
		//iterate over the subviews and update them
		Backbone.$.each(this.subViews, function(cid, subView){
			subView.applyFilter(filterType);
		});
	}
});

// where all controls like Add, showCompleted, showInCompleted et al are present.
//INITIALIZE : el,  
TODOApp.ControlsView = Backbone.View.extend({
	events : {
		"click .addButton" : "handleAddClick",
		"click span.activeFilter" : 'handleFilterSelection'
	},
	initialize : function(initData){
		_.bindAll(this, "handleAddClick");
		this.listNo = initData.listNo;
		this.listViewRef = initData.listViewRef;
		this.name = initData.name;
		this.$textArea = Backbone.$("#list"+ this.listNo +"TextArea");
	},
	handleAddClick : function(){
		var newListItemText = this.$textArea.val();
		var newListItem = new TODOApp.ListItem({
			text : newListItemText,
			listNo : this.listNo
		});
		this.collection.add(newListItem);

		this.$textArea.val(""); //clear text area
	},
	handleFilterSelection : function(event){
		var targetElementId = event.target.id;
		var $targetElement = Backbone.$(event.target);
		var filterType = targetElementId.split("_")[0]; 

		this.listViewRef.applyFilter(filterType);

		//update the view
		this.$el.find('span').removeClass('inactiveFilter').addClass('activeFilter');
		$targetElement.removeClass('activeFilter').addClass('inactiveFilter');
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


//for list 2 : home
(function(){
	var collectionInstance = new TODOApp.List({});
	var listViewInstance = new TODOApp.ListView({
		collection : collectionInstance,
		el : Backbone.$("#list2BodyArea")
	});
	TODOApp.list1ControlsView = new TODOApp.ControlsView({
		el : Backbone.$("#list2HeadArea"),
		collection : collectionInstance,
		listViewRef : listViewInstance,
		name : "home",
		listNo : 2
	});

})();

