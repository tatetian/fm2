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
  function addFmClick(view, selector, callback) {
    view.events = view.events || {};
    var x, y;
    view.events['mousedown ' + selector] = function(e) {
      x = e.screenX;
      y = e.screenY;
    };
    view.events['mouseup ' + selector] = function(e) {
      if (x == e.screenX && y == e.screenY)
        callback.call(this, e);
    };
  }
//================================== Tag's model ==============================
  var Tag = Backbone.Model.extend({
    defaults: function() {
      return {
        name: "新建文件夹",
        id: "fake-id-1"
      };
    }
  });
  // debug
  window.Tag = Tag;
  var TagList = Backbone.Collection.extend({
    model: Tag,
    url: '/tags'
  });
//=============================== Metadata's model ============================
  var Metadata = Backbone.Model.extend({
    defaults: function() {
      return {
        docid: 'null',
        progress: -1,
        color: 'grey'
      };
    },
    setStar: function(starred) {
      if(starred)
        this.attachTag('__starred');
      else
        this.detachTag('__starred');
    },
    attachTag: function(tagName) {
      var tags  = this.get('tags').splice(0),
          pos   = tags.indexOf(tagName);
      // Push new tag if not exists
      if (pos < 0) tags.push(tagName); 
      // Update model
      this.set('tags', tags);
      // Ajax
      this._syncTag('POST', tagName, this.get('id'));
    },
    detachTag: function(tagName) {
      var tags  = this.get('tags').splice(0),
          pos   = tags.indexOf(tagName);
      // Delete the tag if exists
      if(pos >= 0) tags.splice(pos, 1);
      // Update model
      this.set('tags', tags);
      // Ajax
      this._syncTag('DELETE', tagName, this.get('id'));
    },
    _syncTag: function(method, tagName, metadata_id) { 
      var params = {
        url: '/metadata/' + metadata_id + '/tags/' + 
            ( method=='DELETE' ? tagName : ''),
        type: method,
        contentType: 'application/json',
        data: JSON.stringify({
          name: tagName,
          metadata_id: metadata_id
        }),
        dataType: 'json',
        processData: false
      },  options = {};
      $.ajax(_.extend(params, options));
    },
    setColor: function(color) {
      console.debug(this.get('tags').join());
      var tags  = this.get('tags').splice(0), // clone the array
          pos   = this._getColorTagPos(tags),
          colorTag  = '__color_' + color;
      // Switch color
      if(pos < 0) {
        // Add color tag
        tags.push(colorTag);
        // Sync with server
        this._syncTag('POST', colorTag, this.get('id'));
      }
      else {
        // Sync with server
        this._syncTag('POST', colorTag, this.get('id'));
        this._syncTag('DELETE', tags[pos], this.get('id'));
        // Replace old color in model
        tags[pos] = colorTag;
      }
      console.debug('setColor(' + color + ')');
      window.metadata = this;
      // Update model
      this.set('tags', tags);
    },
    getColor: function() {
      var tags  = this.get('tags'),
          pos   = this._getColorTagPos(tags),
          colorTagName = pos >= 0 ? tags[pos] : null, 
          prefix = '__color_',
          color = !!colorTagName ? colorTagName.substring(prefix.length) :
                                  'grey';
      console.debug('getColor() == ' + color );
      return color;
    },
    _getColorTagPos: function(tags) {
      var prefix  = '__color_',
          pos     = -1;
      _.find(tags, function(tagName, index) {
        console.debug('tag:'+tagName+';index='+index);
        if(tagName.indexOf(prefix) == 0) {
          pos = index;
          console.debug('return true');
          return true;
        }
        console.debug('return false');
        return false;
      }) ;
      console.debug('__getColorTagPos() == ' + pos);
      return pos;
    },
    // Custom sync function that handles tags update differently
    sync: function(method, model, options) {
      Backbone.sync.call(this, method, model, options);
    }
  });
  var MetadataList = Backbone.Collection.extend({
    model: Metadata,
    url: '/metadata'
  });
