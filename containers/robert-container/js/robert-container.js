/* global b$ */
(function () {
    "use strict";

    var SELECTORS = {
		SECTION_HEADER: '[data-js=bt-accordion-section-header]',
		SECTION_BODY: '[data-js=bt-accordion-section-body]'
	};

	var CLASSES = {
	    HIDDEN: "hidden"
	};

    var Container = b$.bdom
                    .getNamespace('http://backbase.com/2013/portalView')
                    .getClass('container');
 
    Container.extend(function (bdomDocument, node) {
        Container.apply(this, arguments);
        this.isPossibleDragTarget = true;
    }, {
        localName: 'RobertContainer',
        // the same as the viewNamespace property in the import XML for the container and in the soy template
        namespaceURI: 'backbase-robert'
    }, {
        template: function(json) {
            var data = {item: json.model.originalItem};
            var sTemplate = backbase_robert.RobertContainer(data);
            return sTemplate;
        },

        handlers: {
            DOMReady: function(){
                var $container = $(this.htmlNode),
                    $sections = $container.find(SELECTORS.SECTION_BODY);

                $container.on('click', SELECTORS.SECTION_HEADER, function(event) {
                	$sections.addClass(CLASSES.HIDDEN);
                	$(this).parent().children(SELECTORS.SECTION_BODY).removeClass(CLASSES.HIDDEN);
                });
            },

			dragDrop: function(event) {
			    console.log(event);
			},

            preferencesSaved: function(event){
                if(event.targeet === this) {
                    this.refreshHTML(function(item){
                        // console.log(item)
                    })
                }
            }
        }
    });
})();
