$(function() {
  metadata_id = $(".docid")[0].dataset["docid"];
  paper_id = $(".docid")[0].dataset["paperid"];
  //alert(metadata_id)
//==============================Tag's model & view=============================
  var Tag = Backbone.Model.extend({
    defaults: function() {
      return {
        name: "New tag",
      };
    },
    initialize: function() {
      if (!this.get("name")) {
        this.set({"name": this.defaults().name});
      }
    } 
  });
  var TagList = Backbone.Collection.extend({
    model: Tag,
    url: '/metadata/' + metadata_id + '/tags'
  });
  var TagView = Backbone.View.extend({
    tagName:  "li",
    template: _.template($('#tag-template').html()),
    events: {
      "dblclick li"         : "renameTag"
    },
    initialize: function() {
      this.model.bind('change', this.render, this);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    renameTag: function() {
      alert('clicked');                
    },
    clear: function() {
      this.model.clear();
    }
  });
  var TagListView = Backbone.View.extend({
    el: $(".detail-tag"),
    events: {
    },
    initialize: function() {
      this.collection.bind('add',    this.addOne, this);
      this.collection.bind('reset',  this.addAll, this);
    },
    addOne: function(tag) {
      var view = new TagView({model: tag});
      this.$(".detail-tag .wrapper ul").append(view.render().el);
    },
    addAll: function() {
      this.collection.each(this.addOne);
    }
  });
  //==============================Comment's model & view=============================
  var Comment = Backbone.Model.extend({
    });
  var CommentList = Backbone.Collection.extend({
    model: Comment,
    url: '/papers/' + paper_id + '/comments'
  });
  var CommentView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($("#comment-template").html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  var CommentListView = Backbone.View.extend({
    el: $(".detail-content"),
    events: {
    },
    initialize: function() {
      this.collection.bind('add',    this.addOne, this);
      this.collection.bind('reset',  this.addAll, this);
    },
    render: function() {
    },
    addOne: function(comment) {
      var view = new CommentView({model: comment});
      this.$(".detail-content ul").append(view.render().el);
    },
    addAll: function() {
      this.collection.each(this.addOne,this);
    }
  });
    //==============================Ower's model & view=============================
  var Owner = Backbone.Model.extend({
    });
  var OwnerList = Backbone.Collection.extend({
    model: Owner,
    url: '/friends?paper_id=' + paper_id
  });
  var OwnerView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($("#owner-template").html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  var OwnerListView = Backbone.View.extend({
    el: $(".detail-friends"),
    events: {
    },
    initialize: function() {
      this.collection.bind('add',    this.addOne, this);
      this.collection.bind('reset',  this.addAll, this);
    },
    render: function() {
    },
    addOne: function(owner) {
      var view = new OwnerView({model: owner});
      this.$(".detail-friends ul").append(view.render().el);
    },
    addAll: function() {
      this.collection.each(this.addOne,this);
    }
  });
//=================================App's view==================================
  var AppView = Backbone.View.extend({
    el: $("body"),
    initialize: function() {
      // models
      var tagList = new TagList();
      var tagListView = new TagListView({collection: tagList});
      var commentList = new CommentList();
      var commentListView = new CommentListView({collection: commentList});
      var ownerList = new OwnerList();
      var ownerListView = new OwnerListView({collection: ownerList});
      
      // fetch
      tagList.fetch();
      commentList.fetch();
      ownerList.fetch();
    }
  });
  var appView = new AppView();
});


