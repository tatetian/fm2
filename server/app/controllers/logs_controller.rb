class LogsController < ApplicationController
    def index
        if params.has_key? (:start) and params.has_key? (:limit)
            render :json => current_user.logs.order("created_at desc").offset(params[:start]).limit(params[:limit])
        else
            render :json => current_user.logs.order("created_at desc")
        end
    end
    def show
        id = params[:id]
        u = current_user
        log = Log.find_by_id(id)
        if log.user_id == u.id
            render :json => log
        else 
            render :json => {}
        end
    end
end
