/**
 * Futeria Mobile
 * jQuery Mobile impl
 * 
 * @author rogeriolino <rogeriolino.com>
 */
$(function() {
    //$.mobile.defaultPageTransition = 'slide';
    var fm = $.futeriaMobile({
        goto: function(pageName, reverse) {
            $.mobile.changePage('#' + pageName, {reverse: reverse});
        },
        loadingStart: function() {
            $.mobile.showPageLoadingMsg();
        },
        loadingComplete: function() {
            $.mobile.hidePageLoadingMsg();
        },
        showTeams: function(teams) {
            var list = $('#teams-list');
            list.html('');
            for (var i = 0; i < teams.length; i++) {
                var team = teams[i];
                var icon = fm.util.icon(team.slug);
                var onclick = "$.futeriaMobile().pages.teams.next('" + team.slug + "');";
                list.append('<li><a href="#articles" data-transition="slide" onclick="' + onclick + '">' + icon + team.nickname + '</a></li>');
            }
            list.listview('refresh');
        },
        showArticles: function(teamSlug, articles) {
            var list = $('#articles-list');
            list.html('');
            for (var i = 0; i < articles.length; i++) {
                var article = articles[i];
                var icon = fm.util.icon(teamSlug);
                var name = "<h3>" + article.title + "</h3>";
                var description = "<p>" + fm.util.formatDate(article.date) + "</p>";
                var onclick = "$.futeriaMobile().pages.articles.next('" + teamSlug + "', '" + article.slug + "')";
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
    });
    //fm.currPage(fm.currPage() || 'teams');
    fm.currPage('teams');
    $(document).on('pagebeforechange', function(e) {
        //fm.load(page);
    });
});
