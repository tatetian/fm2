class HighlightsController < ApplicationController
    def index
        docid = params[:docid]
        p = Paper.find_by_docid(docid)
        u = User.first
        result = p.getHighlights :user_id=>u.id
    end
end
