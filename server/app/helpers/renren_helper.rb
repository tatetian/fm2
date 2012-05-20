module RenrenHelper
  def current_user
    @current_user ||= User.first #user_from_remember_token
  end
  def current_user?(user)
    user == user_from_remember_token
  end
  def sign_in(user)
    cookies[:remember_token] = {:value=>user.remember_token, :expires=>session[:renren_expires_in]}
    end
  def signed_in?
    !user_from_remember_token.nil?
  end
  def sign_out
    cookies.delete(:remember_token)
  end

  private

    def user_from_remember_token
      remember_token = cookies[:remember_token]
      User.find_by_remember_token(remember_token) unless remember_token.nil?
    end
end
