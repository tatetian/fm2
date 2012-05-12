class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :uid
      t.string :name
      t.string :email
      t.string :headurl
      t.string :remember_token

      t.timestamps
    end
  end
end
