/**
 * Futeria Mobile
 */
var Futeria = Futeria || {};

Futeria.Mobile = {
        
    listLimit: 20,
    baseUrl: '.',
    apiUrl: 'http://api.futeria.net',
    lastLoad: { team: '', article: ''},

    pageBackFlow: {
        teams: 'teams',
        article: 'articles',
        articles: 'teams'
    },

    currPage: function() {
        if (!Futeria.Mobile.currTeam()) {
            return 'teams';
        } else {
            if (!Futeria.Mobile.currArticle()) {
                return 'articles';
            }
            return 'article';
        }
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

    load: function(page) {
        switch (page) {
        case 'teams':
            Futeria.Mobile.Loader.teams();
            break;
        case 'articles':
            Futeria.Mobile.Loader.articles(Futeria.Mobile.currTeam());
            break;
        case 'article':
            Futeria.Mobile.Loader.article(Futeria.Mobile.currTeam(), Futeria.Mobile.currArticle());
            break;
        }
    },

    update: function(prop) {
        prop = prop || {};
        Futeria.Mobile.currPage(prop.page || 'teams');
        Futeria.Mobile.currTeam(prop.team || '');
        Futeria.Mobile.currArticle(prop.article || '');
    },

    Loader: {

        teams: function() {
            if (Futeria.Mobile.teamsLoaded) {
                return;
            }
            Futeria.Mobile.teamsLoaded = true;
            var list = $('#teams-list');
            list.html('');
            $.mobile.showPageLoadingMsg();
            $.ajax({
                url: Futeria.Mobile.apiUrl + '/teams',
                dataType: 'json',
                success: function(response) {
                    if (response.data && response.data.length) {
                        for (var i = 0; i < response.data.length; i++) {
                            var team = response.data[i];
                            var icon = Futeria.Mobile.Loader.icon(team.slug);
                            var onclick = "Futeria.Mobile.currTeam('" + team.slug + "');";
                            list.append('<li><a href="#articles" data-transition="slide" onclick="' + onclick + '">' + icon + team.nickname + '</a></li>');
                        }
                    }
                    list.listview('refresh');
                    $.mobile.hidePageLoadingMsg();
                    Futeria.Mobile.update();
                },
                error: function(xhr, status, error) {
                    Futeria.Mobile.Error.show(error.responseText);
                }
            });
        },

        articles: function(teamSlug) {
            // prevent multi load
            if (teamSlug === Futeria.Mobile.lastLoad.team) {
                return;
            }
            Futeria.Mobile.lastLoad.team = teamSlug;
            var list = $('#articles-list');
            list.html('');
            $.mobile.showPageLoadingMsg();
            $.ajax({
                url: Futeria.Mobile.apiUrl + '/articles/' + teamSlug + '/' + Futeria.Mobile.listLimit + '?t=' + Futeria.Mobile.Util.timestamp(),
                dataType: 'json',
                success: function(response) {
                    if (response.data && response.data.length) {
                        for (var i = 0; i < response.data.length; i++) {
                            var article = response.data[i];
                            var icon = Futeria.Mobile.Loader.icon(teamSlug);
                            var name = "<h3>" + article.title + "</h3>";
                            var description = "<p>" + Futeria.Mobile.Util.formatDate(article.date) + "</p>";
                            var onclick = "Futeria.Mobile.currTeam('" + teamSlug + "'); Futeria.Mobile.currArticle('" + article.slug + "');";
                            list.append('<li><a href="#article" onclick="' + onclick + '">' + icon + name + description + '</a></li>');
                        }
                    }
                    list.listview('refresh');
                    $.mobile.hidePageLoadingMsg();
                    Futeria.Mobile.update({team: teamSlug, page: 'articles'});
                },
                error: function(xhr, status, error) {
                    Futeria.Mobile.Error.show(error.responseText);
                }
            });
        },

        article: function(teamSlug, articleSlug) {
            // prevent multi load
            if (teamSlug === Futeria.Mobile.lastLoad.team && articleSlug === Futeria.Mobile.lastLoad.article) {
                return;
            }
            Futeria.Mobile.lastLoad.team = teamSlug;
            Futeria.Mobile.lastLoad.article = articleSlug;
            var view = $('#article-view');
            view.html('');
            $.mobile.showPageLoadingMsg();
            $.ajax({
                url: Futeria.Mobile.apiUrl + '/article/' + teamSlug + '/' + articleSlug + '?plain',
                dataType: 'json',
                success: function(response) {
                    if (response && response.data) {
                        view.append('<h2>' + response.data.title + '</h2>');
                        var content = response.data.content;
                        content = content.split("\n").join("<br/>");
                        view.append('<div>' + content + '</div>');
                        Futeria.Mobile.update({team: teamSlug, article: articleSlug, page: 'article'});
                    } else {
                        Futeria.Mobile.Error.show('Error: Invalid article');
                    }
                    $.mobile.hidePageLoadingMsg();
                },
                error: function(xhr, status, error) {
                    Futeria.Mobile.Error.show(error.responseText);
                }
            });
        },

        icon: function(team) {
            return '<img src="' + Futeria.Mobile.baseUrl + '/img/team/' + team + '.mini.png" alt="" class="ui-li-icon" />';
        }
    },
    
    Config: {
        
        load: function() {
            if (localStorage.getItem('team')) {
                $("#team").val(localStorage.getItem('team'));
                $("#team").selectmenu('refresh', true);
            }
        },
        
        save: function() {
            localStorage.setItem('team', $("#team").val());
            var dialog = $('#dialog');
            dialog.find('h1').text('Configurações');
            dialog.find('p').text('Configurações salvas com sucesso');
            $('#dialogOpen').click();
        }
        
    },

    Util: {
        
        months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outrubro', 'novembro', 'dezembro'],

        isHome: function() {
            var base = Futeria.Mobile.baseUrl;
            var location = window.location.toString();
            if (location[location.length - 1] == '/') {
                base += '/';
            }
            return (base == location);
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

    },

    Error: {

        show: function(msg) {
            $.mobile.hidePageLoadingMsg();
            if (msg) {
                alert(msg);
            }
        }

    }
    
}
