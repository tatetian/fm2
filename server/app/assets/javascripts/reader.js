/**
 * Entry point
 * */
var docid = null;
$(document).ready(function() {
    docid = $(".docid")[0].dataset["docid"];
    $("#preloader").hide();
    $.getJSON("/uploads/"+docid+"/text.json", function(data) {
        reader.init(data);
    }); 
});
/**
 * Topbar
 **/
var topbar = {
    numPages: null,
    currentPage: null,
    onCellClick: null,
    isHover: false,
    hoverTimer: null,
    unhoverTimer: null,
    init: function(options) {
        $.extend(topbar, options);

        var l = options.numPages;
        var $tr = $("#page-selector tr");
        var cellClickEventHandler = function(){
            var pageId = $(this).attr("pageId");
            if(topbar.onCellClick)
                topbar.onCellClick(pageId);
        };
        for (var i = 2; i <= l; ++i) {//the first td is special, it is already there
            var $td = $("<td pageId="+i+">"+i+"</td>");
            $td.appendTo($tr);
            $td.click(cellClickEventHandler);
        }
        var $firstTd = $tr.find("td:first-child");
        $firstTd.click(cellClickEventHandler);

        $("#page-anchor").width(($(window).width()+1)/l-2);

        $(window).resize(topbar.resize);
    },
    nextPage: function() {
        ++ topbar.currentPage;
        var offset = topbar.calPageAnchorOffset();
        $("#page-anchor").stop().animate({"left": offset});
    },
    prePage: function() {
        -- topbar.currentPage;
        var offset = topbar.calPageAnchorOffset();
        $("#page-anchor").stop().animate({"left": offset});
    },
    goToPage: function(page) {
        topbar.currentPage = page;
        $("#page-anchor").css("left", topbar.calPageAnchorOffset());
    },
    resize: function(e) {
        var l = topbar.numPages;
        $("#page-anchor").width(($(window).width()+1)/l-2);
        $("#page-anchor").css("left", topbar.calPageAnchorOffset());
    },
    calPageAnchorOffset: function() {
        return (topbar.currentPage - 1) * ($(window).width() + 1) / topbar.numPages;
    }
};
/**
 * Text Selector
 * */
