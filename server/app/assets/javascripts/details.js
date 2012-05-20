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
    url: '/metadata/' + metadata_id,
    defaults: function() {
      return {
        title: "Empty title",
        abstract: "This is a placeholder",
      };
    },
    initialize: function() {
      if (!this.get("title")) {
        this.set({"title": this.defaults().title});
      }
      if (!this.get("abstract")) {
        this.set({"abstract": this.defaults().abstract});
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
      this.$el.html(this.template(this.model.toJSON()));
    }
  });
  var AbstractView = Backbone.View.extend({
    el: $(".reading-abstract"),
    template: _.template($("#abstract-template").html()),
    initialize: function() {
      this.model.bind('change', this.render, this);
    },
    render: function() {
      var metadata = this.model.toJSON();
      if(metadata.abstract != undefined)
        this.$el.html($(this.template(metadata)));
    }
  });
  var AuthorView = Backbone.View.extend({
    el: $(".reading-entries"),
    template: _.template($("#detail-entry-template").html()),
    initialize: function() {
      this.model.bind('change', this.render, this);
    },
    render: function() {
      var details = this.model.toJSON();
      var authors = details.authors;
      if(authors != undefined && authors != "")
        this.$el.append(this.template({name: "Authors：", value: authors}));
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
      var authorView = new AuthorView({model: metadata});
      var abstractView = new AbstractView({model: metadata});
      var tagListView = new TagListView({collection: tagList});
      // fetch
      metadata.fetch();
      tagList.fetch();
    }
  });
  var appView = new AppView();
});


