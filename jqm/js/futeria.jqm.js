/**
 * Futeria Mobile
 * 
 * jQuery Mobile impl
 */
Futeria.Mobile.impl = {
        
    listLimit: 20,
    baseUrl: '.',
    apiUrl: 'http://api.futeria.net',

    goto: function(pageName, reverse) {
        $.mobile.changePage('#' + pageName, {reverse: reverse});
    },
    
    showLoading: function() {
        $.mobile.showPageLoadingMsg();
    },
    
    hideLoading: function() {
        $.mobile.hidePageLoadingMsg();
    },
            
    showTeams: function(teams) {
        var list = $('#teams-list');
        list.html('');
        for (var i = 0; i < teams.length; i++) {
            var team = teams[i];
            var icon = Futeria.Mobile.Util.icon(team.slug);
            var onclick = "Futeria.Mobile.Pages.Teams.next('" + team.slug + "');";
            list.append('<li><a href="#articles" data-transition="slide" onclick="' + onclick + '">' + icon + team.nickname + '</a></li>');
        }
        list.listview('refresh');
    },
            
    showArticles: function(teamSlug, articles) {
        var list = $('#articles-list');
        list.html('');
        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            var icon = Futeria.Mobile.Util.icon(teamSlug);
            var name = "<h3>" + article.title + "</h3>";
            var description = "<p>" + Futeria.Mobile.Util.formatDate(article.date) + "</p>";
            var onclick = "Futeria.Mobile.Pages.Articles.next('" + teamSlug + "', '" + article.slug + "')";
            list.append('<li><a href="#article" onclick="' + onclick + '">' + icon + name + description + '</a></li>');
        }
        list.listview('refresh');
    },
            
    showArticle: function(teamSlug, article) {
        var view = $('#article-view');
        view.html('');
        view.append('<h2>' + article.title + '</h2>');
        var content = article.content;
        content = content.split("\n").join("<br/>");
        view.append('<div>' + content + '</div>');
    }
    
};
