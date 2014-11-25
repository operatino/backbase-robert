define([''], function() {
	'use strict';

	function TodoNotif(widget) {
		this.widget = widget;
		this.$el = $('.rb-robert-todo-notif');

		this.displayTimePref = 'displaytime';

		// Status log
		this.widget.model.addEventListener('PrefModified', function (event) {
			console.log('PrefModified', event);
		});
	}

	TodoNotif.prototype.init = function(){
		this.$container = this.$el.find('[data-js="rb-robert-todo-notif_container"]');

		this.listenAdd();
		this.listenDelete();
		this.listenDeleteAll();
		this.listenChecking();
	};

	TodoNotif.prototype.getDiplayTimePref = function(){
		var loadPref = this.widget.model.getPreference(this.displayTimePref);
		var parsed = parseFloat(loadPref);

		return Number.isInteger(parsed) && parsed >= 2 ? parsed : 2;
	};

	TodoNotif.prototype.statusView = function(conf){
		var _this = this;
		var showDurationInSec = this.getDiplayTimePref();
		var $tpl = $([
			'<div class="rb-robert-todo-notif_alert alert" role="alert"></div>'
		].join(''));

		var levelClass;
		switch (conf.level) {
			case 'SUCCESS':
				levelClass = 'alert-success';
				break;
			case 'DANGER':
				levelClass = 'alert-danger';
				break;
			default:
				levelClass = 'alert-info'
		}

		$tpl.addClass(levelClass);
		$tpl.text(conf.message);

		if (conf.showRemaining && conf.totalTodos) {
			$tpl.append(' Total TODOs count: ' + conf.totalTodos);
		}

		this.$container.html($tpl);

		// Hiding notification after timeout
		setTimeout(function(){
			_this.$container.html('');
		}, showDurationInSec * 1000)
	};

	TodoNotif.prototype.listenAdd = function(){
		var _this = this;

		gadgets.pubsub.subscribe("todo_added", function (data) {
			var viewConf = {
				message: 'Todo added.',
				showRemaining: true,
				level: 'SUCCESS',
				totalTodos: data.totalTodos
			};

			_this.statusView(viewConf);
		});
	};

	TodoNotif.prototype.listenDelete = function(){
		var _this = this;

		gadgets.pubsub.subscribe("todo_deleted", function (data) {
			var viewConf = {
				message: 'Todo deleted.',
				showRemaining: true,
				level: 'DANGER',
				totalTodos: data.totalTodos
			};

			_this.statusView(viewConf);
		});
	};

	TodoNotif.prototype.listenDeleteAll = function(){
		var _this = this;

		gadgets.pubsub.subscribe("todo_deleted-all", function () {
			var viewConf = {
				message: 'All Todos cleared.',
				showRemaining: false,
				level: 'DANGER'
			};

			_this.statusView(viewConf);
		});
	};

	TodoNotif.prototype.listenChecking = function(){
		var _this = this;

		gadgets.pubsub.subscribe("todo_status-change", function (data) {
			var textStatus = data.status ? 'DONE' : 'NOT DONE';
			var message = 'Item "' + data.name+ '" is marked as ' + textStatus + '.';

			var viewConf = {
				message: message,
				showRemaining: false
			};

			_this.statusView(viewConf);
		});
	};

	return function(widget){
		var todoNotif = new TodoNotif(widget);
		todoNotif.init();
	}
});