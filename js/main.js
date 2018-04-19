(function(){
  'use strict';

  const http = axios.create({
    baseURL: 'https://qiita.com/api/v2/'
  });

  http.interceptors.request.use((config) => {
    config.headers.Authorization = "Bearer 0fbccbfa983a853d0bf8782f18decc2bbf2a3c46";
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

  var vm = new Vue({
    el: '#app',
    data: {
      articles: []
    },
    mounted() {
      // 投稿一覧を取得しても「page_views_count」が取得されない（null）ため、
      // 取得記事に対して個別取得して「page_views_count」を取得する。
      http.get("/authenticated_user/items")
        .then(response => {
          this.articles = [];
          response.data.forEach(function(item){
            http.get(`/items/${item.id}`)
              .then(response => {
                this.articles.push(response.data);
              })
              .catch(error => {console.log(error);});
          }, this);
        })
        .catch(error => {console.log(error);});
    }
  });
})();
