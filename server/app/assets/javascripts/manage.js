$(function() {
//================================== Tag's model ==============================
  var Tag = Backbone.Model.extend({
    defaults: function() {
      return {
        name: "未命名",
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
//=============================== Metadata's model ============================
  var Metadata = Backbone.Model.extend({ 
  });
  var MetadataList = Backbone.Collection.extend({
    model: Metadata,
    url: '/metadata?tags=All'
  });
//=============================== Title's View ================================
  var TitleView = Backbone.View.extend({
    tagName: 'li',
    events: {  
    },
    template: _.template($('#title-template').html()),
    render: function() {
      // model
      var json = this.model.toJSON();
      // fake color
      if(Math.random() > 0.5)
        json.yellow_or_white = 'yellow';
      else
        json.yellow_or_white = 'white';
      if(Math.random() < 0.5)
        json.colorid = 1;
      else
        json.colorid = 2;
      // append content
      this.$el.append(this.template(json));
      return this;
    }
  });
  var TitlesView = Backbone.View.extend({
    tagName: 'ul',
    initialize: function() {
      this.folder = this.options.folder;
      this.collection.bind('add', this.addOne, this);
      this.collection.bind('reset', this.addAll, this);
    },
    addOne: function(model) {
      var json = model.toJSON();
      var folderName = this.folder.getName();
      if(json.tags.indexOf(folderName) >= 0) {
        var titleView = new TitleView({model: model});
        this.$el.append(titleView.render().el);
      }
    },
    addAll: function() {
      this.collection.each(this.addOne, this);
    }
  });
//=============================== Folder's view ===============================
  var FolderView = Backbone.View.extend({
    tagName: 'li',
    events: {},
    template: _.template($('#folder-template').html()),
    initialize: function() {
      // view to display titles in this folder
      this.titles       = new TitlesView({
                                collection: this.collection,//MetadataList
                                folder: this});
    },
    getName: function() {
      return this.model.get('name');
    },
    render: function() {
      // render folder dom
      var json      = this.model.toJSON();
      this.$el.html(this.template(json));
      // append titles to this folder
      var $titles   = this.titles.render().$el;
      this.$el.find('.titles').append($titles);
      // iscroll
      /*this.scroller = new iScroll('titles-'+json.id,{
        fadeScrollbar:true,
        hideScrollbar:true,
        lockDirection:true
      });*/
      return this;        
    }
  });
  var FoldersView = Backbone.View.extend({
    el: '.all-tag ul',
    initialize: function() {
      this.metadataList = this.options.metadataList;
      this.collection.bind('add', this.addOne, this);
      this.collection.bind('reset', this.addAll, this);
    },
    addOne: function(model, options) {
      // Add a new folder given its model
      var folder = new FolderView({
        model:      model,
        collection: this.metadataList,
      });
      // render & insert new folder before '+'
      folder.render().$el.insertBefore($('.all-tag ul li:last-child'));
    },
    addAll: function() {
      this.collection.each(this.addOne, this);
    }
  }); 
//=============================== Manager's view ==============================
  var Manager = Backbone.View.extend({
    el: '#wrapper',
    initialize: function() {
      var that = this;
      // models
      this.tagList = new TagList();
      this.metadataList = new MetadataList();
      // init sub views
      this.folders = new FoldersView({
        collection: this.tagList, 
        metadataList: this.metadataList
      });
      // fetch
      this.tagList.fetch();
      this.metadataList.fetch({
        success: function() {
          $(".all-tag").width(350 * (that.metadataList.size() + 1) );
          var myScroll7 = new iScroll('wrapper',{
            vScroll:false,
            fadeScrollbar:true,
            hideScrollbar:true,
            lockDirection:true,
            snap: 'li'
          });
        }
      });
    },
    render: function() {
    }
  });
  var manager = new Manager();
});
