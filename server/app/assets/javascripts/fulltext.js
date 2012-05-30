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
      this.currentPage = 0;
    },
    parse: function(resp, xhr) {
      this.fulltext = resp;
      this.pages = resp.pages;
      window.fulltext = resp;
      return resp; 
    },
    // getter
    getWidth: function() { return this.pages[this.currentPage].pageWidth; },
    getHeight: function() { return this.pages[this.currentPage].pageHeight; },
    getNumPages: function() { return this.pages.length; },
    getCurrentPage: function() { return this.currentPage; },
    // setter
    setCurrentPage: function(pageNum) { 
      if (  pageNum >= 0 && 
            pageNum < this.getNumPages() &&
            this.currentPage != pageNum ) {
        this.trigger("changePage", pageNum, this.currentPage);
        this.currentPage = pageNum;
      }
    },
    // text selection
    selectWord: function(x, y) {
      var blocks  = this.pages[this.currentPage].blocks;
      var indexes = this._findWord(blocks, x, y);
      if(!indexes) return null;
      var line    = blocks[indexes.bi].lines[indexes.li];
      var word    = line.s[indexes.wi];
      var t       = line.t;
      var b       = line.b;
      var l       = line.q[2*indexes.wi];
      var r       = l + line.q[2*indexes.wi+1];
      this.trigger("selectWord", word, l, t, r, b);
    }, 
    selectArea: function(l, t, r, b) {
      //alert([l, t, r, b].join(', '));
      var blocks = this.pages[this.currentPage].blocks;
      // find where the start of selected area
      var startPos = this._findClosestAfter(blocks, l, t);
      // find where the end of selected area
      var endPos   = this._findClosestBefore(blocks, r, b);
      // extract everything in between
      var textRects = this._extractBetween(blocks, startPos, endPos);
      // construct text
      if(textRects) {
        console.debug(textRects.text);
        var rects = textRects.rects;
        l = rects[0].l; t = rects[0].t;
        r = rects[rects.length - 1].r; b = rects[rects.length - 1].b;
        this.trigger('selectArea', textRects.text, l, t, r, b, textRects.rects);
      }
      else
        this.trigger('selectArea', null, 0, 0, 0, 0, null);
    },
    _printPos: function(blocks, pos) {
      if(pos == null)
        console.debug('null');
      else
        console.debug(blocks[pos.bi].lines[pos.li].s[pos.wi]);
    },
    _findClosestAfter: function(blocks, left, top) {
      console.debug('left, top: ' + left + ', ' + top);
      var block;
      var line, lines;
      var l, r;
      var q
      for(var i = 0; i < blocks.length; ++i) {
        block = blocks[i];
        if ( left <= block.l && top <= block.t )
          return {"bi": i, "li": 0, "wi": 0};
        else if ( this._isPointInRect(left, top, block) ) {
          lines = block.lines;
          for(var j = 0; j < lines.length; ++j) {
            line = lines[j];
            if ( left <= line.l && top <= line.b )
              return {"bi":i, "li":j, "wi": 0};
            else if ( this._isPointInRect(left, top, line) ) {
              q = line.q;
              for(var k = 0; k < q.length/2; ++k) {
                l = q[2*k]; r = l + q[2*k+1];
                if ( left <= r )
                  return {"bi":i, "li":j, "wi":k}; 
              }
            }
          }
        }
        else if ( left <= block.l && block.t <= top && top <= block.b) {
          lines = block.lines;
          for(var j = 0; j < lines.length; ++j) {
            line = lines[j];
            if ( top <= line.b )
              return {"bi":i, "li":j, "wi": 0};
          }
        }
      }
      return null;//found nothing 
    },
    _findClosestBefore: function(blocks, right, bottom) {
      console.debug('right, bottom: ' + right + ', ' + bottom);
      var block;
      var line, lines;
      var l, r;
      var q;
      for(var i = blocks.length - 1; i >= 0; --i) {
        block = blocks[i];
        if ( right >= block.r && bottom >= block.b ) {
          l = block.lines.length - 1;
          line = block.lines[l];
          return {"bi": i, 
                  "li": l, 
                  "wi": line.s.length - 1};
        }
        else if ( this._isPointInRect(right, bottom, block) ) {
          lines = block.lines;
          for(var j = lines.length - 1; j >= 0; --j) {
            line = lines[j];
            if ( right >= line.r && bottom >= line.t ) {
              return {"bi":i, "li":j, "wi": line.s.length-1};
            }
            else if ( this._isPointInRect(right, bottom, line) ) {
              q = line.q;
              for(var k = q.length/2 -1; k >= 0; --k) {
                l = q[2*k]; r = l + q[2*k+1];
                if ( right >= l )
                  return {"bi":i, "li":j, "wi":k}; 
              }
            }
          }
        }
        else if ( right >= block.r && block.t <= bottom && bottom <= block.b ) {
          lines = block.lines;
          for(var j = lines.length - 1; j >= 0; --j) {
            line = lines[j];
            if ( line.t <= bottom ) 
              return {"bi":i, "li":j, "wi": line.s.length-1};
          }
        }
      }
      return null;//found nothing 
    },
    _extractBetween: function(blocks, startPos, endPos) {
      console.debug('startPos=' );
      this._printPos(blocks, startPos);
      console.debug('endPos=' );
      window.endPos = endPos;
      this._printPos(blocks, endPos);
      if(!startPos || !endPos) {
        console.debug('do nothing in extract_between')
        return null;
      }
      console.debug('actually do extract_between');
      var i1 = startPos.bi;
      var j1 = startPos.li;
      var k1 = startPos.wi;
      var i2 = endPos.bi;
      var j2 = endPos.li;
      var k2 = endPos.wi;

      var block, lines, line;
      var p, q, l, r;
      var kk1, kk2;
      
      var texts = new Array();
      var rects = new Array();
      for(var i = i1; i <= i2; ++i)
      {
          if (i != i1)
              texts.push("\n\n");
          block = blocks[i];
          lines = block.lines;
          for(var j = (i == i1? j1 : 0) ; 
              j < (i == i2? j2 + 1: lines.length); ++j)
          {
              if (j != (i ==i1? j1 : 0))
                  texts.push('\n');

              line = lines[j];i
              q = line.q;
              if (q.length < 2)
                  continue;
              kk1 = (i == i1 && j == j1? k1 : 0);
              kk2 = (i == i2 && j == j2? k2 : q.length / 2 - 1);
              l = q[2 * kk1];
              p = 2 * kk2;
              r = q[p] + q[p + 1];
              //textSelector.highlightArea({"l":l, "r":r, "t":line.t, "b":line.b});
              rects.push({l:l, r:r, t:line.t, b:line.b});
              for(var k = kk1; k <= kk2; ++k) {
                  if (k != kk1)
                      texts.push(' ');
                  texts.push(line.s[k]);
              }
          }
      }
      if(texts.length == 0)
        return null;
      return { text: null, rects: rects };
    },
    unselect: function() {
      this.trigger("unselect");
    },
    _findWord: function(blocks, x, y) {
        var block;
        var line, lines;
        var l, r;
        var q;
        for(var i = 0; i < blocks.length; ++i) {
            block = blocks[i];
            if ( this._isPointInRect(x, y, block) ) {
                lines = block.lines;
                for(var j = 0; j < lines.length; ++j) {
                    line = lines[j];
                    if ( this._isPointInRect(x, y, line) ) {
                        q = line.q;
                        for(var k = 0; k < q.length/2; ++k) {
                            l = q[2*k]; r = l + q[2*k+1];
                            if ( l <= x && x <= r ) {
                                // return the indexes of block, line and word
                                return {bi:i, li:j, wi:k}; 
                            }
                        }
                    }
                }
                return null;//found nothing
            }
        }
        return null;//found nothing 
    },
    _isPointInRect: function(x, y, rect) {
      return  rect.l <= x && x <= rect.r && 
              rect.t <= y && y <= rect.b;
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
    selectionTemplate: _.template($("#selection-highlight-template").html()),
    barTemplate: _.template($('#selection-bar-template').html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$highlightPane = this.$el.find('.highlight-pane');
      return this;
    },
    show: function() {
      this.$el.find('img').show();
    },
    hide: function() {
      this.$el.find('img').hide();
    },
    highlight: function(l, t, r, b) {
      // l, t, r,b is in px
      // but we need to measure them in em
      l /= 16; t /= 16; r /= 16; b /= 16;
      this.$highlightPane.append(this.barTemplate({l:l-0.25, t:t, w:0.25, h:b-t, barType: 'begin-bar'}));
      this.$highlightPane.append(this.selectionTemplate({l:l, t:t, w:r-l, h:b-t})); 
      this.$highlightPane.append(this.barTemplate({l:r, t:t, w:0.25, h:b-t, barType: 'end-bar'}));
    },
    highlight2: function(rects) {
      if(rects.length <= 0)
        return;
      var l ,t, r, b, rect;
      // draw first bar
      rect = rects[0];
      l = rect.l/16; t = rect.t/16; r = rect.r/16; b = rect.b/16;
      this.$highlightPane.append(this.barTemplate({l:l-0.25, t:t, w:0.25, h:b-t, barType: 'begin-bar'}));
      // draw rects
      for(var i = 0 ; i < rects.length ; ++i) {
        rect = rects[i];
        l = rect.l/16; t = rect.t/16; r = rect.r/16; b = rect.b/16;
        this.$highlightPane.append(this.selectionTemplate({l:l, t:t, w:r-l, h:b-t})); 
      }
      // draw second bar
      rect = rects[rects.length-1];
      l = rect.l/16; t = rect.t/16; r = rect.r/16; b = rect.b/16;
      this.$highlightPane.append(this.barTemplate({l:r, t:t, w:0.25, h:b-t, barType: 'end-bar'}));
    },
    reset: function() {
      this.$highlightPane.empty();
    }
  });
  //================================ Viewport =================================
  var Viewport = Backbone.View.extend({
    el: '.multi-image',
    initialize: function() {
      // this.docid & this.numPages
      this.docid = this.options.docid;
      this.numPages = this.options.numPages; 
      this.currentPage = 0;
      // init 
      this.updateDimensions();
      // event handlers
      this.initEventHandlers();
    },
    events: {
      'dblclick': 'selectWord',
      'click': 'unselect',
      'mousedown .selection-bar': 'startSelection',
      'mousemove': 'whileSelecting',
      'mouseup': 'endSelection'
    },
    render: function() {
      var that = this;
      // render pages
      var pages = new Array();
      for(var i = 0; i < this.numPages; ++i) {
        var pv = new PageView({model: new PageModel({ pageNum: i,
                                                      docid: this.docid})});
        this.$el.append(pv.render().el);
        pages[i] = pv;
      }
      that.pages = pages;
      // show default page
      if(this.numPages > 0)
        pages[0].show();
      // render viewport
      $('#hwrapper').width(816/16+'em');
      $('#hwrapper').height($(window).height()/16+'em');
      // use iScroll
      this.scroller = new iScroll('hwrapper',{
        fadeScrollbar:true,
        hideScrollbar:true,
        hScroll:false,
        lockDirection:true,
        vScrollbar: false,
        hScroll:false,
        force2D: true
      });
      return this;
    },
    updateDimensions: function() {
    },
    initEventHandlers: function() {
      var that = this;
      // change page
      reader.fulltext.on('changePage', function(newPageNum, oldPageNum) {
        that.currentPage = newPageNum;
        that.pages[oldPageNum].hide();
        that.pages[newPageNum].show();
        that.scroller._pos(0, 0);
      });
      // show selected word
      reader.fulltext.on('selectWord', function(word, l, t, r, b) {
        that.pages[that.currentPage].highlight(l, t, r, b);
        that.selectedArea = {l:l, t:t, r:r, b:b};
      });
      // show selected area
      reader.fulltext.on('selectArea', function(text, l, t, r, b, rects) {
        // if any text is selected
        if(rects) {
          // current 
          var p = that.pages[that.currentPage];
          // clear existing select area
          p.reset();
          // highlight newly selected text
          p.highlight2(rects);
          // update info about selected area
          that.selectedArea = {l:l, t:t, r:r, b:b};
        }
      });
      // hide selected word
      reader.fulltext.on('unselect', function() {
        that.pages[that.currentPage].reset();
        that.selectedArea = null;
      });
    },
    startSelection: function(e) {
      this.selecting = true;
      this.lastSelectionTime = 0;
      this.$bar = $(e.target).closest('.selection-bar');
      this.barType = this.$bar.data('type');
      this.scroller.disable();
    },
    endSelection: function() {
      if(this.selecting) {
        this.selecting = false;
        this.scroller.enable();
      }
    },
    whileSelecting: function(e) {
      // select text every 0.25 seconds
      if ( this.selecting ) { 
        var pos = this._get_pos(e);
        //alert([pos.x, pos.y].join(', '));
        if(this.barType == 'begin-bar'){
          reader.fulltext.selectArea(pos.x, pos.y,
                                     this.selectedArea.r, 
                                     this.selectedArea.b);
        }
        else if(this.barType == 'end-bar'){
          reader.fulltext.selectArea(this.selectedArea.l,
                                     this.selectedArea.t,
                                     pos.x, pos.y);
        }
      }
    },
    selectWord: function(e) {
      var pos = this._get_pos(e)
      reader.fulltext.selectWord(pos.x, pos.y);
    },
    unselect: function(e) {
      var pos = this._get_pos(e);
      console.debug('clicked ' + e.x + ', ' + e.y);
      reader.fulltext.unselect(e);
    },
    _get_pos: function(e) {
      var offset = this.$el.offset();
      var originX = offset.left;
      var originY = offset.top;
      return {
        x: e.clientX - originX,
        y: e.clientY - originY
      }
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
      // debug
      window.ft = this.fulltext;
      // fetch data
      this.fulltext.fetch({
        success: function() {
          that.render();
        },
        error: function() {
          alert('Network disconnected');
        }
      });
      // init event handlers
      this.initEventHandlers();
    }, 
    initEventHandlers: function() {
       
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
