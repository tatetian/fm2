$(function() {
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
    url: '/metadata/1/tags'
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
    el: $(".reading-tag"),
    events: {
    },
    initialize: function() {
      this.collection.bind('add',    this.addOne, this);
      this.collection.bind('reset',  this.addAll, this);
    },
    addOne: function(tag) {
      var view = new TagView({model: tag});
      this.$(".reading-tag .wrapper ul").append(view.render().el);
    },
    addAll: function() {
      this.collection.each(this.addOne);
    }
  });
//============================Metadata's model & view==========================
  var Metadata = Backbone.Model.extend({
    url: '/metadata/1',
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
//================================Detail view==================================
  var TitleView = Backbone.View.extend({
    el: $(".reading-title"),
    template: _.template($("#title-template").html()),
    initialize: function() {
      this.model.bind('change', this.render, this);
    },
    render: function() {
      alert(JSON.stringify(this.model.toJSON()));
      this.$el.html(this.template(this.model.toJSON()));
    }
  });
//=================================App's view==================================
  var AppView = Backbone.View.extend({
    el: $("body"),
    initialize: function() {
      // models
      var metadata = new Metadata();
      var tagList = new TagList();
      // views
      var titleView = new TitleView({model: metadata});
      var tagListView = new TagListView({collection: tagList});
      // fetch
      metadata.fetch();
      tagList.fetch();
    }
  });
  var appView = new AppView();
});


