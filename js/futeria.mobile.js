/**
 * Futeria Mobile core
 */
var Futeria = Futeria || {};
Futeria.Mobile = {
        
    listLimit: 20,
    baseUrl: '../',
    apiUrl: 'http://api.futeria.net',
    
    load: function(pageName, reverse) {
        var page = Futeria.Mobile.Pages.Current(pageName);
        if (!page) {
            alert('Página inválida');
            Futeria.Mobile.load('teams', true);
        } else {
            page.load();
            Futeria.Mobile.impl.goto(pageName, reverse);
        }
    },
    
    refresh: function() {
        var page = Futeria.Mobile.Pages.Current();
        if (page && page.load) {
            page.load();
        }
    },
    
    back: function() {
        var page = Futeria.Mobile.Pages.Current();
        if (page && page.prev) {
            page.prev();
        }
    },
            
    ajax: function(prop) {
        Futeria.Mobile.impl.showLoading();
        $.ajax({
            url: Futeria.Mobile.apiUrl + prop.url,
            dataType: 'json',
            success: function(response) {
                if (typeof(prop.success) === 'function') {
                    prop.success(response);
                }
                Futeria.Mobile.impl.hideLoading();
            },
            complete: function(response) {
                if (typeof(prop.complete) === 'function') {
                    prop.complete(response);
                };
            },
            error: function() {
                Futeria.Mobile.impl.hideLoading();
                alert('Erro ao carregar a página. Verifique a conexão com a Internet e tente novamente.');
            }
        });
    },

    Pages: {

        Current: function(pageName) {
            var pageName = pageName || Futeria.Mobile.currPage();
            pageName = pageName[0].toUpperCase() + pageName.substring(1);
            return Futeria.Mobile.Pages[pageName];
        },
                
        Teams: {
            loaded: false,
            load: function() {
                // prevent multi load
                if (this.loaded) {
                    return;
                }
                this.loaded = true;
                Futeria.Mobile.ajax({
                    url: '/teams',
                    success: function(response) {
                        Futeria.Mobile.impl.showTeams(response.data || []);
                    }
                });
            },
            next: function(teamSlug) {
                Futeria.Mobile.currTeam(teamSlug); 
                Futeria.Mobile.currArticle('');
                Futeria.Mobile.currPage('articles');
            }
        },
        
        Articles: {
            lastTeam: null, 
            load: function() {
                var teamSlug = Futeria.Mobile.currTeam();
                // prevent multi load
                if (teamSlug === this.lastTeam) {
                    return;
                }
                Futeria.Mobile.ajax({
                    url: '/articles/' + teamSlug + '/' + Futeria.Mobile.listLimit + '?t=' + Futeria.Mobile.Util.timestamp(),
                    success: function(response) {
                        Futeria.Mobile.impl.showArticles(teamSlug, response.data || []);
                        this.lastTeam = teamSlug;
                    }
                });
            },
            prev: function() {
                Futeria.Mobile.currTeam('');
                Futeria.Mobile.currArticle('');
                Futeria.Mobile.currPage('teams', true);
            },
            next: function(teamSlug, articleSlug) {
                Futeria.Mobile.currTeam(teamSlug); 
                Futeria.Mobile.currArticle(articleSlug);
                Futeria.Mobile.currPage('article');
            }
        },
        
        Article: {
            lastTeam: null,
            lastArticle: null,
            load: function() {
                var teamSlug = Futeria.Mobile.currTeam();
                var articleSlug = Futeria.Mobile.currArticle();
                // prevent multi load
                if (teamSlug === this.lastTeam && articleSlug === this.lastArticle) {
                    return;
                }
                Futeria.Mobile.ajax({
                    url: '/article/' + teamSlug + '/' + articleSlug + '?plain',
                    success: function(response) {
                        if (response && response.data) {
                            Futeria.Mobile.impl.showArticle(teamSlug, response.data || {});
                            this.lastTeam = teamSlug;
                            this.lastArticle = articleSlug;
                        } else {
                            alert('Artigo inválido');
                            Futeria.Mobile.load('teams', true);
                        }
                    }
                });
            },
            prev: function() {
                Futeria.Mobile.currArticle('');
                Futeria.Mobile.currPage('articles', true);
            }
        }
    },

    currPage: function() {
        if (arguments.length) {
            localStorage.setItem('page', arguments[0]);
            // arg[0] = pageName, arg[1] = reverse (back button)
            Futeria.Mobile.load(arguments[0], arguments[1] === true);
        }
        return localStorage.getItem('page');
    },

    currTeam: function() {
        if (arguments.length) {
            localStorage.setItem('team', arguments[0]);
        }
        return localStorage.getItem('team');
    },

    currArticle: function() {
        if (arguments.length) {
            localStorage.setItem('article', arguments[0]);
        }
        return localStorage.getItem('article');
    },

    Util: {
        
        months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outrubro', 'novembro', 'dezembro'],
                
        icon: function(team) {
            return '<img src="' + Futeria.Mobile.baseUrl + '/img/team/' + team + '.mini.png" alt="" class="ui-li-icon" />';
        },

        timestamp: function() {
            return (new Date()).getTime();
        },

        formatDate: function(dt) {
            if (dt) {
                var d = dt.split(" ");
                var date = d[0].split("-");
                return date[2] + " de " + Futeria.Mobile.Util.months[date[1] - 1] + " de " + date[0] + " às " + d[1];
            }
            return '';
        }

    }
    
};
