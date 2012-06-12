//== require plupload/plupload
//== require plupload/plupload.html5
$(function(){
 /* var Paper = Backbone.Model.extend({
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
      var json = this.model.toJSON();
      
      if(Math.random() > 0.5)
        json.yellow_or_white = 'yellow';
      else
        json.yellow_or_white = 'white';
      if(Math.random() < 0.5)
        json.colorid = 1;
      else
        json.colorid = 2;
      this.$el.html(this.template(json));
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
    },
    render: function() {
    },
    postRender: function() {            
        var noOfSlides = recentPapers.size(); 
        $('#papers').height(48+48+recentPapers.size()*48+48);
        $('#papers > ul').height(48+48+recentPapers.size()*48);
        this.scroller = new iScroll('papers',{
            hScroll:false,
            vScrollbar:false,
            lockDirection:true,
            overflowHidden: false,
            snap: 'li'
        });
        for(var i = 0; i< recentPapers.size(); i++){
            var index = recentPapers.at(i).get("id");
            $('#detail'+index).on('click', function(e){
              TINY.box.show('/details/'+this.dataset["id"],1,778,650,1);
            });
        }
    },
    addOne: function(paper) {
      var view = new TitleView({model: paper});
      this.$(".tag-nav ul ul").append(view.render().el);
    },
    addAll: function() {
      recentPapers.each(this.addOne);
    },
  });

  var recentPapersView = new RecentPapersView({collection: recentPapers});
      recentPapers.fetch({
          success: function(){
                if (recentPapersView.postRender) {
                      recentPapersView.postRender();
                }
             }
      });
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
  });*/
//================================== Helpers ==================================
// Add a cutom click event to specific element of a view
// The default click event is not useful since it can't distinguish between 
// a drag click and a single click
  function addMyClick(view, selector, callback) {
    if(!view.events) view.events = {};
    var x, y;
    view.events['mousedown ' + selector] = function(e) {
      x = e.screenX;
      y = e.screenY;
    };
    view.events['mouseup ' + selector] = function(e) {
      if (x == e.screenX && y == e.screenY)
        callback.apply(this);
    };
  }
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
    defaults: function() {
      return {
        docid: 'null',
        progress: -1
      };
    }
  });
  var MetadataList = Backbone.Collection.extend({
    model: Metadata,
    url: '/metadata?tags=All'
  });
//=============================== Title's View ================================ 
  var TitleView = Backbone.View.extend({
    tagName: 'li',
    initialize: function() {
      addMyClick(this, 'a.ml20',  this.viewPaper);
      addMyClick(this, '.star',   this.clickStar);
      addMyClick(this, '.tag-color',  this.clickColor);

      this.model.bind('change', this.change, this);
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
    },
    viewPaper: function() {
      alert('viewPaper: this is ' + this);
    },
    clickStar: function() {
      alert('clickStar: this is ' + this);
    },
    clickColor: function() {
      alert('clickColor: this is ' + this);
    },
    change: function() {
      var json = this.model.toJSON();
      this.$el.empty().append(this.template(json));        
    }
  });
  var TitlesView = Backbone.View.extend({
    tagName: 'ul',
    initialize: function() {
      this.folder = this.options.folder;
      this.collection.bind('add', this.addOne, this);
      this.collection.bind('reset', this.addAll, this);
    },
    addOne: function(model, that, options) {
      var json = model.toJSON();
      var folderName = this.folder.getName();
      if(json.tags.indexOf(folderName) >= 0) {
        var titleView = new TitleView({model: model}),
            newEl     = titleView.render().el;
        if(options != undefined && options.at == 0)
          this.$el.prepend(newEl);
        else 
          this.$el.append(newEl);
      }
      //this.folder.trigger('resize');
      //$('.papers > ul').height(48+48+recentPapers.size()*48);
    },
    addAll: function() {
      this.$el.empty();
      this.collection.each(this.addOne, this);
      this.folder.resize();
    } 
  });
