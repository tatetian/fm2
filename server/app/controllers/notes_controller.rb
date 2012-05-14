class NotesController < ApplicationController
    def index
        docid = params[:docid]
        p = Paper.find_by_docid(docid)
        if params.has_key?(:user_id)
            user_id = params[:user_id]
            result = p.getNotes :user_id=>user_id
        else
            result = p.getNotes
    end
end
