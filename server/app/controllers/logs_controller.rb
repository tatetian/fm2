class LogsController < ApplicationController
    def index
        if params.has_key? (:start) and params.has_key? (:limit)
            result = current_user.logs.order("created_at desc").offset(params[:start]).limit(params[:limit]).map { |log| 
                      d = log.attributes
                      d[:headurl] = User.find_by_id(log.from_id).headurl 
                      d
            }
            render :json => result
        else
            result = current_user.logs.order("created_at desc").map { |log| 
                      d = log.attributes
                      d[:headurl] = User.find_by_id(log.from_id).headurl 
                      d
            }
            render :json => result
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