//=============================== Folder's view ===============================
  var FolderView = Backbone.View.extend({
    tagName: 'li',
    className: 'folder one-column',
    events: {
    },
    template: _.template($('#folder-template').html()),
    initialize: function() {
      // View to display titles in this folder
      this.titles   = new TitlesView({
                              collection: this.collection,//MetadataList
                              folder: this });
      // Handle upload event
      this.uploader = new Uploader(this);

      this.bind('resize', this.onResize);
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
      var scrollerEle = this.$el.find('.papers')[0];
      this.scroller = new iScroll(scrollerEle,{
        hideScrollbar:true,
        lockDirection:true,
        overflowHidden: false,
        vScrollbar: false,
        useTransition: true,
        //momentum: false,
        overflowHidden: false
      });
      //setTimeout(200, function(){alert(200)});
      //
//      this.uploader.init();
      return this;
    },
    resize: function() {
      // height of window
      var maxContentH = $(window).height() - 84 - 56,
      // height of content in folder
          size = this.$el.find('.papers .titles > ul > li').length,
          folderContentH = 48+size*46;
      // pick the 
      //console.debug(folderContentH);
      this.$el.find('.papers').height(
          maxContentH < folderContentH? maxContentH : folderContentH);
      this.scroller.refresh();
    }
  });
  var FoldersView = Backbone.View.extend({
    el: '.folders-wrapper',
    optimalSize: 380,       /* optimal size for one folder */
    initialize: function() {
      var that = this;
      this.metadataList = this.options.metadataList;
      this.collection.bind('add', this.addOne, this);
      this.collection.bind('reset', this.addAll, this);
      this.items = new Array();
      $(window).resize(function() { that.resize(); });
    },
    addOne: function(model, options) {
      // Add a new folder given its model
      var folder = new FolderView({
        model:      model,
        collection: this.metadataList,
      });
      // render & insert new folder before '+'
      folder.render().$el.insertBefore(this.$el.find('.add-folder'));
      folder.uploader.init();
      this.items.push(folder);
    },
    addAll: function() {
      this.collection.each(this.addOne, this);
      this.items.push({$el: this.$el.find('.add-folder'), resize: function() {}});
      this.resize();
    },
    resize: function(e) {
      var wrapperWidth  = this.$el.width(),
          numFolders    = this.collection.size() + 1,
          numFoldersPerScreen = Math.round(wrapperWidth / this.optimalSize),
          folderMargin  = 0,
          folderWidth   = ( wrapperWidth - 2 * folderMargin * numFolders ) / numFoldersPerScreen;
      $('.one-column').css({
        width: folderWidth + 'px', 
      });
      this.$el.find('.folders').css({
//        padding: ,
        width: (folderWidth + 2 * folderMargin) * numFolders + 'px' 
      });
      _.forEach(this.items, function(item) { item.resize(); });
      this.N   = numFolders;
      this.n = numFoldersPerScreen;
      this.w  = folderWidth;
      this.W = wrapperWidth; 
      this.updateOpacity(0);
    },
    updateOpacity: function(x) {
      var that = this;
      _.forEach(that.items, function(item, index) {
        // width of a item
        var w = that.w,
          // width of container    
          W = that.W - w,
          // left of this item shifted by x
          l = index * that.w + x,
          // percentage of overflow
          // p = 0      => no overflow          => opacity = 1
          // 0 < p < 1  => partial overflow     => opacity = 1-p
          // p > 1      => completed overflow   => opacity = 0
          p = (l < 0) ? -l/w : 
              (l > W) ? (l-W)/w : 0,
          o = (p < 1) ? (1 - p) : 0,
          q = 0.2,
          o = q + (1-q)*o;
        //console.debug(['x', x, 'w', w, 'W', W, 'l', l, 'p', p].join(','));
        item.$el.css('opacity', o + '' );
      });
    }
  });
//================================ Ajax Uploader ==============================
  function Uploader(folder) {
    var id      = folder.model.get('id');
    // folder view that this uploader belongs to
    this.folder = folder;
    // plupload do the real work
    window.uploader = this.uploader = new plupload.Uploader({
        runtimes : 'html5,flash,html4',
        browse_button : 'uploader-' + id,
        //drop_element: 'papers-'+id,
        container: 'papers-'+id,
        max_file_size : '10mb',
        url : '/metadata',
        flash_swf_url : 'plupload/plupload.flash.swf',
        filters : [
            {title : "PDF files", extensions : "pdf"}
        ]
    });  
  }
  // Extend Events object
  _.extend(Uploader.prototype, Backbone.Events, {
    // Init 
    init : function() {
      var that = this;
      that.uploader.init();
      uploader.bind('FilesAdded', function(up, files) {
        $.each(files, function(i, file) {
          manager.metadataList.unshift({
            id: file.id,
            title: file.name,
            progress: 0,
            yellow_or_white: 'yellow',
            colorid: 1,
            tags:[that.folder.getName()]
          });
          that.folder.resize();
          that.uploader.start();
        });
      });
      uploader.bind('UploadProgress', function(up, file) {
        console.debug([file.id, file.percent].join(','));
        var metadata = manager.metadataList.get(file.id);
        metadata.set('progress', Math.round(file.percent) );
        metadata.change();
      });
      uploader.bind('FileUploaded', function(up, file) {
        console.debug([file.id, file.percent].join(','));
        var metadata = manager.metadataList.get(file.id);
        metadata.set('progress', -1 );
        metadata.change();
      });
    },
  }); 
//=============================== Manager's view ==============================
  var Manager = Backbone.View.extend({
    el: '#my-folders',
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
//          that.tagList.length
          //debug
          that.scroller = new iScroll('my-folders-wrapper',{
            vScroll:false,
            fadeScrollbar:true,
            hideScrollbar:true,
            lockDirection:true,
            hScrollbar: false,
            bounce: true,
            bounceLock: true,
            useTransition: true,
            snap: 'li',
            //momentum: false,
            overflowHidden: false,
            onPos: function(step) {
//              console.debug('onPos');

             that.folders.updateOpacity(that.scroller.x);
            }
            //force2D: true
          });

          window.scroller = that.scroller;
        }
      });
    },
    render: function() {
    }
  });
  var manager = new Manager();
  window.manager = manager;
//=========================== Friend Model & View ============================+
  var Friend = Backbone.Model.extend({
  });
  var FriendList = Backbone.Collection.extend({
    model: Friend,
    url: '/friends'
  });
  var FriendView = Backbone.View.extend({
    tagName: 'li',
    className: 'friend',
    template: _.template($("#friend-template").html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  var FriendsView = Backbone.View.extend({
    el: ".friends > .wrapper > ul",
    events: {
    },
    initialize: function() {
      this.collection.bind('add',    this.addOne, this);
      this.collection.bind('reset',  this.addAll, this);
    },
    addOne: function(friend) {
      var view = new FriendView({model: friend});
      $('.friends > .wrapper > ul').append(view.render().el);
    },
    addAll: function() {
      this.collection.each(this.addOne);
    }
  });
  var myFriends = new FriendList(); 
  var friendsView = new FriendsView({collection: myFriends});
  friendsView.render();
  myFriends.fetch();
});
