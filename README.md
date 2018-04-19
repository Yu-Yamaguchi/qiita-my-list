# axios＋Vue.js＋Qiita API v2を利用して自分の投稿記事と閲覧件数（views）などを一覧表示してみる

## 事前準備

### 個人用アクセストークンを生成

1. Qiitaにログインしアカウントの設定画面へ遷移
1. 左ペインからアプリケーションを選択
1. 個人用アクセストークンの`新しくトークンを発行する`を選択
![新しくトークンを発行する](/images/1.PNG)
1. アクセストークンの説明やスコープを設定し発行するボタンを押下
![発行](/images/2.PNG)
1. 発行されたアクセストークンを控えておく（後で使うし、この画面切り替えると二度と表示できないので）<br>ちなみに、この記事を投稿したタイミングでこのトークン削除してるのでこのトークンは利用できません m(_ _)m <br>
0fbccbfa983a853d0bf8782f18decc2bbf2a3c46
![発行されたアクセストークン](/images/3.PNG)
<br><br>
発行後、同じ画面に遷移するとこんな感じになります。
![発行後の個人用アクセストークン画面](/images/4.PNG)

## axios＋Vue.js＋Qiita API v2を利用した投稿記事や閲覧件数の一覧表示

### コードの構成

```
qiita-my-list/
　├ css/
　│　└ style.css
　├ js/
　│　└ main.js
　└ index.html
```

CSSはちょっとだけ画面デザインを調整しているだけなので、特に気にせず、index.htmlとmain.jsの中身を中心に記載していきます。

### index.htmlの中身

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Qiita My Article List</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app" class="container">
    <h1>My Articles</h1>
    <table>
      <thead>
        <tr>
          <th>＃</th>
          <th>タイトル</th>
          <th>閲覧</th>
          <th>いいね</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(article, idx) in articles">
          <td>{{idx + 1}}</td>
          <td>{{article.title}}</td>
          <td>{{article.page_views_count}}</td>
          <td>{{article.likes_count}}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

#### ポイント

特にポイントというほどのものはあまりないのですが、vue.jsの使い方のおさらい含めてメモ程度に記載しておきます。

+ tbody > trに記述している`v-for`によって、後述する`Vue`が保持している記事一覧情報`articles`の件数分だけ繰り返し`tr`タグが出力されるようにしている。
+ `v-for`の`(article, idx)`部分は
 + `article`は`articles`の要素（1つずつの記事）を表す
 + `idx`は`0`からの添え字（インデックス番号）を表す
+ `axios.min.js`はREST APIを利用する際に便利なHTTPクライアントjavascript
+ `vue.js`はMVVMの設計基盤となるjavascriptフレームワーク

### main.js

```javascript
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
```

#### ポイント

+ `use strict`はjavascript書く時推奨されている厳格モードで、なんかいいらしいので記述。
+ `baseURL`はaxiosを利用してQiita APIを何度も呼び出すため、ベースとなるURLをあらかじめ定義。
+ `config.headers.Authorization`は、QiitaAPIの`/authenticated_user/items`は認証中のユーザの投稿の一覧を作成日時の降順で取得するAPIで、このAPIを利用するために必要となるため定義。
+ 記事一覧取得のAPIだけでは`page_views_count`が取得できないため、個別記事を1つずつ取得して`page_views_count`を表示できるようにしている。

### コード一式

コード一式はGitHubにあげておきました。
https://github.com/Yu-Yamaguchi/qiita-my-list
