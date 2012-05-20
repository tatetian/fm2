$(function() {
//===========================Tag's model & view===============================
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
    url: '/tags'
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
    el: $(".tag-man-head"),
    events: {
    },
    initialize: function() {
      this.collection.bind('add',    this.addOne, this);
      this.collection.bind('reset',  this.addAll, this);
    },
    addOne: function(tag) {
      var view = new TagView({model: tag});
      view.render().$el.insertBefore('.tag-man-head ul li:last-child');
    },
    addAll: function() {
      this.collection.each(this.addOne);
    }
  });
  var tagList = new TagList();
  var tagListView = new TagListView({collection:tagList});
  tagList.fetch();
//===============================Paper's model & view==========================
  var Metadata = Backbone.Model.extend({
    defaults: function() {
      return {
        title: "Empty title",
      };
    },
    initialize: function() {
      if (!this.get("title")) {
        this.set({"title": this.defaults().title});
      }
    } 
  });
  var MetadataList = Backbone.Collection.extend({
    model: Metadata,
    url: '/metadata?tags=All'
  });
  var MetadataView = Backbone.View.extend({
    tagName:  "li",
    template: _.template($('#metadata-template').html()),
    events: {
    },
    initialize: function() {
      this.model.bind('change', this.render, this);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  var MetadataListView = Backbone.View.extend({
    el: $(".tag-man-subcontent"),
    events: {
    },
    initialize: function() {
      this.collection.bind('add',    this.addOne, this);
      this.collection.bind('reset',  this.addAll, this);
    },
    addOne: function(tag) {
      var view = new MetadataView({model: tag});
      $('.tag-man-subcontent ul').append(view.render().el);
    },
    addAll: function() {
      this.collection.each(this.addOne);
    }
  });
  var metadataList = new MetadataList();
  var metadataListView = new MetadataListView({collection:metadataList});
  metadataList.fetch();
});