var textSelector = {
    /*selectingBox: undefined,
    selectedArea: undefined,
    selectingEventCount: 0,
	selectingPrecision: 6,	// text selection precision
    selectedText: undefined,
    lastSelectionTime: new Date().getTime(),*/
    durable: false,
    selectedText: null,
    lastSelection: null,
    init: function(conf) {
        $.extend(textSelector, conf);
    },
    selectWord: function(blocks, x, y) {
        var position = textSelector.findWord(blocks, x, y);
        if (!position)
            return;

        var i = position.blockIndex, j = position.lineIndex, k = position.wordIndex;
        var block = blocks[i];
        var line = block.lines[j];
        var q = line.q;
        var l = q[2*k], r = l + q[2*k+1];

        textSelector.highlightArea({"l":l, "r":r, "t":line.t, "b":line.b});
        textSelector.selectedText = line.s[k]; 
    },
    findWord: function(blocks, x, y) {
        var block;
        var line, lines;
        var l, r;
        var q;
        for(var i = 0; i < blocks.length; ++i) {
            block = blocks[i];
            if ( textSelector.isPointInRect(x, y, block) ) {
                lines = block.lines;
                for(var j = 0; j < lines.length; ++j) {
                    line = lines[j];
                    if ( textSelector.isPointInRect(x, y, line) ) {
                        q = line.q;
                        for(var k = 0; k < q.length/2; ++k) {
                            l = q[2*k]; r = l + q[2*k+1];
                            if ( l <= x && x <= r ) {
                                return {"blockIndex":i, "lineIndex":j, "wordIndex":k}; 
                            }
                        }
                    }
                }
                return null;//found nothing
            }
        }
        return null;//found nothing 
    },
    isPointInRect: function (x, y, rect) {
        return rect.l <= x && x <= rect.r && 
            rect.t < y && y <= rect.b;
    },
    highlightArea: function(block) {
        var f = reader.zoomFactor;
        $(!reader.ctrlPressed?
            '<div class="selected-area temp-area"></div>':
            '<div class="highlight-area'+(textSelector.durable?'':' temp-area')+'"></div>')
            .css('left', block.l * f )
            .css('top', block.t * f )
            .width((block.r - block.l)*f)
            .height((block.b - block.t)*f)
            .appendTo('#viewport ul li:nth-child('+reader.currentPage+')');
    },
    confirmSelection: function() {
        if (!textSelector.lastSelection)
            return;
        textSelector.durable = true;
        textSelector.selectText(
                  textSelector.lastSelection.b, 
                  textSelector.lastSelection.x1, 
                  textSelector.lastSelection.y1,
                  textSelector.lastSelection.x2,
                  textSelector.lastSelection.y2,
                  textSelector.lastSelection.op); 
        textSelector.durable = false;
        textSelector.lastSelection = null;
    },
    localPos: function($container, pageX, pageY) {
        var originPageX = $container.offset().left ;
        var originPageY = $container.offset().top ;
        return {x: pageX - originPageX, y: pageY - originPageY} ;
    },
    selectText: function(blocks, startX, startY, endX, endY, operationOnSelectedText) {
        textSelector.lastSelection = {
            "b": blocks, "x1": startX, "y1": startY, "x2": endX, "y2": endY, "op": operationOnSelectedText
        } ;

        $('.temp-area').remove();
        var f = reader.zoomFactor;
        // tranform the coordinates according to zoomFactor
        var left = ( ( startX < endX ? startX : endX )  )/  f ;
        var top = ( ( startY < endY ? startY : endY ) ) / f ;
        var right = ( ( startX > endX ? startX : endX ) ) / f ;
        var bottom = ( ( startY > endY ? startY : endY ) )/ f ;

        startPosition = textSelector.findWordRightAfter(blocks, left, top);
        endPosition = textSelector.findWordRightBefore(blocks, right, bottom);

        if (startPosition == null || endPosition == null)
            return;

        textSelector.highlightAndCopy(blocks, startPosition, endPosition);
    },
    findWordRightAfter: function(blocks, left, top)
    {
        var block;
        var line, lines;
        var l, r;
        var q;
        for(var i = 0; i < blocks.length; ++i) {
            block = blocks[i];
            if ( left <= block.l && top <= block.t )
                return {"blockIndex": i, "lineIndex": 0, "wordIndex": 0};
            else if ( textSelector.isPointInRect(left, top, block) ) {
                lines = block.lines;
                for(var j = 0; j < lines.length; ++j) {
                    line = lines[j];
                    if ( left <= line.l && top <= line.b )
                        return {"blockIndex":i, "lineIndex":j, "wordIndex": 0};
                    else if ( textSelector.isPointInRect(left, top, line) ) {
                        q = line.q;
                        for(var k = 0; k < q.length/2; ++k) {
                            l = q[2*k]; r = l + q[2*k+1];
                            if ( left <= r )
                                return {"blockIndex":i, "lineIndex":j, "wordIndex":k}; 
                        }
                    }
                }
            }
            else if ( left <= block.l && block.t <= top && top <= block.b) {
                lines = block.lines;
                for(var j = 0; j < lines.length; ++j) {
                    line = lines[j];
                    if ( top <= line.b )
                        return {"blockIndex":i, "lineIndex":j, "wordIndex": 0};
                }
            }
        }
        return null;//found nothing 
    },
    findWordRightBefore: function(blocks, right, bottom)
    {
        var block;
        var line, lines;
        var l, r;
        var q;
        for(var i = blocks.length - 1; i >= 0; --i) {
            block = blocks[i];
            if ( right >= block.r && bottom >= block.b ) {
                l = block.lines.length - 1;
                line = block.lines[l];
                return {"blockIndex": i, 
                        "lineIndex": l, 
                        "wordIndex": line.s.length - 1};
            }
            else if ( textSelector.isPointInRect(right, bottom, block) ) {
                lines = block.lines;
                for(var j = lines.length - 1; j >= 0; --j) {
                    line = lines[j];
                    if ( right >= line.r && bottom >= line.t ) {
                        return {"blockIndex":i, "lineIndex":j, "wordIndex": line.s.length-1};
                    }
                    else if ( textSelector.isPointInRect(right, bottom, line) ) {
                        q = line.q;
                        for(var k = q.length/2 -1; k >= 0; --k) {
                            l = q[2*k]; r = l + q[2*k+1];
                            if ( right >= l )
                                return {"blockIndex":i, "lineIndex":j, "wordIndex":k}; 
                        }
                    }
                }
            }
            else if ( right >= block.r && block.t <= bottom && bottom <= block.b ) {
                lines = block.lines;
                for(var j = lines.length - 1; j >= 0; --j) {
                    line = lines[j];
                    if ( line.t <= bottom ) 
                        return {"blockIndex":i, "lineIndex":j, "wordIndex": line.s.length-1};
                }
            }
        }
        return null;//found nothing 
    },
    highlightAndCopy: function(blocks, startPosition, endPosition)
    {
        var i1 = startPosition.blockIndex;
        var j1 = startPosition.lineIndex;
        var k1 = startPosition.wordIndex;
        var i2 = endPosition.blockIndex;
        var j2 = endPosition.lineIndex;
        var k2 = endPosition.wordIndex;

        var block, lines, line;
        var p, q, l, r;
        var kk1, kk2;
        
        var text = "";
        for(var i = i1; i <= i2; ++i)
        {
            if (i != i1)
                text += "\n\n";

            block = blocks[i];
            lines = block.lines;
            for(var j = (i == i1? j1 : 0) ; 
                j < (i == i2? j2 + 1: lines.length); ++j)
            {
                if (j != (i ==i1? j1 : 0))
                    text += '\n';

                line = lines[j];i
                q = line.q;
                if (q.length < 2)
                    continue;
                kk1 = (i == i1 && j == j1? k1 : 0);
                kk2 = (i == i2 && j == j2? k2 : q.length / 2 - 1);
                l = q[2 * kk1];
                p = 2 * kk2;
                r = q[p] + q[p + 1];
                textSelector.highlightArea({"l":l, "r":r, "t":line.t, "b":line.b});
                for(var k = kk1; k <= kk2; ++k) {
                    if (k != kk1)
                        text += " ";
                    text += line.s[k];
                }
            }
        }
        textSelector.selectedText = text;
    },
    isBlockSelected: function(block, left, top, right, bottom) {
        var resizedTop = ( 2 * block.t + block.b ) / 3;
        var resizedBottom = ( block.t + 2 * block.b ) / 3;
        if ( ( (left < block.l && block.l < right ) ||
               (left < block.r && block.r < right ) ) &&
             ( (top < resizedTop && resizedTop < bottom ) ||
               (top < resizedBottom && resizedBottom < bottom) ) )
             return true;
        return false;
    }
};

