class HighlightsController < ApplicationController
    def index
        paper_id = params[:paper_id]
        p = Paper.find_by_id(paper_id)
        if params.has_key?(:user_id)
            user_id = params[:user_id]
            result = p.getHighlights :user_id=>user_id
        else
            u = current_user
            result = p.getHighlights :user_id=>u.id
        end
        if result != nil
          render :json => result
        else
          render :json => {}
        end
    end
    def create
        highlight = Highlight.new(params[:highlight])
        if highlight.save
          render :json => highlight
        else
          render :json => {}
        end
    end
    def show
        paper_id = params[:paper_id]
        p = Paper.find_by_id(paper_id)
        
        highlight_id = params[:id]
        highlight = p.highlights.find_by_id(highlight_id)
        if highlight != nil
            render :json => highlight
        else
            render :json => {}
        end
    end
    def update
      u = current_user       
      highlight_id = params[:id]
      highlight = u.highlights.find_by_id(highlight_id)
      if highlight!=nil
          result = highlight.update_attributes(params[:highlight])
          render :json => result
      else
        render :json => {}
      end
    end
    def destroy
      u = current_user
      highlight_id = params[:id]
      highlight = u.highlights.find_by_id(highlight_id)
      if highlight!=nil
          result = highlight.delete 
          if highlight.destroyed?
            render :json => result
          else
            render :json => {}
          end
      else
        render :json => {}
      end
    end
end
