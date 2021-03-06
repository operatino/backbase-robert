define([
	'jquery',
	'launchpad/lib/common/util',
	'launchpad/lib/ui/responsive',
	'launchpad/lib/ui'
	], function($, mst, util, responsive, ui) {
	'use strict';

	// Data storage structure
	//var todoDataStub = {
	//	list: {
	//		0: {
	//			id: 0,
	//			name: 'todos name',
	//			done: false
	//		}
	//	}
	//};

	function Todo(widget) {
		this.widget = widget;
		this.storageName = 'store';
		this.limitPref = 'limit';

		// Status log
		this.widget.model.addEventListener('PrefModified', function (event) {
			console.log('PrefModified', event);
		});
	}

	Todo.prototype.init = function(){
		this.$el = $('.rb-robert-todo');
		this.$form = this.$el.find('[data-js="rb-robert-todo_form"]');
		this.$input = this.$el.find('[data-js="rb-robert-todo_input"]');
		this.$input = this.$el.find('[data-js="rb-robert-todo_input"]');
		this.$list = this.$el.find('[data-js="rb-robert-todo_list"]');
		//this.$submit = this.$el.find('[data-js="rb-robert-todo_submit"]');

		this.prepareStorage();
		this.form();
		this.list();
		this.doneChecker();
		this.deleteOne();
		this.deleteAll();
	};

	Todo.prototype.saveCallback = function (ctx, xhr) {
		if (xhr && xhr.status !== 0) {
			console.log('saved');
		} else {
			console.log('some error', ctx, xhr);
		}
	};

	Todo.prototype.prepareStorage = function(){
		// Getting TODOs store list
		try {
			this.store = JSON.parse(this.widget.model.getPreference(this.storageName));
		} catch (e) {
			this.store = {};
		}

		if (!this.store.list) {
			this.store.list = {};
		}
	};

	Todo.prototype.addTodo = function(obj){
		// Setting unique ID
		var uniqueID = Date.now();
		obj.id = uniqueID;

		this.store.list[uniqueID] = obj;

		this.widget.model.setPreference(this.storageName, JSON.stringify(this.store));
		this.widget.model.save(this.saveCallback);

		var count = this.countTodos();
		gadgets.pubsub.publish("todo_added", {
			totalTodos: count.total
		});

		this.$list.prepend(this.itemView(obj));
	};

	Todo.prototype.deleteOne = function(){
		var _this = this;

		this.$list.on('click', '[data-js="rb-robert-todo_delete"]', function(e){
			e.preventDefault();

			var $partentItem = $(this).parents('[data-id]');
			var id = $partentItem.attr('data-id');

			delete _this.store.list[id];

			_this.widget.model.setPreference(_this.storageName, JSON.stringify(_this.store));
			_this.widget.model.save(_this.saveCallback);

			var count = _this.countTodos();
			gadgets.pubsub.publish("todo_deleted", {
				totalTodos: count.total
			});

			$partentItem.remove();
		});
	};

	Todo.prototype.deleteAll = function(){
		var _this = this;

		this.$deleteAll = this.$el.find('[data-js="rb-robert-todo_clean-all"]');

		this.$deleteAll.on('click', function(e){
			e.preventDefault();

			_this.$list.html('');

			_this.widget.model.setPreference(_this.storageName, '{}');
			_this.widget.model.save(_this.saveCallback);

			gadgets.pubsub.publish("todo_deleted-all");

			_this.store.list = [];
		});
	};

	Todo.prototype.doneChecker = function(){
		var _this = this;

		this.$list.on('click', '[data-js="rb-robert-todo_check"]', function(e){
			var $this = $(this);
			var $partentItem = $this.parents('[data-id]');
			var id = $partentItem.attr('data-id');
			var currentObj = _this.store.list[id];

			var doneStatus = $this.prop('checked');
			currentObj.done = doneStatus;

			_this.widget.model.setPreference(_this.storageName, JSON.stringify(_this.store));
			_this.widget.model.save(_this.saveCallback);

			gadgets.pubsub.publish("todo_status-change", {
				id: id,
				name: currentObj.name,
				status: doneStatus
			});

			$partentItem.toggleClass('rb-robert-todo_list_li__checked');
		});
	};

	Todo.prototype.form = function(){
		var _this = this;

		this.$form.on('submit', function(e){
			e.preventDefault();

			var name = _this.$input.val();

			if (_this.validateDoneCount()) {
				if (name !== '') {
					var todoData = {
						name: name,
						done: false
					};

					_this.addTodo(todoData);

					_this.$input.val('');
				}
			} else {
				alert('Finish previous task before adding new.')
			}
		});
	};

	Todo.prototype.validateDoneCount = function(){
		var limit = this.widget.model.getPreference(this.limitPref);

		return this.countTodos().unchecked < limit;
	};

	Todo.prototype.countTodos = function(){
		var count = {};
		count.total = 0;
		count.unchecked = 0;

		for (var id in this.store.list) {
			var current = this.store.list[id];

			if (!current.done) {
				count.unchecked++;
			}

			count.total++;
		}

		return count;
	};

	Todo.prototype.list = function(){
		var _this = this;
		var todosList = this.store.list || false;

		if (this.store.list) {
			for (var id in todosList) {
				var data = todosList[id];

				_this.$list.prepend(_this.itemView(data));
			}
		}
	};

	Todo.prototype.itemView = function(data){
		// Todos data model
		var _data = data;

		// Template
		var $todoTpl = $([
			'<li class="rb-robert-todo_list_li list-group-item">',
				'<div class="rb-robert-todo_item">',
					'<div class="rb-robert-todo_item_actions">',
						'<a href="#7" class="rb-robert-todo_delete-item" data-js="rb-robert-todo_delete">Delete</a>',
					'</div>',

					'<label>',
						'<div class="rb-robert-todo_item_check-control">',
							'<input type="checkbox" class="rb-robert-todo_item_checkbox" data-js="rb-robert-todo_check" />',
						'</div>',
						'<div class="rb-robert-todo_item_text"></div>',
					'</label>',
				'</div>',
			'</li>'
		].join(''));

		$todoTpl.find('.rb-robert-todo_item_text').text(_data.name);
		$todoTpl.attr('data-id', _data.id);

		// If todos marked as done
		if (_data.done) {
			$todoTpl.find('.rb-robert-todo_item_checkbox').prop('checked', true);
			$todoTpl.addClass('rb-robert-todo_list_li__checked');
		}

		return $todoTpl;
	};

	return function(widget){
		var todo = new Todo(widget);
		todo.init();
	}
});