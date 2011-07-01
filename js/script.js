/* Author: 

*/


/* setup external content URLs */
(function() {
	$("#nav li:nth-child(1)").data('contentUrl', './ext/nav1.html');
	$("#nav li:nth-child(2)").data('contentUrl', './ext/nav2.html');
	$("#nav li:nth-child(3)").data('contentUrl', './ext/nav3.html');
	$("#nav li:nth-child(4)").data('contentUrl', './ext/nav4.html');
	$("#nav li:nth-child(5)").data('contentUrl', './ext/nav5.html');
	$("#nav li:nth-child(6)").data('contentUrl', './ext/nav6.html');

	/* this first one is loaded onpage load...so no need to bind this here */ 
//	$("#tabbedContent li:nth-child(1)").data('contentUrl', './ext/tab1.html');
	$("#tabbedContent li:nth-child(2)").data('contentUrl', './ext/tab2.html');

	/* this first one is loaded onpage load...so no need to bind this here */ 
//	$("#carousel li:nth-child(1)").data('contentUrl', './ext/caro1.html');
	$("#carousel li:nth-child(2)").data('contentUrl', './ext/caro2.html');
	$("#carousel li:nth-child(3)").data('contentUrl', './ext/caro3.html');

})();

