jQuery(function($) {

	var html = $('html');
	var body = $('body');

	/* ==========================================================================
	   Menu Function
	   ========================================================================== */

	body.on('click', '[data-action="menu"]', function() {
		var action = $(this).data('action');
		var target = $('[data-target="' + $(this).data('target') + '"]').not('[data-action]');
		menu(target)
	});

	var menuActive = false;
	function menu(target) {
		if(!menuActive) {
			html.addClass('menu-initial');
			target.addClass('initial');
			setTimeout(function() {
				html.addClass('menu-active');
				target.addClass('active');
			}, 1);
			menuActive = true;
		} else {
			target.removeClass('active');
			html.removeClass('menu-active');
			setTimeout(function() {
				target.removeClass('initial');
				html.removeClass('menu-initial');
			}, 300);
			menuActive = false;
		}
	}

	body.on('click', '.overlay, #menu a', function() {
		if (html.hasClass('menu-active')) {
			var target = $('[data-target="menu"]').not('[data-action]');
			menu(target);
		}
	});


	/* ==========================================================================
	   Masonry
	   ========================================================================== */

	function grid() {
		$('.post-list .post .post-image img').each(function() {
			var img = $(this);
			img.on('load', function() {
				img.parents('.post-image').css({
					'height' : '0',
					'padding-bottom' : 100 / img.width() * img.height() + '%'
				});
			});
	    });
		var postlist = $('.post-list').masonry({
			itemSelector			: '.post',
			isAnimated				: false,
			gutter					: 0,
			columnWidth				: 1,
			transitionDuration		: 0
		}).imagesLoaded().always(function() {
			postlist.masonry('layout');
		});
	}
	grid();

	/* ==========================================================================
	   Run Highlight
	   ========================================================================== */

	function highlight() {
		$('pre code').each(function(i, e) {
			hljs.highlightBlock(e);
			var code = $(this);
			var lines = code.html().split(/\n(?!$)/g).length;
			var numbers = [];
			if (lines > 1) {
        lines++;
      }
			for (i = 1; i < lines; i++) {
				numbers += '<span class="line" aria-hidden="true">' + i + '</span>';
			}
			code.parent().addClass('codeblock').append('<div class="lines">' + numbers + '</div>');
		});
	}
	highlight();

	/* ==========================================================================
	   Gallery
	   ========================================================================== */

	function gallery() {
		var images = document.querySelectorAll('.kg-gallery-image img');
		images.forEach(function (image) {
			var container = image.closest('.kg-gallery-image');
			var width = image.attributes.width.value;
			var height = image.attributes.height.value;
			var ratio = width / height;
			container.style.flex = ratio + ' 1 0%';
		});
	}
	gallery();

	/* ==========================================================================
	   Fitvids
	   ========================================================================== */

	function video() {
		$('#wrapper').fitVids();
	}
	video();

	/* ==========================================================================
	   Initialize and load Disqus
	   ========================================================================== */

	function comments() {
		if (typeof disqus === 'undefined' || !document.getElementById('disqus_thread')) {
			$('.post-comments').css({
				'display' : 'none'
			});
		} else {
			if (window.DISQUS) {
				return DISQUS.reset({
					reload: true,
					config: function () {
						this.page.identifier = location.pathname;
						this.page.url = location.origin + location.pathname;
					}
				});
			}

			$.ajax({
				type: "GET",
				url: "//" + disqus + ".disqus.com/embed.js",
				dataType: "script",
				cache: true
			});
		}
	}
	comments();

	/* ==========================================================================
	   Reload all scripts after AJAX load
	   ========================================================================== */

	function reload() {
		grid();
		ajaxLinkClass();
		highlight();
		gallery();
		video();
		comments();
	}

	/* ==========================================================================
	   Add class for ajax loading
	   ========================================================================== */

	function ajaxLinkClass() {

		$('a[href^="' + window.location.origin + '"], .post-image a, .post-title a, .post-more a, .post-meta a, .post-tags a, #pagination a').each(function() {
			var link = $(this);

			if(!link.hasClass('rss')) {
				link.addClass('js-ajax-link');

				if (link.attr('href').indexOf('page') > -1) {
					link.addClass('js-archive-index');
				}

				if (link.attr('href') === window.location.origin || link.attr('href') === window.location.origin + "/" || link.attr('href') === "/") {
					link.addClass('js-home-index');
				}

				if (link.attr('href').indexOf('tag') > -1) {
					link.addClass('js-tag-index');
				}

				if (link.attr('href').indexOf('author') > -1) {
					link.addClass('js-author-index');
				}
			}
		});
	}
	ajaxLinkClass();

	/* ==========================================================================
	   Ajax Loading
	   ========================================================================== */

	var History = window.History;
	var loading = false;
	var ajaxContainer = $('#ajax-container');

	if (!History.enabled) {
		return false;
	}

	History.Adapter.bind(window, 'statechange', function() {
		html.addClass('loading');
		var State = History.getState();
		$.get(State.url, function(result) {
			var $html = $(result);
			var newContent = $('#ajax-container', $html).contents();
			var title = result.match(/<title>(.*?)<\/title>/)[1];

			ajaxContainer.fadeOut(500, function() {
				if(html.hasClass('push-next')) {
					html.removeClass('push-next');
					html.addClass('pushed-next');
				}
				if(html.hasClass('push-prev')) {
					html.removeClass('push-prev');
					html.addClass('pushed-prev');
				}
				document.title = $('<textarea/>').html(title).text();
				ajaxContainer.html(newContent);
				body.removeClass();
				body.addClass($('#body-class').attr('class'));
				NProgress.done();
				ajaxContainer.fadeIn(500);
				$(document).scrollTop(0);
				setTimeout(function() {
					html.removeClass('loading').removeClass('post-loading');
				}, 50);
				reload();
				loading = false;
			});
		});
	});
	$('body').on('click', '.js-ajax-link', function(e) {
	    e.preventDefault();

		var link = $(this);

		if(link.hasClass('post-nav-item') || link.hasClass('pagination-item')) {
			if(link.hasClass('post-nav-next') || link.hasClass('pagination-next')) {
				html.removeClass('pushed-prev');
				html.addClass('push-next');
			}
			if(link.hasClass('post-nav-prev') || link.hasClass('pagination-prev')) {
				html.removeClass('pushed-next');
				html.addClass('push-prev');
			}
		} else {
			html.removeClass('pushed-next');
			html.removeClass('pushed-prev');
		}

    if (loading === false) {
			var currentState = History.getState();
			var url = $(this).prop('href');
			var title = $(this).attr('title') || null;

	    if (url.replace(/\/$/, "") !== currentState.url.replace(/\/$/, "")) {
				loading = true;
				html.addClass('loading');
				NProgress.start();
				History.pushState({}, title, url);
	    }
   	}
	});

	$('body').on('click', '.js-ajax-link:not(.post-nav-item)', function() {
		html.addClass('post-loading');
		var post = $(this).parents('.post');
		post.addClass('initial');
		setTimeout(function() {
			post.addClass('active');
		}, 1);
	});
});
