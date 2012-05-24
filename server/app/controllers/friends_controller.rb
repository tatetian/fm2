class FriendsController < ApplicationController
      def index
          if params.has_key?(:paper_id)
              paper_id = params[:paper_id]
              paper = Paper.find_by_id(paper_id)
              result = current_user.friends.find_all{ |f|
                          f.has_paper? paper
                      }
             render :json => result
          else
            render :json => current_user.friends
          end
      end
end
