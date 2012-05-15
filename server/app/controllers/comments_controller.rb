class CommentsController < ApplicationController
      def index
        comment = Comment.find_by_paper_id(params[:paper_id])
        if comment != nil
            render :json => comment
        else
            render :json => {}
        end
      end
      def create
          comment = Comment.new(params[:comment])
          if comment.save
            render :json => comment
          else
            render :json => {}
          end
      end
      def show
          paper_id = params[:paper_id]
          p = Paper.find_by_id(paper_id)
          comment_id = params[:id]
          comment = p.comments.find_by_id(comment_id)
          if comment != nil
              render :json => comment
          else
              render :json => {}
          end
      end
      def update
        u = current_user       
        comment_id = params[:id]
        comment = u.comments.find_by_id(comment_id)
        if comment!=nil
            result = comment.update_attributes(params[:comment])
            render :json => result
        else
          render :json => {}
        end
      end
      def destroy
        u = current_user
        comment_id = params[:id]
        comment = u.comments.find_by_id(comment_id)
        if comment!=nil
            result = comment.delete 
            if comment.destroyed?
              render :json => result
            else
              render :json => {}
            end
        else
          render :json => {}
        end
      end
end
