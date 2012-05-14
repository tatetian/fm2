class CreateHighlights < ActiveRecord::Migration
  def change
    create_table :highlights do |t|
      t.integer :user_id
      t.integer :paper_id
      t.integer :pagenum
      t.string :posfrom
      t.string :posto

      t.timestamps
    end
  end
end
