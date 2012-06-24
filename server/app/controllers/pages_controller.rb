class PagesController < ApplicationController
  def index
      if signed_in?
          redirect_to "/home"
      end
  end
end