//=============================== Title's View ================================ 
  var TitleView = Backbone.View.extend({
    tagName: 'li',
    initialize: function() {
      addFmClick(this, 'a.ml20',  this.viewPaper);
      addFmClick(this, '.star',   this.clickStar);
      addFmClick(this, '.tag-color',  this.clickColor);

      this.model.on('change', this.render, this);
    },
    events: {
    // 'longTap .title': 'viewPaper'
    },
    template: _.template($('#title-template').html()),
    render: function() {
      console.debug('title render');
      // Clear element
      this.$el.empty(); 
      // Get model
      var json = this.model.toJSON();
      if(json.tags.indexOf('__starred') < 0)
        json.yellow_or_white = 'white';
      else
        json.yellow_or_white = 'yellow';
      json.color = this.model.getColor();
      // New element
      this.$el.append(this.template(json));
      return this;
    },
    viewPaper: function() {
  //    alert('viewPaper: this is ' + this);
      window.open('/fulltext/' + this.model.get('docid'), '_newtab');
    },
    clickStar: function(e) {
      var $t      = $(e.target),
          starred = $t.hasClass('star-yellow')  ? true  : 
                    $t.hasClass('star-white')   ? false : null,
          metadata_id = $t.parent().data('id'),
          metadata  = manager.metadataList.get(metadata_id);
      metadata.setStar(!starred);
    },
    clickColor: function(e) {
      var $t      = $(e.target),
          color   = $t.data('color'),
          nextColor   = this.nextColor(color),
          metadata_id = $t.parent().data('id'),
          metadata  = manager.metadataList.get(metadata_id);
      console.debug('clickColor');
      metadata.setColor(nextColor);
    },
    nextColor: function(color) {
      return color == 'grey'  ? 'green' :
             color == 'green' ? 'blue'  :
             color == 'blue'  ? 'red'   :   'grey';
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
      'dblclick .recent-box > div': 'beforeRenameFolder',
      'blur .recent-box > div': 'afterRenameFolder'
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
    beforeRenameFolder: function(e) {
//      e.target.contentEditable = true;  
      console.debug('before');
      var $folderTitle  = $(e.target),
          $folder       = $folderTitle.parent();
      $folder.attr('contenteditable', 'true');
      $folderTitle.addClass('undraggable');
      $folderTitle.focus();
    },
    afterRenameFolder: function(e) {
      console.debug('after');
      var $folderTitle  = $(e.target),
          $folder       = $folderTitle.parent();
      $folder.removeAttr('contentEditable');
//      t.className = 'undraggable';
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
        overflowHidden: false,
        onBeforeScrollStart: function(e) {
          // prevent default behavriou like text selection, image dragging
          e.preventDefault();
          // not stop scroll handler
          return false;
        }
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
      this.collection.bind('add', this.addFolder, this);
      this.collection.bind('reset', this.resetFolders, this);
      this.items = new Array();
      $(window).resize(function() { that.resize(); });

      addFmClick(this, '.add-tag > a',  this.newFolder);
    },
    newFolder: function() {
      var newFolderModel = new Tag();
      this.collection.add(newFolderModel, {beforeLast: true});
      this.resize();
    },
    addFolder: function(model, that, options) {
      // Some tags are not intended to be used as folders
      // The name of invisible tags are prefixed with '__' 
      // e.g. __starred
      if (model.get('name').indexOf('__') == 0)
        return;
      // Add a new folder given its model
      var folder = new FolderView({
        model:      model,
        collection: this.metadataList,
      });
      // render & insert new folder before '+'
      folder.render().$el.insertBefore(this.$el.find('.add-folder'));
      folder.uploader.init();
      // add / new
      if(options.beforeLast && this.items.length > 0) {
        var last = this.items[this.items.length-1];
        this.items[this.items.length-1] = folder;
        this.items.push(last);
      }
      else {
        this.items.push(folder);
      }
    },
    resetFolders: function() {
      this.items.length = 0;  // empty the array
      this.collection.each(this.addFolder, this);
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
      if(manager.scroller)  {
        manager.scroller.refresh();
        this.updateOpacity(manager.scroller.x);
      }
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
        url : '/metadata?tag='+folder.getName(),
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
      uploader.bind('FileUploaded', function(up, file, result) {
        var response = JSON.parse(result.response),
            metadata = manager.metadataList.get(file.id);
        window.response =response;
        metadata.set('progress', -1 );
        metadata.set('id', response.id);
        metadata.set('docid', response.docid);
        metadata.set('title', response.title);
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
      // debug
      window.metadataList = this.metadataList;
      // init sub views
      this.folders = new FoldersView({
        collection: this.tagList, 
        metadataList: this.metadataList
      });
      // fetch 
      this.tagList.fetch({
        success: function() {
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
            }
          });
        }
      });
      // Search bar
      $('.my-search input[type=search]').on('search', function(e) {
        var keywords = e.target.value;
        that.metadataList.url = '/metadata?keywords=' + keywords;
        that.metadataList.fetch();
      });
    },
    render: function() {
    }
  });
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
//==============================MyInfoView====================================
  var MyInfoView = Backbone.View.extend({
    el: ".my-info",
    initialize: function() {
      this.friends  = this.options.friends;
      this.papers   = this.options.papers;

      this.friends.on('reset',  this.render,  this);
      this.papers .on('reset',  this.render,  this)
                  .on('add',    this.render,  this)
                  .on('remove', this.render,  this);
    },
    template: _.template($('#my-info-template').html()),
    render: function() {
      var json = {
        friendsNum: this.friends.size(),
        papersNum:  this.papers.size()
      };
      this.$el.html(this.template(json));
    }
  });
//=============================================================================
  var manager = new Manager();

  var myFriends = new FriendList(); 
  var friendsView = new FriendsView({collection: myFriends});
  var myinfoView = new MyInfoView({
    friends: myFriends, 
    papers: manager.metadataList
  });

  friendsView.render();
  myinfoView.render();
  myFriends.fetch();
});
