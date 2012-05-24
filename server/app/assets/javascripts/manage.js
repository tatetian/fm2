$(function() {
//================================== Tag's model ==============================
  var Tag = Backbone.Model.extend({
    defaults: function() {
      return {
        name: "New folder",
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
  var Titles = Backbone.View.extend({
    tagName: 'ul',
    initialize: function() {
      this.folderName = this.options.folderName;
      this.collection.bind('add', this.addOne, this);
      this.collection.bind('reset', this.addAll, this);
    },
    template: _.template($('#title-template').html()),
    addOne: function(model) {
      var json = model.toJSON();
//      alert(this.folderName + '|' + JSON.stringify(json.tags));
      if(json.tags.indexOf(this.folderName) >= 0)
        this.$el.append(this.template(json));
    },
    addAll: function() {
      this.collection.each(this.addOne, this);
    }
  });
//=============================== Folder's view ===============================
  var Folders = Backbone.View.extend({
    el: '.all-tag ul',
    initialize: function() {
      this.metadataList = this.options.metadataList;
      this.collection.bind('add', this.addOne, this);
      this.collection.bind('reset', this.addAll, this);
    },
    template: _.template($('#folder-template').html()),
    addOne: function(model, options) {
      // add before '+' 
      var json = model.toJSON();
      var titles = new Titles({
        collection: this.metadataList,
        folderName: json.name
      });
      var $folder = $(this.template(json));
      $folder.find('.titles').append(titles.$el);
      $folder.insertBefore($('.all-tag ul li:last-child'));

      var myScroll = new iScroll('titles-'+json.name,{
        fadeScrollbar:true,
        hideScrollbar:true,
        lockDirection:true
      });
/*var myScroll7 = new iScroll('wrapper',{
  fadeScrollbar:true,
  hideScrollbar:true,
  lockDirection:true
});*/

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
      $('#wrapper').width($(window).width());
      // models
      this.tagList = new TagList();
      this.metadataList = new MetadataList();
      // init sub views
      this.folders = new Folders({
        collection: this.tagList, 
        metadataList: this.metadataList
      });
      // fetch
      this.tagList.fetch();
      this.metadataList.fetch({
        success: function() {
          
          $(".all-tag").width(370 * (that.metadataList.size() + 1) );
          var myScroll7 = new iScroll('wrapper',{
            vScroll:false,
            fadeScrollbar:true,
            hideScrollbar:true,
            lockDirection:true
          });

        }
      });
    },
    render: function() {
    }
  });
  var manager = new Manager();
});