/**
 * Reader
 **/
var reader = {
    zoomMin: 0.5,
    zoomMax: 2.0,
	zoomFactor: undefined,
	zoomMode: 'normal',	// 3 possible values: normal, fit-width, fit-height
    currentPage: 1, // start from page 1 by default
	totalWidth: undefined,
    // To animate the scrollbar of the browser, we have to deal with different browsers
    scrollOwner: $.browser.msie || $.browser.mozilla || $.browser.opera ? "html" : "body",
    ctrlPressed: false,
    shiftPressed: false,
    init: function(data) {
        $.extend(reader, data);
        topbar.init({
            "numPages": data.pages.length, 
            "currentPage": reader.currentPage,
            "onCellClick": function(pageId) {
                reader.goToPage(pageId);
            }
        });
        reader.initPages();
        reader.initTextSelector();;
        reader.initEventHandlers();
        reader.zoom(1.0);
    },
    initPages: function() {
        var pages = reader.pages;
        var l = pages.length;
        for (var i = 0; i < l; ++i) {
            var index  = '';
            if(i+1<10){
                index += "0"+(i+1);
            }
            else index += i+1;
            var $li = $('<li pageId='+(i+1)+'><img class="page-image unselectable" unselectable="on" src="/uploads/'+docid+'/page-'+index+'.png"/></li>');
            $li.appendTo($("#page-container"));
            $("img", $li).mousedown(reader.disableDragging);
        }
    },
    initTextSelector: function() {
        textSelector.init();

        $("#viewport").mousedown(function(e) {
            $(".selected-area").remove();
            var localOriginPos = textSelector.localPos($(this), e.pageX, e.pageY) ;
            $("#viewport").mousemove(localOriginPos, function(e) {
                var localNowPos = localPos($(this), e.pageX, e.pageY) ;
                var localOriginPos = e.data ;
                var blocks = reader.pages[reader.currentPage-1].blocks;
                textSelector.selectText(blocks, localOriginPos.x, localOriginPos.y, localNowPos.x, localNowPos.y) ;
            }) ;
        }).mouseup(function(e) {
            $(this).css("cursor", "text");
            $(this).unbind("mousemove");
            textSelector.confirmSelection();
        }).dblclick(function(e) {// double click to select a word
            var localNowPos = textSelector.localPos($(this), e.pageX, e.pageY);
            var x = localNowPos.x;
            var y = localNowPos.y;
            var blocks = reader.pages[reader.currentPage-1].blocks;
            textSelector.selectWord(blocks, x, y );
        }) ;
    },
    initEventHandlers: function() {
        reader.initKeyboardEventHandler();
        $('#next-page').click(reader.nextPage);
        $('#pre-page').click(reader.prePage);
    },
    zoom: function(factor) {
        if (factor > reader.zoomMax)
            factor = reader.zoomMax;
        else if (factor < reader.zoomMin)
            factor = reader.zoomMin;
        reader.zoomFactor = factor;
        var pages = reader.pages;
        // zoom viewport
        $("#viewport").width(factor * pages[0].pageWidth);
        $("#viewport").height(factor * pages[0].pageHeight);
        // zoom page-container
        var l = pages.length;
        var totalWidth = 0;
        for (var i = 0; i < l; ++i)  
            totalWidth += pages[i].pageWidth;
        totalWidth += pages[l-1].pageWidth;
        $("#page-container").width(factor * totalWidth);
        // zoom images
        $("#page-container li").each(function() {
            var i = $(this).attr("pageId");
            $(this).width(factor * pages[i-1].pageWidth);
            $(this).height(factor * pages[i-1].pageHeight);
        });
        // adjust offset
        var offset = reader.calPageOffset();
        $("#page-container").css("marginLeft", offset);
       },
    disableDragging: function(e) {
        if(e.preventDefault) e.preventDefault(); 
    },
    calPageOffset: function() {
        return - reader.zoomFactor * (reader.currentPage-1) * reader.pages[0].pageWidth;
    },
    goToPage: function(pageNum) {
        if (reader.currentPage != pageNum)
            $(".temp-area").remove();
        reader.currentPage = pageNum;
        $("#page-container").css("marginLeft", reader.calPageOffset());
        topbar.goToPage(pageNum);
    },
    nextPage: function() {
        if( reader.currentPage  == reader.pages.length )	// no next page
            return ;
        reader.currentPage ++;
        var offset = reader.calPageOffset();
        $(".temp-area").remove();
        $("#page-container").stop().animate({"marginLeft": offset});
        reader.scrollTo(0);
        topbar.nextPage();
    },
    prePage: function() {
        if( reader.currentPage  == 1 )	{// no pre page
            return ;
        }
        reader.currentPage --;
        $(".temp-area").remove();
        var offset = reader.calPageOffset();
        reader.scrollTo(0);
        $("#page-container").stop().animate({"marginLeft": offset});
        topbar.prePage();
    },
    scroll: function(offset) {
        var offsetStr;
        if(offset > 0)
            offsetStr = "+=" + offset + "px";
        else
            offsetStr = "-=" + (-offset) + "px";
        $(reader.scrollOwner).stop().animate({"scrollTop": offsetStr});
    },
    scrollTo: function(yPos) {
        $(reader.scrollOwner).stop().animate({"scrollTop": yPos+"px"});
    },
    initKeyboardEventHandler: function() {
        $(document).keydown(function(e) {
            var ctrlKey = 17, shiftKey = 16,cKey = 67, pgUpKey = 33, pgDnKey = 34;
            var ltKey = 37, rtKey = 39, upKey = 38, dnKey = 40;
            if(e.keyCode == pgUpKey) {
                if($(window).scrollTop() > 0) {
                    var h = $(window).height();
                    reader.scroll(-h);
                }
                else {// already at the top
                    reader.prePage();
                }
                e.preventDefault();
            }
            else if(e.keyCode == pgDnKey) {
                var h = $(window).height();
                if ($(window).scrollTop() + h < $("#viewport").height()) {
                    reader.scroll(h);
                }
                else {// already at the bottom
                   reader.nextPage();
                }
                e.preventDefault();
            }
            else if(e.keyCode == ltKey) {
                if ($("#viewport").width() < $(window).width()) {
                    reader.prePage();
                    e.preventDefault();
                }
            }
            else if(e.keyCode == rtKey) {
                if ($("#viewport").width() < $(window).width()) {
                    reader.nextPage();
                    e.preventDefault();
                }
            }
            else if(e.keyCode == upKey) {
                $(window).scrollTop($(window).scrollTop()-12);
                e.preventDefault();
            }
            else if(e.keyCode == dnKey) {
                $(window).scrollTop($(window).scrollTop()+12);
                e.preventDefault();
            }
            else if(e.keyCode == ctrlKey) {
                reader.ctrlPressed = true;
            }
            else if(e.keyCode == shiftKey) {
                reader.shiftPressed = true;
            }
        }).keyup(function(e) {
            var ctrlKey = 17, shiftKey = 16;
            if(e.keyCode == ctrlKey) {
                reader.ctrlPressed = false;
            }
            else if(e.keyCode == shiftKey) {
                reader.shiftPressed = false;
            }
        }) ;
    }
} ;
/**
 * Helper functions
 * */
