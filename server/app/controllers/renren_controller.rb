# encoding: UTF-8
class RenrenController < ApplicationController
    #require 'OAuth2'
    #require 'json'
    #require 'net/http'
    #https://graph.renren.com/oauth/authorize?client_id=73eadd1f183144cfaef24c6a8513a857&response_type=code&redirect_uri=http://localhost:3000/renren/login&display=page
    def client
        OAuth2::Client.new(api_key,api_secret, :site=>{:url=>'https://graph.renren.com',:response_type=>'code'}, :access_token_url=>'https://graph.renren.com/oauth/token')
    end
    def login
        access_token =  client.get_token({
            :client_id => api_key,
            :client_secret => api_secret,
            :redirect_uri => "http://www.feastmind.com/renren/login",
            :code => params[:code],
            :grant_type=> "authorization_code"
        })
        #puts "access_token:"+access_token.token+"///"
        session[:renren_access_token]=access_token.token
        geturi=URI.parse(URI.encode("http://graph.renren.com/renren_api/session_key?oauth_token=#{session[:renren_access_token]}"))         
             
        res=JSON Net::HTTP.get(geturi)
                  
        session[:renren_expires_in]=Time.now+res["renren_token"]["expires_in"].to_i
        
        #puts res["renren_token"]["expires_in"]
             
        session[:renren_refresh_token]=res["renren_token"]["refresh_token"]
             
        renren_user
        
        user = User.find_by_uid(@ru[0]["uid"].to_s)
        if user==nil
            user = User.create(:uid=>@ru[0]["uid"].to_s,:name=>@ru[0]["name"],:remember_token=>access_token.token,:headurl=>@ru[0]["tinyurl"])
            Tag.create :name => "__all", :user_id =>  user.id
        else
            user.remember_token=access_token.token
            user.save
        end
        
        sign_in user
         
        add_friends user        

        redirect_to "/home"         
             
    end
    def token_validate
        if Time.now.to_i > session[:renren_expires_in]
            redirect_to "/login"
        end
    end         
    def renren_user
        str=""
        str<<"access_token=#{session[:renren_access_token]}"
        str<<"format=JSON"
        str<<"method=users.getInfo"
        str<<"v=1.0"
        str<<"#{api_secret}"
        sig = Digest::MD5.hexdigest(str)
        query = {
                  :format=>'JSON',
                  :method=>'users.getInfo',
                  :access_token=>session[:renren_access_token],
                  :v=>'1.0',
                  :sig=>sig
                 }
        @ru = JSON Net::HTTP.post_form(URI.parse(URI.encode("http://api.renren.com/restserver.do")),query).body
        #@ru = @ru[0]
        #@ru = ActiveSupport::JSON.decode @ru
    end

    def add_friends(user)
        str=""
        str<<"access_token=#{session[:renren_access_token]}"
        str<<"format=JSON"
        str<<"method=friends.get"
        str<<"v=1.0"
        str<<"#{api_secret}"
        sig = Digest::MD5.hexdigest(str)
        query = {
                  :format=>'JSON',
                  :method=>'friends.get',
                  :access_token=>session[:renren_access_token],
                  :v=>'1.0',
                  :sig=>sig
                 }
        fuids = JSON Net::HTTP.post_form(URI.parse(URI.encode("http://api.renren.com/restserver.do")),query).body
        #puts fuids
        fuids.each do |f| 
            friend = User.find_by_uid(f)
            if friend!=nil and user.is_friend?(friend) == nil
                user.add_friend! friend
                Log.create(:user_id=>friend.id,:from_id=>user.id,:content=>"您的人人网好友 "+user.name+" 也来到了FeastMind")
            end
        end
    end
    
    def api_key
        "73eadd1f183144cfaef24c6a8513a857"
    end
    def api_secret
        "8f51301e3ea04562ac855a832126c7c6"
    end
    def logout
        sign_out
        redirect_to ""
    end
end
