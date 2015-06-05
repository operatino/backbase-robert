define([
	'jquery',
	'portalserver/static/backbase-robert/bower_components/mustache/mustache'
	], function($, mst) {
	'use strict';

	function Feed(widget) {
		this.widget = widget;
		this.limitPref = 'limit';

		// Status log
		this.widget.model.addEventListener('PrefModified', function (event) {
			console.log('PrefModified', event);
		});
	}

	Feed.prototype.init = function(){
		this.$el = $('.rb-robert-feed');

		this.initPrefs();
		this.drawNews();
	};

	Feed.prototype.initPrefs = function(){
		var limit = parseFloat(this.widget.model.getPreference(this.limitPref));
		this.limit = Number.isInteger(limit) ? limit : 5;
	};

	Feed.prototype.drawNews = function(){
		var _this = this;
		var tpl = document.getElementById('rb-robert-feed_list').innerHTML;

		$.ajax({
			type: 'GET',
			data: {
				url: 'http://podcasts.engadget.com/rss.xml'
			},
			url: '/portalserver/proxy?pipe=jsonPipe'
		}).done(function (response) {
			var rssJson = response;
			var newsList = rssJson.channel.item;

			newsList = newsList.slice(0, _this.limit);

			_this.$el.append(mst.render(tpl, {
				list: newsList
			}));
		});
	};

	return function(widget){
		var feed = new Feed(widget);
		feed.init();
	}
});