function localPos($container, pageX, pageY) {
	var originPageX = $container.offset().left ;
	var originPageY = $container.offset().top ;
	return {x: pageX - originPageX, y: pageY - originPageY} ;
}

function selectWord(blocks, x, y) {
    var position = findWord(blocks, x, y);
    if (!position)
        return;

    var i = position.blockIndex, j = position.lineIndex, k = position.wordIndex;
    var block = blocks[i];
    var line = block.lines[j];
    var q = line.q;
    var l = q[2*k], r = l + q[2*k+1];

    highlightArea({"l":l, "r":r, "t":line.t, "b":line.b});

    reader.selectedText = line.s[k]; 
}

function isPointInRect(x, y, rect) {
    return rect.l <= x && x <= rect.r && 
        rect.t < y && y <= rect.b;
}

function findWord(blocks, x, y) {
    var block;
    var line, lines;
    var l, r;
    var q;
    for(var i = 0; i < blocks.length; ++i) {
        block = blocks[i];
        if ( isPointInRect(x, y, block) ) {
            lines = block.lines;
            for(var j = 0; j < lines.length; ++j) {
                line = lines[j];
                if ( isPointInRect(x, y, line) ) {
                    q = line.q;
                    for(var k = 0; k < q.length/2; ++k) {
                        l = q[2*k]; r = l + q[2*k+1];
                        if ( l <= x && x <= r ) {
                            return {"blockIndex":i, "lineIndex":j, "wordIndex":k}; 
                        }
                    }
                }
            }
            return null;//found nothing
        }
    }
    return null;//found nothing 
}

