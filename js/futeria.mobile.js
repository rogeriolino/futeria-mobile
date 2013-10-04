/**
 * Futeria Mobile core
 * @author rogeriolino <rogeriolino.com>
 */
;(function ($) {
    "use strict";
    var setup = false;
    var defaults = {
        listLimit: 20,
        baseUrl: '.',
        apiUrl: 'http://api.futeria.net',
        goto: function() {},
        showTeams: function() {},
        showArticles: function() {},
        showArticle: function() {},
        loadingStart: function() {},
        loadingComplete: function() {}
    };
    $.futeriaMobile = function(props) {
        var fm = this;
        if (setup) {
            this.options = $.extend(this.options, props);
            return fm;
        }
        setup = true;
        this.options = $.extend(defaults, props);
        
        this.apiRequest = function(prop) {
            if (typeof(this.options.loadingStart) === 'function') {
                this.options.loadingStart();
            }
            var url = this.options.apiUrl + prop.url;
            if (prop.nocache || prop.noCache) {
                url += (url.indexOf('?')) ? '&' : '?';
                url += 't=' + this.util.timestamp();
            };
            $.ajax({
                url: url,
                dataType: 'json',
                success: function(response) {
                    if (typeof(prop.success) === 'function') {
                        prop.success(response);
                    }
                },
                complete: function(response) {
                    if (typeof(prop.complete) === 'function') {
                        prop.complete(response);
                    };
                    if (typeof(fm.options.loadingComplete) === 'function') {
                        fm.options.loadingComplete();
                    }
                },
                error: function() {
                    if (typeof(prop.error) === 'function') {
                        prop.error();
                    } else {
                        alert('Erro ao carregar a página. Verifique a conexão com a Internet e tente novamente.');
                    }
                }
            });
        };
        
        this.load = function(pageName, reverse) {
            var page = this.pages.current(pageName);
            if (!page) {
                alert('Página inválida: ' + pageName);
                this.load('teams', true);
            } else {
                page.load();
                this.options.goto(pageName, reverse);
            }
        };

        this.refresh = function() {
            var page = this.pages.current();
            if (page && page.load) {
                page.load();
            }
        };

        this.back = function() {
            var page = this.pages.current();
            if (page && page.prev) {
                page.prev();
            }
        };
        
        this.currPage = function() {
            if (arguments.length) {
                localStorage.setItem('page', arguments[0]);
                // arg[0] = pageName, arg[1] = reverse (back button)
                fm.load(arguments[0], arguments[1] === true);
            }
            return localStorage.getItem('page');
        };

        this.currTeam = function() {
            if (arguments.length) {
                localStorage.setItem('team', arguments[0]);
            }
            return localStorage.getItem('team');
        };

        this.currArticle = function() {
            if (arguments.length) {
                localStorage.setItem('article', arguments[0]);
            }
            return localStorage.getItem('article');
        };

        this.util = {

            months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outrubro', 'novembro', 'dezembro'],

            icon: function(team) {
                return '<img src="' + fm.options.baseUrl + '/img/team/' + team + '.mini.png" alt="" class="ui-li-icon" />';
            },

            timestamp: function() {
                return (new Date()).getTime();
            },

            formatDate: function(dt) {
                if (dt) {
                    var d = dt.split(" ");
                    var date = d[0].split("-");
                    return date[2] + " de " + fm.util.months[date[1] - 1] + " de " + date[0] + " às " + d[1];
                }
                return '';
            }

        };
        
        this.pages = {

            current: function(pageName) {
                return fm.pages[pageName || fm.currPage()];
            },

            teams: {
                loaded: false,
                load: function() {
                    // prevent multi load
                    if (this.loaded) {
                        return;
                    }
                    this.loaded = true;
                    fm.apiRequest({
                        url: '/teams',
                        success: function(response) {
                            fm.options.showTeams(response.data || []);
                        }
                    });
                },
                next: function(teamSlug) {
                    fm.currTeam(teamSlug); 
                    fm.currArticle('');
                    fm.currPage('articles');
                }
            },

            articles: {
                lastTeam: null, 
                load: function() {
                    var teamSlug = fm.currTeam();
                    // prevent multi load
                    if (teamSlug === this.lastTeam) {
                        return;
                    }
                    fm.apiRequest({
                        url: '/articles/' + teamSlug + '/' + fm.options.listLimit,
                        nocache: true,
                        success: function(response) {
                            fm.options.showArticles(teamSlug, response.data || []);
                            this.lastTeam = teamSlug;
                        }
                    });
                },
                prev: function() {
                    fm.currTeam('');
                    fm.currArticle('');
                    fm.currPage('teams', true);
                },
                next: function(teamSlug, articleSlug) {
                    fm.currTeam(teamSlug); 
                    fm.currArticle(articleSlug);
                    fm.currPage('article');
                }
            },

            article: {
                lastTeam: null,
                lastArticle: null,
                load: function() {
                    var teamSlug = fm.currTeam();
                    var articleSlug = fm.currArticle();
                    // prevent multi load
                    if (teamSlug === this.lastTeam && articleSlug === this.lastArticle) {
                        return;
                    }
                    fm.apiRequest({
                        url: '/article/' + teamSlug + '/' + articleSlug + '?plain',
                        success: function(response) {
                            if (response && response.data) {
                                fm.options.showArticle(teamSlug, response.data || {});
                                this.lastTeam = teamSlug;
                                this.lastArticle = articleSlug;
                            } else {
                                alert('Artigo inválido');
                                fm.load('teams', true);
                            }
                        }
                    });
                },
                prev: function() {
                    fm.currArticle('');
                    fm.currPage('articles', true);
                }
            }
        };
        return fm;
    };
})($);
