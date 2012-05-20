class FriendsController < ApplicationController
      def index
          render :json => current_user.friends
      end
end
