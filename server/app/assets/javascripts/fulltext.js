$(function(){

// reader
// next, pre, go-to 
// zoom in & out
// text selection, highlight
// notes -> 
//========================== Fulltext Model ============================
  var FulltextModel = Backbone.Model.extend({
    urlRoot: function() {
      return "/uploads/" + this.docid + "/text.json"
    },
    initialize: function() {
      this.docid = this.get('docid');
      this.fulltext = null;
    },
    parse: function(resp, xhr) {
      this.fulltext = resp;
      this.pages = resp.pages;
      window.fulltext = resp;
      return resp; 
    },
    // getter
    getWidth: function(pageIndex) { return this.pages[pageIndex].pageWidth; },
    getHeight: function(pageIndex) { return this.pages[pageIndex].pageHeight; },
    getNumPages: function() { return this.pages.length; },
    // text selection
    selectWord: function() {
      return null;
    },
    selectArea: function() {
      return null;
    }
  });
  //============================= Page View & Model ===========================
  var PageModel = Backbone.Model.extend({
    initialize: function() {
      // update img src if pageNum or docid changed
      //this.on('change:pageNum change:docid', function() {
      //  this.updateImgSrc();
      //}, this);
      this.updateImgSrc();
    },
    updateImgSrc: function() {
      var pageNum = this.get('pageNum');
      var docid = this.get('docid');
      // init src url
      var src = ""; 
      if(pageNum + 1 < 10)
          src = "0"+(pageNum+1);
      else 
        src = pageNum + 1;
      src = "/uploads/" + docid + "/page-" + src + ".png";
      this.set({
        src: src
      });
    }
  });
  var PageView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($("#pageview-template").html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    switchPage: function() {
      return this.render();
    }
  });
  //================================ Viewport =================================
  var Viewport = Backbone.View.extend({
    el: '.multi-image',
    initialize: function() {
      // this.docid & this.numPages
      this.docid = this.options.docid;
      this.numPages = this.options.numPages; 
    },
    render: function() {
      var that = this;
      var pv = new PageView({model: new PageModel({ pageNum: 0, 
                                                    docid: this.docid})});
      this.$el.append(pv.render().el);
      // render viewport
      $('#hwrapper').width(816);
      $('#hwrapper').height($(window).height());
      var scroller = new iScroll('hwrapper',{
        fadeScrollbar:true,
        hideScrollbar:true,
        hScroll:false,
        lockDirection:true,
        vScrollbar: false,
        hScroll:false//,
      //  force2D: true
      });
    }
  });
  //================================ Reader ===================================
  var Reader = Backbone.View.extend({
    el: '#container',
    initialize: function() {
      var that = this;
      // init variables
      this.zoom = 1.0;
      this.currentPage = 0;
      this.numPages = 0;
      this.docid = this.options.docid;
      // fetch fulltext
      this.fulltext = new FulltextModel({docid: this.docid});
      this.fulltext.fetch({
        success: function() {
          that.render();
        },
        error: function() {
          alert('Network disconnected');
        }
      });
    },
    render: function() {
      this.viewport = new Viewport({
        docid: this.docid,
        numPages: this.fulltext.getNumPages()
      });  
      this.viewport.render();
      //this.$el.height($(window).height());
      return this;
    },
    pre: function() {
    },
    next: function() {
    }   
  }) ;
  var reader = new Reader({docid: DOCID});  // DOCID is intialized by rails controller
});
