class HighlightsController < ApplicationController
    def index
        paper_id = params[:paper_id]
        p = Paper.find_by_id(paper_id)
        if params.has_key?(:user_id)
            user_id = params[:user_id]
            if (current_user.is_friend?(user_id) || current_user.id==user_id.to_i)
                result = p.getHighlights :user_id=>user_id
            else
                render :json => {"error"=>"not your friend"}
                return
            end
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
        highlight = params[:highlight]
        highlight[:user_id] = current_user.id
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
        if highlight != nil && highlight.user_id == current_user.id
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
