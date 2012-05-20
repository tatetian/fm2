class CreateLogs < ActiveRecord::Migration
  def change
    create_table :logs do |t|
      t.integer :user_id
      t.integer :from_id
      t.text :content

      t.timestamps
    end
  end
end
