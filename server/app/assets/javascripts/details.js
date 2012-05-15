$(function() {
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
    // Reference to this collection's model.
    model: Tag,

    url: 'metadata/1/tags'
  });

  var tagList = new TagList();

  var TagView = Backbone.View.extend({
    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#tag-template').html()),

    // The DOM events specific to an item.
    events: {
      "click a"         : "renameTag"
    },

    // The TagView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Tag** and a **TagView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.model.bind('change', this.render, this);
    },

    // Re-render the name of the tag item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    renameTag: function() {
      alert('clicked');                
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }
  });

  var TagListView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $(".reading-tag"),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {
      tagList.bind('add',    this.addOne, this);
      tagList.bind('reset',  this.addAll, this);
      //recentPapers.bind('all',    this.render, this);

      tagList.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
    /*  var done = Todos.done().length;
      var remaining = Todos.remaining().length;

      if (Todos.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
      } else {
        this.main.hide();
        this.footer.hide();
      }

      this.allCheckbox.checked = !remaining;*/
    },

    // Add a single paper item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(tag) {
      var view = new TagView({model: tag});
      this.$(".reading-tag .wrapper ul").append(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
      tagList.each(this.addOne);
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Todos.create({title: this.input.val()});
      this.input.val('');
    }
  // Finally, we kick things off by creating the **App**.
//  var App = new AppView;
  });

  var tagListView = new TagListView();
});
