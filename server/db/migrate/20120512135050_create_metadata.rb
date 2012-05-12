class CreateMetadata < ActiveRecord::Migration
  def change
    create_table :metadata do |t|
      t.string :docid
      t.string :title
      t.string :authors
      t.string :publication
      t.date :date
      t.string :abstract
      t.int :paper_id

      t.timestamps
    end
  end
end