function highlightAndCopy(blocks, startPosition, endPosition)
{
    var i1 = startPosition.blockIndex;
    var j1 = startPosition.lineIndex;
    var k1 = startPosition.wordIndex;
    var i2 = endPosition.blockIndex;
    var j2 = endPosition.lineIndex;
    var k2 = endPosition.wordIndex;

    var block, lines, line;
    var p, q, l, r;
    var kk1, kk2;
    
    var text = "";
    for(var i = i1; i <= i2; ++i)
    {
        if (i != i1)
            text += "\n\n";

        block = blocks[i];
        lines = block.lines;
        for(var j = (i == i1? j1 : 0) ; 
            j < (i == i2? j2 + 1: lines.length); ++j)
        {
            if (j != (i ==i1? j1 : 0))
                text += '\n';

            line = lines[j];i
            q = line.q;
            if (q.length < 2)
                continue;
            kk1 = (i == i1 && j == j1? k1 : 0);
            kk2 = (i == i2 && j == j2? k2 : q.length / 2 - 1);
            l = q[2 * kk1];
            p = 2 * kk2;
            r = q[p] + q[p + 1];
            highlightArea({"l":l, "r":r, "t":line.t, "b":line.b});
            for(var k = kk1; k <= kk2; ++k) {
                if (k != kk1)
                    text += " ";
                text += line.s[k];
            }
        }
    }
    reader.selectedText = text;
}

