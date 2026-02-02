(function() {
    'use strict';

    if (typeof Lampa !== 'undefined') {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'complite') {
                Lampa.Manifest.plugins.kinogo = {
                    title: 'Kinogo',
                    url: 'https://kinogo.media/films/?page=__PAGE__'
                };

                Lampa.Template.add('button_kinogo', `<div class="full-start__button selector" data-action="kinogo">
                    <div class="full-start__button-t">Kinogo</div>
                </div>`);

                Lampa.Listener.follow('full', function(e) {
                    var contextmenu = e.template.item.find('.view--torrent');
                    contextmenu.after(Lampa.Template.get('button_kinogo'));
                    contextmenu.on('hover:enter', function() {
                        Lampa.Activity.push({
                            url: Lampa.Manifest.plugins.kinogo.url.replace('__PAGE__', 1),
                            title: 'Kinogo Films',
                            component: 'kinogo',
                            page: 1
                        });
                    });
                });
            }
        });

        Lampa.Storage.listener.follow('add', function(e) {
            if (e.name == 'category' && e.body == 'kinogo') {
                Lampa.Activity.push({
                    url: Lampa.Manifest.plugins.kinogo.url.replace('__PAGE__', 1),
                    title: 'Kinogo',
                    component: 'kinogo',
                    page: 1
                });
            }
        });

        Lampa.Component.add('kinogo', {
            reload: true,
            search_one: function(items, html) {
                Lampa.Api.search({
                    query: encodeURIComponent(items.title)
                }, function(find) {
                    // Mock search, replace with kinogo search if available
                });
            },
            view: function(view) {
                var html = view.html;
                html.find('.selector').on('hover:focus', function(e) {
                    // Handle selection
                });
            },
            render: function() {
                var html = $('<div></div>');
                html.append('<div class="category-full">Loading kinogo films...</div>');
                this.bind();
                Lampa.Api.main({
                    url: this.activity.url,
                    page: this.activity.page,
                    data: {source: 'kinogo'}
                }, function(data) {
                    html.empty();
                    if (data.films) {
                        data.films.forEach(function(item) {
                            html.append(`
                                <div class="full-start__item selector" data-action="play" data-title="${item.title}" data-url="${item.url}">
                                    <div class="full-start__img">
                                        <img src="${item.poster}">
                                    </div>
                                    <div class="full-start__body">
                                        <div class="full-start__title">${item.title}</div>
                                    </div>
                                </div>
                            `);
                        });
                    }
                    html.append('<div class="selector" style="margin: 2em auto"><div class="simple-button selector" data-action="next">Next page</div></div>');
                });
                return html;
            },
            loadData: function(url) {
                return new Promise(function(resolve) {
                    fetch(url).then(function(response) {
                        return response.text();
                    }).then(function(html) {
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(html, 'text/html');
                        var films = [];
                        doc.querySelectorAll('.films > div').forEach(function(el) {
                            var title = el.querySelector('h2 a')?.textContent || '';
                            var year = title.match(/\\((\\d{4})\\)/)?.[2] || '';
                            var poster = el.querySelector('img')?.src || '';
                            var href = el.querySelector('a')?.href || '';
                            if (title && href) {
                                films.push({
                                    title: title.replace(year, '').trim(),
                                    year: year,
                                    poster: poster,
                                    url: 'https://kinogo.media' + href
                                });
                            }
                        });
                        resolve({films: films});
                    });
                });
            }
        });
    }
})();
