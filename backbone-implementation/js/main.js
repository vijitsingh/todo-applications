var TODOApp = {}; //global container for the app

//Defining the models

/**
	Model for each list-item
**/
TODOApp.ListItem = Backbone.Model.extend({
	defaults : {
		isCompleted : false
	},
	initialize : function(initData){
		this.text = initData.text;
		this.listNo = initData.listNo;
	},
});

/**
	Collection for the list-items
**/
TODOApp.List = Backbone.Collection.extend({
	model : TODOApp.ListItem,
	initialize : function(initData){
		this.localStorage = initData["localStorage"];
	}
});


//defining the views 

TODOApp.ListItemView = Backbone.View.extend({
	tagName : 'li',
	className : 'toDoItem',
	initialize : function(initData){
		_.bindAll(this, "render", "updateCompletionStatus", "saveItem");

		//TODO: this should be done only once for the class, not at the time of initiazation each time. 
		var templateHtml = Backbone.$("#listItemTemplate").html(); //TODO: move template-initialization to a different method
		this.compiledTemplate = _.template(templateHtml);
		var editTemplateHtml = Backbone.$("#editItemTemplate").html();
		this.compiledEditTemplate = _.template(editTemplateHtml);
		this.isVisible = false; //default value

		this.filterType = initData.filterType;

		//bind to model events
		this.model.bind("change:isCompleted", this.updateCompletionStatus);
	},
	/**
		Backbone automatically delegates the events for the ones mentioned in events hash. So the events get attached for the items
        added later as well. 
	**/
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
		this.$el.attr('title', 'Double-click to EDIT ToDo');
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
		this.model.save();

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
		this.model.save();
		this.render();
	},
	cancelEdit : function(){
		this.render();
	},
	/**
		When a filter is selected the listView calls each of its subviews to apply the selected filter. 
		Each subview here is responsible for hiding/showing themselves based upon the filter. 
		It also triggers a visibility:update if its visibility has changed. The update is required for 
		parentView to keep track of how many items are visible so that it could show "no items" msg if none
		are visible. 
	**/
	applyFilter : function(filterType, resetVisibility){
		var isItemVisible = false;

		if(resetVisibility){
			this.isVisible = false;
		}
		this.filterType = filterType;
		switch(filterType){
			case "all" : 
				isItemVisible = this.showItem();
				break;
			case "active" : 
				isItemVisible = this.model.get('isCompleted') ? this.hideItem() : this.showItem();
				break;
			case "completed" : 
				isItemVisible = this.model.get('isCompleted') ? this.showItem() : this.hideItem();
		};

		if(isItemVisible !== this.isVisible){
		    this.trigger('visibility:update', isItemVisible); 
		    this.isVisible = isItemVisible;
	    }
		return isItemVisible;
	},
	showItem : function(){
		this.$el.removeClass('hiddenToDo');
		return true;
	},
	hideItem : function(){
		this.$el.addClass('hiddenToDo');
		return false;
	}
});

TODOApp.ListView = Backbone.View.extend({
	initialize : function(initData){
		_.bindAll(this, "appendListItem");
		this.initializeTemplates();
		this.collection.on('add', this.appendListItem);
		this.subViews = {};
		this.noOfItemsVisible = 0; //keeps track of the no. of items visible in this filter.
		this.filterType = initData.filterType;
		this.render();
		this.$ul = this.$el.find("ul");
		this.$noItemsMsg = this.$el.find(".noItemsMsg");
		this.applyFilter(this.filterType);
	},
	initializeTemplates : function(){
		var templateHtml = Backbone.$("#listTemplate").html();
		this.compiledTemplate = _.template(templateHtml);
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
		this.listenTo(newListItemView, 'visibility:update', this.handleSubViewVisibilityUpdate);
		this.$ul.append(newListItemView.render().el);
	},
	removeSubView : function(cid){ 
		if(this.subViews.hasOwnProperty(cid)){
			delete this.subViews[cid];
			this.noOfItemsVisible--;
			this.updateNoItemsMsg();
		}
	},
	render : function(){
		this.$el.html(this.compiledTemplate({}));
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
		var isItemVisible;

		this.noOfItemsVisible = 0; //reset the value
		this.filterType = filterType;
		//iterate over the subviews and update them
		Backbone.$.each(this.subViews, function(cid, subView){
			subView.applyFilter(filterType, true);
		});

		this.updateNoItemsMsg();
	},
	updateNoItemsMsg : function(){
		this.noOfItemsVisible <= 0 ? this.showNoItemsMsg() : this.hideNoItemsMsg();
	},
	showNoItemsMsg : function(){
		this.$noItemsMsg.removeClass('hiddenToDo');
	},
	hideNoItemsMsg : function(){
		this.$noItemsMsg.addClass('hiddenToDo');
	},
	handleSubViewVisibilityUpdate : function(isItemVisible){ //TODO: check could be made to ensure a visible view is NOT made visible again. 
		if(isItemVisible) this.noOfItemsVisible++;
		else {
			this.noOfItemsVisible = (this.noOfItemsVisible > 0) ? (this.noOfItemsVisible - 1) : 0;
		}

		this.updateNoItemsMsg();
	}
});

/** 
    View where all controls like Add, showCompleted, showInCompleted et al are present.  
**/
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
		var newListItem = this.collection.create({
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
	var collectionInstance = new TODOApp.List({
		localStorage: new Backbone.LocalStorage("toDo-1")
	});
	var listViewInstance = new TODOApp.ListView({
		collection : collectionInstance,
		el : Backbone.$("#list1BodyArea"),
		filterType : "all"
	});
	TODOApp.list1ControlsView = new TODOApp.ControlsView({
		el : Backbone.$("#list1HeadArea"),
		collection : collectionInstance,
		listViewRef : listViewInstance,
		name : "work",
		listNo : 1
	});

	collectionInstance.fetch();

})();


//for list 2 : home
(function(){
	var collectionInstance = new TODOApp.List({
		localStorage: new Backbone.LocalStorage("toDo-2")
	});
	var listViewInstance = new TODOApp.ListView({
		collection : collectionInstance,
		el : Backbone.$("#list2BodyArea"),
		filterType : "all"
	});
	TODOApp.list1ControlsView = new TODOApp.ControlsView({
		el : Backbone.$("#list2HeadArea"),
		collection : collectionInstance,
		listViewRef : listViewInstance,
		name : "home",
		listNo : 2
	});

	collectionInstance.fetch();

})();

