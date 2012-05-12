class AddIndexToUsersUidAndRememberToken < ActiveRecord::Migration
  def change
      add_index :users, :uid, unique: true
      add_index :users, :remember_token, unique: true
  end
end
