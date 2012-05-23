$(function(){
  var Paper = Backbone.Model.extend({
    defaults: function() {
      return {
        title: "unknown title..."
      };
    },
    initialize: function() {
      if (!this.get("title")) {
        this.set({"title": this.defaults().title});
      }
    },
    // Remove this Todo from *localStorage* and delete its view.
    clear: function() {
      this.destroy();
    }
  });
  var PaperList = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: Paper,
    url: 'metadata'
  });
  var recentPapers = new PaperList(); 
  window.rp = recentPapers;

  // The DOM element for the title of a paper
  var TitleView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#title-template').html()),

    // The DOM events specific to an item.
    events: {
      "click a"         : "viewPaperDetail"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.model.bind('change', this.render, this);
    },

    // Re-render the titles of the todo item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    viewPaperDetail: function() {
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }
  });

  // 
  var RecentPapersView = Backbone.View.extend({
    el: $(".tag-nav"),
    events: {
    },
    initialize: function() {
      recentPapers.bind('add',    this.addOne, this);
      recentPapers.bind('reset',  this.addAll, this);
      recentPapers.fetch();
    },
    render: function() {
    },
    postRender: function() {            
        var noOfSlides = recentPapers.size(); 
        if(recentPapers.size()<=10)
            $('#papers').height(recentPapers.size()*41);
        else $('#papers').height(410);
        this.scroller = new iScroll('papers',{
              hScroll:false,
              vScrollbar:false,
              lockDirection:true
        });
    },
    addOne: function(paper) {
      var view = new TitleView({model: paper});
      this.$(".tag-nav ul").append(view.render().el);
    },
    addAll: function() {
      recentPapers.each(this.addOne);
    },
  });

  var recentPapersView = new RecentPapersView();
  if (recentPapersView.postRender) {
        recentPapersView.postRender();
  }
//==============================Friends View==================================
  var Friend = Backbone.Model.extend({
  });
  var FriendList = Backbone.Collection.extend({
    model: Friend,
    url: '/friends'
  });
  var FriendView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($("#friend-template").html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  var FriendsView = Backbone.View.extend({
    el: $(".index-friends ul"),
    events: {
    },
    initialize: function() {
      this.collection.bind('add',    this.addOne, this);
      this.collection.bind('reset',  this.addAll, this);
    },
    render: function() {
    },
    postRender: function() {            
        var noOfSlides = this.collection.size(); 
        if(this.collection.size()<=8)
            $('.full-friends').width(900);
        else
            $('.full-friends').width(this.collection.size()*110);
        this.scroller = new iScroll('index-friends', {
            snap: true,
            momentum: false,
            hScrollbar: false,
            vScroll:false,
            fadeScrollbar:true,
            lockDirection:true
        });
    },
    addOne: function(friend) {
      var view = new FriendView({model: friend});
      $(".index-friends ul").append(view.render().el);
    },
    addAll: function() {
      this.collection.each(this.addOne);
    }
  });
  var myFriends = new FriendList(); 
  var friendsView = new FriendsView({collection: myFriends});
  myFriends.fetch({
      success: function(){
                  if (friendsView.postRender) {
                        friendsView.postRender();
                  }
               }
  });
//==============================Logs View==================================
  var Log = Backbone.Model.extend({
  });
  var LogList = Backbone.Collection.extend({
    model: Log,
    url: '/logs'
  });
  var LogView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($("#log-template").html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  var LogsView = Backbone.View.extend({
    el: $(".freshthings ul"),
    events: {
    },
    initialize: function() {
      this.collection.bind('add',    this.addOne, this);
      this.collection.bind('reset',  this.addAll, this);
    },
    render: function() {
    },
    postRender: function() {    
        var noOfSlides = this.collection.size(); 
        if(this.collection.size()<=7)
            $('.freshthings').height(450);
        else
            $('.freshthings').height(this.collection.size()*70);
        this.scroller = new iScroll('freshthings',{
              hScroll:false,
              fadeScrollbar:true,
              hideScrollbar:true,
              lockDirection:true
        });
    },
    addOne: function(log) {
      var view = new LogView({model: log});
      $(".freshthings ul").append(view.render().el);
    },
    addAll: function() {
      this.collection.each(this.addOne);
    }
  });
  var myLogs = new LogList(); 
  var LogsView = new LogsView({collection: myLogs});
  myLogs.fetch({
      success: function(){
                  if (LogsView.postRender) {
                        LogsView.postRender();
                  }
               }
  });
});
