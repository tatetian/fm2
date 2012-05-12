$(function(){
  var Paper = Backbone.Model.extend({
    defaults: function() {
      return {
        title: "unknown title...",
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

    // Save all of the todo items under the `"todos"` namespace.
    localStorage: new Store("paper-list")
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
      alert('clicked');                
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }
  });

  // 
  var RecentPapersView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $(".tag-nav"),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {
      recentPapers.bind('add',    this.addOne, this);
      recentPapers.bind('reset',  this.addAll, this);
      //recentPapers.bind('all',    this.render, this);

      recentPapers.fetch();
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
    addOne: function(paper) {
      var view = new TitleView({model: paper});
      this.$("ul").append(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
      recentPapers.each(this.addOne);
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

  var recentPapersView = new RecentPapersView();
});
