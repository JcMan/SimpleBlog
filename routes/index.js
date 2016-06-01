var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');

module.exports = function(app){
app.get('/', function (req, res){
  Post.get(null, function (err, posts){
    if (err) {
      posts = [];
    } 
    var page=req.query.p?parseInt(req.query.p):1;
    var total = posts.length;
    posts = posts.slice((page-1)*5,page*5);
    res.render('index', {
      title: '主页',
      user: req.session.user,
      page:page,
      isFirstPage: (page - 1) == 0,
      isLastPage: ((page - 1) * 5 + posts.length) == total,
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});
  app.get('/reg', function (req, res) {
  res.render('reg', {
    title: '注册',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
 app.post('/reg', function (req, res) {
  var name = req.body.name,
      password = req.body.password,
      password_re = req.body['password-repeat'];
  if (password_re != password) {
    req.flash('error', '两次输入的密码不一致!'); 
    return res.redirect('/reg');
  }
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
      name: name,
      password: password,
      email: req.body.email
  });
  User.get(newUser.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', '用户已存在!');
      return res.redirect('/reg');
    }
    newUser.save(function (err, user){
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      }
      req.session.user = user;
      req.flash('success', '注册成功!');
      res.redirect('/');
    });
  });
});
app.get('/login', function (req, res) {
    res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
});
app.post('/login', function (req, res) {
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  User.get(req.body.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!'); 
      return res.redirect('/login');
    }
    if (user.password != password) {
      req.flash('error', '密码错误!'); 
      return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', '登陆成功!');
    res.redirect('/');
  });
});
app.get('/login', function (req, res) {
    res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
});
app.get('/post', function (req, res){
  res.render('post', {
    title: '发表',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
app.post('/post', function (req, res){
  var str = req.body.post;
  str = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+str;
  str = str.replace(new RegExp('\r\n',"gm"),'<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');

  var currentUser = req.session.user;
  var img = currentUser.img;
  var post = new Post(currentUser.name, img,req.body.title, str);
  

  post.save(function (err){
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    req.flash('success', '发布成功!');
    res.redirect('/');
  });
});

app.get('/logout', function (req, res){
  req.session.user = null;
  req.flash('success', '登出成功!');
  res.redirect('/');
});

app.get('/articlelist',function(req,res){
    var name = req.session.user.name;
    Post.get(name, function (err, posts){
    if (err) {
      posts = [];
    } 
    var page=req.query.p?parseInt(req.query.p):1;
    var total = posts.length;
    posts = posts.slice((page-1)*5,page*5);
    res.render('index', {
      title: '主页',
      user: req.session.user,
      page:page,
      isFirstPage: (page - 1) == 0,
      isLastPage: ((page - 1) * 5 + posts.length) == total,
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

});

app.get('/search', function (req, res) {
    res.render('search', {
        title: '搜索',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
});

app.post('/search', function (req, res){
    var search = req.body.search;
    Post.get(null, function (err, posts){
        if (err) {
          posts = [];
        }
        var contents = [];
        var i=0;
        posts.forEach(function (post, index){
            if(post.title.indexOf(search)!=-1||post.post.indexOf(search)!=-1||post.name.indexOf(search)!=-1){
                contents[i++] = post;
            }
        });
        res.render('index', {
            title: '主页',
            user: req.session.user,
            page:1,
            isFirstPage: 0== 0,
            isLastPage: 0==0,
            posts: contents,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});



};