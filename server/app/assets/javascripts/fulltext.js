//== require ZeroClipboard.js
$(function(){
// reader
// next, pre, go-to 
// zoom in & out
// text selection, highlight
  var HighlightView = Backbone.View.extend({
    tagName: 'div',
    template: _.template($("#highlight-forever-template").html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  var HighlightsView = Backbone.View.extend({
    events: {
    },
    initialize: function() {
      this.pageNum = this.options.pageNum;
      this.$container = this.options.$parent.find('.highlight-forever');
      this.collection.bind('add',    this.addOne, this);
      this.collection.bind('reset',  this.addAll, this);
    },
    render: function() {
      
    },
    addOne: function(highlight) {
      if(highlight.get('pagenum') != this.pageNum)
        return;
      var view = new HighlightView({model: highlight});
      this.$container.append(view.render().el);
    },
    addAll: function() {
      this.collection.each(this.addOne, this);      
    }
  });
// notes -> 
 var Note = Backbone.Model.extend({
    initialize: function() {
      var pageNum   = this.get('pagenum');
      var startPos  = this.get('posfrom')
      var endPos    = this.get('posto')
      var rects     = reader.fulltext.extractRects(pageNum, startPos, endPos);
      $.map(rects, function(rect) {
        rect.l /= 16; rect.r /= 16; rect.t /= 16; rect.b /= 16;
        rect.w = rect.r - rect.l; rect.h = rect.b - rect.t;
        return rect;
      });
      this.set('rects', rects);
      this.set('boundingBox', reader.viewport._decideBoundingBox(rects));
    }  
  });
  var NoteList = Backbone.Collection.extend({
    model: Note,
    comparator: function(note){
          return note.get("boundingBox").t;
    },
    url: function(){ return '/papers/'+PAPERID+"/notes";}
  })
  var NoteView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($("#note-template").html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.css({top:(this.model.get("boundingBox")).t*16});
      return this;
    }
  });
  var NotesView = Backbone.View.extend({
    tagName: 'ul',
    events: {
    },
    initialize: function() {
      this.pageNum = this.options.pageNum;
      this.last = 0;
      //this.$container = this.options.$parent.find('ul');
      this.collection.bind('add',    this.addOne, this);
      this.collection.bind('reset',  this.addAll, this);
    },
    addOne: function(note) {
      if(note.get('pagenum') != this.pageNum || note.get("content")==null)
        return;
      var view = new NoteView({model: note});
      this.$el.append(view.render().el);
      if(this.last == 0 )
          this.last = (view.$el)[0].offsetTop+(view.$el).height();
      else{
          if((view.$el)[0].offsetTop < this.last)
              view.$el.css("top",this.last+'px');
          this.last = (view.$el)[0].offsetTop+(view.$el).height();
      }
      //alert((view.$el)[0].offsetTop);
      this.$el.height(this.last);
     // alert("addOne");
    },
    addAll: function() {
      this.collection.each(this.addOne, this); 
      this.$el.height(this.last); 
    }
  });
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
    getWidth: function(pageNum) { 
      if(pageNum == undefined) 
        pageNum = this.currentPage;
      return this.pages[pageNum].pageWidth; 
    },
    getHeight: function(pageNum) { 
      if(pageNum == undefined) 
        pageNum = this.currentPage;
      return this.pages[pageNum].pageHeight; 
    },
    getNumPages: function() { return this.pages.length; },
    getCurrentPage: function() { return this.currentPage; },
    // setter
    setCurrentPage: function(pageNum) { 
      if (  pageNum >= 0 && 
            pageNum < this.getNumPages() &&
            this.currentPage != pageNum ) {
        $('#notes-'+this.currentPage).hide();
        this.trigger("changePage", pageNum, this.currentPage);
        this.currentPage = pageNum;
        $('#notes-'+this.currentPage).show();
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
      this.word = word;
      this.trigger("selectWord", word, l, t, r, b);
      this.startPos = this.endPos = indexes;
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
        this.startPos = startPos;
        this.endPos = endPos;
        console.debug("text:"+textRects.text);
        var rects = textRects.rects;
        l = rects[0].l; t = rects[0].t;
        r = rects[rects.length - 1].r; b = rects[rects.length - 1].b;
        this.word = textRects.text;
        this.trigger('selectArea', textRects.text, l, t, r, b, textRects.rects);
      }
      else
        this.trigger('selectArea', null, 0, 0, 0, 0, null);
    },
    extractRects: function(pageNum, startPos, endPos) {
      var blocks = this.pages[pageNum].blocks;
      startPos = this._convertStrPos(startPos);
      endPos = this._convertStrPos(endPos);
      window.startPos = startPos;
      window.endPos = endPos;
      var rects = this._extractBetween(blocks, startPos, endPos).rects;
      return rects;
    },
    _convertStrPos: function(strPos) {
      var pos = strPos.split(',');
      return { bi: parseInt(pos[0]), li: parseInt(pos[1]), wi: parseInt(pos[2]) };   
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
      return { text: texts.join(""), rects: rects };
    },
    unselect: function() {
     // if(this.selectArea!=null)
          this.trigger("unselect");
          this.word = "";
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
      if(pageNum + 1 < 10 && reader.fulltext.getNumPages() >= 10) 
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
      this.$el.children().show();
    },
    hide: function() {
      this.$el.children().hide();
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
      var unit = $(".line").width()/this.numPages;
      $(".pscroller").width(unit*(this.numPages*2-1));
      $(".progress").width(unit);
      for(var i = 0; i< this.numPages-1; i++)
            $('<strong class="transparent"></strong>').insertBefore(".progress");
      for(var i = 0; i< this.numPages-1; i++)
            $(".pscroller").append('<strong class="transparent"></strong>');
      $(".transparent").width(unit);
      this.currentPage = 0;
      // init 
      this.updateDimensions();
      // event handlers
      this.initEventHandlers();
      this.touch = false;
    },
    events: {
      'dblclick': 'selectWord',
     // 'doubleTap': 'selectWord',
      'longTap': 'ltp',
      'click .hl-btn': 'hl',
      'click .note-btn': 'showNote',
      'click': 'unselect',
      'mousedown .selection-bar': 'startSelection',
      'mousedown': 'enableScroller',
      'mousemove': 'whileSelecting',
      'mouseup': 'endSelection',
     // 'tap' : 'clearltp',
      'touchstart .selection-bar': 'touchsS',
      'touchmove' : 'touchws',
      'touchend' : 'touches'
    },
    enableScroller: function(e){
       if(!this.scroller.enabled && !this.selecting){
              e.preventDefault();
              this.scroller.enable();
       }
    },
    touchsS: function(e){
      this.touch = true;
      this.selecting = true;
      this.lastSelectionTime = 0;
      this.$bar = $(e.target).closest('.selection-bar');
      this.barType = this.$bar.data('type');
      this.scroller.disable();
      $(".float-bar").css({display:"none"});
      clip.hide();
      e.preventDefault();   
    },
    touchws: function(e){
       if ( this.selecting ) { 
        var pos = this._get_touchpos(e.touches[0]);
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
        e.preventDefault();
      }

    },
    touches: function(e){ 
      if(this.selecting) {
        this.selecting = false;
        this.scroller.enable();
        this.showFloatbar();
        this.touch = false;
      }
    },
    _get_touchpos: function(e){
        var offset = this.$el.offset();
        return {
          x : (e.pageX-offset.left)/reader.scale,
          y : (e.pageY-offset.top)/reader.scale
        };
    },
   /* clearltp: function(e){
     // alert(this.touch);
      this.touch = false;
    },*/
    ltp: function(e){
        //alert($(e.target).offset().top);
       // alert(e.data.x+","+e.data.y);
      // alert(2);
        this.unselect(e);
        var offset = $(e.target).closest(".multi-image").offset();
       // window.off = offset;
        var x = (e.data.x-offset.left)/reader.scale;
        var y = (e.data.y-offset.top)/reader.scale;
       // alert(x+','+y);
        reader.fulltext.selectWord(x,y);
        this.showFloatbar();
        this.touch = true;
    },
    render: function() {
      var that = this;
      // highlight
      var notes = new NoteList(); 
      that.notes = notes;      
      // render pages
      var pages = new Array();
      for(var i = 0; i < this.numPages; ++i) {
        var width   = reader.fulltext.getWidth(i)/16 + 'em';
        var height  = reader.fulltext.getHeight(i)/16 + 'em';
        var pv = new PageView({model: new PageModel({ pageNum: i,
                                                      docid: this.docid,
                                                      width: width,
                                                      height: height } )});
        this.$el.append(pv.render().el);
        var hlv = new HighlightsView({pageNum: i, $parent: pv.$el, collection: notes});
        var nv = new NotesView({pageNum: i, $parent: $(".note-pane"), collection: notes, id:"notes-"+i});
        $('.note-pane').append(nv.$el);
        pages[i] = pv;
      }
      that.pages = pages;
      // show default page
      if(this.numPages > 0)
        pages[0].show();
      // render viewport
      $('#hwrapper').width(reader.fulltext.getWidth()/16+'em');
      $('#container').height(($(window).height()-35)/16+'em');
       $("#wholewrapper").width(reader.fulltext.getWidth()*reader.scale+520);
      //$('#wholewrapper').width( $('#hwrapper').width+2* $('.note-pane').width+'px');
      //$('#hwrapper').css({'margin-left': $('.note-pane').width+'px'});
      //$('.note-pane ul').height(reader.fulltext.getHeight()/16+'em');
      // use iScroll
      this.scroller = new iScroll('container',{
        lockDirection:false,
        vScrollbar: false,
        hScrollbar: false,
        //hScroll:false,
        force2D: true,
        //overflowHidden: false,
        zoom: false,
        onScrollMove:function(){
            var sa = that.boundingBox;
            if(sa!=null)
                clip.repos2(((sa.l+sa.r)/2-54)*reader.scale+$(".multi-image").offset(),(sa.t-50)*reader.scale+that.scroller.y);
        
        },
        onScrollEnd: function(){
            var sa = that.boundingBox;
            if(sa!=null)
                clip.repos2(((sa.l+sa.r)/2-54)*reader.scale+$(".multi-image").offset(),(sa.t-50)*reader.scale+that.scroller.y);
        }
      });
      var deltaX = $("#wholewrapper").width()/2 - $("#container").width()/2;
      if(deltaX >0)
          this.scroller.scrollTo(-deltaX, 0, 0);
      //
      this.progressbar = new iScroll('line',{
          snap: 'strong',
          lockDirection:false,
          vScroll: false,
          hScrollbar: false,
          overflowHidden: false,
          bounce:false,
          x: -$(".line").width()/this.numPages*(this.numPages-1),
          onTouchEnd: function(){
               //alert(this.currPageX);
               reader.fulltext.setCurrentPage(that.numPages-this.currPageX-1);
                reader.zoom(reader.scale);
                reader.viewport.scroller.enable();
          }
      });
      this.progressbar.currPageX = this.numPages-1;
      notes.fetch({
        success: function(){
              for(var i = 1; i<  that.numPages; i++){
                  $('#notes-'+i).hide();
                  //$("#highlights-"+i).hide();
              }
              $("#wholewrapper").height(Math.max(reader.fulltext.getHeight()*reader.scale,$("#notes-"+reader.fulltext.getCurrentPage()).height()));
              that.scroller.refresh();
        }
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
        that.pages[oldPageNum].reset();
        that.pages[newPageNum].show();
        that.scroller._pos(0, 0);
      });
      // show selected word
      reader.fulltext.on('selectWord', function(word, l, t, r, b) {
        that.pages[that.currentPage].highlight(l, t, r, b);
        that.selectedArea = {l:l, t:t, r:r, b:b};
        that.boundingBox = {l:l, t:t, r:r, b:b};
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
window.rects = rects;
          that.boundingBox = that._decideBoundingBox(rects);
        }
      });
      // hide selected word
      reader.fulltext.on('unselect', function() {
        that.pages[that.currentPage].reset();
        that.selectedArea = null;
        that.boundingBox = null;
      });
    },
    _decideBoundingBox: function(rects) {
      var l = 10000, r = -10000, t = 100000, b = -100000;
      $.each(rects, function(i) {
        var rect = rects[i];
        if(l > rect.l) l = rect.l;
        if(r < rect.r) r = rect.r;
        if(t > rect.t) t = rect.t;
        if(b < rect.b) b = rect.b;
      });
      if(l > r) { var tmp = l; l = r; r = tmp;}
      if(t > b) { var tmp = t; t = b; b = tmp;}
      return {l:l, r:r, t:t, b:b};
    },
    startSelection: function(e) {
      this.selecting = true;
      this.lastSelectionTime = 0;
      this.$bar = $(e.target).closest('.selection-bar');
      this.barType = this.$bar.data('type');
      this.scroller.disable();
      $(".float-bar").css({display:"none"});
      clip.hide();
    },
    endSelection: function(e) {
      if(this.selecting) {
        this.selecting = false;
        this.scroller.enable();
        this.showFloatbar();
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
    showFloatbar: function(e){        
      var sa = this.boundingBox;
window.bb = this.boundingBox;
      $(".float-bar").css({display:"block",top:(sa.t-50)*reader.scale+'px', left:((sa.l+sa.r)/2-54)*reader.scale});
      clip.myshow(((sa.l+sa.r)/2-54)*reader.scale+$(".multi-image").offset().left,(sa.t-50)*reader.scale+this.scroller.y);
    },
    selectWord: function(e) {
      var pos = this._get_pos(e)
      reader.fulltext.selectWord(pos.x, pos.y);
      this.showFloatbar();
    },
    unselect: function(e) {
      var pos = this._get_pos(e);
      console.debug('clicked ' + e.x + ', ' + e.y); 
      if(this.touch==false&&$(e.target).attr('class')=="fbtn note-btn"){
          return;
      }
      else{
          $(".note-bar").css({display:"none"});
          $("#wholewrapper").height(Math.max(reader.fulltext.getHeight()*reader.scale,$("#notes-"+reader.fulltext.getCurrentPage()).height()));
          this.scroller.refresh();
      }
      if(this.touch == false){ 
          $(".float-bar").css({display:"none"});
          clip.hide();
          reader.fulltext.unselect(e);
      }
      this.touch = false;      
      this.scroller.enable();
    },
    _get_pos: function(e) {
      var offset = this.$el.offset();
      var originX = offset.left;
      var originY = offset.top;
      return {
        x: (e.clientX - originX)/reader.scale,
        y: (e.clientY - originY)/reader.scale
      }
    },
    hl: function() {
      var ft = reader.fulltext;
      var pagenum = ft.getCurrentPage();
      var posfrom = [ft.startPos.bi,  ft.startPos.li, ft.startPos.wi].join(',');
      var posto   = [ft.endPos.bi,    ft.endPos.li,   ft.endPos.wi].join(',');
      console.debug('highlight==' + [pagenum, posfrom, posto].join(';'));
      this.notes.create({
        paper_id: PAPERID,
        pagenum: pagenum, 
        posfrom:  window.ft.startPos["bi"]+','+window.ft.startPos["li"]+','+window.ft.startPos["wi"],
        posto:    window.ft.endPos["bi"]+','+window.ft.endPos["li"]+','+window.ft.endPos["wi"]
      });
      ft.unselect();
    },
    showNote: function() {
     var sa = this.boundingBox;
      window.bb = this.boundingBox;
      $("#notes-"+this.currentPage).append($(".note-bar").remove());
      $(".note-bar").css({display:"block",top:sa.t+'px'});
      $("#wholewrapper").height(Math.max($("#wholewrapper").height(), parseInt($(".note-bar").css("top").replace('px',''))+$(".note-bar").height()));
      this.scroller.refresh();
      $(".text").focus();
    }
  });
  //================================ Reader ===================================
  var Reader = Backbone.View.extend({
    el: '#container',
    initialize: function() {
      var that = this;
      // init variables
      this.docid = this.options.docid;
      // fetch fulltext
      this.fulltext = new FulltextModel({docid: this.docid});
      this.scale = 1.0;
      this.minZoom = 0.8;
      this.maxZoom = 2.0;
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
    events: {
      'click .arrow1': 'pre',
      'click .arrow2': 'next',
      'click .zoom1' : 'zoomOut',
      'click .zoom2' : 'zoomIn',
      'click .cancel-btn': 'hideNote',
      'click .conf-btn': 'addNote',
      'mousedown': 'ctrScroll',
      'mouseup': 'ctrScroll'
    },
    initEventHandlers: function() {
       
    },
    ctrScroll: function(e){
      if($(e.target).attr('class')=="nbtn text"||$(e.target).attr('class')=="nbtn cancel-btn"||$(e.target).attr('class')=="nbtn conf-btn"){
          this.viewport.scroller.disable();
      }
      else{
          if(!this.viewport.scroller.enabled){
              e.preventDefault();
              this.viewport.scroller.enable();
          }
      }
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
      var pageNum = this.fulltext.getCurrentPage();
      this.fulltext.setCurrentPage(pageNum-1);
      this.viewport.progressbar.scrollToPage('next',0,0);
      this.zoom(this.scale);
      this.viewport.scroller.enable();
    },
    next: function() {
      var pageNum = this.fulltext.getCurrentPage();
      this.fulltext.setCurrentPage(pageNum+1);
      this.viewport.progressbar.scrollToPage('prev',0,0);
      this.zoom(this.scale);
      this.viewport.scroller.enable();
    },
    zoom : function(scale){
        $(".note-bar").css({display:"none"});
        $(".float-bar").css({display:"none"});
        clip.hide();
        ft.unselect();
       var img = this.viewport.pages[this.fulltext.getCurrentPage()].$el.find("img");
       if(scale-this.maxZoom <= 0.00000001 && scale - this.minZoom >= -0.00000001){
          img.width(this.fulltext.getWidth()*this.scale);
          img.height(this.fulltext.getHeight()*this.scale);
          $("#hwrapper").css("font-size",100*this.scale+'%');
          $("#hwrapper").width(this.fulltext.getWidth()*this.scale);
          $("#wholewrapper").height(Math.max(this.fulltext.getHeight()*this.scale,$("#notes-"+this.fulltext.getCurrentPage()).height())); 
          this.adjNote();
          $("#wholewrapper").width(this.fulltext.getWidth()*this.scale+520);
          this.viewport.scroller.refresh();
          var deltaX = $("#wholewrapper").width()/2 - $("#container").width()/2;
          if(deltaX >0)
              this.viewport.scroller.scrollTo(-deltaX, 0, 0);
       }
    },
    zoomOut: function() {
      $(".note-bar").css({display:"none"});
      $(".float-bar").css({display:"none"});
      clip.hide();
      ft.unselect();
      var img = this.viewport.pages[this.fulltext.getCurrentPage()].$el.find("img");
      if(this.scale<this.maxZoom && this.scale - this.minZoom >= -0.00000001){
          this.scale += 0.1;
          img.width(this.fulltext.getWidth()*this.scale);
          img.height(this.fulltext.getHeight()*this.scale);
          $("#hwrapper").css("font-size",100*this.scale+'%');
          $("#hwrapper").width(this.fulltext.getWidth()*this.scale);
          $("#wholewrapper").height(Math.max(this.fulltext.getHeight()*this.scale,$("#notes-"+this.fulltext.getCurrentPage()).height())); 
          this.adjNote();
          $("#wholewrapper").width(this.fulltext.getWidth()*this.scale+520);
          this.viewport.scroller.refresh();
          var deltaX = $("#wholewrapper").width()/2 - $("#container").width()/2;
          if(deltaX >0)
              this.viewport.scroller.scrollTo(-deltaX, 0, 0);
      }
    },
    zoomIn: function() {
      $(".note-bar").css({display:"none"});
      $(".float-bar").css({display:"none"});
      clip.hide();
      ft.unselect();
      var img = this.viewport.pages[this.fulltext.getCurrentPage()].$el.find("img");
      if(this.scale-this.maxZoom <= 0.00000001 && this.scale > this.minZoom){
            this.scale -= 0.1;
            img.width(this.fulltext.getWidth()*this.scale);
            img.height(this.fulltext.getHeight()*this.scale);
            $("#hwrapper").css("font-size",100*this.scale+'%');
            $("#hwrapper").width(this.fulltext.getWidth()*this.scale);
            //alert(this.fulltext.getHeight()*this.scale+','+$("#note-"+this.fulltext.getCurrentPage()).height())
             $("#wholewrapper").height(Math.max(this.fulltext.getHeight()*this.scale,$("#notes-"+this.fulltext.getCurrentPage()).height())); 
          this.adjNote();
          $("#wholewrapper").width(this.fulltext.getWidth()*this.scale+520);
            this.viewport.scroller.refresh();
            var deltaX = $("#wholewrapper").width()/2 - $("#container").width()/2;
            if(deltaX >0)
              this.viewport.scroller.scrollTo(-deltaX, 0, 0);
      }
    },
    adjNote: function() {
              var last = 0;
              var div = $("#notes-" + this.fulltext.getCurrentPage() + " > li").toArray().sort(function(a,b){
                      return parseFloat($(a).children().data("t")) - parseFloat($(b).children().data("t"))
              });
              $(div).appendTo("#notes-"+this.fulltext.getCurrentPage());
              $("#notes-" + this.fulltext.getCurrentPage() + " > li").each(function(index) {  
                  var child = $(this).children();
                  $(this).css("top", child.data("t")*reader.scale);
                  if(last == 0){
                      last = parseFloat($(this).css("top").replace("px", ""))+$(this).height();
                  }
                  else{
                      if(child.data("t")*reader.scale< last)
                          $(this).css("top", last);
                      last =  parseFloat($(this).css("top").replace("px", ""))+$(this).height();
                  }
              });
              $("#notes-" + this.fulltext.getCurrentPage()).height(last);
    },
    hideNote: function() {
      $(".note-bar").css({display:"none"});
      $("#wholewrapper").height(Math.max(this.fulltext.getHeight()*this.scale,$("#notes-"+this.fulltext.getCurrentPage()).height()));
      this.viewport.scroller.refresh();
    },
    addNote:function() {
      //alert($(".text").val());
      var ft = this.fulltext;
      if($(".text").val().trim()!=""){
          var pagenum = ft.getCurrentPage();
          var posfrom = [ft.startPos.bi,  ft.startPos.li, ft.startPos.wi].join(',');
          var posto   = [ft.endPos.bi,    ft.endPos.li,   ft.endPos.wi].join(',');
          console.debug('Note==' + [pagenum, posfrom, posto].join(';'));
          this.viewport.notes.create({
            paper_id: PAPERID,
            content: $(".text").val(),
            pagenum: pagenum, 
            posfrom:  ft.startPos["bi"]+','+ft.startPos["li"]+','+ft.startPos["wi"],
            posto: ft.endPos["bi"]+','+ft.endPos["li"]+','+ft.endPos["wi"]
          });
      }
      $(".note-bar").css({display:"none"});
      $(".float-bar").css({display:"none"});
      clip.hide();
      ft.unselect();
      $(".text").val("");
      this.adjNote(); 
      $("#wholewrapper").height(Math.max(this.fulltext.getHeight()*this.scale,$("#notes-"+this.fulltext.getCurrentPage()).height()));
      this.viewport.scroller.refresh(); 
    
    }
  }) ;
  $(".note-pane").bind('mousedown',function(e){
      if(!reader.viewport.scroller.enabled){
            e.preventDefault();
            reader.viewport.scroller.enable();
      }
  });
  var reader = new Reader({docid: DOCID});  // DOCID is intialized by rails controller
  // debug
  window.reader = reader;

  ZeroClipboard.setMoviePath("/assets/ZeroClipboard10.swf");
  var clip = new ZeroClipboard.Client(); 
  clip.setText( '' ); // will be set later on mouseDown
  clip.setHandCursor( true );
  clip.setCSSEffects( true );
  clip.glue("copy");
  clip.addEventListener( 'onMouseUp', function(client) { 
      clip.setText(reader.fulltext.word);
      $(".float-bar").css({display:"none"});
      reader.fulltext.unselect();
      clip.hide();
      $("embed").blur();
  } );
  
  $(".float-bar").hide();
  var width = document.documentElement.clientWidth;
  var height = document.documentElement.clientHeight;
  $(window).resize(function(){
      $("#container").height(document.documentElement.clientHeight-$(".bottom-toolbar").height());
      reader.viewport.scroller.refresh();
      var deltaX = $("#wholewrapper").width()/2 - $("#container").width()/2;
      if(deltaX >0){
              reader.viewport.scroller.scrollTo(reader.viewport.scroller.x+(document.documentElement.clientWidth-width)/2,reader.viewport.scroller.y, 0);
      }
      width = document.documentElement.clientWidth;
      height = document.documentElement.clientHeight;
  });
});