function selectText(blocks, startX, startY, endX, endY, operationOnSelectedText) {
    var d = reader.selectingPrecision ; 
    var f = reader.zoomFactor;
    // tranform the coordinates according to zoomFactor
    var left = ( ( startX < endX ? startX : endX )  )/  f ;
    var top = ( ( startY < endY ? startY : endY ) ) / f ;
    var right = ( ( startX > endX ? startX : endX ) ) / f ;
    var bottom = ( ( startY > endY ? startY : endY ) )/ f ;

    startPosition = findWordRightAfter(blocks, left, top);
    endPosition = findWordRightBefore(blocks, right, bottom);

    if (startPosition == null || endPosition == null)
        return;

    highlightAndCopy(blocks, startPosition, endPosition);
}

function findWordRightAfter(blocks, left, top)
{
    var block;
    var line, lines;
    var l, r;
    var q;
    for(var i = 0; i < blocks.length; ++i) {
        block = blocks[i];
        if ( left <= block.l && top <= block.t )
            return {"blockIndex": i, "lineIndex": 0, "wordIndex": 0};
        else if ( isPointInRect(left, top, block) ) {
            lines = block.lines;
            for(var j = 0; j < lines.length; ++j) {
                line = lines[j];
                if ( left <= line.l && top <= line.b )
                    return {"blockIndex":i, "lineIndex":j, "wordIndex": 0};
                else if ( isPointInRect(left, top, line) ) {
                    q = line.q;
                    for(var k = 0; k < q.length/2; ++k) {
                        l = q[2*k]; r = l + q[2*k+1];
                        if ( left <= r )
                            return {"blockIndex":i, "lineIndex":j, "wordIndex":k}; 
                    }
                }
            }
        }
        else if ( left <= block.l && block.t <= top && top <= block.b) {
            lines = block.lines;
            for(var j = 0; j < lines.length; ++j) {
                line = lines[j];
                if ( top <= line.b )
                    return {"blockIndex":i, "lineIndex":j, "wordIndex": 0};
            }
        }
    }
    return null;//found nothing 
}

function findWordRightBefore(blocks, right, bottom)
{
    var block;
    var line, lines;
    var l, r;
    var q;
    for(var i = blocks.length - 1; i >= 0; --i) {
        block = blocks[i];
        if ( right >= block.r && bottom >= block.b ) {
            l = block.lines.length - 1;
            line = block.lines[l];
            return {"blockIndex": i, 
                    "lineIndex": l, 
                    "wordIndex": line.s.length - 1};
        }
        else if ( isPointInRect(right, bottom, block) ) {
            lines = block.lines;
            for(var j = lines.length - 1; j >= 0; --j) {
                line = lines[j];
                if ( right >= line.r && bottom >= line.t ) {
                    return {"blockIndex":i, "lineIndex":j, "wordIndex": line.s.length-1};
                }
                else if ( isPointInRect(right, bottom, line) ) {
                    q = line.q;
                    for(var k = q.length/2 -1; k >= 0; --k) {
                        l = q[2*k]; r = l + q[2*k+1];
                        if ( right >= l )
                            return {"blockIndex":i, "lineIndex":j, "wordIndex":k}; 
                    }
                }
            }
        }
        else if ( right >= block.r && block.t <= bottom && bottom <= block.b ) {
            lines = block.lines;
            for(var j = lines.length - 1; j >= 0; --j) {
                line = lines[j];
                if ( line.t <= bottom ) 
                    return {"blockIndex":i, "lineIndex":j, "wordIndex": line.s.length-1};
            }
        }
    }
    return null;//found nothing 
}

function isBlockSelected(block, left, top, right, bottom) {
    var resizedTop = ( 2 * block.t + block.b ) / 3;
    var resizedBottom = ( block.t + 2 * block.b ) / 3;
    if ( ( (left < block.l && block.l < right ) ||
           (left < block.r && block.r < right ) ) &&
         ( (top < resizedTop && resizedTop < bottom ) ||
           (top < resizedBottom && resizedBottom < bottom) ) )
         return true;
    return false;
}
