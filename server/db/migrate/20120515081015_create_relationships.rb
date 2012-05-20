class CreateRelationships < ActiveRecord::Migration
  def change
    create_table :relationships do |t|
      t.integer :user1_id
      t.integer :user2_id

      t.timestamps
    end
    add_index :relationships, :user1_id
    add_index :relationships, :user2_id
    add_index :relationships, [:user1_id, :user2_id], unique: true
  end
end
