class CreateCollections < ActiveRecord::Migration
  def change
    create_table :collections do |t|
      t.integer :tag_id
      t.integer :metadata_id

      t.timestamps
    end
  end
end
